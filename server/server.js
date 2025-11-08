import "dotenv/config";
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import db from "./db.js";

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const DEBUG_SQL = String(process.env.DEBUG_SQL || "1") === "1";

/* ============================================================
   DB FILE PATH LOG (ważne: czy patrzysz w tę samą bazę?)
============================================================ */
try {
  const dblist = db.prepare("PRAGMA database_list").all();
  // np. [{seq:0, name:'main', file:'/abs/path/to/your.db'}]
  console.log("🗄️  SQLite databases:", dblist);
} catch (e) {
  console.warn("⚠️  Cannot read PRAGMA database_list:", e?.message || e);
}

/* Pomocniczy logger do spójnego formatowania */
function logSQL(label, payload) {
  if (!DEBUG_SQL) return;
  const ts = new Date().toISOString();
  console.log(`🧾 [${ts}] ${label}:`, payload);
}

/* ============================================================
   USERS / AUTH
============================================================ */
const findUser = db.prepare("SELECT * FROM users WHERE username = ?");
// const findUserById = db.prepare("SELECT * FROM users WHERE id = ?"); // nieużywane
const insertUser = db.prepare(
  "INSERT INTO users (username, pin_hash) VALUES (?, ?)"
);

app.post("/api/auth", async (req, res) => {
  try {
    const { username, pin } = req.body || {};
    if (!username || !pin || String(pin).length !== 4) {
      return res.status(400).json({ error: "Podaj username i 4-cyfrowy PIN." });
    }

    const existing = findUser.get(username.trim());
    const pinStr = String(pin);

    if (!existing) {
      const hash = await bcrypt.hash(pinStr, 10);
      insertUser.run(username.trim(), hash);
      const token = jwt.sign({ sub: username.trim() }, JWT_SECRET, {
        expiresIn: "7d",
      });
      return res.json({ ok: true, created: true, token });
    } else {
      const ok = await bcrypt.compare(pinStr, existing.pin_hash);
      if (!ok) return res.status(401).json({ error: "Zły PIN." });
      const token = jwt.sign({ sub: existing.username }, JWT_SECRET, {
        expiresIn: "7d",
      });
      return res.json({ ok: true, created: false, token });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

/* ============================================================
   AUTH helper middleware
============================================================ */
function auth(req, _res, next) {
  const hdr = req.headers.authorization || "";
  const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;
  let username = null;

  if (token) {
    try {
      username = jwt.verify(token, JWT_SECRET)?.sub;
    } catch {}
  }

  // Fallback dla dev
  if (!username && req.headers["x-demo-user"]) {
    username = String(req.headers["x-demo-user"]);
  }

  if (username) {
    const u = findUser.get(username);
    if (u) req.user = { id: u.id, username: u.username };
  }
  next();
}

app.use(auth);

/* ============================================================
   ✅ ACTIVE PLAN (NAPRAWIONE + exercise_id)
============================================================ */
app.post("/api/plans/:id/activate", (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  const id = Number(req.params.id);
  if (!Number.isFinite(id))
    return res.status(400).json({ error: "Invalid plan id" });

  const plan = db
    .prepare("SELECT id, name FROM plans WHERE id=? AND user_id=?")
    .get(id, req.user.id);

  if (!plan) return res.status(404).json({ error: "Plan not found" });

  db.prepare("UPDATE users SET active_plan_id = ? WHERE id = ?").run(
    plan.id,
    req.user.id
  );

  console.log(`✅ Ustawiono aktywny plan: ${plan.name} (ID ${plan.id})`);
  res.json({ ok: true, id: plan.id, name: plan.name });
});

app.get("/api/plans/active", (req, res) => {
  if (!req.user)
    return res.status(401).json({ error: "Unauthorized" });

  const active = db
    .prepare("SELECT active_plan_id FROM users WHERE id = ?")
    .get(req.user.id);

  if (!active || !active.active_plan_id) {
    return res.json(null);
  }

  const plan = db
    .prepare("SELECT id, name FROM plans WHERE id=? AND user_id=?")
    .get(active.active_plan_id, req.user.id);

  if (!plan) {
    return res.json(null);
  }

  const items = db
    .prepare(`
      SELECT pe.id,
             e.id AS exercise_id,
             e.name,
             e.muscle_group,
             pe.sets, pe.reps, pe.day, pe.order_index
      FROM plan_exercises pe
      JOIN exercises e ON e.id = pe.exercise_id
      WHERE pe.plan_id = ?
      ORDER BY pe.day ASC, pe.order_index ASC
    `)
    .all(plan.id);

  const result = {
    id: plan.id,
    name: plan.name,
    items: items.map((it) => ({
      id: it.id,                   // id z plan_exercises
      exercise_id: it.exercise_id, // ważne dla /workouts/sets
      name: it.name,
      muscle_group: it.muscle_group,
      sets: Number(it.sets),
      reps: it.reps,
      day: it.day,
      order_index: it.order_index,
    })),
  };

  res.json(result);
});

/* ============================================================
   EXERCISES
============================================================ */
const listExercises = db.prepare(`
  SELECT id, name, muscle_group AS category FROM exercises ORDER BY name
`);

const addExercise = db.prepare(`
  INSERT INTO exercises(name, muscle_group) VALUES (?, ?)
`);

const patchExercise = db.prepare(`
  UPDATE exercises
  SET name = COALESCE(?, name),
      muscle_group = COALESCE(?, muscle_group)
  WHERE id = ?
`);

app.get("/api/exercises", (_req, res) => {
  res.json(listExercises.all());
});

app.post("/api/exercises", (req, res) => {
  const { name, category } = req.body || {};
  if (!name) return res.status(400).json({ error: "name required" });
  const info = addExercise.run(name.trim(), (category || "other").trim());
  logSQL("INSERT exercises", { id: info.lastInsertRowid, name, category: category || "other" });
  res.json({
    id: info.lastInsertRowid,
    name: name.trim(),
    category: category || "other",
  });
});

app.patch("/api/exercises/:id", (req, res) => {
  const id = Number(req.params.id);
  const { name, category } = req.body || {};
  const info = patchExercise.run(name ?? null, category ?? null, id);
  logSQL("UPDATE exercises", { id, changes: info.changes });
  if (info.changes === 0) return res.status(404).json({ error: "not found" });
  const row = db
    .prepare(
      "SELECT id, name, muscle_group AS category FROM exercises WHERE id=?"
    )
    .get(id);
  res.json(row);
});

/* ============================================================
   EXERCISE DELETE + REF INTEGRITY
============================================================ */
const findPlanRefs = db.prepare(`
  SELECT p.name, pe.id
  FROM plan_exercises pe
  JOIN plans p ON p.id = pe.plan_id
  WHERE pe.exercise_id = ?
`);

const findSessionRefs = db.prepare(`
  SELECT ws.date, s.id
  FROM workout_sets s
  JOIN workout_sessions ws ON ws.id = s.session_id
  WHERE s.exercise_id = ?
`);

const delSessionRefs = db.prepare(`DELETE FROM workout_sets WHERE exercise_id = ?`);
const latestPlanIdByUser = db.prepare(`
  SELECT id FROM plans WHERE user_id=? ORDER BY id DESC LIMIT 1
`);

const delPlanRefs = db.prepare("DELETE FROM plan_exercises WHERE exercise_id = ?");
const delExercise = db.prepare("DELETE FROM exercises WHERE id = ?");

app.delete("/api/exercises/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "bad id" });

  const plans = findPlanRefs.all(id);
  const sessions = findSessionRefs.all(id);
  const hasRefs = plans.length > 0 || sessions.length > 0;
  const force = String(req.query.force || "") === "true";

  if (hasRefs && !force) {
    return res.status(409).json({
      error: "exercise is referenced",
      plans: plans.map((p) => p.name),
      sessions: sessions.map((s) => s.date),
      counts: { plans: plans.length, sessions: sessions.length },
    });
  }

  const tx = db.transaction(() => {
    if (hasRefs) {
      delPlanRefs.run(id);
      delSessionRefs.run(id);
    }
    const info = delExercise.run(id);
    if (info.changes === 0) throw new Error("not found");
    logSQL("DELETE exercises", { id });
  });

  try {
    tx();
    res.json({ ok: true, removedRefs: { plans: plans.length, sessions: sessions.length } });
  } catch (e) {
    if (e.message === "not found") return res.status(404).json({ error: "not found" });
    console.error(e);
    res.status(500).json({ error: "delete failed" });
  }
});

/* ============================================================
   ACCOUNT
============================================================ */
app.get("/api/me", (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  res.json({ username: req.user.username });
});

/* ============================================================
   PLANS
============================================================ */
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

const createPlan = db.prepare("INSERT INTO plans(user_id, name) VALUES(?, ?)");
const addPlanExercise = db.prepare(`
  INSERT INTO plan_exercises(plan_id, exercise_id, day, order_index, sets, reps)
  VALUES(?,?,?,?,?,?)
`);

app.get("/api/plans", (req, res) => {
  if (!req.user) return res.json([]);
  res.json(listPlans.all(req.user.id));
});

app.get("/api/plans/:id", (req, res) => {
  const id = Number(req.params.id);
  const items = getPlanItems.all(id);
  res.json(items);
});

app.post("/api/plans", (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  const { name, items } = req.body || {};
  if (!name) return res.status(400).json({ error: "name required" });

  const txn = db.transaction(() => {
    const info = createPlan.run(req.user.id, name);
    const planId = info.lastInsertRowid;

    (items || []).forEach((it, i) => {
      const day = Number(it.day ?? 1);
      const orderIdx = Number(it.order_index ?? i);
      addPlanExercise.run(
        planId,
        it.exercise_id,
        day,
        orderIdx,
        it.sets || 3,
        it.reps || "8-12"
      );
    });

    logSQL("CREATE plan", { planId, name, items: (items || []).length });
    return planId;
  });

  const planId = txn();
  res.json({ id: planId, name });
});

const delPlanItems = db.prepare("DELETE FROM plan_exercises WHERE plan_id = ?");
const delPlan = db.prepare("DELETE FROM plans WHERE id = ? AND user_id = ?");

app.delete("/api/plans/:id", (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "bad id" });

  const tx = db.transaction(() => {
    delPlanItems.run(id);
    const info = delPlan.run(id, req.user.id);
    if (info.changes === 0) throw new Error("not found");
    logSQL("DELETE plan", { id, userId: req.user.id });
  });

  try {
    tx();
    res.json({ ok: true });
  } catch (e) {
    if (e.message === "not found") return res.status(404).json({ error: "not found" });
    res.status(500).json({ error: "delete failed" });
  }
});

/* ============================================================
   WORKOUTS
============================================================ */
const listWorkoutDays = db.prepare(`
  SELECT date FROM workout_sessions
  WHERE user_id = ? AND date BETWEEN ? AND ?
  ORDER BY date ASC
`);

const upsertSession = db.prepare(`
  INSERT INTO workout_sessions(user_id, date)
  VALUES(?, ?)
  ON CONFLICT(user_id, date) DO NOTHING
`);

const sessionByDate = db.prepare(`
  SELECT * FROM workout_sessions WHERE user_id=? AND date=?
`);

const insertWorkoutSet = db.prepare(`
  INSERT INTO workout_sets(session_id, exercise_id, set_index, weight, reps)
  VALUES(?,?,?,?,?)
  ON CONFLICT(session_id, exercise_id, set_index)
  DO UPDATE SET 
    weight = excluded.weight,
    reps = excluded.reps
`);

// 🔎 HISTORY (proste API do listy sesji) — zostawiamy jak było
const listWorkoutHistory = db.prepare(`
  SELECT ws.id,
         ws.date,
         COUNT(s.id) AS totalSets,
         COALESCE(SUM(COALESCE(s.weight,0) * COALESCE(s.reps,0)),0) AS volume
  FROM workout_sessions ws
  LEFT JOIN workout_sets s ON s.session_id = ws.id
  WHERE ws.user_id = ?
  GROUP BY ws.id
  ORDER BY ws.date DESC
  LIMIT ?
`);

app.get("/api/workouts/days", (req, res) => {
  if (!req.user) return res.json([]);
  const { from, to } = req.query;
  if (!from || !to)
    return res.status(400).json({ error: "from,to required (YYYY-MM-DD)" });

  const rows = listWorkoutDays.all(req.user.id, from, to);
  res.json(rows.map((r) => r.date));
});

app.post("/api/workouts/sessions", (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const { date } = req.body || {};
  if (!date) return res.status(400).json({ error: "date required" });

  const info = upsertSession.run(req.user.id, date);
  if (DEBUG_SQL) {
    logSQL("UPSERT workout_sessions", { userId: req.user.id, date, changes: info.changes });
  }
  const s = sessionByDate.get(req.user.id, date);
  logSQL("SELECT sessionByDate", { userId: req.user.id, date, session: s });
  res.json(s);
});

/* 🧩 NEW: rozpoczęcie treningu (ustawia started_at jeśli puste) */
const markWorkoutStart = db.prepare(`
  UPDATE workout_sessions
  SET started_at = COALESCE(started_at, datetime('now'))
  WHERE id = ? AND started_at IS NULL
`);

/* 🧩 NEW: zakończenie treningu (wylicza duration_sec od started_at do teraz) */
const finishWorkout = db.prepare(`
  UPDATE workout_sessions
  SET duration_sec = CAST((julianday('now') - julianday(started_at)) * 86400 AS INTEGER)
  WHERE id = ? AND started_at IS NOT NULL
`);

app.post("/api/workouts/sessions/start", (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const { date } = req.body || {};
  if (!date) return res.status(400).json({ error: "date required" });

  upsertSession.run(req.user.id, date);
  const s = sessionByDate.get(req.user.id, date);
  if (!s) return res.status(500).json({ error: "session missing" });

  markWorkoutStart.run(s.id);
  const updated = sessionByDate.get(req.user.id, date);

  logSQL("START workout session", { userId: req.user.id, date, started_at: updated.started_at });
  res.json({ ok: true, started_at: updated.started_at });
});

app.post("/api/workouts/sessions/finish", (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const { date } = req.body || {};
  if (!date) return res.status(400).json({ error: "date required" });

  const s = sessionByDate.get(req.user.id, date);
  if (!s) return res.status(404).json({ error: "no session for date" });

  finishWorkout.run(s.id);
  const updated = sessionByDate.get(req.user.id, date);

  logSQL("FINISH workout session", {
    userId: req.user.id,
    date,
    started_at: updated.started_at,
    duration_sec: updated.duration_sec,
  });

  res.json({
    ok: true,
    duration_min: updated.duration_sec ? Math.round(updated.duration_sec / 60) : 0,
  });
});

app.get("/api/workouts/plan/today", (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  const row = latestPlanIdByUser.get(req.user.id);
  if (!row) return res.status(404).json({ error: "no plan for user" });

  const items = getPlanItems.all(row.id);
  const out = items.map((it) => ({
    id: it.id,
    name: it.name,
    sets: Number(it.sets ?? 3),
  }));
  res.json(out);
});

app.post("/api/workouts/sets", (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  const { date, exercise_id, set_index, weight, reps } = req.body || {};
  if (!date || !exercise_id || !set_index) {
    return res.status(400).json({ error: "date, exercise_id, set_index required" });
  }

  // upewnij się, że istnieje sesja
  const up = upsertSession.run(req.user.id, date);
  if (DEBUG_SQL) {
    logSQL("UPSERT workout_sessions (from sets)", { userId: req.user.id, date, changes: up.changes });
  }
  const s = sessionByDate.get(req.user.id, date);
  if (!s) {
    console.error("❌ session create failed after upsert", { userId: req.user.id, date });
    return res.status(500).json({ error: "session create failed" });
  }

  // 🧩 NEW: auto-start przy pierwszym secie jeśli brak started_at
  if (!s.started_at) {
    markWorkoutStart.run(s.id);
    logSQL("AUTO-START workout", { userId: req.user.id, date });
  }

  const info = insertWorkoutSet.run(
    s.id,
    Number(exercise_id),
    Number(set_index),
    weight ?? null,
    reps ?? null
  );

  logSQL("INSERT workout_sets", {
    session_id: s.id,
    exercise_id: Number(exercise_id),
    set_index: Number(set_index),
    weight: weight ?? null,
    reps: reps ?? null,
    lastRowId: info.lastInsertRowid,
    changes: info.changes
  });

  res.json({ ok: true });
});


/* ============================================================
   WORKOUT DETAILS (dla konkretnego dnia)
   + habits + startedAt + duration (bez volume)
============================================================ */
const getWorkoutDetails = db.prepare(`
  SELECT 
    ws.id AS session_id,
    ws.date,
    ws.started_at,
    ws.duration_sec,
    e.id AS exercise_id,
    e.name AS exercise_name,
    e.muscle_group,
    s.set_index,
    s.weight,
    s.reps
  FROM workout_sessions ws
  LEFT JOIN workout_sets s ON ws.id = s.session_id
  LEFT JOIN exercises e ON e.id = s.exercise_id
  WHERE ws.user_id = ? AND ws.date = ?
  ORDER BY e.name, s.set_index
`);

const getHabitsForUser = db.prepare(`
  SELECT id, name, target, unit FROM habits WHERE user_id = ?
`);
const getHabitEntriesForDate = db.prepare(`
  SELECT he.habit_id, he.value
  FROM habit_entries he
  JOIN habits h ON h.id = he.habit_id
  WHERE h.user_id = ? AND he.date = ?
`);

app.get("/api/workouts/details/:date", (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const date = req.params.date;
  const rows = getWorkoutDetails.all(req.user.id, date);
  const session = rows[0] || null;

  const exercises = {};
  for (const r of rows) {
    if (!r.exercise_id) continue;
    if (!exercises[r.exercise_id]) {
      exercises[r.exercise_id] = {
        id: r.exercise_id,
        name: r.exercise_name,
        muscle: r.muscle_group,
        sets: [],
      };
    }
    if (r.set_index != null)
      exercises[r.exercise_id].sets.push({
        setNo: r.set_index,
        weight: r.weight,
        reps: r.reps,
      });
  }

  const habits = getHabitsForUser.all(req.user.id);
  const entries = getHabitEntriesForDate.all(req.user.id, date);
  const entriesMap = {};
  for (const e of entries) entriesMap[e.habit_id] = e.value > 0;

  res.json({
    date,
    startedAt: session?.started_at || null,
    durationMin: Math.round((session?.duration_sec || 0) / 60),
    exercises: Object.values(exercises),
    habits,
    entriesMap,
  });
});


/* ======== STATS (by range) ======== */
const listWorkoutStats = db.prepare(`
  SELECT ws.date,
         COUNT(ws2.id) AS sets,
         SUM(COALESCE(ws2.weight,0) * COALESCE(ws2.reps,0)) AS volume
  FROM workout_sessions ws
  LEFT JOIN workout_sets ws2 ON ws2.session_id = ws.id
  WHERE ws.user_id = ? AND ws.date BETWEEN ? AND ?
  GROUP BY ws.date
  ORDER BY ws.date ASC
`);

app.get("/api/workouts/stats", (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const { from, to } = req.query;
  if (!from || !to)
    return res.status(400).json({ error: "from,to required (YYYY-MM-DD)" });
  const rows = listWorkoutStats.all(req.user.id, from, to);
  res.json(rows);
});

/* ======== HISTORY (lista agregatów) ======== */
app.get("/api/workouts", (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const limit = Math.max(1, Math.min(200, Number(req.query.limit || 50)));
  const rows = listWorkoutHistory.all(req.user.id, limit);
  res.json(rows);
});

/* ======== DEBUG endpoint: zajrzyj w sesję i sety po dacie ======== */
app.get("/api/debug/workouts/:date", (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const date = req.params.date;
  const s = sessionByDate.get(req.user.id, date);
  if (!s) return res.json({ session: null, sets: [] });
  const sets = db.prepare("SELECT * FROM workout_sets WHERE session_id = ? ORDER BY id ASC").all(s.id);
  res.json({ session: s, sets });
});

/* ============================================================
   HABITS
============================================================ */
const listHabits = db.prepare(`
  SELECT id, name, target, unit
  FROM habits
  WHERE user_id=?
  ORDER BY id DESC
`);

const createHabit = db.prepare(`
  INSERT INTO habits(user_id, name, target, unit)
  VALUES(?,?,?,?)
`);

const upsertHabitEntry = db.prepare(`
  INSERT INTO habit_entries(habit_id, date, value)
  VALUES(?,?,?)
  ON CONFLICT(habit_id, date)
  DO UPDATE SET value = excluded.value
`);

app.get("/api/habits", (req, res) => {
  if (!req.user) return res.json([]);
  res.json(listHabits.all(req.user.id));
});

app.post("/api/habits", (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const { name, target, unit } = req.body || {};
  if (!name) return res.status(400).json({ error: "name required" });
  const info = createHabit.run(req.user.id, name, target ?? 1, unit ?? "count");
  logSQL("INSERT habit", { id: info.lastInsertRowid, name, target: target ?? 1, unit: unit ?? "count" });
  res.json({
    id: info.lastInsertRowid,
    name,
    target: target ?? 1,
    unit: unit ?? "count",
  });
});

app.post("/api/habits/:id/entries", (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const habitId = Number(req.params.id);
  const { date, value } = req.body || {};
  if (!date) return res.status(400).json({ error: "date required" });
  const info = upsertHabitEntry.run(habitId, date, Number(value ?? 0));
  logSQL("UPSERT habit_entries", { habitId, date, value: Number(value ?? 0), changes: info.changes });
  res.json({ ok: true });
});

app.get("/api/habits/entries", (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const { from, to } = req.query;

  let sql = `
    SELECT he.habit_id, he.date, he.value
    FROM habit_entries he
    JOIN habits h ON h.id = he.habit_id
    WHERE h.user_id = ?
  `;
  const params = [req.user.id];

  if (from && to) {
    sql += " AND he.date BETWEEN ? AND ?";
    params.push(from, to);
  }

  sql += " ORDER BY he.date ASC";

  try {
    const rows = db.prepare(sql).all(...params);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: "db", detail: String(e) });
  }
});

/* ============================================================
   SERVER START
============================================================ */
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ API running at http://localhost:${PORT}`));
