import { useState, useMemo } from "react";
import { useExercises } from "../hooks/useExercises";

// 🧱 Kategorie mięśni (PL)
const MUSCLE_CATEGORIES = [
  { value: "wszystkie", label: "Wszystkie", icon: "🎯", color: "slate" },
  { value: "klatka", label: "Klatka piersiowa", icon: "💪", color: "red" },
  { value: "plecy", label: "Plecy", icon: "🦸", color: "blue" },
  { value: "nogi", label: "Nogi", icon: "🦵", color: "green" },
  { value: "barki", label: "Barki", icon: "🏋️", color: "yellow" },
  { value: "biceps", label: "Biceps", icon: "💪", color: "purple" },
  { value: "triceps", label: "Triceps", icon: "🔧", color: "pink" },
  { value: "brzuch", label: "Brzuch", icon: "⭐", color: "orange" },
  { value: "cardio", label: "Cardio", icon: "❤️", color: "rose" },
  { value: "inne", label: "Inne", icon: "✨", color: "gray" },
];

// 🧩 Pomocnicza funkcja klas kolorów — BEZ dynamicznych interpolacji
function getColorClasses(color, active = false) {
  const colors = {
    slate: active
      ? "bg-slate-500/20 border-slate-400/50 text-slate-200"
      : "border-slate-400/20 text-slate-300",
    red: active
      ? "bg-red-500/20 border-red-400/50 text-red-200"
      : "border-red-400/20 text-red-300",
    blue: active
      ? "bg-blue-500/20 border-blue-400/50 text-blue-200"
      : "border-blue-400/20 text-blue-300",
    green: active
      ? "bg-green-500/20 border-green-400/50 text-green-200"
      : "border-green-400/20 text-green-300",
    yellow: active
      ? "bg-yellow-500/20 border-yellow-400/50 text-yellow-200"
      : "border-yellow-400/20 text-yellow-300",
    purple: active
      ? "bg-purple-500/20 border-purple-400/50 text-purple-200"
      : "border-purple-400/20 text-purple-300",
    pink: active
      ? "bg-pink-500/20 border-pink-400/50 text-pink-200"
      : "border-pink-400/20 text-pink-300",
    orange: active
      ? "bg-orange-500/20 border-orange-400/50 text-orange-200"
      : "border-orange-400/20 text-orange-300",
    rose: active
      ? "bg-rose-500/20 border-rose-400/50 text-rose-200"
      : "border-rose-400/20 text-rose-300",
    gray: active
      ? "bg-gray-500/20 border-gray-400/50 text-gray-200"
      : "border-gray-400/20 text-gray-300",
  };
  return colors[color] || "border-white/20 text-white/70";
}

// 🧱 Prosty komponent karty
function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-xl border border-white/10 bg-white/[0.03] shadow-lg ${className}`}
    >
      {children}
    </div>
  );
}

/* ==========================================================
 *   GŁÓWNY KOMPONENT STRONY
 * ========================================================== */
export default function ExercisesPage() {
  const { list, addExercise, patchExercise, removeExercise } = useExercises();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("inne");
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState("wszystkie");

  // 🔍 Filtrowanie ćwiczeń
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list.filter((ex) => {
      if (activeCat !== "wszystkie" && ex.category !== activeCat) return false;
      if (!q) return true;
      return (
        ex.name.toLowerCase().includes(q) ||
        (ex.category || "").toLowerCase().includes(q)
      );
    });
  }, [list, activeCat, query]);

  const handleAdd = () => {
    if (!name.trim()) return;
    addExercise({ name: name.trim(), category });
    setName("");
  };

  return (
    <div className="text-white space-y-4">
      {/* Nagłówek */}
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-black bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
          🏋️ Biblioteka ćwiczeń
        </h1>
        <div className="text-right">
          <div className="text-lg font-bold text-cyan-300">{list.length}</div>
          <div className="text-[10px] text-white/60">ćwiczeń</div>
        </div>
      </header>

      {/* ➕ Dodawanie nowego ćwiczenia */}
      <Card className="p-3 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nazwa ćwiczenia..."
          className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white w-36"
        >
          {MUSCLE_CATEGORIES.filter((c) => c.value !== "wszystkie").map((cat) => (
            <option key={cat.value} value={cat.value} className="bg-gray-900">
              {cat.icon} {cat.label}
            </option>
          ))}
        </select>
        <button
          onClick={handleAdd}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-sm font-semibold"
        >
          ➕ Dodaj
        </button>
      </Card>

      {/* 🔍 Filtr kategorii */}
      <div className="flex flex-wrap gap-2">
        {MUSCLE_CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActiveCat(cat.value)}
            className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition ${getColorClasses(
              cat.color,
              activeCat === cat.value
            )}`}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Lista ćwiczeń */}
      {filtered.length === 0 ? (
        <Card className="p-8 text-center text-white/70">Brak ćwiczeń</Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((ex) => (
            <Card key={ex.id} className="p-4">
              <div className="font-semibold text-lg mb-1">{ex.name}</div>
              <div className="text-sm opacity-70 capitalize">
                {ex.category || "inne"}
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => patchExercise(ex.id, { name: ex.name + " ✔" })}
                  className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-sm"
                >
                  ✏️ Edytuj
                </button>
                <button
                  onClick={() => removeExercise(ex.id)}
                  className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-sm"
                >
                  🗑️ Usuń
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
