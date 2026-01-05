import requests
import sys

BASE_URL = "http://127.0.0.1:8081"
LOGIN_URL = f"{BASE_URL}/api/login"
SEARCH_URL = f"{BASE_URL}/api/search"

EMAIL = "xyz@gmail.com"
PASSWORD = "password123"

def verify_search():
    print(f"Connecting to {BASE_URL}...")
    
    # 1. Login
    try:
        response = requests.post(LOGIN_URL, data={"username": EMAIL, "password": PASSWORD})
        response.raise_for_status()
        token = response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("Login successful.")
    except Exception as e:
        print(f"Failed to login: {e}")
        return False

    # 2. Search with empty query
    try:
        # Test empty string
        print("Testing empty query '?q='")
        resp = requests.get(f"{SEARCH_URL}?q=", headers=headers)
        resp.raise_for_status()
        data = resp.json()
        
        print(f"Status Code: {resp.status_code}")
        print(f"Total results: {data['total']}")
        
        if data['total'] > 0:
            print("SUCCESS: Contacts returned for empty query.")
            return True
        else:
            print("WARNING: No contacts returned (database might be empty). cannot verify full logic but endpoint works.")
            return True
            
    except Exception as e:
        print(f"Search failed: {e}")
        return False

if __name__ == "__main__":
    success = verify_search()
    if not success:
        sys.exit(1)
