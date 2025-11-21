/* LoadingScreen – Wersja zintegrowana z Twoim index.css */
import React from "react";

export function LoadingScreen({ message = "Wczytuję Twoje nawyki..." }) {
  return (
    // Używamy klasy .bg-mesh z Twojego CSS dla idealnego tła
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-mesh text-[var(--color-text-base)] overflow-hidden font-sans">
      
      {/* --- TŁO (Dodatkowe efekty ambientowe zgodne z paletą) --- */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Orb Primary (Blue) */}
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] bg-[rgba(var(--rgb-primary),0.15)] blur-[120px] rounded-full mix-blend-screen animate-pulse-slow" />
        {/* Orb Secondary (Cyan) */}
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-[rgba(var(--rgb-secondary),0.1)] blur-[100px] rounded-full mix-blend-screen" />
      </div>

      {/* --- GŁÓWNA ZAWARTOŚĆ --- */}
      <div className="relative z-10 flex flex-col items-center">
        
        {/* LOGO CONTAINER */}
        <div className="relative mb-8 group">
          {/* Glow pod logo (korzysta z --rgb-primary) */}
          <div className="absolute inset-0 bg-[rgba(var(--rgb-primary),0.4)] blur-2xl rounded-full opacity-0 group-hover:opacity-50 transition-opacity duration-700 animate-glow-pulse" />
          
          {/* Ikona / Logo */}
          <div className="relative w-24 h-24 flex items-center justify-center">
             {/* Tło ikony - Gradient od Primary Dark do Primary */}
             <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-primary-dark)] to-[var(--color-primary)] rounded-2xl shadow-[0_0_30px_rgba(var(--rgb-primary),0.3)] transform rotate-3 transition-transform duration-1000 ease-out" />
             
             {/* Wewnętrzny kontener - ciemny granat */}
             <div className="absolute inset-0 bg-[var(--color-bg-grad-from)] rounded-2xl m-[2px] flex items-center justify-center border border-[rgba(var(--rgb-white),0.1)]">
                {/* Checkmark SVG */}
                <svg 
                  className="w-12 h-12 text-[var(--color-text-base)] drop-shadow-md" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  strokeWidth="3"
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M5 13l4 4L19 7" />
                </svg>
             </div>
          </div>
        </div>

        {/* NAZWA APLIKACJI */}
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          {/* Gradient tekstu wykorzystujący primary-300 dla efektu połysku */}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-text-base)] via-[var(--color-primary-300)] to-[var(--color-text-base)] animate-shimmer bg-[length:200%_auto]">
            HabiTracker
          </span>
        </h1>

        {/* WIADOMOŚĆ ŁADOWANIA */}
        <p className="text-sm text-[var(--color-text-muted)] font-medium tracking-wide uppercase text-[10px] mb-8">
          {message}
        </p>

        {/* MINIMALISTYCZNY PASEK POSTĘPU */}
        <div className="relative w-48 h-1 bg-[rgba(var(--rgb-white),0.08)] rounded-full overflow-hidden">
          {/* Rozmyty ogon paska - Primary Color */}
          <div className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent rounded-full animate-loading-slide blur-[2px]" />
          {/* Główny pasek - Primary Color */}
          <div className="absolute top-0 left-0 h-full w-1/3 bg-[var(--color-primary)] rounded-full animate-loading-slide" />
        </div>

      </div>

      {/* --- CSS DLA ANIMACJI LOKALNYCH (te, których nie ma w globalnym CSS) --- */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        .animate-shimmer {
          animation: shimmer 3s linear infinite;
        }

        @keyframes loading-slide {
          0% { left: -40%; }
          100% { left: 100%; }
        }
        .animate-loading-slide {
          animation: loading-slide 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
        .animate-glow-pulse {
          animation: glow-pulse 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default LoadingScreen;