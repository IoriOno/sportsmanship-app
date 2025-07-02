# ===== backend/app/schemas/auth.py =====
from typing import Optional
from pydantic import BaseModel, validator


class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict


class TokenData(BaseModel):
    user_id: Optional[str] = None


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    # クラブIDをオプショナルに変更
    club_id: Optional[str] = None
    email: str
    password: str
    name: str
    age: Optional[int] = None
    role: str
    # 個人利用フラグ追加
    is_individual: Optional[bool] = False
    
    @validator('club_id')
    def validate_club_id(cls, v, values):
        """クラブ利用時はクラブIDが必須"""
        is_individual = values.get('is_individual', False)
        if not is_individual and not v:
            raise ValueError('クラブ利用の場合、クラブIDは必須です')
        return v
    
    @validator('role')
    def validate_role(cls, v):
        """有効な役割かチェック"""
        valid_roles = ['player', 'coach', 'father', 'mother', 'adult']
        if v not in valid_roles:
            raise ValueError(f'無効な役割です。有効な値: {valid_roles}')
        return v


class PasswordReset(BaseModel):
    email: str


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str


class UserResponse(BaseModel):
    user_id: str
    email: str
    name: str
    role: str
    club_id: Optional[str] = None
    is_individual: bool
    usage_type: str
    can_access_club_features: bool
    
    class Config:
        from_attributes = True


class UsageTypeChangeRequest(BaseModel):
    """利用形態変更リクエスト"""
    to_individual: bool
    club_id: Optional[str] = None
    
    @validator('club_id')
    def validate_club_id_for_change(cls, v, values):
        """クラブ利用に変更する場合はクラブIDが必須"""
        to_individual = values.get('to_individual', True)
        if not to_individual and not v:
            raise ValueError('クラブ利用に変更する場合、クラブIDは必須です')
        return v