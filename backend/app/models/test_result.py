# app/models/test_result.py
from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid

from app.database import Base


class TestResult(Base):
    __tablename__ = "test_results"
    
    result_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    target_selection = Column(String(20), nullable=False)
    test_date = Column(DateTime(timezone=True), server_default=func.now())
    
    # 自己肯定感関連（変更なし）
    self_determination = Column(Float)
    self_acceptance = Column(Float)
    self_worth = Column(Float)
    self_efficacy = Column(Float)
    
    # アスリートマインド（統合データローダー対応の新しい名前）
    commitment = Column(Float)        # こだわり（旧: thoroughness）
    result = Column(Float)            # 結果（旧: result_focus）
    steadiness = Column(Float)        # 堅実（変更なし）
    devotion = Column(Float)          # 献身（旧: dedication）
    self_control = Column(Float)      # 克己（変更なし）
    assertion = Column(Float)         # 主張（変更なし）
    sensitivity = Column(Float)       # 繊細（変更なし）
    intuition = Column(Float)         # 直感（変更なし）
    introspection = Column(Float)     # 内省（変更なし）
    comparison = Column(Float)        # 比較（変更なし）
    
    # スポーツマンシップ（変更なし）
    courage = Column(Float)
    resilience = Column(Float)
    cooperation = Column(Float)
    natural_acceptance = Column(Float)
    non_rationality = Column(Float)
    
    # 分析結果用フィールド
    self_esteem_total = Column(Float)
    self_esteem_analysis = Column(String(1000))
    self_esteem_improvements = Column(String(2000))
    athlete_type = Column(String(100))
    athlete_type_description = Column(String(1000))
    athlete_type_percentages = Column(String(500))
    strengths = Column(String(500))
    weaknesses = Column(String(500))
    sportsmanship_balance = Column(String(1000))
    
    created_date = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="test_results")