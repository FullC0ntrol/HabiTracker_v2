import { useEffect, useState } from "react";
import { useAuth } from "./shared/auth/AuthContext";
import LoginScreen from "./features/auth/components/LoginScreen";
import PinScreen from "./features/auth/components/PinScreen";
import Dashboard from "./pages/Dashboard";
import LoadingScreen from "./shared/ui/LoadingScreen";

/**
 * Flow ekranu logowania:
 *  - jeśli mamy token -> Dashboard
 *  - jeśli nie mamy -> login -> pin
 */

function Flow() {
  const { token } = useAuth();
  const [stage, setStage] = useState("username"); // 'username' | 'pin'
  const [loading, setLoading] = useState(true);

  // 🔧 Symulacja inicjalnego ładowania (np. sprawdzanie tokena, storage itp.)
  useEffect(() => {
    const init = async () => {
      // Możesz tu potem wrzucić realne sprawdzanie IDB/localStorage/server
      await new Promise((r) => setTimeout(r, 800));
      setLoading(false);
    };
    init();
  }, []);

  // 🔧 Gdy token się pojawi – dashboard
  if (loading) {
    return <LoadingScreen message="Uruchamiam HabiTracker..." />;
  }

  if (token) {
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen w-full">
      {stage === "username" && (
        <LoginScreen onComplete={() => setStage("pin")} />
      )}

      {stage === "pin" && (
        <PinScreen
          onComplete={() => {
            // token zapisze się sam przez context
          }}
          onBack={() => setStage("username")}
        />
      )}
    </div>
  );
}

export default function App() {
  return <Flow />;
}
