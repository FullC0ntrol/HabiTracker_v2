// src/features/auth/hooks/useLogin.js
import { useAuth } from "../../../shared/auth/AuthContext";
import { loginUser } from "../services/auth.service";

/**
 * Hook do obsługi logowania z PIN-em.
 * Używany w PinScreen.jsx — łączy się z backendem i aktualizuje AuthContext.
 */
export function useLogin() {
  const { setToken, setUsername } = useAuth();

  /**
   * Próbuje zalogować użytkownika:
   * - wysyła żądanie do backendu
   * - zapisuje token i username do kontekstu oraz localStorage
   */
  async function login(username, pin) {
    const data = await loginUser(username, pin);
    if (!data?.token) throw new Error("Brak tokena w odpowiedzi serwera");

    // 🔐 zapis w pamięci lokalnej
    localStorage.setItem("token", data.token);
    localStorage.setItem("username", username);

    // 🧠 aktualizacja kontekstu
    setUsername(username);
    setToken(data.token);

    return data;
  }

  return { login };
}
