// client/src/Habit.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { API_BASE } from "./../../lib/api";
import { authHeaders } from "./../../lib/authHeaders";
import { HabitSidebar } from "./../calendar/HabitSidebar";
import { ChevronLeft, ChevronRight, Plus, Target, Flame, Calendar } from "lucide-react";

/* ===================== Pomocnicze ===================== */
const toISO = (d) =>
  new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);

const dayNames = ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"];
const monthNames = ["Sty", "Lut", "Mar", "Kwi", "Maj", "Cze", "Lip", "Sie", "Wrz", "Paź", "Lis", "Gru"];

const weekStart = (date) => {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
};
const addDays = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  x.setHours(0, 0, 0, 0);
  return x;
};

/* Mini pasek postępu (kompakt) */
function ProgressBar({ value, max }) {
  const pct = Math.min(100, max ? (value / max) * 100 : 0);
  return (
    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
      <div
        className="h-full bg-emerald-500 transition-all duration-500 ease-out rounded-full"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/* Dzień tygodnia – PODGLĄD (bez klików) */
function DayBadge({ date, isCompleted, isToday }) {
  const name = dayNames[(date.getDay() + 6) % 7]; // Pn start
  const num = date.getDate();
  return (
    <div
      className={[
        "relative w-10 h-10 rounded-lg border text-center grid place-items-center select-none",
        isCompleted ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-200" : "border-white/10 bg-white/5 text-white/80",
        isToday ? "ring-1 ring-cyan-400/70" : "",
      ].join(" ")}
      title={`${name} ${num}`}
    >
      <span className="text-[11px] leading-3">{name}</span>
      <span className="text-[11px] leading-3 opacity-80">{num}</span>
      {isCompleted && <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-emerald-400 rounded-full" />}
    </div>
  );
}

/* =======================================================
   GŁÓWNY KOMPONENT
======================================================= */
export default function Habit() {
  // --- daty
  const [currentStart, setCurrentStart] = useState(() => weekStart(new Date()));
  const start = currentStart;
  const end = useMemo(() => addDays(start, 6), [start]);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const todayISO = toISO(today);
  const isToday = (d) => toISO(d) === todayISO;

  // --- dane
  const [habits, setHabits] = useState([]);
  const [weekEntries, setWeekEntries] = useState([]);
  const [allEntries, setAllEntries] = useState([]);
  const [form, setForm] = useState({ name: "", target: 7, unit: "count" });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const daysOfWeek = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(start, i)),
    [start]
  );

  const weekRangeText = useMemo(() => {
    const sM = monthNames[start.getMonth()];
    const eM = monthNames[end.getMonth()];
    return sM === eM
      ? `${start.getDate()}–${end.getDate()} ${eM} ${end.getFullYear()}`
      : `${start.getDate()} ${sM} – ${end.getDate()} ${eM} ${end.getFullYear()}`;
  }, [start, end]);

  /* ------------------ Pobieranie ------------------ */
  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const fromW = toISO(start);
      const toW = toISO(end);

      const [hRes, weekRes, allRes] = await Promise.all([
        fetch(`${API_BASE}/api/habits`, { headers: authHeaders(false) }),
        fetch(`${API_BASE}/api/habits/entries?from=${fromW}&to=${toW}`, { headers: authHeaders(false) }),
        fetch(`${API_BASE}/api/habits/entries`, { headers: authHeaders(false) }),
      ]);

      if (!hRes.ok || !weekRes.ok || !allRes.ok) throw new Error("load");

      const [h, w, a] = await Promise.all([hRes.json(), weekRes.json(), allRes.json()]);
      setHabits(h);
      setWeekEntries(w);
      setAllEntries(a);
    } catch {
      setErr("Nie udało się pobrać danych nawyków");
    } finally {
      setLoading(false);
    }
  }, [start, end]);

  useEffect(() => {
    load();
  }, [load]);

  /* ------------------ Agregaty ------------------ */
  const totalsWeek = useMemo(() => {
    const map = {};
    for (const e of weekEntries) {
      map[e.habit_id] ??= {};
      map[e.habit_id][e.date] = (map[e.habit_id][e.date] || 0) + (e.value || 0);
    }
    return map;
  }, [weekEntries]);

  const streakByHabit = useMemo(() => {
    const byHabit = {};
    const m = {};
    for (const e of allEntries) {
      m[e.habit_id] ??= {};
      m[e.habit_id][e.date] = (m[e.habit_id][e.date] || 0) + (e.value || 0);
    }
    for (const h of habits) {
      let streak = 0;
      let cur = new Date(today);
      while (true) {
        const key = toISO(cur);
        if ((m[h.id]?.[key] || 0) > 0) {
          streak++;
          cur = addDays(cur, -1);
        } else break;
      }
      byHabit[h.id] = streak;
    }
    return byHabit;
  }, [allEntries, habits, today]);

  const todayCounts = useMemo(() => {
    const counts = {};
    habits.forEach((h) => {
      counts[h.id] = weekEntries
        .filter((e) => e.habit_id === h.id && e.date === todayISO)
        .reduce((sum, entry) => sum + (entry.value || 0), 0);
    });
    return counts;
  }, [habits, weekEntries, todayISO]);

  /* ------------------ UI ------------------ */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* tło akcentowe */}
      <div className="absolute inset-0 -z-10 opacity-25">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-emerald-500/5 to-blue-500/10" />
      </div>

      <div className="mx-auto px-3 sm:px-4 py-5 max-w-[1200px]">
        {/* Nagłówek */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-emerald-500/20">
              <Calendar className="w-7 h-7 text-cyan-400" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-300 to-emerald-400 bg-clip-text text-transparent">
              Tracker Nawyków
            </h1>
          </div>
          <p className="text-white/60 text-sm sm:text-base max-w-2xl mx-auto">
            Odhaczaj dzisiaj w panelu bocznym. Tutaj masz przejrzysty podgląd tygodnia.
          </p>
        </div>

        {/* Nawigacja tygodnia */}
        <div className="bg-white/5 rounded-2xl p-3 sm:p-4 mb-5 border border-white/10">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentStart(addDays(start, -7))}
                className="h-9 w-9 grid place-items-center rounded-lg border border-white/10 bg-white/5 hover:bg-white/10"
                title="Poprzedni tydzień"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentStart(weekStart(new Date()))}
                className="h-9 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 font-semibold text-sm"
              >
                Dziś
              </button>
              <button
                onClick={() => setCurrentStart(addDays(start, +7))}
                className="h-9 w-9 grid place-items-center rounded-lg border border-white/10 bg-white/5 hover:bg-white/10"
                title="Następny tydzień"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center">
              <div className="text-base sm:text-lg font-bold">{weekRangeText}</div>
            </div>

            <button
              onClick={() => setSidebarOpen(true)}
              className="h-9 px-3 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 font-semibold text-sm shadow"
            >
              Odhacz dzisiaj
            </button>
          </div>
        </div>

        {err && (
          <div className="mb-5 rounded-xl border border-rose-400/30 bg-rose-500/15 px-3 py-2 text-sm">
            🚨 {err}
          </div>
        )}

        {/* Formularz dodawania */}
        <div className="bg-white/5 rounded-2xl p-4 mb-6 border border-white/10">
          <h3 className="text-base font-semibold mb-3 text-cyan-300 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Dodaj nawyk
          </h3>
          <form
            onSubmit={async (e) => {
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
                    unit: form.unit || "count",
                  }),
                });
                if (!res.ok) throw new Error("create");
                setForm({ name: "", target: 7, unit: "count" });
                await load();
              } catch {
                setErr("Nie udało się utworzyć nawyku");
                setLoading(false);
              }
            }}
            className="grid gap-3 grid-cols-1 sm:grid-cols-[1fr_120px_140px_auto]"
          >
            <input
              className="h-10 bg-white/10 border border-white/15 rounded-lg px-3 text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="np. Woda, Medytacja…"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <input
              type="number"
              min={1}
              className="h-10 bg-white/10 border border-white/15 rounded-lg px-3 text-sm text-center focus:outline-none focus:ring-2 focus:ring-cyan-500"
              value={form.target}
              onChange={(e) => setForm((f) => ({ ...f, target: e.target.value }))}
              title="Cel tygodniowy"
              placeholder="7"
            />
            <select
              className="h-10 bg-white/10 border border-white/15 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              value={form.unit}
              onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
              title="Jednostka"
            >
              <option value="count" className="bg-gray-900">szt.</option>
              <option value="times" className="bg-gray-900">razy</option>
              <option value="minutes" className="bg-gray-900">min</option>
              <option value="cups" className="bg-gray-900">szkl.</option>
              <option value="pages" className="bg-gray-900">str.</option>
            </select>
            <button
              type="submit"
              disabled={!form.name.trim() || loading}
              className="h-10 rounded-lg bg-cyan-600 hover:bg-cyan-500 font-semibold text-sm disabled:opacity-50"
            >
              Dodaj
            </button>
          </form>
        </div>

        {/* Karty nawyków – kompaktowa siatka auto-fit (żeby się mieściło) */}
        {loading ? (
          <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-[160px] rounded-xl border border-white/10 bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : habits.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-white/5 grid place-items-center mx-auto mb-3 border border-white/10">
              <Target className="w-7 h-7 text-white/50" />
            </div>
            <h3 className="text-white/80 font-semibold">Brak nawyków</h3>
            <p className="text-white/50 text-sm">Dodaj pierwszy, aby zacząć śledzić.</p>
          </div>
        ) : (
          <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]">
            {habits.map((h) => {
              const weekMap = totalsWeek[h.id] || {};
              const totalThisWeek = Object.values(weekMap).reduce((a, b) => a + (b || 0), 0);
              const unitLabels = { count: "szt.", times: "razy", minutes: "min", cups: "szkl.", pages: "str." };
              const unitLabel = unitLabels[h.unit] || h.unit;

              return (
                <div
                  key={h.id}
                  className="rounded-xl border border-white/10 bg-white/[0.04] p-3 flex flex-col gap-3 hover:bg-white/[0.06] transition"
                >
                  {/* Header karty */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-semibold truncate">{h.name}</div>
                      <div className="text-[11px] text-white/60 flex items-center gap-2">
                        <span className="flex items-center gap-1">
                          <Target className="w-3 h-3" /> {h.target} {unitLabel}
                        </span>
                        <span className="flex items-center gap-1">
                          <Flame className="w-3 h-3" /> Streak:{" "}
                          <span className="text-emerald-300 font-semibold">{streakByHabit[h.id] || 0}</span>
                        </span>
                      </div>
                    </div>
                    {/* Brak +1 – odhaczamy tylko w sidebarze */}
                    <button
                      onClick={() => setSidebarOpen(true)}
                      className="h-8 px-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs"
                      title="Otwórz odhaczanie (dzisiaj)"
                    >
                      Odhacz
                    </button>
                  </div>

                  {/* Siatka dni – PODGLĄD, bez klików */}
                  <div className="grid grid-cols-7 gap-1.5">
                    {daysOfWeek.map((d) => {
                      const dISO = toISO(d);
                      const isCompleted = (weekMap[dISO] || 0) > 0;
                      const todayMark = isToday(d);
                      return (
                        <DayBadge key={dISO} date={d} isCompleted={isCompleted} isToday={todayMark} />
                      );
                    })}
                  </div>

                  {/* Progres tygodniowy */}
                  <div>
                    <div className="flex justify-between text-[11px] text-white/70 mb-1">
                      <span>Postęp tygodniowy</span>
                      <span className="text-emerald-300 font-semibold">
                        {Math.min(100, Math.round((totalThisWeek / h.target) * 100))}%
                      </span>
                    </div>
                    <ProgressBar value={totalThisWeek} max={h.target} />
                    <div className="text-[11px] text-white/50 mt-1">
                      {totalThisWeek} / {h.target} {unitLabel}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sidebar – jedyne miejsce na odhaczanie (tylko dzisiaj) */}
      <HabitSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        todayISO={todayISO}
        habits={habits}
        todayCounts={todayCounts}
        onIncrement={async (habitId, delta) => {
          // aktualizacja tylko dla dzisiejszej daty
          const currentValue = weekEntries
            .filter((e) => e.habit_id === habitId && e.date === todayISO)
            .reduce((sum, entry) => sum + (entry.value || 0), 0);
          const newValue = Math.max(0, currentValue + delta);

          const patchList = (list) => {
            const filtered = list.filter((e) => !(e.habit_id === habitId && e.date === todayISO));
            return newValue > 0
              ? [...filtered, { habit_id: habitId, date: todayISO, value: newValue }]
              : filtered;
          };

          const prevWeek = weekEntries;
          const prevAll = allEntries;
          setWeekEntries(patchList(prevWeek));
          setAllEntries(patchList(prevAll));

          try {
            await fetch(`${API_BASE}/api/habits/${habitId}/entries`, {
              method: "POST",
              headers: authHeaders(true),
              body: JSON.stringify({ date: todayISO, value: newValue }),
            });
            await load();
          } catch {
            setWeekEntries(prevWeek);
            setAllEntries(prevAll);
            setErr("Błąd zapisu");
          }
        }}
      />
    </div>
  );
}
