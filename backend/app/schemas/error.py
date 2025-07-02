# app/schemas/error.py
from typing import Optional, List, Union
from pydantic import BaseModel


class ErrorDetail(BaseModel):
    """エラーの詳細情報"""
    message: str
    field: Optional[str] = None
    code: Optional[str] = None


class ErrorResponse(BaseModel):
    """統一されたエラーレスポンス"""
    error: str  # エラーの概要（日本語）
    error_code: str  # エラーコード（例: AUTH_001, VALIDATION_001）
    details: Optional[List[ErrorDetail]] = None
    request_id: Optional[str] = None  # トレーシング用


# 共通エラーメッセージ
class ErrorMessages:
    # 認証関連
    AUTHENTICATION_REQUIRED = "認証が必要です"
    INVALID_CREDENTIALS = "メールアドレスまたはパスワードが正しくありません"
    ACCOUNT_DISABLED = "アカウントが無効化されています"
    TOKEN_EXPIRED = "認証トークンの有効期限が切れています"
    TOKEN_INVALID = "認証トークンが無効です"
    
    # 権限関連
    PERMISSION_DENIED = "この操作を実行する権限がありません"
    ADMIN_REQUIRED = "管理者権限が必要です"
    HEAD_COACH_REQUIRED = "ヘッドコーチ権限が必要です"
    
    # リソース関連
    USER_NOT_FOUND = "ユーザーが見つかりません"
    RESOURCE_NOT_FOUND = "リソースが見つかりません"
    ALREADY_EXISTS = "既に存在します"
    
    # バリデーション関連
    VALIDATION_ERROR = "入力値が正しくありません"
    INVALID_FORMAT = "フォーマットが正しくありません"
    
    # サーバーエラー
    INTERNAL_ERROR = "サーバーエラーが発生しました"
    DATABASE_ERROR = "データベースエラーが発生しました"


# エラーコード
class ErrorCodes:
    # 認証関連 (AUTH_xxx)
    AUTHENTICATION_REQUIRED = "AUTH_001"
    INVALID_CREDENTIALS = "AUTH_002"
    ACCOUNT_DISABLED = "AUTH_003"
    TOKEN_EXPIRED = "AUTH_004"
    TOKEN_INVALID = "AUTH_005"
    
    # 権限関連 (PERM_xxx)
    PERMISSION_DENIED = "PERM_001"
    ADMIN_REQUIRED = "PERM_002"
    HEAD_COACH_REQUIRED = "PERM_003"
    
    # リソース関連 (RES_xxx)
    USER_NOT_FOUND = "RES_001"
    RESOURCE_NOT_FOUND = "RES_002"
    ALREADY_EXISTS = "RES_003"
    
    # バリデーション関連 (VAL_xxx)
    VALIDATION_ERROR = "VAL_001"
    INVALID_FORMAT = "VAL_002"
    
    # サーバーエラー (SRV_xxx)
    INTERNAL_ERROR = "SRV_001"
    DATABASE_ERROR = "SRV_002"