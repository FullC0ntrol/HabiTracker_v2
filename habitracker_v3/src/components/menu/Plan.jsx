// client/src/Plan.jsx
import { useEffect, useState, useCallback, useMemo } from "react";
import {
  ClipboardList, Plus, Trash2, X, ChevronDown, ChevronUp,
  CheckCircle, Loader2, Dumbbell, Zap, ArrowLeft
} from "lucide-react";
import { API_BASE } from "./../../lib/api";
import { authHeaders } from "./../../lib/authHeaders";

/* ----------------------------------------------
   POMOCNICZE: ładne etykiety i przełącznik
---------------------------------------------- */
function FieldLabel({ children, hint }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold text-white/90">{children}</span>
      {hint && <span className="text-[11px] text-white/50">{hint}</span>}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  description
}) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.04] p-3 hover:bg-white/[0.06] transition">
      <div className="flex-1">
        <div className="text-sm font-semibold text-white/90">{label}</div>
        {description && <div className="text-[12px] text-white/60">{description}</div>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition
          ${checked ? "bg-cyan-500/90" : "bg-white/15"}`}
        aria-pressed={checked}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition
            ${checked ? "translate-x-5" : "translate-x-0"}`}
        />
      </button>
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}

/* ----------------------------------------------
   PlanItem – kafelek istniejącego planu (lista)
---------------------------------------------- */
function PlanItem({ plan, onDelete }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/plans/${plan.id}`, { headers: authHeaders(false) });
      if (!res.ok) throw new Error("Nie udało się pobrać szczegółów planu.");
      setItems(await res.json());
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

  const type = plan.plan_type || "N/A";
  const typeStyle =
    type === "FBW"
      ? "text-amber-300 bg-amber-500/10 border-amber-400/30"
      : type === "SPLIT"
      ? "text-emerald-300 bg-emerald-500/10 border-emerald-400/30"
      : "text-cyan-300 bg-cyan-500/10 border-cyan-400/30";

  return (
    <li className="rounded-2xl border border-white/10 hover:border-cyan-400/40 transition-all p-4 bg-white/[0.04]">
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => setOpen(o => !o)}
          className="flex-1 flex items-center gap-3 text-left font-semibold text-lg"
        >
          {open ? <ChevronUp className="w-5 h-5 text-cyan-400" /> : <ChevronDown className="w-5 h-5 text-cyan-400" />}
          <span className={`text-[11px] px-2 py-1 rounded-full border ${typeStyle}`}>{type}</span>
          <span className="truncate">{plan.name}</span>
        </button>
        <button
          onClick={handleDelete}
          className="p-2 rounded-md text-rose-400 hover:bg-rose-500/15"
          title="Usuń plan"
        >
          <Trash2 className="w-5 h-5"/>
        </button>
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
            <ul className="space-y-2">
              {items.map((it, i) => (
                <li key={it.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
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
  const [planType, setPlanType] = useState(null); // 'FBW' | 'SPLIT'
  const [daysCount, setDaysCount] = useState(3);  // liczba dni dla FBW/SPLIT
  const [repeatFBW, setRepeatFBW] = useState(true); // FBW: te same ćwiczenia dla każdego dnia
  const [splitLabels, setSplitLabels] = useState(["Push", "Pull", "Legs"]); // SPLIT: etykiety dni

  // Wybrane ćwiczenia per dzień: tablica długości daysCount
  // Każdy element: [{exercise_id, sets, reps, name, category}]
  const [daysSelection, setDaysSelection] = useState([[], [], []]);

  const [name, setName] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  // Utility: inicjalizacja struktury dni po zmianie liczby dni
  useEffect(() => {
    setDaysSelection(prev => {
      const arr = Array.from({ length: daysCount }, (_, i) => prev[i] || []);
      return arr;
    });
    setSplitLabels(prev => {
      const base = ["Dzień 1", "Dzień 2", "Dzień 3", "Dzień 4", "Dzień 5", "Dzień 6"];
      return Array.from({ length: daysCount }, (_, i) => prev[i] || base[i]);
    });
  }, [daysCount]);

  /* ---------- Widok 1: Wybór typu ---------- */
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
              <div className="text-sm text-white/70">Każdego dnia całe ciało; możesz powtarzać te same ćwiczenia.</div>
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
              <div className="text-sm text-white/70">Przypisz partie ciała do konkretnych dni (np. Push / Pull / Nogi).</div>
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
            {plans.map(p => <PlanItem key={p.id} plan={p} onDelete={load} />)}
          </ul>
        )}
      </div>
    </div>
  );

  /* ---------- Widok 2: Konfiguracja dni ---------- */
  const ConfigDays = () => (
    <div className="space-y-6">
      <button onClick={() => setStep("chooseType")} className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300">
        <ArrowLeft className="w-4 h-4" /> Wróć
      </button>

      <h2 className="text-2xl font-black">
        {planType === "FBW" ? "Konfiguracja FBW" : "Konfiguracja SPLIT"}
      </h2>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-4">
        {/* BLOK: Liczba dni + Toggle powtarzania */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <FieldLabel hint="Ile treningów zaplanujesz w tygodniu?">Liczba dni w tygodniu</FieldLabel>
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
              <FieldLabel>Powtarzanie FBW</FieldLabel>
              <Toggle
                checked={repeatFBW}
                onChange={setRepeatFBW}
                label="Te same ćwiczenia każdego dnia"
                description="Gdy włączone — zaznaczenie/odznaczenie ćwiczenia dotyczy wszystkich dni."
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

  // Selection helpers
  const isSelected = (dayIdx, exId) => daysSelection[dayIdx].some(it => it.exercise_id === exId);
  const toggleExercise = (dayIdx, ex) => {
    setDaysSelection(prev => {
      const copy = prev.map(arr => [...arr]);
      const exists = copy[dayIdx].find(it => it.exercise_id === ex.id);
      if (exists) {
        copy[dayIdx] = copy[dayIdx].filter(it => it.exercise_id !== ex.id);
      } else {
        copy[dayIdx].push({ exercise_id: ex.id, sets: 3, reps: "8-12", name: ex.name, category: ex.category });
      }
      // FBW repeat: kopiuj do wszystkich dni
      if (planType === "FBW" && repeatFBW) {
        for (let i = 0; i < copy.length; i++) {
          if (i === dayIdx) continue;
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
  const changeField = (dayIdx, exId, field, value) => {
    setDaysSelection(prev => prev.map((arr, i) =>
      i !== dayIdx ? arr : arr.map(it => it.exercise_id === exId ? { ...it, [field]: value } : it)
    ));
  };
  const removeSelected = (dayIdx, exId) => {
    setDaysSelection(prev => prev.map((arr, i) =>
      i !== dayIdx ? arr : arr.filter(it => it.exercise_id !== exId)
    ));
  };

  /* ---------- Widok 3: Budowanie – wybór ćwiczeń per dzień ---------- */
  const BuildPlan = () => {
    const dayCards = Array.from({ length: daysCount }).map((_, idx) => {
      const label =
        planType === "FBW"
          ? `Dzień ${idx + 1}`
          : splitLabels[idx] || `Dzień ${idx + 1}`;

      return (
        <div key={idx} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold">{label}</h4>
            <span className="text-xs text-white/60">{daysSelection[idx].length} wybrane</span>
          </div>

          {daysSelection[idx].length === 0 ? (
            <p className="text-white/70 text-sm mb-3">Brak wybranych ćwiczeń.</p>
          ) : (
            <ul className="space-y-2 mb-3">
              {daysSelection[idx].map(item => (
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
                      onChange={(e) => changeField(idx, item.exercise_id, "sets", Number(e.target.value))}
                      className="w-16 bg-white/10 border border-white/15 rounded-md px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      title="Serie"
                    />
                    <span className="text-white/50">×</span>
                    <input
                      value={item.reps}
                      onChange={(e) => changeField(idx, item.exercise_id, "reps", e.target.value)}
                      className="w-24 bg-white/10 border border-white/15 rounded-md px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      title="Powtórzenia"
                    />
                    <button
                      onClick={() => removeSelected(idx, item.exercise_id)}
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

          {/* Biblioteka ćwiczeń dla danego dnia */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {exercises.map(ex => {
              const active = isSelected(idx, ex.id);
              return (
                <button
                  key={`${idx}-${ex.id}`}
                  onClick={() => toggleExercise(idx, ex)}
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
      );
    });

    return (
      <div className="space-y-6">
        <button onClick={() => setStep("config")} className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300">
          <ArrowLeft className="w-4 h-4" /> Wróć
        </button>

        <h2 className="text-2xl font-black">Budowa planu</h2>

        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-4 space-y-4">
          {/* Nazwa planu + zapisz */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-end">
            <div className="flex-1">
              <label className="text-sm text-white/80 mb-1 block">Nazwa planu</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={defaultName}
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

          {/* Karty dni */}
          <div className="space-y-4">
            {dayCards}
          </div>
        </div>
      </div>
    );
  };

  /* ---------- Zapis ---------- */
  const flattenItems = () => {
    // Zbije wszystko do [{exercise_id, sets, reps, day}]
    const all = [];
    daysSelection.forEach((arr, dayIdx) => {
      arr.forEach(it => {
        all.push({
          exercise_id: it.exercise_id,
          sets: Number(it.sets),
          reps: it.reps,
          day: dayIdx + 1, // 1-based
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
    const finalName = name.trim() || defaultName;

    try {
      const payload = {
        name: finalName,
        plan_type: planType,
        days: daysCount,
        split_labels: splitLabels,
        items: flattenItems().map(({ exercise_id, sets, reps /*, day*/ }) => ({
          exercise_id, sets, reps
          // jeżeli rozbudujesz backend: dołóż tu day
        })),
      };

      const res = await fetch(`${API_BASE}/api/plans`, {
        method: "POST",
        headers: authHeaders(true),
        body: JSON.stringify(payload),
      });
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
      setErr("Nie udało się utworzyć planu. Sprawdź autoryzację/backend.");
    } finally {
      setSaving(false);
    }
  };

  /* ---------- Render root ---------- */
  return (
    <div className="p-4 sm:p-6 text-white max-w-5xl mx-auto">
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
