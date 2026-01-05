import requests
import random
import string
import time

# Configuration
BASE_URL = "http://127.0.0.1:8000"  # Adjust if your backend runs on a different port (e.g., 8081 via nginx)
LOGIN_URL = f"{BASE_URL}/api/login"
CREATE_CONTACT_URL = f"{BASE_URL}/api/contacts/"

# User Credentials (Change these to your account credentials)
EMAIL = "asd@gmail.com"
PASSWORD = "password123"  # Ensure this matches your registered password

def generate_random_string(length=10):
    return ''.join(random.choices(string.ascii_letters, k=length))

def generate_phone():
    # Generate a random 10-digit number (ensure it starts with 6-9 to look real)
    first = random.choice("6789")
    remaining = ''.join(random.choices(string.digits, k=9))
    return first + remaining

def generate_contact():
    name = generate_random_string(8).capitalize() + " " + generate_random_string(6).capitalize()
    return {
        "name": name,
        "phone": generate_phone(),
        "email": f"{name.replace(' ', '.').lower()}@example.com",
        "address": f"{random.randint(1, 999)} {generate_random_string(10)} St, City"
    }

def seed_contacts(count=10):
    print(f"Connecting to {BASE_URL}...")
    
    # 1. Login to get access token
    try:
        response = requests.post(LOGIN_URL, data={"username": EMAIL, "password": PASSWORD})
        if response.status_code == 401:
             # Try with the other password if known, or prompt
             print(f"Login failed for {EMAIL}. Please check credentials in the script.")
             return
        response.raise_for_status()
        token = response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("Login successful! Starting to add contacts...")
    except Exception as e:
        print(f"Failed to login: {e}")
        return

    # 2. Add Contacts
    success_count = 0
    for i in range(count):
        contact_data = generate_contact()
        try:
            resp = requests.post(CREATE_CONTACT_URL, json=contact_data, headers=headers)
            if resp.status_code == 201:
                print(f"[{i+1}/{count}] Added: {contact_data['name']}")
                success_count += 1
            else:
                print(f"[{i+1}/{count}] Failed: {resp.text}")
        except Exception as e:
            print(f"[{i+1}/{count}] Error: {e}")
            
    print(f"\nCompleted! Successfully added {success_count} contacts.")

if __name__ == "__main__":
    # You might need to install requests: pip install requests
    seed_contacts(10)
