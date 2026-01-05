from typing import List
from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from app.database import get_engine
from app.models.user import User
from app.auth.dependencies import get_current_user, teacher_only, student_only
from app.rooms.schemas import RoomCreate, RoomRead, RoomJoinRequest
from app.rooms.service import (
    create_room_service,
    join_room_service,
    leave_room_service,
    get_teacher_rooms_service,
    get_student_rooms_service
)

router = APIRouter(prefix="/rooms", tags=["rooms"])

def get_session():
    with Session(get_engine()) as session:
        yield session

@router.post("", response_model=RoomRead, status_code=status.HTTP_201_CREATED)
def create_room(
    room_in: RoomCreate,
    current_user: User = Depends(teacher_only),
    session: Session = Depends(get_session)
):
    return create_room_service(session, room_in.name, current_user.id)

@router.get("/my", response_model=List[RoomRead])
def get_my_rooms_teacher(
    current_user: User = Depends(teacher_only),
    session: Session = Depends(get_session)
):
    return get_teacher_rooms_service(session, current_user.id)

@router.post("/join", response_model=RoomRead)
def join_room(
    join_req: RoomJoinRequest,
    current_user: User = Depends(student_only),
    session: Session = Depends(get_session)
):
    return join_room_service(session, join_req.code, current_user.id)

@router.get("/joined", response_model=List[RoomRead])
def get_joined_rooms_student(
    current_user: User = Depends(student_only),
    session: Session = Depends(get_session)
):
    return get_student_rooms_service(session, current_user.id)

@router.post("/{room_id}/leave", status_code=status.HTTP_204_NO_CONTENT)
def leave_room(
    room_id: int,
    current_user: User = Depends(student_only),
    session: Session = Depends(get_session)
):
    leave_room_service(session, room_id, current_user.id)
