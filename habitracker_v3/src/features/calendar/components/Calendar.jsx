import React from "react";
import { toISO } from "../../../shared/utils/dateUtils";
import { Dumbbell, CheckCircle, Waves, Sparkles } from "lucide-react";

export function Calendar({
  className = "",
  currentDate,
  today = new Date(),
  workoutSet = new Set(),
  habitsDoneSet = new Set(),
  onDayClick,
  compact = false,
}) {
  const y = currentDate.getFullYear();
  const m = currentDate.getMonth();
  const first = new Date(y, m, 1);
  const last = new Date(y, m + 1, 0);
  const daysInMonth = last.getDate();
  const startingDay = (first.getDay() + 6) % 7;

  const days = [];
  for (let i = 0; i < startingDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  while (days.length < 42) days.push(null);

  const todayISO = toISO(today);
  const weekDays = compact ? days.slice(0, 7) : days;

  // Efekt fal - różne wysokości dla różnych dni
  const getWaveHeight = (dayIndex) => {
    const heights = [20, 25, 30, 35, 40, 35, 30, 25, 20];
    return heights[dayIndex % heights.length];
  };

  return (
    <div
      className={[
        "relative overflow-hidden",
        "grid grid-cols-7",
        compact ? "grid-rows-1" : "grid-rows-6",
        "gap-1 p-4 sm:p-6",
        "glass-strong rounded-3xl border border-white/10",
        "bg-gradient-to-br from-slate-900/40 to-blue-950/30",
        "shadow-2xl shadow-blue-500/10",
        className,
      ].join(" ")}
    >
      {/* Tło z efektem fal */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Warstwy fal */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-blue-500/5 via-transparent to-transparent" />
        
        {/* Punkty świetlne w tle */}
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {weekDays.map((d, i) => {
        if (!d) {
          return (
            <div
              key={`empty-${i}`}
              className="relative rounded-2xl bg-transparent border border-transparent"
            >
              {/* Subtelna fala dla pustych dni */}
              <div 
                className="absolute bottom-0 left-0 right-0 bg-blue-400/5 rounded-full"
                style={{ height: `${getWaveHeight(i)}%` }}
              />
            </div>
          );
        }

        const date = new Date(y, m, d);
        const key = toISO(date);
        const isToday = key === todayISO;
        const hasWorkout = workoutSet.has(key);
        const hasHabits = habitsDoneSet.has(key);
        const active = hasWorkout || hasHabits;
        const waveIntensity = (hasWorkout ? 0.4 : 0) + (hasHabits ? 0.3 : 0);

        return (
          <button
            key={key}
            onClick={(e) => onDayClick?.(key, e)}
            className={[
              "relative rounded-2xl flex flex-col items-center justify-center",
              "transition-all duration-500 group overflow-hidden",
              "border border-white/10 hover:border-white/20",
              "text-xs sm:text-sm font-medium",
              
              // Podstawowe tło z gradientem
              "bg-gradient-to-br from-slate-800/30 to-blue-900/20",
              "hover:from-slate-800/40 hover:to-blue-900/30",
              
              // Efekty aktywnego dnia
              isToday && [
                "ring-2 ring-blue-400/60",
                "bg-gradient-to-br from-blue-500/20 to-cyan-400/10",
                "shadow-lg shadow-blue-500/20",
              ],
              
              active && [
                "shadow-lg",
                hasWorkout && "shadow-blue-500/25",
                hasHabits && "shadow-cyan-500/25",
              ],
            ].join(" ")}
            style={{ aspectRatio: "1 / 1" }}
          >
            {/* Efekt falowego tła */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl">
              {/* Podstawowa fala */}
              <div 
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500/15 to-transparent transition-all duration-700"
                style={{ 
                  height: `${getWaveHeight(d) + (waveIntensity * 30)}%`,
                  opacity: 0.3 + waveIntensity
                }}
              />
              
              {/* Efekt pulsowania dla aktywnych dni */}
              {active && (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-cyan-400/5 animate-pulse rounded-2xl" />
              )}
            </div>

            {/* Kropki energii dla aktywnych dni */}
            {active && (
              <div className="absolute top-1 right-1 flex gap-0.5">
                {hasHabits && (
                  <span className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" />
                )}
                {hasWorkout && (
                  <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" 
                    style={{ animationDelay: "0.2s" }}
                  />
                )}
              </div>
            )}

            {/* Numer dnia */}
            <span
              className={[
                "relative z-10 transition-all duration-300",
                "drop-shadow-sm",
                isToday 
                  ? "text-blue-300 font-bold scale-110" 
                  : active 
                    ? "text-white font-semibold" 
                    : "text-white/70 group-hover:text-white",
              ].join(" ")}
            >
              {d}
            </span>

            {/* Ikony aktywności (hover/aktywne) */}
            <div className={[
              "absolute bottom-2 flex gap-1 transition-all duration-300",
              active ? "opacity-100 scale-100" : "opacity-0 scale-90 group-hover:opacity-60",
            ].join(" ")}>
              {hasHabits && (
                <div className="relative">
                  <CheckCircle size={12} className="text-cyan-400" strokeWidth={2.5} />
                  <div className="absolute inset-0 bg-cyan-400 rounded-full blur-[3px] opacity-50" />
                </div>
              )}
              {hasWorkout && (
                <div className="relative">
                  <Dumbbell size={12} className="text-blue-400" strokeWidth={2.5} />
                  <div className="absolute inset-0 bg-blue-400 rounded-full blur-[3px] opacity-50" />
                </div>
              )}
            </div>

            {/* Efekt iskier przy najechaniu */}
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent animate-pulse" />
            </div>

            {/* Wskaźnik "dziś" */}
            {isToday && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full animate-ping" />
            )}
          </button>
        );
      })}

      {/* Dekoracyjne elementy */}
      <div className="absolute top-4 left-4 opacity-20">
        <Waves size={16} className="text-blue-400" />
      </div>
      <div className="absolute bottom-4 right-4 opacity-20">
        <Sparkles size={16} className="text-cyan-400" />
      </div>
    </div>
  );
}