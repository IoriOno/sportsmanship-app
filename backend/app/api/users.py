# backend/app/api/users.py
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from pydantic import BaseModel

from app.database import get_db
from app.models.user import User
from app.models.family_relation import FamilyRelation
from app.schemas.user import User as UserSchema, UserUpdate, UserWithRelations
from app.dependencies import get_current_active_user_required, get_head_coach_user
from app.core.security import get_password_hash
from app.models.club import Club


router = APIRouter()

class JoinClubRequest(BaseModel):
    club_id: str

@router.get("/me", response_model=UserSchema)
def read_users_me(current_user: User = Depends(get_current_active_user_required)):
    return current_user


@router.put("/me", response_model=UserSchema)
def update_user_me(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user_required)
):
    if user_update.email:
        # Check if email is already taken
        existing_user = db.query(User).filter(
            User.email == user_update.email,
            User.user_id != current_user.user_id
        ).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        current_user.email = user_update.email
    
    if user_update.name:
        current_user.name = user_update.name
    
    if user_update.age is not None:
        current_user.age = user_update.age
    
    if user_update.password:
        current_user.password_hash = get_password_hash(user_update.password)
    
    db.commit()
    db.refresh(current_user)
    
    return current_user


@router.get("/club")
def read_current_user_club_members(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user_required)
):
    """現在のユーザーが所属するクラブのメンバー一覧を取得"""
    from app.models.test_result import TestResult
    
    # デバッグ用ログ
    print(f"Current user: {current_user.email}")
    print(f"Current user club_id: {current_user.club_id}")
    
    if not current_user.club_id:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="User does not belong to any club"
        )
    
    # 同じクラブのユーザーを取得
    users = db.query(User).filter(User.club_id == current_user.club_id).all()
    print(f"Found {len(users)} users in club {current_user.club_id}")
    
    # 各ユーザーのテスト結果を確認
    result = []
    for user in users:
        # 最新のテスト結果を取得
        latest_test = db.query(TestResult).filter(
            TestResult.user_id == user.user_id
        ).order_by(TestResult.test_date.desc()).first()
        
        result.append({
            "user_id": str(user.user_id),
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "latest_test_date": latest_test.test_date.isoformat() if latest_test else None,
            "has_test_result": latest_test is not None
        })
    
    return result


@router.get("/club/{club_id}", response_model=List[UserSchema])
def read_club_users(
    club_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_head_coach_user)
):
    if current_user.club_id != club_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Can only view users from your own club"
        )
    
    users = db.query(User).filter(User.club_id == club_id).all()
    return users

@router.put("/join-club")
def join_club(
    request: JoinClubRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user_required)
):
    """ユーザーをクラブに参加させる"""
    # クラブの存在確認
    club = db.query(Club).filter(Club.club_id == request.club_id).first()
    if not club:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Club not found"
        )
    
    # 既に別のクラブに所属している場合
    if current_user.club_id and current_user.club_id != request.club_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Already belongs to club: {current_user.club_id}. Leave current club first."
        )
    
    # クラブに参加
    current_user.club_id = request.club_id
    db.commit()
    db.refresh(current_user)
    
    return {
        "message": "Successfully joined the club",
        "club_id": request.club_id,
        "user": current_user
    }


@router.put("/leave-club")
def leave_club(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user_required)
):
    """ユーザーをクラブから退会させる"""
    if not current_user.club_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is not in any club"
        )
    
    old_club_id = current_user.club_id
    current_user.club_id = None
    db.commit()
    db.refresh(current_user)
    
    return {
        "message": "Successfully left the club",
        "old_club_id": old_club_id
    }
    

@router.get("/{user_id}", response_model=UserWithRelations)
def read_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user_required)
):
    # Check permissions
    if str(current_user.user_id) != str(user_id) and not current_user.head_coach_function:
        # Check if requesting user is a parent of the target user
        is_parent = db.query(FamilyRelation).filter(
            FamilyRelation.parent_id == current_user.user_id,
            FamilyRelation.child_id == user_id
        ).first()
        
        if not is_parent and not current_user.parent_function:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this user"
            )
    
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Get family relations
    parent_relations = db.query(FamilyRelation).filter(
        FamilyRelation.child_id == user_id
    ).all()
    child_relations = db.query(FamilyRelation).filter(
        FamilyRelation.parent_id == user_id
    ).all()
    
    user_dict = user.__dict__
    user_dict['parents'] = [rel.parent for rel in parent_relations]
    user_dict['children'] = [rel.child for rel in child_relations]
    
    return user_dict


@router.post("/{user_id}/add-child/{child_id}", response_model=dict)
def add_child_relation(
    user_id: UUID,
    child_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user_required)
):
    # Only the parent themselves or head coach can add relations
    if str(current_user.user_id) != str(user_id) and not current_user.head_coach_function:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify family relations"
        )
    
    # Check if both users exist
    parent = db.query(User).filter(User.user_id == user_id).first()
    child = db.query(User).filter(User.user_id == child_id).first()
    
    if not parent or not child:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if parent is actually a parent role
    if parent.role not in ["father", "mother"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must be a parent to add children"
        )
    
    # Check if child is a player
    if child.role != "player":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Child must be a player"
        )
    
    # Check if relation already exists
    existing = db.query(FamilyRelation).filter(
        FamilyRelation.parent_id == user_id,
        FamilyRelation.child_id == child_id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Relation already exists"
        )
    
    # Create relation
    relation = FamilyRelation(parent_id=user_id, child_id=child_id)
    db.add(relation)
    db.commit()
    
    return {"message": "Child relation added successfully"}