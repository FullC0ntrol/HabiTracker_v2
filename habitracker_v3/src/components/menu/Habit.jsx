// client/src/Habit.jsx
import { useEffect, useMemo, useState } from "react";
import { API_BASE } from "./../../lib/api";
import { authHeaders } from "./../../lib/authHeaders";

/* ----------------- Pomocnicze ----------------- */
const iso = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const dayNames = ["Nd", "Pn", "Wt", "Śr", "Cz", "Pt", "So"];

// Poniedziałek jako start tygodnia
const weekStart = (date) => {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // Mon=0 ... Sun=6
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
};
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

export default function Habit() {
  const [currentStart, setCurrentStart] = useState(() => weekStart(new Date()));
  const start = currentStart;
  const end = useMemo(() => addDays(start, 6), [start]);
  const today = useMemo(() => new Date(), []);
  const isToday = (d) => iso(d) === iso(today);

  const [habits, setHabits] = useState([]);
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({ name: "", target: 7, unit: "count" });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const daysOfWeek = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(start, i)),
    [start]
  );

  const load = async () => {
    setLoading(true); setErr("");
    try {
      const hRes = await fetch(`${API_BASE}/api/habits`, { headers: authHeaders(false) });
      const eRes = await fetch(
        `${API_BASE}/api/habits/entries?from=${iso(start)}&to=${iso(end)}`,
        { headers: authHeaders(false) }
      );
      if (!hRes.ok || !eRes.ok) throw new Error("load");
      setHabits(await hRes.json());
      setEntries(await eRes.json());
    } catch {
      setErr("Nie udało się pobrać danych nawyków (autoryzacja/API?).");
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [start]);

  /* ----------------- Tworzenie nawyku ----------------- */
  const addHabit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/habits`, {
        method: "POST",
        headers: authHeaders(true),
        body: JSON.stringify({
          name: form.name.trim(),
          target: Number(form.target || 1),
          unit: form.unit || "count"
        })
      });
      if (!res.ok) throw new Error("create");
      setForm({ name: "", target: 7, unit: "count" });
      await load();
    } catch {
      setErr("Nie udało się utworzyć nawyku.");
      setLoading(false);
    }
  };

  /* ----------------- Zapis wpisu (dowolny dzień) ----------------- */
  const setEntryValue = async (habitId, dateISO, value) => {
    // Optimistic: lokalnie podmień wpis
    const prev = entries;
    const filtered = prev.filter(e => !(e.habit_id === habitId && e.date === dateISO));
    const optimistic = [...filtered, { habit_id: habitId, date: dateISO, value }];
    setEntries(optimistic);

    try {
      const res = await fetch(`${API_BASE}/api/habits/${habitId}/entries`, {
        method: "POST",
        headers: authHeaders(true),
        body: JSON.stringify({ date: dateISO, value })
      });
      if (!res.ok) throw new Error("entry");
      // opcjonalnie dociągnij z API żeby wyrównać
      await load();
    } catch {
      setErr("Nie udało się zapisać wpisu.");
      setEntries(prev); // rollback
    }
  };

  const addToday = async (habitId) => {
    const isoToday = iso(today);
    const current = entries
      .filter(e => e.habit_id === habitId && e.date === isoToday)
      .reduce((a, b) => a + (b.value || 0), 0);
    await setEntryValue(habitId, isoToday, current + 1);
  };

  /* ----------------- UI ----------------- */
  return (
    <div className="p-4 sm:p-6 text-white max-w-5xl mx-auto">
      <h2 className="text-4xl font-extrabold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-cyan-600">
        🌱 Nawyk Tracker
      </h2>

      {err && (
        <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-400/30 mb-4">
          🚨 {err}
        </div>
      )}

      {/* Nawigacja tygodnia */}
      <div className="mb-6 flex flex-col sm:flex-row items-center gap-3 sm:justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentStart(addDays(start, -7))}
            className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10"
          >
            ← Poprzedni
          </button>
          <button
            onClick={() => setCurrentStart(weekStart(new Date()))}
            className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10"
          >
            Dzisiejszy
          </button>
          <button
            onClick={() => setCurrentStart(addDays(start, +7))}
            className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10"
          >
            Następny →
          </button>
        </div>

        <div className="text-sm text-white/80">
          <span className="font-semibold">
            {iso(start)} — {iso(end)}
          </span>{" "}
          <span className="text-white/50">(Pn–Nd)</span>
        </div>
      </div>

      {/* Formularz dodawania nawyku */}
      <form onSubmit={addHabit} className="p-4 bg-white/5 rounded-xl mb-8 grid gap-3 sm:grid-cols-5 border border-white/10">
        <div className="sm:col-span-2">
          <label className="text-sm text-white/80 mb-1 block">Nazwa nawyku</label>
          <input
            className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="np. Woda, Rozciąganie"
            value={form.name}
            onChange={(e)=>setForm(f=>({...f, name:e.target.value}))}
          />
        </div>
        <div>
          <label className="text-sm text-white/80 mb-1 block">Cel tygodniowy</label>
          <input
            type="number"
            min={1}
            className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-right focus:outline-none focus:ring-2 focus:ring-cyan-500"
            value={form.target}
            onChange={(e)=>setForm(f=>({...f, target:e.target.value}))}
            placeholder="7"
          />
        </div>
        <div>
          <label className="text-sm text-white/80 mb-1 block">Jednostka</label>
          <select
            className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            value={form.unit}
            onChange={(e)=>setForm(f=>({...f, unit:e.target.value}))}
          >
            <option value="count" className="bg-gray-900">liczba</option>
            <option value="times" className="bg-gray-900">razy</option>
            <option value="minutes" className="bg-gray-900">minuty</option>
          </select>
        </div>
        <div className="sm:col-span-5">
          <button
            className="w-full px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 font-semibold disabled:opacity-50"
            disabled={!form.name.trim() || loading}
          >
            ➕ Dodaj nawyk
          </button>
        </div>
      </form>

      {/* Lista nawyków */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-4 animate-pulse">
              <div className="h-5 w-2/3 bg-white/10 rounded mb-3" />
              <div className="h-2 w-full bg-white/10 rounded" />
              <div className="mt-3 grid grid-cols-7 gap-1">
                {Array.from({ length: 7 }).map((_, j) => (
                  <div key={j} className="h-10 bg-white/10 rounded" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : habits.length === 0 ? (
        <p className="text-white/70 text-center py-8 border border-dashed border-white/10 rounded-lg">
          Brak nawyków. Dodaj pierwszy powyżej!
        </p>
      ) : (
        <div className="space-y-4">
          {habits.map(h => {
            // suma w bieżącym tygodniu
            const totals = entries
              .filter(e => e.habit_id === h.id)
              .reduce((map, e) => { map[e.date] = (map[e.date] || 0) + (e.value || 0); return map; }, {});
            const total = Object.values(totals).reduce((a,b)=>a+b,0);
            const progress = Math.min(1, (h.target ? total / h.target : 0));

            return (
              <div key={h.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                {/* Nagłówek karty */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <div className="font-semibold text-lg">{h.name}</div>
                    <div className="text-xs text-white/60">
                      Cel: <span className="font-medium">{h.target}</span> {h.unit}/tydzień
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => addToday(h.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-semibold"
                    >
                      +1 dziś
                    </button>
                  </div>
                </div>

                {/* Pasek progresu */}
                <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all" style={{ width: `${progress*100}%` }} />
                </div>
                <div className="mt-2 text-xs text-white/70">
                  Ten tydzień: <span className="font-semibold text-white">{total}</span> / {h.target}
                </div>

                {/* Siatka dni tygodnia */}
                <div className="mt-4">
                  <div className="grid grid-cols-7 gap-1 sm:gap-2">
                    {daysOfWeek.map((d, idx) => {
                      const dISO = iso(d);
                      const v = totals[dISO] || 0;
                      const hot = v > 0;
                      const todayMark = isToday(d);
                      return (
                        <button
                          key={idx}
                          onClick={(e) => {
                            const delta = e.shiftKey ? -1 : +1;
                            const nextVal = Math.max(0, v + delta);
                            setEntryValue(h.id, dISO, nextVal);
                          }}
                          title={`${dayNames[d.getDay()]} • ${dISO} • ${v}`}
                          className={`relative min-h-[48px] rounded-lg border px-1 py-1 flex flex-col items-center justify-center
                            ${hot ? "border-emerald-400/40 bg-emerald-500/15" : "border-white/10 bg-white/5 hover:bg-white/10"}
                            ${todayMark ? "ring-2 ring-cyan-500/60" : ""}
                          `}
                        >
                          <span className="text-[11px] text-white/70">{dayNames[d.getDay()]}</span>
                          <span className="text-sm font-semibold">{v}</span>
                          <span className="absolute bottom-1 text-[10px] text-white/50">{d.getDate()}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-2 text-[11px] text-white/60">
                    Tip: klik = <strong>+1</strong>, <kbd className="px-1 rounded bg-white/10">Shift</kbd>+klik = <strong>–1</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
