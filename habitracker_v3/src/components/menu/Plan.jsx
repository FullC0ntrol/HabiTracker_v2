// client/src/Plan.jsx
import { useEffect, useState, useCallback, useMemo } from "react";
import {
  ClipboardList, Plus, Trash2, X, ChevronDown, ChevronUp,
  CheckCircle, Loader2, Dumbbell, Zap, ArrowLeft
} from "lucide-react";
import { API_BASE } from "./../../lib/api";
import { authHeaders } from "./../../lib/authHeaders";

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
      if (!res.ok) throw new Error("Failed to load plan details.");
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
    if (!window.confirm(`Delete plan: ${plan.name}?`)) return;
    try {
      const res = await fetch(`${API_BASE}/api/plans/${plan.id}`, {
        method: "DELETE",
        headers: authHeaders(false),
      });
      if (!res.ok) throw new Error("Failed to delete plan.");
      onDelete?.();
    } catch (e) {
      console.error(e);
      alert("Failed to delete plan.");
    }
  };

  // tag typu, jeśli backend przechowuje plan_type (jeśli nie — pokaż N/A)
  const type = plan.plan_type || "N/A";
  const typeStyle =
    type === "FBW"
      ? "text-amber-300 bg-amber-500/10 border-amber-400/30"
      : type === "SPLIT"
      ? "text-emerald-300 bg-emerald-500/10 border-emerald-400/30"
      : "text-cyan-300 bg-cyan-500/10 border-cyan-400/30";

  return (
    <li className="rounded-2xl border border-white/10 hover:border-cyan-400/40 transition-all p-4 bg-white/[0.04]">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setOpen(o => !o)}
          className="flex-1 flex items-center gap-3 text-left font-semibold text-lg"
        >
          {open ? <ChevronUp className="w-5 h-5 text-cyan-400" /> : <ChevronDown className="w-5 h-5 text-cyan-400" />}
          <span className={`text-[11px] px-2 py-1 rounded-full border ${typeStyle}`}>{type}</span>
          <span>{plan.name}</span>
        </button>
        <button
          onClick={handleDelete}
          className="p-2 rounded-md text-rose-400 hover:bg-rose-500/15"
          title="Delete plan"
        >
          <Trash2 className="w-5 h-5"/>
        </button>
      </div>

      {open && (
        <div className="mt-3 pt-3 border-t border-white/10">
          {loading ? (
            <p className="text-gray-400 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading…
            </p>
          ) : items.length === 0 ? (
            <p className="text-gray-400">No items in this plan.</p>
          ) : (
            <ul className="space-y-2">
              {items.map((it, i) => (
                <li key={it.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                  <span className="font-medium">
                    {i + 1}. {it.name}{" "}
                    <span className="text-xs text-gray-400">({it.muscle_group})</span>
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-200 border border-amber-400/30">
                    {it.sets} x {it.reps}
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
    if (planType === "FBW") return `FBW x${daysCount}`;
    if (planType === "SPLIT") return `SPLIT ${daysCount}-day`;
    return `New Plan`;
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
      setErr("Failed to load data. Check API and auth.");
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
      const base = ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6"];
      return Array.from({ length: daysCount }, (_, i) => prev[i] || base[i]);
    });
  }, [daysCount]);

  /* ---------- Widok 1: Wybór typu ---------- */
  const ChooseType = () => (
    <div className="space-y-6">
      <h2 className="text-3xl font-black text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-cyan-600">
        <div className="inline-flex items-center gap-2">
          <ClipboardList className="w-7 h-7" /> Plan Builder
        </div>
      </h2>
      <p className="text-center text-gray-400">Pick a plan style to start.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => { setPlanType("FBW"); setStep("config"); }}
          className="rounded-3xl border border-white/10 hover:border-amber-400/40 bg-white/[0.04] p-6 text-left transition-all hover:shadow-lg"
        >
          <div className="flex items-center gap-3">
            <Dumbbell className="w-8 h-8 text-amber-400" />
            <div className="font-extrabold text-amber-300 text-xl">FBW (Full Body)</div>
          </div>
          <p className="mt-2 text-gray-400 text-sm">Train the whole body each day. Choose if days should repeat.</p>
        </button>

        <button
          onClick={() => { setPlanType("SPLIT"); setStep("config"); }}
          className="rounded-3xl border border-white/10 hover:border-emerald-400/40 bg-white/[0.04] p-6 text-left transition-all hover:shadow-lg"
        >
          <div className="flex items-center gap-3">
            <Zap className="w-8 h-8 text-emerald-400" />
            <div className="font-extrabold text-emerald-300 text-xl">SPLIT</div>
          </div>
          <p className="mt-2 text-gray-400 text-sm">Assign body parts to specific days (e.g., Push / Pull / Legs).</p>
        </button>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <h3 className="text-xl font-bold mb-3">Your Plans</h3>
        {plans.length === 0 ? (
          <p className="text-gray-400">No plans yet.</p>
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
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <h2 className="text-2xl font-black">
        {planType === "FBW" ? "FBW configuration" : "SPLIT configuration"}
      </h2>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <label className="text-sm text-gray-300">Days per week</label>
          <select
            value={daysCount}
            onChange={(e) => setDaysCount(Number(e.target.value))}
            className="bg-white/10 border border-white/15 rounded-lg px-3 py-2"
          >
            {[2,3,4,5,6].map(n => <option key={n} value={n} className="bg-gray-900">{n}</option>)}
          </select>

          {planType === "FBW" && (
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={repeatFBW}
                onChange={(e) => setRepeatFBW(e.target.checked)}
              />
              Same exercises every day
            </label>
          )}
        </div>

        {planType === "SPLIT" && (
          <div className="space-y-3">
            <p className="text-sm text-gray-400">Label each day (e.g., Push / Pull / Legs…)</p>
            <div className="grid sm:grid-cols-2 gap-2">
              {Array.from({ length: daysCount }).map((_, i) => (
                <input
                  key={i}
                  value={splitLabels[i] || ""}
                  onChange={(e) => setSplitLabels(l => l.map((v, idx) => idx === i ? e.target.value : v))}
                  className="bg-white/10 border border-white/15 rounded-lg px-3 py-2"
                  placeholder={`Day ${i+1} label`}
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
          Next: add exercises
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
          ? `Day ${idx + 1}`
          : splitLabels[idx] || `Day ${idx + 1}`;

      return (
        <div key={idx} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold">{label}</h4>
            <span className="text-xs text-gray-400">{daysSelection[idx].length} selected</span>
          </div>

          {daysSelection[idx].length === 0 ? (
            <p className="text-gray-400 text-sm mb-3">No exercises selected yet.</p>
          ) : (
            <ul className="space-y-2 mb-3">
              {daysSelection[idx].map(item => (
                <li key={item.exercise_id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
                  <div className="min-w-0 pr-3">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-[11px] text-gray-400 uppercase">{item.category}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      value={item.sets}
                      onChange={(e) => changeField(idx, item.exercise_id, "sets", Number(e.target.value))}
                      className="w-16 bg-white/10 border border-white/15 rounded-md px-2 py-1 text-center"
                      title="Sets"
                    />
                    <span className="text-gray-500">x</span>
                    <input
                      value={item.reps}
                      onChange={(e) => changeField(idx, item.exercise_id, "reps", e.target.value)}
                      className="w-20 bg-white/10 border border-white/15 rounded-md px-2 py-1"
                      title="Reps"
                    />
                    <button
                      onClick={() => removeSelected(idx, item.exercise_id)}
                      className="p-1 rounded-md text-rose-400 hover:bg-rose-500/15"
                      title="Remove"
                    >
                      <X className="w-4 h-4"/>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Biblioteka ćwiczeń dla danego dnia */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {exercises.map(ex => {
              const active = isSelected(idx, ex.id);
              return (
                <button
                  key={`${idx}-${ex.id}`}
                  onClick={() => toggleExercise(idx, ex)}
                  className={`rounded-xl px-3 py-2 text-left transition-all border
                    ${active ? "border-cyan-400 bg-cyan-500/10" : "border-white/10 bg-white/[0.04] hover:bg-white/[0.07]"}
                  `}
                >
                  <div className="font-semibold flex items-center justify-between">
                    <span className="truncate">{ex.name}</span>
                    {active && <CheckCircle className="w-4 h-4 text-cyan-400" />}
                  </div>
                  <div className="text-[11px] text-gray-400 uppercase">{ex.category}</div>
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
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <h2 className="text-2xl font-black">Build your plan</h2>

        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-4 space-y-4">
          {/* Nazwa planu + zapisz */}
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1">
              <label className="text-sm text-gray-300 mb-1 block">Plan name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={defaultName}
                className="w-full bg-white/10 border border-white/15 rounded-xl px-4 py-2"
              />
            </div>
            <button
              onClick={savePlan}
              disabled={saving || !canSave}
              className="w-full sm:w-auto rounded-xl bg-cyan-600 hover:bg-cyan-500 px-5 py-2 font-semibold disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {saving ? "Saving..." : "Create Plan"}
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
          day: dayIdx + 1, // 1-based dla czytelności (backend może zignorować)
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
        plan_type: planType,         // backend może zignorować
        days: daysCount,             // backend może zignorować
        split_labels: splitLabels,   // backend może zignorować
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
      setErr("Failed to create plan. Check auth/backend.");
    } finally {
      setSaving(false);
    }
  };

  /* ---------- Render root ---------- */
  return (
    <div className="p-4 sm:p-6 text-white max-w-5xl mx-auto">
      {/* pasek tytułu */}
      <div className="mb-6 text-center">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-cyan-600">
            Plan Builder
          </span>
        </h1>
        <p className="text-gray-400 text-sm mt-1">Minimal, fast, and DB-ready.</p>
      </div>

      {err && (
        <div className="mb-6 rounded-xl border border-rose-400/30 bg-rose-500/15 px-4 py-3">
          <span className="font-semibold">🚨 Error:</span> {err}
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
