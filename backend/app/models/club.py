from sqlalchemy import Column, String, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database import Base


class Club(Base):
    __tablename__ = "clubs"
    
    club_id = Column(String(50), primary_key=True, index=True)
    club_name = Column(String(255), nullable=False)
    created_date = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    users = relationship("User", back_populates="club", cascade="all, delete-orphan")