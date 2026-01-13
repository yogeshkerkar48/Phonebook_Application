import mysql.connector
from mysql.connector import errorcode
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")

try:
    # Connect to MySQL server
    cnx = mysql.connector.connect(
        host=DB_HOST,
        port=int(DB_PORT),
        user=DB_USER,
        password=DB_PASSWORD
    )
    cursor = cnx.cursor()

    # Create database if it doesn't exist
    try:
        cursor.execute(f"CREATE DATABASE {DB_NAME}")
        print(f"[SUCCESS] Database '{DB_NAME}' created successfully")
    except mysql.connector.Error as err:
        if err.errno == errorcode.ER_DB_CREATE_EXISTS:
            print(f"[SUCCESS] Database '{DB_NAME}' already exists")
        else:
            print(f"[ERROR] Failed to create database: {err}")
            exit(1)

    cursor.close()
    cnx.close()

    print("\n[SUCCESS] Database setup complete!")
    print(f"You can now run the application with: python main.py")

except mysql.connector.Error as err:
    if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
        print("[ERROR] Something is wrong with your user name or password")
    elif err.errno == errorcode.ER_BAD_DB_ERROR:
        print("[ERROR] Database does not exist")
    else:
        print(f"[ERROR] {err}")
    
    print("\nPlease ensure:")
    print("1. MySQL server is running")
    print(f"2. User '{DB_USER}' has permission to create databases")
    print(f"3. The credentials in .env file are correct")
