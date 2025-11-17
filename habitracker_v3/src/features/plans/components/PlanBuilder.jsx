import { useMemo, useRef, useState } from "react";
import { ArrowLeft, CheckCircle, Loader2, Plus, X, Dumbbell, Minus, ChevronUp, ChevronDown } from "lucide-react";
import { plansService } from "../services/plans.service";

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

  // --- Helper methods ---
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

  // --- Enhanced controls for sets and reps ---
  const adjustSets = (day, exId, delta) => {
    setDaysSelection((prev) =>
      prev.map((arr, i) =>
        i !== day
          ? arr
          : arr.map((it) => {
              if (it.exercise_id === exId) {
                const newSets = Math.max(1, (it.sets || 3) + delta);
                return { ...it, sets: newSets };
              }
              return it;
            })
      )
    );
  };

  const adjustReps = (day, exId, delta) => {
    setDaysSelection((prev) =>
      prev.map((arr, i) =>
        i !== day
          ? arr
          : arr.map((it) => {
              if (it.exercise_id === exId) {
                const currentReps = it.reps || "8-12";
                const match = currentReps.match(/(\d+)-(\d+)/);
                if (match) {
                  const min = parseInt(match[1]) + delta;
                  const max = parseInt(match[2]) + delta;
                  if (min >= 1 && max >= min) {
                    return { ...it, reps: `${min}-${max}` };
                  }
                } else {
                  const num = parseInt(currentReps) || 10;
                  const newNum = Math.max(1, num + delta);
                  return { ...it, reps: newNum.toString() };
                }
              }
              return it;
            })
      )
    );
  };

  const handleRepsInput = (day, exId, value) => {
    // Allow only numbers and dashes
    const cleaned = value.replace(/[^\d-]/g, '');
    changeField(day, exId, "reps", cleaned);
  };

  // --- Save logic ---
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
      await reloadPlans();
      setStep("chooseType");
    } catch (e) {
      console.error("savePlan error:", e);
      setErr("Nie udało się utworzyć planu. Sprawdź API i autoryzację.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={() => setStep("config")}
          className="p-2 rounded-lg border border-[rgb(var(--color-primary-light))]/20 text-[rgb(var(--color-primary-light))] hover:bg-[rgb(var(--rgb-primary))]/10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-[rgb(var(--color-primary-light))]" />
          <h1 className="text-lg font-bold text-white">Budowa planu</h1>
        </div>
      </div>

      {/* Error Message */}
      {err && (
        <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-sm">
          {err}
        </div>
      )}

      {/* Plan Name & Save */}
      <div className="bg-white/5 backdrop-blur-md rounded-xl border border-[rgb(var(--color-primary-light))]/20 p-4 space-y-4">
        <div className="space-y-3">
          <div>
            <label className="text-sm text-[rgb(var(--color-primary-light))]/80 mb-1 block">Nazwa planu</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={defaultName}
              className="w-full bg-black/30 border border-[rgb(var(--color-primary-light))]/20 rounded-lg px-3 py-2 text-white text-sm placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-[rgb(var(--color-primary-light))]"
            />
          </div>
          
          <button
            onClick={savePlan}
            disabled={saving || !canSave}
            className="w-full bg-gradient-to-r from-[rgb(var(--rgb-primary))] to-[rgb(var(--color-secondary))] disabled:from-gray-600 disabled:to-gray-600 text-white py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:hover:scale-100"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            {saving ? "Zapisywanie..." : "Utwórz plan"}
          </button>
        </div>

        {/* Day Navigation */}
        {!unifiedFBW && daysCount > 1 && (
          <div className="flex items-center justify-between bg-black/20 rounded-lg border border-[rgb(var(--color-primary-light))]/20 p-2">
            <button
              onClick={() => setDayIdx(i => Math.max(0, i - 1))}
              disabled={!canPrev}
              className="px-3 py-1.5 text-sm rounded border border-[rgb(var(--color-primary-light))]/20 disabled:opacity-40 hover:bg-[rgb(var(--rgb-primary))]/10 transition-colors"
            >
              ←
            </button>
            <div className="text-sm font-medium text-[rgb(var(--color-primary-light))] px-3 py-1 bg-[rgb(var(--rgb-primary))]/10 rounded border border-[rgb(var(--color-primary-light))]/20">
              {label}
            </div>
            <button
              onClick={() => setDayIdx(i => Math.min(daysCount - 1, i + 1))}
              disabled={!canNext}
              className="px-3 py-1.5 text-sm rounded border border-[rgb(var(--color-primary-light))]/20 disabled:opacity-40 hover:bg-[rgb(var(--rgb-primary))]/10 transition-colors"
            >
              →
            </button>
          </div>
        )}

        {/* Selected Exercises */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-white text-sm">{label}</h3>
            <span className="text-xs text-[rgb(var(--color-primary-light))]/60 bg-[rgb(var(--rgb-primary))]/10 px-2 py-1 rounded-full border border-[rgb(var(--color-primary-light))]/20">
              {daysSelection[currentDay].length} ćwiczeń
            </span>
          </div>

          {daysSelection[currentDay].length === 0 ? (
            <div className="text-center py-6 text-white/40 text-sm border-2 border-dashed border-[rgb(var(--color-primary-light))]/20 rounded-lg">
              Brak wybranych ćwiczeń
            </div>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {daysSelection[currentDay].map((item) => (
                <div
                  key={item.exercise_id}
                  className="flex items-center justify-between gap-2 p-3 rounded-lg border border-[rgb(var(--color-primary-light))]/20 bg-[rgb(var(--rgb-primary))]/5 backdrop-blur-sm"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white text-sm truncate">
                      {item.name}
                    </div>
                    <div className="text-xs text-[rgb(var(--color-primary-light))]/60 uppercase">
                      {item.category}
                    </div>
                  </div>
                  
                  {/* Enhanced Sets & Reps Controls */}
                  <div className="flex items-center gap-1">
                    {/* Sets Control */}
                    <div className="flex items-center gap-1 bg-black/30 rounded border border-[rgb(var(--color-primary-light))]/20">
                      <button
                        onClick={() => adjustSets(currentDay, item.exercise_id, -1)}
                        className="p-1 text-[rgb(var(--color-primary-light))] hover:bg-[rgb(var(--rgb-primary))]/20 transition-colors rounded-l"
                        disabled={item.sets <= 1}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <div className="px-2 py-1 text-xs text-white min-w-8 text-center">
                        {item.sets}
                      </div>
                      <button
                        onClick={() => adjustSets(currentDay, item.exercise_id, 1)}
                        className="p-1 text-[rgb(var(--color-primary-light))] hover:bg-[rgb(var(--rgb-primary))]/20 transition-colors rounded-r"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="text-white/40 text-xs mx-1">×</span>

                    {/* Reps Control */}
                    <div className="flex items-center gap-1 bg-black/30 rounded border border-[rgb(var(--color-primary-light))]/20">
                      <button
                        onClick={() => adjustReps(currentDay, item.exercise_id, -1)}
                        className="p-1 text-[rgb(var(--color-primary-light))] hover:bg-[rgb(var(--rgb-primary))]/20 transition-colors rounded-l"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                      <input
                        value={item.reps}
                        onChange={(e) => handleRepsInput(currentDay, item.exercise_id, e.target.value)}
                        className="w-16 bg-transparent px-2 py-1 text-center text-white text-xs focus:outline-none focus:ring-1 focus:ring-[rgb(var(--color-primary-light))]"
                        placeholder="8-12"
                      />
                      <button
                        onClick={() => adjustReps(currentDay, item.exercise_id, 1)}
                        className="p-1 text-[rgb(var(--color-primary-light))] hover:bg-[rgb(var(--rgb-primary))]/20 transition-colors rounded-r"
                      >
                        <ChevronUp className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeSelected(currentDay, item.exercise_id)}
                      className="p-1.5 rounded text-rose-400 hover:bg-rose-500/20 transition-colors ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Exercise Library */}
        <div className="space-y-3">
          <h4 className="font-medium text-white text-sm">Dostępne ćwiczenia</h4>
          <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
            {exercises.map((ex) => {
              const active = isSelected(currentDay, ex.id);
              return (
                <button
                  key={`${currentDay}-${ex.id}`}
                  onClick={() => toggleExercise(currentDay, ex)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    active
                      ? "border-[rgb(var(--color-primary-light))] bg-[rgb(var(--rgb-primary))]/20 text-[rgb(var(--color-primary-light))]"
                      : "border-[rgb(var(--color-primary-light))]/20 bg-white/5 text-white/80 hover:bg-[rgb(var(--rgb-primary))]/10 hover:border-[rgb(var(--color-primary-light))]/40"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{ex.name}</div>
                      <div className="text-xs text-[rgb(var(--color-primary-light))]/60 uppercase mt-0.5">
                        {ex.category}
                      </div>
                    </div>
                    {active && <CheckCircle className="w-4 h-4 text-[rgb(var(--color-primary-light))] flex-shrink-0" />}
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