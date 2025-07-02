# ファイル: backend/app/api/tests.py

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Response
from app.exceptions import (
    InternalError,
    ResourceNotFound,
    PermissionDenied,
    ValidationError
)
from app.schemas.error import ErrorDetail
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, asc
from uuid import UUID
import uuid
import logging
from datetime import datetime, timedelta
import csv
import io
from reportlab.lib.pagesizes import letter, A4
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader

from app.database import get_db
from app.models.test_result import TestResult
from app.models.user import User
from app.schemas.test import (
    TestSubmit, 
    TestResult as TestResultSchema,
    TestResultWithAnalysis,
    TestHistory
)
from app.dependencies import get_current_active_user, get_current_active_user_required
from app.services.test_service import TestService
from app.config import settings

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/submit", response_model=TestResultWithAnalysis)
def submit_test(
    test_data: TestSubmit,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_active_user)
):
    logger.info(f"Received test submission: {len(test_data.answers)} answers")
    logger.info(f"Test data user_id: {test_data.user_id if hasattr(test_data, 'user_id') else 'None'}")
    logger.info(f"Test data test_date: {test_data.test_date if hasattr(test_data, 'test_date') else 'None'}")
    logger.info(f"Current user: {current_user.user_id if current_user else 'None'}")
    
    try:
        # ユーザーIDの決定優先順位:
        # 1. 認証されたユーザー
        # 2. リクエストボディのuser_id
        # 3. 新規UUID生成
        if current_user:
            user_id = current_user.user_id
            target_selection = current_user.role
        elif hasattr(test_data, 'user_id') and test_data.user_id:
            # リクエストボディからuser_idを使用
            user_id = test_data.user_id
            # user_idからユーザー情報を取得してtarget_selectionを決定
            user = db.query(User).filter(User.user_id == user_id).first()
            if user:
                target_selection = user.role
            else:
                target_selection = "player"  # デフォルト
        else:
            # サンプルユーザーの場合
            user_id = uuid.uuid4()
            target_selection = "player"
            
        logger.info(f"Final User ID: {user_id}, Target selection: {target_selection}")
        
        test_service = TestService(db)
        # test_dataにtest_dateが含まれている
        result = test_service.process_test_submission(
            user_id, 
            test_data, 
            target_selection
        )
        logger.info(f"Test submission successful: {result.result_id}")
        return result
    except Exception as e:
        logger.error(f"Error in submit_test: {str(e)}")
        logger.error(f"Test data: {test_data}")
        raise InternalError(error=e)


@router.get("/history", response_model=TestHistory)
def get_test_history(
    limit: int = 10,
    offset: int = 0,
    sort_by: Optional[str] = "date",
    filter_period: Optional[str] = "all",
    athlete_types: Optional[str] = None,  # カンマ区切りの文字列
    score_min: Optional[int] = None,
    score_max: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user_required)
):
    """
    テスト履歴を取得（フィルタリング・ソート機能付き）
    
    Parameters:
    - limit: 取得件数
    - offset: オフセット
    - sort_by: ソート基準 ("date" または "score")
    - filter_period: 期間フィルター ("all", "1month", "3months", "6months")
    - athlete_types: アスリートタイプフィルター（カンマ区切り）
    - score_min: 最小スコア
    - score_max: 最大スコア
    """
    query = db.query(TestResult).filter(
        TestResult.user_id == current_user.user_id
    )
    
    # 期間フィルタリング
    if filter_period != "all":
        period_map = {
            "1month": 30,
            "3months": 90,
            "6months": 180
        }
        if filter_period in period_map:
            days = period_map[filter_period]
            cutoff_date = datetime.now() - timedelta(days=days)
            query = query.filter(TestResult.test_date >= cutoff_date)
    
    # アスリートタイプフィルタリング
    if athlete_types:
        types_list = [t.strip() for t in athlete_types.split(",")]
        query = query.filter(TestResult.athlete_type.in_(types_list))
    
    # スコア範囲フィルタリング
    if score_min is not None or score_max is not None:
        # 総合スコアを計算（SQLAlchemy式として）
        total_score = (
            TestResult.self_esteem_total +
            TestResult.courage +
            TestResult.resilience +
            TestResult.cooperation +
            TestResult.natural_acceptance +
            TestResult.non_rationality
        )
        
        if score_min is not None:
            query = query.filter(total_score >= score_min)
        if score_max is not None:
            query = query.filter(total_score <= score_max)
    
    # 総件数を取得（ページネーション前）
    total = query.count()
    
    # ソート
    if sort_by == "score":
        # スコアでソート（降順）
        query = query.order_by(
            desc(
                TestResult.self_esteem_total +
                TestResult.courage +
                TestResult.resilience +
                TestResult.cooperation +
                TestResult.natural_acceptance +
                TestResult.non_rationality
            )
        )
    else:
        # 日付でソート（降順）
        query = query.order_by(desc(TestResult.test_date))
    
    # ページネーション
    results = query.offset(offset).limit(limit).all()
    
    # TestServiceを使用して分析情報を追加
    test_service = TestService(db)
    results_with_analysis = []
    
    for result in results:
        try:
            analysis = test_service.analyze_test_result(result)
            results_with_analysis.append(analysis)
        except Exception as e:
            logger.error(f"Error analyzing result {result.result_id}: {str(e)}")
            # 分析に失敗した場合は基本情報のみ返す
            results_with_analysis.append(result)
    
    return {
        "results": results_with_analysis,
        "total_count": total
    }


