from typing import List
from sqlmodel import Session, select, func, col
from fastapi import HTTPException

from app.models.assessment import Assessment, AssessmentQuestion
from app.models.attempt import Attempt, AttemptAnswer
from app.models.question import Question
from app.analytics.schemas import AssessmentAnalyticsSummary, QuestionAnalytics, OptionAnalytics

def get_assessment_summary_service(session: Session, assessment_id: int, user_id: int) -> AssessmentAnalyticsSummary:
    # 1. Verify access (must be creator of assessment)
    assessment = session.get(Assessment, assessment_id)
    if not assessment or assessment.created_by != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to view analytics")

    # 2. Aggregate Queries
    # Filter only submitted attempts
    query = select(
        func.count(Attempt.id),
        func.avg(Attempt.score),
        func.max(Attempt.score),
        func.min(Attempt.score)
    ).where(
        Attempt.assessment_id == assessment_id,
        Attempt.submitted_at != None
    )
    
    result = session.exec(query).first()
    
    count, avg, max_score, min_score = result
    
    return AssessmentAnalyticsSummary(
        total_attempts=count or 0,
        average_score=float(avg) if avg else 0.0,
        highest_score=float(max_score) if max_score else 0.0,
        lowest_score=float(min_score) if min_score else 0.0
    )

def get_assessment_questions_analytics_service(session: Session, assessment_id: int, user_id: int) -> List[QuestionAnalytics]:
    # 1. Verify access
    assessment = session.get(Assessment, assessment_id)
    if not assessment or assessment.created_by != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to view analytics")

    # 2. Get all questions in order
    links = session.exec(
        select(AssessmentQuestion).where(AssessmentQuestion.assessment_id == assessment_id).order_by(AssessmentQuestion.question_order)
    ).all()
    
    results = []
    
    for link in links:
        question = session.get(Question, link.question_id)
        if not question:
            continue
            
        # Get answer distribution for this question within this assessment's attempts
        # Note: We must join with Attempt to ensure we only count answers from *this* assessment's attempts
        # (Though currently AttemptAnswer links to Attempt which links to Assessment, so filtering by Attempt's assessment_id is key)
        
        # Count selections per option
        # We can do this in python for simplicity if dataset is small, or SQL.
        # Let's do a SQL Group By for efficiency.
        
        answer_counts = session.exec(
            select(AttemptAnswer.selected_answer, func.count(AttemptAnswer.id))
            .join(Attempt)
            .where(
                Attempt.assessment_id == assessment_id,
                AttemptAnswer.question_id == question.id,
                Attempt.submitted_at != None # Only count submitted attempts
            )
            .group_by(AttemptAnswer.selected_answer)
        ).all()
        
        # Convert to dict for lookup
        counts_map = {ans: count for ans, count in answer_counts}
        
        option_analytics = []
        for opt in question.options:
            option_analytics.append(OptionAnalytics(
                option_text=opt,
                selected_count=counts_map.get(opt, 0),
                is_correct=(opt == question.correct_answer)
            ))
            
        results.append(QuestionAnalytics(
            question_id=question.id,
            question_text=question.question_text,
            options=option_analytics
        ))
        
    return results
