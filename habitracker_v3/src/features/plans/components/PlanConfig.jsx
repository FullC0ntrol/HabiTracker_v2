import { ChevronDown, ArrowLeft } from "lucide-react";
import { FieldLabel, Toggle } from "./PlanShared";

export function PlanConfig({ planType, daysCount, setDaysCount, repeatFBW, setRepeatFBW, splitLabels, setSplitLabels, setStep }) {
  return (
    <div className="space-y-6">
      <button onClick={() => setStep("chooseType")} className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300">
        <ArrowLeft className="w-4 h-4" /> Wróć
      </button>

      <h2 className="text-2xl font-black">
        {planType === "FBW" ? "Konfiguracja FBW" : "Konfiguracja SPLIT"}
      </h2>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <FieldLabel hint="Ile treningów chcesz w tygodniu?">Liczba dni</FieldLabel>
            <div className="relative">
              <select
                value={daysCount}
                onChange={(e) => setDaysCount(Number(e.target.value))}
                className="w-full appearance-none bg-white/10 border border-white/15 rounded-xl px-4 py-2 pr-10 text-white/90 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                {[2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n} className="bg-gray-900">
                    {n}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
            </div>
          </div>

          {planType === "FBW" && (
            <div className="flex flex-col gap-2">
              <FieldLabel>Tryb FBW</FieldLabel>
              <Toggle
                checked={repeatFBW}
                onChange={(v) => setRepeatFBW(v)}
                label={repeatFBW ? "Te same ćwiczenia każdego dnia" : "Różne ćwiczenia w różne dni"}
                description={
                  repeatFBW
                    ? "Edytujesz jeden wspólny zestaw – używany we wszystkie dni."
                    : "Każdy dzień układasz osobno (nawigacja „Poprzedni/Następny”)."
                }
              />
            </div>
          )}
        </div>

        {planType === "SPLIT" && (
          <div className="space-y-3">
            <FieldLabel hint="np. Push / Pull / Nogi">Etykiety dni</FieldLabel>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {Array.from({ length: daysCount }).map((_, i) => (
                <input
                  key={i}
                  value={splitLabels[i] || ""}
                  onChange={(e) => setSplitLabels((prev) => prev.map((v, idx) => (idx === i ? e.target.value : v)))}
                  className="bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-white/90 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder={`Dzień ${i + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button onClick={() => setStep("build")} className="rounded-xl bg-cyan-600 hover:bg-cyan-500 px-5 py-2 font-semibold">
          Dalej: dodaj ćwiczenia
        </button>
      </div>
    </div>
  );
}
