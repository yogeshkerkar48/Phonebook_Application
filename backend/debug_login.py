from database import SessionLocal
import models
import auth

db = SessionLocal()
email = "2125A0415@gmail.com"
user = db.query(models.User).filter(models.User.email == email).first()

if user:
    print(f"User found: ID={user.id}, Email={user.email}")
    print(f"Hashed Password: {user.hashed_password}")
    # You can verify a password if you know what it should be, e.g. "password123"
    # match = auth.verify_password("password123", user.hashed_password)
    # print(f"Matches 'password123': {match}")
else:
    print("User NOT found in database.")
db.close()
