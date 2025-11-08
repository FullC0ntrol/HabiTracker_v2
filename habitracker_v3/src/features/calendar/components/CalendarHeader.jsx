import React, { forwardRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { monthNames } from "../../../shared/utils/dateUtils";

/**
 * Pasek nagłówka miesiąca: nazwa, rok, przyciski < >
 */
export const CalendarHeader = forwardRef(
  ({ currentDate, setCurrentDate, onOpenHabits }, ref) => {
    const handleMonthChange = (offset) => {
      setCurrentDate(
        (prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1)
      );
    };

    return (
      <div
        ref={ref}
        className="flex items-center justify-between pb-4 select-none"
      >
        <button
          onClick={() => handleMonthChange(-1)}
          className="w-11 h-11 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-cyan-400/30 transition-colors grid place-items-center shadow"
          title="Poprzedni miesiąc"
        >
          <ChevronLeft className="w-6 h-6 text-cyan-300" />
        </button>

        <span className="text-2xl sm:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-cyan-300 to-cyan-500 drop-shadow text-center">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenHabits}
            className="w-11 h-11 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-emerald-400/30 transition-colors grid place-items-center shadow"
            title="Nawyki na dziś"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </button>
          <button
            onClick={() => handleMonthChange(1)}
            className="w-11 h-11 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-cyan-400/30 transition-colors grid place-items-center shadow"
            title="Następny miesiąc"
          >
            <ChevronRight className="w-6 h-6 text-cyan-300" />
          </button>
        </div>
      </div>
    );
  }
);
