from typing import Optional, List
from datetime import datetime
from sqlmodel import SQLModel, Field, JSON

class Question(SQLModel, table=True):
    __tablename__ = "questions"

    id: Optional[int] = Field(default=None, primary_key=True)
    question_text: str
    options: List[str] = Field(sa_type=JSON)
    correct_answer: str
    topic: str = "General"
    difficulty: str = "Medium"
    created_by: int = Field(foreign_key="users.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
