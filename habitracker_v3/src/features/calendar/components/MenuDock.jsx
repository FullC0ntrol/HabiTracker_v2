import { useEffect, useRef } from "react";
import { Dumbbell, Flame, Loader2 } from "lucide-react";

export function MenuDock({
  menuItems = [],
  showMenu,
  setShowMenu,
  onMainAction,
  isLoading = false,
}) {
  const rootRef = useRef(null);
  const longPressTimer = useRef(null);
  const longPressFired = useRef(false);

  const VISIBLE_ITEMS = menuItems.slice(0, 4);
  const LONG_PRESS_MS = 600;

  useEffect(() => {
    const handleOutside = (e) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("pointerdown", handleOutside);
    return () => document.removeEventListener("pointerdown", handleOutside);
  }, [setShowMenu]);

  const clearLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handlePointerDown = (e) => {
    if (isLoading) return;
    e.preventDefault();
    longPressFired.current = false;

    clearLongPress();
    longPressTimer.current = setTimeout(() => {
      longPressFired.current = true;
      onMainAction?.();
    }, LONG_PRESS_MS);
  };

  const handlePointerUp = () => {
    if (isLoading) return;
    clearLongPress();
    if (!longPressFired.current) {
      setShowMenu((prev) => !prev);
    }
    longPressFired.current = false;
  };

  const handlePointerLeave = () => {
    clearLongPress();
    longPressFired.current = false;
  };

  return (
    <div
      ref={rootRef}
      className="fixed bottom-0 left-0 right-0 z-[9999] flex justify-center items-end pointer-events-none"
      style={{
        paddingBottom: "max(12px, env(safe-area-inset-bottom, 0px))",
        height: "90px",
      }}
    >
      {/* Tło */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.35) 40%, transparent 80%)",
          backdropFilter: "blur(10px) saturate(140%)",
          WebkitBackdropFilter: "blur(10px) saturate(140%)",
        }}
      />

      <div className="relative w-full max-w-lg h-full flex justify-center items-end pb-2 pointer-events-auto">
        {/* MENU NAD PRZYCISKIEM */}
        <div
          className={[
            "absolute bottom-16 left-1/2 -translate-x-1/2",
            "flex items-center justify-center gap-3 px-3 py-1",
            "transition-all duration-250",
            showMenu
              ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
              : "opacity-0 scale-90 translate-y-2 pointer-events-none",
          ].join(" ")}
        >
          {VISIBLE_ITEMS.map((item) => {
            const Icon = item.icon || Dumbbell;
            return (
              <button
                key={item.label}
                onClick={() => {
                  item.onClick?.();
                  setShowMenu(false);
                }}
                className="flex flex-col items-center gap-1"
              >
                <div className="dock-item">
                  <Icon
                    className="w-5 h-5" // Kolor dziedziczony z .dock-item
                    strokeWidth={2.2}
                  />
                </div>
                <span className="dock-item-label">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* GŁÓWNY DUŻY PRZYCISK */}
        <button
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
          onPointerCancel={handlePointerLeave}
          disabled={isLoading}
          className={[
            "dock-main-button",
            showMenu ? "scale-105" : "hover:scale-110 active:scale-95",
            isLoading ? "opacity-80 cursor-wait" : "",
          ].join(" ")}
        >
          {/* wewnętrzny glow */}
          <div className="absolute inset-1 rounded-full bg-[rgba(0,0,0,0.25)]" />

          {isLoading ? (
            <Loader2 className="dock-main-icon animate-spin" />
          ) : showMenu ? (
            <Flame className="dock-main-icon" />
          ) : (
            <Dumbbell className="dock-main-icon" />
          )}
        </button>
      </div>
    </div>
  );
}