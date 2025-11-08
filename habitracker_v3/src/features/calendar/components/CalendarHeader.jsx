import React, { forwardRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { monthNames } from "../../../shared/utils/dateUtils";

/**
 * 🌙 CalendarHeader — Glass Neon style (pełne wycentrowanie tytułu)
 */
export const CalendarHeader = forwardRef(
  ({ currentDate, setCurrentDate, onOpenHabits, onPrev, onNext }, ref) => {
    const handleMonthChange = (offset) => {
      setCurrentDate?.(
        (prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1)
      );
    };

    const prev = onPrev || (() => handleMonthChange(-1));
    const next = onNext || (() => handleMonthChange(1));

    return (
      <div ref={ref} className="relative flex items-center justify-between pb-3 sm:pb-4 select-none">
        {/* ⬅️ Lewa strzałka */}
        <button
          onClick={prev}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg border border-white/10 bg-gradient-to-br from-[#0f172a]/60 to-[#020617]/80 hover:border-cyan-400/40 hover:bg-cyan-400/10 shadow-sm hover:shadow-cyan-500/10 transition-all grid place-items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
          title="Poprzedni miesiąc"
          aria-label="Poprzedni miesiąc"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-300" />
        </button>

        {/* 🗓️ Centralny tytuł */}
        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
          <span className="text-[18px] sm:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-emerald-300 to-cyan-500 animate-gradient-x text-center drop-shadow-[0_0_8px_rgba(6,182,212,0.2)] whitespace-nowrap">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <div className="absolute -bottom-1 w-2/3 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent rounded-full" />
        </div>

        {/* ➡️ Prawa sekcja */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenHabits}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg border border-white/10 bg-gradient-to-br from-[#0f172a]/60 to-[#020617]/80 hover:bg-emerald-400/10 hover:border-emerald-400/40 transition-all grid place-items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50"
            title="Nawyki na dziś"
            aria-label="Nawyki na dziś"
          >
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <div className="absolute inset-0 rounded-full bg-emerald-400 blur-md opacity-40 animate-pulse" />
            </div>
          </button>

          <button
            onClick={next}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg border border-white/10 bg-gradient-to-br from-[#0f172a]/60 to-[#020617]/80 hover:border-cyan-400/40 hover:bg-cyan-400/10 shadow-sm hover:shadow-cyan-500/10 transition-all grid place-items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
            title="Następny miesiąc"
            aria-label="Następny miesiąc"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-300" />
          </button>
        </div>
      </div>
    );
  }
);
