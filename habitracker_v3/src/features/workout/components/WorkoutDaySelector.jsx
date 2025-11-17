import React from "react";
import { motion } from "framer-motion";
import { Settings, Dumbbell, ChevronRight, Zap, Calendar, ArrowLeft } from "lucide-react";

export function WorkoutDaySelector({ plan, onSelectDay, onBack, lastTrainedDay }) {
  if (!plan?.items) return null;

  const uniqueDays = [...new Set(plan.items.map((i) => i.day))].sort((a, b) => a - b);

  const dayLabels = uniqueDays.map((d, i) => {
    const dayExercises = plan.items.filter((it) => it.day === d);
    const totalSets = dayExercises.reduce((sum, ex) => sum + (ex.sets || 0), 0);

    return {
      day: d,
      label: plan.split_labels?.[i] || `Dzień ${i + 1}`,
      exercises: dayExercises,
      totalSets,
      exerciseCount: dayExercises.length,
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[rgb(var(--color-bg-grad-from))] to-[rgb(var(--color-bg-grad-to))] p-4">
      {/* 🔙 Back button */}
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-all mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Wstecz</span>
        </button>
      )}

      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[rgb(var(--rgb-primary))] to-[rgb(var(--color-secondary))] flex items-center justify-center shadow-lg mb-3">
          <Calendar className="w-7 h-7 text-white" />
        </div>

        <h1 className="text-xl font-bold text-white mb-1">{plan.name}</h1>
        <p className="text-white/60 text-xs">
          {plan.plan_type === "FBW" ? "Full Body Workout" : "Split"} • {uniqueDays.length} dni
        </p>
      </div>

      {/* Statystyki planu */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white/10 rounded-xl p-3 text-center border border-white/20">
          <div className="text-lg font-bold text-white">
            {plan.items.reduce((sum, item) => sum + (item.sets || 0), 0)}
          </div>
          <div className="text-xs text-white/60 mt-0.5">Łącznie serii</div>
        </div>
        <div className="bg-white/10 rounded-xl p-3 text-center border border-white/20">
          <div className="text-lg font-bold text-white">
            {new Set(plan.items.map((item) => item.exercise_id)).size}
          </div>
          <div className="text-xs text-white/60 mt-0.5">Unikalnych ćwiczeń</div>
        </div>
      </div>

      {/* Dni treningowe */}
      <div className="space-y-3 mb-6">
        <h2 className="text-base font-semibold text-white mb-3 text-center">
          Wybierz dzień treningowy
        </h2>

        {dayLabels.map((day, index) => (
          <button
            key={day.day}
            onClick={() => onSelectDay(day.day)}
            className="w-full bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4 text-left hover:bg-white/15 transition-all active:scale-95"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[rgb(var(--rgb-primary))] to-[rgb(var(--color-secondary))] flex items-center justify-center text-white text-sm font-bold shadow">
                  {index + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-sm">{day.label}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-white/60">
                      {day.exerciseCount} ćwicz.
                    </span>
                    <span className="text-xs text-white/60">{day.totalSets} serii</span>
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/40 flex-shrink-0" />
            </div>
          </button>
        ))}
      </div>

      {/* Akcje */}
      <div className="space-y-3">
        {/* ⚙️ Konfiguracja */}
        <button
          onClick={() => onSelectDay("config")}
          className="w-full bg-amber-500/20 backdrop-blur-md rounded-xl border border-amber-400/30 p-4 text-left hover:bg-amber-500/30 transition-all active:scale-95"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/30 border border-amber-400/40 flex items-center justify-center">
                <Settings className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Konfiguracja planu</h3>
                <p className="text-xs text-amber-300/60">Edytuj ćwiczenia i ustawienia</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-amber-300/60" />
          </div>
        </button>

        {/* 🔁 Ostatnio trenowany dzień */}
        {dayLabels.length > 1 && (
          <button
            onClick={() => {
              const targetDay = lastTrainedDay || dayLabels[0].day;
              onSelectDay(targetDay);
            }}
            className="w-full bg-[rgb(var(--color-secondary))]/20 backdrop-blur-md rounded-xl border border-[rgb(var(--color-secondary))]/30 p-4 text-left hover:bg-[rgb(var(--color-secondary))]/30 transition-all active:scale-95"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[rgb(var(--color-secondary))]/30 border border-[rgb(var(--color-secondary))]/40 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-[rgb(var(--color-secondary))]" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">Wznów ostatni trening</h3>
                  <p className="text-xs text-[rgb(var(--color-secondary))]/60">
                    Kontynuuj od dnia {lastTrainedDay || "1"}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[rgb(var(--color-secondary))]/60" />
            </div>
          </button>
        )}
      </div>
    </div>
  );
}