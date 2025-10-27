import { createContext, useContext, useMemo, useState } from 'react';


const AuthContext = createContext(null);


export function AuthProvider({ children }) {
const [token, setToken] = useState(() => localStorage.getItem('token'));
const [username, setUsername] = useState(() => localStorage.getItem('username'));


const login = async (name, pin) => {
const res = await fetch('http://localhost:4000/api/auth', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ username: name, pin })
});
const data = await res.json();
if (!res.ok) throw new Error(data.error || 'Login failed');
localStorage.setItem('token', data.token);
localStorage.setItem('username', name);
setToken(data.token);
setUsername(name);
return data;
};


const value = useMemo(() => ({ token, username, setUsername, login }), [token, username]);
return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
const ctx = useContext(AuthContext);
if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
return ctx;
};