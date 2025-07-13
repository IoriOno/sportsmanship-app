from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional

from app.database import get_db
from app.models.user import User
from app.models.test_result import TestResult
from app.dependencies import get_current_active_user
from app.schemas.coach import PlayerInfo, PlayerTestResult

router = APIRouter()


@router.get("/players", response_model=List[PlayerInfo])
def get_players(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """ヘッドコーチが所属選手一覧を取得"""
    
    # ヘッドコーチ権限チェック
    if not current_user.head_coach_function:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Head coach function required"
        )
    
    # 同じクラブに所属する選手を取得
    players = db.query(User).filter(
        User.club_id == current_user.club_id,
        User.role == "player",
        User.user_id != current_user.user_id
    ).all()
    
    # 各選手の最新テスト情報を取得
    player_info_list = []
    for player in players:
        # 最新のテスト結果を取得
        latest_test = db.query(TestResult).filter(
            TestResult.user_id == player.user_id
        ).order_by(TestResult.test_date.desc()).first()
        
        # テスト回数を取得
        test_count = db.query(TestResult).filter(
            TestResult.user_id == player.user_id
        ).count()
        
        player_info = PlayerInfo(
            user_id=str(player.user_id),
            name=player.name,
            email=player.email,
            role=player.role,
            latest_test_date=latest_test.test_date if latest_test else None,
            test_count=test_count
        )
        player_info_list.append(player_info)
    
    return player_info_list


@router.get("/players-for-comparison", response_model=List[dict])
def get_players_for_comparison(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """ヘッドコーチが比較用の選手一覧を取得"""
    
    # 認証チェック
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    
    # ヘッドコーチ権限チェック
    if not current_user.head_coach_function:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Head coach function required"
        )
    
    # 同じクラブに所属する選手を取得
    players = db.query(User).filter(
        User.club_id == current_user.club_id,
        User.role == "player",
        User.user_id != current_user.user_id
    ).all()
    
    # 各選手の最新テスト情報を取得
    player_info_list = []
    for player in players:
        # 最新のテスト結果を取得
        latest_test = db.query(TestResult).filter(
            TestResult.user_id == player.user_id
        ).order_by(TestResult.test_date.desc()).first()
        
        player_info_list.append({
            "user_id": str(player.user_id),
            "name": player.name,
            "email": player.email,
            "role": player.role,
            "latest_test_date": latest_test.test_date if latest_test else None,
            "has_test_result": latest_test is not None
        })
    
    return player_info_list


@router.get("/players/{player_id}/results", response_model=List[PlayerTestResult])
def get_player_test_results(
    player_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """ヘッドコーチが特定選手のテスト結果を取得"""
    
    # ヘッドコーチ権限チェック
    if not current_user.head_coach_function:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Head coach function required"
        )
    
    # 選手が同じクラブに所属しているかチェック
    player = db.query(User).filter(
        User.user_id == player_id,
        User.club_id == current_user.club_id,
        User.role == "player"
    ).first()
    
    if not player:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Player not found or not in the same club"
        )
    
    # 選手のテスト結果を取得
    test_results = db.query(TestResult).filter(
        TestResult.user_id == player_id
    ).order_by(TestResult.test_date.desc()).all()
    
    # 結果を変換
    result_list = []
    for result in test_results:
        # 自己肯定感合計を計算
        self_esteem_total = (
            result.self_determination +
            result.self_acceptance +
            result.self_worth +
            result.self_efficacy
        )
        
        # スポーツマンシップ合計を計算
        sportsmanship_total = (
            result.courage +
            result.resilience +
            result.cooperation +
            result.natural_acceptance +
            result.non_rationality
        )
        
        # strengthsとweaknessesをリストに変換（文字列の場合は空リストに）
        strengths_list = []
        weaknesses_list = []
        
        if result.strengths and isinstance(result.strengths, str):
            strengths_list = [result.strengths]
        elif result.strengths and isinstance(result.strengths, list):
            strengths_list = result.strengths
            
        if result.weaknesses and isinstance(result.weaknesses, str):
            weaknesses_list = [result.weaknesses]
        elif result.weaknesses and isinstance(result.weaknesses, list):
            weaknesses_list = result.weaknesses
        
        player_result = PlayerTestResult(
            result_id=str(result.result_id),
            user_id=str(result.user_id),
            test_date=result.test_date,
            player_name=player.name,
            
            # 自己肯定感関連
            self_determination=result.self_determination,
            self_acceptance=result.self_acceptance,
            self_worth=result.self_worth,
            self_efficacy=result.self_efficacy,
            
            # アスリートマインド
            introspection=result.introspection,
            self_control=result.self_control,
            devotion=result.devotion,
            intuition=result.intuition,
            sensitivity=result.sensitivity,
            steadiness=result.steadiness,
            comparison=result.comparison,
            result=result.result,
            assertion=result.assertion,
            commitment=result.commitment,
            
            # スポーツマンシップ
            courage=result.courage,
            resilience=result.resilience,
            cooperation=result.cooperation,
            natural_acceptance=result.natural_acceptance,
            non_rationality=result.non_rationality,
            
            # 分析結果
            self_esteem_total=self_esteem_total,
            athlete_type=result.athlete_type,
            strengths=strengths_list,
            weaknesses=weaknesses_list,
            sportsmanship_total=sportsmanship_total
        )
        result_list.append(player_result)
    
    return result_list 