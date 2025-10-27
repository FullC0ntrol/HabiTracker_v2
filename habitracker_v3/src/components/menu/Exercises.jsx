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
      <li className="rounded-xl border border-white/30 bg-white/20 px-3 py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 transition-all">
        <div className="flex-1 flex gap-2 w-full sm:w-auto">
          <input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white placeholder-gray-400"
            placeholder="Name"
          />
          <select
            value={categoryInput}
            onChange={(e) => setCategoryInput(e.target.value)}
            className="w-28 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white appearance-none"
          >
            {MUSCLE_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value} className="bg-gray-800 text-white">
                {cat.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button onClick={handleSave} className="px-3 py-1 rounded-lg bg-green-600 hover:bg-green-500 transition-colors text-sm font-semibold">
            Save
          </button>
          <button onClick={handleCancel} className="px-3 py-1 rounded-lg bg-gray-500 hover:bg-gray-400 transition-colors text-sm">
            Cancel
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="rounded-xl border border-white/10 bg-white/10 hover:bg-white/20 transition-colors px-3 py-2 flex items-center justify-between">
      <div className="text-gray-200">
        <span className="font-semibold text-white">{ex.name}</span>
        <span className="text-xs text-cyan-300 ml-3 uppercase font-medium tracking-wider">
          {MUSCLE_CATEGORIES.find(c => c.value === ex.category)?.label || ex.category}
        </span>
      </div>
      <div className="flex gap-2">
        <button className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/30 transition-colors text-sm" onClick={() => setIsEditing(true)}>
          ✏️ Edit
        </button>
        <button className="px-3 py-1 rounded-lg bg-rose-600/80 hover:bg-rose-600 transition-colors text-sm" onClick={handleDelete}>
          🗑️ Delete
        </button>
      </div>
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

  useEffect(() => { load(); }, [load]);

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


  if (loading && list.length === 0) return <div className="p-6 text-gray-400 text-lg text-center">Loading exercises...</div>;
  if (error) return <div className="p-6 text-red-400 border border-red-500 bg-red-900/50 rounded-lg max-w-2xl mx-auto mt-6">🚨 Error: {error}</div>;

  return (
    <div className="p-6 text-white max-w-2xl mx-auto">
      <h2 className="text-4xl font-extrabold mb-6 text-center text-cyan-400">🏋️ Exercise Tracker</h2>

      <form onSubmit={add} className="flex flex-col sm:flex-row gap-3 p-4 bg-white/5 rounded-xl mb-8 shadow-lg">
        <input
          name="name"
          className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          placeholder="Exercise name (e.g., Deadlift)"
          value={form.name}
          onChange={handleFormChange}
        />
        <select
          name="category"
          className="w-full sm:w-48 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none cursor-pointer"
          value={form.category}
          onChange={handleFormChange}
        >
          {MUSCLE_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value} className="bg-gray-800 text-white">
              {cat.label}
            </option>
          ))}
        </select>
        <button className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 transition-colors font-semibold disabled:opacity-50" disabled={!form.name.trim() || loading}>
          {loading && list.length > 0 ? "Adding..." : "➕ Add Exercise"}
        </button>
      </form>

      <h3 className="text-2xl font-bold mb-4 border-b border-white/20 pb-2">Your Exercises</h3>
      {list.length === 0 ? (
        <p className="text-gray-400 text-center py-8 border border-dashed border-white/10 rounded-lg">
          No exercises yet. Use the form above to add your first one!
        </p>
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
