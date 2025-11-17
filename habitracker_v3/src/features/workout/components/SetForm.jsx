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
      <div className="bg-[rgba(var(--rgb-white),_0.05)] backdrop-blur-md border border-[rgba(var(--rgb-primary),_0.2)] rounded-2xl p-4 shadow-lg">
        {/* Exercise name & set counter */}
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold text-white mb-2 truncate">
            {exerciseName}
          </h3>
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[rgba(var(--rgb-primary),_0.2)] border border-[color:var(--color-primary-400)]/30">
            <span className="text-xs font-semibold text-[var(--color-primary-300)]">
              Seria {setIndex} z {totalSets}
            </span>
          </div>
        </div>

        {/* Main inputs - Weight & Reps */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Weight input */}
          <div>
            <label className="flex items-center gap-1 mb-2 text-xs text-[color:var(--color-primary-300)]/80">
              <Weight className="w-3.5 h-3.5 text-[var(--color-secondary-400)]" />
              Ciężar (kg)
            </label>
            <input
              inputMode="decimal"
              pattern="[0-9.,]*"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="60"
              className="w-full h-12 rounded-xl bg-[rgba(var(--rgb-black),_0.3)] border border-[rgba(var(--rgb-primary),_0.2)] px-3 text-lg font-bold text-white placeholder:text-[rgba(var(--rgb-white),_0.4)] outline-none focus:border-[var(--color-secondary-400)] focus:ring-1 focus:ring-[color:var(--color-secondary-400)]/30 transition-all"
            />
          </div>

          {/* Reps input */}
          <div>
            <label className="flex items-center gap-1 mb-2 text-xs text-[color:var(--color-primary-300)]/80">
              <Repeat className="w-3.5 h-3.5 text-[var(--color-primary-400)]" />
              Powtórzenia
            </label>
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              placeholder="8"
              className="w-full h-12 rounded-xl bg-[rgba(var(--rgb-black),_0.3)] border border-[rgba(var(--rgb-primary),_0.2)] px-3 text-lg font-bold text-white placeholder:text-[rgba(var(--rgb-white),_0.4)] outline-none focus:border-[var(--color-primary-400)] focus:ring-1 focus:ring-[color:var(--color-primary-400)]/30 transition-all"
            />
          </div>
        </div>

        {/* Rest input */}
        <div className="mb-4">
          <label className="flex items-center gap-1 mb-2 text-xs text-[color:var(--color-primary-300)]/80">
            <Timer className="w-3.5 h-3.5 text-[var(--color-primary-400)]" />
            Przerwa (sekundy)
          </label>
          <input
            inputMode="numeric"
            pattern="[0-9]*"
            value={rest}
            onChange={(e) => setRest(e.target.value)}
            placeholder="60"
            className="w-full h-10 rounded-xl bg-[rgba(var(--rgb-black),_0.3)] border border-[rgba(var(--rgb-primary),_0.2)] px-3 text-base font-semibold text-white placeholder:text-[rgba(var(--rgb-white),_0.4)] outline-none focus:border-[var(--color-primary-400)] focus:ring-1 focus:ring-[color:var(--color-primary-400)]/30 transition-all"
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
                ? "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:from-[var(--color-primary)] hover:to-[var(--color-secondary)] text-white shadow-lg shadow-[rgba(var(--rgb-primary),_0.3)] hover:shadow-xl hover:shadow-[rgba(var(--rgb-primary),_0.4)] active:scale-[0.98] hover:brightness-110"
                : "bg-[rgba(var(--rgb-white),_0.05)] border border-[rgba(var(--rgb-primary),_0.1)] text-[rgba(var(--rgb-white),_0.3)] cursor-not-allowed"
            }
          `}
        >
          {canSave ? "Zatwierdź serię" : "Uzupełnij dane"}
        </button>
      </div>
    </div>
  );
}