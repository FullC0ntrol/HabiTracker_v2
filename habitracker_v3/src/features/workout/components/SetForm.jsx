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
    <div className="w-full max-w-md mx-auto px-3 sm:px-4">
      {/* Karta ćwiczenia */}
      <div className="glass-strong rounded-2xl border border-[color:var(--color-card-border)] px-4 py-4 sm:px-5 sm:py-5 shadow-[0_18px_45px_rgba(0,0,0,0.8)]">
        {/* Nazwa ćwiczenia + licznik serii */}
        <div className="text-center mb-4">
          <h3 className="text-base sm:text-lg font-bold text-[color:var(--color-text-base)] mb-2 truncate">
            {exerciseName}
          </h3>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(var(--rgb-primary),0.16)] border border-[rgba(var(--rgb-primary),0.55)]">
            <span className="text-[11px] sm:text-xs font-semibold text-[color:var(--color-primary-300)]">
              Seria {setIndex} z {totalSets}
            </span>
          </div>
        </div>

        {/* Wagi / powtórzenia */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Ciężar */}
          <div>
            <label className="flex items-center gap-1 mb-1.5 text-[10px] sm:text-xs text-[color:var(--color-text-soft)]">
              <Weight className="w-3.5 h-3.5 text-[rgb(var(--color-secondary))]" />
              <span>Ciężar (kg)</span>
            </label>
            <input
              inputMode="decimal"
              pattern="[0-9.,]*"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="60"
              className="
                w-full h-11 sm:h-12 rounded-xl px-3
                text-sm sm:text-base font-semibold
                bg-[color:var(--color-input-bg)]
                border border-[color:var(--color-input-border)]
                text-[color:var(--color-text-base)]
                placeholder-[color:var(--color-muted-500)]
                outline-none
                focus:border-[rgba(var(--rgb-primary),0.95)]
                focus:ring-1 focus:ring-[rgba(var(--rgb-primary),0.45)]
                transition-all
              "
            />
          </div>

          {/* Powtórzenia */}
          <div>
            <label className="flex items-center gap-1 mb-1.5 text-[10px] sm:text-xs text-[color:var(--color-text-soft)]">
              <Repeat className="w-3.5 h-3.5 text-[color:var(--color-primary-300)]" />
              <span>Powtórzenia</span>
            </label>
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              placeholder="8"
              className="
                w-full h-11 sm:h-12 rounded-xl px-3
                text-sm sm:text-base font-semibold
                bg-[color:var(--color-input-bg)]
                border border-[color:var(--color-input-border)]
                text-[color:var(--color-text-base)]
                placeholder-[color:var(--color-muted-500)]
                outline-none
                focus:border-[rgba(var(--rgb-primary),0.95)]
                focus:ring-1 focus:ring-[rgba(var(--rgb-primary),0.45)]
                transition-all
              "
            />
          </div>
        </div>

        {/* Przerwa */}
        <div className="mb-4">
          <label className="flex items-center gap-1 mb-1.5 text-[10px] sm:text-xs text-[color:var(--color-text-soft)]">
            <Timer className="w-3.5 h-3.5 text-[rgba(59,130,246,0.9)]" />
            <span>Przerwa (sekundy)</span>
          </label>
          <input
            inputMode="numeric"
            pattern="[0-9]*"
            value={rest}
            onChange={(e) => setRest(e.target.value)}
            placeholder="60"
            className="
              w-full h-10 rounded-xl px-3
              text-sm font-semibold
              bg-[color:var(--color-input-bg)]
              border border-[color:var(--color-input-border)]
              text-[color:var(--color-text-base)]
              placeholder-[color:var(--color-muted-500)]
              outline-none
              focus:border-[rgba(59,130,246,0.95)]
              focus:ring-1 focus:ring-[rgba(59,130,246,0.45)]
              transition-all
            "
          />
        </div>

        {/* Przyciski */}
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
            w-full h-11 sm:h-12 rounded-xl font-semibold text-xs sm:text-sm
            transition-all duration-250
            ${
              canSave
                ? "bg-[linear-gradient(135deg,var(--color-primary),var(--color-secondary))] text-[color:var(--color-text-base)] shadow-[0_0_22px_rgba(var(--rgb-primary),0.7)] hover:shadow-[0_0_30px_rgba(var(--rgb-primary),0.9)] hover:scale-[1.01] active:scale-[0.98]"
                : "bg-[rgba(15,23,42,0.96)] border border-[color:var(--color-card-border)] text-[color:var(--color-text-soft)] cursor-not-allowed"
            }
          `}
        >
          {canSave ? "Zatwierdź serię" : "Uzupełnij dane serii"}
        </button>
      </div>
    </div>
  );
}
