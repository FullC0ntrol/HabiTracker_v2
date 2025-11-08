import { useState, useCallback, useEffect } from "react";
import { plansService } from "../services/plans.service";

/**
 * Hook zarządzający planami i aktywnym planem użytkownika.
 */
export function usePlans() {
  const [plans, setPlans] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [pl, ex] = await Promise.all([
        plansService.getAll(),
        plansService.getExercises(),
      ]);

      // pobierz aktywny plan osobno — niech błędy nie blokują pozostałych danych
      let active = null;
      try {
        active = await plansService.getActive();
      } catch (err) {
        if (err.message !== "No active plan") {
          console.warn("Błąd pobierania aktywnego planu:", err.message);
        }
      }

      setPlans(pl);
      setExercises(ex);
      setActivePlan(active || null);
    } catch (e) {
      console.error("usePlans load error:", e);
      setError("Nie udało się pobrać planów lub ćwiczeń");
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(
    async (id) => {
      try {
        await plansService.delete(id);
        await load();
      } catch (e) {
        console.error("Nie udało się usunąć planu:", e);
      }
    },
    [load]
  );

const setActive = async (id) => {
  try {
    await plansService.setActive(id);
    const newActive = await plansService.getActive();
    setActivePlan(newActive);
    await load(); // ← odśwież listę planów
    // 🔽 WYWOŁAJ zdarzenie globalne
    window.dispatchEvent(new Event("active-plan-changed"));
  } catch (err) {
    console.error("[usePlans] ❌ Błąd podczas ustawiania aktywnego planu:", err);
  }
};



  useEffect(() => {
    load();
  }, [load]);

  return {
    plans,
    exercises,
    activePlan,
    setActive,
    remove,
    load,
    loading,
    error,
  };
}