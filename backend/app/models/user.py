from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field
from enum import Enum

class UserRole(str, Enum):
    TEACHER = "teacher"
    STUDENT = "student"

class User(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: str = Field(unique=True, index=True)
    password_hash: str
    role: UserRole = Field(default=UserRole.STUDENT)
    created_at: datetime = Field(default_factory=datetime.utcnow)
