# ファイル: backend/app/database.py

import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# .env の読み込み
load_dotenv()

# Herokuなどで使用する一般のDATABASE_URLを読み込み
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://user:password@localhost:5432/sportsmanship"
)

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    echo=True if os.getenv("DEBUG") == "true" else False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """通常アプリ用のデータベースセッション"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
