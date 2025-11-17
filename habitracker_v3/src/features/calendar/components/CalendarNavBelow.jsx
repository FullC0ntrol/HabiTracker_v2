import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * 📅 Dolna nawigacja kalendarza — Glass Neon style
 * Widoczna na mobile (np. 480–800px)
 */
export function CalendarNavBelow({ onPrev, onNext, disabledPrev, disabledNext }) {
  return (
    <div className="flex items-center justify-center gap-3 select-none mt-2">
      <button
        onClick={onPrev}
        disabled={disabledPrev}
        className="w-10 h-10 rounded-lg border border-[rgba(var(--rgb-white),0.1)] bg-gradient-to-br from-[rgba(var(--rgb-slate-900),0.7)] to-[rgba(var(--rgb-slate-950),0.9)] hover:bg-[rgba(var(--rgb-secondary-400),0.1)] hover:border-[rgba(var(--rgb-secondary-400),0.4)] hover:shadow-[var(--color-secondary)]/20 transition-all grid place-items-center disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--rgb-secondary-400),0.6)]"
        title="Poprzedni miesiąc"
        aria-label="Poprzedni miesiąc"
      >
        <ChevronLeft className="w-5 h-5 text-[var(--color-secondary-300)]" />
      </button>

      <div className="h-6 w-px bg-[rgba(var(--rgb-white),0.1)]" aria-hidden="true" />

      <button
        onClick={onNext}
        disabled={disabledNext}
        className="w-10 h-10 rounded-lg border border-[rgba(var(--rgb-white),0.1)] bg-gradient-to-br from-[rgba(var(--rgb-slate-900),0.7)] to-[rgba(var(--rgb-slate-950),0.9)] hover:bg-[rgba(var(--rgb-secondary-400),0.1)] hover:border-[rgba(var(--rgb-secondary-400),0.4)] hover:shadow-[var(--color-secondary)]/20 transition-all grid place-items-center disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--rgb-secondary-400),0.6)]"
        title="Następny miesiąc"
        aria-label="Następny miesiąc"
      >
        <ChevronRight className="w-5 h-5 text-[var(--color-secondary-300)]" />
      </button>
    </div>
  );
}