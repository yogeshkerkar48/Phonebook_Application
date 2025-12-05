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
    cursor.execute("DROP TABLE IF EXISTS contacts")
    print("[SUCCESS] Table 'contacts' dropped successfully.")
    
    cursor.close()
    connection.close()
    
except mysql.connector.Error as err:
    print(f"[ERROR] {err}")
