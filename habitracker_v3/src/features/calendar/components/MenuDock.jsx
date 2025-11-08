import { useRef, useEffect, useState, useMemo } from "react";
import { Dumbbell, Flame, Loader2 } from "lucide-react";

/**
 * MenuDock - Stylowy dock z 4 opcjami wyskakującymi tuż nad przyciskiem
 */
export function MenuDock({
  menuItems = [],
  showMenu,
  setShowMenu,
  onMainAction,
}) {
  const ref = useRef(null);
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0); // 0..100
  const [isLoading, setIsLoading] = useState(false);
  
  // STAŁE KONFIGURACYJNE
  const HOLD_MS = 600; // Czas do aktywacji akcji (600ms)
  const PRESS_START_DELAY = 150; // DODANE: Opóźnienie startu paska progressu (150ms)
  const BUTTON_SIZE = 56; // Wymiar głównego przycisku (w-14 h-14)

  // Używamy useMemo dla skróconej listy
  const visibleMenuItems = useMemo(() => menuItems.slice(0, 4), [menuItems]);

  // Zamykanie po kliknięciu poza dock (bez zmian)
  useEffect(() => {
    const handleOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setShowMenu(false);
    };
    // Używamy pointerdown dla lepszej obsługi dotyku
    document.addEventListener("pointerdown", handleOutside);
    return () => document.removeEventListener("pointerdown", handleOutside);
  }, [setShowMenu]);

  // Pozycjonowanie bocznych przycisków
  const getStyle = (index, open) => {
    const spread = 60; // ZMNIEJSZONE: Bliższe rozmieszczenie poziome
    const centerIndex = (visibleMenuItems.length - 1) / 2;
    const offsetX = (index - centerIndex) * spread; 
    const offsetY = BUTTON_SIZE / 2 + 30; // ZMNIEJSZONE: Pozycjonowanie tuż nad przyciskiem
    
    return {
      transform: open
        ? `translate(calc(-50% + ${offsetX}px), -${offsetY}px) scale(1)`
        : `translate(calc(-50% + ${offsetX}px), 0) scale(0.7)`,
      opacity: open ? 1 : 0,
      // Lepsza animacja z opóźnieniem
      transition: `all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.04}s`,
      pointerEvents: open ? "auto" : "none",
    };
  };

  // ZAAWANSOWANA LOGIKA LONG-PRESSU z debouncem i RAF
  const downTs = useRef(0);
  const rafId = useRef(null);
  const longFired = useRef(false);
  const startDelayTimer = useRef(null); // Timer dla opóźnienia startu

  const stopRaf = () => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = null;
  };
  
  const tick = (ts) => {
    const elapsed = ts - downTs.current - PRESS_START_DELAY; // Odejmujemy opóźnienie
    const p = Math.min(1, Math.max(0, elapsed) / HOLD_MS);
    setHoldProgress(p * 100);
    
    if (p >= 1 && !longFired.current) {
      longFired.current = true;
      setIsHolding(false);
      setHoldProgress(0);
      stopRaf();

      // Uruchomienie akcji ze stanem ładowania
      setIsLoading(true);
      Promise.resolve(onMainAction?.())
        .finally(() => setIsLoading(false));
      return;
    }
    rafId.current = requestAnimationFrame(tick);
  };

  const startPress = (e) => {
    if (isLoading || longFired.current) return;
    
    e.preventDefault();
    longFired.current = false;
    downTs.current = performance.now();
    
    // Ustawienie timera, który po opóźnieniu uruchomi progress
    startDelayTimer.current = setTimeout(() => {
        setIsHolding(true);
        stopRaf();
        rafId.current = requestAnimationFrame(tick);
    }, PRESS_START_DELAY);
  };

  const cancelPress = () => {
    if (isLoading) return;
    
    // ZAWSZE czyścimy oba timery
    clearTimeout(startDelayTimer.current);
    stopRaf();
    
    // Jeśli puściliśmy przycisk ZANIM timer długiego przycisku się odpalił
    // i nie wystrzeliła akcja (longFired), to jest to TAP.
    if (isHolding && !longFired.current) {
        // TAP: Zamykamy lub otwieramy menu
        setShowMenu((prev) => !prev);
    }
    
    setIsHolding(false);
    setHoldProgress(0);
    longFired.current = false;
  };

  return (
    <div
      ref={ref}
      className="fixed bottom-0 left-0 right-0 z-[9999] flex justify-center items-end"
      style={{
        paddingBottom: "max(8px, env(safe-area-inset-bottom, 0px))",
        height: '90px', // Stała wysokość paska
      }}
      aria-label="Menu dock"
    >
      {/* Rozmyte tło od dołu ekranu - ULEPSZONE WIZUALNIE */}
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: `linear-gradient(
            to top,
            rgba(0, 0, 0, 0.7) 0%,
            rgba(0, 0, 0, 0.4) 50%,
            transparent 100%
          )`,
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          // Lepsza maska, żeby przycisk "wystawał"
          maskImage: 'linear-gradient(to top, black 65%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to top, black 65%, transparent 100%)',
        }}
      />
      
      <div className="relative w-full max-w-md h-full flex justify-center items-end pb-2">
        
        {/* Boczne przyciski */}
        {visibleMenuItems.map((item, i) => {
          const Icon = item.icon || Dumbbell;
          const style = getStyle(i, showMenu);
          
          return (
            <div
              key={item.label}
              style={style}
              // Zmieniona klasa, aby pozycjonowanie było łatwiejsze
              className="absolute left-1/2 bottom-0 flex flex-col items-center z-20" 
            >
              <button
                onClick={() => {
                  item.onClick?.();
                  setShowMenu(false);
                }}
                className="
                  w-10 h-10 rounded-lg
                  bg-gray-800/90 border border-white/10
                  flex items-center justify-center
                  shadow-xl shadow-black/60
                  backdrop-blur-xl
                  hover:scale-110 hover:shadow-cyan-500/30
                  active:scale-100
                  transition-all duration-300
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/80
                  group
                "
              >
                <Icon 
                  className="w-4 h-4 text-cyan-300 group-hover:text-cyan-200 transition-colors" 
                  strokeWidth={2.2}
                />
              </button>
              
              {/* Elegancki podpis bez tła */}
              <span
                className="
                  mt-1.5 text-[11px] font-semibold leading-none
                  bg-gradient-to-r from-cyan-200 to-cyan-100 bg-clip-text text-transparent
                  drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] 
                "
              >
                {item.label}
              </span>
            </div>
          );
        })}

        {/* Główny przycisk z progress ring */}
        <div className="relative z-30 transform translate-y-2"> {/* Lekkie podniesienie dla efektu wystawania */}
          {/* Progress ring */}
          {isHolding && holdProgress > 0 && (
            <div
              className="absolute inset-[-5px] rounded-full"
              style={{
                // holdProgress jest teraz 0-100
                background: `conic-gradient(#22d3ee ${holdProgress}%, rgba(255,255,255,0.12) ${holdProgress}%)`,
                WebkitMask: "radial-gradient(farthest-side, transparent 65%, black 66%)",
                mask: "radial-gradient(farthest-side, transparent 65%, black 66%)",
              }}
              aria-hidden
            />
          )}

          {/* Overlay ładowania */}
          {isLoading && (
            <div className="absolute inset-[-5px] rounded-full grid place-items-center bg-black/30 backdrop-blur-sm">
              <Loader2 className="w-5 h-5 text-cyan-200 animate-spin" />
            </div>
          )}

          <button
            onPointerDown={startPress}
            onPointerUp={cancelPress}
            onPointerLeave={cancelPress}
            onPointerCancel={cancelPress}
            onClick={(e) => {
                // Ta funkcja jest używana tylko, gdy tap nie został przekształcony w long-press
                if (!longFired.current) {
                    setShowMenu((prev) => !prev);
                }
            }}
            disabled={isLoading}
            className={`
              relative w-14 h-14 rounded-full grid place-items-center
              bg-gradient-to-br from-cyan-500 to-blue-600
              border-2 border-white/20
              shadow-[0_8px_20px_-4px_rgba(0,200,255,0.4)]
              transition-all duration-300 ease-out
              focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60
              group
              ${showMenu ? "scale-105" : "hover:scale-105"}
              ${isHolding ? "scale-105 brightness-110" : ""}
              ${isLoading ? "scale-95 opacity-90 cursor-not-allowed" : "active:scale-95"}
            `}
            aria-expanded={showMenu}
            aria-label={showMenu ? "Zwiń menu" : "Otwórz menu / Przytrzymaj (1s) aby rozpocząć trening"}
          >
            <div className="absolute inset-1.5 rounded-full bg-cyan-400/10 blur-sm group-hover:bg-cyan-400/15 transition-all" />
            
            {isLoading ? (
              <Loader2 className="w-6 h-6 text-white animate-spin relative z-10" />
            ) : showMenu ? (
              <Flame className="w-6 h-6 text-white relative z-10" strokeWidth={2.4} />
            ) : (
              <Dumbbell className="w-6 h-6 text-white relative z-10" strokeWidth={2.6} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}