from typing import List
from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.models.user import User
from app.auth.dependencies import teacher_only, get_session
from app.monitor.schemas import StudentMonitorItem
from app.monitor.service import get_assessment_monitor_service

router = APIRouter(prefix="/teacher/monitor", tags=["monitor"])

@router.get("/assessment/{assessment_id}", response_model=List[StudentMonitorItem])
def get_assessment_monitor(
    assessment_id: int,
    current_user: User = Depends(teacher_only),
    session: Session = Depends(get_session)
):
    return get_assessment_monitor_service(session, assessment_id, current_user.id)
