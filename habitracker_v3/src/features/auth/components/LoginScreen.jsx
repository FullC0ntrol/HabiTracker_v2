import { useState } from "react";
import { User, Sparkles, Target, Activity } from "lucide-react";
import { useAuth } from "../../../shared/auth/AuthContext";

export default function LoginScreen({ onComplete }) {
  const { setUsername } = useAuth();
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setUsername(trimmed);
    localStorage.setItem("username", trimmed);
    setIsLoading(false);
    onComplete?.();
  };

  return (
    <div className="page-container bg-mesh p-4 sm:p-6 xl:p-10">
      {/* Dekoracyjne tło */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-6 w-28 h-28 md:w-40 md:h-40 bg-emerald-500/25 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-8 right-8 w-24 h-24 md:w-36 md:h-36 bg-cyan-500/20 rounded-full blur-2xl animate-pulse-slow delay-2000" />
        <div className="absolute top-1/2 left-1/2 w-20 h-20 md:w-32 md:h-32 bg-amber-500/15 rounded-full blur-2xl animate-pulse-slow delay-4000" />
      </div>

      {/* Zawartość */}
      <div className="relative z-10 w-full max-w-sm md:max-w-md xl:max-w-lg flex flex-col items-center text-center gap-6 md:gap-8 animate-scale-in">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 md:w-24 md:h-24 glass rounded-2xl flex items-center justify-center glow-emerald animate-float">
            <Activity className="w-8 h-8 md:w-10 md:h-10 text-emerald-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight">
            Habi<span className="text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.6)]">Tracker</span>
          </h1>
          <p className="text-zinc-400 text-sm md:text-base">
            Twoja rutyna, Twoje postępy
          </p>
        </div>

        {/* Formularz */}
        <form
          onSubmit={handleSubmit}
          className="glass-strong rounded-2xl p-6 w-full flex flex-col gap-4 animate-scale-in"
        >
          <label className="flex items-center gap-2 text-zinc-300 text-sm font-medium">
            <User className="w-4 h-4 text-emerald-400" />
            Twój login
          </label>

          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Wprowadź login..."
            className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-400/10 transition"
            autoFocus
          />

          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="mt-2 bg-gradient-to-br from-emerald-600 to-emerald-400 py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 text-sm md:text-base transition hover:scale-[1.03] active:scale-100 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Ładowanie...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Rozpocznij
              </>
            )}
          </button>
        </form>

        {/* Feature karty */}
        <div className="grid grid-cols-3 gap-3 w-full text-xs md:text-sm text-zinc-400 animate-slide-up">
          <div className="glass rounded-xl p-3 flex flex-col items-center hover:scale-[1.05] transition-all">
            <Target className="w-5 h-5 text-emerald-400 mb-1" />
            Cele
          </div>
          <div className="glass rounded-xl p-3 flex flex-col items-center hover:scale-[1.05] transition-all">
            <Activity className="w-5 h-5 text-cyan-400 mb-1" />
            Postępy
          </div>
          <div className="glass rounded-xl p-3 flex flex-col items-center hover:scale-[1.05] transition-all">
            <Sparkles className="w-5 h-5 text-amber-400 mb-1" />
            Nawyki
          </div>
        </div>

        <p className="text-xs text-zinc-600 animate-slide-up delay-200">
          Dołącz do społeczności
        </p>
      </div>
    </div>
  );
}
