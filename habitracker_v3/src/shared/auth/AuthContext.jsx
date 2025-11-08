// src/shared/auth/AuthContext.jsx
import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // 🔐 stan logowania – pamiętamy token i nazwę użytkownika
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [username, setUsername] = useState(() => localStorage.getItem("username"));

  // 🚪 logout – usuwa dane z pamięci i localStorage
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setToken(null);
    setUsername(null);
  };

  // 🧠 obiekt udostępniany przez kontekst
  const value = useMemo(
    () => ({
      token,
      username,
      setToken,
      setUsername, // 👈 to jest to, czego brakowało
      logout,
    }),
    [token, username]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ✅ Custom hook do pobierania kontekstu
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
