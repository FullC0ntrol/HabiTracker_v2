import { apiClient } from "../../../shared/api/client";

export const workoutService = {
  async getTodayPlan() {
    try {
      console.log("[workoutService] → GET /api/plans/active");
      const plan = await apiClient.get("/api/plans/active");
      
      // DODANA LOGIKA: Jeśli API zwraca pustą tablicę lub coś innego niż obiekt, 
      // zakładamy, że planu nie ma i zwracamy null.
      if (!plan || Array.isArray(plan) && plan.length === 0) {
        console.log("[workoutService] ← Brak aktywnego planu (zwrócono pustą odpowiedź).");
        return null;
      }
      
      console.log("[workoutService] ← Plan aktywny:", plan);
      return plan;
    } catch (err) {
      console.error("❌ Błąd pobierania aktywnego planu:", err);
      // Nadal rzucamy błąd w przypadku problemu z siecią/serwerem
      throw err;
    }
  },

  async submitSet(exerciseId, payload) {
    try {
      console.log("[workoutService] → POST /api/workout/set", { exerciseId, payload });
      const res = await apiClient.post("/api/workout/set", {
        exerciseId,
        ...payload,
      });
      console.log("[workoutService] ← Odpowiedź:", res);
      return res;
    } catch (err) {
      console.error("❌ Błąd submitSet:", err);
      return { ok: false };
    }
  },

  async finishWorkout(summary) {
    try {
      console.log("[workoutService] → POST /api/workout/finish", summary);
      // Dodaję przekazanie podsumowania w payloadzie
      const res = await apiClient.post("/api/workout/finish", { 
        finished: Date.now(), 
        summary
      });
      console.log("[workoutService] ← Zakończono:", res);
      return res;
    } catch (err) {
      console.error("❌ Błąd finishWorkout:", err);
      return { ok: false };
    }
  },
};