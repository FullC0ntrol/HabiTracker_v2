// client/src/Plan.jsx
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  ClipboardList, Plus, Trash2, X, ChevronDown, ChevronUp,
  CheckCircle, Loader2, Dumbbell, Zap, ArrowLeft
} from "lucide-react";
import { API_BASE } from "./../../lib/api";
import { authHeaders } from "./../../lib/authHeaders";

/* ----------------------------------------------
   POMOCNICZE
---------------------------------------------- */
function FieldLabel({ children, hint }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold text-white/90">{children}</span>
      {hint && <span className="text-[11px] text-white/50">{hint}</span>}
    </div>
  );
}

function Toggle({ checked, onChange, label, description }) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.04] p-3 hover:bg-white/[0.06] transition">
      <div className="flex-1">
        <div className="text-sm font-semibold text-white/90">{label}</div>
        {description && <div className="text-[12px] text-white/60">{description}</div>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-cyan-500/90" : "bg-white/15"}`}
        aria-pressed={checked}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition ${checked ? "translate-x-5" : "translate-x-0"}`}
        />
      </button>
      <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}

/* ----------------------------------------------
   Heurystyka: odczyt liczby dni z nazwy (fallback)
---------------------------------------------- */
function inferDaysFromName(name) {
  if (!name) return 1;
  const xMatch = name.match(/×\s*(\d+)/i);
  if (xMatch) return Math.max(1, Number(xMatch[1]));
  const dnMatch = name.match(/(\d+)\s*-\s*dniowy/i);
  if (dnMatch) return Math.max(1, Number(dnMatch[1]));
  return 1;
}
function chunkByDays(items, days) {
  if (!Array.isArray(items) || items.length === 0 || days <= 1) return [items || []];
  const out = Array.from({ length: days }, () => []);
  items.forEach((it, idx) => { out[idx % days].push(it); });
  return out;
}

/* ----------------------------------------------
   PlanItem – lista planów z podglądem per "dzień"
---------------------------------------------- */
function PlanItem({ plan, onDelete, activePlanId, onSetActive }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const url = `${API_BASE}/api/plans/${plan.id}`;
      const res = await fetch(url, { headers: authHeaders(false) });
      const text = await res.text(); // logujemy odpowiedź w razie nie-JSON
      console.log("[PlanItem.loadItems] GET", url, "status=", res.status, "raw=", text);
      if (!res.ok) throw new Error("Nie udało się pobrać szczegółów planu.");
      const json = JSON.parse(text || "[]");
      setItems(json);
      console.log("[PlanItem.loadItems] parsed items =", json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [plan.id]);

  useEffect(() => { if (open && items.length === 0) loadItems(); }, [open, items.length, loadItems]);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm(`Usunąć plan: ${plan.name}?`)) return;
    try {
      const res = await fetch(`${API_BASE}/api/plans/${plan.id}`, {
        method: "DELETE",
        headers: authHeaders(false),
      });
      if (!res.ok) throw new Error("Nie udało się usunąć planu.");
      onDelete?.();
    } catch (e) {
      console.error(e);
      alert("Nie udało się usunąć planu.");
    }
  };

  // grupowanie: jeśli backend zwraca 'day', używamy go; w przeciwnym razie fallback
  const grouped = useMemo(() => {
    if (items.some(it => typeof it.day !== "undefined")) {
      const byDay = new Map();
      for (const it of items) {
        const d = Number(it.day || 1);
        if (!byDay.has(d)) byDay.set(d, []);
        byDay.get(d).push(it);
      }
      // posortuj w obrębie dnia po order_index
      const daysSorted = Array.from(byDay.keys()).sort((a,b) => a - b);
      return daysSorted.map(d => (byDay.get(d) || []).sort((a,b) => (a.order_index ?? 0) - (b.order_index ?? 0)));
    }
    // fallback: heurystyka po nazwie
    const daysFromName = inferDaysFromName(plan.name);
    const sorted = [...items].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
    return chunkByDays(sorted, daysFromName);
  }, [items, plan.name]);

  return (
    <li className="rounded-2xl border border-white/10 hover:border-cyan-400/40 transition-all p-4 bg-white/[0.04]">
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => setOpen(o => !o)}
          className="flex-1 flex items-center gap-3 text-left font-semibold text-lg"
        >
          {open ? <ChevronUp className="w-5 h-5 text-cyan-400" /> : <ChevronDown className="w-5 h-5 text-cyan-400" />}
          <span className="truncate">{plan.name}</span>
          {activePlanId === plan.id && (
            <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full border border-emerald-400/40 text-emerald-300 bg-emerald-500/10">
              Aktywny
            </span>
          )}
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onSetActive?.(plan.id); }}
            className={`px-2 py-1 rounded-md border text-xs ${
              activePlanId === plan.id
                ? "border-emerald-400/40 text-emerald-300 bg-emerald-500/10"
                : "border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/10"
            }`}
            title="Ustaw jako aktywny"
          >
            {activePlanId === plan.id ? "Aktywny" : "Ustaw jako aktywny"}
          </button>

          <button
            onClick={handleDelete}
            className="p-2 rounded-md text-rose-400 hover:bg-rose-500/15"
            title="Usuń plan"
          >
            <Trash2 className="w-5 h-5"/>
          </button>
        </div>
      </div>

      {open && (
        <div className="mt-3 pt-3 border-t border-white/10">
          {loading ? (
            <p className="text-gray-300 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Ładowanie…
            </p>
          ) : items.length === 0 ? (
            <p className="text-gray-400">Brak ćwiczeń w tym planie.</p>
          ) : (
            <div className="space-y-3">
              {grouped.map((dayItems, di) => (
                <div key={`day-${di}`} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="text-sm font-semibold text-white/80 mb-2">
                    Dzień {di + 1}
                  </div>
                  <ul className="space-y-2">
                    {dayItems.map((it, i) => (
                      <li
                        key={`${it.id}-${it.order_index ?? i}`}
                        className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2"
                      >
                        <span className="font-medium min-w-0">
                          <span className="truncate">{i + 1}. {it.name}</span>{" "}
                          <span className="text-xs text-gray-400">({it.muscle_group})</span>
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-200 border border-amber-400/30">
                          {it.sets} × {it.reps}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </li>
  );
}

/* ----------------------------------------------
   Główny komponent – kreator FBW / SPLIT
---------------------------------------------- */
export default function Plan() {
  const [exercises, setExercises] = useState([]);
  const [plans, setPlans] = useState([]);

  const [step, setStep] = useState("chooseType"); // chooseType -> config -> build
  const [planType, setPlanType] = useState(null);  // 'FBW' | 'SPLIT'
  const [daysCount, setDaysCount] = useState(3);
  const [repeatFBW, setRepeatFBW] = useState(true); // FBW: te same ćwiczenia/dzień
  const [splitLabels, setSplitLabels] = useState(["Poniedziałek","Wtorek","Środa"]);

  // per-dzień: [{exercise_id, sets, reps, name, category}]
  const [daysSelection, setDaysSelection] = useState([[], [], []]);

  const [name, setName] = useState("");
  const nameRef = useRef(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // aktywny plan
  const [activePlanId, setActivePlanId] = useState(() => {
    const v = localStorage.getItem("activePlanId");
    return v ? Number(v) : null;
  });
  const setActive = useCallback((id) => {
    setActivePlanId(id);
    localStorage.setItem("activePlanId", String(id));
  }, []);

  // budowa: „dzień po dniu”
  const [dayIdx, setDayIdx] = useState(0);
  const canPrev = dayIdx > 0;
  const canNext = dayIdx < daysCount - 1;

  const defaultName = useMemo(() => {
    if (planType === "FBW") return `FBW ×${daysCount}`;
    if (planType === "SPLIT") return `SPLIT ${daysCount}-dniowy`;
    return `Nowy plan`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planType, daysCount]);

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const [exRes, plRes] = await Promise.all([
        fetch(`${API_BASE}/api/exercises`, { headers: authHeaders(false) }),
        fetch(`${API_BASE}/api/plans`, { headers: authHeaders(false) }),
      ]);
      if (!exRes.ok || !plRes.ok) throw new Error("Load failed");
      setExercises(await exRes.json());
      setPlans(await plRes.json());
    } catch (e) {
      setErr("Nie udało się pobrać danych. Sprawdź API i autoryzację.");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  // po zmianie liczby dni
  useEffect(() => {
    setDaysSelection(prev => Array.from({ length: daysCount }, (_, i) => prev[i] || []));
    setSplitLabels(prev => {
      const base = ["Poniedziałek","Wtorek","Środa","Czwartek","Piątek","Sobota","Niedziela"];
      return Array.from({ length: daysCount }, (_, i) => prev[i] || base[i] || `Dzień ${i+1}`);
    });
    setDayIdx(0);
  }, [daysCount]);

  // fokus na polu nazwy (nie gubimy)
  useEffect(() => {
    const el = nameRef.current;
    if (!el || document.activeElement === el) return;
    el.focus({ preventScroll: true });
    const len = el.value.length;
    try { el.setSelectionRange(len, len); } catch {}
  }, [name]);

  /* ---------- Widok 1 ---------- */
  const ChooseType = () => (
    <div className="space-y-6">
      <h2 className="text-3xl font-black text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-cyan-600">
        <div className="inline-flex items-center gap-2">
          <ClipboardList className="w-7 h-7" /> Kreator planu
        </div>
      </h2>
      <p className="text-center text-white/70">Wybierz styl planu, aby rozpocząć.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => { setPlanType("FBW"); setStep("config"); }}
          className="rounded-3xl border border-white/10 hover:border-amber-400/40 bg-white/[0.05] p-6 text-left transition-all hover:shadow-lg hover:-translate-y-0.5"
        >
          <div className="flex items-center gap-3">
            <Dumbbell className="w-8 h-8 text-amber-400" />
            <div>
              <div className="font-extrabold text-amber-300 text-xl">FBW (Całe ciało)</div>
              <div className="text-sm text-white/70">Te same lub różne zestawy – do wyboru w kolejnym kroku.</div>
            </div>
          </div>
        </button>

        <button
          onClick={() => { setPlanType("SPLIT"); setStep("config"); }}
          className="rounded-3xl border border-white/10 hover:border-emerald-400/40 bg-white/[0.05] p-6 text-left transition-all hover:shadow-lg hover:-translate-y-0.5"
        >
          <div className="flex items-center gap-3">
            <Zap className="w-8 h-8 text-emerald-400" />
            <div>
              <div className="font-extrabold text-emerald-300 text-xl">SPLIT</div>
              <div className="text-sm text-white/70">Osobne dni (np. Push / Pull / Nogi).</div>
            </div>
          </div>
        </button>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <h3 className="text-xl font-bold mb-3">Twoje plany</h3>
        {plans.length === 0 ? (
          <p className="text-white/70">Nie masz jeszcze żadnych planów.</p>
        ) : (
          <ul className="space-y-2">
            {plans.map(p => (
              <PlanItem
                key={p.id}
                plan={p}
                onDelete={load}
                activePlanId={activePlanId}
                onSetActive={setActive}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  /* ---------- Widok 2: Konfiguracja ---------- */
  const ConfigDays = () => (
    <div className="space-y-6">
      <button onClick={() => setStep("chooseType")} className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300">
        <ArrowLeft className="w-4 h-4" /> Wróć
      </button>

      <h2 className="text-2xl font-black">
        {planType === "FBW" ? "Konfiguracja FBW" : "Konfiguracja SPLIT"}
      </h2>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <FieldLabel hint="Ile treningów chcesz w tygodniu?">Liczba dni</FieldLabel>
            <div className="relative">
              <select
                value={daysCount}
                onChange={(e) => setDaysCount(Number(e.target.value))}
                className="w-full appearance-none bg-white/10 border border-white/15 rounded-xl px-4 py-2 pr-10 text-white/90 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                {[2,3,4,5,6].map(n => <option key={n} value={n} className="bg-gray-900">{n}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
            </div>
          </div>

          {planType === "FBW" && (
            <div className="flex flex-col gap-2">
              <FieldLabel>Tryb FBW</FieldLabel>
              <Toggle
                checked={repeatFBW}
                onChange={(v) => { setRepeatFBW(v); setDayIdx(0); }}
                label={repeatFBW ? "Te same ćwiczenia każdego dnia" : "Różne ćwiczenia w różne dni"}
                description={repeatFBW
                  ? "Edytujesz jeden wspólny zestaw – używany we wszystkie dni."
                  : "Każdy dzień układasz osobno (nawigacja „Poprzedni/Następny”)."}
              />
            </div>
          )}
        </div>

        {planType === "SPLIT" && (
          <div className="space-y-3">
            <FieldLabel hint="np. Push / Pull / Nogi …">Etykiety dni</FieldLabel>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {Array.from({ length: daysCount }).map((_, i) => (
                <input
                  key={i}
                  value={splitLabels[i] || ""}
                  onChange={(e) => setSplitLabels(l => l.map((v, idx) => idx === i ? e.target.value : v))}
                  className="bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-white/90 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder={`Dzień ${i+1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => setStep("build")}
          className="rounded-xl bg-cyan-600 hover:bg-cyan-500 px-5 py-2 font-semibold"
        >
          Dalej: dodaj ćwiczenia
        </button>
      </div>
    </div>
  );

  // Helpers dla selekcji
  const isSelected = (day, exId) => daysSelection[day].some(it => it.exercise_id === exId);
  const toggleExercise = (day, ex) => {
    setDaysSelection(prev => {
      const copy = prev.map(arr => [...arr]);
      const exists = copy[day].find(it => it.exercise_id === ex.id);
      if (exists) {
        copy[day] = copy[day].filter(it => it.exercise_id !== ex.id);
      } else {
        copy[day].push({ exercise_id: ex.id, sets: 3, reps: "8-12", name: ex.name, category: ex.category });
      }
      if (planType === "FBW" && repeatFBW) {
        for (let i = 0; i < copy.length; i++) {
          if (i === day) continue;
          const has = copy[i].some(it => it.exercise_id === ex.id);
          if (exists && has) {
            copy[i] = copy[i].filter(it => it.exercise_id !== ex.id);
          } else if (!exists && !has) {
            copy[i].push({ exercise_id: ex.id, sets: 3, reps: "8-12", name: ex.name, category: ex.category });
          }
        }
      }
      return copy;
    });
  };
  const changeField = (day, exId, field, value) => {
    setDaysSelection(prev => prev.map((arr, i) =>
      i !== day ? arr : arr.map(it => it.exercise_id === exId ? { ...it, [field]: value } : it)
    ));
  };
  const removeSelected = (day, exId) => {
    setDaysSelection(prev => prev.map((arr, i) =>
      i !== day ? arr : arr.filter(it => it.exercise_id !== exId)
    ));
  };

  /* ---------- Widok 3: Budowa planu (dzień po dniu) ---------- */
  const BuildPlan = () => {
    const unifiedFBW = planType === "FBW" && repeatFBW;
    const currentDay = unifiedFBW ? 0 : dayIdx;
    const label = unifiedFBW
      ? "Zestaw FBW (wspólny)"
      : (splitLabels[currentDay] || `Dzień ${currentDay + 1}`);

    return (
      <div className="space-y-6">
        <button onClick={() => setStep("config")} className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300">
          <ArrowLeft className="w-4 h-4" /> Wróć
        </button>

        <h2 className="text-2xl font-black">Budowa planu</h2>

        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-4 space-y-4">
          {/* Nazwa + zapisz */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-end">
            <div className="flex-1">
              <label htmlFor="plan-name" className="text-sm text-white/80 mb-1 block">Nazwa planu</label>
              <input
                id="plan-name"
                ref={nameRef}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={defaultName}
                autoComplete="off"
                className="w-full bg-white/10 border border-white/15 rounded-xl px-4 py-2 text-white/90 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <button
              onClick={savePlan}
              disabled={saving || !canSave}
              className="w-full md:w-auto rounded-xl bg-cyan-600 hover:bg-cyan-500 px-5 py-2 font-semibold disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {saving ? "Zapisywanie…" : "Utwórz plan"}
            </button>
          </div>

          {/* Pager dni (gdy nie unified) */}
          {!unifiedFBW && (
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-2">
              <button
                onClick={() => setDayIdx(i => Math.max(0, i - 1))}
                disabled={!canPrev}
                className="px-3 py-1.5 rounded-lg border border-white/10 disabled:opacity-50 hover:bg-white/10"
              >
                Poprzedni
              </button>
              <div className="text-sm font-semibold">{label}</div>
              <button
                onClick={() => setDayIdx(i => Math.min(daysCount - 1, i + 1))}
                disabled={!canNext}
                className="px-3 py-1.5 rounded-lg border border-white/10 disabled:opacity-50 hover:bg-white/10"
              >
                Następny
              </button>
            </div>
          )}

          {/* Sekcja środkowa ma własny scroll gdy treści dużo */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 max-h-[60vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold">{label}</h4>
              <span className="text-xs text-white/60">{daysSelection[currentDay].length} wybrane</span>
            </div>

            {daysSelection[currentDay].length === 0 ? (
              <p className="text-white/70 text-sm mb-3">Brak wybranych ćwiczeń.</p>
            ) : (
              <ul className="space-y-2 mb-3">
                {daysSelection[currentDay].map(item => (
                  <li key={item.exercise_id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
                    <div className="min-w-0 pr-3">
                      <div className="font-medium truncate">{item.name}</div>
                      <div className="text-[11px] text-white/60 uppercase">{item.category}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        value={item.sets}
                        onChange={(e) => changeField(currentDay, item.exercise_id, "sets", Number(e.target.value))}
                        className="w-16 bg-white/10 border border-white/15 rounded-md px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        title="Serie"
                      />
                      <span className="text-white/50">×</span>
                      <input
                        value={item.reps}
                        onChange={(e) => changeField(currentDay, item.exercise_id, "reps", e.target.value)}
                        className="w-24 bg-white/10 border border-white/15 rounded-md px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        title="Powtórzenia"
                      />
                      <button
                        onClick={() => removeSelected(currentDay, item.exercise_id)}
                        className="p-1 rounded-md text-rose-400 hover:bg-rose-500/15"
                        title="Usuń"
                      >
                        <X className="w-4 h-4"/>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {/* Biblioteka ćwiczeń */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {exercises.map(ex => {
                const active = isSelected(currentDay, ex.id);
                return (
                  <button
                    key={`${currentDay}-${ex.id}`}
                    onClick={() => toggleExercise(currentDay, ex)}
                    className={`rounded-xl px-3 py-2 text-left transition-all border
                      ${active ? "border-cyan-400 bg-cyan-500/10 ring-1 ring-cyan-400/40" : "border-white/10 bg-white/[0.04] hover:bg-white/[0.07]"}`}
                  >
                    <div className="font-semibold flex items-center justify-between gap-2">
                      <span className="truncate">{ex.name}</span>
                      {active && <CheckCircle className="w-4 h-4 text-cyan-400" />}
                    </div>
                    <div className="text-[11px] text-white/60 uppercase">{ex.category}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ---------- Zapis ---------- */
  const flattenItems = () => {
    if (planType === "FBW" && repeatFBW) {
      const base = daysSelection[0] || [];
      const out = [];
      for (let d = 0; d < daysCount; d++) {
        base.forEach((it, i) => {
          out.push({
            exercise_id: it.exercise_id,
            sets: Number(it.sets),
            reps: it.reps,
            day: d + 1,
            order_index: i
          });
        });
      }
      return out;
    }
    const all = [];
    daysSelection.forEach((arr, dayIdx) => {
      arr.forEach((it, i) => {
        all.push({
          exercise_id: it.exercise_id,
          sets: Number(it.sets),
          reps: it.reps,
          day: dayIdx + 1,
          order_index: i
        });
      });
    });
    return all;
  };

  const canSave = useMemo(() => {
    if (!planType) return false;
    if (daysSelection.every(arr => arr.length === 0)) return false;
    return true;
  }, [planType, daysSelection]);

  const savePlan = async () => {
    if (!canSave) return;
    setSaving(true);
    setErr("");
    const finalName = (name && name.trim()) || defaultName;

    try {
      const payload = {
        name: finalName,
        plan_type: planType,
        days: daysCount,
        split_labels: splitLabels,
        items: flattenItems(),
      };

      console.log("[Plan.save] POST /api/plans payload =", payload);

      const url = `${API_BASE}/api/plans`;
      const res = await fetch(url, {
        method: "POST",
        headers: authHeaders(true),
        body: JSON.stringify(payload),
      });

      const raw = await res.text();
      console.log("[Plan.save] status =", res.status, "raw response =", raw);

      if (!res.ok) throw new Error("Create failed");

      // Reset i odśwież listę
      setStep("chooseType");
      setPlanType(null);
      setName("");
      setDaysCount(3);
      setRepeatFBW(true);
      setDaysSelection([[], [], []]);
      await load();
    } catch (e) {
      console.error("[Plan.save] error", e);
      setErr("Nie udało się utworzyć planu. Sprawdź autoryzację/backend.");
    } finally {
      setSaving(false);
    }
  };

  /* ---------- Render root ---------- */
  return (
    <div className="text-white max-w-5xl mx-auto min-h-[60vh] p-4 sm:p-6 pb-24">
      {err && (
        <div className="mb-6 rounded-xl border border-rose-400/30 bg-rose-500/15 px-4 py-3">
          <span className="font-semibold">🚨 Błąd:</span> {err}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-16 text-cyan-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : step === "chooseType" ? (
        <ChooseType />
      ) : step === "config" ? (
        <ConfigDays />
      ) : (
        <BuildPlan />
      )}
    </div>
  );
}
