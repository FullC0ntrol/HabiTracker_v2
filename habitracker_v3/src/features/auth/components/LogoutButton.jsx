// src/features/auth/utils/LogoutButton.js

/**
 * logout — funkcja czyszcząca token i przekierowująca użytkownika.
 * Może być użyta z dowolnego miejsca (np. w Dashboard lub MenuDock).
 */
export default function logout(onAfterLogout) {
  try {
    localStorage.removeItem("token");
    sessionStorage.clear();
    if (typeof onAfterLogout === "function") onAfterLogout();
    window.location.href = "/login"; // przekierowanie
  } catch (err) {
    console.error("Błąd podczas wylogowania:", err);
  }
}