import { useEffect, useState, useMemo } from "react";
import { workoutService } from "../services/workout.service";
import { Dumbbell, BarChart3, Flame } from "lucide-react";

export default function WorkoutStats() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    (async () => {
      const h = await workoutService.getHistory();
      setHistory(h);
    })();
  }, []);

  const stats = useMemo(() => {
    if (!history.length) return null;

    const totalVolume = history.reduce((sum, h) => sum + h.volume, 0);
    const avgVolume = Math.round(totalVolume / history.length);
    const totalSets = history.reduce((sum, h) => sum + h.totalSets, 0);

    return { totalVolume, avgVolume, totalSets };
  }, [history]);

  if (!stats)
    return (
      <div className="text-center text-white/40 py-6 text-sm">
        Brak danych statystycznych
      </div>
    );

  return (
    <div className="px-4 py-3">
      <div className="grid grid-cols-3 gap-2">
        <StatCard
          icon={<Dumbbell className="w-4 h-4 text-[rgb(var(--color-secondary))]" />}
          label="Treningi"
          value={history.length}
        />
        <StatCard
          icon={<Flame className="w-4 h-4 text-[rgb(var(--color-primary-light))]" />}
          label="Średnia"
          value={`${stats.avgVolume}kg`}
        />
        <StatCard
          icon={<BarChart3 className="w-4 h-4 text-amber-400" />}
          label="Łącznie"
          value={`${stats.totalVolume}kg`}
        />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 text-center">
      <div className="flex justify-center mb-1">{icon}</div>
      <div className="text-base font-bold text-white mb-0.5">{value}</div>
      <div className="text-[10px] text-white/60">{label}</div>
    </div>
  );
}