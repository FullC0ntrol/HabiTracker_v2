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
  const completedToday = habits.filter(h => todayCounts[h.id] > 0).length;
  const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

  return (
    <div className="relative min-h-screen overflow-y-auto bg-mesh text-white px-4 sm:px-6 py-6">
      {/* Ulepszone dekoracyjne tło */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-80 h-80 bg-[rgb(var(--color-secondary))]/15 blur-[100px] rounded-full animate-pulse-slow" />
        <div className="absolute bottom-[-20%] right-[-10%] w-80 h-80 bg-[rgb(var(--rgb-primary))]/15 blur-[100px] rounded-full animate-pulse-slow delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-[rgb(var(--color-primary-light))]/10 blur-[80px] rounded-full animate-pulse-slow delay-1000" />
      </div>

      {/* Ulepszony nagłówek */}
      <header className="text-center mb-8">
        <div className="flex justify-center items-center gap-3 mb-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[rgb(var(--rgb-primary))] to-[rgb(var(--color-secondary))] flex items-center justify-center shadow-lg shadow-[rgb(var(--rgb-primary))]/30">
              <Calendar className="w-7 h-7 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-[rgb(var(--color-secondary))] rounded-full border-2 border-[rgb(var(--color-bg-grad-from))] animate-pulse" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[rgb(var(--color-primary-light))] via-[rgb(var(--color-primary))] to-[rgb(var(--color-secondary))] bg-clip-text text-transparent drop-shadow-sm">
              Tracker Nawyków
            </h1>
            <p className="text-white/70 text-sm mt-1">
              Buduj swoje codzienne zwyczaje 🚀
            </p>
          </div>
        </div>

        {/* Statystyki na górze */}
        <div className="grid grid-cols-3 gap-3 max-w-md mx-auto mb-6">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
            <div className="text-lg font-bold text-white">{totalHabits}</div>
            <div className="text-xs text-white/60">Wszystkie</div>
          </div>
          <div className="bg-[rgb(var(--rgb-primary))]/20 backdrop-blur-md rounded-xl p-3 border border-[rgb(var(--color-primary-light))]/30">
            <div className="text-lg font-bold text-[rgb(var(--color-primary-light))]">{completedToday}</div>
            <div className="text-xs text-[rgb(var(--color-primary-light))]/70">Dziś</div>
          </div>
          <div className="bg-[rgb(var(--color-secondary))]/20 backdrop-blur-md rounded-xl p-3 border border-[rgb(var(--color-secondary))]/30">
            <div className="text-lg font-bold text-[rgb(var(--color-secondary))]">{completionRate}%</div>
            <div className="text-xs text-[rgb(var(--color-secondary))]/70">Wykonane</div>
          </div>
        </div>
      </header>

      {/* Ulepszony formularz dodawania */}
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 p-5 mb-8 shadow-2xl shadow-[rgb(var(--rgb-primary))]/10">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-[rgb(var(--color-primary-light))]" />
          Dodaj nowy nawyk
        </h2>
        
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center flex-1 gap-3 bg-black/40 rounded-xl border border-white/20 px-4 py-3 hover:border-[rgb(var(--color-primary-light))]/40 transition-all duration-300">
            <Target className="w-5 h-5 text-[rgb(var(--color-primary-light))] shrink-0" />
            <input
              placeholder="Nazwa nowego nawyku..."
              value={form.name}
              onChange={(e) => setForm({ name: e.target.value })}
              className="flex-1 bg-transparent text-white placeholder-white/60 focus:outline-none text-base"
            />
          </div>
          <button
            type="submit"
            disabled={!form.name.trim()}
            className="sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[rgb(var(--rgb-primary))] to-[rgb(var(--color-secondary))] font-semibold text-white text-sm hover:from-[rgb(var(--color-primary-light))] hover:to-[rgb(var(--color-secondary))] transition-all duration-300 shadow-lg shadow-[rgb(var(--rgb-primary))]/30 hover:shadow-xl hover:shadow-[rgb(var(--rgb-primary))]/40 hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center gap-2 justify-center"
          >
            <Plus className="w-4 h-4" />
            Dodaj nawyk
          </button>
        </form>
      </div>

      {/* Błąd - ulepszony wygląd */}
      {error && (
        <div className="mb-6 p-4 rounded-xl border border-rose-400/40 bg-gradient-to-r from-rose-500/20 to-rose-600/10 backdrop-blur-md text-rose-200 text-sm flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold">!</span>
          </div>
          <div>
            <div className="font-semibold">Błąd</div>
            <div>{error}</div>
          </div>
        </div>
      )}

      {/* Ulepszona lista nawyków */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-10 h-10 border-3 border-[rgb(var(--color-primary-light))]/30 border-t-[rgb(var(--color-primary-light))] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-white/60">Ładowanie nawyków...</p>
        </div>
      ) : habits.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white/10 flex items-center justify-center">
            <Target className="w-8 h-8 text-white/40" />
          </div>
          <h3 className="text-lg font-semibold text-white/80 mb-2">Brak nawyków</h3>
          <p className="text-white/50 text-sm max-w-sm mx-auto">
            Dodaj swój pierwszy nawyk, aby rozpocząć śledzenie postępów i budować dobre zwyczaje!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[rgb(var(--color-primary-light))]" />
              Twoje nawyki
            </h2>
            <div className="text-sm text-white/60">
              {completedToday}/{totalHabits} ukończone dziś
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {habits.map((h, idx) => {
              const streak = streakByHabit[h.id] || 0;
              const doneToday = todayCounts[h.id] > 0;

              return (
                <div
                  key={h.id}
                  style={{ animationDelay: `${idx * 80}ms` }}
                  className={`group relative rounded-2xl border-2 backdrop-blur-xl p-5 transition-all duration-500 animate-fadeIn hover:scale-[1.02] hover:shadow-2xl ${
                    doneToday
                      ? "bg-gradient-to-br from-[rgb(var(--rgb-primary))]/20 to-[rgb(var(--color-secondary))]/20 border-[rgb(var(--color-primary-light))]/40 shadow-lg shadow-[rgb(var(--rgb-primary))]/20"
                      : "bg-gradient-to-br from-white/10 to-white/5 border-white/20 hover:border-[rgb(var(--color-primary-light))]/30 hover:shadow-[rgb(var(--rgb-primary))]/10"
                  }`}
                >
                  {/* Wskaźnik ukończenia */}
                  {doneToday && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-[rgb(var(--color-secondary))] rounded-full border-2 border-[rgb(var(--color-bg-grad-from))] flex items-center justify-center shadow-lg">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`font-semibold text-lg mb-2 truncate ${
                            doneToday ? "text-white" : "text-white"
                          }`}
                        >
                          {h.name}
                        </h3>
                        
                        {/* Streak indicator */}
                        <div className="flex items-center gap-2">
                          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            streak > 0 
                              ? "bg-orange-500/20 text-orange-300 border border-orange-400/30"
                              : "bg-white/10 text-white/60 border border-white/20"
                          }`}>
                            <Flame className="w-3 h-3" />
                            <span>{streak} dni</span>
                          </div>
                          
                          {doneToday && (
                            <div className="px-2 py-1 rounded-full bg-[rgb(var(--color-secondary))]/20 text-[rgb(var(--color-secondary))] text-xs font-medium border border-[rgb(var(--color-secondary))]/30">
                              Dziś ✓
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setSidebarOpen(true)}
                      className={`w-full py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ${
                        doneToday
                          ? "bg-white/20 text-white/90 hover:bg-white/30 border border-white/30"
                          : "bg-gradient-to-r from-[rgb(var(--rgb-primary))] to-[rgb(var(--color-secondary))] text-white hover:from-[rgb(var(--color-primary-light))] hover:to-[rgb(var(--color-secondary))] shadow-lg shadow-[rgb(var(--rgb-primary))]/20"
                      } hover:scale-[1.02] active:scale-95`}
                    >
                      {doneToday ? "Zmień stan" : "Odhacz nawyk"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
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
          0%, 100% { opacity: .4; transform: scale(1); }
          50% { opacity: .8; transform: scale(1.1); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
      `}</style>
    </div>
  );
}