import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { workoutService } from "../services/workout.service";

/** data YYYY-MM-DD w lokalnej strefie */
const toISO =
  workoutService.toISODateLocal ??
  ((d = new Date()) => {
    const dt = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return dt.toISOString().slice(0, 10);
  });

export function useWorkoutEngine(plan) {
  const safePlan = plan && Array.isArray(plan.items) ? plan : { items: [] };

  const [cursor, setCursor] = useState({ exercise: 0, set: 1 });
  const [isRest, setIsRest] = useState(false);
  const [restLeft, setRestLeft] = useState(0);
  const [completedSets, setCompletedSets] = useState(0);
  const [totalSets, setTotalSets] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // sesja po dacie (serwer sam robi upsert po (user_id,date))
  const [sessionDate, setSessionDate] = useState(null);

  // 🕓 timer całego treningu
  const [workoutStartedAt, setWorkoutStartedAt] = useState(null); // timestamp (ms)
  const [durationSec, setDurationSec] = useState(0); // ile trwa sesja w sekundach

  const timerRef = useRef(null);

  useEffect(() => {
    if (safePlan.items.length > 0) {
      const total = safePlan.items.reduce(
        (sum, it) => sum + Number(it.sets || 0),
        0
      );
      console.log(
        "[useWorkoutEngine] 🧩 Plan:",
        safePlan.name,
        "| totalSets =",
        total
      );
      setTotalSets(total);
    } else {
      setTotalSets(0);
    }
  }, [safePlan]);

  const currentExercise = safePlan.items[cursor.exercise] ?? null;
  const remainingSets = totalSets - completedSets;

  const progress = useMemo(
    () => (totalSets > 0 ? completedSets / totalSets : 0),
    [completedSets, totalSets]
  );

  // 🕓 licznik całej sesji (durationSec)
  useEffect(() => {
    if (!workoutStartedAt || isFinished) return;

    const id = setInterval(() => {
      setDurationSec(Math.floor((Date.now() - workoutStartedAt) / 1000));
    }, 1000);

    return () => clearInterval(id);
  }, [workoutStartedAt, isFinished]);

  // ▶️ Start sesji (po dacie)
  const startSession = useCallback(async () => {
    if (!safePlan.items.length) {
      console.warn(
        "[useWorkoutEngine] ⚠️ Brak ćwiczeń — nie uruchamiam sesji."
      );
      setIsFinished(true);
      return;
    }

    console.log(
      "[useWorkoutEngine] ▶️ Start session for",
      safePlan.items.length,
      "exercises"
    );
    setCursor({ exercise: 0, set: 1 });
    setCompletedSets(0);
    setIsRest(false);
    setRestLeft(0);
    setIsFinished(false);
    setDurationSec(0);

    const today = toISO(new Date());
    try {
      const session = await workoutService.startOrGetSession(today);
      setSessionDate(today);

      // jeżeli backend zwróci started_at – licz od niego,
      // inaczej startuj od "teraz"
      if (session && session.started_at) {
        const ts = new Date(session.started_at).getTime();
        setWorkoutStartedAt(Number.isNaN(ts) ? Date.now() : ts);
      } else {
        setWorkoutStartedAt(Date.now());
      }
    } catch (e) {
      console.error("[useWorkoutEngine] ❌ startSession failed:", e);
      setSessionDate(today);
      setWorkoutStartedAt(Date.now()); // fallback – licz lokalnie
    }
  }, [safePlan]);

  const endRest = useCallback(() => {
    setIsRest(false);
    setRestLeft(0);
    clearInterval(timerRef.current);
  }, []);

  // ⏱️ timer przerwy
  useEffect(() => {
    if (isRest && restLeft > 0) {
      timerRef.current = setInterval(() => {
        setRestLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRest(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [isRest, restLeft]);

  // ✅ zapis serii do DB (po dacie)
  const submitSet = useCallback(
    async ({ weight, reps, restSeconds }) => {
      if (!currentExercise) return;

      // UWAGA: potrzebujemy ID ćwiczenia z tabeli exercises!
      // Zmieniamy plan tak, by element miał pole exercise_id (patrz patch backendu).
      const exerciseId =
        currentExercise.exercise_id ?? currentExercise.id; // awaryjnie użyj id, ale poprawnie powinno być exercise_id
      const date = sessionDate ?? toISO(new Date());

      const setIndex = cursor.set;

      await workoutService.addSet({
        date,
        exercise_id: Number(exerciseId),
        set_index: setIndex,
        weight,
        reps,
      });

      console.log("[useWorkoutEngine] ✅ submitSet:", {
        exercise: currentExercise.name,
        set: cursor.set,
        weight,
        reps,
        restSeconds,
      });

      // wartość po tej serii
      const completedAfterThisSet = completedSets + 1;
      setCompletedSets((p) => p + 1);

      const nextExerciseIndex = cursor.exercise;
      const nextSetIndex = cursor.set + 1;

      if (nextSetIndex <= (currentExercise.sets ?? 1)) {
        setCursor({ exercise: nextExerciseIndex, set: nextSetIndex });
        setIsRest(true);
        setRestLeft(restSeconds || 60);
      } else if (safePlan.items[nextExerciseIndex + 1]) {
        setCursor({ exercise: nextExerciseIndex + 1, set: 1 });
        setIsRest(true);
        setRestLeft(restSeconds || 60);
      } else {
        console.log("🏁 Trening ukończony!");
        setIsFinished(true);
        endRest();

        // na koniec zapisz duration_sec i statystyki do workout_sessions
        try {
          await workoutService.finishSession({
            date,
            duration_sec: durationSec,
            total_sets: totalSets,
            completed_sets: completedAfterThisSet,
          });
        } catch (e) {
          console.error("[useWorkoutEngine] ❌ finishSession (auto) failed:", e);
        }
      }
    },
    [
      cursor,
      currentExercise,
      safePlan,
      endRest,
      sessionDate,
      completedSets,
      durationSec,
      totalSets,
    ]
  );

  // Ręczne zakończenie sesji (np. user przerwał wcześniej)
  const finishSession = useCallback(async () => {
    const date = sessionDate ?? toISO(new Date());
    try {
      const res = await workoutService.finishSession({
        date,
        duration_sec: durationSec,
        total_sets: totalSets,
        completed_sets: completedSets,
      });
      setIsFinished(true);
      return res;
    } catch (e) {
      console.error("[useWorkoutEngine] ❌ finishSession failed:", e);
      return { ok: false, error: e?.message ?? "finishSession failed" };
    }
  }, [sessionDate, durationSec, totalSets, completedSets]);

  return {
    cursor,
    currentExercise,
    isRest,
    restLeft,
    submitSet,
    progress,
    remainingSets,
    totalSets,
    completedSets,
    startSession,
    endRest,
    isFinished,
    sessionDate,
    finishSession,
    durationSec, // ← można pokazać na UI
  };
}
