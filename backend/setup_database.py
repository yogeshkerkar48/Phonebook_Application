import mysql.connector
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "root")
DB_NAME = os.getenv("DB_NAME", "phonebook_db")

try:
    # Connect to MySQL server (without specifying database)
    connection = mysql.connector.connect(
        host=DB_HOST,
        port=int(DB_PORT),
        user=DB_USER,
        password=DB_PASSWORD
    )
    
    cursor = connection.cursor()
    
    # Create database if it doesn't exist
    cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME}")
    print(f"[SUCCESS] Database '{DB_NAME}' created successfully (or already exists)")
    
    cursor.close()
    connection.close()
    
    print("\n[SUCCESS] Database setup complete!")
    print(f"You can now run the application with: python main.py")
    
except mysql.connector.Error as err:
    print(f"[ERROR] {err}")
    print("\nPlease ensure:")
    print("1. MySQL server is running")
    print(f"2. User '{DB_USER}' has permission to create databases")
    print(f"3. The credentials in .env file are correct")
