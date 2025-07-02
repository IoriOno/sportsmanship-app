#backend/app/schemas/test.py
from typing import Optional, List, Dict, Union
from datetime import datetime
from pydantic import BaseModel, UUID4, validator, Field
import uuid


class TestAnswerCreate(BaseModel):
    question_id: Union[str, UUID4]  # 文字列またはUUID4を受け入れる
    answer_value: int
    
    @validator('question_id', pre=True)
    def validate_question_id(cls, v):
        # 文字列の場合はUUIDに変換を試みる
        if isinstance(v, str):
            try:
                return uuid.UUID(v)
            except ValueError:
                raise ValueError(f'Invalid UUID format: {v}')
        return v
    
    @validator('answer_value')
    def validate_answer_value(cls, v):
        if v < 0 or v > 10:
            raise ValueError('Answer value must be between 0 and 10')
        return v


class TestSubmit(BaseModel):
    user_id: Union[str, UUID4]  # 文字列またはUUID4を受け入れる
    test_date: datetime
    answers: List[TestAnswerCreate]
    
    @validator('user_id', pre=True)
    def validate_user_id(cls, v):
        # 文字列の場合はUUIDに変換を試みる
        if isinstance(v, str):
            try:
                return uuid.UUID(v)
            except ValueError:
                raise ValueError(f'Invalid UUID format: {v}')
        return v
    
    @validator('answers')
    def validate_answers_count(cls, v):
        if len(v) != 99:
            raise ValueError(f'Must submit exactly 99 answers, got {len(v)}')
        return v


class TestResultBase(BaseModel):
    target_selection: str  # ユーザーの対象選択
    
    # 自己肯定感関連
    self_determination: int
    self_acceptance: int
    self_worth: int
    self_efficacy: int
    
    # アスリートマインド
    introspection: int
    self_control: int
    devotion: float
    intuition: int
    sensitivity: int
    steadiness: int
    comparison: int
    result: float
    assertion: int
    commitment: int
    
    # スポーツマンシップ
    courage: int
    resilience: int
    cooperation: int
    natural_acceptance: int
    non_rationality: int


class TestResultCreate(TestResultBase):
    user_id: UUID4


class TestResult(TestResultBase):
    result_id: UUID4
    user_id: UUID4
    test_date: datetime
    
    class Config:
        from_attributes = True


class TestResultWithAnalysis(TestResult):
    # 自己肯定感分析
    self_esteem_total: int
    self_esteem_analysis: str
    self_esteem_improvements: List[str]
    
    # アスリートタイプ
    athlete_type: str
    athlete_type_description: str
    athlete_type_percentages: Dict[str, float]
    
    # 資質分析
    strengths: List[str]
    weaknesses: List[str]
    
    # スポーツマンシップ分析
    sportsmanship_balance: str


class TestHistory(BaseModel):
    results: List[TestResult]
    total_count: int