@router.get("/export")
def export_test_history(
    format: str = "csv",
    filter_period: Optional[str] = "all",
    result_ids: Optional[str] = None,  # カンマ区切りのresult_id
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user_required)
):
    """
    テスト履歴をエクスポート
    
    Parameters:
    - format: エクスポート形式 ("csv" または "pdf")
    - filter_period: 期間フィルター
    - result_ids: 特定の結果のみエクスポート（カンマ区切り）
    """
    query = db.query(TestResult).filter(
        TestResult.user_id == current_user.user_id
    )
    
    # 特定の結果のみの場合
    if result_ids:
        ids_list = [UUID(id.strip()) for id in result_ids.split(",")]
        query = query.filter(TestResult.result_id.in_(ids_list))
    else:
        # 期間フィルタリング
        if filter_period != "all":
            period_map = {
                "1month": 30,
                "3months": 90,
                "6months": 180
            }
            if filter_period in period_map:
                days = period_map[filter_period]
                cutoff_date = datetime.now() - timedelta(days=days)
                query = query.filter(TestResult.test_date >= cutoff_date)
    
    results = query.order_by(desc(TestResult.test_date)).all()
    
    if not results:
        raise ResourceNotFound(resource_type="エクスポート用テスト結果")
    
    if format == "csv":
        return export_to_csv(results)
    elif format == "pdf":
        return export_to_pdf(results, current_user)
    else:
        raise ValidationError(details=[ErrorDetail(message="無効なエクスポート形式です。'csv'または'pdf'を使用してください", field="format")])


def export_to_csv(results: List[TestResult]) -> Response:
    """CSVエクスポート処理"""
    output = io.StringIO()
    writer = csv.writer(output)
    
    # ヘッダー
    headers = [
        "テスト日", "アスリートタイプ", "自己肯定感合計",
        "自己決定感", "自己受容感", "自己有用感", "自己効力感",
        "勇気", "復活力", "協調性", "自然体", "非合理性",
        "内省", "克己", "献身", "直感", "繊細", "堅実",
        "比較", "結果", "主張", "こだわり"
    ]
    writer.writerow(headers)
    
    # データ行
    for result in results:
        row = [
            result.test_date.strftime("%Y-%m-%d"),
            result.athlete_type or "",
            result.self_esteem_total,
            result.self_determination,
            result.self_acceptance,
            result.self_worth,
            result.self_efficacy,
            result.courage,
            result.resilience,
            result.cooperation,
            result.natural_acceptance,
            result.non_rationality,
            result.introspection,
            result.self_control,
            result.devotion,
            result.intuition,
            result.sensitivity,
            result.steadiness,
            result.comparison,
            result.result,
            result.assertion,
            result.commitment
        ]
        writer.writerow(row)
    
    # レスポンスの作成
    output.seek(0)
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=test_history_{datetime.now().strftime('%Y%m%d')}.csv"
        }
    )


