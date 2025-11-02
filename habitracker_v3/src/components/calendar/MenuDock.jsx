// calendar/MenuDock.jsx
import { useRef, useEffect } from "react";
import { Dumbbell, Flame } from "lucide-react";

export function MenuDock({ menuItems, showMenu, setShowMenu, onMainAction }) {
  const hoverZoneRef = useRef(null);
  const openT = useRef(null);
  const closeT = useRef(null);

  const openWithIntent = () => {
    if (closeT.current) { clearTimeout(closeT.current); closeT.current = null; }
    if (!showMenu) openT.current = setTimeout(() => setShowMenu(true), 60);
  };
  const closeWithIntent = () => {
    if (openT.current) { clearTimeout(openT.current); openT.current = null; }
    closeT.current = setTimeout(() => setShowMenu(false), 180);
  };

  useEffect(() => {
    const onDown = (e) => {
      if (hoverZoneRef.current && !hoverZoneRef.current.contains(e.target))
        setShowMenu(false);
    };
    const onKey = (e) => { if (e.key === "Escape") setShowMenu(false); };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
      if (openT.current) clearTimeout(openT.current);
      if (closeT.current) clearTimeout(closeT.current);
    };
  }, [showMenu, setShowMenu]);

  const getMenuStyle = (index, open) => {
    const baseSpacing = 92;
    const centerIndex = 1.5;
    const mainW = 84;
    const gap = 16;
    const shift = mainW / 2 + gap;
    let x = (index - centerIndex) * baseSpacing;
    x += index < centerIndex ? -shift : +shift;
    const y = -16;
    const closed = "translate(-50%, -50%) scale(.9)";
    const opened = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(1)`;
    const delay = menuItems[index].delay ?? "0ms";
    return {
      transform: open ? opened : closed,
      opacity: open ? 1 : 0,
      transition: `transform 320ms cubic-bezier(.2,.8,.2,1) ${delay}, opacity 220ms ease ${delay}`,
      pointerEvents: open ? "auto" : "none",
      filter: open ? "drop-shadow(0 8px 16px rgba(0,0,0,.35))" : "none",
    };
  };

  return (
    <div className="relative pb-8 flex justify-center items-end z-20">
      <div
        ref={hoverZoneRef}
        onMouseEnter={openWithIntent}
        onMouseLeave={closeWithIntent}
        className="relative w-[480px] max-w-full h-28 flex items-center justify-center"
      >
        {/* ⬇️ USUNIĘTE TŁO DOCKA */}

        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const style = getMenuStyle(index, showMenu);
          return (
            <button
              key={item.label}
              style={style}
              className="absolute left-1/2 top-1/2 w-14 h-14 rounded-2xl bg-white/8 border border-white/15 backdrop-blur-xl
                         hover:bg-white/12 hover:border-white/25 transition-all duration-300 ease-out
                         flex items-center justify-center"
              onClick={() => {
                item.onClick?.();
                setShowMenu(false);
              }}
              aria-label={item.label}
              title={item.label}
            >
              <Icon className={`w-6 h-6 text-${item.color}-300`} strokeWidth={2} />
            </button>
          );
        })}

        {/* Główny przycisk: hantelek → niebieski płomień (bez tekstu) */}
        <button
          onClick={() => {
            if (!showMenu) setShowMenu(true);
            else onMainAction?.();
          }}
          className={`relative z-30 w-20 h-20 rounded-full grid place-items-center
                      shadow-[0_12px_30px_-8px_rgba(0,180,255,.45)]
                      ring-1 ring-white/15 transition-all duration-300
                      ${showMenu
                        ? "bg-linear-to-br from-cyan-600 to-cyan-700 scale-105"
                        : "bg-linear-to-br from-cyan-500 to-cyan-600 hover:scale-110 animate-pulse-slow"}`}
          aria-expanded={showMenu}
          aria-label={showMenu ? "Trening" : "Otwórz nawigację"}
          title={showMenu ? "Trening" : "Otwórz nawigację"}
        >
          {showMenu ? (
            <Flame className="w-10 h-10 text-cyan-100" strokeWidth={2.4} />
          ) : (
            <Dumbbell className="w-10 h-10 text-white" strokeWidth={2.6} />
          )}
          {showMenu && (
            <span className="pointer-events-none absolute inset-0 rounded-full blur-xl bg-cyan-500/25" />
          )}
        </button>
      </div>
    </div>
  );
}
