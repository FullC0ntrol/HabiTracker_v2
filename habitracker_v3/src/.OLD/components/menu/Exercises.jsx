import { useEffect, useMemo, useState, useCallback } from "react";

// Mock API - w prawdziwej aplikacji zamień na rzeczywiste endpointy
const API_BASE = "";


/* ==================== Stałe i mapy ==================== */
const MUSCLE_CATEGORIES = [
  { value: "all", label: "Wszystkie", icon: "🎯", color: "slate" },
  { value: "chest", label: "Klatka", icon: "💪", color: "red" },
  { value: "back", label: "Plecy", icon: "🦸", color: "blue" },
  { value: "legs", label: "Nogi", icon: "🦵", color: "green" },
  { value: "shoulders", label: "Barki", icon: "🏋️", color: "yellow" },
  { value: "biceps", label: "Biceps", icon: "💪", color: "purple" },
  { value: "triceps", label: "Triceps", icon: "🔧", color: "pink" },
  { value: "core", label: "Brzuch", icon: "⭐", color: "orange" },
  { value: "cardio", label: "Cardio", icon: "❤️", color: "rose" },
  { value: "other", label: "Inne", icon: "✨", color: "gray" },
];

const getColorClasses = (color, active = false) => {
  const colors = {
    slate: active ? "bg-slate-500/20 border-slate-400/50 text-slate-200" : "border-slate-400/20 text-slate-300",
    red: active ? "bg-red-500/20 border-red-400/50 text-red-200" : "border-red-400/20 text-red-300",
    blue: active ? "bg-blue-500/20 border-blue-400/50 text-blue-200" : "border-blue-400/20 text-blue-300",
    green: active ? "bg-green-500/20 border-green-400/50 text-green-200" : "border-green-400/20 text-green-300",
    yellow: active ? "bg-yellow-500/20 border-yellow-400/50 text-yellow-200" : "border-yellow-400/20 text-yellow-300",
    purple: active ? "bg-purple-500/20 border-purple-400/50 text-purple-200" : "border-purple-400/20 text-purple-300",
    pink: active ? "bg-pink-500/20 border-pink-400/50 text-pink-200" : "border-pink-400/20 text-pink-300",
    orange: active ? "bg-orange-500/20 border-orange-400/50 text-orange-200" : "border-orange-400/20 text-orange-300",
    rose: active ? "bg-rose-500/20 border-rose-400/50 text-rose-200" : "border-rose-400/20 text-rose-300",
    gray: active ? "bg-gray-500/20 border-gray-400/50 text-gray-200" : "border-gray-400/20 text-gray-300",
  };
  return colors[color] || colors.gray;
};

function Card({ children, className = "" }) {
  return (
    <div className={`rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl shadow-lg ${className}`}>
      {children}
    </div>
  );
}

