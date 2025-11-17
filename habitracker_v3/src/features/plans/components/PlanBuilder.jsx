import { useMemo, useRef, useState } from "react";
import { ArrowLeft, CheckCircle, Loader2, Plus, X, Dumbbell, Minus, ChevronUp, ChevronDown } from "lucide-react";

// WAŻNE: W środowisku produkcyjnym ten import musi działać.
// Zakładam, że plansService i inne moduły są dostępne.
// import { plansService } from "../services/plans.service"; 
// Dla celów tego pojedynczego pliku, będę musiał zdefiniować zaślepki:
const plansService = {
    create: async (payload) => {
        console.log("Saving plan payload:", payload);
        await new Promise(resolve => setTimeout(resolve, 500)); // Symulacja opóźnienia API
        // if (Math.random() < 0.2) throw new Error("API error simulation");
    }
};


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

    // Używamy indeksu 0 dla wszystkich dni, jeśli FBW jest ujednolicone
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

            // Logika synchronizacji dla ujednoliconego FBW
            if (planType === "FBW" && repeatFBW) {
                for (let i = 0; i < copy.length; i++) {
                    if (i === day) continue;
                    const has = copy[i].some((it) => it.exercise_id === ex.id);

                    if (exists && has) {
                        // Usuń z innych dni, jeśli został usunięty z bieżącego
                        copy[i] = copy[i].filter((it) => it.exercise_id !== ex.id);
                    } else if (!exists && !has) {
                        // Dodaj do innych dni, jeśli został dodany do bieżącego
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
                                // Modyfikacja zakresu
                                const min = parseInt(match[1]) + delta;
                                const max = parseInt(match[2]) + delta;
                                if (min >= 1 && max >= min) {
                                    return { ...it, reps: `${min}-${max}` };
                                }
                            } else {
                                // Modyfikacja pojedynczej wartości
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
        // Pozwól tylko na liczby i myślniki, ale upewnij się, że tekst jest widoczny (biały)
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
        // Sprawdź, czy którykolwiek dzień ma wybrane ćwiczenia
        const hasExercises = daysSelection.some((arr) => arr.length > 0);
        return hasExercises;
    }, [planType, daysSelection]);

    const savePlan = async () => {
        if (!canSave) {
            setErr("Musisz dodać przynajmniej jedno ćwiczenie do planu.");
            return;
        }
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
        <div className="space-y-4 font-inter">
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
                <button
                    onClick={() => setStep("config")}
                    className="p-2 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2">
                    <Dumbbell className="w-5 h-5 text-white" />
                    <h1 className="text-lg font-bold text-white">Budowa planu</h1>
                </div>
            </div>

            {/* Error Message */}
            {err && (
                <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-white text-sm">
                    {err}
                </div>
            )}

            {/* Plan Name & Save */}
            <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/20 p-4 space-y-4 shadow-xl">
                <div className="space-y-3">
                    <div>
                        <label className="text-sm text-white/80 mb-1 block">Nazwa planu</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={defaultName}
                            className="w-full bg-black/50 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-white"
                        />
                    </div>
                    
                    <button
                        onClick={savePlan}
                        disabled={saving || !canSave}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 disabled:from-gray-700 disabled:to-gray-700 text-white py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:hover:scale-100 shadow-md"
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
                    <div className="flex items-center justify-between bg-black/30 rounded-lg border border-white/20 p-2">
                        <button
                            onClick={() => setDayIdx(i => Math.max(0, i - 1))}
                            disabled={!canPrev}
                            className="px-3 py-1.5 text-sm rounded border border-white/20 disabled:opacity-40 hover:bg-white/10 text-white transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 inline-block align-middle" />
                        </button>
                        <div className="text-sm font-medium text-white px-3 py-1 bg-white/10 rounded border border-white/20">
                            {label}
                        </div>
                        <button
                            onClick={() => setDayIdx(i => Math.min(daysCount - 1, i + 1))}
                            disabled={!canNext}
                            className="px-3 py-1.5 text-sm rounded border border-white/20 disabled:opacity-40 hover:bg-white/10 text-white transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 rotate-180 inline-block align-middle" />
                        </button>
                    </div>
                )}

                {/* Selected Exercises */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="font-medium text-white text-sm">{label}</h3>
                        <span className="text-xs text-white/60 bg-black/30 px-2 py-1 rounded-full border border-white/20">
                            {daysSelection[currentDay].length} ćwiczeń
                        </span>
                    </div>

                    {daysSelection[currentDay].length === 0 ? (
                        <div className="text-center py-6 text-white/40 text-sm border-2 border-dashed border-white/20 rounded-lg">
                            Brak wybranych ćwiczeń
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                            {daysSelection[currentDay].map((item) => (
                                <div
                                    key={item.exercise_id}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl border border-white/20 bg-black/30 backdrop-blur-sm shadow-inner"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-white text-sm truncate">
                                            {item.name}
                                        </div>
                                        <div className="text-xs text-white/60 uppercase">
                                            {item.category}
                                        </div>
                                    </div>
                                    
                                    {/* Enhanced Sets & Reps Controls */}
                                    <div className="flex items-center gap-3">
                                        {/* Sets Control */}
                                        <div className="flex items-center gap-1 bg-black/50 rounded-lg border border-white/10 p-1">
                                            <span className="text-white/60 text-xs mr-2">SERIE:</span>
                                            <button
                                                onClick={() => adjustSets(currentDay, item.exercise_id, -1)}
                                                className="p-1 text-white hover:bg-white/20 transition-colors rounded-md"
                                                disabled={item.sets <= 1}
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <div className="px-1 text-sm font-semibold text-white min-w-6 text-center">
                                                {item.sets}
                                            </div>
                                            <button
                                                onClick={() => adjustSets(currentDay, item.exercise_id, 1)}
                                                className="p-1 text-white hover:bg-white/20 transition-colors rounded-md"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>

                                        {/* Reps Control */}
                                        <div className="flex items-center gap-1 bg-black/50 rounded-lg border border-white/10 p-1">
                                            <span className="text-white/60 text-xs mr-1">POWT:</span>
                                            <input
                                                value={item.reps}
                                                onChange={(e) => handleRepsInput(currentDay, item.exercise_id, e.target.value)}
                                                className="w-16 bg-transparent px-1 py-1 text-center font-semibold text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/40 rounded-md"
                                                placeholder="8-12"
                                            />
                                            <div className="flex flex-col">
                                                <button
                                                    onClick={() => adjustReps(currentDay, item.exercise_id, 1)}
                                                    className="p-0.5 text-white/80 hover:text-white hover:bg-white/10 transition-colors rounded-t-md"
                                                >
                                                    <ChevronUp className="w-3 h-3" />
                                                </button>
                                                <button
                                                    onClick={() => adjustReps(currentDay, item.exercise_id, -1)}
                                                    className="p-0.5 text-white/80 hover:text-white hover:bg-white/10 transition-colors rounded-b-md"
                                                >
                                                    <ChevronDown className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => removeSelected(currentDay, item.exercise_id)}
                                            className="p-2 rounded-full text-rose-400 hover:bg-rose-500/30 transition-colors ml-1 flex-shrink-0"
                                            aria-label="Usuń ćwiczenie"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Exercise Library */}
                <div className="space-y-3 pt-4 border-t border-white/10">
                    <h4 className="font-medium text-white text-sm">Dostępne ćwiczenia (Kliknij, aby dodać)</h4>
                    <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                        {exercises.map((ex) => {
                            const active = isSelected(currentDay, ex.id);
                            return (
                                <button
                                    key={`${currentDay}-${ex.id}`}
                                    onClick={() => toggleExercise(currentDay, ex)}
                                    className={`p-3 rounded-xl border text-left transition-all shadow-sm ${
                                        active
                                            ? "border-blue-500 bg-blue-500/20 text-white"
                                            : "border-white/20 bg-black/30 text-white/90 hover:bg-white/10 hover:border-white/40"
                                    }`}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-sm truncate">{ex.name}</div>
                                            <div className="text-xs text-white/60 uppercase mt-0.5">
                                                {ex.category}
                                            </div>
                                        </div>
                                        {active ? <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0" /> : <Plus className="w-5 h-5 text-white/40 flex-shrink-0" />}
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

// Przykładowe dane dla testowania komponentu:
// (Zostałyby one przekazane przez props w pełnej aplikacji)
PlanBuilder.defaultProps = {
    planType: 'SPLIT',
    daysCount: 3,
    repeatFBW: false,
    splitLabels: ['Push', 'Pull', 'Legs'],
    exercises: [
        { id: 'ex1', name: 'Wyciskanie sztangi leżąc', category: 'Klatka' },
        { id: 'ex2', name: 'Wiosłowanie sztangą', category: 'Plecy' },
        { id: 'ex3', name: 'Przysiad ze sztangą', category: 'Nogi' },
        { id: 'ex4', name: 'Wyciskanie hantli siedząc', category: 'Barki' },
        { id: 'ex5', name: 'Uginanie ramion z hantlami', category: 'Biceps' },
        { id: 'ex6', name: 'Prostowanie ramion na wyciągu', category: 'Triceps' },
    ],
    setStep: () => console.log('setStep called'),
    reloadPlans: () => console.log('reloadPlans called'),
};