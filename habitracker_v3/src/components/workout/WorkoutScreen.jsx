// /workout/WorkoutScreen.jsx
import React, { useEffect, useMemo, useState } from "react";
import { fetchTodayPlan } from "../../lib/workoutApi";
import { useWorkoutEngine } from "../hooks/useWorkoutEngine";
import { SetForm } from "./SetForm";
import { RestTimer } from "./RestTimer";
import { ProgressBar } from "./ProgressBar";
import { ChevronLeft } from "lucide-react";

export default function WorkoutScreen({ plan: planProp, onExit }) {
  const [plan, setPlan] = useState(planProp || null);

  useEffect(() => {
    let cancelled = false;
    if (planProp) return;
    (async () => {
      const p = await fetchTodayPlan();
      if (!cancelled) setPlan(p);
    })();
    return () => {
      cancelled = true;
    };
  }, [planProp]);

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
  } = useWorkoutEngine(plan);

  useEffect(() => {
    startSession();
  }, [startSession]);

  const label = useMemo(() => {
    return `Serie: ${completedSets}/${totalSets} • Zostało: ${remainingSets}`;
  }, [completedSets, totalSets, remainingSets]);

  if (!plan) {
    return (
      <div className="min-h-screen w-full bg-mesh flex items-center justify-center">
        <div className="text-black">Ładowanie planu...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-mesh flex flex-col">
      {/* Header */}
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onExit}
            className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 grid place-items-center"
            title="Wróć"
          >
            <ChevronLeft className="w-5 h-5 text-white/80" />
          </button>

          <div className="text-center">
            <div className="text-xs text-white/60">Trening</div>
            <div className="text-xl sm:text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-cyan-500">
              {currentExercise?.name ?? (isFinished ? "Zakończono" : "—")}
            </div>
            <div className="text-[11px] text-white/50">
              {currentExercise ? (
                <>
                  Seria {cursor.set} / {currentExercise.sets}
                </>
              ) : null}
            </div>
          </div>

          <div className="w-10 h-10" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 pb-16">
        {!isRest ? (
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
              <div className="text-3xl font-extrabold">
                Trening ukończony 🎉
              </div>
              <div className="text-white/70 mt-2">Świetna robota!</div>
            </div>
          )
        ) : (
          <RestTimer secondsLeft={restLeft} onSkip={endRest} />
        )}
      </div>

      <ProgressBar progress={progress} label={label} />
    </div>
  );
}
