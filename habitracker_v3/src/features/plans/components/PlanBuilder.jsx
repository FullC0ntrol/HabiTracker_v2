import { useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle,
  Loader2,
  Plus,
  X,
  Dumbbell,
  Minus,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
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
    const cleaned = value.replace(/[^\d-]/g, "");
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
          className="
            p-2 rounded-lg
            border border-[rgba(var(--rgb-primary),0.2)]
            text-[var(--color-primary-300)]
            hover:bg-[rgba(var(--rgb-primary),0.12)]
            transition-colors
          "
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-[var(--color-primary-300)]" />
          <h1 className="text-lg font-bold text-[var(--color-text-base)]">
            Budowa planu
          </h1>
        </div>
      </div>

      {/* Error Message */}
      {err && (
        <div className="p-3 rounded-xl border border-[rgba(var(--rgb-accent),0.4)] bg-[rgba(var(--rgb-accent),0.18)] text-[rgba(var(--rgb-accent),0.96)] text-sm">
          {err}
        </div>
      )}

      {/* Plan Name & Save */}
      <div className="bg-[rgba(var(--rgb-white),0.05)] backdrop-blur-md rounded-xl border border-[rgba(var(--rgb-primary),0.2)] p-4 space-y-4">
        <div className="space-y-3">
          <div>
            <label className="text-sm text-[var(--color-primary-300)] opacity-80 mb-1 block">
              Nazwa planu
            </label>
            <input
              ref={nameRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={defaultName}
              className="
                w-full
                bg-[rgba(var(--rgb-black),0.35)]
                border border-[rgba(var(--rgb-primary),0.25)]
                rounded-lg px-3 py-2
                text-[var(--color-text-base)] text-sm
                placeholder:text-[rgba(var(--rgb-white),0.45)]
                focus:outline-none
                focus:ring-1 focus:ring-[rgba(var(--rgb-primary),0.6)]
              "
            />
          </div>

          <button
            onClick={savePlan}
            disabled={saving || !canSave}
            className={`
              w-full py-2.5 rounded-lg font-medium text-sm
              flex items-center justify-center gap-2
              transition-all
              ${
                saving || !canSave
                  ? `
                    bg-[rgba(var(--rgb-white),0.08)]
                    border border-[rgba(var(--rgb-primary),0.2)]
                    text-[rgba(var(--rgb-white),0.4)]
                    cursor-not-allowed
                  `
                  : `
                    bg-gradient-to-r
                      from-[var(--color-primary)]
                      to-[var(--color-secondary)]
                    text-[var(--color-text-base)]
                    shadow-[0_0_18px_rgba(var(--rgb-primary),0.35)]
                    hover:shadow-[0_0_24px_rgba(var(--rgb-primary),0.45)]
                    hover:scale-[1.02]
                  `
              }
            `}
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
          <div className="flex items-center justify-between bg-[rgba(var(--rgb-black),0.25)] rounded-lg border border-[rgba(var(--rgb-primary),0.2)] p-2">
            <button
              onClick={() => setDayIdx((i) => Math.max(0, i - 1))}
              disabled={!canPrev}
              className="
                px-3 py-1.5 text-sm rounded
                border border-[rgba(var(--rgb-primary),0.25)]
                disabled:opacity-40 disabled:cursor-not-allowed
                hover:bg-[rgba(var(--rgb-primary),0.12)]
                transition-colors
              "
            >
              ←
            </button>
            <div className="text-sm font-medium text-[var(--color-primary-300)] px-3 py-1 bg-[rgba(var(--rgb-primary),0.15)] rounded border border-[rgba(var(--rgb-primary),0.4)]">
              {label}
            </div>
            <button
              onClick={() =>
                setDayIdx((i) => Math.min(daysCount - 1, i + 1))
              }
              disabled={!canNext}
              className="
                px-3 py-1.5 text-sm rounded
                border border-[rgba(var(--rgb-primary),0.25)]
                disabled:opacity-40 disabled:cursor-not-allowed
                hover:bg-[rgba(var(--rgb-primary),0.12)]
                transition-colors
              "
            >
              →
            </button>
          </div>
        )}

        {/* Selected Exercises */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-[var(--color-text-base)] text-sm">
              {label}
            </h3>
            <span className="text-xs text-[var(--color-primary-300)] bg-[rgba(var(--rgb-primary),0.15)] px-2 py-1 rounded-full border border-[rgba(var(--rgb-primary),0.3)]">
              {daysSelection[currentDay].length} ćwiczeń
            </span>
          </div>

          {daysSelection[currentDay].length === 0 ? (
            <div className="text-center py-6 text-[rgba(var(--rgb-white),0.4)] text-sm border-2 border-dashed border-[rgba(var(--rgb-primary),0.25)] rounded-lg">
              Brak wybranych ćwiczeń
            </div>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {daysSelection[currentDay].map((item) => (
                <div
                  key={item.exercise_id}
                  className="
                    flex items-center justify-between gap-2 p-3
                    rounded-lg
                    border border-[rgba(var(--rgb-primary),0.25)]
                    bg-[rgba(var(--rgb-primary),0.08)]
                    backdrop-blur-sm
                  "
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[var(--color-text-base)] text-sm truncate">
                      {item.name}
                    </div>
                    <div className="text-xs text-[var(--color-primary-300)] uppercase opacity-80">
                      {item.category}
                    </div>
                  </div>

                  {/* Sets & Reps Controls */}
                  <div className="flex items-center gap-1">
                    {/* Sets Control */}
                    <div className="flex items-center gap-1 bg-[rgba(var(--rgb-black),0.35)] rounded border border-[rgba(var(--rgb-primary),0.25)]">
                      <button
                        onClick={() =>
                          adjustSets(currentDay, item.exercise_id, -1)
                        }
                        className="
                          p-1 text-[var(--color-primary-300)]
                          hover:bg-[rgba(var(--rgb-primary),0.2)]
                          transition-colors rounded-l
                        "
                        disabled={item.sets <= 1}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <div className="px-2 py-1 text-xs text-[var(--color-text-base)] min-w-8 text-center">
                        {item.sets}
                      </div>
                      <button
                        onClick={() =>
                          adjustSets(currentDay, item.exercise_id, 1)
                        }
                        className="
                          p-1 text-[var(--color-primary-300)]
                          hover:bg-[rgba(var(--rgb-primary),0.2)]
                          transition-colors rounded-r
                        "
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="text-[rgba(var(--rgb-white),0.4)] text-xs mx-1">
                      ×
                    </span>

                    {/* Reps Control */}
                    <div className="flex items-center gap-1 bg-[rgba(var(--rgb-black),0.35)] rounded border border-[rgba(var(--rgb-primary),0.25)]">
                      <button
                        onClick={() =>
                          adjustReps(currentDay, item.exercise_id, -1)
                        }
                        className="
                          p-1 text-[var(--color-primary-300)]
                          hover:bg-[rgba(var(--rgb-primary),0.2)]
                          transition-colors rounded-l
                        "
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                      <input
                        value={item.reps}
                        onChange={(e) =>
                          handleRepsInput(
                            currentDay,
                            item.exercise_id,
                            e.target.value
                          )
                        }
                        className="
                          w-16 bg-transparent px-2 py-1
                          text-center text-[var(--color-text-base)] text-xs
                          focus:outline-none
                          focus:ring-1 focus:ring-[rgba(var(--rgb-primary),0.6)]
                        "
                        placeholder="8-12"
                      />
                      <button
                        onClick={() =>
                          adjustReps(currentDay, item.exercise_id, 1)
                        }
                        className="
                          p-1 text-[var(--color-primary-300)]
                          hover:bg-[rgba(var(--rgb-primary),0.2)]
                          transition-colors rounded-r
                        "
                      >
                        <ChevronUp className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() =>
                        removeSelected(currentDay, item.exercise_id)
                      }
                      className="
                        p-1.5 rounded
                        text-[rgba(var(--rgb-accent),0.9)]
                        hover:bg-[rgba(var(--rgb-accent),0.18)]
                        transition-colors ml-1
                      "
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
          <h4 className="font-medium text-[var(--color-text-base)] text-sm">
            Dostępne ćwiczenia
          </h4>
          <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
            {exercises.map((ex) => {
              const active = isSelected(currentDay, ex.id);
              return (
                <button
                  key={`${currentDay}-${ex.id}`}
                  onClick={() => toggleExercise(currentDay, ex)}
                  className={`
                    p-3 rounded-lg border text-left transition-all
                    ${
                      active
                        ? `
                          border-[rgba(var(--rgb-primary),0.5)]
                          bg-[rgba(var(--rgb-primary),0.22)]
                          text-[var(--color-primary-300)]
                        `
                        : `
                          border border-[rgba(var(--rgb-primary),0.25)]
                          bg-[rgba(var(--rgb-white),0.05)]
                          text-[rgba(var(--rgb-white),0.8)]
                          hover:bg-[rgba(var(--rgb-primary),0.15)]
                          hover:border-[rgba(var(--rgb-primary),0.45)]
                        `
                    }
                  `}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {ex.name}
                      </div>
                      <div className="text-xs text-[var(--color-primary-300)] uppercase mt-0.5 opacity-80">
                        {ex.category}
                      </div>
                    </div>
                    {active && (
                      <CheckCircle className="w-4 h-4 text-[var(--color-primary-400)] flex-shrink-0" />
                    )}
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
