from sqlmodel import Session, select
from app.database import get_engine
from app.models.attempt import Attempt
from app.models.user import User

def debug_attempts():
    engine = get_engine()
    with Session(engine) as session:
        attempts = session.exec(select(Attempt)).all()
        print("--- ATTEMPTS ---")
        for a in attempts:
            user = session.get(User, a.student_id)
            print(f"Attempt ID: {a.id}, Assessment ID: {a.assessment_id}, Student ID: {a.student_id} ({user.name if user else 'Unknown'}), Submitted: {a.submitted_at}")

if __name__ == "__main__":
    debug_attempts()
