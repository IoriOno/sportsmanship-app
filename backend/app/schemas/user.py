from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, UUID4
from enum import Enum


class UserRole(str, Enum):
    player = "player"
    coach = "coach"
    father = "father"
    mother = "mother"
    adult = "adult"


class UserBase(BaseModel):
    email: str
    name: str
    age: Optional[int] = None
    role: UserRole
    club_id: Optional[str] = None
    parent_function: bool = False
    head_coach_function: bool = False
    head_parent_function: bool = False  # ヘッド親機能追加
    is_individual: bool = False


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    email: Optional[str] = None
    name: Optional[str] = None
    age: Optional[int] = None
    role: Optional[UserRole] = None
    club_id: Optional[str] = None
    parent_function: Optional[bool] = None
    head_coach_function: Optional[bool] = None
    head_parent_function: Optional[bool] = None  # ヘッド親機能追加
    is_individual: Optional[bool] = None


class UserInDBBase(UserBase):
    user_id: UUID4
    parent_function: bool
    head_coach_function: bool
    head_parent_function: bool  # ヘッド親機能追加
    created_date: datetime
    updated_date: datetime
    
    class Config:
        from_attributes = True


class User(UserInDBBase):
    pass


class UserWithRelations(User):
    children: Optional[List[User]] = []
    parents: Optional[List[User]] = []