import random
import string
from fastapi import HTTPException, status
from sqlmodel import Session, select
from datetime import datetime

from app.models.class_room import Room, RoomMember
from app.models.user import User

def generate_unique_code(session: Session, length: int = 6) -> str:
    while True:
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))
        statement = select(Room).where(Room.code == code)
        if not session.exec(statement).first():
            return code

def create_room_service(session: Session, name: str, teacher_id: int) -> Room:
    code = generate_unique_code(session)
    room = Room(name=name, code=code, teacher_id=teacher_id)
    session.add(room)
    session.commit()
    session.refresh(room)
    return room

def join_room_service(session: Session, code: str, student_id: int) -> Room:
    # Find room
    statement = select(Room).where(Room.code == code)
    room = session.exec(statement).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )
    
    # Check if already member
    statement = select(RoomMember).where(
        RoomMember.room_id == room.id,
        RoomMember.student_id == student_id,
        RoomMember.left_at == None
    )
    existing_member = session.exec(statement).first()
    if existing_member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already a member of this room"
        )
    
    # Join room
    member = RoomMember(room_id=room.id, student_id=student_id)
    session.add(member)
    session.commit()
    return room

def leave_room_service(session: Session, room_id: int, student_id: int):
    statement = select(RoomMember).where(
        RoomMember.room_id == room_id,
        RoomMember.student_id == student_id,
        RoomMember.left_at == None
    )
    member = session.exec(statement).first()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Not a member of this room"
        )
    
    member.left_at = datetime.utcnow()
    session.add(member)
    session.commit()

def get_teacher_rooms_service(session: Session, teacher_id: int):
    statement = select(Room).where(Room.teacher_id == teacher_id)
    return session.exec(statement).all()

def get_student_rooms_service(session: Session, student_id: int):
    # Join RoomMember and Room to get details
    statement = select(Room).join(RoomMember).where(
        RoomMember.student_id == student_id,
        RoomMember.left_at == None
    )
    return session.exec(statement).all()
