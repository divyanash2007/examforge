from typing import List
from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.database import get_engine
from app.models.user import User
from app.auth.dependencies import teacher_only
from app.analytics.schemas import AssessmentAnalyticsSummary, QuestionAnalytics
from app.analytics.service import get_assessment_summary_service, get_assessment_questions_analytics_service

router = APIRouter(prefix="/teacher/analytics", tags=["analytics"])

def get_session():
    from sqlmodel import Session
    from app.database import get_engine
    with Session(get_engine()) as session:
        yield session

@router.get("/assessment/{assessment_id}/summary", response_model=AssessmentAnalyticsSummary)
def get_assessment_summary(
    assessment_id: int,
    current_user: User = Depends(teacher_only),
    session: Session = Depends(get_session)
):
    return get_assessment_summary_service(session, assessment_id, current_user.id)

@router.get("/assessment/{assessment_id}/questions", response_model=List[QuestionAnalytics])
def get_assessment_questions_analytics(
    assessment_id: int,
    current_user: User = Depends(teacher_only),
    session: Session = Depends(get_session)
):
    return get_assessment_questions_analytics_service(session, assessment_id, current_user.id)
