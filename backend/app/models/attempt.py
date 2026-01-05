from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field

class Attempt(SQLModel, table=True):
    __tablename__ = "attempts"

    id: Optional[int] = Field(default=None, primary_key=True)
    assessment_id: int = Field(foreign_key="assessments.id")
    student_id: int = Field(foreign_key="users.id")
    score: float = 0.0
    started_at: datetime = Field(default_factory=datetime.utcnow)
    submitted_at: Optional[datetime] = None

class AttemptAnswer(SQLModel, table=True):
    __tablename__ = "attempt_answers"

    id: Optional[int] = Field(default=None, primary_key=True)
    attempt_id: int = Field(foreign_key="attempts.id")
    question_id: int = Field(foreign_key="questions.id")
    selected_answer: str
    is_correct: bool
    time_taken: int # in seconds
