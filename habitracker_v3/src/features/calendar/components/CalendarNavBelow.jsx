import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Dolna nawigacja kalendarza — poprzedni / następny miesiąc.
 * Używana głównie w widokach mobilnych.
 */
export function CalendarNavBelow({ onPrev, onNext, disabledPrev, disabledNext }) {
  return (
    <div className="mt-3 flex items-center justify-center gap-4 select-none">
      <button
        onClick={onPrev}
        disabled={disabledPrev}
        className="w-11 h-11 rounded-xl border border-white/10 bg-white/5 
                   hover:bg-white/10 hover:border-cyan-400/30 
                   transition-colors grid place-items-center shadow 
                   focus:outline-none focus-visible:ring-2 
                   focus-visible:ring-cyan-400/60 disabled:opacity-40 disabled:cursor-not-allowed"
        title="Poprzedni miesiąc"
        aria-label="Poprzedni miesiąc"
      >
        <ChevronLeft className="w-6 h-6 text-cyan-300" />
      </button>

      <div className="h-8 w-px bg-white/10" aria-hidden="true" />

      <button
        onClick={onNext}
        disabled={disabledNext}
        className="w-11 h-11 rounded-xl border border-white/10 bg-white/5 
                   hover:bg-white/10 hover:border-cyan-400/30 
                   transition-colors grid place-items-center shadow 
                   focus:outline-none focus-visible:ring-2 
                   focus-visible:ring-cyan-400/60 disabled:opacity-40 disabled:cursor-not-allowed"
        title="Następny miesiąc"
        aria-label="Następny miesiąc"
      >
        <ChevronRight className="w-6 h-6 text-cyan-300" />
      </button>
    </div>
  );
}
