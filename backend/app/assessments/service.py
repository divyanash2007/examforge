from datetime import datetime
from typing import List, Optional
from fastapi import HTTPException, status
from sqlmodel import Session, select, and_

from app.models.assessment import Assessment, AssessmentQuestion, AssessmentStatus, AssessmentType
from app.models.attempt import Attempt, AttemptAnswer
from app.models.question import Question
from app.models.class_room import Room, RoomMember
from app.assessments.schemas import AssessmentCreate, AssessmentRead, QuestionCreate, AssessmentDetail, QuestionRead, AssessmentWithAttempt

def create_assessment_service(session: Session, assessment_in: AssessmentCreate, user_id: int) -> Assessment:
    # Verify room ownership
    room = session.get(Room, assessment_in.room_id)
    if not room or room.teacher_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create assessment for this room"
        )
    
    assessment = Assessment(
        **assessment_in.dict(),
        created_by=user_id,
        status=AssessmentStatus.DRAFT
    )
    session.add(assessment)
    session.commit()
    session.refresh(assessment)
    return assessment

def add_question_service(session: Session, assessment_id: int, question_id: int, order: int, user_id: int):
    assessment = session.get(Assessment, assessment_id)
    if not assessment or assessment.created_by != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if assessment.status != AssessmentStatus.DRAFT:
        raise HTTPException(status_code=400, detail="Cannot modify live/closed assessment")
    
    # Verify question exists
    question = session.get(Question, question_id)
    if not question:
         raise HTTPException(status_code=404, detail="Question not found")
         
    link = AssessmentQuestion(
        assessment_id=assessment_id,
        question_id=question_id,
        question_order=order
    )
    session.commit()
    return link

def create_question_service(session: Session, assessment_id: int, question_in: QuestionCreate, user_id: int):
    assessment = session.get(Assessment, assessment_id)
    if not assessment or assessment.created_by != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if assessment.status != AssessmentStatus.DRAFT:
         raise HTTPException(status_code=400, detail="Cannot modify live/closed assessment")
    
    # Create Question
    # Note: Using JSON for options as per Question model
    question = Question(
        question_text=question_in.question_text,
        options=question_in.options,
        correct_answer=question_in.correct_option,
        created_by=user_id
    )
    session.add(question)
    session.commit()
    session.refresh(question)
    
    # Link
    link = AssessmentQuestion(
        assessment_id=assessment_id,
        question_id=question.id,
        question_order=question_in.question_order
    )
    session.add(link)
    session.commit()
    return question

def get_assessment_detail_service(session: Session, assessment_id: int, user_id: int) -> AssessmentDetail:
    assessment = session.get(Assessment, assessment_id)
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    # Check access (Teacher owns it, or Student in room?)
    if assessment.created_by != user_id:
         # Check membership
        member = session.exec(
            select(RoomMember).where(
                RoomMember.room_id == assessment.room_id,
                RoomMember.student_id == user_id,
                RoomMember.left_at == None
            )
        ).first()
        if not member:
             raise HTTPException(status_code=403, detail="Not authorized")

    # Get questions
    links = session.exec(
        select(AssessmentQuestion).where(AssessmentQuestion.assessment_id == assessment_id).order_by(AssessmentQuestion.question_order)
    ).all()
    
    questions = []
    for link in links:
        q = session.get(Question, link.question_id)
        if q:
            questions.append(QuestionRead(
                id=q.id,
                question_text=q.question_text,
                options=q.options,
                correct_answer=q.correct_answer
            ))
            
    return AssessmentDetail(
        **assessment.dict(),
        questions=questions
    )

def start_assessment_service(session: Session, assessment_id: int, user_id: int):
    assessment = session.get(Assessment, assessment_id)
    if not assessment or assessment.created_by != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if assessment.status != AssessmentStatus.DRAFT:
        raise HTTPException(status_code=400, detail="Assessment must be in DRAFT to start")

    assessment.status = AssessmentStatus.LIVE
    assessment.start_time = datetime.utcnow()
    session.add(assessment)
    session.commit()
    session.refresh(assessment)
    return assessment

