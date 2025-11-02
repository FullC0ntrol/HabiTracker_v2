// client/src/Exercises.jsx
import { useEffect, useState, useCallback } from "react";
import { API_BASE } from "./../../lib/api";
import { authHeaders } from "./../../lib/authHeaders";

// Stałe kategorie
const MUSCLE_CATEGORIES = [
  { value: "other", label: "Other / Inne" },
  { value: "chest", label: "Chest / Klatka" },
  { value: "back", label: "Back / Plecy" },
  { value: "legs", label: "Legs / Nogi" },
  { value: "shoulders", label: "Shoulders / Ramiona (Barki)" },
  { value: "biceps", label: "Biceps" },
  { value: "triceps", label: "Triceps" },
  { value: "core", label: "Core / Brzuch" },
  { value: "cardio", label: "Cardio" },
];

// Ikonki tylko dla wyglądu (UI-only)
const CATEGORY_ICONS = {
  other: "✨",
  chest: "🏋️",
  back: "🪢",
  legs: "🦵",
  shoulders: "🛡️",
  biceps: "💪",
  triceps: "🧲",
  core: "🧱",
  cardio: "💓",
};

const Badge = ({ children }) => (
  <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-300">
    {children}
  </span>
);

const GhostButton = ({ children, className = "", ...props }) => (
  <button
    className={`px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 active:scale-[.98] transition-all text-sm ${className}`}
    {...props}
  >
    {children}
  </button>
);

const SolidButton = ({ children, className = "", ...props }) => (
  <button
    className={`px-4 py-2 rounded-xl bg-cyan-500/90 hover:bg-cyan-500 focus:ring-2 focus:ring-cyan-400/60 transition-all font-semibold active:scale-[.98] ${className}`}
    {...props}
  >
    {children}
  </button>
);

const DangerButton = ({ children, className = "", ...props }) => (
  <button
    className={`px-3 py-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-600 transition-all text-sm font-semibold active:scale-[.98] ${className}`}
    {...props}
  >
    {children}
  </button>
);

const Card = ({ children, className = "" }) => (
  <div className={`rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-md shadow-[0_10px_30px_-10px_rgba(0,0,0,.6)] ${className}`}>{children}</div>
);

const ExerciseItem = ({ ex, patch, removeItem }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(ex.name);
  const [categoryInput, setCategoryInput] = useState(ex.category);

  const handleSave = () => {
    const newName = nameInput.trim();
    const newCategory = categoryInput;
    if (newName && (newName !== ex.name || newCategory !== ex.category)) {
      patch(ex.id, { name: newName, category: newCategory });
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${ex.name}"?`)) {
      removeItem(ex.id);
    }
  };

  const handleCancel = () => {
    setNameInput(ex.name);
    setCategoryInput(ex.category);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <li className="group">
        <Card className="px-4 py-3 transition-all hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,.8)]">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-lg">
                {CATEGORY_ICONS[categoryInput] || "🏷️"}
              </div>
              <div className="flex-1 grid sm:grid-cols-2 gap-2">
                <input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/70"
                  placeholder="Name"
                />
                <div className="relative">
                  <select
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-500/70"
                  >
                    {MUSCLE_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value} className="bg-gray-900">
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/60">▾</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <SolidButton onClick={handleSave}>💾 Save</SolidButton>
              <GhostButton onClick={handleCancel} className="border-white/20">✖ Cancel</GhostButton>
            </div>
          </div>
        </Card>
      </li>
    );
  }

  return (
    <li className="group">
      <Card className="px-4 py-3 transition-all hover:translate-y-[-1px] hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,.8)]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-lg shrink-0">
              {CATEGORY_ICONS[ex.category] || "🏷️"}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-white truncate">{ex.name}</span>
                <Badge>
                  {MUSCLE_CATEGORIES.find((c) => c.value === ex.category)?.label || ex.category}
                </Badge>
              </div>
              <div className="text-[11px] text-white/50 mt-0.5">ID: {ex.id}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <GhostButton onClick={() => setIsEditing(true)}>✏️ Edit</GhostButton>
            <DangerButton onClick={handleDelete}>🗑️ Delete</DangerButton>
          </div>
        </div>
      </Card>
    </li>
  );
};

