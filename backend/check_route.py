import requests

def check_route():
    # URL that was failing
    url = "http://127.0.0.1:8000/reports/attempts/2/report"
    print(f"Checking {url}...")
    try:
        # No token = Expect 401
        res = requests.get(url)
        print(f"Status Code: {res.status_code}")
        if res.status_code == 404:
            print("FAIL: STILL 404 Not Found")
        elif res.status_code == 401:
            print("SUCCESS: Route exists (Unauthorized)")
        else:
            print(f"Result: {res.status_code}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_route()
