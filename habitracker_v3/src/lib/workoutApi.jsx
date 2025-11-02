// /src/lib/workoutApi.js
import { apiGet, apiPost, apiDelete } from "./api";
import { toISO } from "../utils/dateUtils";

/* -------------------------------------------------------------------------- */
/*  USTAW TO POD SWÓJ BACKEND                                                 */
/* -------------------------------------------------------------------------- */
// Przykłady:
// - jeśli masz GET /api/plan/today → PLAN_BASE = "/api/plan", PLAN_MODE="today"
// - jeśli masz GET /api/plan?date=YYYY-MM-DD → PLAN_BASE = "/api/plan", PLAN_MODE="query"
// - jeśli masz GET /api/plan/YYYY-MM-DD → PLAN_BASE = "/api/plan", PLAN_MODE="param"
const PLAN_BASE  = "/api/workouts/plan"; // <-- teraz masz taki endpoint
const PLAN_MODE  = "today";              // używamy /today
// DATE_PARAM niepotrzebny w trybie "today"

const DATE_PARAM = "date";      // używane tylko przy "query" (np. "date")

/* -------------------------------------------------------------------------- */
/*  POMOCNICZE                                                                 */
/* -------------------------------------------------------------------------- */
function buildPlanPathForToday() {
  const dateISO = toISO(new Date());
  if (PLAN_MODE === "today")  return `${PLAN_BASE}/today`;
  if (PLAN_MODE === "query")  return `${PLAN_BASE}?${DATE_PARAM}=${encodeURIComponent(dateISO)}`;
  if (PLAN_MODE === "param")  return `${PLAN_BASE}/${dateISO}`;
  // fallback — ale najlepiej nie używać
  return `${PLAN_BASE}/today`;
}

function normalizePlan(raw) {
  if (!raw) return [];
  // już gotowy format
  if (Array.isArray(raw) && raw.length && raw[0].id && raw[0].name && raw[0].sets !== undefined) return raw;
  // { exercises: [...] }
  if (raw.exercises && Array.isArray(raw.exercises)) {
    return raw.exercises.map((e, i) => ({
      id: e.id ?? String(e.name ?? i),
      name: e.name ?? `Ćwiczenie ${i + 1}`,
      sets: e.sets ?? (Array.isArray(e.series) ? e.series.length : 4),
    }));
  }
  // { plan: [...] }
  if (raw.plan && Array.isArray(raw.plan)) {
    return raw.plan.map((e, i) => ({
      id: e.id ?? String(e.name ?? i),
      name: e.name ?? `Ćwiczenie ${i + 1}`,
      sets: e.sets ?? 4,
    }));
  }
  // ["Przysiad", "Martwy", ...]
  if (Array.isArray(raw) && raw.length && typeof raw[0] === "string") {
    return raw.map((name, i) => ({ id: String(i), name, sets: 4 }));
  }
  return Array.isArray(raw) ? raw : [];
}

/* -------------------------------------------------------------------------- */
/*  API: PLAN DZIŚ                                                            */
/* -------------------------------------------------------------------------- */
export async function fetchTodayPlan() {
  const path = buildPlanPathForToday();
  // console.log("[fetchTodayPlan] GET", path); // debug
  const data = await apiGet(path);
  const plan = normalizePlan(data);
  if (!plan.length) {
    const err = new Error("Plan endpoint zwrócił pusty wynik.");
    err.code = "EMPTY_PLAN";
    throw err;
  }
  return plan;
}

/* -------------------------------------------------------------------------- */
/*  API: SESJA I SERIE                                                        */
/* -------------------------------------------------------------------------- */

// Idempotentne oznaczenie dzisiejszej sesji (POST)
export async function ensureTodaySession(dateISO) {
  try {
    await apiPost("/api/workouts/sessions", { date: dateISO });
    return true;
  } catch {
    return false;
  }
}

// Zapis pojedynczej serii
export async function saveSet({ dateISO, exerciseId, setIndex, weight, reps }) {
  try {
    await apiPost("/api/workouts/sets", {
      date: dateISO,
      exercise_id: exerciseId,
      set_index: setIndex,
      weight,
      reps,
    });
    return true;
  } catch {
    return false;
  }
}

// (opcjonalnie) Usuwanie serii – jeśli kiedyś będzie potrzebne
export async function deleteSet({ dateISO, exerciseId, setIndex }) {
  try {
    await apiDelete("/api/workouts/sets", {
      date: dateISO,
      exercise_id: exerciseId,
      set_index: setIndex,
    });
    return true;
  } catch {
    return false;
  }
}
