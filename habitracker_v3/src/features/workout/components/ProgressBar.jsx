/**
 * ProgressBar - Mobile-First Design
 * - Większy, bardziej widoczny
 * - Gradient animowany
 * - Safe area support
 */
export function ProgressBar({ progress, label }) {
  const pct = Math.round((progress || 0) * 100);

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 bg-black/40 backdrop-blur-xl border-t border-white/10"
      style={{
        paddingBottom: "max(env(safe-area-inset-bottom), 0.75rem)",
      }}
    >
      <div className="mx-auto max-w-4xl px-4 pt-3 pb-2">
        {/* Label */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs sm:text-sm font-medium text-gray-300">
            {label ?? `Postęp treningu`}
          </span>
          <span className="text-xs sm:text-sm font-bold text-cyan-300">
            {pct}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="relative w-full h-2.5 sm:h-3 rounded-full bg-white/10 overflow-hidden shadow-inner">
          {/* Animated gradient fill */}
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-cyan-500 to-emerald-400 transition-all duration-500 ease-out shadow-lg"
            style={{
              width: `${pct}%`,
              boxShadow: "0 0 20px rgba(34, 211, 238, 0.5)",
            }}
          >
            {/* Shine effect */}
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
              style={{
                animation: "shimmer 2s infinite",
              }}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}