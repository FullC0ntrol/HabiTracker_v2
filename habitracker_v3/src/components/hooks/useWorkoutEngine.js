// /hooks/useWorkoutEngine.js
import { useCallback, useMemo, useRef, useState } from "react";
import { toISO } from "../../utils/dateUtils";
import { ensureTodaySession, saveSet } from "../../lib/workoutApi";

/**
 * Hook przyjmuje plan z zewnątrz (array), NIE robi własnego useState(initialPlan).
 * Dzięki temu można go zawsze wywołać, nawet gdy plan jeszcze się ładuje (np. []).
 */
export function useWorkoutEngine(plan) {
  // plan: [{ id, name, sets }]
  const totalSets = useMemo(() => (plan || []).reduce((a, e) => a + (e.sets || 0), 0), [plan]);

  // kursor: które ćwiczenie i która seria (1-based)
  const [cursor, setCursor] = useState({ ex: 0, set: 1 });

  // wykonane serie (do ewentualnego podglądu)
  const [done, setDone] = useState([]); // {exerciseId, setIndex, weight, reps}

  // przerwa
  const [isRest, setIsRest] = useState(false);
  const [restLeft, setRestLeft] = useState(0);
  const timerRef = useRef(null);

  const todayISO = toISO(new Date());

  const startSession = useCallback(async () => {
    await ensureTodaySession(todayISO);
  }, [todayISO]);

  const currentExercise = plan && plan[cursor.ex];
  const completedSets = done.length;
  const progress = totalSets ? completedSets / totalSets : 0;
  const remainingSets = Math.max(totalSets - completedSets, 0);

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startRest = useCallback((seconds) => {
    stopTimer();
    setIsRest(true);
    setRestLeft(seconds);
    timerRef.current = setInterval(() => {
      setRestLeft((t) => {
        if (t <= 1) {
          stopTimer();
          setIsRest(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }, []);

  const endRest = useCallback(() => {
    stopTimer();
    setIsRest(false);
    setRestLeft(0);
  }, []);

  const submitSet = useCallback(
    async ({ weight, reps, restSeconds = 60 }) => {
      if (!currentExercise) return;

      const exerciseId = currentExercise.id;
      const setIndex = cursor.set;

      // optymistycznie
      setDone((d) => [...d, { exerciseId, setIndex, weight, reps }]);
      await saveSet({ dateISO: todayISO, exerciseId, setIndex, weight, reps });

      // przejście dalej
      if (cursor.set < (currentExercise.sets || 0)) {
        setCursor((c) => ({ ex: c.ex, set: c.set + 1 }));
        startRest(restSeconds);
      } else {
        // skończone ćwiczenie
        if (cursor.ex < (plan?.length || 0) - 1) {
          setCursor({ ex: cursor.ex + 1, set: 1 });
          startRest(restSeconds);
        } else {
          // koniec całego treningu
          endRest();
        }
      }
    },
    [cursor, currentExercise, endRest, plan?.length, startRest, todayISO]
  );

  const isFinished = !currentExercise && !isRest && totalSets > 0;

  return {
    plan,
    cursor,
    currentExercise,
    isRest,
    restLeft,
    startRest,
    endRest,
    submitSet,
    progress,
    remainingSets,
    totalSets,
    completedSets,
    startSession,
    isFinished,
  };
}
