import React from "react";
import { toISO } from "../../../shared/utils/dateUtils";

/**
 * Komponent kalendarza miesięcznego (czysta siatka dni).
 * Nie pobiera danych – renderuje na podstawie propsów.
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

  // liczba dni w miesiącu + pierwszy dzień tygodnia
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
      className={`${className} grid grid-cols-7 gap-px bg-white/10 rounded-2xl overflow-hidden`}
    >
      {days.map((d, i) => {
        if (!d) {
          return (
            <div key={`empty-${i}`} className="bg-black/30 aspect-square" />
          );
        }

        const date = new Date(y, m, d);
        const key = toISO(date);
        const isToday = key === todayISO;
        const hasWorkout = workoutSet.has(key);
        const allHabitsDone = habitsDoneSet.has(key);

        return (
          <button
            key={key}
            onClick={(e) => onDayClick?.(key, e)}
            className={`
              relative aspect-square bg-black/20 hover:bg-black/30 transition-colors
              text-white text-sm font-medium
              flex flex-col items-center justify-center
              ${isToday ? "ring-2 ring-cyan-400 z-10" : ""}
            `}
          >
            <span>{d}</span>

            {/* Dwie kropki statusu (habit / workout) */}
            <div className="absolute bottom-1 flex gap-1">
              {allHabitsDone && (
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              )}
              {hasWorkout && (
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
