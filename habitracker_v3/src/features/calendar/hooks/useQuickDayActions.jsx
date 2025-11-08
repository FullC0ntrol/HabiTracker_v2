// src/features/calendar/hooks/useQuickDayActions.js
import { useState } from "react";
import { QuickDayMenu } from "../components/QuickDayMenu";

export function useQuickDayActions({ onQuickToggle, onDayClick }) {
  const [menu, setMenu] = useState(null); // {x, y, dateISO}

  // handler dla kalendarza
  const handleDayClick = (dateISO, e) => {
    if (e.shiftKey) {
      const rect = e.currentTarget.getBoundingClientRect();
      setMenu({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        dateISO,
      });
    } else {
      onDayClick?.(dateISO, e);
    }
  };

  const handleSelect = (type, dateISO) => {
    onQuickToggle?.(type, dateISO);
    setMenu(null);
  };

  const menuElement = menu ? (
    <QuickDayMenu
      x={menu.x}
      y={menu.y}
      dateISO={menu.dateISO}
      onSelect={handleSelect}
      onClose={() => setMenu(null)}
    />
  ) : null;

  return {
    onDayClick: handleDayClick,
    menuElement,
  };
}
