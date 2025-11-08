import React, { useEffect, useMemo, useState } from "react";
import { useWorkoutEngine } from "../hooks/useWorkoutEngine";
import { SetForm } from "./SetForm";
import { RestTimer } from "./RestTimer";
import { ProgressBar } from "./ProgressBar";
import { workoutService } from "../services/workout.service";
import { WorkoutDaySelector } from "./WorkoutDaySelector";

export default function WorkoutScreen({ plan: planProp, onExit }) {
  const [plan, setPlan] = useState(planProp || null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [loading, setLoading] = useState(!planProp);

  // 🧭 Pobieranie aktywnego planu
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        if (planProp) {
          setPlan(planProp);
          setLoading(false);
          return;
        }

        setLoading(true);
        const todayPlan = await workoutService.getTodayPlan();

        if (mounted) {
          if (!todayPlan || !todayPlan.items?.length) {
            console.warn("[WorkoutScreen] ⚠️ Brak aktywnego planu lub pusty plan.");
          }
          setPlan(todayPlan);
        }
      } catch (err) {
        console.error("[WorkoutScreen] ❌ Błąd pobierania planu:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [planProp]);

  // 🧠 Filtrowanie planu po dniu
  const filteredPlan = useMemo(() => {
    if (!selectedDay || !plan?.items?.length) return null;
    const dayItems = plan.items.filter((i) => i.day === selectedDay);
    return { ...plan, items: dayItems };
  }, [plan, selectedDay]);

  // 🏋️‍♂️ Logika treningu
  const workout = useWorkoutEngine(filteredPlan);
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
  } = workout;

  useEffect(() => {
  const handlePlanChange = async () => {
    console.log("[WorkoutScreen] 🔁 wykryto zmianę aktywnego planu");
    const updated = await workoutService.getTodayPlan();
    setPlan(updated);
  };
  window.addEventListener("active-plan-changed", handlePlanChange);
  return () => window.removeEventListener("active-plan-changed", handlePlanChange);
}, []);

  // ⏱️ Licznik czasu trwania treningu
  useEffect(() => {
    if (!selectedDay || !filteredPlan?.items?.length) return;
    startSession();
    const start = Date.now();
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedDay, filteredPlan, startSession]);

  const formatTime = (sec) => {
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const label = useMemo(
    () => `Serie: ${completedSets}/${totalSets} • Zostało: ${remainingSets}`,
    [completedSets, totalSets, remainingSets]
  );

  // 🧩 Ekran ładowania / wyboru dnia
  if (loading) return <div className="text-white/70">Ładowanie planu...</div>;
  if (!plan) return <div className="text-white/70">Brak aktywnego planu.</div>;
  if (!selectedDay)
    return <WorkoutDaySelector plan={plan} onSelectDay={setSelectedDay} />;

  // ✅ Podsumowanie treningu
  if (showSummary) {
    const summary = {
      planName: plan.name,
      selectedDay,
      totalSets,
      completedSets,
      remainingSets,
      duration: formatTime(elapsed),
      exercises: filteredPlan?.items?.map((it) => ({
        name: it.name,
        sets: it.sets,
        reps: it.reps,
      })) ?? [],
    };

    console.log("[WorkoutScreen] 🧾 Podsumowanie treningu:", summary);

    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md text-white">
        <div className="bg-white/10 p-6 rounded-2xl max-w-lg w-full text-center">
          <h2 className="text-2xl font-bold text-emerald-400 mb-2">
            Trening ukończony 🎉
          </h2>
          <p className="text-white/70 mb-4">
            Plan: <span className="text-cyan-300">{summary.planName}</span>
            <br />
            Dzień: <span className="text-cyan-300">{summary.selectedDay}</span>
            <br />
            Czas trwania:{" "}
            <span className="text-cyan-300">{summary.duration}</span>
          </p>

          <div className="text-left text-sm max-h-64 overflow-y-auto bg-black/30 rounded-xl p-3 mb-4">
            {summary.exercises.map((ex, i) => (
              <div key={i} className="mb-1">
                <span className="font-semibold text-cyan-400">{ex.name}</span>
                <span className="text-white/60">
                  {" "}
                  — {ex.sets} serii po {ex.reps}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              workoutService.finishWorkout(summary);
              if (typeof onExit === "function") onExit();
            }}
            className="bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-xl text-white font-semibold"
          >
            Zakończ i wróć
          </button>
        </div>
      </div>
    );
  }

  // 🏋️‍♀️ Ekran treningu
  return (
    <div className="fixed inset-0 flex flex-col bg-transparent text-white">
      <div className="text-center py-4 backdrop-blur-md bg-black/30">
        <h2 className="text-xl font-bold text-cyan-300">
          {plan.name} — Dzień {selectedDay}
        </h2>
        <p className="text-sm text-white/70">{formatTime(elapsed)}</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        {isFinished ? (
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-400 mb-3">
              Trening ukończony 🎉
            </div>
            <button
              onClick={() => setShowSummary(true)}
              className="mt-6 bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-xl"
            >
              Pokaż podsumowanie
            </button>
          </div>
        ) : isRest ? (
          <RestTimer secondsLeft={restLeft} onSkip={endRest} />
        ) : currentExercise ? (
          <div className="max-w-lg w-full bg-white/5 rounded-2xl p-6 text-center backdrop-blur">
            <div className="text-xl font-semibold text-cyan-300 mb-3">
              {currentExercise.name}
            </div>
            <SetForm
              exerciseName={currentExercise.name}
              setIndex={cursor.set}
              totalSets={currentExercise.sets}
              onSubmit={submitSet}
              defaultRest={60}
            />
          </div>
        ) : (
          <div className="text-white/70">Ładowanie ćwiczenia...</div>
        )}
      </div>

      <ProgressBar progress={progress} label={label} />
    </div>
  );
}
