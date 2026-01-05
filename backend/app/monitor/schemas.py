from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel

class StudentMonitorItem(SQLModel):
    student_id: int
    student_name: str
    status: str # "in_progress" or "submitted"
    started_at: datetime
    remaining_time_seconds: Optional[int] = None
