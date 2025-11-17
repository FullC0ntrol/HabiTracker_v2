import React, { useEffect, useMemo, useState } from "react";
import { useWorkoutEngine } from "../hooks/useWorkoutEngine";
import { SetForm } from "./SetForm";
import { RestTimer } from "./RestTimer";
import { ProgressBar } from "./ProgressBar";
import { workoutService } from "../services/workout.service";
import { WorkoutDaySelector } from "./WorkoutDaySelector";
import { Trophy, Clock, ChevronLeft } from "lucide-react";

/** Detekcja ekranu mobilnego */
function useIsSmallScreen(query = "(max-width: 720px)") {
  const [isSmall, setIsSmall] = React.useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : true
  );

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(query);
    const handler = (e) => setIsSmall(e.matches);
    mql.addEventListener?.("change", handler);
    mql.addListener?.(handler);
    return () => {
      mql.removeEventListener?.("change", handler);
      mql.removeListener?.(handler);
    };
  }, [query]);

  return isSmall;
}

export default function WorkoutScreen({ plan: planProp, onExit }) {
  const [plan, setPlan] = useState(planProp || null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [loading, setLoading] = useState(!planProp);
  const isSmall = useIsSmallScreen();

  // 🔁 Pobieranie planu
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
        if (mounted) setPlan(todayPlan);
      } catch (err) {
        console.error("Błąd pobierania planu:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [planProp]);

  // 🎯 Filtrowanie po dniu
  const filteredPlan = useMemo(() => {
    if (!selectedDay || !plan?.items?.length) return null;
    return { ...plan, items: plan.items.filter((i) => i.day === selectedDay) };
  }, [plan, selectedDay]);

  // 🧠 Logika treningu
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

  // ⏱️ Licznik czasu
  useEffect(() => {
    if (!selectedDay || !filteredPlan?.items?.length) return;
    startSession();
    const start = Date.now();
    const interval = setInterval(
      () => setElapsed(Math.floor((Date.now() - start) / 1000)),
      1000
    );
    return () => clearInterval(interval);
  }, [selectedDay, filteredPlan, startSession]);

  const formatTime = (sec) => {
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const label = useMemo(
    () => `Serie ${completedSets}/${totalSets} • Zostało ${remainingSets}`,
    [completedSets, totalSets, remainingSets]
  );

  // 🌀 Ekran ładowania
  if (loading)
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-[rgb(var(--color-bg-grad-from))]/30 to-[rgb(var(--color-bg-grad-to))]/40">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[rgb(var(--color-primary-light))]/20 border-t-[rgb(var(--color-primary-light))] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[rgb(var(--color-primary-light))]/70">Ładowanie planu...</p>
        </div>
      </div>
    );

  // 🚫 Brak planu
  if (!plan)
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-[rgb(var(--color-bg-grad-from))]/30 to-[rgb(var(--color-bg-grad-to))]/40 p-4">
        <div className="text-center space-y-4">
          <p className="text-white/70">Brak aktywnego planu treningowego</p>
          <button
            onClick={onExit}
            className="px-6 py-3 rounded-xl bg-[rgb(var(--rgb-primary))]/20 border border-[rgb(var(--color-primary-light))]/40 text-[rgb(var(--color-primary-light))] hover:bg-[rgb(var(--rgb-primary))]/30 transition-all"
          >
            Wróć do menu
          </button>
        </div>
      </div>
    );

  // 🗓️ Wybór dnia
  if (!selectedDay)
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-[rgb(var(--color-bg-grad-from))]/30 to-[rgb(var(--color-bg-grad-to))]/40 p-4">
        <WorkoutDaySelector plan={plan} onSelectDay={setSelectedDay} />
      </div>
    );

  // 🏁 Podsumowanie
  if (showSummary) {
    const summary = {
      planName: plan.name,
      selectedDay,
      totalSets,
      completedSets,
      duration: formatTime(elapsed),
      exercises:
        filteredPlan?.items?.map((it) => ({
          name: it.name,
          sets: it.sets,
          reps: it.reps,
        })) ?? [],
    };

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-[rgb(var(--color-bg-grad-from))]/30 to-[rgb(var(--color-bg-grad-to))]/40 p-4 overflow-y-auto">
        <div className="w-full max-w-md bg-white/5 backdrop-blur-xl rounded-3xl border border-[rgb(var(--color-primary-light))]/20 p-6 shadow-2xl shadow-[rgb(var(--rgb-primary))]/30">
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[rgb(var(--rgb-primary))] to-[rgb(var(--color-secondary))] flex items-center justify-center shadow-lg shadow-[rgb(var(--rgb-primary))]/30 mb-4">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-[rgb(var(--color-primary-light))] to-[rgb(var(--color-secondary))] bg-clip-text text-transparent">
              Trening ukończony!
            </h2>
            <p className="text-sm text-white/60 mt-1">
              {summary.planName} — Dzień {summary.selectedDay}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="text-center bg-black/20 rounded-xl p-3 border border-[rgb(var(--color-primary-light))]/10">
              <div className="text-xs text-white/50 mb-1">Czas</div>
              <div className="text-lg font-semibold text-[rgb(var(--color-secondary))]">
                {summary.duration}
              </div>
            </div>
            <div className="text-center bg-black/20 rounded-xl p-3 border border-[rgb(var(--color-primary-light))]/10">
              <div className="text-xs text-white/50 mb-1">Serie</div>
              <div className="text-lg font-semibold text-[rgb(var(--color-primary-light))]">
                {summary.completedSets}/{summary.totalSets}
              </div>
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-2 mb-6">
            {summary.exercises.map((ex, i) => (
              <div
                key={i}
                className="bg-black/30 rounded-xl border border-[rgb(var(--color-primary-light))]/10 p-3"
              >
                <div className="font-semibold text-white">{ex.name}</div>
                <div className="text-xs text-[rgb(var(--color-primary-light))]/70">
                  {ex.sets} serii × {ex.reps} powtórzeń
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              workoutService.finishWorkout(summary);
              onExit?.();
            }}
            className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-[rgb(var(--rgb-primary))] to-[rgb(var(--color-secondary))] hover:from-[rgb(var(--color-primary-dark))] hover:to-[rgb(var(--color-secondary))] text-white shadow-lg shadow-[rgb(var(--rgb-primary))]/30 transition-all"
          >
            Zakończ trening
          </button>
        </div>
      </div>
    );
  }

  // 🔥 Ekran treningu
  return (
    <div className="fixed inset-0 flex flex-col bg-gradient-to-br from-[rgb(var(--color-bg-grad-from))]/30 to-[rgb(var(--color-bg-grad-to))]/40">
      {/* Header */}
      <div className="bg-black/40 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setSelectedDay(null)}
          className="p-2 rounded-lg hover:bg-white/10 transition"
        >
          <ChevronLeft className="w-5 h-5 text-white/70" />
        </button>
        <div className="text-center flex-1">
          <h2 className="text-lg font-bold text-[rgb(var(--color-primary-light))]">{plan.name}</h2>
          <p className="text-xs text-white/50">Dzień {selectedDay}</p>
        </div>
        <div className="flex items-center gap-1 text-xs text-white/60">
          <Clock className="w-4 h-4" />
          {formatTime(elapsed)}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-y-auto">
        <div className="w-full max-w-xl">
          {isFinished ? (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[rgb(var(--rgb-primary))] to-[rgb(var(--color-secondary))] flex items-center justify-center shadow-lg shadow-[rgb(var(--rgb-primary))]/30 mb-4 animate-bounce">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Świetna robota!
              </h3>
              <p className="text-white/60 mb-5">Ukończyłeś trening</p>
              <button
                onClick={() => setShowSummary(true)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[rgb(var(--rgb-primary))] to-[rgb(var(--color-secondary))] text-white font-semibold hover:from-[rgb(var(--color-primary-dark))] hover:to-[rgb(var(--color-secondary))] transition-all shadow-lg shadow-[rgb(var(--rgb-primary))]/30"
              >
                Zobacz podsumowanie
              </button>
            </div>
          ) : isRest ? (
            <RestTimer secondsLeft={restLeft} onSkip={endRest} />
          ) : currentExercise ? (
            <SetForm
              exerciseName={currentExercise.name}
              setIndex={cursor.set}
              totalSets={currentExercise.sets}
              onSubmit={submitSet}
              defaultRest={60}
            />
          ) : (
            <div className="text-center text-white/60">
              <div className="w-10 h-10 border-4 border-[rgb(var(--color-primary-light))]/20 border-t-[rgb(var(--color-primary-light))] rounded-full animate-spin mx-auto mb-3" />
              Ładowanie ćwiczenia...
            </div>
          )}
        </div>
      </div>

      {/* Pasek postępu */}
      <ProgressBar progress={progress} label={label} />
    </div>
  );
}