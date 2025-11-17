export function ProgressBar({ progress, label }) {
  const pct = Math.round((progress || 0) * 100);

  return (
    <div className="fixed inset-x-0 bottom-0 bg-black/40 backdrop-blur-md border-t border-white/20">
      <div className="mx-auto max-w-md px-4 pt-3 pb-3">
        {/* Label and percentage */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-white/80">
            {label ?? `Postęp treningu`}
          </span>
          <span className="text-xs font-bold text-white">
            {pct}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="relative w-full h-2 rounded-full bg-white/10 overflow-hidden">
          {/* Gradient fill */}
          <div
            className="h-full rounded-full bg-gradient-to-r from-[rgb(var(--rgb-primary))] to-[rgb(var(--color-secondary))] transition-all duration-500 ease-out"
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