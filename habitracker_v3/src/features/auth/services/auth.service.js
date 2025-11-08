// src/features/auth/services/auth.service.js
import { http } from "../../../shared/api/client";

/**
 * Logowanie lub rejestracja użytkownika po nazwie i PIN.
 * Backend tworzy konto jeśli nie istnieje.
 *
 * @param {string} username - nazwa użytkownika
 * @param {string} pin - 4-cyfrowy PIN
 * @returns {Promise<{token: string, created: boolean}>}
 */
export async function loginUser(username, pin) {
  if (!username || !pin) throw new Error("Brak loginu lub PIN-u");

  try {
    // http.post już zwraca sparsowany JSON z backendu
    const data = await http.post("/api/auth", { username, pin });

    if (!data || !data.token) {
      throw new Error("Niepoprawna odpowiedź serwera");
    }

    return data; // np. { ok: true, created: false, token: "..." }
  } catch (e) {
    console.error("Auth error:", e);
    throw new Error(e.message || "Nie udało się zalogować. Spróbuj ponownie.");
  }
}
