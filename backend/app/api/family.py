from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from pydantic import BaseModel

from app.database import get_db
from app.models.user import User
from app.models.test_result import TestResult
from app.models.family_relation import FamilyRelation
from app.dependencies import get_current_active_user, get_head_parent_user
from app.schemas.coach import FamilyMemberInfo, FamilyMemberTestResult

router = APIRouter()


class AddFamilyRequest(BaseModel):
    email: str


@router.get("/search-user", response_model=dict)
def search_user_by_email(
    email: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """メールアドレスでユーザーを検索"""
    
    # 認証チェック
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    
    # ヘッド親権限チェック
    if not current_user.head_parent_function:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Head parent function required"
        )
    
    # メールアドレスでユーザーを検索
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # 自分自身は追加できない
    if user.user_id == current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot add yourself to family"
        )
    
    # 既に家族関係が存在するかチェック
    existing_relation = db.query(FamilyRelation).filter(
        (FamilyRelation.parent_id == current_user.user_id) & (FamilyRelation.child_id == user.user_id) |
        (FamilyRelation.parent_id == user.user_id) & (FamilyRelation.child_id == current_user.user_id)
    ).first()
    
    if existing_relation:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Family relation already exists"
        )
    
    return {
        "user_id": str(user.user_id),
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "age": user.age
    }


@router.post("/add", response_model=dict)
def add_family_member(
    request: AddFamilyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """メールアドレスで家族メンバーを追加"""
    
    # 認証チェック
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    
    # ヘッド親権限チェック
    if not current_user.head_parent_function:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Head parent function required"
        )
    
    # メールアドレスでユーザーを検索
    user = db.query(User).filter(User.email == request.email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # 自分自身は追加できない
    if user.user_id == current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot add yourself to family"
        )
    
    # 既に家族関係が存在するかチェック
    existing_relation = db.query(FamilyRelation).filter(
        (FamilyRelation.parent_id == current_user.user_id) & (FamilyRelation.child_id == user.user_id) |
        (FamilyRelation.parent_id == user.user_id) & (FamilyRelation.child_id == current_user.user_id)
    ).first()
    
    if existing_relation:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Family relation already exists"
        )
    
    # 家族関係を作成（ヘッド親を親として設定）
    relation = FamilyRelation(parent_id=current_user.user_id, child_id=user.user_id)
    db.add(relation)
    db.commit()
    
    return {"message": "Family member added successfully"}


@router.get("/members", response_model=List[FamilyMemberInfo])
def get_family_members(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """ヘッド親が家族メンバー一覧を取得"""
    
    # 認証チェック
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    
    # ヘッド親権限チェック
    if not current_user.head_parent_function:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Head parent function required"
        )
    
    # 家族関係を取得
    family_members = []
    
    # 自分の子供を取得
    children = db.query(User).join(
        FamilyRelation, FamilyRelation.child_id == User.user_id
    ).filter(
        FamilyRelation.parent_id == current_user.user_id
    ).all()
    
    for child in children:
        # 最新のテスト結果を取得
        latest_test = db.query(TestResult).filter(
            TestResult.user_id == child.user_id
        ).order_by(TestResult.test_date.desc()).first()
        
        # テスト回数を取得
        test_count = db.query(TestResult).filter(
            TestResult.user_id == child.user_id
        ).count()
        
        family_members.append(FamilyMemberInfo(
            user_id=str(child.user_id),
            name=child.name,
            email=child.email,
            role=child.role,
            latest_test_date=latest_test.test_date if latest_test else None,
            test_count=test_count,
            relationship="child"
        ))
    
    # 自分の親を取得
    parents = db.query(User).join(
        FamilyRelation, FamilyRelation.parent_id == User.user_id
    ).filter(
        FamilyRelation.child_id == current_user.user_id
    ).all()
    
    for parent in parents:
        # 最新のテスト結果を取得
        latest_test = db.query(TestResult).filter(
            TestResult.user_id == parent.user_id
        ).order_by(TestResult.test_date.desc()).first()
        
        # テスト回数を取得
        test_count = db.query(TestResult).filter(
            TestResult.user_id == parent.user_id
        ).count()
        
        family_members.append(FamilyMemberInfo(
            user_id=str(parent.user_id),
            name=parent.name,
            email=parent.email,
            role=parent.role,
            latest_test_date=latest_test.test_date if latest_test else None,
            test_count=test_count,
            relationship="parent"
        ))
    
    return family_members


