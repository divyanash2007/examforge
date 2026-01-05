from typing import List, Dict, Any
from fastapi import HTTPException, status
from sqlmodel import Session, select, func, desc

from app.models.assessment import Assessment, AssessmentType, AssessmentQuestion
from app.models.attempt import Attempt, AttemptAnswer
from app.models.question import Question
from app.models.user import User
from app.models.class_room import Room
from app.reports.schemas import (
    Leaderboard, LeaderboardEntry, AttemptReport, QuestionReport, AssessmentReport, StudentSummary
)

def get_leaderboard_service(session: Session, assessment_id: int) -> Leaderboard:
    assessment = session.get(Assessment, assessment_id)
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    # Fetch all submitted attempts
    statement = select(Attempt, User).join(User).where(
        Attempt.assessment_id == assessment_id,
        Attempt.submitted_at != None
    ).order_by(desc(Attempt.score), Attempt.submitted_at)
    
    results = session.exec(statement).all()
    
    entries = []
    for rank, (attempt, user) in enumerate(results, start=1):
        # Calculate time taken? For now just use score and submitted order
        time_taken = 0 # Placeholder if not strictly tracking total time
        if attempt.submitted_at and attempt.started_at:
             time_taken = int((attempt.submitted_at - attempt.started_at).total_seconds())

        entries.append(LeaderboardEntry(
            rank=rank,
            student_name=user.name,
            score=attempt.score,
            time_taken=time_taken
        ))
    
    return Leaderboard(
        assessment_id=assessment_id,
        title=assessment.title,
        entries=entries
    )

def get_attempt_report_service(session: Session, attempt_id: int, user_id: int) -> AttemptReport:
    attempt = session.get(Attempt, attempt_id)
    if not attempt or attempt.student_id != user_id:
        raise HTTPException(status_code=404, detail="Attempt not found")
    
    # Get answers
    statement = select(AttemptAnswer, Question).join(Question).where(
        AttemptAnswer.attempt_id == attempt_id
    )
    results = session.exec(statement).all()
    
    questions_report = []
    for answer, question in results:
        questions_report.append(QuestionReport(
            question_text=question.question_text,
            selected_answer=answer.selected_answer,
            correct_answer=question.correct_answer,
            is_correct=answer.is_correct,
            time_taken=answer.time_taken
        ))
    
    # Calculate Rank
    # Reuse leaderboard logic or lightweight query
    rank = None
    leaderboard = get_leaderboard_service(session, attempt.assessment_id)
    for entry in leaderboard.entries:
        if entry.student_name == session.get(User, user_id).name: # Name match might be risky if non-unique, ideally compare IDs but leaderboard schema uses name
             # Let's verify we can get rank reliably. 
             # Actually, simpler:
             pass
    
    # Let's fix rank search by ID if possible, or just re-query count of better scores
    better_scores = session.exec(
        select(func.count(Attempt.id)).where(
            Attempt.assessment_id == attempt.assessment_id,
            Attempt.submitted_at != None,
            Attempt.score > attempt.score
        )
    ).one()
    # Tie breaking by time? simpler to just rank by score for report
    rank = better_scores + 1

    return AttemptReport(
        attempt_id=attempt_id,
        score=attempt.score,
        rank=rank,
        questions=questions_report
    )

def get_assessment_report_service(session: Session, assessment_id: int, user_id: int) -> AssessmentReport:
    assessment = session.get(Assessment, assessment_id)
    if not assessment:
         raise HTTPException(status_code=404, detail="Assessment not found")
    
    # Verify teacher ownership via room
    room = session.get(Room, assessment.room_id)
    if not room or room.teacher_id != user_id:
         raise HTTPException(status_code=403, detail="Not authorized")

    attempts = session.exec(
        select(Attempt, User).join(User).where(
             Attempt.assessment_id == assessment_id,
             Attempt.submitted_at != None
        )
    ).all()

    student_summaries = []
    scores = []
    
    for attempt, user in attempts:
        scores.append(attempt.score)
        student_summaries.append(StudentSummary(
            student_id=user.id,
            student_name=user.name,
            score=attempt.score,
            status="Completed"
        ))
    
    if not scores:
        return AssessmentReport(
            assessment_id=assessment_id,
            title=assessment.title,
            average_score=0.0,
            highest_score=0.0,
            lowest_score=0.0,
            students=[]
        )
        
    return AssessmentReport(
        assessment_id=assessment_id,
        title=assessment.title,
        average_score=sum(scores) / len(scores),
        highest_score=max(scores),
        lowest_score=min(scores),
        students=student_summaries
    )
