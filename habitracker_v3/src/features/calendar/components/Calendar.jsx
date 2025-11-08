import React from "react";
import { toISO } from "../../../shared/utils/dateUtils";
import { Dumbbell, CheckCircle } from "lucide-react";

/**
 * Kalendarz miesięczny – 7×6
 * Mobile-first: na telefonach kratki są proste, zwarte i czytelne
 * (mniejsze odstępy, brak cienia i skalowania). Na tabletach/desktopie
 * wchodzą „sm:” ulepszenia (glow, ikony, większe odstępy).
 */
export function Calendar({
  className = "",
  currentDate,
  today = new Date(),
  workoutSet = new Set(),
  habitsDoneSet = new Set(),
  onDayClick,
}) {
  const y = currentDate.getFullYear();
  const m = currentDate.getMonth();

  const first = new Date(y, m, 1);
  const last = new Date(y, m + 1, 0);
  const daysInMonth = last.getDate();
  const startingDay = (first.getDay() + 6) % 7; // poniedziałek = 0

  const days = [];
  for (let i = 0; i < startingDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  while (days.length < 42) days.push(null);

  const todayISO = toISO(today);

  return (
    <div
      className={[
        className,
        // Mobile: ciaśniej i bez mocnych efektów
        "grid grid-cols-7 grid-rows-6 gap-[2px] p-2 rounded-2xl",
        "bg-black/10 border border-white/10",
        // Tablet/desktop: więcej oddechu i delikatny gradient + blur
        "sm:gap-2 sm:p-3 sm:rounded-3xl sm:bg-gradient-to-br sm:from-slate-800/40 sm:to-slate-900/40 sm:backdrop-blur-sm",
      ].join(" ")}
      style={{ minHeight: 320 }}
    >
      {days.map((d, i) => {
        if (!d) {
          return (
            <div
              key={`empty-${i}`}
              className="bg-transparent rounded-lg sm:rounded-xl border border-transparent sm:border-white/5"
              style={{ minHeight: 0 }}
            />
          );
        }

        const date = new Date(y, m, d);
        const key = toISO(date);
        const isToday = key === todayISO;
        const hasWorkout = workoutSet.has(key);
        const allHabitsDone = habitsDoneSet.has(key);
        const hasActivity = hasWorkout || allHabitsDone;

        return (
          <button
            key={key}
            onClick={(e) => onDayClick?.(key, e)}
            className={[
              "relative w-full h-full rounded-lg sm:rounded-xl",
              "flex flex-col items-center justify-center",
              "text-[12px] sm:text-sm font-medium",
              "bg-black/25", // solid na mobile dla czytelności
              "sm:bg-black/20 sm:hover:bg-black/30",
              "border border-white/10 sm:border-white/10",
              // Zero skalowania na mobile (unika „skaczących” wierszy)
              "transition-colors sm:transition-all sm:duration-300",
              // Dzień dzisiejszy: ring (nie zmienia layoutu)
              isToday
                ? "ring-1 sm:ring-2 ring-cyan-400"
                : "",
              // Na desktopie subtelny cień i glow przy aktywności
              hasActivity
                ? "sm:shadow-lg sm:shadow-cyan-500/10"
                : "sm:hover:shadow-lg sm:hover:shadow-cyan-500/10",
              // Skalowanie tylko od sm+
              hasActivity
                ? "sm:scale-95 sm:hover:scale-100"
                : "sm:hover:scale-[1.02]",
            ].join(" ")}
            style={{ minHeight: 0 }}
          >
            {/* Numer dnia */}
            <span
              className={[
                "leading-none",
                isToday ? "text-cyan-200" : "text-white/80 sm:group-hover:text-white",
              ].join(" ")}
            >
              {d}
            </span>

            {/* Wskaźniki aktywności (MOBILE: kropki, DESKTOP: ikony) */}
            {/* Mobile – małe, czyste kropki */}
            <div className="absolute bottom-1.5 flex gap-1 sm:hidden">
              {allHabitsDone && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              )}
              {hasWorkout && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-300" />
              )}
            </div>

            {/* Tablet/desktop – ikonki z delikatnym glow */}
            <div className="absolute bottom-2 hidden sm:flex gap-1.5">
              {allHabitsDone && (
                <div className="relative">
                  <CheckCircle
                    size={14}
                    className="text-emerald-400 drop-shadow-md"
                    strokeWidth={2.4}
                  />
                  <div className="absolute inset-0 bg-emerald-400 rounded-full blur-[2px] opacity-30" />
                </div>
              )}
              {hasWorkout && (
                <div className="relative">
                  <Dumbbell
                    size={14}
                    className="text-cyan-300 drop-shadow-md"
                    strokeWidth={2.4}
                  />
                  <div className="absolute inset-0 bg-cyan-300 rounded-full blur-[2px] opacity-30" />
                </div>
              )}
            </div>

            {/* Subtelny highlight na hover – tylko od sm+ */}
            <div className="hidden sm:block absolute inset-0 rounded-xl bg-gradient-to-br from-white/5 to-transparent opacity-0 sm:group-hover:opacity-100 transition-opacity" />

            {/* Delikatny puls dla aktywnych – tylko od md (żeby nie migało na wąskich) */}
            {hasActivity && (
              <div className="hidden md:block pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-500/8 to-emerald-500/8" />
            )}
          </button>
        );
      })}
    </div>
  );
}
