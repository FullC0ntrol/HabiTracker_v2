import { X, Check, Lock, Sparkles } from "lucide-react";

export function HabitSidebar({
  open,
  onClose,
  todayISO,
  habits = [],
  todayCounts = {},
  onIncrement,
}) {
  const nowISO = new Date().toLocaleDateString("en-CA", {
    timeZone: "Europe/Warsaw",
  });
  const isToday = todayISO === nowISO;

  const sorted = [...habits].sort((a, b) => {
    const aDone = todayCounts[a.id] || 0;
    const bDone = todayCounts[b.id] || 0;
    const aMissing = a.target ? Math.max(0, a.target - aDone) : aDone > 0 ? 0 : 1;
    const bMissing = b.target ? Math.max(0, b.target - bDone) : bDone > 0 ? 0 : 1;
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
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-all duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={`fixed right-0 top-0 z-50 h-full w-80 max-w-[85vw] transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Glass Background with Decorations */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 to-slate-900/40 backdrop-blur-xl border-l border-emerald-500/20 shadow-2xl shadow-emerald-500/10 overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-10 left-4 w-20 h-20 bg-emerald-400/10 rounded-full blur-xl" />
          <div className="absolute bottom-20 right-6 w-16 h-16 bg-cyan-400/10 rounded-full blur-lg" />
          <div className="absolute top-1/2 left-2 w-8 h-8 bg-emerald-300/20 rounded-full blur-md" />
        </div>

        {/* Header */}
        <header className="relative z-10 flex items-center justify-between p-4 border-b border-emerald-500/20 bg-white/5 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg border border-emerald-400/30">
              <Sparkles className="w-4 h-4 text-emerald-300" />
            </div>
            <div>
              <div className="text-xs text-emerald-300/80 font-medium">NAWYKI DZIŚ</div>
              <div className="text-sm font-semibold text-white">{todayISO}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg border border-white/10 hover:bg-white/10 text-white/60 hover:text-white transition-all duration-200 hover:scale-110"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* Lock Banner */}
        {!isToday && (
          <div className="relative z-10 m-4 p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-amber-300 text-xs">
              <Lock className="w-3 h-3" />
              <span>Edycja tylko dzisiaj ({nowISO})</span>
            </div>
          </div>
        )}

        {/* Habits List */}
        <div className="relative z-10 h-[calc(100%-5rem)] overflow-y-auto px-4 py-3">
          {sorted.length === 0 ? (
            <div className="text-center text-white/50 text-sm py-8">
              Brak nawyków do wyświetlenia
            </div>
          ) : (
            <div className="space-y-2">
              {sorted.map((h) => {
                const done = todayCounts[h.id] || 0;
                const target = h.target ?? 1;
                const isDone = done >= target;
                const pct = Math.min(100, (done / target) * 100);

                return (
                  <div
                    key={h.id}
                    className={`group p-3 rounded-xl border backdrop-blur-sm transition-all duration-300 ${
                      isDone
                        ? "bg-emerald-500/10 border-emerald-400/30 shadow-lg shadow-emerald-500/10"
                        : "bg-white/5 border-white/10 hover:border-emerald-400/30 hover:bg-emerald-500/5"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <div className={`font-medium text-sm truncate ${
                          isDone ? "text-emerald-200" : "text-white"
                        }`}>
                          {h.name}
                        </div>
                        <div className="text-xs text-white/40 mt-0.5">
                          {h.unit || "count"}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => setCount(h.id, isDone ? 0 : target, done)}
                        disabled={!isToday}
                        className={`flex-shrink-0 w-7 h-7 rounded-lg border transition-all duration-200 ${
                          isDone
                            ? "bg-emerald-500/30 border-emerald-400/50 text-emerald-200"
                            : "bg-white/5 border-white/20 text-white/60 hover:bg-emerald-500/20 hover:border-emerald-400/40 hover:text-emerald-200"
                        } ${!isToday && "opacity-40 cursor-not-allowed"}`}
                      >
                        {isDone ? (
                          <Check className="w-3 h-3 mx-auto" />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-white/60 mx-auto" />
                        )}
                      </button>
                    </div>

                    {/* Progress Bar */}
                    {target > 1 && (
                      <>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-1">
                          <div
                            className={`h-full transition-all duration-500 ${
                              isDone ? "bg-emerald-400" : "bg-gradient-to-r from-cyan-400 to-emerald-400"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="text-xs text-white/40 text-right">
                          {done}/{target}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}