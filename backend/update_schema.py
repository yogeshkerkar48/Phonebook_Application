import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")

try:
    cnx = mysql.connector.connect(
        host=DB_HOST,
        port=int(DB_PORT),
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME
    )
    cursor = cnx.cursor()

    # Add unique constraint to phone
    try:
        cursor.execute("ALTER TABLE contacts ADD CONSTRAINT unique_phone UNIQUE (phone)")
        print("[SUCCESS] Added unique constraint to 'phone' column")
    except mysql.connector.Error as err:
        print(f"[INFO] Could not add unique constraint to 'phone': {err}")

    # Add unique constraint to email
    try:
        cursor.execute("ALTER TABLE contacts ADD CONSTRAINT unique_email UNIQUE (email)")
        print("[SUCCESS] Added unique constraint to 'email' column")
    except mysql.connector.Error as err:
        print(f"[INFO] Could not add unique constraint to 'email': {err}")

    cursor.close()
    cnx.close()

except mysql.connector.Error as err:
    print(f"[ERROR] {err}")
