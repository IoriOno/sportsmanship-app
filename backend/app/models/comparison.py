from sqlalchemy import Column, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid

from app.database import Base


class ComparisonResult(Base):
    __tablename__ = "comparison_results"
    
    comparison_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    participants = Column(JSONB, nullable=False)  # 参加者IDの配列
    comparison_data = Column(JSONB, nullable=False)  # 比較結果データ
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.user_id", ondelete="SET NULL"))
    created_date = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    creator = relationship("User", back_populates="created_comparisons")