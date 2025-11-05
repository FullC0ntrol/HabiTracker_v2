// Calendar.jsx — 7x6 równych wierszy, zajmuje całą przekazaną wysokość, bez aspect-square
import { Dumbbell, CheckCircle2 } from "lucide-react";
import { weekDays, dateKey } from "../../utils/dateUtils";
import clsx from "clsx";

const tierBySets = (sets = 0) => {
  if (sets >= 15) return 4; // beast
  if (sets >= 10) return 3; // hard
  if (sets >= 5) return 2; // medium
  if (sets >= 1) return 1; // light
  return 0; // off
};

// Calendar.jsx – nowe props
export function Calendar({
  className = "",
  calendarDays,
  currentDate,
  today,
  workoutSet,
  habitsDoneSet,
  workoutStatsByDate = {}, // <— NEW
  onDayClick,
}) {
  const dayStatus = (y, m, d) => {
    const key = dateKey(y, m, d);
    const workout = workoutSet.has(key);
    const habitsAll = habitsDoneSet.has(key);
    const stats = workoutStatsByDate[key] || { sets: 0, volume: 0 };
    const tier = tierBySets(stats.sets);
    return { workout, habitsAll, key, tier, stats };
  };

  const dayClasses = ({ workout, habitsAll, isCurrentDay, tier }) => {
    const base =
      "bg-white/5 border border-white/10 backdrop-blur-sm shadow-sm transition-colors";
    // Najpierw heatmapa wg 'tier'
    if (tier === 4)
      return (
        base +
        " bg-gradient-to-br from-fuchsia-500/25 to-rose-500/25 border-rose-400/40 shadow-xl ring-2 ring-rose-400/40"
      );
    if (tier === 3)
      return (
        base +
        " bg-gradient-to-br from-red-500/20 to-orange-500/20 border-orange-400/35 shadow-lg"
      );
    if (tier === 2)
      return (
        base +
        " bg-gradient-to-br from-amber-500/20 to-amber-600/15 border-amber-400/30 shadow"
      );
    if (tier === 1)
      return (
        base +
        " bg-gradient-to-br from-emerald-500/15 to-emerald-600/15 border-emerald-400/25"
      );
    // fallback: brak serii — użyj Twojej dotychczasowej logiki
    if (workout && habitsAll)
      return (
        base +
        " bg-gradient-to-br from-emerald-500/30 to-amber-500/30 border-emerald-400/40 shadow-xl ring-2 ring-cyan-400/40"
      );
    if (workout)
      return (
        base +
        " bg-gradient-to-br from-amber-500/25 to-amber-600/25 border-amber-400/40 shadow-lg"
      );
    if (habitsAll)
      return (
        base +
        " bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border-emerald-400/30 shadow-lg"
      );
    if (isCurrentDay)
      return (
        base + " bg-cyan-500/20 border-cyan-400/40 ring-1 ring-cyan-400/30"
      );
    return base;
  };

  const y = currentDate.getFullYear();
  const m = currentDate.getMonth();

  return (
    <div className={clsx("flex flex-col h-full min-h-0", className)}>
      {/* Pasek nazw dni tygodnia (zawsze 7 kolumn) */}
      <div className="grid grid-cols-7 gap-2 pb-2">
        {weekDays.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] xs:text-[11px] sm:text-xs md:text-sm font-semibold text-cyan-300/90 py-2 uppercase tracking-widest border-b border-cyan-400/20"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Siatka 7x6 — każdy rząd ma równą wysokość i wypełnia dostępną przestrzeń */}
      <div className="grid grid-cols-7 grid-rows-6 gap-2 flex-1 min-h-0">
        {calendarDays.map((day, index) => {
          const isCurrentDay =
            day &&
            day === today.getDate() &&
            m === today.getMonth() &&
            y === today.getFullYear();

          const status = day
            ? dayStatus(y, m, day)
            : { workout: false, habitsAll: false };

          const dateObj = day ? new Date(y, m, day) : null;
          const isWeekend = dateObj
            ? dateObj.getDay() === 0 || dateObj.getDay() === 6
            : false;

          return (
            <button
              key={index}
              onClick={(e) => {
                if (!day) return;
                const d = new Date(y, m, day);
                onDayClick(d, e); // zawsze Date
              }}
              disabled={!day}
              className={clsx(
                "group relative rounded-xl sm:rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70",
                day ? "transition-colors" : "pointer-events-none opacity-40"
              )}
              title="Klik: szczegóły • Shift+klik: szybkie oznaczenie treningu"
            >
              {/* Wysokość komórki kontrolowana przez grid-row. Unikamy aspect-square. */}
              <div
                className={clsx(
                  "w-full h-full p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl",
                  "flex flex-col items-stretch justify-between overflow-hidden min-h-0",
                  dayClasses({ ...status, isCurrentDay })
                )}
              >
                {/* Góra: numer dnia + badge 'dziś' */}
                <div className="w-full flex items-start justify-between">
                  <span
                    className={clsx(
                      "font-bold",
                      "text-base xs:text-lg sm:text-xl md:text-2xl",
                      status.workout || status.habitsAll || isCurrentDay
                        ? "text-white"
                        : "text-gray-200"
                    )}
                  >
                    {day ?? ""}
                  </span>
                  {isCurrentDay && (
                    <span className="text-[10px] xs:text-[11px] px-1.5 py-0.5 rounded-full bg-cyan-400/20 text-cyan-200 border border-cyan-300/30">
                      dziś
                    </span>
                  )}
                </div>

                {/* Ikony statusu (środek) */}
                <div className="flex gap-1.5 mt-0.5 mb-0.5">
                  {status.workout && (
                    <Dumbbell
                      className="w-4 h-4 sm:w-5 sm:h-5 text-amber-200"
                      strokeWidth={2}
                    />
                  )}
                  {status.habitsAll && (
                    <CheckCircle2
                      className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-200"
                      strokeWidth={2}
                    />
                  )}
                </div>

                {/* Dół: delikatny akcent weekendu */}
                <div
                  className={clsx(
                    "h-1 w-10/12 rounded-full mt-1 self-center",
                    isWeekend
                      ? "bg-white/15 group-hover:bg-white/25"
                      : "bg-white/10 group-hover:bg-white/20"
                  )}
                />
              </div>

              {/* Hover ring */}
              {day && (
                <span className="pointer-events-none absolute inset-0 rounded-xl sm:rounded-2xl ring-0 group-hover:ring-2 ring-white/15 transition-all" />
              )}

              {/* SR-only dla dostępności */}
              {day && (
                <span className="sr-only">
                  {`Dzień ${day}. ${
                    status.workout ? "Trening zrobiony. " : ""
                  }${status.habitsAll ? "Nawyki zrobione." : ""}`}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <p className="mt-2 text-[10px] xs:text-[11px] text-white/60">
        Tip: <kbd className="px-1 rounded bg-white/10">Shift</kbd> + klik dnia =
        szybkie oznaczenie treningu
      </p>
    </div>
  );
}
