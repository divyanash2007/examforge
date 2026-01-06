from sqlmodel import Session, select
from app.database import get_engine
from app.models.user import User

def check_user(user_id):
    engine = get_engine()
    with Session(engine) as session:
        user = session.get(User, user_id)
        if user:
            print(f"User ID: {user.id}")
            print(f"Name: {user.name}")
            print(f"Role: {user.role}")
        else:
            print(f"User {user_id} not found")

if __name__ == "__main__":
    check_user(4)
