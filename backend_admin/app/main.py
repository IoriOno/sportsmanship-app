# ファイル: backend_admin/app/main.py

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
from dotenv import load_dotenv

# 環境変数読み込み
load_dotenv('.env.admin')

from app.api import admin_auth, admin_users, admin_questions, admin_clubs, admin_analytics
from app.database import engine, Base

# データベーステーブル作成
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Sportsmanship App Admin API",
    description="スポーツマンシップアプリ管理者専用API",
    version="1.0.0",
    docs_url="/admin-docs",  # 管理者専用ドキュメント
    redoc_url="/admin-redoc"
)

# CORS設定（管理者フロントエンドのみ許可）
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3001",  # 管理者フロントエンド
        "https://admin.sportsmanship.app"  # 本番管理者URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# セキュリティ設定
security = HTTPBearer()
ADMIN_SECRET_KEY = os.getenv("ADMIN_SECRET_KEY", "your-super-secret-admin-key")

async def verify_admin_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """管理者認証の確認"""
    if credentials.credentials != ADMIN_SECRET_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return credentials

# 管理者専用ルーター
app.include_router(
    admin_auth.router, 
    prefix="/api/v1/admin/auth", 
    tags=["admin-auth"],
    dependencies=[Depends(verify_admin_token)]
)
app.include_router(
    admin_users.router, 
    prefix="/api/v1/admin/users", 
    tags=["admin-users"],
    dependencies=[Depends(verify_admin_token)]
)
app.include_router(
    admin_questions.router, 
    prefix="/api/v1/admin/questions", 
    tags=["admin-questions"],
    dependencies=[Depends(verify_admin_token)]
)
app.include_router(
    admin_clubs.router, 
    prefix="/api/v1/admin/clubs", 
    tags=["admin-clubs"],
    dependencies=[Depends(verify_admin_token)]
)
app.include_router(
    admin_analytics.router, 
    prefix="/api/v1/admin/analytics", 
    tags=["admin-analytics"],
    dependencies=[Depends(verify_admin_token)]
)

@app.get("/")
async def admin_root():
    return {
        "message": "Sportsmanship App Admin API is running",
        "environment": "admin",
        "version": "1.0.0"
    }

@app.get("/health")
async def admin_health_check():
    return {
        "status": "healthy", 
        "environment": "admin",
        "database": "connected"
    }

@app.get("/admin/status")
async def admin_status(credentials: HTTPAuthorizationCredentials = Depends(verify_admin_token)):
    """管理者システムの状態確認"""
    return {
        "admin_system": "active",
        "authenticated": True,
        "permissions": ["read", "write", "delete", "admin"],
        "environment": os.getenv("ENVIRONMENT", "development")
    }