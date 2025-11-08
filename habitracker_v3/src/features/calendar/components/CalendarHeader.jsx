import React, { forwardRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { monthNames } from "../../../shared/utils/dateUtils";

/**
 * Kompaktowy header: niższe przyciski i mniejsza typografia na mobile.
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
      <div ref={ref} className="flex items-center justify-between pb-2 sm:pb-3 select-none">
        <button
          onClick={prev}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-cyan-400/30 transition-colors grid place-items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
          title="Poprzedni miesiąc"
          aria-label="Poprzedni miesiąc"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-300" />
        </button>

        <span className="text-[18px] sm:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-cyan-500 text-center">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenHabits}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-emerald-400/30 transition-colors grid place-items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50"
            title="Nawyki na dziś"
            aria-label="Nawyki na dziś"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
          </button>
          <button
            onClick={next}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-cyan-400/30 transition-colors grid place-items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
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
