import React from "react";
import { toISO } from "../../../shared/utils/dateUtils";
import { Dumbbell, CheckCircle } from "lucide-react";

const WEEKDAY_LABELS = ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"];

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
  const cells = Array(42).fill(null);
  let day = 1;
  for (let i = startingDay; i < startingDay + daysInMonth; i++) {
    cells[i] = day++;
  }

  const todayISO = toISO(today);
  const weekIndex = Math.floor(
    (startingDay + currentDate.getDate() - 1) / 7
  );

  const firstCellIndex = compact ? weekIndex * 7 : 0;
  const lastCellIndex = compact ? weekIndex * 7 + 7 : 42;
  const visibleCells = cells.slice(firstCellIndex, lastCellIndex);

  return (
    <div
      className={[
        "rounded-3xl glass-strong border border-[rgba(var(--rgb-white),0.12)] backdrop-blur-xl",
        "bg-gradient-to-br from-[rgba(var(--rgb-primary-950),0.3)] to-[rgba(var(--rgb-slate-900),0.35)]",
        "shadow-[inset_0_0_24px_rgba(var(--rgb-primary),0.16)]",
        "p-3 sm:p-4 xl:p-3 2xl:p-2",
        "h-full flex flex-col min-h-0",
        "transition-transform duration-700",
        className,
      ].join(" ")}
    >
      {/* Nagłówki dni tygodnia */}
      <div
        className="
          grid grid-cols-7
          gap-1 sm:gap-2 xl:gap-1 2xl:gap-[2px]
          mb-2
        "
      >
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="
              text-center
              text-[11px] sm:text-xs
              font-semibold uppercase tracking-wider
              text-[var(--color-primary-400)]
            "
          >
            {label}
          </div>
        ))}
      </div>

      {/* Dni – okrągłe, większe, kolorowe bubble */}
      <div
        className="
          grid grid-cols-7
          gap-1 sm:gap-2 xl:gap-1 2xl:gap-[2px]
          flex-1 min-h-0
          overflow-y-auto
          pb-1
        "
      >
        {visibleCells.map((d, index) => {
          if (!d) {
            return (
              <div
                key={`empty-${index}`}
                className="flex items-center justify-center py-1"
                // Używamy min-h, aby pusty div miał wysokość (dzięki temu działa aspect-square)
                style={{ minHeight: "calc(var(--bubble-size, 44px) + 0.5rem)" }}
              />
            );
          }

          const date = new Date(y, m, d);
          const key = toISO(date);
          const isToday = key === todayISO;
          const hasWorkout = workoutSet.has(key);
          const hasHabits = habitsDoneSet.has(key);
          const active = hasWorkout || hasHabits;

          return (
            <div
              key={key}
              className="flex items-center justify-center py-1"
            >
              <button
                onClick={(e) => onDayClick?.(key, e)}
                className={[
                  "cal-bubble",
                  active && "cal-bubble-active",
                  isToday && "cal-bubble-today",
                ].join(" ")}
              >
                <span className="z-10">{d}</span>

                {/* Kropki (mobile) */}
                <div className="absolute -bottom-0.5 flex gap-1 sm:hidden">
                  {hasHabits && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary-400)]" />
                  )}
                  {hasWorkout && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-secondary-400)]" />
                  )}
                </div>

                {/* Ikony (≥ sm) */}
                <div className="hidden sm:flex absolute -bottom-1.5 gap-1.5">
                  {hasHabits && (
                    <div className="relative">
                      <CheckCircle
                        size={13}
                        className="text-[var(--color-primary-400)]"
                        strokeWidth={2.2}
                      />
                      <div className="absolute inset-0 bg-[var(--color-primary-400)] rounded-full blur-[2px] opacity-40" />
                    </div>
                  )}
                  {hasWorkout && (
                    <div className="relative">
                      <Dumbbell
                        size={13}
                        className="text-[var(--color-secondary-400)]"
                        strokeWidth={2.2}
                      />
                      <div className="absolute inset-0 bg-[var(--color-secondary-400)] rounded-full blur-[2px] opacity-40" />
                    </div>
                  )}
                </div>

                {/* Puls dla aktywnych dni */}
                {active && (
                  <div
                    className="
                      absolute inset-0 rounded-full
                      bg-gradient-to-br
                        from-[rgba(var(--rgb-primary),0.25)]
                        to-[rgba(var(--rgb-secondary),0.25)]
                      animate-pulse-slow
                    "
                  />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}