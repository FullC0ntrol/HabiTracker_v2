// server/db.js
import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';

const DB_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

const dbPath = path.join(DB_DIR, 'habittracker.sqlite');
const db = new Database(dbPath);

// Pragma
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ---------------------- SCHEMAT: CREATE TABLES ----------------------
db.exec(`
CREATE TABLE IF NOT EXISTS users(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  pin_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS exercises(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  muscle_group TEXT NOT NULL DEFAULT 'General'
);

CREATE TABLE IF NOT EXISTS plans(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(user_id) REFERENCES users(id)
);

/* Uwaga: ta tabela MUSI mieć kolumnę 'day' */
CREATE TABLE IF NOT EXISTS plan_exercises(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plan_id INTEGER NOT NULL,
  exercise_id INTEGER NOT NULL,
  day INTEGER NOT NULL DEFAULT 1,          -- dzien planu (1..N)
  order_index INTEGER NOT NULL DEFAULT 0,  -- kolejnosc w obrębie dnia
  sets INTEGER NOT NULL DEFAULT 3,
  reps TEXT NOT NULL DEFAULT '8-12',
  FOREIGN KEY(plan_id) REFERENCES plans(id),
  FOREIGN KEY(exercise_id) REFERENCES exercises(id)
);

CREATE TABLE IF NOT EXISTS workout_sessions(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  date TEXT NOT NULL,                      -- YYYY-MM-DD
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, date),
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS workout_session_exercises(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  exercise_id INTEGER NOT NULL,
  sets INTEGER NOT NULL DEFAULT 3,
  reps TEXT NOT NULL DEFAULT '8-12',
  weight REAL,
  FOREIGN KEY(session_id) REFERENCES workout_sessions(id),
  FOREIGN KEY(exercise_id) REFERENCES exercises(id)
);

CREATE TABLE IF NOT EXISTS habits(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  target INTEGER NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'count',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS habit_entries(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  habit_id INTEGER NOT NULL,
  date TEXT NOT NULL,                      -- YYYY-MM-DD
  value INTEGER NOT NULL DEFAULT 0,
  UNIQUE(habit_id, date),
  FOREIGN KEY(habit_id) REFERENCES habits(id)
);

CREATE TABLE IF NOT EXISTS workout_sets(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  exercise_id INTEGER NOT NULL,
  set_index INTEGER NOT NULL,              -- 1,2,3,...
  weight REAL,
  reps INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(session_id) REFERENCES workout_sessions(id),
  FOREIGN KEY(exercise_id) REFERENCES exercises(id)
);
`);

// ---------------------- MIGRACJE: DODAJ 'day' JEŚLI BRAKUJE ----------------------
try {
  const cols = db.prepare(`PRAGMA table_info('plan_exercises');`).all();
  const hasDay = cols.some(c => c.name === 'day');
  if (!hasDay) {
    db.exec(`ALTER TABLE plan_exercises ADD COLUMN day INTEGER NOT NULL DEFAULT 1;`);
    // Opcjonalnie indeks pod zapytania ORDER BY day, order_index:
    db.exec(`CREATE INDEX IF NOT EXISTS idx_plan_exercises_plan_day ON plan_exercises(plan_id, day, order_index);`);
  }
} catch (e) {
  console.error('Migration (add day to plan_exercises) failed:', e);
}

// Indeksy pomocnicze
db.exec(`
CREATE INDEX IF NOT EXISTS idx_plan_exercises_plan_day ON plan_exercises(plan_id, day, order_index);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_date ON workout_sessions(user_id, date);
`);

// ---------------------- SEED DANYCH ----------------------
try {
  const countEx = db.prepare('SELECT COUNT(*) AS c FROM exercises').get().c;
  if (countEx === 0) {
    const seed = db.prepare('INSERT INTO exercises(name, muscle_group) VALUES (?,?)');
    const batch = db.transaction((rows) => rows.forEach(r => seed.run(...r)));
    batch([
      ['Bench Press','Chest'],
      ['Squat','Legs'],
      ['Deadlift','Back'],
      ['Overhead Press','Shoulders'],
      ['Barbell Row','Back'],
      ['Pull-up','Back'],
      ['Dip','Chest/Triceps'],
      ['Lateral Raise','Shoulders']
    ]);
  }
} catch (e) {
  console.error('Seed failed:', e);
}

export default db;
