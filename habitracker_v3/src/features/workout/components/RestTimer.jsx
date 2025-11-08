import { PauseCircle, Play } from "lucide-react";

/**
 * RestTimer - Mobile-First Design
 * - Duży, czytelny timer
 * - Pulsujący efekt
 * - Touch-friendly skip button
 */
export function RestTimer({ secondsLeft, onSkip }) {
  const mm = Math.floor(secondsLeft / 60);
  const ss = secondsLeft % 60;

  // Progress dla wizualnego efektu (zakładając 60s jako standard)
  const progress = Math.max(0, Math.min(100, (secondsLeft / 60) * 100));

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Timer card */}
      <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl text-center">
        {/* Icon with pulse animation */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-6">
          {/* Pulsing background */}
          <div
            className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping"
            style={{ animationDuration: "2s" }}
          />
          
          {/* Progress ring */}
          <div className="absolute inset-0 rounded-full">
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
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <PauseCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Label */}
        <div className="text-sm sm:text-base text-gray-400 mb-2">Przerwa</div>

        {/* Timer display */}
        <div className="text-6xl sm:text-7xl font-extrabold tracking-tight mb-6 tabular-nums">
          <span className="bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">
            {mm}:{ss.toString().padStart(2, "0")}
          </span>
        </div>

        {/* Skip button */}
        <button
          onClick={onSkip}
          className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 hover:from-cyan-500/30 hover:to-blue-500/30 hover:border-cyan-400/50 text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95"
        >
          <Play className="w-5 h-5" strokeWidth={2.5} />
          Pomiń przerwę
        </button>

        {/* Hint text */}
        <p className="mt-4 text-xs text-gray-500">
          Odpocznij przed kolejną serią
        </p>
      </div>
    </div>
  );
}