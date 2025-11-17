import React, { useEffect, useRef } from "react";

export function QuickDayMenu({ x, y, dateISO, onSelect, onClose }) {
  const menuRef = useRef(null);

  // Zamknij po kliknięciu poza
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) onClose?.();
    };
    document.addEventListener("pointerdown", handleClick);
    return () => document.removeEventListener("pointerdown", handleClick);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: "translate(-50%, -120%)",
      }}
      className="fixed z-50 flex flex-col bg-[rgb(var(--color-card-bg))]/95 border border-white/10 rounded-xl shadow-xl p-2 backdrop-blur-md"
    >
      <button
        onClick={() => {
          onSelect?.("workout", dateISO);
          onClose?.();
        }}
        className="px-4 py-2 text-sm text-[rgb(var(--color-primary-light))] hover:bg-[rgb(var(--rgb-primary))]/20 rounded-lg text-left"
      >
        🏋️ Odhacz / usuń trening
      </button>
      <button
        onClick={() => {
          onSelect?.("habit", dateISO);
          onClose?.();
        }}
        className="px-4 py-2 text-sm text-[rgb(var(--color-secondary))] hover:bg-[rgb(var(--color-secondary))]/20 rounded-lg text-left"
      >
        🌿 Odhacz / usuń nawyki
      </button>
      <button
        onClick={onClose}
        className="px-4 py-1 text-xs text-white/50 hover:text-white/80 mt-1"
      >
        Anuluj
      </button>
    </div>
  );
}