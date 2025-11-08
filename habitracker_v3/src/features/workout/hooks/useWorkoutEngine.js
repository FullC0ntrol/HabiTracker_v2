import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { workoutService } from "../services/workout.service";

export function useWorkoutEngine(plan) {
  const safePlan = plan && Array.isArray(plan.items)
    ? plan
    : { items: [] }; // zabezpieczenie przed null

  const [cursor, setCursor] = useState({ exercise: 0, set: 1 });
  const [isRest, setIsRest] = useState(false);
  const [restLeft, setRestLeft] = useState(0);
  const [completedSets, setCompletedSets] = useState(0);
  const [totalSets, setTotalSets] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const timerRef = useRef(null);

  // 🔍 Oblicz liczbę serii, tylko gdy plan ma elementy
  useEffect(() => {
    if (safePlan.items.length > 0) {
      const total = safePlan.items.reduce(
        (sum, it) => sum + Number(it.sets || 0),
        0
      );
      console.log("[useWorkoutEngine] 🧩 Plan:", safePlan.name, "| totalSets =", total);
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

  // ▶️ Rozpocznij sesję tylko gdy plan jest gotowy
  const startSession = useCallback(() => {
    if (!safePlan.items.length) {
      console.warn("[useWorkoutEngine] ⚠️ Brak ćwiczeń — nie uruchamiam sesji.");
      setIsFinished(true);
      return;
    }
    console.log("[useWorkoutEngine] ▶️ Start session for", safePlan.items.length, "exercises");
    setCursor({ exercise: 0, set: 1 });
    setCompletedSets(0);
    setIsRest(false);
    setRestLeft(0);
    setIsFinished(false);
  }, [safePlan]);

  const endRest = useCallback(() => {
    setIsRest(false);
    setRestLeft(0);
    clearInterval(timerRef.current);
  }, []);

  // ⏱️ Odliczanie przerwy
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

  // ✅ Wysłanie serii
  const submitSet = useCallback(
    ({ weight, reps, restSeconds }) => {
      if (!currentExercise) return;

      workoutService.submitSet(currentExercise.id, {
        setIndex: cursor.set,
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

      setCompletedSets((p) => p + 1);

      const nextExerciseIndex = cursor.exercise;
      const nextSetIndex = cursor.set + 1;

      if (nextSetIndex <= currentExercise.sets) {
        // kolejna seria tego samego ćwiczenia
        setCursor({ exercise: nextExerciseIndex, set: nextSetIndex });
        setIsRest(true);
        setRestLeft(restSeconds || 60);
      } else if (safePlan.items[nextExerciseIndex + 1]) {
        // następne ćwiczenie
        setCursor({ exercise: nextExerciseIndex + 1, set: 1 });
        setIsRest(true);
        setRestLeft(restSeconds || 60);
      } else {
        // koniec treningu
        console.log("🏁 Trening ukończony!");
        setIsFinished(true);
        endRest();
      }
    },
    [cursor, currentExercise, safePlan, endRest]
  );

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
  };
}
