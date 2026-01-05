from sqlmodel import SQLModel, create_engine

DATABASE_URL = "postgresql://postgres:divyansh@localhost:5432/gamified_classroom"

engine = create_engine(
    DATABASE_URL,
    echo=True  # dev ke liye true
)

def get_engine():
    return engine
