import sqlite3


DB_PATH = "/www/wwwroot/pingbackend/ping_db.sqlite"


def main() -> None:
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    statements = [
        "ALTER TABLE classes ADD COLUMN description TEXT",
        "ALTER TABLE users ADD COLUMN school TEXT",
        "ALTER TABLE users ADD COLUMN course TEXT",
        "ALTER TABLE users ADD COLUMN bio TEXT",
        "ALTER TABLE users ADD COLUMN avatar TEXT",
        "ALTER TABLE modules ADD COLUMN subject_id INTEGER",
        "ALTER TABLE modules ADD COLUMN cover_image_url TEXT",
        "CREATE TABLE IF NOT EXISTS subjects (id INTEGER PRIMARY KEY AUTOINCREMENT, key TEXT UNIQUE NOT NULL, name TEXT NOT NULL, is_active BOOLEAN DEFAULT 1, sort_order INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME)",
        "CREATE TABLE IF NOT EXISTS user_module_completions (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL REFERENCES users(id), module_id TEXT NOT NULL, completed_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, last_session_id TEXT, UNIQUE(user_id, module_id))",
        "CREATE INDEX IF NOT EXISTS idx_user_module_completions_user_id ON user_module_completions(user_id)",
        "CREATE INDEX IF NOT EXISTS idx_user_module_completions_module_id ON user_module_completions(module_id)",
    ]

    for statement in statements:
        try:
            cur.execute(statement)
        except sqlite3.OperationalError as exc:
            if "duplicate column name" not in str(exc):
                raise

    conn.commit()
    conn.close()
    print("sqlite schema patched")


if __name__ == "__main__":
    main()
