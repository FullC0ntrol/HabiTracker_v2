import React, { useEffect, useMemo, useState } from "react";
import { useWorkoutEngine } from "../hooks/useWorkoutEngine";
import { SetForm } from "./SetForm";
import { RestTimer } from "./RestTimer";
import { ProgressBar } from "./ProgressBar";
import { workoutService } from "../services/workout.service";
import { WorkoutDaySelector } from "./WorkoutDaySelector";
import { Trophy, Clock } from "lucide-react";

/** Uproszczony hook do wykrycia małych ekranów (tel ~<=720px) */
function useIsSmallScreen(query = "(max-width: 720px)") {
  const [isSmall, setIsSmall] = React.useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : true
  );

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(query);
    const handler = (e) => setIsSmall(e.matches);
    mql.addEventListener?.("change", handler);
    // Safari / starsze przeglądarki:
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

  // Pobieranie aktywnego planu
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
            console.warn("[WorkoutScreen] ⚠️ Brak aktywnego planu");
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

  // Filtrowanie planu po dniu
  const filteredPlan = useMemo(() => {
    if (!selectedDay || !plan?.items?.length) return null;
    const dayItems = plan.items.filter((i) => i.day === selectedDay);
    return { ...plan, items: dayItems };
  }, [plan, selectedDay]);

  // Logika treningu
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
    return () =>
      window.removeEventListener("active-plan-changed", handlePlanChange);
  }, []);

  // Licznik czasu trwania treningu
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

  // Ekran ładowania
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-mesh">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/70">Ładowanie planu...</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-mesh p-4">
        <div className="text-center max-w-md">
          <p className="text-white/70 mb-4">
            Brak aktywnego planu treningowego.
          </p>
          <button
            onClick={onExit}
            className="px-6 py-3 rounded-xl bg-cyan-500/20 border border-cyan-400/30 text-white hover:bg-cyan-500/30 transition"
          >
            Wróć do menu
          </button>
        </div>
      </div>
    );
  }

  /** Wybór dnia (responsywnie: lista na tel / karty na większych) */
  if (!selectedDay) {
    const handleChoose = (val) => {
      // Jeśli masz osobny ekran konfiguracji – tu możesz przełączyć widok
      // if (val === "config") return setView({ name: "plan" })
      setSelectedDay(val);
    };

    return isSmall ? (
      <WorkoutDayList
        plan={plan}
        onSelectDay={handleChoose}
        onConfigure={() => handleChoose("config")}
      />
    ) : (
      <WorkoutDaySelector plan={plan} onSelectDay={handleChoose} />
    );
  }

  // Podsumowanie treningu
  if (showSummary) {
    const summary = {
      planName: plan.name,
      selectedDay,
      totalSets,
      completedSets,
      remainingSets,
      duration: formatTime(elapsed),
      exercises:
        filteredPlan?.items?.map((it) => ({
          name: it.name,
          sets: it.sets,
          reps: it.reps,
        })) ?? [],
    };

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-mesh p-4 overflow-y-auto">
        <div className="w-full max-w-lg">
          {/* Success card */}
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
            {/* Trophy icon */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-500/30">
              <Trophy
                className="w-8 h-8 sm:w-10 sm:h-10 text-white"
                strokeWidth={2.5}
              />
            </div>

            {/* Title */}
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2">
              <span className="bg-gradient-to-r from-emerald-200 to-emerald-100 bg-clip-text text-transparent">
                Trening ukończony!
              </span>
            </h2>

            {/* Stats */}
            <div className="bg-black/30 rounded-2xl p-4 sm:p-5 mb-5">
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3">
                <div className="text-center">
                  <div className="text-xs text-gray-400 mb-1">Czas</div>
                  <div className="text-xl sm:text-2xl font-bold text-cyan-300">
                    {summary.duration}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-400 mb-1">Serie</div>
                  <div className="text-xl sm:text-2xl font-bold text-emerald-300">
                    {summary.completedSets}/{summary.totalSets}
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-3">
                <div className="text-xs text-gray-400 mb-1">Plan</div>
                <div className="text-sm font-semibold text-white">
                  {summary.planName} — Dzień {summary.selectedDay}
                </div>
              </div>
            </div>

            {/* Exercises list */}
            <div className="mb-5">
              <div className="text-xs text-gray-400 mb-2">
                Wykonane ćwiczenia:
              </div>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {summary.exercises.map((ex, i) => (
                  <div
                    key={i}
                    className="bg-black/30 rounded-xl p-3 border border-white/5"
                  >
                    <div className="font-semibold text-cyan-300 text-sm">
                      {ex.name}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {ex.sets} serii × {ex.reps} powtórzeń
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action button */}
            <button
              onClick={() => {
                workoutService.finishWorkout(summary);
                if (typeof onExit === "function") onExit();
              }}
              className="w-full h-12 sm:h-14 rounded-xl font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-500/30 transition-all duration-300"
            >
              Zakończ trening
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Ekran treningu
  return (
    <div className="fixed inset-0 flex flex-col bg-mesh">
      {/* Header - kompaktowy na mobile */}
      <div className="bg-black/40 backdrop-blur-xl border-b border-white/10 px-4 py-3 sm:py-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg sm:text-xl font-bold text-center mb-1">
            <span className="text-cyan-300">{plan.name}</span>
            <span className="text-white/50 text-sm sm:text-base">
              {" "}
              — Dzień {selectedDay}
            </span>
          </h2>
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-400">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{formatTime(elapsed)}</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-4 pb-24 overflow-y-auto">
        <div className="w-full max-w-2xl">
          {isFinished ? (
            // Finished state
            <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-10 text-center shadow-2xl">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-500/30 animate-bounce">
                <Trophy
                  className="w-8 h-8 sm:w-10 sm:h-10 text-white"
                  strokeWidth={2.5}
                />
              </div>
              <div className="text-2xl sm:text-3xl font-bold mb-3">
                <span className="bg-gradient-to-r from-emerald-200 to-emerald-100 bg-clip-text text-transparent">
                  Gratulacje!
                </span>
              </div>
              <p className="text-gray-300 mb-6">Ukończyłeś wszystkie serie</p>
              <button
                onClick={() => setShowSummary(true)}
                className="w-full sm:w-auto px-8 py-3 sm:py-4 rounded-xl font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-500/30 transition-all"
              >
                Zobacz podsumowanie
              </button>
            </div>
          ) : isRest ? (
            // Rest timer
            <RestTimer secondsLeft={restLeft} onSkip={endRest} />
          ) : currentExercise ? (
            // Set form
            <SetForm
              exerciseName={currentExercise.name}
              setIndex={cursor.set}
              totalSets={currentExercise.sets}
              onSubmit={submitSet}
              defaultRest={60}
            />
          ) : (
            // Loading exercise
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-white/70 text-sm">Ładowanie ćwiczenia...</p>
            </div>
          )}
        </div>
      </div>

      {/* Pasek postępu na dole */}
      <ProgressBar progress={progress} label={label} />
    </div>
  );
}