def export_to_pdf(results: List[TestResult], user: User) -> Response:
    """PDFエクスポート処理"""
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import A4
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    
    buffer = io.BytesIO()
    
    # A4サイズでPDFを作成
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=1*inch)
    story = []
    styles = getSampleStyleSheet()
    
    # 日本語フォントの設定を試みる（フォントがない場合は英語で表示）
    try:
        # 一般的な日本語フォントのパスを試す
        font_paths = [
            "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
            "/System/Library/Fonts/ヒラギノ角ゴシック W3.ttc",
            "C:\\Windows\\Fonts\\msgothic.ttc"
        ]
        for font_path in font_paths:
            try:
                pdfmetrics.registerFont(TTFont('Japanese', font_path))
                styles.add(ParagraphStyle(name='JapaneseStyle', fontName='Japanese', fontSize=10))
                use_japanese = True
                break
            except:
                continue
        else:
            use_japanese = False
    except:
        use_japanese = False
    
    # タイトル
    title_style = styles['Title']
    if use_japanese:
        title = Paragraph("テスト履歴レポート", title_style)
    else:
        title = Paragraph("Test History Report", title_style)
    story.append(title)
    story.append(Spacer(1, 0.3*inch))
    
    # ユーザー情報
    info_style = styles['Normal']
    story.append(Paragraph(f"User: {user.email}", info_style))
    story.append(Paragraph(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}", info_style))
    story.append(Spacer(1, 0.3*inch))
    
    # サマリー情報
    if results:
        latest_result = results[0]
        oldest_result = results[-1]
        
        # 総合スコアの計算
        def calc_total_score(r):
            return r.self_esteem_total + r.courage + r.resilience + r.cooperation + r.natural_acceptance + r.non_rationality
        
        latest_score = calc_total_score(latest_result)
        oldest_score = calc_total_score(oldest_result)
        improvement = ((latest_score - oldest_score) / oldest_score * 100) if oldest_score > 0 else 0
        
        summary_data = [
            ["期間", f"{oldest_result.test_date.strftime('%Y-%m-%d')} ～ {latest_result.test_date.strftime('%Y-%m-%d')}"],
            ["テスト回数", f"{len(results)}回"],
            ["最新スコア", f"{latest_score}"],
            ["改善率", f"{improvement:+.1f}%"]
        ]
        
        summary_table = Table(summary_data, colWidths=[2*inch, 3*inch])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.beige),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        story.append(summary_table)
        story.append(Spacer(1, 0.5*inch))
    
    # 詳細データテーブル
    headers = ["日付", "タイプ", "自己肯定感", "勇気", "復活力", "協調性", "自然体", "非合理性", "総合"]
    
    data = [headers]
    for result in results[:20]:  # 最大20件
        total_score = calc_total_score(result)
        row = [
            result.test_date.strftime('%Y-%m-%d'),
            result.athlete_type[:10] if result.athlete_type else "N/A",
            str(result.self_esteem_total),
            str(result.courage),
            str(result.resilience),
            str(result.cooperation),
            str(result.natural_acceptance),
            str(result.non_rationality),
            str(total_score)
        ]
        data.append(row)
    
    # テーブルの作成
    col_widths = [1.2*inch, 1.2*inch, 0.8*inch, 0.6*inch, 0.6*inch, 0.6*inch, 0.6*inch, 0.6*inch, 0.8*inch]
    t = Table(data, colWidths=col_widths)
    
    # テーブルスタイル
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('FONTSIZE', (0, 1), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey])
    ]))
    
    story.append(t)
    
    # PDFを生成
    doc.build(story)
    
    buffer.seek(0)
    return Response(
        content=buffer.getvalue(),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=test_history_{datetime.now().strftime('%Y%m%d')}.pdf"
        }
    )


@router.get("/latest", response_model=TestResultWithAnalysis)
def get_latest_test(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user_required)
):
    latest_result = db.query(TestResult).filter(
        TestResult.user_id == current_user.user_id
    ).order_by(TestResult.test_date.desc()).first()
    
    if not latest_result:
        raise ResourceNotFound(resource_type="テスト結果")
    
    test_service = TestService(db)
    analysis = test_service.analyze_test_result(latest_result)
    
    return analysis


@router.get("/{result_id}", response_model=TestResultWithAnalysis)
def get_test_result(
    result_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user_required)
):
    result = db.query(TestResult).filter(
        TestResult.result_id == result_id
    ).first()
    
    if not result:
        raise ResourceNotFound(resource_type="テスト結果", resource_id=str(result_id))
    
    # Check permissions
    if str(result.user_id) != str(current_user.user_id) and not current_user.head_coach_function:
        raise PermissionDenied(details=[ErrorDetail(message="このテスト結果を閲覧する権限がありません")])
    
    test_service = TestService(db)
    analysis = test_service.analyze_test_result(result)
    
    return analysis


@router.get("/user/{user_id}/history", response_model=TestHistory)
def get_user_test_history(
    user_id: UUID,
    limit: int = 10,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user_required)
):
    # Check permissions - only head coach or the user themselves
    if str(user_id) != str(current_user.user_id) and not current_user.head_coach_function:
        raise PermissionDenied(details=[ErrorDetail(message="このユーザーのテスト履歴を閲覧する権限がありません")])
    
    results = db.query(TestResult).filter(
        TestResult.user_id == user_id
    ).order_by(TestResult.test_date.desc()).offset(offset).limit(limit).all()
    
    total = db.query(TestResult).filter(
        TestResult.user_id == user_id
    ).count()
    
    return {
        "results": results,
        "total_count": total
    }