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
      {/* Dekoracyjne tło – korzysta z primary/secondary/accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-6 w-28 h-28 md:w-40 md:h-40 rounded-full blur-3xl animate-pulse-slow bg-[rgba(var(--rgb-primary),0.25)]" />
        <div className="absolute bottom-8 right-8 w-24 h-24 md:w-36 md:h-36 rounded-full blur-2xl animate-pulse-slow delay-2000 bg-[rgba(var(--rgb-secondary),0.22)]" />
        <div className="absolute top-1/2 left-1/2 w-20 h-20 md:w-32 md:h-32 rounded-full blur-2xl animate-pulse-slow delay-4000 bg-[rgba(var(--rgb-accent),0.18)]" />
      </div>

      {/* Zawartość */}
      <div className="relative z-10 w-full max-w-sm md:max-w-md xl:max-w-lg flex flex-col items-center text-center gap-6 md:gap-8 animate-scale-in">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 md:w-24 md:h-24 glass rounded-2xl flex items-center justify-center glow-emerald animate-float">
            <Activity className="w-8 h-8 md:w-10 md:h-10 text-[color:var(--color-primary-300)]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight text-[color:var(--color-text-base)]">
            Habi
            <span className="text-[color:var(--color-primary-400)] drop-shadow-[0_0_10px_rgba(var(--rgb-primary),0.6)]">
              Tracker
            </span>
          </h1>
          <p className="text-sm md:text-base text-[color:var(--color-text-muted)]">
            Twoja rutyna, Twoje postępy
          </p>
        </div>

        {/* Formularz */}
        <form
          onSubmit={handleSubmit}
          className="glass-strong rounded-2xl p-6 w-full flex flex-col gap-4 animate-scale-in"
        >
          <label className="flex items-center gap-2 text-sm font-medium text-[color:var(--color-text-soft)]">
            <User className="w-4 h-4 text-[color:var(--color-primary-300)]" />
            Twój login
          </label>

          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Wprowadź login..."
            className="
              w-full rounded-xl px-4 py-3 text-sm
              bg-[color:var(--color-input-bg)]
              border border-[color:var(--color-input-border)]
              text-[color:var(--color-text-base)]
              placeholder-[color:var(--color-muted-500)]
              focus:outline-none
              focus:border-[rgba(var(--rgb-primary),0.7)]
              focus:ring-2
              focus:ring-[rgba(var(--rgb-primary),0.2)]
              transition
            "
            autoFocus
          />

          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="
              mt-2 py-3 rounded-xl font-semibold
              flex items-center justify-center gap-2
              text-sm md:text-base
              bg-[linear-gradient(135deg,var(--color-primary),var(--color-secondary))]
              text-[color:var(--color-text-base)]
              shadow-[0_0_20px_rgba(var(--rgb-primary),0.55)]
              transition
              hover:scale-[1.03]
              active:scale-100
              disabled:opacity-50
            "
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 rounded-full animate-spin border-[color:var(--color-text-base)] border-t-transparent" />
                Ładowanie...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[color:var(--color-primary-300)]" />
                Rozpocznij
              </>
            )}
          </button>
        </form>

        {/* Feature karty */}
        <div className="grid grid-cols-3 gap-3 w-full text-xs md:text-sm text-[color:var(--color-text-soft)] animate-slide-up">
          <div className="glass rounded-xl p-3 flex flex-col items-center hover:scale-[1.05] transition-all">
            <Target className="w-5 h-5 mb-1 text-[color:var(--color-primary-300)]" />
            Cele
          </div>
          <div className="glass rounded-xl p-3 flex flex-col items-center hover:scale-[1.05] transition-all">
            <Activity className="w-5 h-5 mb-1 text-[color:var(--color-secondary-400)]" />
            Postępy
          </div>
          <div className="glass rounded-xl p-3 flex flex-col items-center hover:scale-[1.05] transition-all">
            <Sparkles className="w-5 h-5 mb-1 text-[color:var(--color-accent)]" />
            Nawyki
          </div>
        </div>

        <p className="text-xs text-[color:var(--color-muted-600)] animate-slide-up delay-200">
          Dołącz do społeczności
        </p>
      </div>
    </div>
  );
}
