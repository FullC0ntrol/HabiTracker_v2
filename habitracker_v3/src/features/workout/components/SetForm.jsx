import { useState } from "react";
import { Weight, Repeat, Timer } from "lucide-react";

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
    <div className="w-full max-w-md mx-auto">
      {/* Exercise card */}
      <div className="bg-white/5 backdrop-blur-md border border-emerald-500/20 rounded-2xl p-4 shadow-lg">
        {/* Exercise name & set counter */}
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold text-white mb-2 truncate">
            {exerciseName}
          </h3>
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30">
            <span className="text-xs font-semibold text-emerald-300">
              Seria {setIndex} z {totalSets}
            </span>
          </div>
        </div>

        {/* Main inputs - Weight & Reps */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Weight input */}
          <div>
            <label className="flex items-center gap-1 mb-2 text-xs text-emerald-300/80">
              <Weight className="w-3.5 h-3.5 text-cyan-400" />
              Ciężar (kg)
            </label>
            <input
              inputMode="decimal"
              pattern="[0-9.,]*"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="60"
              className="w-full h-12 rounded-xl bg-black/30 border border-emerald-500/20 px-3 text-lg font-bold text-white placeholder:text-white/40 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all"
            />
          </div>

          {/* Reps input */}
          <div>
            <label className="flex items-center gap-1 mb-2 text-xs text-emerald-300/80">
              <Repeat className="w-3.5 h-3.5 text-emerald-400" />
              Powtórzenia
            </label>
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              placeholder="8"
              className="w-full h-12 rounded-xl bg-black/30 border border-emerald-500/20 px-3 text-lg font-bold text-white placeholder:text-white/40 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 transition-all"
            />
          </div>
        </div>

        {/* Rest input */}
        <div className="mb-4">
          <label className="flex items-center gap-1 mb-2 text-xs text-emerald-300/80">
            <Timer className="w-3.5 h-3.5 text-blue-400" />
            Przerwa (sekundy)
          </label>
          <input
            inputMode="numeric"
            pattern="[0-9]*"
            value={rest}
            onChange={(e) => setRest(e.target.value)}
            placeholder="60"
            className="w-full h-10 rounded-xl bg-black/30 border border-emerald-500/20 px-3 text-base font-semibold text-white placeholder:text-white/40 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30 transition-all"
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
            w-full h-12 rounded-xl font-semibold text-sm
            transition-all duration-300
            ${
              canSave
                ? "bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 active:scale-[0.98]"
                : "bg-white/5 border border-emerald-500/10 text-white/30 cursor-not-allowed"
            }
          `}
        >
          {canSave ? "Zatwierdź serię" : "Uzupełnij dane"}
        </button>
      </div>
    </div>
  );
}