def get_room_assessments_service(session: Session, room_id: int, user_id: int) -> List[Assessment]:
    # Check if teacher
    room = session.get(Room, room_id)
    if room and room.teacher_id == user_id:
        # Teacher: Return all assessments
        statement = select(Assessment).where(Assessment.room_id == room_id)
        assessments = session.exec(statement).all()
        return [AssessmentWithAttempt(**a.dict(), is_submitted=False) for a in assessments]

    # Check membership (Student)
    member = session.exec(
        select(RoomMember).where(
            RoomMember.room_id == room_id,
            RoomMember.student_id == user_id,
            RoomMember.left_at == None
        )
    ).first()
    if not member:
         raise HTTPException(status_code=403, detail="Not a member of this room")
    
    # Student: Return non-draft (unless we want to hide future homeworks?)
    # Requirement said "Show Live tests, Pending homework, Completed assessments"
    # So basically everything except DRAFT?
    statement = select(Assessment).where(
        Assessment.room_id == room_id,
        Assessment.status == AssessmentStatus.LIVE
    )
    assessments = session.exec(statement).all()
    results = []
    
    # Check if student has submitted
    for assessment in assessments:
        # Check attempts
        attempt = session.exec(
            select(Attempt).where(
                Attempt.assessment_id == assessment.id,
                Attempt.student_id == user_id
            )
        ).first()
        
        is_submitted = (attempt is not None and attempt.submitted_at is not None)
        
        results.append(AssessmentWithAttempt(
            **assessment.dict(),
            is_submitted=is_submitted
        ))
        
    return results

def start_attempt_service(session: Session, assessment_id: int, user_id: int) -> Attempt:
    assessment = session.get(Assessment, assessment_id)
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    if assessment.status != AssessmentStatus.LIVE:
         raise HTTPException(status_code=400, detail="Assessment is not live")

    # Check time window for homework
    if assessment.type == AssessmentType.HOMEWORK:
        now = datetime.utcnow()
        if assessment.start_time and now < assessment.start_time:
             raise HTTPException(status_code=400, detail="Assessment not started yet")
        if assessment.end_time and now > assessment.end_time:
             raise HTTPException(status_code=400, detail="Assessment expired")

    # Check if existing attempt
    existing = session.exec(
        select(Attempt).where(
            Attempt.assessment_id == assessment_id,
            Attempt.student_id == user_id
        )
    ).first()
    if existing:
         if existing.submitted_at:
             raise HTTPException(status_code=403, detail="Assessment already submitted")
         return existing
    
    attempt = Attempt(
        assessment_id=assessment_id,
        student_id=user_id,
        started_at=datetime.utcnow()
    )
    session.add(attempt)
    session.commit()
    session.refresh(attempt)
    return attempt

def submit_answer_service(session: Session, attempt_id: int, question_id: int, answer: str, time: int, user_id: int):
    attempt = session.get(Attempt, attempt_id)
    if not attempt or attempt.student_id != user_id:
        raise HTTPException(status_code=404, detail="Attempt not found")
    if attempt.submitted_at:
        raise HTTPException(status_code=400, detail="Attempt already submitted")

    # Determine correctness
    question = session.get(Question, question_id)
    if not question:
         raise HTTPException(status_code=404, detail="Question not found")
    
    is_correct = (answer == question.correct_answer)
    
    # Check if answer exists (update) or create
    existing_answer = session.exec(
        select(AttemptAnswer).where(
            AttemptAnswer.attempt_id == attempt_id,
            AttemptAnswer.question_id == question_id
        )
    ).first()
    
    if existing_answer:
        existing_answer.selected_answer = answer
        existing_answer.time_taken = time
        existing_answer.is_correct = is_correct
        session.add(existing_answer)
    else:
        new_answer = AttemptAnswer(
            attempt_id=attempt_id,
            question_id=question_id,
            selected_answer=answer,
            time_taken=time,
            is_correct=is_correct
        )
        session.add(new_answer)
    
    session.commit()
    return {"status": "recorded", "is_correct": is_correct} # Maybe hide correctness?

def submit_attempt_service(session: Session, attempt_id: int, user_id: int):
    attempt = session.get(Attempt, attempt_id)
    if not attempt or attempt.student_id != user_id:
        raise HTTPException(status_code=404, detail="Attempt not found")
    if attempt.submitted_at:
        raise HTTPException(status_code=403, detail="Attempt already submitted")
    
    # Calculate score
    answers = session.exec(
        select(AttemptAnswer).where(AttemptAnswer.attempt_id == attempt_id)
    ).all()
    
    correct_count = sum(1 for a in answers if a.is_correct)
    total_questions = len(answers) 
    # NOTE: Ideally total questions should count from AssessmentQuestion linkage to account for unanswered ones.
    # For now, simplistic score based on answers derived.
    
    attempt.score = float(correct_count) # Raw score or percentage? Let's do raw count for now.
    attempt.submitted_at = datetime.utcnow()
    session.add(attempt)
    session.commit()
    session.refresh(attempt)
    return attempt
