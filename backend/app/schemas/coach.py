from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, UUID4


class PlayerInfo(BaseModel):
    user_id: str
    name: str
    email: str
    role: str
    latest_test_date: Optional[datetime] = None
    test_count: int = 0


class PlayerTestResult(BaseModel):
    result_id: str
    user_id: str
    test_date: datetime
    player_name: str
    self_esteem_total: float
    courage: float
    resilience: float
    cooperation: float
    natural_acceptance: float
    non_rationality: float
    athlete_type: Optional[str] = None
    strengths: Optional[List[str]] = None
    weaknesses: Optional[List[str]] = None


class FamilyMemberInfo(BaseModel):
    user_id: str
    name: str
    email: str
    role: str
    latest_test_date: Optional[datetime] = None
    test_count: int = 0
    relationship: str  # "parent", "child", "spouse"


class FamilyMemberTestResult(BaseModel):
    result_id: str
    user_id: str
    test_date: datetime
    member_name: str
    
    # 自己肯定感関連
    self_determination: float
    self_acceptance: float
    self_worth: float
    self_efficacy: float
    
    # アスリートマインド
    introspection: float
    self_control: float
    devotion: float
    intuition: float
    sensitivity: float
    steadiness: float
    comparison: float
    result: float
    assertion: float
    commitment: float
    
    # スポーツマンシップ
    courage: float
    resilience: float
    cooperation: float
    natural_acceptance: float
    non_rationality: float
    
    # 分析結果
    self_esteem_total: float
    athlete_type: Optional[str] = None
    strengths: Optional[List[str]] = None
    weaknesses: Optional[List[str]] = None
    sportsmanship_total: float 