// server/server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import db from './db.js';

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

// --- USERS / AUTH (jak wcześniej) ---
const findUser = db.prepare('SELECT * FROM users WHERE username = ?');
const findUserById = db.prepare('SELECT * FROM users WHERE id = ?');
const insertUser = db.prepare('INSERT INTO users (username, pin_hash) VALUES (?, ?)');

app.post('/api/auth', async (req, res) => {
  try {
    const { username, pin } = req.body || {};
    if (!username || !pin || String(pin).length !== 4) {
      return res.status(400).json({ error: 'Podaj username i 4-cyfrowy PIN.' });
    }
    const existing = findUser.get(username.trim());
    const pinStr = String(pin);
    if (!existing) {
      const hash = await bcrypt.hash(pinStr, 10);
      insertUser.run(username.trim(), hash);
      const token = jwt.sign({ sub: username.trim() }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ ok: true, created: true, token });
    } else {
      const ok = await bcrypt.compare(pinStr, existing.pin_hash);
      if (!ok) return res.status(401).json({ error: 'Zły PIN.' });
      const token = jwt.sign({ sub: existing.username }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ ok: true, created: false, token });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- AUTH helper ---
function auth(req, _res, next) {
  const hdr = req.headers.authorization || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
  let username = null;
  if (token) {
    try { username = jwt.verify(token, JWT_SECRET)?.sub; } catch {}
  }
  // Fallback dla dev: można podać nagłówek x-demo-user: myuser
  if (!username && req.headers['x-demo-user']) {
    username = String(req.headers['x-demo-user']);
  }
  if (username) {
    const u = findUser.get(username);
    if (u) req.user = { id: u.id, username: u.username };
  }
  next();
}
app.use(auth);

// --- EXERCISES ---
const listExercises = db.prepare(`
  SELECT id, name, muscle_group AS category
  FROM exercises
  ORDER BY name
`);
const addExercise = db.prepare(`
  INSERT INTO exercises(name, muscle_group) VALUES (?, ?)
`);
const patchExercise = db.prepare(`
  UPDATE exercises SET
    name = COALESCE(?, name),
    muscle_group = COALESCE(?, muscle_group)
  WHERE id = ?
`);

app.get('/api/exercises', (_req, res) => {
  res.json(listExercises.all());
});

app.post('/api/exercises', (req, res) => {
  const { name, category } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name required' });
  const info = addExercise.run(name.trim(), (category || 'other').trim());
  res.json({ id: info.lastInsertRowid, name: name.trim(), category: category || 'other' });
});

app.patch('/api/exercises/:id', (req, res) => {
  const id = Number(req.params.id);
  const { name, category } = req.body || {};
  const info = patchExercise.run(name ?? null, category ?? null, id);
  if (info.changes === 0) return res.status(404).json({ error: 'not found' });
  const row = db.prepare(`SELECT id, name, muscle_group AS category FROM exercises WHERE id=?`).get(id);
  res.json(row);
});

const findPlanRefs = db.prepare(`
  SELECT p.name, pe.id
  FROM plan_exercises pe
  JOIN plans p ON p.id = pe.plan_id
  WHERE pe.exercise_id = ?
`);
const findSessionRefs = db.prepare(`
  SELECT ws.date, se.id
  FROM workout_session_exercises se
  JOIN workout_sessions ws ON ws.id = se.session_id
  WHERE se.exercise_id = ?
`);

const latestPlanIdByUser = db.prepare(`
  SELECT id FROM plans WHERE user_id=? ORDER BY id DESC LIMIT 1
`);

const delPlanRefs    = db.prepare(`DELETE FROM plan_exercises WHERE exercise_id = ?`);
const delSessionRefs = db.prepare(`DELETE FROM workout_session_exercises WHERE exercise_id = ?`);
const delExercise    = db.prepare(`DELETE FROM exercises WHERE id = ?`);

app.delete('/api/exercises/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'bad id' });

  const plans = findPlanRefs.all(id);
  const sessions = findSessionRefs.all(id);

  const hasRefs = plans.length > 0 || sessions.length > 0;
  const force = String(req.query.force || '') === 'true';

  if (hasRefs && !force) {
    return res.status(409).json({
      error: 'exercise is referenced',
      plans: plans.map(p => p.name),
      sessions: sessions.map(s => s.date),
      counts: { plans: plans.length, sessions: sessions.length }
    });
  }

  const tx = db.transaction(() => {
    if (hasRefs) {
      delPlanRefs.run(id);
      delSessionRefs.run(id);
    }
    const info = delExercise.run(id);
    if (info.changes === 0) throw new Error('not found');
  });

  try {
    tx();
    res.json({ ok: true, removedRefs: { plans: plans.length, sessions: sessions.length } });
  } catch (e) {
    if (e.message === 'not found') return res.status(404).json({ error: 'not found' });
    console.error(e);
    res.status(500).json({ error: 'delete failed' });
  }
});

// ACCOUNT
app.get('/api/me', (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  res.json({ username: req.user.username });
});


// --- PLANS ---
const listPlans = db.prepare(`
  SELECT p.id, p.name
  FROM plans p
  WHERE p.user_id = ?
  ORDER BY p.id DESC
`);
const getPlanItems = db.prepare(`
  SELECT pe.id, e.name, e.muscle_group, pe.sets, pe.reps, pe.order_index, pe.day
  FROM plan_exercises pe
  JOIN exercises e ON e.id = pe.exercise_id
  WHERE pe.plan_id = ?
  ORDER BY pe.day ASC, pe.order_index ASC
`);
const createPlan = db.prepare('INSERT INTO plans(user_id, name) VALUES(?, ?)');
const addPlanExercise = db.prepare(`
  INSERT INTO plan_exercises(plan_id, exercise_id, day, order_index, sets, reps)
  VALUES(?,?,?,?,?,?)
`);

app.get('/api/plans', (req, res) => {
  if (!req.user) return res.json([]); // pusto dla niezalogowanych
  const rows = listPlans.all(req.user.id);
  res.json(rows);
});

app.get('/api/plans/:id', (req, res) => {
  const id = Number(req.params.id);
  const items = getPlanItems.all(id);
  res.json(items);
});

app.post('/api/plans', (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const { name, items } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name required' });

  const txn = db.transaction(() => {
    const info = createPlan.run(req.user.id, name);
    const planId = info.lastInsertRowid;

    (items || []).forEach((it, i) => {
      const day = Number(it.day ?? 1);                // << dzień ćwiczenia
      const orderIdx = Number(it.order_index ?? i);   // << kolejność w dniu

      addPlanExercise.run(
        planId,
        it.exercise_id,
        day,
        orderIdx,
        it.sets || 3,
        it.reps || '8-12'
      );
    });

    return planId;
  });

  const planId = txn();
  res.json({ id: planId, name });
});

const delPlanItems = db.prepare('DELETE FROM plan_exercises WHERE plan_id = ?');
const delPlan      = db.prepare('DELETE FROM plans WHERE id = ? AND user_id = ?');

app.delete('/api/plans/:id', (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'bad id' });
  const tx = db.transaction(() => {
    delPlanItems.run(id);
    const info = delPlan.run(id, req.user.id);
    if (info.changes === 0) throw new Error('not found');
  });
  try {
    tx();
    res.json({ ok: true });
  } catch (e) {
    if (e.message === 'not found') return res.status(404).json({ error: 'not found' });
    res.status(500).json({ error: 'delete failed' });
  }
});

