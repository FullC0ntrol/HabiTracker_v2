import { useState } from "react";
import { Plus, Flame, Calendar } from "lucide-react";
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

  return (
    <div className="relative min-h-screen overflow-y-auto bg-mesh text-white px-4 sm:px-6 py-6">
      {/* Dekoracyjne tło */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-60px] left-[-40px] w-72 h-72 bg-[rgb(var(--color-secondary))]/10 blur-3xl rounded-full animate-pulse-slow" />
        <div className="absolute bottom-0 right-[-60px] w-80 h-80 bg-[rgb(var(--rgb-primary))]/10 blur-3xl rounded-full animate-pulse-slow delay-1000" />
      </div>

      {/* Nagłówek */}
      <header className="text-center mb-6">
        <div className="flex justify-center items-center gap-2 mb-2">
          <Calendar className="w-7 h-7 text-[rgb(var(--color-primary-light))]" />
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[rgb(var(--color-primary-light))] to-[rgb(var(--color-primary))] bg-clip-text text-transparent">
            Tracker Nawyków
          </h1>
        </div>
        <p className="text-white/60 text-sm">
          Twórz, śledź i odhaczaj swoje codzienne nawyki 💪
        </p>
      </header>

      {/* Formularz dodawania */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row gap-3 bg-white/[0.04] border border-white/10 rounded-2xl p-4 backdrop-blur-md shadow-md mb-6"
      >
        <div className="flex items-center flex-1 gap-2 bg-black/30 rounded-lg border border-white/10 px-3 py-2">
          <Plus className="w-4 h-4 text-[rgb(var(--color-primary-light))] shrink-0" />
          <input
            placeholder="Dodaj nowy nawyk..."
            value={form.name}
            onChange={(e) => setForm({ name: e.target.value })}
            className="flex-1 bg-transparent text-sm focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={!form.name.trim()}
          className="h-10 px-4 rounded-lg bg-gradient-to-r from-[rgb(var(--rgb-primary))] to-[rgb(var(--color-secondary))] font-semibold text-sm hover:from-[rgb(var(--color-primary-light))] hover:to-[rgb(var(--color-secondary))] transition-all shadow-[rgb(var(--rgb-primary))]/40 shadow-md disabled:opacity-40"
        >
          ➕ Dodaj
        </button>
      </form>

      {/* Błąd */}
      {error && (
        <div className="mb-4 rounded-lg border border-rose-400/30 bg-rose-500/15 px-3 py-2 text-sm text-rose-200">
          🚨 {error}
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <p className="text-center text-white/60">Ładowanie...</p>
      ) : habits.length === 0 ? (
        <p className="text-center text-white/60 italic">
          Brak nawyków – dodaj pierwszy!
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {habits.map((h, idx) => {
            const streak = streakByHabit[h.id] || 0;
            const doneToday = todayCounts[h.id] > 0;

            return (
              <div
                key={h.id}
                style={{ animationDelay: `${idx * 50}ms` }}
                className={`group relative rounded-2xl border border-white/10 bg-gradient-to-br from-[rgb(var(--color-card-bg))]/70 to-[rgb(var(--color-bg-grad-to))]/80 p-4 shadow-md hover:shadow-[rgb(var(--rgb-primary))]/10 hover:-translate-y-[2px] transition-all duration-300 animate-fadeIn ${
                  doneToday ? "ring-1 ring-[rgb(var(--color-primary-light))]/30" : ""
                }`}
              >
                {/* GLOW tła przy ukończeniu */}
                {doneToday && (
                  <div className="absolute inset-0 bg-gradient-to-br from-[rgb(var(--rgb-primary))]/10 to-[rgb(var(--color-secondary))]/10 blur-md opacity-70 rounded-2xl" />
                )}

                <div className="relative z-10 flex justify-between items-center">
                  <div>
                    <div
                      className={`font-semibold truncate ${
                        doneToday ? "text-[rgb(var(--color-primary-light))]" : "text-white"
                      }`}
                    >
                      {h.name}
                    </div>
                    <div className="text-xs text-white/60 flex gap-1 mt-1 items-center">
                      <Flame className="w-3.5 h-3.5 text-orange-400" />
                      <span>{streak} dni streak</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-[rgb(var(--rgb-primary))]/20 hover:border-[rgb(var(--color-primary-light))]/30 transition-all font-medium"
                  >
                    Odhacz
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sidebar */}
      <HabitSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        todayISO={todayISO}
        habits={habits}
        todayCounts={todayCounts}
        onIncrement={(id, delta) => incrementHabit(id, delta)}
      />

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: .6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 6s ease-in-out infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}