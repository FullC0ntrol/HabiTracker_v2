import React, { useEffect, useMemo, useState } from "react";
import { useWorkoutEngine } from "../hooks/useWorkoutEngine";
import { SetForm } from "./SetForm";
import { RestTimer } from "./RestTimer";
import { ProgressBar } from "./ProgressBar";
import { workoutService } from "../services/workout.service";
import { WorkoutDaySelector } from "./WorkoutDaySelector";
import { Trophy, Clock, ChevronLeft, Home } from "lucide-react";

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
    return () => {
      mounted = false;
    };
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
      <div className="min-h-screen bg-mesh flex items-center justify-center px-4">
        <div className="glass-strong rounded-2xl border border-[color:var(--color-card-border)] px-5 py-5 text-center shadow-[0_18px_45px_rgba(0,0,0,0.85)]">
          <div className="w-10 h-10 rounded-xl border-4 border-[color:var(--color-muted-500)]/40 border-t-[color:var(--color-primary-300)] mx-auto mb-3 animate-spin" />
          <p className="text-xs sm:text-sm text-[color:var(--color-text-soft)]">
            Ładowanie planu treningowego...
          </p>
        </div>
      </div>
    );

  // 🚫 Brak planu
  if (!plan)
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center px-4">
        <div className="glass-strong rounded-2xl border border-[color:var(--color-card-border)] px-5 py-6 max-w-xs w-full text-center shadow-[0_18px_45px_rgba(0,0,0,0.85)]">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[rgba(15,23,42,0.9)] flex items-center justify-center mb-3 border border-[color:var(--color-card-border)]">
            <Trophy className="w-7 h-7 text-[color:var(--color-text-soft)]" />
          </div>
          <p className="text-sm text-[color:var(--color-text-soft)] mb-4">
            Brak aktywnego planu treningowego.
          </p>
          <button
            onClick={onExit}
            className="w-full py-2.5 rounded-xl text-xs sm:text-sm font-semibold
              bg-[linear-gradient(135deg,var(--color-primary),var(--color-secondary))]
              text-[color:var(--color-text-base)]
              shadow-[0_0_20px_rgba(var(--rgb-primary),0.7)]
              hover:shadow-[0_0_26px_rgba(var(--rgb-primary),0.9)]
              transition-all active:scale-[0.97]"
          >
            Wróć do menu
          </button>
        </div>
      </div>
    );

  // 🗓️ Wybór dnia
  if (!selectedDay)
    return (
      <div className="min-h-screen bg-mesh px-3 sm:px-4 flex items-center justify-center text-[color:var(--color-text-base)]">
        <WorkoutDaySelector
          plan={plan}
          onSelectDay={setSelectedDay}
          // onBack={onExit} // jak chcesz mieć WSTECZ do menu – odkomentuj
        />
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
      <div className="min-h-screen bg-mesh px-3 sm:px-4 flex items-center justify-center text-[color:var(--color-text-base)]">
        <div className="w-full max-w-md glass-strong rounded-2xl border border-[color:var(--color-card-border)] px-5 py-6 shadow-[0_18px_45px_rgba(0,0,0,0.9)]">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[linear-gradient(135deg,var(--color-primary),var(--color-secondary))] flex items-center justify-center shadow-[0_0_20px_rgba(var(--rgb-primary),0.9)]">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold">
                  Trening ukończony!
                </h2>
                <p className="text-[10px] sm:text-xs text-[color:var(--color-text-soft)]">
                  {summary.planName} — Dzień {summary.selectedDay}
                </p>
              </div>
            </div>
            {onExit && (
              <button
                onClick={onExit}
                className="p-2 rounded-lg glass text-[color:var(--color-text-soft)] hover:text-[color:var(--color-primary-300)] hover:glass-strong transition-all"
                aria-label="Wróć do menu"
              >
                <Home className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Statystyki */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="glass rounded-xl p-3 text-center border border-[color:var(--color-card-border)]">
              <div className="text-[11px] text-[color:var(--color-text-soft)] mb-1">
                Czas
              </div>
              <div className="text-base font-semibold text-[rgb(var(--color-secondary))]">
                {summary.duration}
              </div>
            </div>
            <div className="glass rounded-xl p-3 text-center border border-[color:var(--color-card-border)]">
              <div className="text-[11px] text-[color:var(--color-text-soft)] mb-1">
                Serie
              </div>
              <div className="text-base font-semibold text-[color:var(--color-primary-300)]">
                {summary.completedSets}/{summary.totalSets}
              </div>
            </div>
          </div>

          {/* Lista ćwiczeń */}
          <div className="max-h-40 overflow-y-auto space-y-2 mb-4 pr-1">
            {summary.exercises.map((ex, i) => (
              <div
                key={i}
                className="glass rounded-lg border border-[color:var(--color-card-border)] px-3 py-2"
              >
                <div className="font-medium text-xs sm:text-sm truncate">
                  {ex.name}
                </div>
                <div className="text-[10px] sm:text-xs text-[color:var(--color-text-soft)] mt-0.5">
                  {ex.sets} serii × {ex.reps} powtórzeń
                </div>
              </div>
            ))}
          </div>

          {/* Zakończ trening */}
          <button
            onClick={() => {
              workoutService.finishWorkout(summary);
              onExit?.();
            }}
            className="w-full py-2.5 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm
              bg-[linear-gradient(135deg,var(--color-primary),var(--color-secondary))]
              text-[color:var(--color-text-base)]
              shadow-[0_0_20px_rgba(var(--rgb-primary),0.8)]
              hover:shadow-[0_0_26px_rgba(var(--rgb-primary),1)]
              transition-all active:scale-[0.97]"
          >
            Zakończ trening
          </button>
        </div>
      </div>
    );
  }

  // 🔥 Ekran treningu
  return (
    <div className="min-h-screen bg-mesh flex flex-col text-[color:var(--color-text-base)]">
      {/* Header */}
      <div className="glass-strong border-b border-[color:var(--color-card-border)] px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSelectedDay(null)}
            className="p-2 rounded-lg glass hover:glass-strong hover:text-[color:var(--color-primary-300)] transition-all"
            aria-label="Wybierz inny dzień"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {onExit && (
            <button
              onClick={onExit}
              className="p-2 rounded-lg glass hover:glass-strong hover:text-[color:var(--color-primary-300)] transition-all hidden sm:inline-flex"
              aria-label="Wróć do menu"
            >
              <Home className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="text-center flex-1 min-w-0 px-2">
          <h2 className="text-xs sm:text-sm font-semibold truncate">
            {plan.name}
          </h2>
          <p className="text-[10px] text-[color:var(--color-text-soft)]">
            Dzień {selectedDay}
          </p>
        </div>

        <div className="flex items-center gap-1 text-[10px] sm:text-xs text-[color:var(--color-text-soft)]">
          <Clock className="w-4 h-4" />
          <span>{formatTime(elapsed)}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-3 sm:px-4 py-4">
        <div className={`w-full ${isSmall ? "max-w-md" : "max-w-lg"}`}>
          {isFinished ? (
            <div className="glass-strong rounded-2xl border border-[color:var(--color-card-border)] px-4 py-5 text-center shadow-[0_18px_45px_rgba(0,0,0,0.9)]">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[linear-gradient(135deg,var(--color-primary),var(--color-secondary))] flex items-center justify-center shadow-[0_0_24px_rgba(var(--rgb-primary),0.9)] mb-3 animate-bounce">
                <Trophy className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-base sm:text-lg font-bold mb-1">
                Świetna robota!
              </h3>
              <p className="text-xs sm:text-sm text-[color:var(--color-text-soft)] mb-4">
                Ukończyłeś wszystkie serie na dziś.
              </p>
              <button
                onClick={() => setShowSummary(true)}
                className="w-full py-2.5 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm
                  bg-[linear-gradient(135deg,var(--color-primary),var(--color-secondary))]
                  text-[color:var(--color-text-base)]
                  shadow-[0_0_20px_rgba(var(--rgb-primary),0.8)]
                  hover:shadow-[0_0_26px_rgba(var(--rgb-primary),1)]
                  transition-all active:scale-[0.97]"
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
            <div className="glass-strong rounded-2xl border border-[color:var(--color-card-border)] px-4 py-5 text-center shadow-[0_18px_45px_rgba(0,0,0,0.9)]">
              <div className="w-8 h-8 border-4 border-[color:var(--color-muted-500)]/40 border-t-[color:var(--color-primary-300)] rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs sm:text-sm text-[color:var(--color-text-soft)]">
                Ładowanie ćwiczenia...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Pasek postępu */}
      <ProgressBar progress={progress} label={label} />
    </div>
  );
}
