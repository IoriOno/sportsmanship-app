from typing import List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, UUID4, validator


class ComparisonRequest(BaseModel):
    participant_ids: List[UUID4]
    
    @validator('participant_ids')
    def validate_participants(cls, v):
        if len(v) < 2 or len(v) > 4:
            raise ValueError('Must compare between 2 and 4 participants')
        return v


class ComparisonData(BaseModel):
    participant_id: UUID4
    participant_name: str
    participant_role: str
    qualities: Dict[str, int]


class ComparisonDifference(BaseModel):
    quality: str
    difference: int
    participant1_value: int
    participant2_value: int


class ComparisonResult(BaseModel):
    comparison_id: UUID4
    participants: List[ComparisonData]
    differences: List[ComparisonDifference]
    mutual_understanding: str
    good_interactions: List[str]
    bad_interactions: List[str]
    created_by: UUID4
    created_date: datetime
    
    class Config:
        from_attributes = True


class ComparisonHistory(BaseModel):
    comparisons: List[ComparisonResult]
    total_count: int