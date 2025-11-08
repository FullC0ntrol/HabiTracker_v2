import React from "react";
import { toISO } from "../../../shared/utils/dateUtils";
import { Dumbbell, CheckCircle } from "lucide-react";

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
  const weekDays = compact ? days.slice(0, 7) : days; // widok tygodniowy

  return (
    <div
      className={[
        // siatka
        "grid grid-cols-7",
        compact ? "grid-rows-1" : "grid-rows-6",

        // odstępy / padding podstawowo
        "gap-[3px] sm:gap-2 p-3 sm:p-4",

        // na dużych ekranach: ciaśniej i mniejsza skala
        "xl:p-2 xl:gap-1 xl:origin-top xl:scale-[0.86]",
        "2xl:p-1.5 2xl:gap-[2px] 2xl:scale-[0.76]",

        // szkło + tło
        "rounded-3xl glass-strong border border-white/10 backdrop-blur-xl",
        "bg-gradient-to-br from-emerald-950/25 to-slate-900/25",
        "shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]",

        "transition-transform duration-700",
        className,
      ].join(" ")}
    >
      {weekDays.map((d, i) => {
        if (!d) {
          return <div key={`empty-${i}`} className="rounded-xl bg-transparent" />;
        }

        const date = new Date(y, m, d);
        const key = toISO(date);
        const isToday = key === todayISO;
        const hasWorkout = workoutSet.has(key);
        const hasHabits = habitsDoneSet.has(key);
        const active = hasWorkout || hasHabits;

        return (
          <button
            key={key}
            onClick={(e) => onDayClick?.(key, e)}
            className={[
              "relative rounded-xl flex flex-col items-center justify-center font-semibold",
              "transition-all duration-200 group overflow-hidden",

              // rozmiar cyfr: lekko mniejszy na xl/2xl
              "text-xs sm:text-sm xl:text-[11px] 2xl:text-[10px]",

              "bg-black/20 border border-white/10 hover:bg-black/30",
              isToday && "ring-1 ring-emerald-400/70",
              active
                ? "shadow-[0_0_12px_rgba(16,185,129,0.25)] hover:scale-[1.02]"
                : "hover:scale-[1.03]",
            ].join(" ")}
            style={{ aspectRatio: "1 / 1" }}
          >
            <span
              className={`z-10 ${
                isToday
                  ? "text-emerald-300 drop-shadow-[0_0_6px_rgba(16,185,129,0.6)]"
                  : "text-white/80 group-hover:text-white"
              }`}
            >
              {d}
            </span>

            {/* Kropki (mobile) */}
            <div className="absolute bottom-1 flex gap-1 sm:hidden">
              {hasHabits && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
              {hasWorkout && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
            </div>

            {/* Ikony (≥sm) */}
            <div className="hidden sm:flex absolute bottom-2 gap-1.5">
              {hasHabits && (
                <div className="relative">
                  <CheckCircle size={14} className="text-emerald-400" strokeWidth={2.2} />
                  <div className="absolute inset-0 bg-emerald-400 rounded-full blur-[2px] opacity-40" />
                </div>
              )}
              {hasWorkout && (
                <div className="relative">
                  <Dumbbell size={14} className="text-cyan-400" strokeWidth={2.2} />
                  <div className="absolute inset-0 bg-cyan-400 rounded-full blur-[2px] opacity-40" />
                </div>
              )}
            </div>

            {/* Subtelny puls gdy coś zaplanowane/wykonane */}
            {active && (
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 animate-pulse-slow" />
            )}
          </button>
        );
      })}
    </div>
  );
}
