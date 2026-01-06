import urllib.request
import urllib.error
import json
from jose import jwt
import datetime

# Configuration
SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7" # Matches backend
ALGORITHM = "HS256"
URL = "http://127.0.0.1:8000/assessments/practice/questions"

def create_token(user_id, role):
    payload = {
        "sub": str(user_id),
        "role": role,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=30)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def verify():
    # Attempt 1: Valid Student
    token = create_token(user_id=4, role="student")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Empty body
    data = json.dumps({}).encode('utf-8')
    
    req = urllib.request.Request(URL, data=data, headers=headers, method='POST')
    
    print(f"Testing POST {URL} with Student Token...")
    try:
        with urllib.request.urlopen(req) as response:
            print(f"Status: {response.status}")
            print(f"Response: {response.read().decode('utf-8')[:200]}")
    except urllib.error.HTTPError as e:
        print(f"HTTPError: {e.code}")
        print(f"Error Response: {e.read().decode('utf-8')}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    verify()
