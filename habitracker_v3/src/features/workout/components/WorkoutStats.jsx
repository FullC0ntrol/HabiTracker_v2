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
      <div className="text-center text-white/40 py-8 text-sm">
        Brak danych statystycznych
      </div>
    );

  return (
    <div className="grid grid-cols-3 gap-3 p-4">
      <StatCard
        icon={<Dumbbell className="w-5 h-5 text-cyan-400" />}
        label="Treningi"
        value={history.length}
      />
      <StatCard
        icon={<Flame className="w-5 h-5 text-emerald-400" />}
        label="Średnia obj."
        value={`${stats.avgVolume}kg`}
      />
      <StatCard
        icon={<BarChart3 className="w-5 h-5 text-amber-400" />}
        label="Łączna obj."
        value={`${stats.totalVolume}kg`}
      />
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white/5 backdrop-blur-md rounded-xl border border-emerald-500/20 p-3 text-center">
      <div className="flex justify-center mb-2">{icon}</div>
      <div className="text-lg font-bold text-white mb-1">{value}</div>
      <div className="text-xs text-emerald-300/60">{label}</div>
    </div>
  );
}