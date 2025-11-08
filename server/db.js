// server/db.js
import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";

const DB_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

const dbPath = path.join(DB_DIR, "habittracker.sqlite");
const db = new Database(dbPath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ---------------------- SCHEMA ----------------------
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  pin_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  active_plan_id INTEGER,
  FOREIGN KEY(active_plan_id) REFERENCES plans(id)
);

CREATE TABLE IF NOT EXISTS exercises (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  muscle_group TEXT NOT NULL DEFAULT 'General'
);

CREATE TABLE IF NOT EXISTS plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS plan_exercises (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plan_id INTEGER NOT NULL,
  exercise_id INTEGER NOT NULL,
  day INTEGER NOT NULL DEFAULT 1,
  order_index INTEGER NOT NULL DEFAULT 0,
  sets INTEGER NOT NULL DEFAULT 3,
  reps TEXT NOT NULL DEFAULT '8-12',
  FOREIGN KEY(plan_id) REFERENCES plans(id),
  FOREIGN KEY(exercise_id) REFERENCES exercises(id)
);

CREATE TABLE IF NOT EXISTS workout_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  plan_id INTEGER,
  day INTEGER,
  date TEXT NOT NULL,
  duration_sec INTEGER DEFAULT 0,
  total_sets INTEGER DEFAULT 0,
  completed_sets INTEGER DEFAULT 0,
  started_at TEXT,                        -- 🕓 nowa kolumna
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(user_id, date),
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(plan_id) REFERENCES plans(id)
);

CREATE TABLE IF NOT EXISTS workout_sets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  exercise_id INTEGER NOT NULL,
  set_index INTEGER NOT NULL,
  weight REAL,
  reps INTEGER,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(session_id, exercise_id, set_index),
  FOREIGN KEY(session_id) REFERENCES workout_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY(exercise_id) REFERENCES exercises(id)
);

CREATE TABLE IF NOT EXISTS habits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  target INTEGER NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'count',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS habit_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  habit_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  value INTEGER NOT NULL DEFAULT 0,
  UNIQUE(habit_id, date),
  FOREIGN KEY(habit_id) REFERENCES habits(id)
);

CREATE INDEX IF NOT EXISTS idx_plan_exercises_plan_day
  ON plan_exercises(plan_id, day, order_index);

CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_date
  ON workout_sessions(user_id, date);

CREATE INDEX IF NOT EXISTS idx_workout_sets_session_exercise
  ON workout_sets(session_id, exercise_id);
`);

// ---------------------- SEED ----------------------
try {
  const countEx = db.prepare("SELECT COUNT(*) AS c FROM exercises").get().c;
  if (countEx === 0) {
    const insert = db.prepare(
      "INSERT INTO exercises(name, muscle_group) VALUES (?, ?)"
    );
    const seed = [
      ["Wyciskanie na ławce poziomej", "klatka"],
      ["Przysiad ze sztangą", "nogi"],
      ["Martwy ciąg", "plecy"],
      ["Wyciskanie nad głowę (OHP)", "barki"],
      ["Wiosłowanie sztangą", "plecy"],
      ["Podciąganie na drążku", "plecy"],
      ["Pompki na poręczach (Dipy)", "klatka"],
      ["Unoszenie ramion bokiem", "barki"],
    ];
    const tx = db.transaction(() => seed.forEach((row) => insert.run(...row)));
    tx();
    console.log("✅ Seed exercises OK");
  }
} catch (err) {
  console.error("❌ Seed failed:", err);
}

export default db;
