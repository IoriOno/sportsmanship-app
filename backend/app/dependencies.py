from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.user import User
from app.schemas.auth import TokenData
from app.exceptions import (
    AuthenticationRequired,
    InvalidCredentials,
    HeadCoachRequired,
    PermissionDenied
)
from app.schemas.error import ErrorDetail

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)


def get_current_user(
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(oauth2_scheme)
) -> Optional[User]:
    if token is None:
        return None
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise InvalidCredentials()
        token_data = TokenData(user_id=user_id)
    except JWTError:
        raise InvalidCredentials()
    
    user = db.query(User).filter(User.user_id == token_data.user_id).first()
    if user is None:
        raise InvalidCredentials()
    
    return user


def get_current_active_user(
    current_user: Optional[User] = Depends(get_current_user)
) -> Optional[User]:
    # 認証が必須でないエンドポイント用
    # 認証されていない場合はNoneを返す（認証バイパスではない）
    if current_user is None:
        return None
    return current_user


def get_current_active_user_required(
    current_user: Optional[User] = Depends(get_current_user)
) -> User:
    # 認証が必須のエンドポイント用
    if not current_user:
        raise AuthenticationRequired()
    return current_user


def get_head_coach_user(
    current_user: User = Depends(get_current_active_user_required)
) -> User:
    if not current_user.head_coach_function:
        raise HeadCoachRequired()
    return current_user


def get_head_parent_user(
    current_user: User = Depends(get_current_active_user_required)
) -> User:
    if not current_user.head_parent_function:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Head parent function required"
        )
    return current_user


def get_coach_or_parent_user(
    current_user: User = Depends(get_current_active_user_required)
) -> User:
    if not (current_user.role in ["coach", "father", "mother"] or 
            current_user.parent_function or 
            current_user.head_coach_function or
            current_user.head_parent_function):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Coach or parent function required"
        )
    return current_user


# 開発環境用のテストユーザー作成ヘルパー（本番環境では使用しない）
def get_test_user_for_development(db: Session) -> Optional[User]:
    """
    開発環境でのみ使用するテストユーザー取得関数
    本番環境では絶対に使用しないこと
    """
    if not settings.DEBUG:
        return None
    
    # テストユーザーの存在確認
    test_user = db.query(User).filter(User.email == "test@example.com").first()
    return test_user
