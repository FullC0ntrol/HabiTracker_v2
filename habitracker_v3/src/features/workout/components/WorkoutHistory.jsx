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
    return (
      <div className="flex items-center justify-center py-6">
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
        <span className="text-white/60 text-sm">Ładowanie...</span>
      </div>
    );

  if (history.length === 0)
    return (
      <div className="text-center py-6">
        <Dumbbell className="w-6 h-6 mx-auto mb-1 text-white/40" />
        <p className="text-white/40 text-xs">Brak zakończonych treningów</p>
      </div>
    );

  return (
    <div className="p-4">
      <h2 className="text-base font-bold text-white mb-3 flex items-center justify-center gap-2">
        <CalendarDays className="w-4 h-4 text-white" />
        Historia treningów
      </h2>

      <div className="space-y-2">
        {history.map((h) => (
          <div
            key={h.id}
            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 flex items-center justify-between hover:bg-white/15 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="font-medium text-white text-sm truncate">
                {h.name}
              </div>
              <div className="text-xs text-white/60 mt-0.5">
                {format(new Date(h.date), "d MMM yyyy", { locale: pl })} •{" "}
                <span className="text-[rgb(var(--color-secondary))]">{h.totalSets} serii</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-semibold text-sm">
                {h.volume}kg
              </div>
              <div className="text-[10px] text-white/40">objętość</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}