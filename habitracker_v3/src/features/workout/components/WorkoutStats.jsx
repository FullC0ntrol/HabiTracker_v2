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
      <div className="text-center text-white/70 py-12">
        Brak danych statystycznych.
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto grid sm:grid-cols-3 gap-4 p-4">
      <StatCard
        icon={<Dumbbell className="w-6 h-6 text-cyan-400" />}
        label="Treningi"
        value={history.length}
      />
      <StatCard
        icon={<Flame className="w-6 h-6 text-emerald-400" />}
        label="Średnia objętość"
        value={`${stats.avgVolume} kg`}
      />
      <StatCard
        icon={<BarChart3 className="w-6 h-6 text-amber-400" />}
        label="Łączna objętość"
        value={`${stats.totalVolume} kg`}
      />
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-center">
      <div className="flex justify-center mb-2">{icon}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-sm text-white/60">{label}</div>
    </div>
  );
}
