# ファイル: backend/app/schemas/question.py

from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID
from enum import Enum


class TargetType(str, Enum):
    PLAYER = "player"
    FATHER = "father"
    MOTHER = "mother"
    COACH = "coach"
    ADULT = "adult"
    ALL = "all"


class QuestionBase(BaseModel):
    question_number: int = Field(..., ge=1, description="質問番号（1以上）")
    question_text: str = Field(..., min_length=1, description="質問文")
    category: str = Field(..., min_length=1, description="カテゴリ")
    subcategory: str = Field(..., min_length=1, description="サブカテゴリ")
    target: TargetType = Field(default=TargetType.ALL, description="対象")
    is_reverse_score: bool = Field(default=False, description="逆転スコアフラグ")
    is_active: bool = Field(default=True, description="有効フラグ")


class QuestionCreate(QuestionBase):
    pass


class QuestionUpdate(BaseModel):
    question_text: Optional[str] = Field(None, min_length=1)
    category: Optional[str] = Field(None, min_length=1)
    subcategory: Optional[str] = Field(None, min_length=1)
    target: Optional[TargetType] = None
    is_reverse_score: Optional[bool] = None
    is_active: Optional[bool] = None


class Question(QuestionBase):
    question_id: UUID
    created_date: datetime
    updated_date: Optional[datetime] = None

    class Config:
        from_attributes = True


class QuestionList(BaseModel):
    questions: list[Question]
    total_count: int
    
    class Config:
        from_attributes = True