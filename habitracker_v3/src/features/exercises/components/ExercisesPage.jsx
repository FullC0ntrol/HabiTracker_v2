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
  slate: "from-[rgba(var(--rgb-slate-500),0.20)] to-[rgba(var(--rgb-slate-400),0.10)] border-[rgba(var(--rgb-slate-500),0.30)] text-[var(--color-slate-200)]",
  red: "from-[rgba(var(--rgb-red-500),0.20)] to-[rgba(var(--rgb-red-400),0.10)] border-[rgba(var(--rgb-red-500),0.30)] text-[var(--color-red-200)]",
  blue: "from-[rgba(var(--rgb-blue-500),0.20)] to-[rgba(var(--rgb-blue-400),0.10)] border-[rgba(var(--rgb-blue-500),0.30)] text-[var(--color-blue-200)]",
  green: "from-[rgba(var(--rgb-green-500),0.20)] to-[rgba(var(--rgb-green-400),0.10)] border-[rgba(var(--rgb-green-500),0.30)] text-[var(--color-green-200)]",
  yellow: "from-[rgba(var(--rgb-yellow-500),0.20)] to-[rgba(var(--rgb-yellow-400),0.10)] border-[rgba(var(--rgb-yellow-500),0.30)] text-[var(--color-yellow-200)]",
  purple: "from-[rgba(var(--rgb-purple-500),0.20)] to-[rgba(var(--rgb-purple-400),0.10)] border-[rgba(var(--rgb-purple-500),0.30)] text-[var(--color-purple-200)]",
  pink: "from-[rgba(var(--rgb-pink-500),0.20)] to-[rgba(var(--rgb-pink-400),0.10)] border-[rgba(var(--rgb-pink-500),0.30)] text-[var(--color-pink-200)]",
  orange: "from-[rgba(var(--rgb-orange-500),0.20)] to-[rgba(var(--rgb-orange-400),0.10)] border-[rgba(var(--rgb-orange-500),0.30)] text-[var(--color-orange-200)]",
  rose: "from-[rgba(var(--rgb-rose-500),0.20)] to-[rgba(var(--rgb-rose-500),0.10)] border-[rgba(var(--rgb-rose-500),0.30)] text-[var(--color-rose-200)]",
  gray: "from-[rgba(var(--rgb-gray-500),0.20)] to-[rgba(var(--rgb-gray-400),0.10)] border-[rgba(var(--rgb-gray-500),0.30)] text-[var(--color-gray-200)]",
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
    <div className="min-h-screen bg-gradient-to-br from-[rgba(var(--rgb-primary-950),0.20)] to-[rgba(var(--rgb-slate-900),0.40)] text-[var(--color-text-base)] p-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[rgba(var(--rgb-primary),0.20)] rounded-xl border border-[rgba(var(--rgb-primary-400),0.30)]">
            <Dumbbell className="w-6 h-6 text-[var(--color-primary-300)]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--color-text-base)]">Biblioteka ćwiczeń</h1>
            <p className="text-xs text-[rgba(var(--rgb-primary-300),0.60)]">Twoja baza treningowa</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-[var(--color-primary-300)]">{list.length}</div>
          <div className="text-xs text-[rgba(var(--rgb-white),0.40)]">ćwiczeń</div>
        </div>
      </div>

      {/* Add Form */}
      <div className="bg-[rgba(var(--rgb-white),0.05)] backdrop-blur-md rounded-xl border border-[rgba(var(--rgb-primary),0.20)] p-4 mb-6 shadow-lg shadow-[rgba(var(--rgb-primary-900),0.20)]">
        <h2 className="text-sm font-semibold text-[var(--color-primary-300)] mb-3">➕ Dodaj nowe ćwiczenie</h2>
        <div className="flex flex-col sm:flex-row gap-3 mb-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nazwa ćwiczenia..."
            className="flex-1 bg-[rgba(var(--rgb-black),0.30)] border border-[rgba(var(--rgb-primary),0.20)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-base)] placeholder-[rgba(var(--rgb-white),0.40)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-400)]"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-[rgba(var(--rgb-black),0.30)] border border-[rgba(var(--rgb-primary),0.20)] rounded-lg px-2 py-2 text-sm text-[var(--color-text-base)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-400)]"
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
            className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] disabled:from-[var(--color-gray-600)] disabled:to-[var(--color-gray-600)] text-[var(--color-text-base)] py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
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
                ? COLOR_CLASSES[cat.color] + " shadow-lg shadow-[rgba(var(--rgb-primary),0.10)] scale-[1.03]"
                : "bg-[rgba(var(--rgb-white),0.05)] border-[rgba(var(--rgb-white),0.1)] text-[rgba(var(--rgb-white),0.60)] hover:bg-[rgba(var(--rgb-white),0.10)] hover:scale-[1.02]"
            }`}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Exercises Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[70vh] overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center text-[rgba(var(--rgb-white),0.40)] text-sm py-10">
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
                className="group bg-gradient-to-br from-[rgba(var(--rgb-primary-900),0.10)] to-[rgba(var(--rgb-black),0.20)] backdrop-blur-md border border-[rgba(var(--rgb-primary),0.20)] rounded-xl p-4 hover:bg-[rgba(var(--rgb-primary),0.10)] hover:border-[rgba(var(--rgb-primary-400),0.30)] transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{cat.icon}</span>
                    <h3 className="font-semibold text-[var(--color-text-base)] text-sm truncate">
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
                    className="flex-1 bg-[rgba(var(--rgb-secondary),0.20)] hover:bg-[rgba(var(--rgb-secondary),0.30)] border border-[rgba(var(--rgb-secondary),0.30)] text-[var(--color-secondary-200)] text-xs py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all"
                  >
                    <Edit3 className="w-3 h-3" />
                    Edytuj
                  </button>
                  <button
                    onClick={() => removeExercise(ex.id)}
                    className="flex-1 bg-[rgba(var(--rgb-rose-500),0.20)] hover:bg-[rgba(var(--rgb-rose-500),0.30)] border border-[rgba(var(--rgb-rose-500),0.30)] text-[var(--color-rose-200)] text-xs py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all"
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