// --- WORKOUTS (dni i sesje) ---
const listWorkoutDays = db.prepare(`
  SELECT date FROM workout_sessions
  WHERE user_id = ? AND date BETWEEN ? AND ?
  ORDER BY date ASC
`);
const upsertSession = db.prepare(`
  INSERT INTO workout_sessions(user_id, date) VALUES(?,?)
  ON CONFLICT(user_id,date) DO NOTHING
`);
const sessionByDate = db.prepare(`
  SELECT * FROM workout_sessions WHERE user_id=? AND date=?
`);

const insertWorkoutSet = db.prepare(`
  INSERT INTO workout_sets(session_id, exercise_id, set_index, weight, reps)
  VALUES(?,?,?,?,?)
`);

app.get('/api/workouts/days', (req, res) => {
  if (!req.user) return res.json([]);
  const { from, to } = req.query;
  if (!from || !to) return res.status(400).json({ error: 'from,to required (YYYY-MM-DD)' });
  const rows = listWorkoutDays.all(req.user.id, from, to);
  res.json(rows.map(r => r.date));
});

app.post('/api/workouts/sessions', (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { date } = req.body || {};
  if (!date) return res.status(400).json({ error: 'date required' });
  upsertSession.run(req.user.id, date);
  const s = sessionByDate.get(req.user.id, date);
  res.json(s);
});

