import { useEffect, useState } from "react";
import { Dumbbell, CalendarDays } from "lucide-react";
import { workoutService } from "../services/workout.service";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

export default function WorkoutHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await workoutService.getHistory();
        setHistory(data);
      } catch (err) {
        console.error("Błąd ładowania historii:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading)
    return <div className="text-white/70 p-6">Ładowanie historii...</div>;

  if (history.length === 0)
    return (
      <div className="text-center text-white/70 py-12">
        <Dumbbell className="w-10 h-10 mx-auto mb-3 text-cyan-400" />
        <p>Brak zakończonych treningów</p>
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
        <CalendarDays className="w-6 h-6 text-cyan-400" />
        Historia treningów
      </h2>

      <ul className="space-y-3">
        {history.map((h) => (
          <li
            key={h.id}
            className="rounded-xl border border-white/10 bg-white/[0.04] p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="font-semibold text-white">{h.name}</div>
              <div className="text-sm text-white/60">
                {format(new Date(h.date), "d MMMM yyyy", { locale: pl })} —{" "}
                <span className="text-cyan-300 font-medium">
                  {h.totalSets} serii
                </span>
              </div>
            </div>
            <div className="text-right mt-2 sm:mt-0">
              <div className="text-emerald-400 font-semibold">
                {h.volume} kg
              </div>
              <div className="text-[11px] text-white/50">objętość</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
