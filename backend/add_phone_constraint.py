import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "root")
DB_NAME = os.getenv("DB_NAME", "phonebook_db")

try:
    connection = mysql.connector.connect(
        host=DB_HOST,
        port=int(DB_PORT),
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME
    )
    
    cursor = connection.cursor()
    
    # First, remove any duplicate phone numbers for the same user
    print("[INFO] Checking for duplicate phone numbers...")
    cursor.execute("""
        SELECT user_id, phone, COUNT(*) as count 
        FROM contacts 
        GROUP BY user_id, phone 
        HAVING count > 1
    """)
    
    duplicates = cursor.fetchall()
    
    if duplicates:
        print(f"[WARNING] Found {len(duplicates)} duplicate phone number(s)")
        for user_id, phone, count in duplicates:
            print(f"  - User ID {user_id} has {count} contacts with phone {phone}")
            
            # Keep the first contact, delete the rest
            cursor.execute("""
                DELETE FROM contacts 
                WHERE id NOT IN (
                    SELECT * FROM (
                        SELECT MIN(id) 
                        FROM contacts 
                        WHERE user_id = %s AND phone = %s
                    ) as temp
                )
                AND user_id = %s AND phone = %s
            """, (user_id, phone, user_id, phone))
            print(f"  - Removed duplicate contacts for user {user_id}, phone {phone}")
        
        connection.commit()
        print("[SUCCESS] Duplicates removed")
    else:
        print("[INFO] No duplicates found")
    
    # Add the unique constraint
    print("[INFO] Adding unique constraint on (user_id, phone)...")
    try:
        cursor.execute("""
            ALTER TABLE contacts 
            ADD CONSTRAINT uq_user_phone UNIQUE (user_id, phone)
        """)
        connection.commit()
        print("[SUCCESS] Unique constraint added successfully")
    except mysql.connector.Error as err:
        if "Duplicate entry" in str(err):
            print("[ERROR] Cannot add constraint - duplicate entries still exist")
        elif "Duplicate key name" in str(err):
            print("[INFO] Constraint already exists")
        else:
            print(f"[ERROR] {err}")
    
    cursor.close()
    connection.close()
    
except mysql.connector.Error as err:
    print(f"[ERROR] {err}")
