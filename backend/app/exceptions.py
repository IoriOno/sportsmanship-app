# app/exceptions.py
from typing import Optional, List
from fastapi import HTTPException, status
from app.schemas.error import ErrorResponse, ErrorDetail, ErrorMessages, ErrorCodes


class AppException(HTTPException):
    """アプリケーション共通の例外基底クラス"""
    
    def __init__(
        self,
        status_code: int,
        error_message: str,
        error_code: str,
        details: Optional[List[ErrorDetail]] = None,
        headers: Optional[dict] = None
    ):
        error_response = ErrorResponse(
            error=error_message,
            error_code=error_code,
            details=details
        )
        super().__init__(
            status_code=status_code,
            detail=error_response.dict(),
            headers=headers
        )


# 認証関連の例外
class AuthenticationRequired(AppException):
    def __init__(self, details: Optional[List[ErrorDetail]] = None):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            error_message=ErrorMessages.AUTHENTICATION_REQUIRED,
            error_code=ErrorCodes.AUTHENTICATION_REQUIRED,
            details=details,
            headers={"WWW-Authenticate": "Bearer"}
        )


class InvalidCredentials(AppException):
    def __init__(self, details: Optional[List[ErrorDetail]] = None):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            error_message=ErrorMessages.INVALID_CREDENTIALS,
            error_code=ErrorCodes.INVALID_CREDENTIALS,
            details=details
        )


# 権限関連の例外
class PermissionDenied(AppException):
    def __init__(self, details: Optional[List[ErrorDetail]] = None):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            error_message=ErrorMessages.PERMISSION_DENIED,
            error_code=ErrorCodes.PERMISSION_DENIED,
            details=details
        )


class AdminRequired(AppException):
    def __init__(self, details: Optional[List[ErrorDetail]] = None):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            error_message=ErrorMessages.ADMIN_REQUIRED,
            error_code=ErrorCodes.ADMIN_REQUIRED,
            details=details
        )


class HeadCoachRequired(AppException):
    def __init__(self, details: Optional[List[ErrorDetail]] = None):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            error_message=ErrorMessages.HEAD_COACH_REQUIRED,
            error_code=ErrorCodes.HEAD_COACH_REQUIRED,
            details=details
        )


# リソース関連の例外
class UserNotFound(AppException):
    def __init__(self, user_id: Optional[str] = None):
        details = None
        if user_id:
            details = [ErrorDetail(message=f"ユーザーID: {user_id}", field="user_id")]
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            error_message=ErrorMessages.USER_NOT_FOUND,
            error_code=ErrorCodes.USER_NOT_FOUND,
            details=details
        )


class ResourceNotFound(AppException):
    def __init__(self, resource_type: str, resource_id: Optional[str] = None):
        details = None
        if resource_id:
            details = [ErrorDetail(
                message=f"{resource_type} ID: {resource_id}",
                field=f"{resource_type}_id"
            )]
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            error_message=ErrorMessages.RESOURCE_NOT_FOUND,
            error_code=ErrorCodes.RESOURCE_NOT_FOUND,
            details=details
        )


class AlreadyExists(AppException):
    def __init__(self, resource_type: str, field: Optional[str] = None):
        details = None
        if field:
            details = [ErrorDetail(
                message=f"{resource_type}が既に存在します",
                field=field
            )]
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            error_message=ErrorMessages.ALREADY_EXISTS,
            error_code=ErrorCodes.ALREADY_EXISTS,
            details=details
        )


# バリデーション関連の例外
class ValidationError(AppException):
    def __init__(self, details: List[ErrorDetail]):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            error_message=ErrorMessages.VALIDATION_ERROR,
            error_code=ErrorCodes.VALIDATION_ERROR,
            details=details
        )


# サーバーエラー関連の例外
class InternalError(AppException):
    def __init__(self, error: Exception):
        details = [ErrorDetail(message=str(error))]
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error_message=ErrorMessages.INTERNAL_ERROR,
            error_code=ErrorCodes.INTERNAL_ERROR,
            details=details
        )


class DatabaseError(AppException):
    def __init__(self, error: Exception):
        details = [ErrorDetail(message="データベース操作に失敗しました")]
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error_message=ErrorMessages.DATABASE_ERROR,
            error_code=ErrorCodes.DATABASE_ERROR,
            details=details
        )