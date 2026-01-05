from datetime import datetime
from typing import List
from sqlmodel import Session, select
from fastapi import HTTPException

from app.models.assessment import Assessment, AssessmentQuestion
from app.models.attempt import Attempt
from app.models.user import User
from app.monitor.schemas import StudentMonitorItem

def get_assessment_monitor_service(session: Session, assessment_id: int, user_id: int) -> List[StudentMonitorItem]:
    # 1. Verify access (must be creator)
    assessment = session.get(Assessment, assessment_id)
    if not assessment or assessment.created_by != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to monitor this assessment")

    # 2. Calculate Total Duration
    # Helper to count questions
    question_count = session.exec(
        select(AssessmentQuestion).where(AssessmentQuestion.assessment_id == assessment_id)
    ).all()
    num_questions = len(question_count)
    time_per_question = assessment.time_per_question or 0
    total_duration_seconds = time_per_question * num_questions

    print(f"DEBUG: Monitoring Assessment ID: {assessment_id}")
    
    # 3. Fetch all attempts with student info
    # CRITICAL: Select ALL attempts (in_progress + submitted) for this assessment
    # Do NOT filter by status in the query.
    print(f"DEBUG: Monitoring Assessment ID: {assessment_id}")
    
    query = select(Attempt, User).join(User, Attempt.student_id == User.id).where(Attempt.assessment_id == assessment_id)
    
    results = session.exec(query).all()
    print(f"DEBUG: Found {len(results)} attempts")

    monitor_items = []
    now = datetime.utcnow()

    for attempt, student in results:
        # Determine status based on submitted_at (READ-ONLY)
        status = "submitted" if attempt.submitted_at else "in_progress"
        remaining = None
        
        if status == "in_progress":
            # Calculate remaining time dynamically
            elapsed = (now - attempt.started_at).total_seconds()
            # Prevent negative remaining time, but do NOT auto-submit here (Read-Only)
            remaining = max(0, int(total_duration_seconds - elapsed))
        
        monitor_items.append(StudentMonitorItem(
            student_id=student.id,
            student_name=student.name,
            status=status,
            started_at=attempt.started_at,
            remaining_time_seconds=remaining
        ))
        
    return monitor_items
