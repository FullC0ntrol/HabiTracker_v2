import React from "react";
import { motion } from "framer-motion";
import { Settings, Dumbbell, ChevronRight, Zap, Calendar, ArrowLeftCircle } from "lucide-react";

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
    <div className="relative min-h-screen bg-gradient-to-br from-emerald-950/20 to-slate-900/40 p-4">
      {/* 🔙 Back button */}
      {onBack && (
        <motion.button
          onClick={onBack}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="absolute top-4 left-4 z-10 flex items-center gap-2 text-emerald-300 hover:text-emerald-200 transition-all group"
        >
          <ArrowLeftCircle className="w-6 h-6 text-emerald-300 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Wstecz</span>
        </motion.button>
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-6 pt-10"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/30"
        >
          <Calendar className="w-6 h-6 text-white" strokeWidth={2.5} />
        </motion.div>

        <h1 className="text-xl font-bold text-white mb-1">{plan.name}</h1>
        <p className="text-xs text-emerald-300/60">
          {plan.plan_type === "FBW" ? "Full Body Workout" : "Split"} • {uniqueDays.length} dni
        </p>
      </motion.div>

      {/* Statystyki planu */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 gap-3 mb-6"
      >
        <div className="bg-emerald-500/10 rounded-lg p-3 text-center border border-emerald-500/20">
          <div className="text-lg font-bold text-emerald-300">
            {plan.items.reduce((sum, item) => sum + (item.sets || 0), 0)}
          </div>
          <div className="text-xs text-emerald-300/60">Łącznie serii</div>
        </div>
        <div className="bg-cyan-500/10 rounded-lg p-3 text-center border border-cyan-500/20">
          <div className="text-lg font-bold text-cyan-300">
            {new Set(plan.items.map((item) => item.exercise_id)).size}
          </div>
          <div className="text-xs text-cyan-300/60">Unikalnych ćwiczeń</div>
        </div>
      </motion.div>

      {/* Dni treningowe */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-3 mb-6"
      >
        <h2 className="text-sm font-semibold text-emerald-300/80 mb-3 flex items-center gap-2">
          <Dumbbell className="w-4 h-4" />
          Dni treningowe
        </h2>

        {dayLabels.map((day, index) => (
          <motion.button
            key={day.day}
            onClick={() => onSelectDay(day.day)}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            className="group w-full bg-white/5 backdrop-blur-md rounded-xl border border-emerald-500/20 p-4 text-left hover:bg-emerald-500/10 hover:border-emerald-400/30 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-emerald-500/30">
                  {index + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-sm truncate">{day.label}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-emerald-300/60">
                      {day.exerciseCount} ćwicz.
                    </span>
                    <span className="text-xs text-cyan-300/60">{day.totalSets} serii</span>
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-300/40 group-hover:text-emerald-300 group-hover:translate-x-1 transition-all flex-shrink-0" />
            </div>
          </motion.button>
        ))}
      </motion.div>

      {/* Akcje */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="space-y-3"
      >
        {/* ⚙️ Konfiguracja */}
        <motion.button
          onClick={() => onSelectDay("config")}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-amber-500/20 backdrop-blur-md rounded-xl border border-amber-400/30 p-4 text-left hover:bg-amber-500/30 transition-all duration-300 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/30 border border-amber-400/40 flex items-center justify-center group-hover:rotate-90 transition-transform">
                <Settings className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Konfiguracja planu</h3>
                <p className="text-xs text-amber-300/60">Edytuj ćwiczenia i ustawienia</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-amber-300/60 group-hover:text-amber-300 group-hover:translate-x-0.5 transition-all" />
          </div>
        </motion.button>

        {/* 🔁 Ostatnio trenowany dzień */}
        {dayLabels.length > 1 && (
          <motion.button
            onClick={() => {
              const targetDay = lastTrainedDay || dayLabels[0].day;
              onSelectDay(targetDay);
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-cyan-500/20 backdrop-blur-md rounded-xl border border-cyan-400/30 p-4 text-left hover:bg-cyan-500/30 transition-all duration-300 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/30 border border-cyan-400/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Zap className="w-5 h-5 text-cyan-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">Wznów ostatni trening</h3>
                  <p className="text-xs text-cyan-300/60">
                    Kontynuuj od dnia {lastTrainedDay || "1"}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-cyan-300/60 group-hover:text-cyan-300 group-hover:translate-x-0.5 transition-all" />
            </div>
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}
