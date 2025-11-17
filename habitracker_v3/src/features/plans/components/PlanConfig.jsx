import { ChevronDown, ArrowLeft, Settings } from "lucide-react";

// --- Definicje pomocnicze, które były w oryginalnym kodzie ---

// W prawdziwej aplikacji te komponenty byłyby w PlanShared.js,
// ale dla pojedynczego pliku Reacta muszą być tutaj.

const FieldLabel = ({ children, hint }) => (
    <div className="flex justify-between items-center">
        <label className="text-white text-sm font-medium">{children}</label>
        {hint && <span className="text-xs text-white/60 italic">{hint}</span>}
    </div>
);

const Toggle = ({ checked, onChange, label, description }) => (
    <button
        onClick={() => onChange(!checked)}
        className={`w-full flex items-center p-3 rounded-xl border transition-all shadow-md ${
            checked 
                ? "border-blue-500 bg-blue-500/20" 
                : "border-white/20 bg-black/30 hover:bg-white/10"
        }`}
    >
        <div className="flex-grow text-left">
            <p className="text-white text-sm font-semibold">{label}</p>
            <p className="text-white/60 text-xs mt-0.5">{description}</p>
        </div>
        <div
            className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors duration-200 ease-in-out flex-shrink-0 ${
                checked ? 'bg-blue-600' : 'bg-white/30'
            }`}
        >
            <span
                className={`inline-block w-4 h-4 transform transition-transform duration-200 ease-in-out rounded-full bg-white shadow-md ${
                    checked ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
        </div>
    </button>
);

// --- Główny komponent PlanConfig ---

export function PlanConfig({ planType, daysCount, setDaysCount, repeatFBW, setRepeatFBW, splitLabels, setSplitLabels, setStep }) {
    
    // Funkcja inicjalizująca etykiety, gdy zmienia się daysCount
    // Ponieważ React przekazuje tablicę, musimy upewnić się, że ma odpowiedni rozmiar
    const handleDaysCountChange = (e) => {
        const newCount = Number(e.target.value);
        setDaysCount(newCount);
        
        // Dopasowanie rozmiaru splitLabels do nowej liczby dni
        setSplitLabels((prev) => {
            const newLabels = Array.from({ length: newCount }, (_, i) => prev[i] || '');
            return newLabels;
        });
    };

    return (
        <div className="space-y-4 font-inter">
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
                <button
                    onClick={() => setStep("chooseType")}
                    className="p-2 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-white" />
                    <h1 className="text-lg font-bold text-white">
                        {planType === "FBW" ? "Konfiguracja FBW" : "Konfiguracja SPLIT"}
                    </h1>
                </div>
            </div>

            {/* Configuration Card */}
            <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/20 p-4 space-y-6 shadow-xl">
                
                {/* Days Count & FBW Mode */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <FieldLabel hint="Ile treningów w tygodniu?">Liczba dni</FieldLabel>
                        <div className="relative">
                            <select
                                value={daysCount}
                                onChange={handleDaysCountChange}
                                className="w-full appearance-none bg-black/50 border border-white/20 rounded-lg px-3 py-2 pr-10 text-white text-sm focus:outline-none focus:ring-1 focus:ring-white"
                            >
                                {[2, 3, 4, 5, 6].map((n) => (
                                    // Ustawienie białego tekstu na opcjach wewnątrz selecta
                                    <option key={n} value={n} className="bg-gray-800 text-white">
                                        {n} dni
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                        </div>
                    </div>

                    {planType === "FBW" && (
                        <div className="space-y-2 pt-2 border-t border-white/10">
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
                    <div className="space-y-2 pt-4 border-t border-white/10">
                        <FieldLabel hint="np. Push / Pull / Nogi">Nazwy dni</FieldLabel>
                        <div className="grid grid-cols-1 gap-2">
                            {Array.from({ length: daysCount }).map((_, i) => (
                                <input
                                    key={i}
                                    value={splitLabels[i] || ""}
                                    onChange={(e) => setSplitLabels((prev) => prev.map((v, idx) => (idx === i ? e.target.value : v)))}
                                    className="bg-black/50 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-white"
                                    placeholder={`Dzień ${i + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Next Button */}
            <div className="flex justify-end pt-4">
                <button 
                    onClick={() => setStep("build")}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-all hover:scale-[1.02] shadow-lg"
                >
                    Dalej: dodaj ćwiczenia
                </button>
            </div>
        </div>
    );
}