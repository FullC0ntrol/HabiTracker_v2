import { PauseCircle, Play } from "lucide-react";

export function RestTimer({ secondsLeft, onSkip }) {
  const mm = Math.floor(secondsLeft / 60);
  const ss = secondsLeft % 60;

  const progress = Math.max(0, Math.min(100, (secondsLeft / 60) * 100));

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Timer card */}
      <div className="bg-white/5 backdrop-blur-md border border-[rgb(var(--color-primary-light))]/20 rounded-2xl p-6 text-center">
        {/* Timer display */}
        <div className="text-5xl font-bold tracking-tight mb-4 tabular-nums">
          <span className="bg-gradient-to-r from-[rgb(var(--color-primary-light))] to-[rgb(var(--color-secondary))] bg-clip-text text-transparent">
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
                <stop offset="0%" stopColor="rgb(var(--color-primary-light))" />
                <stop offset="100%" stopColor="rgb(var(--color-secondary))" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <PauseCircle className="w-8 h-8 text-[rgb(var(--color-primary-light))]" strokeWidth={2} />
          </div>
        </div>

        {/* Label */}
        <div className="text-sm text-[rgb(var(--color-primary-light))]/60 mb-4">Przerwa</div>

        {/* Skip button */}
        <button
          onClick={onSkip}
          className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[rgb(var(--rgb-primary))]/20 border border-[rgb(var(--color-primary-light))]/30 hover:bg-[rgb(var(--rgb-primary))]/30 hover:border-[rgb(var(--color-primary-light))]/50 text-white font-medium transition-all duration-300 active:scale-95"
        >
          <Play className="w-4 h-4" strokeWidth={2.5} />
          Pomiń przerwę
        </button>

        {/* Hint text */}
        <p className="mt-3 text-xs text-[rgb(var(--color-primary-light))]/40">
          Odpocznij przed kolejną serią
        </p>
      </div>
    </div>
  );
}