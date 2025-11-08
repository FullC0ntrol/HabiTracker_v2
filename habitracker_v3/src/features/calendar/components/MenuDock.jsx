import { useRef, useEffect, useState, useMemo } from "react";
import { Dumbbell, Flame, Loader2, Sparkles } from "lucide-react";

export function MenuDock({ menuItems = [], showMenu, setShowMenu, onMainAction }) {
  const ref = useRef(null);
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [particles, setParticles] = useState([]);

  const HOLD_MS = 600;
  const PRESS_DELAY = 150;
  const BUTTON_SIZE = 64;

  const visibleItems = useMemo(() => menuItems.slice(0, 4), [menuItems]);

  // Particle system
  useEffect(() => {
    if (!showMenu) return;

    const interval = setInterval(() => {
      const newParticle = {
        id: Math.random(),
        x: 50 + (Math.random() - 0.5) * 20,
        y: 50 + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 4,
        vy: -Math.random() * 3 - 1,
        life: 1,
        size: Math.random() * 4 + 2,
      };
      setParticles(prev => [...prev.slice(-15), newParticle]);
    }, 200);

    return () => clearInterval(interval);
  }, [showMenu]);

  // Update particles
  useEffect(() => {
    const updateParticles = () => {
      setParticles(prev => 
        prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            life: p.life - 0.02,
            vy: p.vy + 0.1, // gravity
          }))
          .filter(p => p.life > 0 && p.y < 120)
      );
    };

    const interval = setInterval(updateParticles, 50);
    return () => clearInterval(interval);
  }, []);

  // Klik poza menu — zamyka
  useEffect(() => {
    const handleOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setShowMenu(false);
    };
    document.addEventListener("pointerdown", handleOutside);
    return () => document.removeEventListener("pointerdown", handleOutside);
  }, [setShowMenu]);

  // Pozycjonowanie bocznych przycisków
  const getStyle = (index, open) => {
    const spread = 85;
    const center = (visibleItems.length - 1) / 2;
    const offsetX = (index - center) * spread;
    const offsetY = BUTTON_SIZE / 2 + 40;
    return {
      transform: open
        ? `translate(calc(-50% + ${offsetX}px), -${offsetY}px) scale(1)`
        : `translate(calc(-50% + ${offsetX}px), 0) scale(0.7)`,
      opacity: open ? 1 : 0,
      transition: `all 0.45s cubic-bezier(0.25,1,0.5,1) ${index * 0.06}s`,
      pointerEvents: open ? "auto" : "none",
    };
  };

  // Long-press logic
  const downTs = useRef(0);
  const rafId = useRef(null);
  const longFired = useRef(false);
  const delayTimer = useRef(null);

  const stopRaf = () => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = null;
  };

  const tick = (ts) => {
    const elapsed = ts - downTs.current - PRESS_DELAY;
    const p = Math.min(1, Math.max(0, elapsed) / HOLD_MS);
    setHoldProgress(p * 100);

    if (p >= 1 && !longFired.current) {
      longFired.current = true;
      setIsHolding(false);
      setHoldProgress(0);
      stopRaf();
      setIsLoading(true);
      Promise.resolve(onMainAction?.()).finally(() => {
        setIsLoading(false);
        longFired.current = false;
      });
    } else {
      rafId.current = requestAnimationFrame(tick);
    }
  };

  const startPress = (e) => {
    if (isLoading) return;
    e.preventDefault();
    longFired.current = false;
    downTs.current = performance.now();
    delayTimer.current = setTimeout(() => {
      setIsHolding(true);
      stopRaf();
      rafId.current = requestAnimationFrame(tick);
    }, PRESS_DELAY);
  };

  const cancelPress = () => {
    if (isLoading) return;
    clearTimeout(delayTimer.current);
    stopRaf();
    if (!longFired.current) setShowMenu((p) => !p);
    setIsHolding(false);
    setHoldProgress(0);
  };

  /* === Render === */
  return (
    <div
      ref={ref}
      className="fixed bottom-0 left-0 right-0 z-[9999] flex justify-center items-end pointer-events-none"
      style={{
        paddingBottom: "max(12px, env(safe-area-inset-bottom, 0px))",
        height: "80px",
      }}
    >
      {/* Tło z REDUKOWANYM efektem mgły */}
      <div
        className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
        style={{
          background: `linear-gradient(to top, rgba(6, 78, 59, 0.7) 0%, rgba(6, 95, 70, 0.3) 40%, transparent 80%)`,
          backdropFilter: "blur(8px) saturate(140%)",
          WebkitBackdropFilter: "blur(8px) saturate(140%)",
          maskImage: "linear-gradient(to top, black 40%, transparent 85%)",
        }}
      />

      <div className="relative w-full max-w-lg h-full flex justify-center items-end pb-2 pointer-events-auto">
        {/* 🔹 Boczne przyciski */}
        {visibleItems.map((item, i) => {
          const Icon = item.icon || Dumbbell;
          const style = getStyle(i, showMenu);
          return (
            <div
              key={item.label}
              style={style}
              className="absolute left-1/2 bottom-0 flex flex-col items-center z-20"
            >
              <button
                onClick={() => {
                  item.onClick?.();
                  setShowMenu(false);
                }}
                className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-800/80 to-green-900/80 border border-emerald-400/30 backdrop-blur-xl flex items-center justify-center 
                  hover:border-emerald-300/50 hover:shadow-emerald-500/40 hover:scale-110 active:scale-95 transition-all duration-300 group"
              >
                {/* Shine effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-transparent via-emerald-200/20 to-transparent transition-opacity duration-700" />
                
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-emerald-400/20 blur-md group-hover:bg-emerald-300/30 transition-all duration-300" />
                
                <Icon className={`w-5 h-5 relative z-10 ${item.color || 'text-emerald-300'}`} strokeWidth={2.2} />
              </button>
              <span className="mt-1 text-[11px] font-semibold bg-gradient-to-r from-emerald-200 to-green-200 bg-clip-text text-transparent drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">
                {item.label}
              </span>
            </div>
          );
        })}

        {/* 🔘 Główny przycisk z efektami */}
        <div className="relative z-30 translate-y-1">
          {/* Particle system */}
          {particles.map(particle => (
            <div
              key={particle.id}
              className="absolute w-1 h-1 rounded-full bg-gradient-to-br from-emerald-300 to-green-400 pointer-events-none"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                opacity: particle.life,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                filter: `blur(${particle.size / 2}px)`,
                transform: `translate(-50%, -50%)`,
              }}
            />
          ))}

          {/* Pulsująca aura */}
          <div className="absolute inset-0">
            <div className="absolute inset-[-6px] bg-emerald-400/20 rounded-full animate-ping-slow" style={{ animationDuration: '3s' }} />
            <div className="absolute inset-[-3px] bg-emerald-300/30 rounded-full animate-pulse-slow" />
          </div>

          {/* Neon aura */}
          <div className="absolute inset-0 blur-xl bg-emerald-400/20 rounded-full -z-10 animate-pulse-slow" />

          {/* Ring progresu */}
          {isHolding && holdProgress > 0 && (
            <div
              className="absolute inset-[-4px] rounded-full"
              style={{
                background: `conic-gradient(#10b981 ${holdProgress}%, rgba(34, 197, 94, 0.15) ${holdProgress}%)`,
                WebkitMask: "radial-gradient(farthest-side, transparent 65%, black 66%)",
              }}
            />
          )}

          {/* Overlay ładowania */}
          {isLoading && (
            <div className="absolute inset-[-4px] rounded-full grid place-items-center bg-emerald-900/40 backdrop-blur-sm">
              <Loader2 className="w-5 h-5 text-emerald-200 animate-spin" />
            </div>
          )}

          <button
            onPointerDown={startPress}
            onPointerUp={cancelPress}
            onPointerLeave={cancelPress}
            onPointerCancel={cancelPress}
            disabled={isLoading}
            className={`relative w-14 h-14 rounded-full grid place-items-center
              bg-gradient-to-br from-emerald-400 via-emerald-500 to-green-500
              border-[2.5px] border-emerald-300/40
              shadow-[0_0_30px_rgba(16,185,129,0.5),inset_0_1px_0_rgba(255,255,255,0.3)]
              transition-all duration-300 ease-out
              ${showMenu ? "scale-105 shadow-[0_0_40px_rgba(16,185,129,0.7)]" : "hover:scale-110"}
              ${isHolding ? "brightness-110 shadow-[0_0_35px_rgba(34,197,94,0.7)]" : ""}
              ${isLoading ? "opacity-80 cursor-wait" : "active:scale-95"}
              animate-soft-pulse
            `}
            aria-expanded={showMenu}
          >
            {/* Inner glow */}
            <div className="absolute inset-1.5 rounded-full bg-gradient-to-br from-emerald-200/20 to-transparent" />
            
            {/* Sparkle effects */}
            {showMenu && (
              <>
                <Sparkles className="absolute -top-1 -right-1 w-2.5 h-2.5 text-emerald-200 animate-bounce" />
                <Sparkles className="absolute -bottom-1 -left-1 w-2.5 h-2.5 text-emerald-200 animate-bounce delay-300" />
              </>
            )}

            {isLoading ? (
              <Loader2 className="w-6 h-6 text-white animate-spin relative z-10" />
            ) : showMenu ? (
              <Flame className="w-6 h-6 text-white relative z-10" strokeWidth={2.3} />
            ) : (
              <Dumbbell className="w-6 h-6 text-white relative z-10" strokeWidth={2.5} />
            )}
          </button>

          {/* Floating energy orbs */}
          {showMenu && (
            <>
              <div className="absolute -top-1 -left-1 w-2 h-2 bg-emerald-300 rounded-full blur-sm animate-float-orb-1" />
              <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-green-300 rounded-full blur-sm animate-float-orb-2" />
              <div className="absolute -bottom-1 left-3 w-2 h-2 bg-emerald-200 rounded-full blur-sm animate-float-orb-3" />
            </>
          )}
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes soft-pulse {
          0%, 100% { 
            box-shadow: 0 0 30px rgba(16, 185, 129, 0.5),
                       inset 0 1px 0 rgba(255, 255, 255, 0.3);
          }
          50% { 
            box-shadow: 0 0 40px rgba(16, 185, 129, 0.7),
                       0 0 60px rgba(16, 185, 129, 0.3),
                       inset 0 1px 0 rgba(255, 255, 255, 0.4);
          }
        }
        @keyframes float-orb-1 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.7; }
          33% { transform: translate(-1px, -2px) scale(1.1); opacity: 1; }
          66% { transform: translate(1px, -3px) scale(0.9); opacity: 0.8; }
        }
        @keyframes float-orb-2 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.6; }
          33% { transform: translate(2px, -1px) scale(1.2); opacity: 0.9; }
          66% { transform: translate(-1px, -2px) scale(0.8); opacity: 0.7; }
        }
        @keyframes float-orb-3 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.8; }
          50% { transform: translate(-1px, 1px) scale(1.1); opacity: 1; }
        }
        .animate-soft-pulse {
          animation: soft-pulse 2s ease-in-out infinite;
        }
        .animate-float-orb-1 {
          animation: float-orb-1 4s ease-in-out infinite;
        }
        .animate-float-orb-2 {
          animation: float-orb-2 3.5s ease-in-out infinite;
        }
        .animate-float-orb-3 {
          animation: float-orb-3 5s ease-in-out infinite;
        }
        .animate-ping-slow {
          animation: ping 3s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
}