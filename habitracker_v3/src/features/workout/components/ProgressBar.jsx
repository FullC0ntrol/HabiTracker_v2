export function ProgressBar({ progress, label }) {
  const pct = Math.round((progress || 0) * 100);

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 bg-black/40 backdrop-blur-md border-t border-emerald-500/20">
      <div className="mx-auto max-w-2xl px-4 pt-3 pb-3">
        {/* Label and percentage */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-emerald-300/80">
            {label ?? `Postęp treningu`}
          </span>
          <span className="text-xs font-bold text-emerald-300">
            {pct}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="relative w-full h-2 rounded-full bg-white/10 overflow-hidden">
          {/* Gradient fill */}
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-500 ease-out shadow-lg shadow-emerald-500/30"
            style={{
              width: `${pct}%`,
            }}
          >
            {/* Shine effect */}
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
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