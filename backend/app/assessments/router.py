from typing import List
from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from app.database import get_engine
from app.models.user import User
from app.auth.dependencies import get_current_user, teacher_only, student_only
from app.assessments.schemas import AssessmentCreate, AssessmentRead, QuestionAdd, AttemptStart, AttemptRead, AnswerSubmit, AttemptDetail, QuestionCreate, AssessmentDetail, AssessmentWithAttempt
from app.assessments.service import (
    create_assessment_service,
    add_question_service,
    start_assessment_service,
    get_room_assessments_service,
    start_attempt_service,
    submit_answer_service,
    submit_attempt_service,
    get_assessment_detail_service,
    create_question_service
)

router = APIRouter(prefix="/assessments", tags=["assessments"])

def get_session():
    with Session(get_engine()) as session:
        yield session

# Teacher Endpoints

@router.post("", response_model=AssessmentRead, status_code=status.HTTP_201_CREATED)
def create_assessment(
    assessment_in: AssessmentCreate,
    current_user: User = Depends(teacher_only),
    session: Session = Depends(get_session)
):
    return create_assessment_service(session, assessment_in, current_user.id)

@router.post("/{assessment_id}/questions", status_code=status.HTTP_201_CREATED)
def add_question(
    assessment_id: int,
    link_in: QuestionAdd,
    current_user: User = Depends(teacher_only),
    session: Session = Depends(get_session)
):
    add_question_service(
        session, assessment_id, link_in.question_id, link_in.question_order, current_user.id
    )
    return {"status": "added"}

@router.get("/{assessment_id}", response_model=AssessmentDetail)
def get_assessment_details(
    assessment_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    return get_assessment_detail_service(session, assessment_id, current_user.id)

@router.post("/{assessment_id}/questions/create", status_code=status.HTTP_201_CREATED)
def create_and_add_question(
    assessment_id: int,
    question_in: QuestionCreate,
    current_user: User = Depends(teacher_only),
    session: Session = Depends(get_session)
):
    create_question_service(session, assessment_id, question_in, current_user.id)
    return {"status": "created"}

@router.patch("/{assessment_id}/start", response_model=AssessmentRead)
def start_assessment(
    assessment_id: int,
    current_user: User = Depends(teacher_only),
    session: Session = Depends(get_session)
):
    return start_assessment_service(session, assessment_id, current_user.id)

# Student Endpoints

@router.get("/room/{room_id}", response_model=List[AssessmentWithAttempt])
def get_room_assessments(
    room_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    from app.assessments.schemas import AssessmentWithAttempt
    return get_room_assessments_service(session, room_id, current_user.id)

@router.post("/{assessment_id}/attempt", response_model=AttemptRead)
def start_attempt(
    assessment_id: int,
    current_user: User = Depends(student_only),
    session: Session = Depends(get_session)
):
    return start_attempt_service(session, assessment_id, current_user.id)

@router.post("/attempts/{attempt_id}/answer")
def submit_answer(
    attempt_id: int,
    answer_in: AnswerSubmit,
    current_user: User = Depends(student_only),
    session: Session = Depends(get_session)
):
    return submit_answer_service(
        session, attempt_id, answer_in.question_id, answer_in.selected_answer, answer_in.time_taken, current_user.id
    )

@router.post("/attempts/{attempt_id}/submit", response_model=AttemptRead)
def submit_attempt(
    attempt_id: int,
    current_user: User = Depends(student_only),
    session: Session = Depends(get_session)
):
    return submit_attempt_service(session, attempt_id, current_user.id)

@router.get("/attempts/{attempt_id}", response_model=AttemptDetail)
def get_attempt(
    attempt_id: int,
    current_user: User = Depends(student_only),
    session: Session = Depends(get_session)
):
    from app.assessments.service import get_attempt_detail_service
    return get_attempt_detail_service(session, attempt_id, current_user.id)
