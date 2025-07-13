from datetime import datetime, timedelta
from typing import Optional
from uuid import UUID, uuid4
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.user import User, UserRole
from app.models.club import Club
from app.schemas.auth import Token, LoginRequest, RegisterRequest, UserResponse, UsageTypeChangeRequest
from app.dependencies import get_current_active_user_required, get_current_active_user
from app.config import settings
from jose import JWTError, jwt
from passlib.context import CryptContext

# エラーハンドリング用のインポート
from app.exceptions import (
    InvalidCredentials,
    AlreadyExists,
    ValidationError,
    ResourceNotFound
)
from app.schemas.error import ErrorDetail

router = APIRouter()

# パスワードコンテキストの設定
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(subject: str, expires_delta: Optional[timedelta] = None):
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


@router.post("/register", response_model=Token)
def register(
    request: RegisterRequest,
    db: Session = Depends(get_db)
):
    """
    ユーザー登録 - 個人利用とクラブ利用の両方に対応
    """
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise AlreadyExists(resource_type="ユーザー", field="email")
    
    # クラブ利用の場合のみクラブ存在チェック
    club_id_to_set = None
    if not request.is_individual:
        if not request.club_id:
            raise ValidationError(details=[ErrorDetail(message="クラブ利用の場合、クラブIDは必須です", field="club_id")])
        
        # クラブの存在確認
        club = db.query(Club).filter(Club.club_id == request.club_id).first()
        if not club:
            raise ResourceNotFound(resource_type="クラブ", resource_id=request.club_id)
        club_id_to_set = request.club_id
    
    # Create new user
    hashed_password = get_password_hash(request.password)
    db_user = User(
        club_id=club_id_to_set,
        email=request.email,
        password_hash=hashed_password,
        name=request.name,
        age=request.age,
        role=request.role,
        is_individual=request.is_individual or False
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=str(db_user.user_id), expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "user_id": str(db_user.user_id),
            "email": db_user.email,
            "name": db_user.name,
            "role": db_user.role,
            "club_id": db_user.club_id,
            "is_individual": db_user.is_individual,
            "usage_type": db_user.usage_type,
            "can_access_club_features": db_user.can_access_club_features
        }
    }


@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    ユーザーログイン
    """
    # Authenticate user
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise InvalidCredentials()
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=str(user.user_id), expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "user_id": str(user.user_id),
            "email": user.email,
            "name": user.name,
            "role": user.role,
            "club_id": user.club_id,
            "is_individual": user.is_individual,
            "usage_type": user.usage_type,
            "can_access_club_features": user.can_access_club_features,
            "parent_function": user.parent_function,
            "head_coach_function": user.head_coach_function,
            "head_parent_function": user.head_parent_function
        }
    }


@router.post("/login-json", response_model=Token)
def login_json(
    request: LoginRequest,
    db: Session = Depends(get_db)
):
    """
    JSON形式でのユーザーログイン（フロントエンド用）
    """
    # Authenticate user
    user = db.query(User).filter(User.email == request.email).first()
    if not user or not verify_password(request.password, user.password_hash):
        raise InvalidCredentials()
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=str(user.user_id), expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "user_id": str(user.user_id),
            "email": user.email,
            "name": user.name,
            "role": user.role,
            "club_id": user.club_id,
            "is_individual": user.is_individual,
            "usage_type": user.usage_type,
            "can_access_club_features": user.can_access_club_features,
            "parent_function": user.parent_function,
            "head_coach_function": user.head_coach_function
        }
    }


@router.put("/change-usage-type")
def change_usage_type(
    request: UsageTypeChangeRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    利用形態の変更（個人利用 ⇔ クラブ利用）
    """
    if request.to_individual:
        # クラブ利用から個人利用に変更
        current_user.club_id = None
        current_user.is_individual = True
        # クラブ関連機能をリセット
        current_user.parent_function = False
        current_user.head_coach_function = False
        message = "個人利用に変更しました"
    else:
        # 個人利用からクラブ利用に変更
        if not request.club_id:
            raise ValidationError(details=[ErrorDetail(message="クラブ利用に変更する場合、クラブIDは必須です", field="club_id")])
        
        # クラブの存在確認
        club = db.query(Club).filter(Club.club_id == request.club_id).first()
        if not club:
            raise ResourceNotFound(resource_type="クラブ", resource_id=request.club_id)
        
        current_user.club_id = request.club_id
        current_user.is_individual = False
        message = f"クラブ利用に変更しました（クラブID: {request.club_id}）"
    
    current_user.updated_date = func.now()
    db.commit()
    db.refresh(current_user)
    
    return {
        "message": message,
        "user": {
            "user_id": str(current_user.user_id),
            "club_id": current_user.club_id,
            "is_individual": current_user.is_individual,
            "usage_type": current_user.usage_type,
            "can_access_club_features": current_user.can_access_club_features
        }
    }


@router.get("/validate-club/{club_id}")
def validate_club_id(
    club_id: str,
    db: Session = Depends(get_db)
):
    """
    クラブIDの有効性をチェック
    """
    club = db.query(Club).filter(Club.club_id == club_id).first()
    
    return {
        "club_id": club_id,
        "valid": club is not None,
        "club_name": club.club_name if club else None
    }
