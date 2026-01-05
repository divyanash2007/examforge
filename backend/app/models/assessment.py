from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field
from enum import Enum

class AssessmentType(str, Enum):
    LIVE = "LIVE"
    HOMEWORK = "HOMEWORK"
    SELF = "SELF"

class AssessmentStatus(str, Enum):
    DRAFT = "DRAFT"
    LIVE = "LIVE"
    CLOSED = "CLOSED"

class Assessment(SQLModel, table=True):
    __tablename__ = "assessments"

    id: Optional[int] = Field(default=None, primary_key=True)
    room_id: Optional[int] = Field(default=None, foreign_key="rooms.id")
    created_by: int = Field(foreign_key="users.id")
    type: AssessmentType
    title: str
    status: AssessmentStatus = Field(default=AssessmentStatus.DRAFT)
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    time_per_question: Optional[int] = None # in seconds
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AssessmentQuestion(SQLModel, table=True):
    __tablename__ = "assessment_questions"

    id: Optional[int] = Field(default=None, primary_key=True)
    assessment_id: int = Field(foreign_key="assessments.id")
    question_id: int = Field(foreign_key="questions.id")
    question_order: int
