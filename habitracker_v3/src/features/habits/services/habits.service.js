// src/features/habits/services/habits.service.js
import { apiClient } from "../../../shared/api/client";

export async function getHabits() {
  return apiClient.get("/api/habits");
}

export async function createHabit(data) {
  return apiClient.post("/api/habits", data);
}

export async function getHabitEntries({ from, to }) {
  return apiClient.get(`/api/habits/entries?from=${from}&to=${to}`);
}

export async function getAllHabitEntries() {
  return apiClient.get("/api/habits/entries");
}

export async function updateHabitEntry(habitId, { date, value }) {
  return apiClient.post(`/api/habits/${habitId}/entries`, { date, value });
}
