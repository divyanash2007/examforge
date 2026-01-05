from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlmodel import Session, select
from typing import Optional

from app.database import get_engine
from app.models.user import User, UserRole
from app.auth.service import SECRET_KEY, ALGORITHM
from app.auth.schemas import TokenData

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_session():
    with Session(get_engine()) as session:
        yield session

def get_current_user(token: str = Depends(oauth2_scheme), session: Session = Depends(get_session)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # print(f"DEBUG AUTH: verifying token {token[:10]}...")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        role: str = payload.get("role")
        if user_id is None or role is None:
            print("DEBUG AUTH: user_id or role missing in payload")
            raise credentials_exception
        token_data = TokenData(user_id=user_id, role=role)
    except JWTError as e:
        print(f"DEBUG AUTH: JWTError: {e}")
        raise credentials_exception
    
    user = session.get(User, token_data.user_id)
    if user is None:
        print(f"DEBUG AUTH: User {token_data.user_id} not found in DB")
        raise credentials_exception
    return user

def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    # In the future, check if user is active (e.g. email verified)
    return current_user

def teacher_only(current_user: User = Depends(get_current_active_user)) -> User:
    if current_user.role != UserRole.TEACHER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this resource"
        )
    return current_user

def student_only(current_user: User = Depends(get_current_active_user)) -> User:
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this resource"
        )
    return current_user