@router.get("/members-for-comparison", response_model=List[dict])
def get_family_members_for_comparison(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """ヘッド親が比較用の家族メンバー一覧を取得"""
    
    # 認証チェック
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    
    # ヘッド親権限チェック
    if not current_user.head_parent_function:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Head parent function required"
        )
    
    # 家族関係を取得
    family_members = []
    
    # 自分の子供を取得
    children = db.query(User).join(
        FamilyRelation, FamilyRelation.child_id == User.user_id
    ).filter(
        FamilyRelation.parent_id == current_user.user_id
    ).all()
    
    for child in children:
        # 最新のテスト結果を取得
        latest_test = db.query(TestResult).filter(
            TestResult.user_id == child.user_id
        ).order_by(TestResult.test_date.desc()).first()
        
        family_members.append({
            "user_id": str(child.user_id),
            "name": child.name,
            "email": child.email,
            "role": child.role,
            "latest_test_date": latest_test.test_date if latest_test else None,
            "has_test_result": latest_test is not None,
            "relationship": "child"
        })
    
    # 自分の親を取得
    parents = db.query(User).join(
        FamilyRelation, FamilyRelation.parent_id == User.user_id
    ).filter(
        FamilyRelation.child_id == current_user.user_id
    ).all()
    
    for parent in parents:
        # 最新のテスト結果を取得
        latest_test = db.query(TestResult).filter(
            TestResult.user_id == parent.user_id
        ).order_by(TestResult.test_date.desc()).first()
        
        family_members.append({
            "user_id": str(parent.user_id),
            "name": parent.name,
            "email": parent.email,
            "role": parent.role,
            "latest_test_date": latest_test.test_date if latest_test else None,
            "has_test_result": latest_test is not None,
            "relationship": "parent"
        })
    
    return family_members


@router.get("/members/{member_id}/results", response_model=List[FamilyMemberTestResult])
def get_family_member_test_results(
    member_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """ヘッド親が特定家族メンバーのテスト結果を取得"""
    
    # 認証チェック
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    
    # ヘッド親権限チェック
    if not current_user.head_parent_function:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Head parent function required"
        )
    
    # 家族メンバーが自分の家族に属しているかチェック
    # 子供としての関係をチェック
    is_child = db.query(FamilyRelation).filter(
        FamilyRelation.parent_id == current_user.user_id,
        FamilyRelation.child_id == member_id
    ).first()
    
    # 親としての関係をチェック
    is_parent = db.query(FamilyRelation).filter(
        FamilyRelation.child_id == current_user.user_id,
        FamilyRelation.parent_id == member_id
    ).first()
    
    if not is_child and not is_parent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Family member not found"
        )
    
    # 家族メンバーの情報を取得
    family_member = db.query(User).filter(User.user_id == member_id).first()
    if not family_member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Family member not found"
        )
    
    # 家族メンバーのテスト結果を取得
    test_results = db.query(TestResult).filter(
        TestResult.user_id == member_id
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
        
        family_result = FamilyMemberTestResult(
            result_id=str(result.result_id),
            user_id=str(result.user_id),
            test_date=result.test_date,
            member_name=family_member.name,
            
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
        result_list.append(family_result)
    
    return result_list


@router.post("/add-child/{child_id}", response_model=dict)
def add_child_to_family(
    child_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """ヘッド親が家族に子供を追加"""
    
    # ヘッド親権限チェック
    if not current_user.head_parent_function:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Head parent function required"
        )
    
    # 子供が存在するかチェック
    child = db.query(User).filter(User.user_id == child_id).first()
    if not child:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Child user not found"
        )
    
    # 既に関係が存在するかチェック
    existing = db.query(FamilyRelation).filter(
        FamilyRelation.parent_id == current_user.user_id,
        FamilyRelation.child_id == child_id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Family relation already exists"
        )
    
    # 家族関係を作成
    relation = FamilyRelation(parent_id=current_user.user_id, child_id=child_id)
    db.add(relation)
    db.commit()
    
    return {"message": "Child added to family successfully"}


@router.delete("/remove-child/{child_id}", response_model=dict)
def remove_child_from_family(
    child_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """ヘッド親が家族から子供を削除"""
    
    # ヘッド親権限チェック
    if not current_user.head_parent_function:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Head parent function required"
        )
    
    # 家族関係を削除
    relation = db.query(FamilyRelation).filter(
        FamilyRelation.parent_id == current_user.user_id,
        FamilyRelation.child_id == child_id
    ).first()
    
    if not relation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Family relation not found"
        )
    
    db.delete(relation)
    db.commit()
    
    return {"message": "Child removed from family successfully"} 