import sqlite3

DB_NAME = "surplus.db"


def get_db():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()

    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL
        )
    """)

    conn.execute("""
        CREATE TABLE IF NOT EXISTS donations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            donor_id INTEGER,
            food_name TEXT NOT NULL,
            quantity REAL NOT NULL,
            location TEXT NOT NULL,
            expiry_time TEXT NOT NULL,
            status TEXT DEFAULT 'Posted',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(donor_id) REFERENCES users(id)
        )
    """)

    conn.execute("""
        CREATE TABLE IF NOT EXISTS matches (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            donation_id INTEGER NOT NULL,
            ngo_id INTEGER,
            driver_id INTEGER,
            recipient_name TEXT,
            status TEXT DEFAULT 'Matched',
            FOREIGN KEY(donation_id) REFERENCES donations(id)
        )
    """)

    conn.execute("""
        CREATE TABLE IF NOT EXISTS deliveries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            match_id INTEGER NOT NULL,
            pickup_status TEXT DEFAULT 'Pending',
            delivery_status TEXT DEFAULT 'Pending',
            FOREIGN KEY(match_id) REFERENCES matches(id)
        )
    """)

    conn.commit()
    conn.close()