import { useState } from "react";
import { Plus, Flame, Calendar, Target, TrendingUp } from "lucide-react";
import { useHabits } from "../hooks/useHabits";
import { HabitSidebar } from "./HabitSidebar";

export default function HabitsPage() {
  const {
    habits,
    streakByHabit,
    todayCounts,
    todayISO,
    addHabit,
    incrementHabit,
    loading,
    error,
  } = useHabits();

  const [form, setForm] = useState({ name: "" });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    await addHabit({ name: form.name.trim(), target: 1, unit: "check" });
    setForm({ name: "" });
  };

  // Statystyki
  const totalHabits = habits.length;
  const completedToday = habits.filter((h) => todayCounts[h.id] > 0).length;
  const completionRate =
    totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

  const todayLabel = todayISO
    ? new Date(todayISO).toLocaleDateString("pl-PL", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : "";

  return (
    <div className="min-h-screen bg-mesh px-3 sm:px-4 pb-24 text-[color:var(--color-text-base)]">
      <div className="max-w-4xl mx-auto pt-5 sm:pt-8 flex flex-col gap-6">
        {/* HEADER – podobny klimat jak PlanPage */}
        <header className="text-center flex flex-col items-center gap-3">
          <div className="inline-flex items-center gap-3 px-4 py-3 rounded-2xl glass-strong glow-emerald">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-[color:var(--color-primary-300)]" />
            <h1 className="text-lg sm:text-2xl font-bold leading-tight">
              Tracker nawyków
            </h1>
          </div>
        </header>

        {/* GŁÓWNA KARTA: statystyki + dodawanie w jednym, kompaktowo */}
        <section className="glass-strong rounded-2xl border border-[color:var(--color-card-border)] p-4 sm:p-5 shadow-[0_18px_45px_rgba(0,0,0,0.65)] flex flex-col gap-4">
          {/* Statystyki */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="relative overflow-hidden rounded-2xl border border-[rgba(148,163,184,0.45)] bg-[rgba(15,23,42,0.85)] px-3 py-3 sm:p-3.5 text-center">
              <p className="text-[10px] sm:text-xs text-[color:var(--color-text-soft)] mb-1">
                Wszystkie nawyki
              </p>
              <div className="flex items-center justify-center">
                <span className="text-xl sm:text-2xl font-semibold text-white">
                  {totalHabits}
                </span>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-[rgba(var(--rgb-primary),0.6)] bg-[rgba(15,23,42,0.95)] px-3 py-3 sm:p-3.5 text-center">
              <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_0%_0%,rgba(var(--rgb-primary),0.28),transparent_60%)]" />
              <div className="relative">
                <p className="text-[10px] sm:text-xs text-[color:var(--color-primary-300)]/80 mb-1">
                  Ukończone dziś
                </p>
                <div className="flex items-center justify-center gap-1.5">
                  <span className="text-xl sm:text-2xl font-semibold text-[color:var(--color-primary-300)]">
                    {completedToday}
                  </span>
                  <Target className="w-4 h-4 sm:w-5 sm:h-5 text-[color:var(--color-primary-300)]" />
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-[rgba(52,211,153,0.7)] bg-[rgba(6,78,59,0.9)] px-3 py-3 sm:p-3.5 text-center">
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_100%_0%,rgba(16,185,129,0.4),transparent_60%)]" />
              <div className="relative">
                <p className="text-[10px] sm:text-xs text-emerald-100/80 mb-1">
                  Dzisiejszy progres
                </p>
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <span className="text-xl sm:text-2xl font-semibold text-emerald-100">
                    {completionRate}%
                  </span>
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-100" />
                </div>
                <div className="h-1.5 w-full rounded-full bg-emerald-900/60 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-emerald-100 transition-all duration-500"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Dodawanie nowego nawyku (zgodnie z UI reszty) */}
          <div className="mt-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-[rgba(var(--rgb-primary),0.16)] border border-[rgba(var(--rgb-primary),0.45)] flex items-center justify-center">
                <Plus className="w-4 h-4 text-[color:var(--color-primary-300)]" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-semibold text-white">
                  Dodaj nowy nawyk
                </h2>
                <p className="text-[11px] text-[color:var(--color-text-soft)]">
                  Krótkie, konkretne nazwy działają najlepiej
                </p>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-2.5"
            >
              <label className="flex items-center flex-1 gap-3 bg-[color:var(--color-input-bg)] rounded-xl border border-[color:var(--color-input-border)] px-3 py-2.5 hover:border-[rgba(var(--rgb-primary),0.7)] transition-all duration-200 focus-within:border-[rgba(var(--rgb-primary),0.9)] focus-within:ring-1 focus-within:ring-[rgba(var(--rgb-primary),0.35)]">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-[color:var(--color-primary-300)] shrink-0" />
                <input
                  placeholder="Nazwa nawyku (np. 10 min czytania)"
                  value={form.name}
                  onChange={(e) => setForm({ name: e.target.value })}
                  className="flex-1 bg-transparent text-sm sm:text-base text-white placeholder-[color:var(--color-muted-500)] focus:outline-none"
                  aria-label="Nazwa nowego nawyku"
                />
              </label>
              <button
                type="submit"
                disabled={!form.name.trim()}
                className="sm:w-auto w-full px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2
                  bg-[linear-gradient(135deg,var(--color-primary),var(--color-secondary))]
                  text-white
                  shadow-[0_0_22px_rgba(var(--rgb-primary),0.5)]
                  hover:shadow-[0_0_30px_rgba(var(--rgb-primary),0.7)]
                  hover:scale-[1.02]
                  active:scale-[0.98]
                  disabled:opacity-40 disabled:cursor-not-allowed
                  transition-all"
              >
                <Plus className="w-4 h-4" />
                Dodaj nawyk
              </button>
            </form>
          </div>
        </section>

        {/* Błąd */}
        {error && (
          <section className="glass rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-rose-100 text-xs sm:text-sm flex items-center gap-3">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-rose-500 flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] sm:text-xs font-bold">!</span>
            </div>
            <div>
              <div className="font-semibold mb-0.5">Błąd</div>
              <div className="text-rose-100/80">{error}</div>
            </div>
          </section>
        )}

        {/* LISTA NAWYKÓW – tylko to się scrolluje na telefonie */}
        <section className="glass rounded-2xl border border-[color:var(--color-card-border)] p-4 sm:p-5 flex flex-col min-h-[260px] max-h-[60vh]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-[rgba(var(--rgb-primary),0.9)]" />
            <h3 className="text-sm sm:text-base font-semibold text-white">
              Twoje nawyki
            </h3>
            <span className="ml-auto text-[11px] px-2 py-0.5 rounded-full bg-[rgba(var(--rgb-primary),0.16)] border border-[rgba(var(--rgb-primary),0.5)] text-[color:var(--color-primary-300)]">
              {completedToday}/{totalHabits} dziś
            </span>
          </div>

          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
              <div className="w-9 h-9 border-4 border-[rgba(var(--rgb-primary),0.25)] border-t-[rgba(var(--rgb-primary),0.9)] rounded-full animate-spin mb-2" />
              <p className="text-[color:var(--color-text-soft)] text-xs sm:text-sm">
                Ładowanie nawyków...
              </p>
            </div>
          ) : habits.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
              <div className="w-14 h-14 rounded-2xl bg-[rgba(15,23,42,0.9)] border border-[rgba(148,163,184,0.4)] flex items-center justify-center mb-3">
                <Target className="w-7 h-7 text-[color:var(--color-text-soft)]" />
              </div>
              <p className="text-xs sm:text-sm text-[color:var(--color-text-soft)] max-w-xs">
                Nie masz jeszcze żadnych nawyków. Dodaj pierwszy powyżej i
                zacznij budować serię 💪
              </p>
            </div>
          ) : (
            <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-3">
              {habits.map((h, idx) => {
                const streak = streakByHabit[h.id] || 0;
                const doneToday = todayCounts[h.id] > 0;

                return (
                  <article
                    key={h.id}
                    style={{ animationDelay: `${idx * 60}ms` }}
                    className={`
                      group relative rounded-2xl border px-3.5 py-3.5 sm:px-4 sm:py-4
                      bg-[rgba(15,23,42,0.94)]
                      border-[rgba(var(--rgb-white),0.12)]
                      backdrop-blur-md
                      shadow-[0_14px_32px_rgba(0,0,0,0.75)]
                      hover:border-[rgba(var(--rgb-primary),0.7)]
                      hover:shadow-[0_18px_40px_rgba(37,99,235,0.55)]
                      transition-all duration-300
                      animate-hp-fadeIn
                    `}
                  >
                    {/* Glow overlay */}
                    <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_0%_0%,rgba(var(--rgb-primary),0.18),transparent_60%),radial-gradient(circle_at_100%_100%,rgba(var(--rgb-secondary),0.18),transparent_60%)]" />

                    {/* Wskaźnik ukończenia */}
                    {doneToday && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 sm:w-7 sm:h-7 bg-[rgba(16,185,129,0.95)] rounded-full border border-emerald-300/80 flex items-center justify-center shadow-[0_0_18px_rgba(16,185,129,0.8)]">
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white rounded-full" />
                      </div>
                    )}

                    <div className="relative z-10 flex flex-col gap-3">
                      {/* Nagłówek / nazwa */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h4 className="font-semibold text-sm sm:text-base text-white truncate">
                            {h.name}
                          </h4>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px]">
                            <div
                              className={`
                                inline-flex items-center gap-1.5 px-2 py-1 rounded-full border
                                ${
                                  streak > 0
                                    ? "bg-orange-500/15 text-orange-200 border-orange-400/40"
                                    : "bg-[rgba(15,23,42,0.9)] text-[color:var(--color-text-soft)] border-[rgba(148,163,184,0.45)]"
                                }
                              `}
                            >
                              <Flame className="w-3.5 h-3.5" />
                              <span>
                                {streak > 0
                                  ? `${streak} dni streak`
                                  : "Bez serii (jeszcze)"}
                              </span>
                            </div>

                            {doneToday && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full border border-emerald-300/60 bg-emerald-500/15 text-[11px] text-emerald-100">
                                Dziś odhaczone ✓
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Pasek progresu dnia */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] sm:text-[11px] text-[color:var(--color-text-soft)]">
                          <span>Dzisiejszy progres</span>
                          <span>{doneToday ? "100%" : "0%"}</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-[rgba(30,64,175,0.45)] overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              doneToday
                                ? "bg-gradient-to-r from-emerald-400 to-emerald-200"
                                : "bg-[rgba(148,163,184,0.55)] group-hover:bg-[rgba(var(--rgb-primary),0.9)]"
                            }`}
                            style={{ width: doneToday ? "100%" : "0%" }}
                          />
                        </div>
                      </div>

                      {/* Akcja – otwórz sidebar */}
                      <button
                        onClick={() => setSidebarOpen(true)}
                        className={`
                          mt-1 w-full py-2.5 rounded-xl text-xs sm:text-sm font-medium
                          inline-flex items-center justify-center gap-2
                          transition-all duration-200
                          ${
                            doneToday
                              ? "bg-[rgba(15,23,42,0.85)] border border-[rgba(209,213,219,0.45)] text-white hover:bg-[rgba(31,41,55,0.95)]"
                              : "bg-[linear-gradient(135deg,var(--color-primary),var(--color-secondary))] text-white shadow-[0_0_18px_rgba(var(--rgb-primary),0.5)] hover:shadow-[0_0_26px_rgba(var(--rgb-primary),0.75)]"
                          }
                          hover:scale-[1.01] active:scale-[0.98]
                        `}
                        aria-label={
                          doneToday
                            ? `Zmień stan nawyku ${h.name}`
                            : `Odhacz nawyk ${h.name}`
                        }
                      >
                        {doneToday ? "Zmień / podejrzyj szczegóły" : "Odhacz nawyk"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Sidebar z dziennikiem / edycją */}
      <HabitSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        todayISO={todayISO}
        habits={habits}
        todayCounts={todayCounts}
        onIncrement={(id, delta) => incrementHabit(id, delta)}
      />
    </div>
  );
}
