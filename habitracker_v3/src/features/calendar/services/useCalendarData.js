import { useEffect, useState } from "react";
import { http } from "../../../shared/api/client";
import { toISO } from "../../../shared/utils/dateUtils";

export function useCalendarData(currentDate) {
  const [data, setData] = useState({
    workoutSet: new Set(),
    habits: [],
    habitsDoneSet: new Set(),
    entriesByDate: {},
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return; // 🚫 nie fetchuj bez tokena

    (async () => {
      try {
        const from = toISO(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
        const to = toISO(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0));

        const [days, habits, entries] = await Promise.all([
          http.get(`/api/workouts/days?from=${from}&to=${to}`),
          http.get(`/api/habits`),
          http.get(`/api/habits/entries?from=${from}&to=${to}`),
        ]);

        setData({
          workoutSet: new Set(days.map(d => d.date || d)),
          habits,
          habitsDoneSet: new Set(entries.map(e => e.date)),
          entriesByDate: groupEntriesByDate(entries),
        });
      } catch (err) {
        console.error("Calendar fetch failed:", err);
      }
    })();
  }, [currentDate]);

  return data;
}

function groupEntriesByDate(entries = []) {
  const map = {};
  for (const e of entries) {
    const d = e.date;
    (map[d] ??= {})[e.habit_id] = (map[d]?.[e.habit_id] || 0) + (e.value || 0);
  }
  return map;
}
