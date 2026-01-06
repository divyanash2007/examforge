from sqlmodel import Session
from app.database import get_engine
from app.assessments.service import get_room_assessments_service
from app.models.assessment import Assessment

def debug_room_logic():
    engine = get_engine()
    with Session(engine) as session:
        # First find room for Assessment 3 (Attempt 2's assessment)
        assessment = session.get(Assessment, 3)
        if not assessment:
            print("Assessment 3 NOT FOUND")
            return
        
        room_id = assessment.room_id
        print(f"Assessment 3 is in Room {room_id}")

        print("\n--- Checking Room Assessments for User 19 ---")
        try:
            results = get_room_assessments_service(session, room_id, 19)
            for res in results:
                print(f"Assessment {res.id}: Submitted={res.is_submitted}, AttemptID={res.attempt_id}")
                if res.attempt_id == 2:
                    print("CRITICAL: Found Attempt 2 for User 19! Service logic is returning wrong data.")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    debug_room_logic()
