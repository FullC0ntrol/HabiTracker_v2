import { useState } from "react";
import { Weight, Repeat, Timer } from "lucide-react";

/**
 * SetForm - Mobile-First Design
 * - Duże, touch-friendly przyciski
 * - Czytelne labele z ikonami
 * - Gradient akcenty
 */
export function SetForm({
  exerciseName,
  setIndex,
  totalSets,
  onSubmit,
  defaultRest = 60,
}) {
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [rest, setRest] = useState(defaultRest);

  const canSave = weight !== "" && reps !== "" && Number(reps) > 0;

  return (
    <div className="w-full">
      {/* Exercise card */}
      <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-7 shadow-2xl">
        {/* Exercise name & set counter */}
        <div className="text-center mb-6">
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
            {exerciseName}
          </h3>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-400/30">
            <span className="text-xs sm:text-sm font-semibold text-cyan-300">
              Seria {setIndex} / {totalSets}
            </span>
          </div>
        </div>

        {/* Main inputs - Weight & Reps */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
          {/* Weight input */}
          <div>
            <label className="flex items-center gap-2 mb-2 text-xs sm:text-sm text-gray-300">
              <Weight className="w-4 h-4 text-cyan-400" />
              Ciężar (kg)
            </label>
            <input
              inputMode="decimal"
              pattern="[0-9.,]*"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="60"
              className="w-full h-14 sm:h-16 rounded-2xl bg-black/40 border border-white/15 px-4 text-xl sm:text-2xl font-bold text-white placeholder:text-white/30 outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 transition-all"
            />
          </div>

          {/* Reps input */}
          <div>
            <label className="flex items-center gap-2 mb-2 text-xs sm:text-sm text-gray-300">
              <Repeat className="w-4 h-4 text-emerald-400" />
              Powtórzenia
            </label>
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              placeholder="8"
              className="w-full h-14 sm:h-16 rounded-2xl bg-black/40 border border-white/15 px-4 text-xl sm:text-2xl font-bold text-white placeholder:text-white/30 outline-none focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20 transition-all"
            />
          </div>
        </div>

        {/* Rest input */}
        <div className="mb-6">
          <label className="flex items-center gap-2 mb-2 text-xs sm:text-sm text-gray-300">
            <Timer className="w-4 h-4 text-blue-400" />
            Przerwa (sekundy)
          </label>
          <input
            inputMode="numeric"
            pattern="[0-9]*"
            value={rest}
            onChange={(e) => setRest(e.target.value)}
            placeholder="60"
            className="w-full h-12 sm:h-14 rounded-2xl bg-black/40 border border-white/15 px-4 text-base sm:text-lg font-semibold text-white placeholder:text-white/30 outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 transition-all"
          />
        </div>

        {/* Submit button */}
        <button
          disabled={!canSave}
          onClick={() =>
            canSave &&
            onSubmit({
              weight: Number(String(weight).replace(",", ".")),
              reps: Number(reps),
              restSeconds: Math.max(0, Number(rest) || 60),
            })
          }
          className={`
            w-full h-14 sm:h-16 rounded-2xl font-bold text-base sm:text-lg
            transition-all duration-300
            ${
              canSave
                ? "bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 active:scale-[0.98]"
                : "bg-gray-800/50 border border-white/10 text-white/30 cursor-not-allowed"
            }
          `}
        >
          {canSave ? "Zatwierdź i kontynuuj" : "Uzupełnij dane"}
        </button>
      </div>
    </div>
  );
}