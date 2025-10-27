// client/src/Plan.jsx
import { useEffect, useState } from "react";
import { API_BASE } from "./../../lib/api";
import { authHeaders } from "./../../lib/authHeaders";

export default function Plan() {
  const [exercises, setExercises] = useState([]);
  const [plans, setPlans] = useState([]);
  const [selected, setSelected] = useState([]); // [{exercise_id, sets, reps}]
  const [name, setName] = useState("Full Body A");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const exRes = await fetch(`${API_BASE}/api/exercises`, { headers: authHeaders(false) });
      const plRes = await fetch(`${API_BASE}/api/plans`, { headers: authHeaders(false) });
      if (!exRes.ok || !plRes.ok) throw new Error("Load error");
      setExercises(await exRes.json());
      setPlans(await plRes.json());
    } catch (e) {
      setErr("Failed to load data." + e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toggleExercise = (ex) => {
    setSelected(s => {
      const exists = s.find(it => it.exercise_id === ex.id);
      if (exists) return s.filter(it => it.exercise_id !== ex.id);
      return [...s, { exercise_id: ex.id, sets: 3, reps: "8-12" }];
    });
  };

  const changeField = (id, field, value) => {
    setSelected(s => s.map(it => it.exercise_id === id ? { ...it, [field]: value } : it));
  };

  const createPlan = async (e) => {
    e.preventDefault();
    if (!name.trim() || selected.length === 0) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/plans`, {
        method: "POST",
        headers: authHeaders(true),
        body: JSON.stringify({ name: name.trim(), items: selected }),
      });
      if (!res.ok) throw new Error("Create plan failed");
      setSelected([]);
      setName("Full Body A");
      await load();
    } catch (e) {
      setErr("Failed to create plan (auth?)." + e);
      setLoading(false);
    }
  };

  return (
    <div className="p-6 text-white max-w-3xl mx-auto">
      <h2 className="text-4xl font-extrabold mb-6 text-center text-cyan-400">📋 Plans</h2>

      {err && <div className="p-3 rounded-lg bg-rose-500/20 border border-rose-400/40 mb-4">🚨 {err}</div>}

      {/* Formularz tworzenia */}
      <form onSubmit={createPlan} className="p-4 bg-white/5 rounded-xl mb-8">
        <div className="flex flex-col sm:flex-row gap-3 mb-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2"
            placeholder="Plan name"
          />
          <button className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 font-semibold disabled:opacity-50" disabled={!name.trim() || selected.length === 0 || loading}>
            ➕ Create Plan
          </button>
        </div>

        <p className="text-sm text-gray-300 mb-2">Pick exercises:</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {exercises.map(ex => {
            const sel = selected.find(it => it.exercise_id === ex.id);
            return (
              <div key={ex.id} className={`rounded-xl border px-3 py-2 ${sel ? 'border-cyan-400 bg-cyan-500/10' : 'border-white/10 bg-white/10'}`}>
                <label className="flex items-center gap-3">
                  <input type="checkbox" checked={!!sel} onChange={() => toggleExercise(ex)} />
                  <div className="flex-1">
                    <div className="font-semibold">{ex.name}</div>
                    <div className="text-xs text-cyan-300 uppercase">{ex.category}</div>
                  </div>
                </label>
                {sel && (
                  <div className="mt-2 flex gap-2">
                    <input
                      type="number"
                      min={1}
                      value={sel.sets}
                      onChange={(e) => changeField(ex.id, 'sets', Number(e.target.value))}
                      className="w-20 bg-white/10 border border-white/20 rounded-lg px-2 py-1"
                      placeholder="sets"
                    />
                    <input
                      value={sel.reps}
                      onChange={(e) => changeField(ex.id, 'reps', e.target.value)}
                      className="flex-1 bg-white/10 border border-white/20 rounded-lg px-2 py-1"
                      placeholder="reps e.g. 8-12"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </form>

      {/* Lista planów */}
      <div className="p-4 bg-white/5 rounded-xl">
        <h3 className="text-2xl font-bold mb-3 border-b border-white/20 pb-2">Your Plans</h3>
        {loading ? (
          <p className="text-gray-400">Loading…</p>
        ) : plans.length === 0 ? (
          <p className="text-gray-400">No plans yet. Create one above.</p>
        ) : (
          <ul className="space-y-2">
            {plans.map(p => (
              <PlanItem key={p.id} plan={p} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function PlanItem({ plan }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);

  const loadItems = async () => {
    const res = await fetch(`${API_BASE}/api/plans/${plan.id}`, { headers: authHeaders(false) });
    const data = await res.json();
    setItems(data);
  };

  useEffect(() => { if (open) loadItems(); /* eslint-disable-next-line */ }, [open]);

  return (
    <li className="rounded-xl border border-white/10 bg-white/10 px-3 py-2">
      <button onClick={() => setOpen(o => !o)} className="w-full text-left font-semibold">
        {open ? '▼' : '►'} {plan.name}
      </button>
      {open && (
        <ul className="mt-2 space-y-1 pl-4">
          {items.length === 0 ? (
            <li className="text-gray-400">No items</li>
          ) : items.map(it => (
            <li key={it.id} className="flex items-center justify-between">
              <span>{it.order_index + 1}. {it.name} <span className="text-xs text-gray-400">({it.muscle_group})</span></span>
              <span className="text-xs px-2 py-1 rounded-lg bg-amber-500/20 text-amber-200 border border-amber-400/30">
                {it.sets} x {it.reps}
              </span>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
