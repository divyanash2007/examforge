from typing import List, Optional
from sqlmodel import SQLModel

class OptionAnalytics(SQLModel):
    option_text: str
    selected_count: int
    is_correct: bool

class QuestionAnalytics(SQLModel):
    question_id: int
    question_text: str
    options: List[OptionAnalytics]

class AssessmentAnalyticsSummary(SQLModel):
    total_attempts: int
    average_score: float
    highest_score: float
    lowest_score: float
