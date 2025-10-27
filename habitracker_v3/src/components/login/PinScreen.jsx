import { useState, useEffect, useCallback } from 'react';
import { Lock, Delete } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function PinScreen({ username, onComplete }) {
  const { login } = useAuth();
  const [pin, setPin] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (pin.length === 4) {
      login(username, pin)
        .then(() => {
          const t = setTimeout(() => onComplete(), 300);
          return () => clearTimeout(t);
        })
        .catch(err => {
          setError(err.message);
          setPin('');
          setIsShaking(true);
          setTimeout(() => setIsShaking(false), 150);
        });
    }
  }, [pin, username, login, onComplete]);

  const pushDigit = useCallback((num) => {
    setPin((prev) => (prev.length < 4 ? prev + num : prev));
  }, []);

  const handleDelete = useCallback(() => {
    setPin((prev) => prev.slice(0, -1));
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      const { key } = e;
      if (/^[0-9]$/.test(key)) return pushDigit(key);
      if (key === 'Backspace') return handleDelete();
      if (key === 'Enter' && pin.length === 4) return onComplete();
      if (!['Shift','Alt','Control','Meta','Tab','CapsLock'].includes(key)) {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 150);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [pin.length, onComplete, pushDigit, handleDelete]);

  const numbers = [ ['1','2','3'], ['4','5','6'], ['7','8','9'] ];

  return (
    <div className="min-h-screen w-full bg-mesh flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="w-full max-w-md relative z-10 animate-scale-in">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full glass-strong glow-rose mb-6 animate-float">
            <Lock className="w-10 h-10 text-rose-400" strokeWidth={2} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Enter PIN</h2>
          <p className="text-gray-400 text-sm">Enter your 4-digit security code</p>
          {error && <p className="mt-3 text-rose-400 text-sm">{error}</p>}
        </div>

        <div className={`glass-strong rounded-3xl p-8 mb-8 ${isShaking ? 'animate-shake' : ''}`}>
          <div className="flex justify-center gap-4 mb-8">
            {[0,1,2,3].map((i) => (
              <div key={i} className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${pin.length > i ? 'bg-gradient-to-br from-rose-500 to-rose-600 glow-rose scale-110' : 'bg-white/5 border border-white/10'}`}>
                {pin.length > i && <div className="w-4 h-4 rounded-full bg-white animate-scale-in" />}
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {numbers.map((row, idx) => (
              <div key={idx} className="flex gap-3 justify-center">
                {row.map((num) => (
                  <button key={num} onClick={() => pushDigit(num)} className="w-20 h-20 rounded-2xl glass font-semibold text-2xl text-white hover:glass-strong hover:scale-105 active:scale-95 transition-all duration-200 hover:border-rose-400/30">
                    {num}
                  </button>
                ))}
              </div>
            ))}
            <div className="flex gap-3 justify-center">
              <div className="w-20 h-20" />
              <button onClick={() => pushDigit('0')} className="w-20 h-20 rounded-2xl glass font-semibold text-2xl text-white hover:glass-strong hover:scale-105 active:scale-95 transition-all duration-200 hover:border-rose-400/30">0</button>
              <button onClick={handleDelete} disabled={pin.length===0} className="w-20 h-20 rounded-2xl glass flex items-center justify-center hover:glass-strong hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 hover:border-rose-400/30">
                <Delete className="w-6 h-6 text-rose-400" />
              </button>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-500 text-xs">Your data is encrypted and secure</p>
        </div>
      </div>
    </div>
  );
}