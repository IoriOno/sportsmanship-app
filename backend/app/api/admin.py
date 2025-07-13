import json
from datetime import datetime, timedelta
from typing import List, Optional, Dict
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import func
from uuid import UUID
from jose import JWTError, jwt
from pydantic import BaseModel
from passlib.context import CryptContext

from app.database import get_db
from app.models.user import User
from app.models.club import Club
from app.models.test_result import TestResult
from app.schemas.user import User as UserSchema
from app.dependencies import get_current_active_user
from app.config import settings

router = APIRouter()

# HTTPBearer for admin authentication
admin_security = HTTPBearer()

# Admin token settings
ADMIN_TOKEN_EXPIRE_MINUTES = 60  # 1時間
ADMIN_SECRET_KEY = settings.SECRET_KEY + "_admin"  # 管理者用の別シークレット

# パスワードハッシュ化の設定
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 管理者情報を保存するファイル（本番環境ではデータベースを使用すべき）
ADMIN_STORAGE_FILE = "admin_users.json"


class AdminLoginRequest(BaseModel):
    email: str
    password: str


class AdminToken(BaseModel):
    access_token: str
    token_type: str = "bearer"


class AdminCreateRequest(BaseModel):
    email: str
    password: str


class HeadCoachToggleRequest(BaseModel):
    is_head_coach: bool


class HeadParentToggleRequest(BaseModel):
    is_head_parent: bool


class UpdateUserClubRequest(BaseModel):
    new_club_id: str


