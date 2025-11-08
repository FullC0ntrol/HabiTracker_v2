import { useState, useMemo } from "react";
import { Plus, Target, Flame, Calendar } from "lucide-react";
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

    // 🟢 domyślny target=1 i unit='check' (kompatybilne z HabitSidebar)
    await addHabit({ name: form.name.trim(), target: 1, unit: "check" });
    setForm({ name: "" });
  };

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Nagłówek */}
        <header className="text-center mb-6">
          <div className="flex justify-center gap-2 mb-3">
            <Calendar className="w-7 h-7 text-cyan-400" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-300 to-emerald-400 bg-clip-text text-transparent">
              Tracker Nawyków
            </h1>
          </div>
          <p className="text-white/60">Lista nawyków i szybkie odhaczanie.</p>
        </header>

        {/* Formularz dodawania nowego nawyku */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-3"
        >
          <input
            placeholder="Nazwa nowego nawyku..."
            value={form.name}
            onChange={(e) => setForm({ name: e.target.value })}
            className="flex-1 h-10 bg-white/10 border border-white/15 rounded-lg px-3 text-sm"
          />
          <button
            type="submit"
            disabled={!form.name.trim()}
            className="bg-cyan-600 hover:bg-cyan-500 h-10 rounded-lg font-semibold text-sm px-4 flex items-center justify-center"
          >
            <Plus className="inline w-4 h-4 mr-1" /> Dodaj
          </button>
        </form>

        {/* Obsługa błędów */}
        {error && (
          <div className="mb-4 rounded-xl border border-rose-400/30 bg-rose-500/15 px-3 py-2 text-sm">
            🚨 {error}
          </div>
        )}

        {/* Lista nawyków */}
        {loading ? (
          <p className="text-center text-white/60">Ładowanie...</p>
        ) : habits.length === 0 ? (
          <p className="text-center text-white/60">Brak nawyków — dodaj pierwszy!</p>
        ) : (
          <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]">
            {habits.map((h) => (
              <div
                key={h.id}
                className="rounded-xl border border-white/10 bg-white/[0.04] p-3 flex justify-between items-center"
              >
                <div>
                  <div className="font-semibold">{h.name}</div>
                  <div className="text-xs text-white/60 flex gap-2">
                    <span>
                      <Flame className="w-3 h-3 inline" /> {streakByHabit[h.id] || 0} dni
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="text-xs border border-white/10 px-3 py-1.5 rounded-lg hover:bg-white/10"
                >
                  Odhacz
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Panel boczny do odhaczania */}
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
