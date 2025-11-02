// /workout/RestTimer.jsx
import { PauseCircle, TimerReset } from "lucide-react";

export function RestTimer({ secondsLeft, onSkip }) {
  const mm = Math.floor(secondsLeft / 60);
  const ss = secondsLeft % 60;

  return (
    <div className="w-full max-w-md mx-auto bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur text-center">
      <div className="mx-auto w-16 h-16 rounded-full bg-black/30 border border-white/10 grid place-items-center mb-3">
        <PauseCircle className="w-8 h-8 text-white/80" />
      </div>
      <div className="text-white/60 text-sm">Przerwa</div>
      <div className="text-5xl sm:text-6xl font-extrabold tracking-tight my-2 tabular-nums">
        {mm}:{ss.toString().padStart(2, "0")}
      </div>
      <button
        onClick={onSkip}
        className="inline-flex items-center gap-2 mt-3 rounded-xl px-4 py-2 border border-white/10 bg-white/5 hover:bg-white/10 transition"
      >
        <TimerReset className="w-4 h-4" />
        Pomiń przerwę
      </button>
    </div>
  );
}
