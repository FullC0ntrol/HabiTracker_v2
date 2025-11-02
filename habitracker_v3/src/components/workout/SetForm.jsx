// /workout/SetForm.jsx
import { useState } from "react";

/**
 * Minimalistyczny formularz:
 * - Duże pola wejścia: Ciężar (kg), Powtórzenia
 * - Poniżej: Przerwa (sekundy)
 * - Jeden wyraźny przycisk "Dalej"
 * Styl spójny z resztą (ciemne tło, akcenty cyan/emerald).
 */
export function SetForm({ exerciseName, setIndex, totalSets, onSubmit, defaultRest = 60 }) {
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [rest, setRest] = useState(defaultRest);

  const canSave = weight !== "" && reps !== "" && Number(reps) > 0;

  return (
    <div className="w-full max-w-lg">
      {/* Karta z polami – minimalistyczna */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5 sm:p-6">
        {/* Główne, duże pola */}
        <div className="grid grid-cols-2 gap-4 sm:gap-5">
          <label className="block">
            <div className="text-xs sm:text-sm text-white/70 mb-2">Ciężar (kg)</div>
            <input
              inputMode="decimal"
              pattern="[0-9.,]*"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full h-14 sm:h-16 rounded-xl bg-black/40 border border-white/15 px-4 text-lg sm:text-2xl font-bold text-white/90 outline-none focus:ring-2 focus:ring-cyan-400/60"
              placeholder="np. 60"
            />
          </label>

          <label className="block">
            <div className="text-xs sm:text-sm text-white/70 mb-2">Powtórzenia</div>
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              className="w-full h-14 sm:h-16 rounded-xl bg-black/40 border border-white/15 px-4 text-lg sm:text-2xl font-bold text-white/90 outline-none focus:ring-2 focus:ring-cyan-400/60"
              placeholder="np. 8"
            />
          </label>
        </div>

        {/* Przerwa pod spodem */}
        <div className="mt-5 sm:mt-6">
          <label className="block">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm text-white/70">Przerwa po tej serii (sekundy)</span>
              <span className="text-[11px] text-white/50">Seria {setIndex}/{totalSets}</span>
            </div>
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              value={rest}
              onChange={(e) => setRest(e.target.value)}
              className="w-full h-12 rounded-xl bg-black/40 border border-white/15 px-4 text-base font-semibold text-white/80 outline-none focus:ring-2 focus:ring-cyan-400/60"
              placeholder="60"
            />
          </label>
        </div>

        {/* Akcja — jeden duży przycisk */}
        <button
          disabled={!canSave}
          onClick={() =>
            canSave && onSubmit({
              weight: Number(String(weight).replace(",", ".")),
              reps: Number(reps),
              restSeconds: Math.max(0, Number(rest) || 60),
            })
          }
          className={[
            "mt-6 w-full h-12 sm:h-14 rounded-xl font-semibold border transition",
            canSave
              ? "bg-gradient-to-r from-cyan-500/25 to-emerald-500/25 border-cyan-400/30 hover:from-cyan-500/35 hover:to-emerald-500/35"
              : "bg-white/5 border-white/10 opacity-60 cursor-not-allowed",
          ].join(" ")}
        >
          Dalej
        </button>
      </div>
    </div>
  );
}
