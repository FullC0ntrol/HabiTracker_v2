import { useRef, useEffect, useState, useMemo } from "react";
import { Dumbbell, Loader2, Sparkles, X } from "lucide-react";
// 1. Importujemy Framer Motion
import { motion, AnimatePresence } from "framer-motion";

export function MenuDock({ menuItems = [], showMenu, setShowMenu, onMainAction }) {
  const ref = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const holdTimerRef = useRef(null); // Timer dla long-press

  const HOLD_MS = 600; // Czas przytrzymania
  const BUTTON_SIZE = 64; // Zwiększony rozmiar głównego przycisku

  const visibleItems = useMemo(() => menuItems.slice(0, 4), [menuItems]);

  // Klik poza menu — zamyka
  useEffect(() => {
    const handleOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("pointerdown", handleOutside);
    return () => document.removeEventListener("pointerdown", handleOutside);
  }, [setShowMenu]);

  // === UPROSZCZONA I NIEZAWODNA LOGIKA LONG-PRESS ===
  const startPress = (e) => {
    if (isLoading) return;
    e.preventDefault(); 

    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);

    holdTimerRef.current = setTimeout(() => {
      setIsLoading(true);
      holdTimerRef.current = null; 
      Promise.resolve(onMainAction?.()).finally(() => {
        setIsLoading(false);
      });
    }, HOLD_MS);
  };

  const cancelPress = () => {
    if (isLoading) return;

    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
      setShowMenu((p) => !p); // Otwórz/zamknij menu
    }
  };
  // ===================================================

  // Warianty dla animacji bocznych przycisków
  const menuItemVariants = {
    hidden: (i) => ({
      y: 20,
      x: "-50%",
      opacity: 0,
    }),
    visible: (i) => {
      const spread = 85;
      const center = (visibleItems.length - 1) / 2;
      const offsetX = (i - center) * spread;
      const offsetY = BUTTON_SIZE / 2 + 40; // bazuje na 64px
      return {
        y: -offsetY,
        x: `calc(-50% + ${offsetX}px)`,
        opacity: 1,
        transition: {
          type: "spring",
          damping: 12,
          stiffness: 150,
          delay: i * 0.05,
        },
      };
    },
    exit: (i) => ({
      y: 20,
      opacity: 0,
      transition: {
        duration: 0.2,
        delay: (visibleItems.length - 1 - i) * 0.03,
      },
    }),
  };

  /* === Render === */
  return (
    <div
      ref={ref}
      className="fixed bottom-0 left-0 right-0 z-[9999] flex justify-center items-end pointer-events-none"
      style={{
        paddingBottom: "max(12px, env(safe-area-inset-bottom, 0px))",
        height: "120px", // Zwiększona wysokość na efekty
      }}
    >
      {/* Tło z gradientem */}
      <div
        className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
        style={{
          background: `linear-gradient(to top, rgba(var(--rgb-primary), 0.7) 0%, rgba(var(--rgb-primary), 0.3) 40%, transparent 80%)`,
          backdropFilter: "blur(8px) saturate(140%)",
          WebkitBackdropFilter: "blur(8px) saturate(140%)",
          maskImage: "linear-gradient(to top, black 40%, transparent 85%)",
        }}
      />

      <div className="relative w-full max-w-lg h-full flex justify-center items-end pb-2 pointer-events-auto">
        {/* 🔹 Boczne przyciski (Framer Motion) */}
        <AnimatePresence>
          {showMenu &&
            visibleItems.map((item, i) => {
              const Icon = item.icon || Dumbbell;
              return (
                <motion.div
                  key={item.label}
                  custom={i}
                  variants={menuItemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute left-1/2 bottom-0 flex flex-col items-center z-20"
                >
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      item.onClick?.();
                      setShowMenu(false);
                    }}
                    className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-[color:var(--color-primary)]/80 to-[color:var(--color-secondary)]/80 border border-[color:var(--color-primary-light)]/30 backdrop-blur-xl flex items-center justify-center 
                      shadow-lg shadow-black/30 group"
                  >
                    <div className="absolute inset-0 rounded-2xl bg-[color:var(--color-primary)]/20 blur-md group-hover:bg-[color:var(--color-primary-light)]/30 transition-all duration-300" />
                    <Icon
                      className={`w-5 h-5 relative z-10 ${
                        item.color || "text-[color:var(--color-primary-light)]"
                      }`}
                      strokeWidth={2.2}
                    />
                  </motion.button>
                  <span className="mt-1.5 text-[11px] font-semibold text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]">
                    {item.label}
                  </span>
                </motion.div>
              );
            })}
        </AnimatePresence>

        {/* 🔘 Główny przycisk (Większy i "palący się") */}
        <div className="relative z-30 translate-y-1">
          
          {/* Efekt "palenia się" (glow) - NAJMOCNIEJSZY EFEKT */}
          <div className="absolute inset-0 blur-xl bg-[color:var(--color-primary)]/40 rounded-full -z-10 animate-pulse-slow" />
          
          {/* Pulsująca aura (używa klas z index.css) */}
          <div className="absolute inset-0">
            <div className="absolute inset-[-6px] bg-[color:var(--color-primary)]/20 rounded-full animate-ping-slow" />
            <div className="absolute inset-[-3px] bg-[color:var(--color-primary-light)]/30 rounded-full animate-pulse-slow" />
          </div>

          {/* Overlay ładowania */}
          {isLoading && (
            <div className="absolute inset-[-4px] rounded-full grid place-items-center bg-[color:var(--color-primary-dark)]/40 backdrop-blur-sm z-40">
              <Loader2 className="w-6 h-6 text-[color:var(--color-primary-light)] animate-spin" />
            </div>
          )}

          <motion.button
            onPointerDown={startPress}
            onPointerUp={cancelPress}
            onPointerLeave={cancelPress} 
            onPointerCancel={cancelPress} 
            disabled={isLoading}
            className={`relative w-16 h-16 rounded-full grid place-items-center
              bg-gradient-to-br from-[color:var(--color-primary-light)] via-[color:var(--color-primary)] to-[color:var(--color-primary-dark)]
              border-[2.5px] border-[color:var(--color-primary-light)]/40
              shadow-[0_0_30px_rgba(var(--rgb-primary),0.5),inset_0_1px_0_rgba(255,255,255,0.3)]
              transition-all duration-200 ease-out
              animate-soft-pulse
              ${isLoading ? "opacity-80 cursor-wait" : ""}
            `}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            animate={{ scale: showMenu || isLoading ? 1.05 : 1 }}
            aria-expanded={showMenu}
          >
            {/* Inner glow */}
            <div className="absolute inset-1.5 rounded-full bg-gradient-to-br from-[color:var(--color-primary-light)]/20 to-transparent" />

            {/* Ikona (zmieniająca się płynnie) */}
            <AnimatePresence mode="popLayout">
              {isLoading ? (
                <motion.div
                  key="loader"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="absolute"
                >
                  <Loader2 className="w-7 h-7 text-white animate-spin" />
                </motion.div>
              ) : showMenu ? (
                <motion.div
                  key="close"
                  initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
                  className="absolute"
                >
                  <X className="w-7 h-7 text-white" strokeWidth={2.5} />
                </motion.div>
              ) : (
                <motion.div
                  key="icon"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="absolute"
                >
                  <Dumbbell className="w-7 h-7 text-white" strokeWidth={2.5} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Pływające orby (Wydajne z Framer Motion) */}
          <AnimatePresence>
            {showMenu && (
              <>
                <motion.div
                  className="absolute -top-1 -left-1 w-2 h-2 bg-[color:var(--color-primary-light)] rounded-full blur-sm"
                  animate={{ y: [0, -6, 0], x: [0, 3, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  exit={{ opacity: 0, scale: 0 }}
                />
                <motion.div
                  className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-[color:var(--color-primary)] rounded-full blur-sm"
                  animate={{ y: [0, -4, 0], x: [0, -2, 0] }}
                  transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 0.5 }}
                  exit={{ opacity: 0, scale: 0 }}
                />
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}