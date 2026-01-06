import requests

def check_options():
    url = "http://127.0.0.1:8000/assessments/practice/questions"
    print(f"Checking {url}...")
    try:
        # Check allowed methods
        res = requests.options(url)
        print(f"OPTIONS Status: {res.status_code}")
        print(f"Allow Header: {res.headers.get('allow')}")
        
        # Try GET
        res_get = requests.get(url)
        print(f"GET Status: {res_get.status_code}")
        
        # Try POST (empty body)
        res_post = requests.post(url, json={})
        print(f"POST Status: {res_post.status_code}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_options()