// Plan na dziś: zwraca najnowszy plan użytkownika
app.get('/api/workouts/plan/today', (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const row = latestPlanIdByUser.get(req.user.id);
  if (!row) return res.status(404).json({ error: 'no plan for user' });

  const items = getPlanItems.all(row.id);
  // Normalizacja: [{id,name,sets}]
  const out = items.map(it => ({
    id: it.id,          // <-- exercises.id
    name: it.name,
    sets: Number(it.sets ?? 3)
  }));
  res.json(out);
});

// Zapis pojedynczej serii
app.post('/api/workouts/sets', (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const { date, exercise_id, set_index, weight, reps } = req.body || {};
  if (!date || !exercise_id || !set_index) {
    return res.status(400).json({ error: 'date, exercise_id, set_index required' });
  }

  // Upewnij się, że sesja istnieje
  upsertSession.run(req.user.id, date);
  const s = sessionByDate.get(req.user.id, date);
  if (!s) return res.status(500).json({ error: 'session create failed' });

  insertWorkoutSet.run(s.id, Number(exercise_id), Number(set_index), weight ?? null, reps ?? null);
  res.json({ ok: true });
});

// --- HABITS ---
const listHabits = db.prepare('SELECT id,name,target,unit FROM habits WHERE user_id=? ORDER BY id DESC');
const createHabit = db.prepare('INSERT INTO habits(user_id,name,target,unit) VALUES(?,?,?,?)');
const upsertHabitEntry = db.prepare(`
  INSERT INTO habit_entries(habit_id,date,value) VALUES(?,?,?)
  ON CONFLICT(habit_id,date) DO UPDATE SET value=excluded.value
`);
const listHabitEntries = db.prepare(`
  SELECT h.id as habit_id, h.name, h.target, h.unit, e.date, e.value
  FROM habits h
  LEFT JOIN habit_entries e ON e.habit_id = h.id AND e.date BETWEEN ? AND ?
  WHERE h.user_id = ?
  ORDER BY h.id DESC, e.date ASC
`);

app.get('/api/habits', (req, res) => {
  if (!req.user) return res.json([]);
  res.json(listHabits.all(req.user.id));
});

app.post('/api/habits', (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { name, target, unit } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name required' });
  const info = createHabit.run(req.user.id, name, target ?? 1, unit ?? 'count');
  res.json({ id: info.lastInsertRowid, name, target: target ?? 1, unit: unit ?? 'count' });
});


app.post('/api/habits/:id/entries', (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const habitId = Number(req.params.id);
  const { date, value } = req.body || {};
  if (!date) return res.status(400).json({ error: 'date required' });
  upsertHabitEntry.run(habitId, date, Number(value ?? 0));
  res.json({ ok: true });
});


app.get('/api/habits/entries', (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const { from, to } = req.query;

  let sql = `
    SELECT he.habit_id, he.date, he.value
    FROM habit_entries he
    JOIN habits h ON h.id = he.habit_id
    WHERE h.user_id = ?
  `;
  const params = [req.user.id];

  if (from && to) {
    sql += ` AND he.date BETWEEN ? AND ?`;
    params.push(from, to);
  }
  sql += ` ORDER BY he.date ASC`;

  try {
    const rows = db.prepare(sql).all(...params);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'db', detail: String(e) });
  }
});

// server/server.js (dopisz nad PORT)
const listWorkoutStats = db.prepare(`
  SELECT ws.date,
         COUNT(ws2.id)               AS sets,
         SUM(COALESCE(ws2.weight,0) * COALESCE(ws2.reps,0)) AS volume
  FROM workout_sessions ws
  LEFT JOIN workout_sets ws2 ON ws2.session_id = ws.id
  WHERE ws.user_id = ? AND ws.date BETWEEN ? AND ?
  GROUP BY ws.date
  ORDER BY ws.date ASC
`);

app.get('/api/workouts/stats', (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { from, to } = req.query;
  if (!from || !to) return res.status(400).json({ error: 'from,to required (YYYY-MM-DD)' });
  const rows = listWorkoutStats.all(req.user.id, from, to);
  // -> [{ date:'2025-11-01', sets: 12, volume: 9375 }, ...]
  res.json(rows);
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API http://localhost:${PORT}`));
