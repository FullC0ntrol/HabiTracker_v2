import { apiClient } from "../../../shared/api/client";

/** Pomocniczo: lokalne YYYY-MM-DD */
function toISODateLocal(d = new Date()) {
  const dt = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return dt.toISOString().slice(0, 10);
}

export const workoutService = {
  // ====== PLANY ======
  async getTodayPlan() {
    try {
      console.log("[workoutService] → GET /api/plans/active");
      const plan = await apiClient.get("/api/plans/active");
      if (!plan || (Array.isArray(plan) && plan.length === 0)) {
        console.log("[workoutService] ← Brak aktywnego planu (pusta odpowiedź).");
        return null;
      }
      // Oczekujemy, że items zawiera exercise_id (patrz patch backendu niżej)
      return plan;
    } catch (err) {
      console.error("❌ Błąd pobierania aktywnego planu:", err);
      throw err;
    }
  },

  async getWorkoutDetails(date) {
    try {
      const res = await apiClient.get(`/api/workouts/details/${date}`);
      return res;
    } catch (err) {
      console.error("❌ Błąd getWorkoutDetails:", err);
      return { exercises: [] };
    }
  },

  // ====== SESJE (po dacie) ======
  async startOrGetSession(date = toISODateLocal()) {
    console.log("[workoutService] → POST /api/workouts/sessions", { date });
    const res = await apiClient.post("/api/workouts/sessions", { date });
    console.log("[workoutService] ← sessions:", res);
    return res; // { id, user_id, date, started_at, ... }
  },

  async finishSession({ date, duration_sec, total_sets, completed_sets }) {
    try {
      console.log("[workoutService] → POST /api/workouts/sessions/finish", {
        date,
        duration_sec,
        total_sets,
        completed_sets,
      });
      const res = await apiClient.post("/api/workouts/sessions/finish", {
        date,
        duration_sec,
        total_sets,
        completed_sets,
      });
      console.log("[workoutService] ← finishSession:", res);
      return res;
    } catch (err) {
      console.error("❌ Błąd finishSession:", err);
      return { ok: false };
    }
  },

  async addSet({ date, exercise_id, set_index, weight, reps }) {
    try {
      console.log("[workoutService] → POST /api/workouts/sets", {
        date,
        exercise_id,
        set_index,
        weight,
        reps,
      });
      const res = await apiClient.post("/api/workouts/sets", {
        date,
        exercise_id,
        set_index,
        weight,
        reps,
      });
      console.log("[workoutService] ← addSet:", res);
      return res;
    } catch (err) {
      console.error("❌ Błąd addSet:", err);
      return { ok: false };
    }
  },

  async getHistory({ limit = 50 } = {}) {
    try {
      console.log("[workoutService] → GET /api/workouts?limit=", limit);
      const res = await apiClient.get(`/api/workouts?limit=${limit}`);
      // shape: [{ id, date, totalSets, volume, duration_sec? }]
      return Array.isArray(res) ? res : [];
    } catch (err) {
      console.error("❌ Błąd getHistory:", err);
      return [];
    }
  },

  async getStats({ from, to }) {
    if (!from || !to) throw new Error("from,to required");
    return apiClient.get(`/api/workouts/stats?from=${from}&to=${to}`);
  },

  // ====== Legacy (NIE używać; zostawiam aby nie psuć importów gdzieś indziej) ======
  async submitSet() {
    console.warn("[workoutService] LEGACY submitSet wyłączony – użyj addSet()");
    return { ok: false };
  },
  async finishWorkout() {
    console.warn(
      "[workoutService] LEGACY finishWorkout wyłączony – użyj sessions/finish (finishSession())."
    );
    return { ok: false };
  },
  toISODateLocal,
};
