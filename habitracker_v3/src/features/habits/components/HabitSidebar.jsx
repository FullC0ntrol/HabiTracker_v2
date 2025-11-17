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
        className={`fixed inset-0 z-40 bg-[rgba(var(--rgb-black),0.55)] backdrop-blur-sm transition-all duration-300 ${
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
        <div
          className="
            absolute inset-0
            bg-gradient-to-br
            from-[rgba(var(--rgb-primary),0.18)]
            to-[rgba(var(--rgb-black),0.65)]
            backdrop-blur-xl
            border-l border-[rgba(var(--rgb-primary),0.4)]
            shadow-[0_0_35px_rgba(var(--rgb-primary),0.4)]
            overflow-hidden
          "
        >
          {/* Decorative Elements */}
          <div className="absolute top-10 left-4 w-20 h-20 rounded-full blur-xl bg-[rgba(var(--rgb-primary),0.35)]" />
          <div className="absolute bottom-20 right-6 w-16 h-16 rounded-full blur-lg bg-[rgba(var(--rgb-secondary),0.35)]" />
          <div className="absolute top-1/2 left-2 w-8 h-8 rounded-full blur-md bg-[rgba(var(--rgb-accent),0.35)]" />
        </div>

        {/* Header */}
        <header className="relative z-10 flex items-center justify-between p-4 border-b border-[rgba(var(--rgb-primary),0.3)] bg-[rgba(15,23,42,0.88)] backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg border border-[rgba(var(--rgb-primary),0.5)] bg-[rgba(var(--rgb-primary),0.18)]">
              <Sparkles className="w-4 h-4 text-[color:var(--color-primary-300)]" />
            </div>
            <div>
              <div className="text-xs font-medium text-[color:var(--color-primary-300)]/80">
                NAWYKI DZIŚ
              </div>
              <div className="text-sm font-semibold text-[color:var(--color-text-base)]">
                {todayISO}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="
              p-2 rounded-lg
              border border-[rgba(var(--rgb-white),0.18)]
              text-[rgba(var(--rgb-white),0.6)]
              hover:bg-[rgba(var(--rgb-white),0.08)]
              hover:text-[rgba(var(--rgb-white),1)]
              transition-all duration-200
              hover:scale-110
            "
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* Lock Banner */}
        {!isToday && (
          <div
            className="
              relative z-10 m-4 p-3 rounded-xl
              border border-[rgba(var(--rgb-accent),0.4)]
              bg-[rgba(var(--rgb-accent),0.18)]
              backdrop-blur-sm
            "
          >
            <div className="flex items-center gap-2 text-xs text-[color:var(--color-accent)]">
              <Lock className="w-3 h-3" />
              <span>Edycja tylko dzisiaj ({nowISO})</span>
            </div>
          </div>
        )}

        {/* Habits List */}
        <div className="relative z-10 h-[calc(100%-5rem)] overflow-y-auto px-4 py-3">
          {sorted.length === 0 ? (
            <div className="py-8 text-sm text-center text-[color:var(--color-text-soft)]">
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
                    className={[
                      "group p-3 rounded-xl border backdrop-blur-sm transition-all duration-300",
                      isDone
                        ? "bg-[rgba(var(--rgb-primary),0.18)] border-[rgba(var(--rgb-primary),0.5)] shadow-[0_0_25px_rgba(var(--rgb-primary),0.35)]"
                        : "bg-[rgba(15,23,42,0.75)] border-[rgba(var(--rgb-white),0.12)] hover:border-[rgba(var(--rgb-primary),0.45)] hover:bg-[rgba(var(--rgb-primary),0.12)]",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <div
                          className={[
                            "font-medium text-sm truncate",
                            isDone
                              ? "text-[color:var(--color-primary-300)]"
                              : "text-[color:var(--color-text-base)]",
                          ].join(" ")}
                        >
                          {h.name}
                        </div>
                        <div className="mt-0.5 text-xs text-[color:var(--color-text-soft)]">
                          {h.unit || "count"}
                        </div>
                      </div>

                      <button
                        onClick={() => setCount(h.id, isDone ? 0 : target, done)}
                        disabled={!isToday}
                        className={[
                          "flex-shrink-0 w-7 h-7 rounded-lg border transition-all duration-200",
                          isDone
                            ? "bg-[rgba(var(--rgb-primary),0.25)] border-[rgba(var(--rgb-primary),0.65)] text-[color:var(--color-primary-300)]"
                            : "bg-[rgba(15,23,42,0.8)] border-[rgba(var(--rgb-white),0.2)] text-[rgba(var(--rgb-white),0.7)] hover:bg-[rgba(var(--rgb-primary),0.15)] hover:border-[rgba(var(--rgb-primary),0.55)] hover:text-[color:var(--color-primary-300)]",
                          !isToday && "opacity-40 cursor-not-allowed",
                        ].join(" ")}
                      >
                        {isDone ? (
                          <Check className="w-3 h-3 mx-auto" />
                        ) : (
                          <div className="w-1.5 h-1.5 mx-auto rounded-full bg-[rgba(var(--rgb-white),0.7)]" />
                        )}
                      </button>
                    </div>

                    {/* Progress Bar */}
                    {target > 1 && (
                      <>
                        <div className="mb-1 h-1.5 rounded-full overflow-hidden bg-[rgba(var(--rgb-white),0.08)]">
                          <div
                            className={[
                              "h-full transition-all duration-500",
                              isDone
                                ? "bg-[color:var(--color-primary-400)]"
                                : "bg-[linear-gradient(90deg,var(--color-primary),var(--color-secondary))]",
                            ].join(" ")}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="text-xs text-right text-[color:var(--color-text-soft)]">
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
