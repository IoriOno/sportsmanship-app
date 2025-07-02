from sqlalchemy import Column, String, DateTime, Boolean
from sqlalchemy.sql import func

from app.database import Base


class AdminUser(Base):
    __tablename__ = "admin_users"
    
    email = Column(String(255), primary_key=True, index=True)
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_date = Column(DateTime(timezone=True), server_default=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)
    created_by = Column(String(255), nullable=True)  # 作成した管理者のメール