import os, sqlite3
DB_PATH = os.getenv("DB_PATH", "ai_agent.db")

def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_conn(); cur = conn.cursor()
    cur.executescript("""
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      jwt_hash TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      goal_text TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS challenges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      challenge_text TEXT,
      difficulty TEXT,
      category TEXT,
      xp_reward INTEGER,
      time_to_complete TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      challenge_id INTEGER,
      completion_percentage INTEGER DEFAULT 0,
      streak_count INTEGER DEFAULT 0,
      last_activity DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)
    conn.commit(); conn.close()

def set_goal(user_id: str, goal_text: str):
    conn = get_conn(); cur = conn.cursor()
    cur.execute("INSERT INTO goals(user_id, goal_text) VALUES(?, ?)", (user_id, goal_text))
    conn.commit(); conn.close()

def get_latest_goal(user_id: str):
    conn = get_conn(); cur = conn.cursor()
    cur.execute("SELECT goal_text, status, created_at FROM goals WHERE user_id=? ORDER BY id DESC LIMIT 1", (user_id,))
    row = cur.fetchone(); conn.close()
    return dict(row) if row else None

def save_challenge(user_id: str, challenge: dict):
    conn = get_conn(); cur = conn.cursor()
    cur.execute("""
      INSERT INTO challenges(user_id, challenge_text, difficulty, category, xp_reward, time_to_complete)
      VALUES(?, ?, ?, ?, ?, ?)
    """, (
        user_id,
        challenge.get("challenge"),
        challenge.get("difficulty"),
        challenge.get("category"),
        challenge.get("xp_reward"),
        challenge.get("time_to_complete"),
    ))
    conn.commit(); conn.close()