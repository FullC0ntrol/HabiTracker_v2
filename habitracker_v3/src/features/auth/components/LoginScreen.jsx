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
      {/* Dekoracyjne tło - niebieskie efekty */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-6 w-28 h-28 md:w-40 md:h-40 bg-[rgb(var(--rgb-primary))]/25 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-8 right-8 w-24 h-24 md:w-36 md:h-36 bg-[rgb(var(--color-secondary))]/20 rounded-full blur-2xl animate-pulse-slow delay-2000" />
        <div className="absolute top-1/2 left-1/2 w-20 h-20 md:w-32 md:h-32 bg-[rgb(var(--rgb-accent))]/15 rounded-full blur-2xl animate-pulse-slow delay-4000" />
      </div>

      {/* Zawartość */}
      <div className="relative z-10 w-full max-w-sm md:max-w-md xl:max-w-lg flex flex-col items-center text-center gap-6 md:gap-8 animate-scale-in">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 md:w-24 md:h-24 glass rounded-2xl flex items-center justify-center glow-primary animate-float border border-[rgb(var(--color-primary-light))]/30">
            <Activity className="w-8 h-8 md:w-10 md:h-10 text-[rgb(var(--color-primary-light))]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight text-white">
            Habi
            <span className="text-[rgb(var(--color-primary-light))] drop-shadow-[0_0_10px_rgba(var(--rgb-primary),0.6)]">
              Tracker
            </span>
          </h1>
          <p className="text-[rgb(var(--color-text-muted))] text-sm md:text-base">
            Twoja rutyna, Twoje postępy
          </p>
        </div>

        {/* Formularz */}
        <form
          onSubmit={handleSubmit}
          className="glass-strong rounded-2xl p-6 w-full flex flex-col gap-4 animate-scale-in border border-[rgb(var(--color-primary-light))]/20"
        >
          <label className="flex items-center gap-2 text-[rgb(var(--color-text-soft))] text-sm font-medium">
            <User className="w-4 h-4 text-[rgb(var(--color-primary-light))]" />
            Twój login
          </label>

          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Wprowadź login..."
            className="
              w-full bg-[rgb(var(--color-input-bg))] 
              border border-[rgb(var(--color-input-border))]
              rounded-xl px-4 py-3 text-sm 
              text-white 
              placeholder-[rgb(var(--color-muted-500))]
              focus:outline-none 
              focus:border-[rgb(var(--color-primary-light))]
              focus:ring-2 
              focus:ring-[rgb(var(--rgb-primary))]/20
              transition-all
            "
            autoFocus
          />

          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="
              mt-2 
              bg-gradient-to-r from-[rgb(var(--rgb-primary))] to-[rgb(var(--color-secondary))]
              py-3 rounded-xl 
              font-semibold text-white 
              flex items-center justify-center gap-2 
              text-sm md:text-base 
              transition-all 
              hover:scale-[1.03] 
              active:scale-100 
              disabled:opacity-50
              shadow-lg shadow-[rgb(var(--rgb-primary))]/30
              hover:shadow-xl hover:shadow-[rgb(var(--rgb-primary))]/40
            "
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
        <div className="grid grid-cols-3 gap-3 w-full text-xs md:text-sm text-[rgb(var(--color-text-soft))] animate-slide-up">
          <div className="glass rounded-xl p-3 flex flex-col items-center hover:scale-[1.05] transition-all border border-[rgb(var(--color-primary-light))]/20 hover:border-[rgb(var(--color-primary-light))]/40">
            <Target className="w-5 h-5 text-[rgb(var(--color-primary-light))] mb-1" />
            Cele
          </div>
          <div className="glass rounded-xl p-3 flex flex-col items-center hover:scale-[1.05] transition-all border border-[rgb(var(--color-secondary))]/20 hover:border-[rgb(var(--color-secondary))]/40">
            <Activity className="w-5 h-5 text-[rgb(var(--color-secondary))] mb-1" />
            Postępy
          </div>
          <div className="glass rounded-xl p-3 flex flex-col items-center hover:scale-[1.05] transition-all border border-[rgb(var(--color-accent))]/20 hover:border-[rgb(var(--color-accent))]/40">
            <Sparkles className="w-5 h-5 text-[rgb(var(--color-accent))] mb-1" />
            Nawyki
          </div>
        </div>

        <p className="text-xs text-[rgb(var(--color-muted-600))] animate-slide-up delay-200">
          Dołącz do społeczności
        </p>
      </div>
    </div>
  );
}