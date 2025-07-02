# ファイル: backend/app/api/test_interface.py

from fastapi import APIRouter, Request, Depends, HTTPException, status
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from typing import Dict, Any
from pydantic import BaseModel
from uuid import UUID
import uuid

from app.database import get_db
from app.models.question import Question
from app.models.test_result import TestResult
from app.models.user import User
from app.schemas.question import TargetType
from app.utils.athlete_type_algorithm import analyze_athlete_type

router = APIRouter()
templates = Jinja2Templates(directory="backend/templates")


class TestSubmission(BaseModel):
    target_selection: str
    answers: Dict[str, int]


@router.get("/", response_class=HTMLResponse)
def target_selection(request: Request):
    """対象選択画面"""
    return templates.TemplateResponse("enhanced_target_selection.html", {"request": request})

@router.get("/enhanced", response_class=HTMLResponse)
def enhanced_target_selection(request: Request):
    """強化版対象選択画面"""
    return templates.TemplateResponse("enhanced_target_selection.html", {"request": request})


@router.get("/test/{target}", response_class=HTMLResponse)
def test_interface(
    request: Request, 
    target: TargetType,
    db: Session = Depends(get_db)
):
    """テストインターフェース画面"""
    target_names = {
        TargetType.PLAYER: "選手",
        TargetType.COACH: "指導者", 
        TargetType.MOTHER: "母親",
        TargetType.FATHER: "父親",
        TargetType.ADULT: "大人・一般"
    }
    
    return templates.TemplateResponse("enhanced_test_interface.html", {
        "request": request,
        "target": target.value,
        "target_name": target_names.get(target, target.value)
    })

@router.get("/test/{target}/enhanced", response_class=HTMLResponse)
def enhanced_test_interface(
    request: Request, 
    target: TargetType,
    db: Session = Depends(get_db)
):
    """強化版テストインターフェース画面"""
    target_names = {
        TargetType.PLAYER: "選手",
        TargetType.COACH: "指導者", 
        TargetType.MOTHER: "母親",
        TargetType.FATHER: "父親",
        TargetType.ADULT: "大人・一般"
    }
    
    return templates.TemplateResponse("enhanced_test_interface.html", {
        "request": request,
        "target": target.value,
        "target_name": target_names.get(target, target.value)
    })


@router.post("/test/submit")
async def submit_test(
    test_data: TestSubmission,
    db: Session = Depends(get_db)
):
    """テスト結果提出"""
    try:
        target_selection = test_data.target_selection
        answers = test_data.answers
        
        if not target_selection or not answers:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Target selection and answers are required"
            )
        
        # 質問データを取得してスコア計算
        questions = db.query(Question).filter(
            (Question.target == TargetType.ALL) | 
            (Question.target == target_selection)
        ).all()
        
        # スコア計算
        result_data = calculate_scores(questions, answers, target_selection)
        
        # アスリートタイプ情報を分離
        athlete_type_result = result_data.pop('athlete_type', None)
        scores = result_data
        
        # テスト結果を保存
        test_result = TestResult(
            result_id=uuid.uuid4(),
            user_id=None,  # 匿名ユーザー
            target_selection=target_selection,
            **scores
        )
        
        db.add(test_result)
        db.commit()
        db.refresh(test_result)
        
        return {
            "result_id": test_result.result_id, 
            "scores": scores,
            "athlete_type": athlete_type_result
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Test submission failed: {str(e)}"
        )


