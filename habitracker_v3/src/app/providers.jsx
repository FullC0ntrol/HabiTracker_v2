import { AuthProvider } from '../shared/auth/AuthContext';

/**
 * AppProviders: jedno miejsce na wszystkie providery aplikacji.
 * Dzięki temu App.jsx pozostaje czysty (tylko UI/flow),
 * a w main.jsx po prostu owijasz <App /> w <AppProviders>.
 */
export default function AppProviders({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
