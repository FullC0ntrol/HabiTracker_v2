import { useMemo, useRef, useState } from "react";
import { ArrowLeft, CheckCircle, Loader2, Plus, X } from "lucide-react";
import { plansService } from "../services/plans.service";

/**
 * Komponent do tworzenia nowego planu.
 * Zawiera logikę budowania dni, wyboru ćwiczeń i zapisu do API.
 */
export function PlanBuilder({
  planType,
  daysCount,
  repeatFBW,
  splitLabels,
  exercises,
  setStep,
  reloadPlans,
}) {
  const [daysSelection, setDaysSelection] = useState(
    Array.from({ length: daysCount }, () => [])
  );
  const [dayIdx, setDayIdx] = useState(0);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const nameRef = useRef(null);

  const canPrev = dayIdx > 0;
  const canNext = dayIdx < daysCount - 1;

  const unifiedFBW = planType === "FBW" && repeatFBW;
  const currentDay = unifiedFBW ? 0 : dayIdx;

  const defaultName = useMemo(() => {
    if (planType === "FBW") return `FBW ×${daysCount}`;
    if (planType === "SPLIT") return `SPLIT ${daysCount}-dniowy`;
    return `Nowy plan`;
  }, [planType, daysCount]);

  const label = unifiedFBW
    ? "Zestaw FBW (wspólny)"
    : splitLabels[currentDay] || `Dzień ${currentDay + 1}`;

  // --- Pomocnicze metody edycji ćwiczeń w planie ---
  const isSelected = (day, exId) =>
    daysSelection[day].some((it) => it.exercise_id === exId);

  const toggleExercise = (day, ex) => {
    setDaysSelection((prev) => {
      const copy = prev.map((arr) => [...arr]);
      const exists = copy[day].find((it) => it.exercise_id === ex.id);

      if (exists) {
        copy[day] = copy[day].filter((it) => it.exercise_id !== ex.id);
      } else {
        copy[day].push({
          exercise_id: ex.id,
          sets: 3,
          reps: "8-12",
          name: ex.name,
          category: ex.category,
        });
      }

      // Synchronizacja FBW: ten sam zestaw we wszystkie dni
      if (planType === "FBW" && repeatFBW) {
        for (let i = 0; i < copy.length; i++) {
          if (i === day) continue;
          const has = copy[i].some((it) => it.exercise_id === ex.id);
          if (exists && has) {
            copy[i] = copy[i].filter((it) => it.exercise_id !== ex.id);
          } else if (!exists && !has) {
            copy[i].push({
              exercise_id: ex.id,
              sets: 3,
              reps: "8-12",
              name: ex.name,
              category: ex.category,
            });
          }
        }
      }
      return copy;
    });
  };

  const changeField = (day, exId, field, value) => {
    setDaysSelection((prev) =>
      prev.map((arr, i) =>
        i !== day
          ? arr
          : arr.map((it) =>
              it.exercise_id === exId ? { ...it, [field]: value } : it
            )
      )
    );
  };

  const removeSelected = (day, exId) => {
    setDaysSelection((prev) =>
      prev.map((arr, i) =>
        i !== day ? arr : arr.filter((it) => it.exercise_id !== exId)
      )
    );
  };

  // --- Zapis planu ---
  const flattenItems = () => {
    if (unifiedFBW) {
      const base = daysSelection[0] || [];
      const out = [];
      for (let d = 0; d < daysCount; d++) {
        base.forEach((it, i) => {
          out.push({
            exercise_id: it.exercise_id,
            sets: Number(it.sets),
            reps: it.reps,
            day: d + 1,
            order_index: i,
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
          order_index: i,
        });
      });
    });
    return all;
  };

  const canSave = useMemo(() => {
    if (!planType) return false;
    if (daysSelection.every((arr) => arr.length === 0)) return false;
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

      await plansService.create(payload);
      await reloadPlans(); // odśwież listę
      setStep("chooseType"); // wróć do listy
    } catch (e) {
      console.error("savePlan error:", e);
      setErr("Nie udało się utworzyć planu. Sprawdź API i autoryzację.");
    } finally {
      setSaving(false);
    }
  };

  // --- Widok ---
  return (
    <div className="space-y-6">
      <button
        onClick={() => setStep("config")}
        className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300"
      >
        <ArrowLeft className="w-4 h-4" /> Wróć
      </button>

      <h2 className="text-2xl font-black">Budowa planu</h2>

      {err && (
        <div className="rounded-xl border border-rose-400/30 bg-rose-500/15 px-4 py-3 text-sm">
          🚨 {err}
        </div>
      )}

      {/* Nazwa planu i przycisk zapisu */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-end">
          <div className="flex-1">
            <label htmlFor="plan-name" className="text-sm text-white/80 mb-1 block">
              Nazwa planu
            </label>
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

        {/* Nawigacja po dniach */}
        {!unifiedFBW && (
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-2">
            <button
              onClick={() => setDayIdx((i) => Math.max(0, i - 1))}
              disabled={!canPrev}
              className="px-3 py-1.5 rounded-lg border border-white/10 disabled:opacity-50 hover:bg-white/10"
            >
              Poprzedni
            </button>
            <div className="text-sm font-semibold">{label}</div>
            <button
              onClick={() => setDayIdx((i) => Math.min(daysCount - 1, i + 1))}
              disabled={!canNext}
              className="px-3 py-1.5 rounded-lg border border-white/10 disabled:opacity-50 hover:bg-white/10"
            >
              Następny
            </button>
          </div>
        )}

        {/* Lista ćwiczeń w danym dniu */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 max-h-[60vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold">{label}</h4>
            <span className="text-xs text-white/60">
              {daysSelection[currentDay].length} wybrane
            </span>
          </div>

          {daysSelection[currentDay].length === 0 ? (
            <p className="text-white/70 text-sm mb-3">Brak wybranych ćwiczeń.</p>
          ) : (
            <ul className="space-y-2 mb-3">
              {daysSelection[currentDay].map((item) => (
                <li
                  key={item.exercise_id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2"
                >
                  <div className="min-w-0 pr-3">
                    <div className="font-medium truncate">{item.name}</div>
                    <div className="text-[11px] text-white/60 uppercase">
                      {item.category}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      value={item.sets}
                      onChange={(e) =>
                        changeField(currentDay, item.exercise_id, "sets", Number(e.target.value))
                      }
                      className="w-16 bg-white/10 border border-white/15 rounded-md px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      title="Serie"
                    />
                    <span className="text-white/50">×</span>
                    <input
                      value={item.reps}
                      onChange={(e) =>
                        changeField(currentDay, item.exercise_id, "reps", e.target.value)
                      }
                      className="w-24 bg-white/10 border border-white/15 rounded-md px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      title="Powtórzenia"
                    />
                    <button
                      onClick={() => removeSelected(currentDay, item.exercise_id)}
                      className="p-1 rounded-md text-rose-400 hover:bg-rose-500/15"
                      title="Usuń"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Biblioteka ćwiczeń */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {exercises.map((ex) => {
              const active = isSelected(currentDay, ex.id);
              return (
                <button
                  key={`${currentDay}-${ex.id}`}
                  onClick={() => toggleExercise(currentDay, ex)}
                  className={`rounded-xl px-3 py-2 text-left transition-all border ${
                    active
                      ? "border-cyan-400 bg-cyan-500/10 ring-1 ring-cyan-400/40"
                      : "border-white/10 bg-white/[0.04] hover:bg-white/[0.07]"
                  }`}
                >
                  <div className="font-semibold flex items-center justify-between gap-2">
                    <span className="truncate">{ex.name}</span>
                    {active && <CheckCircle className="w-4 h-4 text-cyan-400" />}
                  </div>
                  <div className="text-[11px] text-white/60 uppercase">
                    {ex.category}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
