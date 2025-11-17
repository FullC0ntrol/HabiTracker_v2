import { forwardRef } from 'react';
import { CheckCircle, Dumbbell } from 'lucide-react';

// --- MOCKOWANE ZALEŻNOŚCI ---
const monthNames = [
  "Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec",
  "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"
];

const toISO = (date) => {
  if (!date) return "";
  return date.toISOString().split('T')[0];
};

const ChevronLeft = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
);
const ChevronRight = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
);
// --- KONIEC MOCKOWANYCH ZALEŻNOŚCI ---


/**
 * @component CalendarHeader
 * ZAKTUALIZOWANY: Używa klas narzędziowych zdefiniowanych w index.css
 */
export const CalendarHeader = forwardRef(
  ({ currentDate, setCurrentDate, onOpenHabits, onPrev, onNext, onTitleClick }, ref) => {
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
          className="btn-header-cyan-action"
          title="Poprzedni miesiąc"
          aria-label="Poprzedni miesiąc"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--color-secondary-400)]" />
        </button>

        {/* 🗓️ Centralny tytuł */}
        <button className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center" onClick={onTitleClick}>
          <span className="text-[18px] sm:text-3xl font-extrabold tracking-tight header-title-gradient whitespace-nowrap">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          {/* Używamy tutaj zmiennej CSS dla koloru w tle */}
          <div className="absolute -bottom-1 w-2/3 h-px bg-gradient-to-r from-transparent via-[var(--color-primary-400)]/40 to-transparent rounded-full" />
        </button>

        {/* ➡️ Prawa sekcja */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenHabits}
            className="btn-header-emerald-action"
            title="Nawyki na dziś"
            aria-label="Nawyki na dziś"
          >
            <div className="relative">
              {/* Używamy zmiennej CSS */}
              <div className="w-2 h-2 rounded-full bg-[var(--color-primary-400)] animate-pulse" />
              <div className="absolute inset-0 rounded-full bg-[var(--color-primary-400)] blur-md opacity-40 animate-pulse" />
            </div>
          </button>

          <button
            onClick={next}
            className="btn-header-cyan-action"
            title="Następny miesiąc"
            aria-label="Następny miesiąc"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--color-secondary-400)]" />
          </button>
        </div>
      </div>
    );
  }
);
CalendarHeader.displayName = "CalendarHeader";