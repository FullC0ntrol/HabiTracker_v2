// /workout/WorkoutScreen.jsx
import React, { useEffect, useMemo, useState } from "react";
import { fetchTodayPlan } from "../../lib/workoutApi";
import { useWorkoutEngine } from "../hooks/useWorkoutEngine";
import { SetForm } from "./SetForm";
import { RestTimer } from "./RestTimer";
import { ProgressBar } from "./ProgressBar";

export default function WorkoutScreen({ plan: planProp }) {
  const [plan, setPlan] = useState(planProp || null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let cancelled = false;
    if (planProp) return;
    (async () => {
      try {
        const p = await fetchTodayPlan(/* strict */ true);
        if (!cancelled) setPlan(p);
      } catch (e) {
        if (!cancelled) {
          setErr(e);
          setPlan([]); // żeby hook miał stałą kolejność i mógł się wywołać
        }
      }
    })();
    return () => { cancelled = true; };
  }, [planProp]);

  const loading = plan === null && !err;
  const safePlan = plan || [];

  const {
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
  } = useWorkoutEngine(safePlan);

  useEffect(() => { startSession(); }, [startSession]);

  const label = useMemo(() => {
    return `Serie: ${completedSets}/${totalSets} • Zostało: ${remainingSets}`;
  }, [completedSets, totalSets, remainingSets]);

  return (
    <div className="min-h-screen w-full bg-mesh flex flex-col">
      {/* Pasek tytułu */}
      <header className="mx-auto w-full max-w-3xl px-4 sm:px-6 pt-6 pb-3">
        <div className="text-center">
          <div className="text-[11px] sm:text-xs tracking-widest uppercase text-white/60">
            {loading ? "Ładowanie..." : "Trening"}
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-cyan-500">
            {loading
              ? "—"
              : currentExercise?.name ??
                (isFinished ? "Zakończono" : (err ? "Brak planu na dziś" : "—"))}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-white/60">
            {!loading && currentExercise ? <>Seria {cursor.set} / {currentExercise.sets}</> : null}
          </p>
        </div>
      </header>

      {/* Główna treść */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 pb-20">
        {loading ? (
          <div className="text-white/70">Ładowanie planu...</div>
        ) : err?.code === "NO_PLAN" ? (
          <div className="w-full max-w-md text-center">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5 sm:p-6">
              <div className="text-base sm:text-lg font-semibold">Nie znaleziono planu na dziś</div>
              <p className="text-white/70 text-sm mt-1">
                API zwróciło 404 dla planu dnia. Sprawdź ścieżkę endpointu w backendzie.
              </p>
              <button
                onClick={async () => {
                  // użyj przykładowego planu jednorazowo
                  const demo = await (async () => {
                    const p = await fetchTodayPlan(false); // fallback
                    return p;
                  })();
                  setErr(null);
                  setPlan(demo);
                }}
                className="mt-4 w-full h-12 rounded-xl font-semibold border bg-gradient-to-r from-cyan-500/25 to-emerald-500/25 border-cyan-400/30 hover:from-cyan-500/35 hover:to-emerald-500/35 transition"
              >
                Użyj przykładowego planu
              </button>
            </div>
          </div>
        ) : !isRest ? (
          currentExercise ? (
            <SetForm
              exerciseName={currentExercise.name}
              setIndex={cursor.set}
              totalSets={currentExercise.sets}
              onSubmit={submitSet}
              defaultRest={60}
            />
          ) : (
            <div className="text-center">
              <div className="text-3xl font-extrabold">Trening ukończony 🎉</div>
              <div className="text-white/70 mt-2">Świetna robota!</div>
            </div>
          )
        ) : (
          <RestTimer secondsLeft={restLeft} onSkip={endRest} />
        )}
      </main>

      <ProgressBar progress={progress} label={label} />
    </div>
  );
}
