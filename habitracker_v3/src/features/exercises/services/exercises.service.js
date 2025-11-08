// src/features/exercises/services/exercises.service.js
import { apiClient } from "../../../shared/api/client";

export async function getExercises() {
  return apiClient.get("/api/exercises");
}

export async function createExercise(data) {
  return apiClient.post("/api/exercises", data);
}

export async function updateExercise(id, data) {
  return apiClient.patch(`/api/exercises/${id}`, data);
}

export async function deleteExercise(id) {
  return apiClient.delete(`/api/exercises/${id}`);
}
