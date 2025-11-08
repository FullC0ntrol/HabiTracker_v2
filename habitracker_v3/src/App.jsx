import { useEffect, useState } from "react";
import { useAuth } from "./shared/auth/AuthContext";
import LoginScreen from "./features/auth/components/LoginScreen";
import PinScreen from "./features/auth/components/PinScreen";
import Dashboard from "./pages/Dashboard";

/**
 * Flow ekranu logowania:
 *  - jeśli mamy token -> od razu MainScreen (użytkownik zalogowany)
 *  - jeśli nie mamy: 2 kroki -> login (username) -> pin (backend zwraca token)
 *
 * Uwaga: etap "home" nie jest potrzebny w stanie lokalnym,
 * bo "home" = "mamy token". To upraszcza logikę.
 */
function Flow() {
  const { token } = useAuth();
  const [stage, setStage] = useState("username"); // 'username' | 'pin'

  // Gdy token się pojawi (udane logowanie PIN-em), automatycznie pokaż "home"
  useEffect(() => {
    // token jest źródłem prawdy: jeśli istnieje, pokazujemy MainScreen
    // (bez ręcznego stage = 'home')
  }, [token]);
  if (token) {
    // Zalogowany użytkownik -> główny ekran
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen w-full">
      {stage === "username" && (
        <LoginScreen onComplete={() => setStage("pin")} />
      )}

      {stage === "pin" && (
        // PinScreen sam pobierze username z AuthContext (nie trzeba props)
        <PinScreen
          onComplete={() => {
            // nic nie rób: po sukcesie PinScreen ustawi token,
            // a to automatycznie przełączy widok na MainScreen
          }}
          onBack={() => setStage("username")}
        />
      )}
    </div>
  );
}

export default function App() {
  // Uwaga: App NIE zawiera już providerów.
  // Dzięki temu App ma tylko UI/logikę flow.
  return <Flow />;
}
