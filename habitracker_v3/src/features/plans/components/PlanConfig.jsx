import { ChevronDown, ArrowLeft, Settings } from "lucide-react";
import { FieldLabel, Toggle } from "./PlanShared";

export function PlanConfig({ planType, daysCount, setDaysCount, repeatFBW, setRepeatFBW, splitLabels, setSplitLabels, setStep }) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={() => setStep("chooseType")}
          className="p-2 rounded-lg border border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-300" />
          <h1 className="text-lg font-bold text-white">
            {planType === "FBW" ? "Konfiguracja FBW" : "Konfiguracja SPLIT"}
          </h1>
        </div>
      </div>

      {/* Configuration Card */}
      <div className="bg-white/5 backdrop-blur-md rounded-xl border border-emerald-500/20 p-4 space-y-4">
        {/* Days Count & FBW Mode */}
        <div className="space-y-4">
          <div className="space-y-2">
            <FieldLabel hint="Ile treningów w tygodniu?">Liczba dni</FieldLabel>
            <div className="relative">
              <select
                value={daysCount}
                onChange={(e) => setDaysCount(Number(e.target.value))}
                className="w-full appearance-none bg-black/30 border border-emerald-500/20 rounded-lg px-3 py-2 pr-10 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400"
              >
                {[2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n} className="bg-gray-900">
                    {n} dni
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-300/60" />
            </div>
          </div>

          {planType === "FBW" && (
            <div className="space-y-2">
              <FieldLabel>Tryb FBW</FieldLabel>
              <Toggle
                checked={repeatFBW}
                onChange={(v) => setRepeatFBW(v)}
                label={repeatFBW ? "Ten sam zestaw każdego dnia" : "Różne zestawy w różne dni"}
                description={
                  repeatFBW
                    ? "Edytujesz jeden wspólny zestaw ćwiczeń"
                    : "Każdy dzień układany osobno"
                }
              />
            </div>
          )}
        </div>

        {/* Split Labels */}
        {planType === "SPLIT" && (
          <div className="space-y-2">
            <FieldLabel hint="np. Push / Pull / Nogi">Nazwy dni</FieldLabel>
            <div className="grid grid-cols-1 gap-2">
              {Array.from({ length: daysCount }).map((_, i) => (
                <input
                  key={i}
                  value={splitLabels[i] || ""}
                  onChange={(e) => setSplitLabels((prev) => prev.map((v, idx) => (idx === i ? e.target.value : v)))}
                  className="bg-black/30 border border-emerald-500/20 rounded-lg px-3 py-2 text-white text-sm placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  placeholder={`Dzień ${i + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Next Button */}
      <div className="flex justify-end">
        <button 
          onClick={() => setStep("build")}
          className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-all hover:scale-[1.02]"
        >
          Dalej: dodaj ćwiczenia
        </button>
      </div>
    </div>
  );
}