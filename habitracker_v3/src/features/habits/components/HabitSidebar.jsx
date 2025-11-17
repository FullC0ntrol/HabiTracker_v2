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

  const completedCount = sorted.filter(h => todayCounts[h.id] >= (h.target || 1)).length;
  const totalCount = sorted.length;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-md transition-all duration-300 ${
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
        {/* Glass Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[rgb(var(--color-primary-dark))]/20 to-[rgb(var(--color-bg-grad-to))]/40 backdrop-blur-xl border-l border-[rgb(var(--color-primary-light))]/30 shadow-2xl shadow-[rgb(var(--rgb-primary))]/20 overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-10 left-4 w-20 h-20 bg-[rgb(var(--rgb-primary))]/15 rounded-full blur-xl animate-pulse-slow" />
          <div className="absolute bottom-20 right-6 w-16 h-16 bg-[rgb(var(--color-secondary))]/15 rounded-full blur-lg animate-pulse-slow delay-2000" />
          <div className="absolute top-1/2 left-2 w-8 h-8 bg-[rgb(var(--color-primary-light))]/20 rounded-full blur-md animate-pulse-slow delay-4000" />
        </div>

        {/* Header */}
        <header className="relative z-10 flex items-center justify-between p-4 border-b border-[rgb(var(--color-primary-light))]/20 bg-white/10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[rgb(var(--rgb-primary))]/20 rounded-lg border border-[rgb(var(--color-primary-light))]/30">
              <Sparkles className="w-4 h-4 text-[rgb(var(--color-primary-light))]" />
            </div>
            <div>
              <div className="text-xs font-bold text-[rgb(var(--color-primary-light))] uppercase tracking-wide">
                NAWYKI DZIŚ
              </div>
              <div className="text-sm font-semibold text-white">{todayISO}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg border border-white/20 text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200 hover:scale-110"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* Progress Summary */}
        {sorted.length > 0 && (
          <div className="relative z-10 px-4 pt-4">
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-white">Postęp</span>
                <span className="text-sm font-bold text-[rgb(var(--color-primary-light))]">
                  {completedCount}/{totalCount}
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-gradient-to-r from-[rgb(var(--rgb-primary))] to-[rgb(var(--color-secondary))] transition-all duration-500"
                  style={{ width: `${(completedCount / totalCount) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Lock Banner */}
        {!isToday && (
          <div className="relative z-10 mx-4 mt-4 p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-medium">
              <Lock className="w-3 h-3" />
              <span>Edycja tylko dzisiaj ({nowISO})</span>
            </div>
          </div>
        )}

        {/* Habits List */}
        <div className="relative z-10 h-[calc(100%-8rem)] overflow-y-auto px-4 py-3">
          {sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-3">
                <Sparkles className="w-6 h-6 text-white/40" />
              </div>
              <p className="text-white/70 text-sm font-medium">Brak nawyków do wyświetlenia</p>
              <p className="text-white/50 text-xs mt-1">Dodaj nawyki w głównej sekcji</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sorted.map((h) => {
                const done = todayCounts[h.id] || 0;
                const target = h.target ?? 1;
                const isDone = done >= target;
                const pct = Math.min(100, (done / target) * 100);

                return (
                  <div
                    key={h.id}
                    className={`group p-4 rounded-xl border backdrop-blur-md transition-all duration-300 ${
                      isDone
                        ? "bg-[rgb(var(--rgb-primary))]/15 border-[rgb(var(--color-primary-light))]/40 shadow-lg shadow-[rgb(var(--rgb-primary))]/10"
                        : "bg-white/10 border-white/20 hover:bg-white/15 hover:border-[rgb(var(--color-primary-light))]/30"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className={`font-semibold text-sm truncate ${
                          isDone ? "text-[rgb(var(--color-primary-light))]" : "text-white"
                        }`}>
                          {h.name}
                        </div>
                        <div className="text-xs text-white/60 mt-1 font-medium">
                          {h.unit || "count"}
                        </div>
                      </div>

                      <button
                        onClick={() => setCount(h.id, isDone ? 0 : target, done)}
                        disabled={!isToday}
                        className={`flex-shrink-0 w-8 h-8 rounded-lg border-2 transition-all duration-300 flex items-center justify-center ${
                          isDone
                            ? "bg-[rgb(var(--rgb-primary))]/30 border-[rgb(var(--color-primary-light))] text-white shadow-md"
                            : "bg-white/10 border-white/30 text-white/60 hover:bg-[rgb(var(--rgb-primary))]/20 hover:border-[rgb(var(--color-primary-light))] hover:text-white"
                        } ${!isToday && "opacity-40 cursor-not-allowed"}`}
                      >
                        {isDone ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-current" />
                        )}
                      </button>
                    </div>

                    {/* Progress Bar */}
                    {target > 1 && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-white/70 font-medium">Postęp</span>
                          <span className="text-xs font-bold text-white">
                            {done}/{target}
                          </span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              isDone
                                ? "bg-[rgb(var(--color-primary-light))]"
                                : "bg-gradient-to-r from-[rgb(var(--rgb-primary))] to-[rgb(var(--color-secondary))]"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
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