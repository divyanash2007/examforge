from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel

class RoomCreate(SQLModel):
    name: str

class RoomRead(SQLModel):
    id: int
    name: str
    code: str
    teacher_id: int
    created_at: datetime

class RoomJoinRequest(SQLModel):
    code: str
