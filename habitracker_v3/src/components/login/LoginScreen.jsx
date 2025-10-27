import { useState } from 'react';
import { User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';


export default function LoginScreen({ onComplete }) {
const { setUsername } = useAuth();
const [username, setLocal] = useState('');


const handleSubmit = (e) => {
e.preventDefault();
const trimmed = username.trim();
if (trimmed) {
setUsername(trimmed);
onComplete(trimmed);
}
};


return (
<div className="min-h-screen w-full bg-mesh flex items-center justify-center p-6 relative overflow-hidden">
<div className="absolute inset-0 overflow-hidden pointer-events-none">
<div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse-slow" />
<div
className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse-slow"
style={{ animationDelay: '1s' }}
/>
</div>


<div className="w-full max-w-md relative z-10 animate-scale-in">
<div className="text-center mb-12">
<div className="inline-flex items-center justify-center w-20 h-20 rounded-full glass-strong glow-cyan mb-6 animate-float">
<User className="w-10 h-10 text-cyan-400" strokeWidth={2} />
</div>
<h1 className="text-5xl font-bold text-white mb-3 tracking-tight">
Habi<span className="text-cyan-400 text-glow-cyan">Tracker</span>
</h1>
<p className="text-gray-400 text-sm">Track your progress, build better habits</p>
</div>


<form onSubmit={handleSubmit} className="space-y-6">
<div className="glass-strong rounded-3xl p-8 shadow-2xl">
<label className="block text-gray-300 text-sm font-medium mb-4">
Enter your username
</label>
<input
type="text"
value={username}
onChange={(e) => setLocal(e.target.value)}
placeholder="..."
className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300"
autoFocus
/>
</div>


<button
type="submit"
disabled={!username.trim()}
className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-semibold py-5 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 glow-cyan"
>
Continue
</button>
</form>
</div>
</div>
);
}