// src/features/habits/hooks/useHabits.js
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  getHabits,
  getHabitEntries,
  getAllHabitEntries,
  createHabit,
  updateHabitEntry,
} from "../services/habits.service";
import { toISO, addDays, weekStart } from "../../../shared/utils/dateUtils";

export function useHabits() {
  const [habits, setHabits] = useState([]);
  const [weekEntries, setWeekEntries] = useState([]);
  const [allEntries, setAllEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentStart, setCurrentStart] = useState(() => weekStart(new Date()));
  const start = currentStart;
  const end = useMemo(() => addDays(start, 6), [start]);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const todayISO = toISO(today);

  /** Pobiera dane tygodnia */
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const from = toISO(start);
      const to = toISO(end);
      const [h, w, a] = await Promise.all([
        getHabits(),
        getHabitEntries({ from, to }),
        getAllHabitEntries(),
      ]);
      setHabits(h);
      setWeekEntries(w);
      setAllEntries(a);
    } catch (e) {
      console.error("Habit fetch failed:", e);
      setError("Nie udało się pobrać danych nawyków");
    } finally {
      setLoading(false);
    }
  }, [start, end]);

  useEffect(() => {
    load();
  }, [load]);

  /** Dodanie nowego nawyku */
  const addHabit = useCallback(async (form) => {
    const data = {
      name: form.name.trim(),
      target: Number(form.target || 7),
      unit: form.unit || "count",
    };
    if (!data.name) return;
    await createHabit(data);
    await load();
  }, [load]);

  /** Aktualizacja wpisu */
  const incrementHabit = useCallback(
    async (habitId, delta) => {
      const currentValue = weekEntries
        .filter((e) => e.habit_id === habitId && e.date === todayISO)
        .reduce((sum, entry) => sum + (entry.value || 0), 0);
      const newValue = Math.max(0, currentValue + delta);

      const patchList = (list) => {
        const filtered = list.filter(
          (e) => !(e.habit_id === habitId && e.date === todayISO)
        );
        return newValue > 0
          ? [...filtered, { habit_id: habitId, date: todayISO, value: newValue }]
          : filtered;
      };

      const prevWeek = weekEntries;
      const prevAll = allEntries;
      setWeekEntries(patchList(prevWeek));
      setAllEntries(patchList(prevAll));

      try {
        await updateHabitEntry(habitId, { date: todayISO, value: newValue });
        await load();
      // eslint-disable-next-line no-unused-vars
      } catch (e) {
        setWeekEntries(prevWeek);
        setAllEntries(prevAll);
        setError("Błąd zapisu nawyku");
      }
    },
    [todayISO, weekEntries, allEntries, load]
  );

  /** Agregacje i dane pochodne */
  const totalsWeek = useMemo(() => {
    const map = {};
    for (const e of weekEntries) {
      map[e.habit_id] ??= {};
      map[e.habit_id][e.date] = (map[e.habit_id][e.date] || 0) + (e.value || 0);
    }
    return map;
  }, [weekEntries]);

  const streakByHabit = useMemo(() => {
    const byHabit = {};
    const map = {};
    for (const e of allEntries) {
      map[e.habit_id] ??= {};
      map[e.habit_id][e.date] = (map[e.habit_id][e.date] || 0) + (e.value || 0);
    }
    for (const h of habits) {
      let streak = 0;
      let cur = new Date(today);
      while (true) {
        const key = toISO(cur);
        if ((map[h.id]?.[key] || 0) > 0) {
          streak++;
          cur = addDays(cur, -1);
        } else break;
      }
      byHabit[h.id] = streak;
    }
    return byHabit;
  }, [allEntries, habits, today]);

  const todayCounts = useMemo(() => {
    const counts = {};
    habits.forEach((h) => {
      counts[h.id] = weekEntries
        .filter((e) => e.habit_id === h.id && e.date === todayISO)
        .reduce((sum, entry) => sum + (entry.value || 0), 0);
    });
    return counts;
  }, [habits, weekEntries, todayISO]);

  return {
    habits,
    loading,
    error,
    totalsWeek,
    streakByHabit,
    todayCounts,
    start,
    end,
    todayISO,
    setCurrentStart,
    addHabit,
    incrementHabit,
  };
}
