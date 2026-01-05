from typing import List, Optional
from pydantic import BaseModel
from app.models.assessment import AssessmentStatus

class LeaderboardEntry(BaseModel):
    rank: int
    student_name: str
    score: float
    time_taken: Optional[int] = 0 # sum of time taken for answers or diff between submitted_at and started_at

class Leaderboard(BaseModel):
    assessment_id: int
    title: str
    entries: List[LeaderboardEntry]

class QuestionReport(BaseModel):
    question_text: str
    selected_answer: Optional[str] = None
    correct_answer: str
    is_correct: bool
    time_taken: int

class AttemptReport(BaseModel):
    attempt_id: int
    score: float
    rank: Optional[int] = None
    questions: List[QuestionReport]

class StudentSummary(BaseModel):
    student_id: int
    student_name: str
    score: float
    status: str # "Completed", "In Progress", "Not Started" (if we track non-attempts, but for now mostly Completed)

class AssessmentReport(BaseModel):
    assessment_id: int
    title: str
    average_score: float
    highest_score: float
    lowest_score: float
    students: List[StudentSummary]
