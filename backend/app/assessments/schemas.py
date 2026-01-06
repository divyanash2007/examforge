from datetime import datetime
from typing import Optional, List
from sqlmodel import SQLModel
from app.models.assessment import AssessmentType, AssessmentStatus

class AssessmentCreate(SQLModel):
    room_id: int
    title: str
    type: AssessmentType
    time_per_question: int  # in seconds
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None

class AssessmentRead(SQLModel):
    id: int
    room_id: Optional[int] = None
    title: str
    type: AssessmentType
    status: AssessmentStatus
    created_at: datetime
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    time_per_question: Optional[int] = None

class AssessmentWithAttempt(AssessmentRead):
    is_submitted: bool = False
    attempt_id: Optional[int] = None

class QuestionAdd(SQLModel):
    question_id: int
    question_order: int

class QuestionCreate(SQLModel):
    question_text: str
    options: List[str]
    correct_option: str
    question_order: int = 1

class AttemptStart(SQLModel):
    assessment_id: int

class AnswerRead(SQLModel):
    question_id: int
    selected_answer: str

class AttemptRead(SQLModel):
    id: int
    assessment_id: int
    student_id: int
    score: Optional[float] = None
    started_at: datetime
    submitted_at: Optional[datetime] = None
    answers: List[AnswerRead] = []

class AnswerSubmit(SQLModel):
    question_id: int
    selected_answer: str
    time_taken: int

class QuestionClientRead(SQLModel):
    id: int
    question_text: str
    options: List[str]
    # No correct answer here!

class AttemptDetail(AttemptRead):
    questions: List[QuestionClientRead]

class QuestionRead(SQLModel):
    id: int
    question_text: str
    options: List[str]
    correct_answer: str

class AssessmentDetail(AssessmentRead):
    questions: List[QuestionRead] = []

class PracticeQuestionRead(SQLModel):
    id: int
    question_text: str
    source_assessment_title: str
    is_correct: bool

class PracticeCreate(SQLModel):
    question_ids: List[int]
    title: str = "Self Assessment Practice"
    time_limit: Optional[int] = None # in minutes
