import React from "react";
import { motion } from "framer-motion";
import { Settings, Dumbbell, ChevronRight, Zap } from "lucide-react";

/**
 * WorkoutDaySelector — premium, ale responsywny pod telefony i 720×480.
 * - Kompaktowe pady/rozmiary na mobile
 * - Siatka 1→2→3 kolumn
 * - Płynne animacje bez „przeładowania”
 */
export function WorkoutDaySelector({ plan, onSelectDay }) {
  if (!plan?.items) return null;

  const uniqueDays = [...new Set(plan.items.map((i) => i.day))];
  const dayLabels = uniqueDays.map((d, i) => ({
    day: d,
    label: `Dzień ${i + 1}`,
    exercises: plan.items.filter((it) => it.day === d),
  }));

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-start sm:justify-center bg-mesh overflow-y-auto py-4 sm:py-0">
      {/* Tło / blur */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60 backdrop-blur-xl" />

      {/* Zawartość */}
      <div className="relative z-10 w-full max-w-2xl px-4 py-6 sm:py-8">
        {/* Nagłówek */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-6 sm:mb-10"
        >
          {/* Ikona planu */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4
                       rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600
                       flex items-center justify-center
                       shadow-xl shadow-cyan-500/30"
          >
            <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-white" strokeWidth={2.5} />
          </motion.div>

          {/* Nazwa planu */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3">
            <span className="bg-gradient-to-r from-cyan-200 via-cyan-100 to-white bg-clip-text text-transparent drop-shadow-lg">
              {plan.name}
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-gray-300/80 max-w-md mx-auto">
            Wybierz dzień treningu lub przejdź do konfiguracji planu
          </p>
        </motion.div>

        {/* Siatka dni */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6"
        >
          {dayLabels.map((d, index) => (
            <motion.button
              key={d.day}
              onClick={() => onSelectDay(d.day)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.08 }}
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="group relative overflow-hidden rounded-2xl p-4 sm:p-6
                         bg-gradient-to-br from-gray-800/60 to-gray-900/60
                         backdrop-blur-xl border border-white/10
                         hover:border-cyan-400/40
                         shadow-md hover:shadow-xl hover:shadow-cyan-500/20
                         transition-all duration-300"
            >
              {/* Glow w hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/10 group-hover:to-blue-500/10 transition-all duration-500" />

              {/* Treść */}
              <div className="relative z-10">
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg
                             bg-gradient-to-br from-cyan-500/20 to-blue-500/20
                             backdrop-blur-sm border border-cyan-400/30
                             flex items-center justify-center mb-3 sm:mb-4
                             group-hover:scale-110 group-hover:border-cyan-400/50
                             transition-all duration-300
                             shadow-md shadow-cyan-500/20"
                >
                  <Dumbbell className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-300 group-hover:text-cyan-200" strokeWidth={2.5} />
                </div>

                <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2 text-white group-hover:text-cyan-100 transition-colors duration-300">
                  {d.label}
                </h3>

                <p className="text-xs sm:text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                  {d.exercises.length} {d.exercises.length === 1 ? "ćwiczenie" : "ćwiczeń"}
                </p>

                <ChevronRight
                  className="absolute bottom-4 right-4 w-4 h-4 sm:w-5 sm:h-5 text-cyan-400/40
                             group-hover:text-cyan-400 group-hover:translate-x-1
                             transition-all duration-300"
                  strokeWidth={2.5}
                />
              </div>

              {/* Shine */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-700" />
            </motion.button>
          ))}
        </motion.div>

        {/* Konfiguracja */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 + dayLabels.length * 0.08 }}
          onClick={() => onSelectDay("config")}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="group relative w-full overflow-hidden
                     rounded-2xl p-4 sm:p-5
                     bg-gradient-to-br from-emerald-800/40 to-emerald-900/40
                     backdrop-blur-xl border border-emerald-400/30
                     hover:border-emerald-400/50
                     shadow-md hover:shadow-xl hover:shadow-emerald-500/20
                     transition-all duration-300
                     flex items-center justify-between"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 to-emerald-400/0 group-hover:from-emerald-500/10 group-hover:to-emerald-400/10 transition-all duration-500" />

          <div className="relative z-10 flex items-center gap-3 sm:gap-4">
            <div
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg
                         bg-gradient-to-br from-emerald-500/20 to-emerald-600/20
                         backdrop-blur-sm border border-emerald-400/30
                         flex items-center justify-center
                         group-hover:scale-110 group-hover:border-emerald-400/50
                         group-hover:rotate-90
                         transition-all duration-300
                         shadow-md shadow-emerald-500/20"
            >
              <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-300 group-hover:text-emerald-200" strokeWidth={2.5} />
            </div>

            <div className="text-left">
              <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-emerald-100 transition-colors">
                Konfiguracja
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                Edytuj plan treningowy
              </p>
            </div>
          </div>

          <ChevronRight
            className="relative z-10 w-5 h-5 text-emerald-400/60 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all duration-300"
            strokeWidth={2.5}
          />

          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-700" />
        </motion.button>
      </div>
    </div>
  );
}
