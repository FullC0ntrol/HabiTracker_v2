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
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-[rgba(var(--rgb-primary),_0.3)] border-t-[var(--color-primary)] rounded-full animate-spin mr-2" />
        <span className="text-[rgba(var(--rgb-white),_0.6)] text-sm">Ładowanie historii...</span>
      </div>
    );

  if (history.length === 0)
    return (
      <div className="text-center py-8">
        <Dumbbell className="w-8 h-8 mx-auto mb-2 text-[color:var(--color-primary-300)]/40" />
        <p className="text-[rgba(var(--rgb-white),_0.4)] text-sm">Brak zakończonych treningów</p>
      </div>
    );

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <CalendarDays className="w-5 h-5 text-[var(--color-primary-300)]" />
        Historia treningów
      </h2>

      <div className="space-y-2">
        {history.map((h) => (
          <div
            key={h.id}
            className="bg-[rgba(var(--rgb-white),_0.05)] backdrop-blur-md rounded-xl border border-[rgba(var(--rgb-primary),_0.2)] p-3 flex items-center justify-between hover:bg-[rgba(var(--rgb-primary),_0.05)] transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="font-medium text-white text-sm truncate">
                {h.name}
              </div>
              <div className="text-xs text-[color:var(--color-primary-300)]/60 mt-0.5">
                {format(new Date(h.date), "d MMM yyyy", { locale: pl })} •{" "}
                <span className="text-[var(--color-secondary-400)]">{h.totalSets} serii</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[var(--color-primary-300)] font-semibold text-sm">
                {h.volume}kg
              </div>
              <div className="text-[10px] text-[color:var(--color-primary-300)]/40">objętość</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}