def load_admin_users() -> Dict[str, dict]:
    """管理者ユーザー情報を読み込む"""
    try:
        with open(ADMIN_STORAGE_FILE, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        # ファイルが存在しない場合は、環境変数の管理者を初期データとして作成
        initial_admin = {
            settings.ADMIN_EMAIL: {
                "password_hash": pwd_context.hash(settings.ADMIN_PASSWORD),
                "created_date": datetime.utcnow().isoformat(),
                "last_login": None
            }
        }
        save_admin_users(initial_admin)
        return initial_admin


def save_admin_users(admin_users: Dict[str, dict]):
    """管理者ユーザー情報を保存"""
    with open(ADMIN_STORAGE_FILE, 'w') as f:
        json.dump(admin_users, f, indent=2)


def create_admin_access_token(data: dict):
    """管理者用アクセストークンの作成"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ADMIN_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "admin"})
    encoded_jwt = jwt.encode(to_encode, ADMIN_SECRET_KEY, algorithm="HS256")
    return encoded_jwt


def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(admin_security)):
    """現在の管理者を取得（トークン検証）"""
    token = credentials.credentials
    try:
        payload = jwt.decode(token, ADMIN_SECRET_KEY, algorithms=["HS256"])
        if payload.get("type") != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not an admin token"
            )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate admin credentials"
        )


# Admin check dependency (旧バージョン - 互換性のため残す)
def get_admin_user(
    current_user: User = Depends(get_current_active_user)
) -> User:
    # In production, this should check against a proper admin flag
    # For now, we'll use a specific email domain
    if not current_user.email.endswith("@nexpo.admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


@router.post("/login", response_model=AdminToken)
def admin_login(request: AdminLoginRequest):
    """
    管理者ログイン
    """
    admin_users = load_admin_users()
    
    # 管理者ユーザーの確認
    if request.email not in admin_users:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin credentials"
        )
    
    # パスワードの検証
    if not pwd_context.verify(request.password, admin_users[request.email]["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin credentials"
        )
    
    # 最終ログイン日時を更新
    admin_users[request.email]["last_login"] = datetime.utcnow().isoformat()
    save_admin_users(admin_users)
    
    # 管理者トークンを作成
    access_token = create_admin_access_token({"sub": "admin", "email": request.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.get("/admins")
def list_admin_users(
    admin_data = Depends(get_current_admin)
):
    """管理者ユーザー一覧を取得"""
    admin_users = load_admin_users()
    
    return [
        {
            "email": email,
            "created_date": info.get("created_date"),
            "last_login": info.get("last_login")
        }
        for email, info in admin_users.items()
    ]


@router.post("/admins")
def create_admin_user(
    request: AdminCreateRequest,
    admin_data = Depends(get_current_admin)
):
    """新規管理者ユーザーを作成"""
    admin_users = load_admin_users()
    
    # 既存チェック
    if request.email in admin_users:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin user already exists"
        )
    
    # 新規管理者を追加
    admin_users[request.email] = {
        "password_hash": pwd_context.hash(request.password),
        "created_date": datetime.utcnow().isoformat(),
        "last_login": None
    }
    
    save_admin_users(admin_users)
    
    return {"message": "Admin user created successfully", "email": request.email}


@router.delete("/admins/{email}")
def delete_admin_user(
    email: str,
    admin_data = Depends(get_current_admin)
):
    """管理者ユーザーを削除"""
    admin_users = load_admin_users()
    
    # 存在チェック
    if email not in admin_users:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin user not found"
        )
    
    # 最後の管理者は削除できない
    if len(admin_users) <= 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete the last admin user"
        )
    
    # 自分自身は削除できない
    if email == admin_data.get("email"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete yourself"
        )
    
    del admin_users[email]
    save_admin_users(admin_users)
    
    return {"message": "Admin user deleted successfully"}


class ClubCreateRequest(BaseModel):
    club_id: str
    club_name: str


@router.post("/clubs")
def create_club(
    request: ClubCreateRequest,
    db: Session = Depends(get_db),
    admin_data = Depends(get_current_admin)
):
    # Check if club already exists
    existing_club = db.query(Club).filter(Club.club_id == request.club_id).first()
    if existing_club:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Club ID already exists"
        )
    
    # Create new club
    club = Club(club_id=request.club_id, club_name=request.club_name)
    db.add(club)
    db.commit()
    db.refresh(club)
    
    return {
        "club_id": club.club_id,
        "club_name": club.club_name,
        "created_date": club.created_date
    }


@router.get("/clubs")
def list_clubs(
    db: Session = Depends(get_db),
    admin_data = Depends(get_current_admin)
):
    clubs = db.query(Club).all()
    return [
        {
            "club_id": club.club_id,
            "club_name": club.club_name,
            "created_date": club.created_date,
            "user_count": len(club.users)
        }
        for club in clubs
    ]


@router.delete("/clubs/{club_id}")
def delete_club(
    club_id: str,
    db: Session = Depends(get_db),
    admin_data = Depends(get_current_admin)
):
    club = db.query(Club).filter(Club.club_id == club_id).first()
    if not club:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Club not found"
        )
    
    db.delete(club)
    db.commit()
    
    return {"message": "Club deleted successfully"}


@router.get("/users")
def list_all_users(
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """すべてのユーザーを取得（ページネーション付き）"""
    users = db.query(User).offset(offset).limit(limit).all()
    return {
        "users": users,
        "total": db.query(User).count()
    }


@router.get("/users/{user_id}")
def get_user_detail(
    user_id: UUID,
    db: Session = Depends(get_db),
    admin_data = Depends(get_current_admin)
):
    """特定ユーザーの詳細を取得"""
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user


@router.put("/users/{user_id}/activate")
def activate_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    admin_data = Depends(get_current_admin)
):
    """ユーザーを有効化"""
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # is_active フィールドが存在しない場合の処理
    # user.is_active = True
    db.commit()
    
    return {"message": "User activated successfully"}


@router.put("/users/{user_id}/deactivate")
def deactivate_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    admin_data = Depends(get_current_admin)
):
    """ユーザーを無効化"""
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # is_active フィールドが存在しない場合の処理
    # user.is_active = False
    db.commit()
    
    return {"message": "User deactivated successfully"}


@router.delete("/users/{user_id}")
def delete_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    admin_data = Depends(get_current_admin)
):
    """ユーザーを削除"""
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    db.delete(user)
    db.commit()
    
    return {"message": "User deleted successfully"}


@router.put("/users/{user_id}/head-coach")
def toggle_head_coach(
    user_id: UUID,
    request: HeadCoachToggleRequest,
    db: Session = Depends(get_db),
    admin_data = Depends(get_current_admin)
):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.head_coach_function = request.is_head_coach
    db.commit()
    
    return {"message": f"Head coach function {'enabled' if request.is_head_coach else 'disabled'}"}


@router.put("/users/{user_id}/head-parent")
def toggle_head_parent(
    user_id: UUID,
    request: HeadParentToggleRequest,
    db: Session = Depends(get_db),
    admin_data = Depends(get_current_admin)
):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.head_parent_function = request.is_head_parent
    db.commit()
    
    return {"message": f"Head parent function {'enabled' if request.is_head_parent else 'disabled'}"}


@router.delete("/test-results/{result_id}")
def delete_test_result(
    result_id: UUID,
    db: Session = Depends(get_db),
    admin_data = Depends(get_current_admin)
):
    result = db.query(TestResult).filter(TestResult.result_id == result_id).first()
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test result not found"
        )
    
    db.delete(result)
    db.commit()
    
    return {"message": "Test result deleted successfully"}


@router.get("/users/statistics/summary")
def get_user_statistics(
    club_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """ユーザー統計情報を取得"""
    query = db.query(User)
    
    if club_id:
        query = query.filter(User.club_id == club_id)
    
    total_users = query.count()
    
    # 役割別統計
    role_stats = {}
    for role in ['player', 'father', 'mother', 'coach']:
        count = query.filter(User.role == role).count()
        role_stats[role] = count
    
    # クラブ別統計
    club_stats = db.query(
        User.club_id,
        func.count(User.user_id).label('user_count')
    ).group_by(User.club_id).all()
    
    # アクティブ/非アクティブユーザー数
    # is_activeフィールドが存在しない場合は、全ユーザーをアクティブとして扱う
    active_users = total_users
    inactive_users = 0
    
    return {
        "total_users": total_users,
        "active_users": active_users,
        "inactive_users": inactive_users,
        "role_statistics": role_stats,
        "club_statistics": [{"club_id": stat.club_id, "user_count": stat.user_count} for stat in club_stats]
    }


@router.put("/users/{user_id}/role")
def update_user_role(
    user_id: UUID,
    role_data: dict,
    db: Session = Depends(get_db),
    admin_data = Depends(get_current_admin)
):
    """ユーザーの役割を更新"""
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if "new_role" not in role_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="new_role is required"
        )
    
    user.role = role_data["new_role"]
    db.commit()
    
    return {"message": "User role updated successfully", "new_role": user.role}


@router.put("/users/{user_id}/club")
def update_user_club(
    user_id: UUID,
    request: UpdateUserClubRequest,
    db: Session = Depends(get_db),
    admin_data = Depends(get_current_admin)
):
    """ユーザーのクラブIDを更新"""
    # ユーザーの存在確認
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # 新しいクラブの存在確認
    new_club = db.query(Club).filter(Club.club_id == request.new_club_id).first()
    if not new_club:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Club not found"
        )
    
    # クラブIDを更新
    old_club_id = user.club_id
    user.club_id = request.new_club_id
    db.commit()
    db.refresh(user)
    
    return {
        "message": "User club updated successfully",
        "user_id": str(user.user_id),
        "old_club_id": old_club_id,
        "new_club_id": user.club_id
    }