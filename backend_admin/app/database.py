# ファイル: backend_admin/app/database.py

import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# 管理者専用環境変数読み込み
load_dotenv('.env.admin')

# 管理者専用データベース設定
ADMIN_DATABASE_URL = os.getenv(
    "ADMIN_DATABASE_URL",
    "postgresql://onoiori:password@localhost:5432/sportsmanship_admin"
)

# 本番環境では読み取り専用のレプリカDBを使用することを推奨
if os.getenv("ENVIRONMENT") == "production":
    # 本番環境での読み取り専用レプリカDB設定
    ADMIN_DATABASE_URL = os.getenv(
        "ADMIN_READONLY_DATABASE_URL",
        ADMIN_DATABASE_URL
    )

engine = create_engine(
    ADMIN_DATABASE_URL,
    pool_pre_ping=True,
    echo=True if os.getenv("DEBUG") == "true" else False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """データベースセッションの取得"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_admin_db_info():
    """管理者データベース情報"""
    return {
        "database_url": ADMIN_DATABASE_URL.split("@")[1] if "@" in ADMIN_DATABASE_URL else "masked",
        "engine_info": str(engine.url).split("@")[1] if "@" in str(engine.url) else "masked",
        "environment": os.getenv("ENVIRONMENT", "development"),
        "debug_mode": os.getenv("DEBUG") == "true"
    }