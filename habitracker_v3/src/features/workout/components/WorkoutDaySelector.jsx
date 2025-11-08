import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Settings, Dumbbell } from "lucide-react";

export function WorkoutDaySelector({ plan, onSelectDay }) {
  if (!plan?.items) return null;

  const uniqueDays = [...new Set(plan.items.map((i) => i.day))];
  const dayLabels = uniqueDays.map((d, i) => ({
    day: d,
    label: `Dzień ${i + 1}`,
    exercises: plan.items.filter((it) => it.day === d),
  }));

  return (
    <motion.div className="fixed inset-0 flex flex-col items-center justify-center backdrop-blur-md bg-black/40 text-white">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold mb-8 text-cyan-300"
      >
        {plan.name}
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-3xl px-4"
      >
        {dayLabels.map((d) => (
          <motion.button
            key={d.day}
            onClick={() => onSelectDay(d.day)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="bg-white/10 hover:bg-cyan-500/20 border border-cyan-400/30 rounded-2xl p-6 text-center transition backdrop-blur"
          >
            <Dumbbell className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
            <div className="text-xl font-semibold">{d.label}</div>
            <div className="text-sm text-white/60 mt-1">
              {d.exercises.length} ćwiczeń
            </div>
          </motion.button>
        ))}

        {/* Konfiguracja */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onSelectDay("config")}
          className="bg-white/10 hover:bg-emerald-500/20 border border-emerald-400/30 rounded-2xl p-6 text-center transition backdrop-blur"
        >
          <Settings className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
          <div className="text-xl font-semibold">Konfiguracja</div>
          <div className="text-sm text-white/60 mt-1">Edytuj plan</div>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
