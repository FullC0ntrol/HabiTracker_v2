import { X, Check, Lock } from "lucide-react";

/**
 * Panel boczny do odhaczania nawyków (widok tylko dla dnia dzisiejszego).
 * 
 * Props:
 * - open: bool — czy panel otwarty
 * - onClose: () => void
 * - todayISO: string (np. "2025-11-05")
 * - habits: Habit[]
 * - todayCounts: Record<habitId, number>
 * - onIncrement: (habitId: number, delta: number) => void
 */
export function HabitSidebar({
  open,
  onClose,
  todayISO,
  habits = [],
  todayCounts = {},
  onIncrement,
}) {
  // Lokalne "dzisiaj" (Europe/Warsaw)
  const nowISO = new Date().toLocaleDateString("en-CA", {
    timeZone: "Europe/Warsaw",
  });
  const isToday = todayISO === nowISO;

  /** Sortowanie: najpierw nieukończone, potem według progresu */
  const sorted = [...habits].sort((a, b) => {
    const aDone = todayCounts[a.id] || 0;
    const bDone = todayCounts[b.id] || 0;
    const aMissing = a.target ? Math.max(0, a.target - aDone) : (aDone > 0 ? 0 : 1);
    const bMissing = b.target ? Math.max(0, b.target - bDone) : (bDone > 0 ? 0 : 1);
    if (aMissing === 0 && bMissing > 0) return 1;
    if (aMissing > 0 && bMissing === 0) return -1;
    return bMissing - aMissing;
  });

  const setCount = (habitId, desired, current) => {
    if (!isToday) return;
    const delta = desired - current;
    if (delta !== 0) onIncrement?.(habitId, delta);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={`fixed right-0 top-0 z-50 h-full w-[90%] max-w-[380px]
          bg-gradient-to-b from-[#0f0f10]/95 to-[#1a1a1d]/95
          border-l border-white/10 backdrop-blur-xl shadow-2xl
          transition-transform duration-300 ease-out
          ${open ? "translate-x-0" : "translate-x-full"}`}
        role="complementary"
        aria-label="Nawyki do odhaczania"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/5 backdrop-blur-sm">
          <div>
            <div className="text-xs text-white/60 uppercase tracking-wide">Dzień</div>
            <div className="text-base font-semibold text-white">{todayISO}</div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg border border-white/10 hover:bg-white/10 text-white/80 hover:text-white transition"
            aria-label="Zamknij panel nawyków"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info banner */}
        {!isToday && (
          <div className="mx-4 mt-4 mb-0 rounded-lg border border-white/10 bg-white/5 text-white/80 px-3 py-2 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span className="text-sm">
              Możesz odhaczać tylko <span className="font-semibold">dzisiaj</span> ({nowISO}).
            </span>
          </div>
        )}

        {/* Lista nawyków */}
        <div className="h-[calc(100%-4.25rem)] overflow-y-auto p-4">
          {sorted.length === 0 ? (
            <div className="mt-10 text-center text-white/70 text-sm">
              Brak nawyków do wyświetlenia.
            </div>
          ) : (
            <ul className="space-y-3">
              {sorted.map((h) => {
                const done = todayCounts[h.id] || 0;
                const target = h.target ?? 1;
                const unit = h.unit || "count";
                const isDone = done >= target;

                // 🟢 Checkbox (target == 1)
                const renderSingle = () => {
                  const checked = done >= 1;
                  const label = checked ? "Odznacz" : "Odhacz";
                  return (
                    <button
                      onClick={() => setCount(h.id, checked ? 0 : 1, done)}
                      disabled={!isToday}
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition
                        ${checked
                          ? "border-emerald-400/40 bg-emerald-600/20 text-emerald-300"
                          : "border-white/10 bg-white/5 text-white/90"
                        } ${isToday ? "hover:bg-white/10" : "opacity-50 cursor-not-allowed"}`}
                    >
                      <span
                        className={`grid place-items-center w-5 h-5 rounded-md border
                          ${checked
                            ? "bg-emerald-500 border-emerald-400"
                            : "bg-transparent border-white/30"
                          }`}
                      >
                        {checked ? <Check className="w-4 h-4 text-white" /> : null}
                      </span>
                      {label}
                    </button>
                  );
                };

                // 🧱 Multi-checks (target > 1)
                const renderMulti = () => {
                  if (target > 12) {
                    const pct = Math.min(100, (done / target) * 100);
                    return (
                      <div className="w-full">
                        <div className="flex items-center justify-between text-[11px] text-white/60 mb-1">
                          <span>
                            {done}/{target} <span className="text-white/40">({unit})</span>
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              isDone ? "bg-emerald-500" : "bg-cyan-500"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div className="flex items-center gap-2">
                      <div className="flex flex-wrap gap-1.5">
                        {Array.from({ length: target }).map((_, i) => {
                          const checked = i < done;
                          const nextValue = checked && i === done - 1 ? i : i + 1;
                          return (
                            <button
                              key={i}
                              onClick={() => setCount(h.id, nextValue, done)}
                              disabled={!isToday}
                              className={`w-6 h-6 rounded-md border grid place-items-center transition
                                ${checked
                                  ? "bg-emerald-500 border-emerald-400"
                                  : "bg-transparent border-white/30"
                                } ${isToday ? "hover:bg-white/10" : "opacity-50 cursor-not-allowed"}`}
                            >
                              {checked ? (
                                <Check className="w-4 h-4 text-white" />
                              ) : (
                                <span className="w-2 h-2 rounded-sm bg-white/30" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                      <span className="text-xs text-white/60">
                        {done}/{target} <span className="text-white/40">({unit})</span>
                      </span>
                    </div>
                  );
                };

                return (
                  <li
                    key={h.id}
                    className={`rounded-xl border px-4 py-3 bg-white/[0.05] hover:bg-white/[0.08] transition-all duration-200 shadow-sm
                      ${isDone ? "border-emerald-400/30 ring-1 ring-emerald-500/20" : "border-white/10"}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div
                          className={`font-semibold truncate ${
                            isDone ? "text-emerald-300" : "text-white"
                          }`}
                        >
                          {h.name}
                        </div>
                        <div className="text-[11px] text-white/60">
                          Jednostka: <span className="text-white/80">{unit}</span>
                        </div>
                      </div>
                      <div className="shrink-0">
                        {target > 1 ? renderMulti() : renderSingle()}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}