function GhostBtn({ children, className = "", ...props }) {
  return (
    <button
      className={`px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 active:scale-95 transition-all duration-200 text-sm font-medium ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function SolidBtn({ children, className = "", disabled, ...props }) {
  return (
    <button
      className={`px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-sm font-semibold active:scale-95 transition-all duration-200 shadow-lg shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

function DangerBtn({ children, className = "", ...props }) {
  return (
    <button
      className={`px-3 py-1.5 rounded-lg bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-sm font-semibold active:scale-95 transition-all duration-200 shadow-lg shadow-rose-500/25 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

/* Karta ćwiczenia - większa z pełnymi nazwami */
function ExerciseCard({ ex, onPatch, onDelete }) {
  const [edit, setEdit] = useState(false);
  const [name, setName] = useState(ex.name);
  const [cat, setCat] = useState(ex.category);

  const categoryData = MUSCLE_CATEGORIES.find((c) => c.value === cat) || MUSCLE_CATEGORIES[MUSCLE_CATEGORIES.length - 1];

  const commit = async () => {
    const newName = name.trim();
    if (!newName) return;
    if (newName !== ex.name || cat !== ex.category) {
      await onPatch(ex.id, { name: newName, category: cat });
    }
    setEdit(false);
  };

  const softDelete = async () => {
    if (!confirm(`Usunąć "${ex.name}"?`)) return;
    await onDelete(ex.id);
  };

  if (edit) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="grid h-12 w-12 place-items-center rounded-lg bg-gradient-to-br from-white/10 to-white/5 text-xl shrink-0">
            {categoryData.icon}
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
            placeholder="Nazwa"
            autoFocus
          />
        </div>
        <div className="flex gap-2">
          <select
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white appearance-none focus:outline-none focus:ring-1 focus:ring-cyan-400 cursor-pointer"
          >
            {MUSCLE_CATEGORIES.filter((c) => c.value !== "all").map((c) => (
              <option key={c.value} value={c.value} className="bg-gray-900">
                {c.icon} {c.label}
              </option>
            ))}
          </select>
          <SolidBtn onClick={commit}>💾</SolidBtn>
          <GhostBtn onClick={() => setEdit(false)}>✖</GhostBtn>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 hover:shadow-xl transition-all duration-300 group">
      <div className="flex flex-col">
        <div className="flex items-start gap-3 mb-3">
          <div className={`grid h-12 w-12 place-items-center rounded-lg text-xl shrink-0 border ${getColorClasses(categoryData.color)}`}>
            {categoryData.icon}
          </div>
          <div className="flex-1 overflow-hidden">
            <h3 className="font-semibold text-base text-white leading-snug mb-2 break-words">{ex.name}</h3>
            <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase ${getColorClasses(categoryData.color, true)}`}>
              {categoryData.label}
            </span>
          </div>
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <GhostBtn onClick={() => setEdit(true)} className="flex-1">✏️ Edytuj</GhostBtn>
          <DangerBtn onClick={softDelete} className="flex-1">🗑️ Usuń</DangerBtn>
        </div>
      </div>
    </Card>
  );
}

/* ==================== Główna lista ==================== */
export default function Exercises() {
  const [list, setList] = useState([
    { id: 1, name: "Wyciskanie sztangi na ławce poziomej", category: "chest" },
    { id: 2, name: "Martwy ciąg", category: "back" },
    { id: 3, name: "Przysiady ze sztangą", category: "legs" },
    { id: 4, name: "Wyciskanie sztangi nad głowę", category: "shoulders" },
    { id: 5, name: "Uginanie ramion ze sztangą", category: "biceps" },
    { id: 6, name: "Pompki na poręczach", category: "triceps" },
    { id: 7, name: "Deska", category: "core" },
    { id: 8, name: "Bieg interwałowy", category: "cardio" },
    { id: 9, name: "Podciąganie", category: "back" },
    { id: 10, name: "Wykroki", category: "legs" },
  ]);
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [err, setErr] = useState(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("other");
  const [activeCat, setActiveCat] = useState("all");
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const add = () => {
    const body = { name: name.trim(), category };
    if (!body.name) return;
    
    const newEx = { id: Date.now(), name: body.name, category: body.category };
    setList([...list, newEx]);
    setName("");
    setCategory("other");
  };

  const patch = async (id, data) => {
    setList(list.map(ex => ex.id === id ? { ...ex, ...data } : ex));
  };

  const removeItem = async (id) => {
    setList(list.filter(ex => ex.id !== id));
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list.filter((ex) => {
      if (activeCat !== "all" && ex.category !== activeCat) return false;
      if (!q) return true;
      return ex.name.toLowerCase().includes(q) || (ex.category || "").toLowerCase().includes(q);
    });
  }, [list, activeCat, query]);

  const stats = useMemo(() => {
    const counts = {};
    list.forEach(ex => {
      counts[ex.category] = (counts[ex.category] || 0) + 1;
    });
    return counts;
  }, [list]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      add();
    }
  };

  return (
    <div className="text-white">
      {/* Nagłówek kompaktowy */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 grid place-items-center text-xl shadow-lg">
            🏋️
          </div>
          <div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
              Biblioteka ćwiczeń
            </h1>
            <p className="text-xs text-white/60">Zarządzaj treningami</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-cyan-300">{list.length}</div>
          <div className="text-[10px] text-white/60">ćwiczeń</div>
        </div>
      </div>

      {/* Dodawanie - kompaktowe */}
      <Card className="mb-3 p-3">
        <div className="flex gap-2">
          <input
            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            placeholder="Nazwa ćwiczenia..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <select
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-400 cursor-pointer w-32"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {MUSCLE_CATEGORIES.filter((c) => c.value !== "all").map((cat) => (
              <option key={cat.value} value={cat.value} className="bg-gray-900">
                {cat.icon} {cat.label}
              </option>
            ))}
          </select>
          <SolidBtn disabled={!name.trim()} onClick={add}>
            ➕ Dodaj
          </SolidBtn>
        </div>
      </Card>

      {/* Filtry i wyszukiwarka */}
      <Card className="mb-4 p-3">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3">
          <div className="flex flex-wrap gap-1.5 flex-1">
            {MUSCLE_CATEGORIES.map((c) => {
              const isActive = activeCat === c.value;
              const count = c.value === "all" ? list.length : stats[c.value] || 0;
              return (
                <button
                  key={c.value}
                  onClick={() => setActiveCat(c.value)}
                  className={`px-2.5 py-1 rounded-lg border transition-all text-xs flex items-center gap-1 ${
                    isActive
                      ? `${getColorClasses(c.color, true)} shadow-md`
                      : `border-white/10 bg-white/5 hover:bg-white/10 text-white/80`
                  }`}
                >
                  <span>{c.icon}</span>
                  <span className="font-medium">{c.label}</span>
                  {count > 0 && (
                    <span className="px-1.5 rounded-full bg-white/20 text-[10px] font-bold">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-48">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Szukaj..."
                className="w-full bg-white/10 border border-white/20 rounded-lg pl-8 pr-3 py-1.5 text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40">🔍</span>
            </div>
            {query && (
              <GhostBtn onClick={() => setQuery("")}>✖</GhostBtn>
            )}
          </div>
        </div>
      </Card>

      {/* Błędy */}
      {err && (
        <Card className="mb-3 p-3 border-amber-400/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <p className="text-amber-200 text-sm font-medium">{err}</p>
          </div>
        </Card>
      )}

      {/* Lista */}
      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-4xl mb-2">🔎</div>
          <h3 className="text-lg font-bold text-white/90 mb-1">Brak wyników</h3>
          <p className="text-sm text-white/60 mb-3">
            Nie znaleziono ćwiczeń
          </p>
          <GhostBtn onClick={() => { setActiveCat("all"); setQuery(""); }}>
            Wyczyść filtry
          </GhostBtn>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((ex) => (
            <ExerciseCard key={ex.id} ex={ex} onPatch={patch} onDelete={removeItem} />
          ))}
        </div>
      )}
    </div>
  );
}