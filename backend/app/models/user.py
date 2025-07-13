# ===== backend/app/models/user.py =====

from sqlalchemy import Column, String, Integer, Boolean, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
import enum

from app.database import Base


class UserRole(str, enum.Enum):
    player = "player"
    coach = "coach"
    father = "father"
    mother = "mother"
    adult = "adult"


class User(Base):
    __tablename__ = "users"
    
    user_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    # クラブIDをオプショナルに変更（nullable=True追加）
    club_id = Column(String(50), ForeignKey("clubs.club_id", ondelete="CASCADE"), nullable=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    age = Column(Integer)
    role = Column(Enum(UserRole), nullable=False)
    parent_function = Column(Boolean, default=False)
    head_coach_function = Column(Boolean, default=False)
    head_parent_function = Column(Boolean, default=False)  # ヘッド親機能追加
    # 個人利用かクラブ利用かを識別するフィールド追加
    is_individual = Column(Boolean, default=False)  # True: 個人利用, False: クラブ利用
    created_date = Column(DateTime(timezone=True), server_default=func.now())
    updated_date = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    club = relationship("Club", back_populates="users")
    test_results = relationship("TestResult", back_populates="user", cascade="all, delete-orphan")
    chat_history = relationship("ChatHistory", back_populates="user", cascade="all, delete-orphan")
    created_comparisons = relationship("ComparisonResult", back_populates="creator")
    
    # Family relations
    parent_relations = relationship(
        "FamilyRelation",
        foreign_keys="FamilyRelation.parent_id",
        back_populates="parent",
        cascade="all, delete-orphan"
    )
    child_relations = relationship(
        "FamilyRelation",
        foreign_keys="FamilyRelation.child_id",
        back_populates="child",
        cascade="all, delete-orphan"
    )
    
    @property
    def usage_type(self):
        """利用形態を返す"""
        return "individual" if self.is_individual else "club"
    
    @property
    def can_access_club_features(self):
        """クラブ機能にアクセス可能かどうか"""
        return not self.is_individual and self.club_id is not None
    
    def __repr__(self):
        return f"<User(id={self.user_id}, name={self.name}, role={self.role}, usage_type={self.usage_type})>"