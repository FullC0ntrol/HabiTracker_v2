import { useState, useEffect, useCallback } from "react";
import { Lock, Delete, ArrowLeft } from "lucide-react";
import { useAuth } from "../../../shared/auth/AuthContext";
import { useLogin } from "../hooks/useLogin";

export default function PinScreen({ onComplete, onBack }) {
  const { username } = useAuth();
  const { login } = useLogin();
  const [pin, setPin] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (pin.length === 4) {
      login(username, pin)
        .then(() => onComplete?.())
        .catch((err) => {
          setError(err.message || "Niepoprawny PIN");
          setPin("");
          setIsShaking(true);
          setTimeout(() => setIsShaking(false), 150);
        });
    }
  }, [pin, username, login, onComplete]);

  const pushDigit = useCallback((num) => {
    setPin((prev) => (prev.length < 4 ? prev + num : prev));
  }, []);

  const handleDelete = useCallback(
    () => setPin((prev) => prev.slice(0, -1)),
    []
  );

  const handleBack = useCallback(() => {
    setPin("");
    setError("");
    onBack?.();
  }, [onBack]);

  useEffect(() => {
    const onKeyDown = (e) => {
      const { key } = e;
      if (/^[0-9]$/.test(key)) return pushDigit(key);
      if (key === "Backspace") return handleDelete();
      if (key === "Escape") return handleBack();
      if (!["Shift", "Alt", "Control", "Meta", "Tab"].includes(key)) {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 150);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [pushDigit, handleDelete, handleBack]);

  const numbers = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
  ];

  return (
    <div className="page-container bg-mesh p-4 sm:p-6 relative overflow-hidden">
      {/* Dekoracyjne tło – podpięte pod primary/secondary/accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-64 sm:w-80 h-64 sm:h-80 rounded-full blur-3xl animate-pulse-slow bg-[rgba(var(--rgb-primary),0.2)]" />
        <div
          className="
            absolute bottom-1/4 left-1/4 w-64 sm:w-80 h-64 sm:h-80
            rounded-full blur-3xl animate-pulse-slow
            bg-[rgba(var(--rgb-secondary),0.18)]
          "
          style={{ animationDelay: "1.5s" }}
        />
        <div
          className="
            absolute top-1/2 left-1/2 w-48 sm:w-64 h-48 sm:h-64
            rounded-full blur-2xl animate-pulse-slow
            bg-[rgba(var(--rgb-accent),0.14)]
          "
          style={{ animationDelay: "3s" }}
        />
      </div>

      {/* Zawartość */}
      <div className="relative z-10 w-full max-w-xs sm:max-w-sm md:max-w-md flex flex-col items-center animate-scale-in">
        {/* Przycisk cofania */}
        <div className="self-start mb-6">
          <button
            type="button"
            onClick={handleBack}
            className="
              inline-flex items-center gap-2 px-4 py-2 rounded-xl
              glass hover:glass-strong
              hover:scale-[1.03] active:scale-95
              transition-all
              border border-[rgba(var(--rgb-white),0.12)]
              hover:border-[rgba(var(--rgb-primary),0.5)]
              text-[color:var(--color-text-base)]
              text-sm sm:text-base
            "
          >
            <ArrowLeft className="w-5 h-5 text-[color:var(--color-primary-300)]" />
            <span>Wróć</span>
          </button>
        </div>

        {/* Nagłówek */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl glass-strong glow-emerald mb-4 animate-float">
            <Lock
              className="w-8 h-8 text-[color:var(--color-primary-300)]"
              strokeWidth={2}
            />
          </div>
          <h2 className="text-2xl font-bold mb-1 text-[color:var(--color-text-base)]">
            Wpisz PIN
          </h2>
          <p className="text-xs text-[color:var(--color-text-soft)]">
            Konto jest tworzone przy pierwszym połączeniu loginu z PINem
          </p>
          {error && (
            <p className="mt-2 text-sm text-[color:var(--color-primary-300)]">
              {error}
            </p>
          )}
        </div>

        {/* PIN – pola */}
        <div
          className={`glass-strong rounded-3xl p-6 mb-6 w-full ${
            isShaking ? "animate-shake" : ""
          }`}
        >
          <div className="flex justify-center gap-3 mb-6">
            {[0, 1, 2, 3].map((i) => {
              const filled = pin.length > i;
              return (
                <div
                  key={i}
                  className={[
                    "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300",
                    filled
                      ? "bg-[linear-gradient(135deg,var(--color-primary),var(--color-secondary))] glow-emerald scale-110"
                      : "bg-[color:var(--color-card-bg)] border border-[color:var(--color-card-border)]",
                  ].join(" ")}
                >
                  {filled && (
                    <div className="w-3 h-3 rounded-full bg-[color:var(--color-text-base)] animate-scale-in" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Klawiatura numeryczna */}
          <div className="space-y-3">
            {numbers.map((row, idx) => (
              <div key={idx} className="flex gap-3 justify-center">
                {row.map((num) => (
                  <button
                    key={num}
                    onClick={() => pushDigit(num)}
                    className="
                      w-20 h-16 rounded-2xl glass
                      font-semibold text-2xl
                      text-[color:var(--color-text-base)]
                      hover:glass-strong
                      hover:scale-105 active:scale-95
                      transition-all duration-200
                      hover:border-[rgba(var(--rgb-primary),0.5)]
                    "
                  >
                    {num}
                  </button>
                ))}
              </div>
            ))}
            <div className="flex gap-3 justify-center">
              <div className="w-20 h-16" />
              <button
                onClick={() => pushDigit("0")}
                className="
                  w-20 h-16 rounded-2xl glass
                  font-semibold text-2xl
                  text-[color:var(--color-text-base)]
                  hover:glass-strong
                  hover:scale-105 active:scale-95
                  transition-all duration-200
                  hover:border-[rgba(var(--rgb-primary),0.5)]
                "
              >
                0
              </button>
              <button
                onClick={handleDelete}
                disabled={pin.length === 0}
                className="
                  w-20 h-16 rounded-2xl glass
                  flex items-center justify-center
                  hover:glass-strong
                  hover:scale-105 active:scale-95
                  transition-all duration-200
                  disabled:opacity-40 disabled:cursor-not-allowed
                  hover:border-[rgba(var(--rgb-primary),0.5)]
                "
              >
                <Delete className="w-6 h-6 text-[color:var(--color-primary-300)]" />
              </button>
            </div>
          </div>
        </div>

        {/* Stopka */}
        <div className="text-center mt-2">
          <p className="text-xs text-[color:var(--color-muted-600)]">
            Twoje dane są szyfrowane i bezpieczne
          </p>
        </div>
      </div>
    </div>
  );
}
