import { apiClient } from "../../../shared/api/client";

/**
 * Serwis do obsługi planów treningowych.
 * Ujednolicona obsługa błędów + bezpieczna walidacja odpowiedzi backendu.
 */
export const plansService = {
  /** 📜 Lista wszystkich planów użytkownika */
  getAll: async () => {
    return await apiClient.get("/api/plans");
  },

  /** 📘 Pojedynczy plan po ID */
  getById: async (id) => {
    return await apiClient.get(`/api/plans/${id}`);
  },

  /** ✳️ Utworzenie nowego planu */
  create: async (payload) => {
    return await apiClient.post("/api/plans", payload);
  },

  /** ❌ Usunięcie planu */
  delete: async (id) => {
    return await apiClient.delete(`/api/plans/${id}`);
  },

  /** 🏋️ Pobranie listy ćwiczeń (dla kreatora planu) */
  getExercises: async () => {
    return await apiClient.get("/api/exercises");
  },

  /** 🟢 Pobranie aktualnie aktywnego planu */
  getActive: async () => {
    try {
      const res = await apiClient.get("/api/plans/active");

      if (!res) {
        console.warn("[plansService] ⚠️ Brak aktywnego planu (null)");
        return null;
      }

      if (Array.isArray(res)) {
        console.log(res)
        console.warn("[plansService] ⚠️ Backend zwrócił tablicę zamiast obiektu:", res);
        return null;
      }

      // Walidacja struktury
      if (typeof res.id !== "number" || !res.name) {
        console.warn("[plansService] ⚠️ Odpowiedź nie zawiera danych planu:", res);
        return null;
      }

      // Normalizacja items
      if (!Array.isArray(res.items)) res.items = [];

      console.log("[plansService] ✅ Aktywny plan:", res.name, res.items.length, "ćwiczeń");
      return res;
    } catch (err) {
      if (err.message?.includes("401")) {
        console.warn("[plansService] ⚠️ Użytkownik niezalogowany.");
      } else if (err.message?.includes("404")) {
        console.warn("[plansService] ⚠️ Brak aktywnego planu na backendzie.");
      } else {
        console.error("[plansService] ❌ Błąd w getActive:", err);
      }
      return null;
    }
  },

  /** 🔹 Ustawienie aktywnego planu */
  setActive: async (id) => {
    try {
      const res = await apiClient.post(`/api/plans/${id}/activate`);
      console.log("[plansService] ✅ Plan aktywowany (ID):", id);
      return res;
    } catch (err) {
      console.error("[plansService] ❌ Błąd aktywacji planu:", err);
      throw err;
    }
  },
};