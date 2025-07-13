## backend/app/config.py
import os
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator
from urllib.parse import urlparse


class Settings(BaseModel):
    # Database - DATABASE_URLから自動的に解析
    DATABASE_URL: str = Field(default="postgresql://postgres:password@localhost:5432/sportsmanship")
    
    # DATABASE_URLから解析される値（オプショナルに変更）
    POSTGRES_USER: Optional[str] = None
    POSTGRES_PASSWORD: Optional[str] = None
    POSTGRES_DB: Optional[str] = None
    
    # Security - 環境変数からの読み込みを必須化
    SECRET_KEY: str = Field(default="your-super-secret-key-change-this-in-production-environment")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24時間
    
    # OpenAI
    OPENAI_API_KEY: Optional[str] = None
    
    # Application
    APP_NAME: str = "Sportsmanship App"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # Frontend
    REACT_APP_API_URL: str = "http://localhost:8000"
    REACT_APP_APP_NAME: str = "Sportsmanship App"
    
    # Admin - 環境変数からの読み込みを必須化
    ADMIN_EMAIL: str = Field(default="admin@sportsmanship.com")
    ADMIN_PASSWORD: str = Field(default="admin123456")
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "http://localhost:8000", 
        "http://127.0.0.1:8000",
        "https://sportsmanship-app.netlify.app",
        "https://sportsmanship-app-eb013246c2ae.herokuapp.com"
    ]
    
    @field_validator("POSTGRES_USER", "POSTGRES_PASSWORD", "POSTGRES_DB", mode="before")
    @classmethod
    def extract_from_database_url(cls, v, info):
        if v is None and hasattr(info, 'data') and "DATABASE_URL" in info.data:
            parsed_url = urlparse(info.data["DATABASE_URL"])
            if info.field_name == "POSTGRES_USER":
                return parsed_url.username
            elif info.field_name == "POSTGRES_PASSWORD":
                return parsed_url.password
            elif info.field_name == "POSTGRES_DB":
                return parsed_url.path.lstrip('/')
        return v
    
    @field_validator("SECRET_KEY")
    @classmethod
    def validate_secret_key(cls, v):
        if v == "your-secret-key-here" or v == "your-secret-key-here-please-change-in-production":
            raise ValueError("SECRET_KEY must be changed from default value!")
        if len(v) < 32:
            raise ValueError("SECRET_KEY must be at least 32 characters long!")
        return v
    
    @field_validator("ADMIN_PASSWORD")
    @classmethod
    def validate_admin_password(cls, v):
        if v == "admin123":
            raise ValueError("ADMIN_PASSWORD must be changed from default value!")
        if len(v) < 8:
            raise ValueError("ADMIN_PASSWORD must be at least 8 characters long!")
        return v
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# 環境変数から設定を読み込み
settings = Settings()
