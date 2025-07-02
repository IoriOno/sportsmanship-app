# ファイル: backend/app/models/question.py

from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

from app.database import Base


class Question(Base):
    __tablename__ = "questions"

    question_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    question_number = Column(Integer, unique=True, nullable=False)
    question_text = Column(Text, nullable=False)
    category = Column(String(100), nullable=False)  # 'sportsmanship', 'athlete_mind', 'self_affirmation'
    subcategory = Column(String(100), nullable=False)  # 具体的なカテゴリ名
    target = Column(String(20), nullable=False, default='all')  # 'all', 'player', 'coach', 'mother', 'father', 'adult'
    is_reverse_score = Column(Boolean, default=False)  # スポーツマンシップ用逆転計算フラグ
    is_active = Column(Boolean, default=True)
    created_date = Column(DateTime(timezone=True), server_default=func.now())
    updated_date = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Question(id={self.question_id}, number={self.question_number}, target={self.target})>"