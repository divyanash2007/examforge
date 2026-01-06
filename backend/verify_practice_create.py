import urllib.request
import json
import os
import sys
from datetime import datetime, timedelta
# Use existing imports from app if possible to avoid duplicating auth logic? 
# No, let's just use standalone logic for simplicity and no dependency on app context loading

# Standard imports for JWT
from jose import jwt

SECRET_KEY = "secret"  # Matches backend
ALGORITHM = "HS256"

def create_token(user_id, role):
    expire = datetime.utcnow() + timedelta(minutes=30)
    to_encode = {"sub": str(user_id), "role": role, "exp": expire}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def test_create_practice():
    # 1. Create Student Token (ID 4 verified earlier)
    token = create_token(4, "student")
    
    url = "http://127.0.0.1:8000/assessments/practice"
    # Ensure payload matches frontend: { question_ids: [], title: ... }
    # We need valid question IDs. From previous debug log, we know they exist. 
    # Let's guess 1, 2, 3 or fetch them first? 
    # Let's use get_student_history_questions_service equivalent or just try some IDs (foreign key constraint might fail if invalid)
    # But usually questions 1,2,3 exist.
    
    data = {
        "question_ids": [1], # Assuming question 1 exists
        "title": "Script Verification Practice"
    }
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    req = urllib.request.Request(url, data=json.dumps(data).encode(), headers=headers, method="POST")
    
    print(f"Testing POST {url} with Student Token...")
    try:
        with urllib.request.urlopen(req) as response:
            print(f"Status: {response.status}")
            print(f"Response: {response.read().decode()}")
    except urllib.error.HTTPError as e:
        print(f"HTTPError: {e.code}")
        print(f"Error Response: {e.read().decode()}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_create_practice()
