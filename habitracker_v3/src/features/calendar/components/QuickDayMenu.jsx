// src/features/calendar/components/QuickDayMenu.jsx
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
      className="fixed z-50 flex flex-col bg-[var(--color-bg-overlay)]/95 border border-[rgba(var(--rgb-white),0.1)] rounded-xl shadow-xl p-2 backdrop-blur-md"
    >
      <button
        onClick={() => {
          onSelect?.("workout", dateISO);
          onClose?.();
        }}
        className="px-4 py-2 text-sm text-[var(--color-secondary-300)] hover:bg-[rgba(var(--rgb-secondary),0.2)] rounded-lg text-left"
      >
        🏋️ Odhacz / usuń trening
      </button>
      <button
        onClick={() => {
          onSelect?.("habit", dateISO);
          onClose?.();
        }}
        className="px-4 py-2 text-sm text-[var(--color-primary-300)] hover:bg-[rgba(var(--rgb-primary),0.2)] rounded-lg text-left"
      >
        🌿 Odhacz / usuń nawyki
      </button>
      <button
        onClick={onClose}
        className="px-4 py-1 text-xs text-[rgba(var(--rgb-white),0.5)] hover:text-[var(--color-text-muted)] mt-1"
      >
        Anuluj
      </button>
    </div>
  );
}