import { useState, useMemo } from "react";
import { useExercises } from "../hooks/useExercises";
import { Plus, Dumbbell, Edit3, Trash2 } from "lucide-react";

const MUSCLE_CATEGORIES = [
  { value: "wszystkie", label: "Wszystkie", icon: "🎯", color: "slate" },
  { value: "klatka", label: "Klatka", icon: "💪", color: "red" },
  { value: "plecy", label: "Plecy", icon: "🦸", color: "blue" },
  { value: "nogi", label: "Nogi", icon: "🦵", color: "green" },
  { value: "barki", label: "Barki", icon: "🏋️", color: "yellow" },
  { value: "biceps", label: "Biceps", icon: "💪", color: "purple" },
  { value: "triceps", label: "Triceps", icon: "🔧", color: "pink" },
  { value: "brzuch", label: "Brzuch", icon: "⭐", color: "orange" },
  { value: "cardio", label: "Cardio", icon: "❤️", color: "rose" },
  { value: "inne", label: "Inne", icon: "✨", color: "gray" },
];

const COLOR_CLASSES = {
  slate: "from-slate-500/20 to-slate-400/10 border-slate-500/30 text-slate-200",
  red: "from-red-500/20 to-red-400/10 border-red-500/30 text-red-200",
  blue: "from-blue-500/20 to-blue-400/10 border-blue-500/30 text-blue-200",
  green: "from-green-500/20 to-green-400/10 border-green-500/30 text-green-200",
  yellow: "from-yellow-500/20 to-yellow-400/10 border-yellow-500/30 text-yellow-200",
  purple: "from-purple-500/20 to-purple-400/10 border-purple-500/30 text-purple-200",
  pink: "from-pink-500/20 to-pink-400/10 border-pink-500/30 text-pink-200",
  orange: "from-orange-500/20 to-orange-400/10 border-orange-500/30 text-orange-200",
  rose: "from-rose-500/20 to-rose-400/10 border-rose-500/30 text-rose-200",
  gray: "from-gray-500/20 to-gray-400/10 border-gray-500/30 text-gray-200",
};

export default function ExercisesPage() {
  const { list, addExercise, patchExercise, removeExercise } = useExercises();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("inne");
  const [activeCat, setActiveCat] = useState("wszystkie");

  const filtered = useMemo(() => {
    return activeCat === "wszystkie"
      ? list
      : list.filter((ex) => ex.category === activeCat);
  }, [list, activeCat]);

  const handleAdd = () => {
    if (!name.trim()) return;
    addExercise({ name: name.trim(), category });
    setName("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[rgb(var(--color-bg-grad-from))]/20 to-[rgb(var(--color-bg-grad-to))]/40 text-white p-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[rgb(var(--rgb-primary))]/20 rounded-xl border border-[rgb(var(--color-primary-light))]/30">
            <Dumbbell className="w-6 h-6 text-[rgb(var(--color-primary-light))]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Biblioteka ćwiczeń</h1>
            <p className="text-xs text-[rgb(var(--color-primary-light))]/60">Twoja baza treningowa</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-[rgb(var(--color-primary-light))]">{list.length}</div>
          <div className="text-xs text-white/40">ćwiczeń</div>
        </div>
      </div>

      {/* Add Form */}
      <div className="bg-white/5 backdrop-blur-md rounded-xl border border-[rgb(var(--color-primary-light))]/20 p-4 mb-6 shadow-lg shadow-[rgb(var(--rgb-primary))]/20">
        <h2 className="text-sm font-semibold text-[rgb(var(--color-primary-light))] mb-3">➕ Dodaj nowe ćwiczenie</h2>
        <div className="flex flex-col sm:flex-row gap-3 mb-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nazwa ćwiczenia..."
            className="flex-1 bg-black/30 border border-[rgb(var(--color-primary-light))]/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-[rgb(var(--color-primary-light))]"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-black/30 border border-[rgb(var(--color-primary-light))]/20 rounded-lg px-2 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[rgb(var(--color-primary-light))]"
          >
            {MUSCLE_CATEGORIES.filter((c) => c.value !== "wszystkie").map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          <button
            onClick={handleAdd}
            disabled={!name.trim()}
            className="bg-gradient-to-r from-[rgb(var(--rgb-primary))] to-[rgb(var(--color-secondary))] disabled:from-gray-600 disabled:to-gray-600 text-white py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            Dodaj
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-1.5 mb-6 justify-center">
        {MUSCLE_CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActiveCat(cat.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              activeCat === cat.value
                ? COLOR_CLASSES[cat.color] + " shadow-lg shadow-[rgb(var(--rgb-primary))]/10 scale-[1.03]"
                : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:scale-[1.02]"
            }`}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Exercises Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[70vh] overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center text-white/40 text-sm py-10">
            Brak ćwiczeń w tej kategorii
          </div>
        ) : (
          filtered.map((ex) => {
            const cat =
              MUSCLE_CATEGORIES.find((c) => c.value === ex.category) ||
              MUSCLE_CATEGORIES[0];
            return (
              <div
                key={ex.id}
                className="group bg-gradient-to-br from-[rgb(var(--color-primary-dark))]/10 to-black/20 backdrop-blur-md border border-[rgb(var(--color-primary-light))]/20 rounded-xl p-4 hover:bg-[rgb(var(--rgb-primary))]/10 hover:border-[rgb(var(--color-primary-light))]/30 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{cat.icon}</span>
                    <h3 className="font-semibold text-white text-sm truncate">
                      {ex.name}
                    </h3>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full border ${COLOR_CLASSES[cat.color]}`}
                  >
                    {cat.label}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      patchExercise(ex.id, {
                        name: prompt("Nowa nazwa:", ex.name) || ex.name,
                      })
                    }
                    className="flex-1 bg-[rgb(var(--color-secondary))]/20 hover:bg-[rgb(var(--color-secondary))]/30 border border-[rgb(var(--color-secondary))]/30 text-[rgb(var(--color-secondary))] text-xs py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all"
                  >
                    <Edit3 className="w-3 h-3" />
                    Edytuj
                  </button>
                  <button
                    onClick={() => removeExercise(ex.id)}
                    className="flex-1 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-200 text-xs py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                    Usuń
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}