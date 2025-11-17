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
        className="w-10 h-10 rounded-lg border border-white/10 bg-gradient-to-br from-[rgb(var(--color-card-bg))]/70 to-[rgb(var(--color-bg-grad-to))]/90 hover:bg-[rgb(var(--rgb-primary))]/10 hover:border-[rgb(var(--color-primary-light))]/40 hover:shadow-[rgb(var(--rgb-primary))]/20 transition-all grid place-items-center disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--rgb-primary))]/60"
        title="Poprzedni miesiąc"
        aria-label="Poprzedni miesiąc"
      >
        <ChevronLeft className="w-5 h-5 text-[rgb(var(--color-primary-light))]" />
      </button>

      <div className="h-6 w-px bg-white/10" aria-hidden="true" />

      <button
        onClick={onNext}
        disabled={disabledNext}
        className="w-10 h-10 rounded-lg border border-white/10 bg-gradient-to-br from-[rgb(var(--color-card-bg))]/70 to-[rgb(var(--color-bg-grad-to))]/90 hover:bg-[rgb(var(--rgb-primary))]/10 hover:border-[rgb(var(--color-primary-light))]/40 hover:shadow-[rgb(var(--rgb-primary))]/20 transition-all grid place-items-center disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--rgb-primary))]/60"
        title="Następny miesiąc"
        aria-label="Następny miesiąc"
      >
        <ChevronRight className="w-5 h-5 text-[rgb(var(--color-primary-light))]" />
      </button>
    </div>
  );
}