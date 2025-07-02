from sqlalchemy import Column, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database import Base


class FamilyRelation(Base):
    __tablename__ = "family_relations"
    
    parent_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id", ondelete="CASCADE"), primary_key=True)
    child_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id", ondelete="CASCADE"), primary_key=True)
    created_date = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    parent = relationship("User", foreign_keys=[parent_id], back_populates="parent_relations")
    child = relationship("User", foreign_keys=[child_id], back_populates="child_relations")