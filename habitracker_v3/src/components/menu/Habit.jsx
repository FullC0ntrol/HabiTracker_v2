// client/src/Habit.jsx
import { useEffect, useMemo, useState } from "react";
import { API_BASE } from "./../../lib/api";
import { authHeaders } from "./../../lib/authHeaders";

const fmt = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0,10);

export default function Habit() {
  const today = new Date();
  const start = useMemo(() => { const d = new Date(today); d.setDate(d.getDate() - d.getDay()); return d; }, [today]);
  const end   = useMemo(() => { const d = new Date(start); d.setDate(d.getDate() + 6); return d; }, [start]);

  const [habits, setHabits] = useState([]);
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({ name: "", target: 7, unit: "count" });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setLoading(true); setErr("");
    try {
      const hRes = await fetch(`${API_BASE}/api/habits`, { headers: authHeaders(false) });
      const eRes = await fetch(`${API_BASE}/api/habits/entries?from=${fmt(start)}&to=${fmt(end)}`, { headers: authHeaders(false) });
      if (!hRes.ok || !eRes.ok) throw new Error("load");
      setHabits(await hRes.json());
      setEntries(await eRes.json());
    } catch {
      setErr("Failed to load habits (auth?).");
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const addHabit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/habits`, {
        method: "POST",
        headers: authHeaders(true),
        body: JSON.stringify({ name: form.name.trim(), target: Number(form.target || 1), unit: form.unit || "count" })
      });
      if (!res.ok) throw new Error("create");
      setForm({ name: "", target: 7, unit: "count" });
      await load();
    } catch {
      setErr("Failed to create habit.");
      setLoading(false);
    }
  };

  const addToday = async (habitId) => {
    try {
      const current = entries.filter(e => e.habit_id === habitId && e.date === fmt(today)).reduce((a,b)=>a+(b.value||0),0);
      const res = await fetch(`${API_BASE}/api/habits/${habitId}/entries`, {
        method: "POST",
        headers: authHeaders(true),
        body: JSON.stringify({ date: fmt(today), value: current + 1 })
      });
      if (!res.ok) throw new Error("entry");
      await load();
    } catch {
      setErr("Failed to save today entry.");
    }
  };

  return (
    <div className="p-6 text-white max-w-3xl mx-auto">
      <h2 className="text-4xl font-extrabold mb-6 text-center text-cyan-400">🌱 Habits</h2>

      {err && <div className="p-3 rounded-lg bg-rose-500/20 border border-rose-400/40 mb-4">🚨 {err}</div>}

      <form onSubmit={addHabit} className="p-4 bg-white/5 rounded-xl mb-8 grid gap-3 sm:grid-cols-4">
        <input
          className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 sm:col-span-2"
          placeholder="Habit name (e.g., Drink Water)"
          value={form.name}
          onChange={(e)=>setForm(f=>({...f, name:e.target.value}))}
        />
        <input
          type="number"
          min={1}
          className="bg-white/10 border border-white/20 rounded-lg px-3 py-2"
          value={form.target}
          onChange={(e)=>setForm(f=>({...f, target:e.target.value}))}
          placeholder="target"
        />
        <select
          className="bg-white/10 border border-white/20 rounded-lg px-3 py-2"
          value={form.unit}
          onChange={(e)=>setForm(f=>({...f, unit:e.target.value}))}
        >
          <option value="count" className="bg-gray-800 text-white">count</option>
          <option value="times" className="bg-gray-800 text-white">times</option>
          <option value="minutes" className="bg-gray-800 text-white">minutes</option>
        </select>
        <button className="sm:col-span-4 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 font-semibold disabled:opacity-50" disabled={!form.name.trim() || loading}>
          ➕ Add Habit
        </button>
      </form>

      {loading ? (
        <p className="text-gray-400">Loading…</p>
      ) : habits.length === 0 ? (
        <p className="text-gray-400 text-center py-8 border border-dashed border-white/10 rounded-lg">No habits yet. Add one above!</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {habits.map(h => {
            const total = entries.filter(e => e.habit_id === h.id).reduce((a,b)=>a+(b.value||0),0);
            const progress = Math.min(1, (h.target ? total / h.target : 0));
            return (
              <div key={h.id} className="rounded-xl border border-white/10 bg-white/10 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{h.name}</div>
                    <div className="text-xs text-gray-400">Goal: {h.target} {h.unit}/week</div>
                  </div>
                  <button onClick={()=>addToday(h.id)} className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-semibold">
                    +1 today
                  </button>
                </div>
                <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${progress*100}%` }} />
                </div>
                <div className="mt-2 text-xs text-gray-400">This week: {total} / {h.target}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