def calculate_scores(questions, answers, target_selection=None):
    """スコア計算ロジック（アスリートタイプ分析付き）"""
    scores = {
        # 自己肯定感関連
        "self_determination": 0,
        "self_acceptance": 0, 
        "self_worth": 0,
        "self_efficacy": 0,
        
        # アスリートマインド
        "introspection": 0,
        "self_control": 0,
        "devotion": 0,
        "intuition": 0,
        "sensitivity": 0,
        "steadiness": 0,
        "comparison": 0,
        "result": 0,
        "assertion": 0,
        "commitment": 0,
        
        # スポーツマンシップ
        "courage": 0,
        "resilience": 0,
        "cooperation": 0,
        "natural_acceptance": 0,
        "non_rationality": 0
    }
    
    # カテゴリ別スコア計算
    category_mapping = {
        # スポーツマンシップのサブカテゴリ
        "courage": "courage",
        "resilience": "resilience", 
        "cooperation": "cooperation",
        "natural_acceptance": "natural_acceptance",
        "non_rationality": "non_rationality",
        
        # アスリートマインドのサブカテゴリ
        "commitment": "commitment",
        "results_oriented": "result", 
        "steady": "steadiness",
        "devoted": "devotion",
        "self_control": "self_control",
        "assertive": "assertion",
        "sensitive": "sensitivity",
        "intuitive": "intuition",
        "introspective": "introspection",
        "comparative": "comparison",
        
        # 自己肯定感のサブカテゴリ
        "self_determination": "self_determination",
        "self_acceptance": "self_acceptance",
        "self_worth": "self_worth",
        "self_efficacy": "self_efficacy"
    }
    
    # 質問ごとにスコア計算
    for question in questions:
        question_id = str(question.question_id)
        if question_id in answers:
            raw_score = answers[question_id]
            
            # 逆転スコア処理
            if question.is_reverse_score:
                final_score = 10 - raw_score
            else:
                final_score = raw_score
            
            # サブカテゴリに対応するスコアフィールドに加算
            subcategory = question.subcategory
            if subcategory in category_mapping:
                score_field = category_mapping[subcategory]
                scores[score_field] += final_score
    
    # アスリートタイプ分析
    athlete_type_result = None
    if target_selection:
        # アスリートマインドスコアを抽出（正しいキー名にマッピング）
        athlete_mind_scores = {
            'commitment': scores['commitment'],
            'results_oriented': scores['result_focus'],
            'steady': scores['steadiness'],
            'devoted': scores['dedication'],
            'self_control': scores['self_control'],
            'assertive': scores['assertion'],
            'sensitive': scores['sensitivity'],
            'intuitive': scores['intuition'],
            'introspective': scores['introspection'],
            'comparative': scores['comparison']
        }
        
        # アスリートマインドスコアが存在する場合のみ分析実行
        if any(score > 0 for score in athlete_mind_scores.values()):
            try:
                athlete_type_result = analyze_athlete_type(athlete_mind_scores, target_selection)
            except Exception as e:
                print(f"アスリートタイプ分析エラー: {e}")
                athlete_type_result = None
    
    return {
        **scores,
        "athlete_type": athlete_type_result
    }


@router.get("/results/{result_id}", response_class=HTMLResponse)
def test_results(
    request: Request,
    result_id: UUID,
    db: Session = Depends(get_db)
):
    """テスト結果表示画面"""
    test_result = db.query(TestResult).filter(
        TestResult.result_id == result_id
    ).first()
    
    if not test_result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test result not found"
        )
    
    # 結果画面用のデータを準備
    target_names = {
        "player": "選手",
        "coach": "指導者",
        "mother": "母親", 
        "father": "父親",
        "adult": "大人・一般"
    }
    
    return templates.TemplateResponse("enhanced_test_results.html", {
        "request": request,
        "result": test_result,
        "target_name": target_names.get(test_result.target_selection, test_result.target_selection)
    })


@router.get("/admin", response_class=HTMLResponse)
def admin_dashboard(request: Request):
    """管理者ダッシュボード"""
    return templates.TemplateResponse("admin_dashboard.html", {"request": request})

@router.get("/results/{result_id}/enhanced", response_class=HTMLResponse)
def enhanced_test_results(
    request: Request,
    result_id: UUID,
    db: Session = Depends(get_db)
):
    """強化版テスト結果表示画面"""
    test_result = db.query(TestResult).filter(
        TestResult.result_id == result_id
    ).first()
    
    if not test_result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test result not found"
        )
    
    # 結果画面用のデータを準備
    target_names = {
        "player": "選手",
        "coach": "指導者",
        "mother": "母親", 
        "father": "父親",
        "adult": "大人・一般"
    }
    
    return templates.TemplateResponse("enhanced_test_results.html", {
        "request": request,
        "result": test_result,
        "target_name": target_names.get(test_result.target_selection, test_result.target_selection)
    })


@router.get("/admin", response_class=HTMLResponse)
def admin_dashboard_main(request: Request):
    """管理者ダッシュボード"""
    return templates.TemplateResponse("admin_dashboard.html", {"request": request})