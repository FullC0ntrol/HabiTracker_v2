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
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg border border-white/10 bg-gradient-to-br from-[rgb(var(--color-card-bg))]/60 to-[rgb(var(--color-bg-grad-to))]/80 hover:border-[rgb(var(--color-primary-light))]/40 hover:bg-[rgb(var(--rgb-primary))]/10 shadow-sm hover:shadow-[rgb(var(--rgb-primary))]/10 transition-all grid place-items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--rgb-primary))]/60"
          title="Poprzedni miesiąc"
          aria-label="Poprzedni miesiąc"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-[rgb(var(--color-primary-light))]" />
        </button>

        {/* 🗓️ Centralny tytuł */}
        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
          <span className="text-[18px] sm:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[rgb(var(--color-primary-light))] via-[rgb(var(--color-primary))] to-[rgb(var(--color-primary-dark))] animate-gradient-x text-center drop-shadow-[0_0_8px_rgba(var(--rgb-primary),0.2)] whitespace-nowrap">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <div className="absolute -bottom-1 w-2/3 h-px bg-gradient-to-r from-transparent via-[rgb(var(--color-primary-light))]/40 to-transparent rounded-full" />
        </div>

        {/* ➡️ Prawa sekcja */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenHabits}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg border border-white/10 bg-gradient-to-br from-[rgb(var(--color-card-bg))]/60 to-[rgb(var(--color-bg-grad-to))]/80 hover:bg-[rgb(var(--color-secondary))]/10 hover:border-[rgb(var(--color-secondary))]/40 transition-all grid place-items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-secondary))]/50"
            title="Nawyki na dziś"
            aria-label="Nawyki na dziś"
          >
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-[rgb(var(--color-secondary))] animate-pulse" />
              <div className="absolute inset-0 rounded-full bg-[rgb(var(--color-secondary))] blur-md opacity-40 animate-pulse" />
            </div>
          </button>

          <button
            onClick={next}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg border border-white/10 bg-gradient-to-br from-[rgb(var(--color-card-bg))]/60 to-[rgb(var(--color-bg-grad-to))]/80 hover:border-[rgb(var(--color-primary-light))]/40 hover:bg-[rgb(var(--rgb-primary))]/10 shadow-sm hover:shadow-[rgb(var(--rgb-primary))]/10 transition-all grid place-items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--rgb-primary))]/60"
            title="Następny miesiąc"
            aria-label="Następny miesiąc"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-[rgb(var(--color-primary-light))]" />
          </button>
        </div>
      </div>
    );
  }
);

CalendarHeader.displayName = "CalendarHeader";