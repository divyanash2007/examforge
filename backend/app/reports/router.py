from typing import List
from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.database import get_engine
from app.models.user import User
from app.auth.dependencies import get_current_user, teacher_only, student_only
from app.reports.schemas import Leaderboard, AttemptReport, AssessmentReport
from app.reports.service import (
    get_leaderboard_service,
    get_attempt_report_service,
    get_assessment_report_service
)

router = APIRouter(tags=["reports"])

def get_session():
    with Session(get_engine()) as session:
        yield session

@router.get("/assessments/{assessment_id}/leaderboard", response_model=Leaderboard)
def get_leaderboard(
    assessment_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # Public for room members (TODO: verify membership if strict needed, but generic auth is okay for now)
    return get_leaderboard_service(session, assessment_id)

@router.get("/attempts/{attempt_id}/report", response_model=AttemptReport)
def get_student_report(
    attempt_id: int,
    current_user: User = Depends(student_only),
    session: Session = Depends(get_session)
):
    return get_attempt_report_service(session, attempt_id, current_user.id)

@router.get("/assessments/{assessment_id}/report", response_model=AssessmentReport)
def get_teacher_report(
    assessment_id: int,
    current_user: User = Depends(teacher_only),
    session: Session = Depends(get_session)
):
    return get_assessment_report_service(session, assessment_id, current_user.id)
