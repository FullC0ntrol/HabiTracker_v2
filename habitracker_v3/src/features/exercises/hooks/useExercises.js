// src/features/exercises/hooks/useExercises.js
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  getExercises,
  createExercise,
  updateExercise,
  deleteExercise,
} from "../services/exercises.service";

export function useExercises() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🧩 Pobieranie ćwiczeń
  const loadExercises = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getExercises();
      setList(data);
      setError("");
    } catch (err) {
      console.error("❌ getExercises error:", err);
      setError(err.message || "Nie udało się pobrać ćwiczeń");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExercises();
  }, [loadExercises]);

  // ➕ Dodawanie ćwiczenia
  const addExercise = useCallback(async (body) => {
    const trimmed = body.name?.trim();
    if (!trimmed) return;
    const created = await createExercise(body);
    setList((prev) => [...prev, created]);
  }, []);

  // ✏️ Edycja
  const patchExercise = useCallback(async (id, data) => {
    const updated = await updateExercise(id, data);
    setList((prev) => prev.map((ex) => (ex.id === id ? updated : ex)));
  }, []);

  // 🗑️ Usuwanie
  const removeExercise = useCallback(async (id) => {
    await deleteExercise(id);
    setList((prev) => prev.filter((ex) => ex.id !== id));
  }, []);

  // 📊 Statystyki kategorii (memoized)
  const stats = useMemo(() => {
    const counts = {};
    list.forEach((ex) => {
      counts[ex.category] = (counts[ex.category] || 0) + 1;
    });
    return counts;
  }, [list]);

  return {
    list,
    loading,
    error,
    stats,
    addExercise,
    patchExercise,
    removeExercise,
  };
}