export default function Exercises() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ name: "", category: "other" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/exercises`, { headers: authHeaders(false) });
      if (!res.ok) throw new Error(`Failed to fetch exercises: ${res.statusText}`);
      const data = await res.json();
      setList(data);
    } catch (err) {
      setError("Failed to load exercises. Please check your API connection." + err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const add = async (e) => {
    e.preventDefault();
    const body = { name: form.name.trim(), category: form.category };
    if (!body.name) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/exercises`, {
        method: "POST",
        headers: authHeaders(true),
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to add exercise.");
      setForm({ name: "", category: "other" });
      await load();
    } catch (err) {
      setError("Failed to add exercise." + err);
      setLoading(false);
    }
  };

  const patch = async (id, data) => {
    try {
      const res = await fetch(`${API_BASE}/api/exercises/${id}`, {
        method: "PATCH",
        headers: authHeaders(true),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update exercise.");
      await load();
    } catch (err) {
      setError("Failed to update exercise." + err);
    }
  };

  const removeItem = async (id) => {
    try {
      // 1. Spróbuj „miękkie” usunięcie
      let res = await fetch(`${API_BASE}/api/exercises/${id}`, {
        method: "DELETE",
        headers: authHeaders(false),
      });

      // 2. Jeśli konflikt 409 – pokaż info i zapytaj o „force”
      if (res.status === 409) {
        const info = await res.json().catch(() => ({}));
        const plansCount = info?.counts?.plans ?? 0;
        const sessionsCount = info?.counts?.sessions ?? 0;

        const msg = [
          `To ćwiczenie jest używane:`,
          `• w planach: ${plansCount}`,
          `• w sesjach: ${sessionsCount}`,
          ``,
          `Usunąć powiązania i skasować ćwiczenie?`
        ].join('\n');

        if (window.confirm(msg)) {
          res = await fetch(`${API_BASE}/api/exercises/${id}?force=true`, {
            method: "DELETE",
            headers: authHeaders(false),
          });
        } else {
          return; // użytkownik zrezygnował
        }
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to delete exercise.");
      }

      await load(); // odśwież listę po udanym usunięciu
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete exercise.");
    }
  };

  // ————— UI —————
  const isEmpty = list.length === 0;

  return (
    <div className="relative mx-auto max-w-3xl p-6 text-white">
      {/* Tło dekoracyjne */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-60">
        <div className="absolute inset-x-0 top-[-120px] h-[260px] bg-gradient-to-b from-cyan-500/20 via-transparent to-transparent blur-2xl" />
        <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/10 blur-2xl" />
      </div>

      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-cyan-300 drop-shadow">🏋️ Exercise Tracker</h2>
          <p className="mt-1 text-sm text-white/60">Zarządzaj własną biblioteką ćwiczeń.</p>
        </div>
        <Badge>{list.length} items</Badge>
      </div>

      {/* Formularz */}
      <Card className="mb-8 p-4">
        <form onSubmit={add} className="grid gap-3 sm:grid-cols-[1fr_180px_auto]">
          <input
            name="name"
            className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/70"
            placeholder="Exercise name (e.g., Deadlift)"
            value={form.name}
            onChange={handleFormChange}
          />
          <div className="relative">
            <select
              name="category"
              className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-500/70 cursor-pointer"
              value={form.category}
              onChange={handleFormChange}
            >
              {MUSCLE_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value} className="bg-gray-900">
                  {cat.label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/60">▾</span>
          </div>
          <SolidButton disabled={!form.name.trim()}>{list.length > 0 ? "➕ Add Exercise" : "✨ Create first item"}</SolidButton>
        </form>
      </Card>

      {/* Lista */}
      <h3 className="mb-3 text-xl font-bold text-white/90">Your Exercises</h3>

      {error && (
        <div className="mb-4 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-amber-200">
          🚨 Error: {error}
        </div>
      )}

      {loading && isEmpty ? (
        <Card className="grid gap-3 p-4">
          <div className="h-10 animate-pulse rounded-lg bg-white/10" />
          <div className="h-10 animate-pulse rounded-lg bg-white/10" />
          <div className="h-10 animate-pulse rounded-lg bg-white/10" />
        </Card>
      ) : isEmpty ? (
        <Card className="grid place-items-center p-10 text-center text-white/70">
          <div className="text-4xl mb-2">📭</div>
          <p className="max-w-sm">No exercises yet. Use the form above to add your first one!</p>
        </Card>
      ) : (
        <ul className="space-y-3">
          {list.map((ex) => (
            <ExerciseItem key={ex.id} ex={ex} patch={patch} removeItem={removeItem} />
          ))}
        </ul>
      )}
    </div>
  );
}
