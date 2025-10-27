import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginScreen from "./components/login/LoginScreen";
import PinScreen from "./components/login/PinScreen";
import MainScreen from "./components/MainScreen";

function Flow() {
  const { username } = useAuth();
  const [stage, setStage] = useState("username"); // 'username' | 'pin' | 'home'

  return (
    <div className="min-h-screen w-full">
      {stage === "username" && (
        <LoginScreen onComplete={() => setStage("pin")} />
      )}

      {stage === "pin" && (
        <PinScreen username={username} onComplete={() => setStage("home")} />
      )}

      {stage === "home" && (
        <MainScreen />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Flow />
    </AuthProvider>
  );
}
