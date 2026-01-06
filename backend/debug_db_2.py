from sqlmodel import Session, select
from app.database import get_engine
from app.models.attempt import Attempt
from app.models.user import User

def debug_attempt_2():
    engine = get_engine()
    with Session(engine) as session:
        attempt = session.get(Attempt, 2)
        if attempt:
            user = session.get(User, attempt.student_id)
            print(f"FOUND Attempt 2: Student ID={attempt.student_id} ({user.name if user else 'Unknown'}), Assessment ID={attempt.assessment_id}")
        else:
            print("Attempt 2 NOT FOUND in database.")

        # Also list all users to see who is who
        users = session.exec(select(User)).all()
        print("--- USERS ---")
        for u in users:
            print(f"ID: {u.id}, Name: {u.name}, Email: {u.email}")

if __name__ == "__main__":
    debug_attempt_2()
