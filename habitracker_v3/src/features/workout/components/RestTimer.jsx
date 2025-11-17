import { Play } from "lucide-react";

export function RestTimer({ secondsLeft, onSkip }) {
  const mm = Math.floor(secondsLeft / 60);
  const ss = secondsLeft % 60;

  const progress = Math.max(0, Math.min(100, (secondsLeft / 60) * 100));

  return (
    <div className="w-full max-w-sm mx-auto p-4">
      {/* Timer card */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center">
        {/* Timer display */}
        <div className="text-5xl font-bold tracking-tight mb-4 tabular-nums">
          <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            {mm}:{ss.toString().padStart(2, "0")}
          </span>
        </div>

        {/* Progress ring */}
        <div className="relative w-20 h-20 mx-auto mb-4">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="6"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#timer-gradient)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${progress * 2.827} 282.7`}
              className="transition-all duration-1000"
            />
            <defs>
              <linearGradient id="timer-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgb(var(--rgb-primary))" />
                <stop offset="100%" stopColor="rgb(var(--color-secondary))" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Label */}
        <div className="text-sm text-white/60 mb-4">Przerwa</div>

        {/* Skip button */}
        <button
          onClick={onSkip}
          className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-white/10 border border-white/20 hover:bg-white/15 text-white font-medium transition-all active:scale-95"
        >
          <Play className="w-4 h-4" />
          Pomiń przerwę
        </button>

        {/* Hint text */}
        <p className="mt-3 text-xs text-white/40">
          Odpocznij przed kolejną serią
        </p>
      </div>
    </div>
  );
}