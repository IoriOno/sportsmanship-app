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
    club_id: str


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    email: Optional[str] = None
    password: Optional[str] = None


class UserInDBBase(UserBase):
    user_id: UUID4
    parent_function: bool
    head_coach_function: bool
    created_date: datetime
    updated_date: datetime
    
    class Config:
        from_attributes = True


class User(UserInDBBase):
    pass


class UserInDB(UserInDBBase):
    password_hash: str


class UserWithRelations(User):
    children: Optional[List[User]] = []
    parents: Optional[List[User]] = []