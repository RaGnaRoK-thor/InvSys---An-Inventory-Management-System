import sqlite3
import os

# Define the path for the database file
DATABASE = 'backend/inventory.db'

def get_db_connection():
    """Establishes a connection to the SQLite database."""
    # Ensure the 'backend' directory exists
    os.makedirs(os.path.dirname(DATABASE), exist_ok=True)
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row  # This allows accessing columns by name
    return conn

def init_db():
    """Initializes the database by creating necessary tables."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Create users table for authentication
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    ''')

    # Create suppliers table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS suppliers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            contact_person TEXT,
            phone TEXT,
            email TEXT
        )
    ''')

    # Create categories table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            description TEXT
        )
    ''')

    # Create products table with new currency_code and safe_stock columns
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            description TEXT,
            price REAL NOT NULL,
            currency_code TEXT NOT NULL DEFAULT 'USD',
            stock INTEGER NOT NULL,
            safe_stock INTEGER NOT NULL DEFAULT 100, -- New column for safe stock
            category_id INTEGER,
            supplier_id INTEGER,
            FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
            FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
        )
    ''')

    conn.commit()
    conn.close()

if __name__ == '__main__':
    # Initialize the database when this script is run directly
    init_db()
    print(f"Database initialized at {DATABASE}")

