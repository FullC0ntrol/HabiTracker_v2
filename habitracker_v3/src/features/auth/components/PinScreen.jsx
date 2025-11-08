// src/features/auth/components/PinScreen.jsx
import { useState, useEffect, useCallback } from "react";
import { Lock, Delete, ArrowLeft } from "lucide-react";
import { useAuth } from "../../../shared/auth/AuthContext";
import { useLogin } from "../hooks/useLogin";

/**
 * Ekran PIN – krok 2.
 * Użytkownik wpisuje 4-cyfrowy PIN, który jest wysyłany do backendu.
 */
export default function PinScreen({ onComplete, onBack }) {
  const { username } = useAuth();
  const { login } = useLogin();

  const [pin, setPin] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const [error, setError] = useState("");

  // 🔹 Automatyczne logowanie po wpisaniu 4 cyfr
  useEffect(() => {
    if (pin.length === 4) {
      login(username, pin)
        .then(() => {
          onComplete?.();
        })
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

  const handleDelete = useCallback(() => {
    setPin((prev) => prev.slice(0, -1));
  }, []);

  const handleBack = useCallback(() => {
    setPin("");
    setError("");
    onBack?.();
  }, [onBack]);

  // 🔹 Obsługa klawiatury
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
    <div className="min-h-screen w-full bg-mesh flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* 🔵 Dekoracyjne tło */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div
          className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow"
          style={{ animationDelay: "1.5s" }}
        />
      </div>

      <div className="w-full max-w-sm relative z-10 animate-scale-in">
        {/* 🔙 Przycisk cofania */}
        <div className="mb-3">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl glass hover:glass-strong hover:scale-[1.02] active:scale-95 transition-all text-white border border-white/10 hover:border-cyan-400/30"
          >
            <ArrowLeft className="w-5 h-5 text-cyan-400" />
            <span className="text-sm">Wróć</span>
          </button>
        </div>

        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full glass-strong glow-cyan mb-4 animate-float">
            <Lock className="w-8 h-8 text-cyan-400" strokeWidth={2} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">Wpisz PIN</h2>
          <p className="text-gray-400 text-xs">
            Konto jest tworzone przy pierwszym połączeniu Loginu z Pinem
          </p>
          {error && <p className="mt-2 text-cyan-400 text-sm">{error}</p>}
        </div>

        <div className={`glass-strong rounded-3xl p-6 mb-6 ${isShaking ? "animate-shake" : ""}`}>
          <div className="flex justify-center gap-3 mb-6">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300
                  ${pin.length > i
                    ? "bg-linear-to-br from-cyan-500 to-blue-600 glow-cyan scale-110"
                    : "bg-white/5 border border-white/10"}
                  ${pin.length === i && pin.length < 4
                    ? "ring-2 ring-cyan-400 ring-offset-2 ring-offset-transparent"
                    : ""}`}
              >
                {pin.length > i && (
                  <div className="w-3 h-3 rounded-full bg-white animate-scale-in" />
                )}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            {numbers.map((row, idx) => (
              <div key={idx} className="flex gap-2 justify-center">
                {row.map((num) => (
                  <button
                    key={num}
                    onClick={() => pushDigit(num)}
                    className="w-16 h-16 rounded-2xl glass font-semibold text-2xl text-white hover:glass-strong hover:scale-105 active:scale-95 transition-all duration-200 hover:border-cyan-400/30"
                  >
                    {num}
                  </button>
                ))}
              </div>
            ))}
            <div className="flex gap-2 justify-center">
              <div className="w-16 h-16" />
              <button
                onClick={() => pushDigit("0")}
                className="w-16 h-16 rounded-2xl glass font-semibold text-2xl text-white hover:glass-strong hover:scale-105 active:scale-95 transition-all duration-200 hover:border-cyan-400/30"
              >
                0
              </button>
              <button
                onClick={handleDelete}
                disabled={pin.length === 0}
                className="w-16 h-16 rounded-2xl glass flex items-center justify-center hover:glass-strong hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 hover:border-cyan-400/30"
              >
                <Delete className="w-6 h-6 text-cyan-400" />
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-2">
          <p className="text-gray-500 text-xs">Your data is encrypted and secure</p>
        </div>
      </div>
    </div>
  );
}
