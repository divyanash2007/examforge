from sqlmodel import Session
from app.database import get_engine
from app.models.attempt import Attempt

def check_2():
    engine = get_engine()
    with Session(engine) as session:
        attempt = session.get(Attempt, 2)
        if attempt:
            print(f"FOUND: ID={attempt.id}, StudentID={attempt.student_id}")
        else:
            print("NOT FOUND")

if __name__ == "__main__":
    check_2()
