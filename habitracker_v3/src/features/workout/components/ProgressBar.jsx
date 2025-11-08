// /workout/ProgressBar.jsx
export function ProgressBar({ progress, label }) {
  const pct = Math.round((progress || 0) * 100);
  return (
    <div className="fixed inset-x-0 bottom-0 z-40">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 pb-[max(env(safe-area-inset-bottom),0.5rem)]">
        <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden border border-white/10 backdrop-blur">
          <div
            className="h-full bg-gradient-to-r from-cyan-400/80 to-emerald-400/80 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-1 text-[11px] text-white/70">{label ?? `Postęp: ${pct}%`}</div>
      </div>
    </div>
  );
}
