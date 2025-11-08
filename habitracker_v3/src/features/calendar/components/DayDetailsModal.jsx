import {
  Dumbbell,
  CheckCircle2,
  X,
  ClipboardList,
  Timer,
  ListChecks,
  Loader2,
  Clock,
} from "lucide-react";
import { useMemo, useEffect, useState } from "react";
import { workoutService } from "../../workout/services/workout.service";

/* ====================== HELPERY ====================== */
function fmt(val, suffix = "") {
  return val || val === 0 ? `${val} ${suffix}`.trim() : "—";
}

/* ====================== SUBKOMPONENTY ====================== */
function Section({ title, icon: Icon, children }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
      <header className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
        <div className="p-1.5 rounded-lg bg-cyan-400/10 border border-cyan-400/20 text-cyan-100">
          <Icon className="w-4 h-4" />
        </div>
        <h3 className="font-semibold">{title}</h3>
      </header>
      {children}
    </section>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-cyan-400">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[11px] opacity-80 uppercase">{label}</span>
          <div className="text-lg font-bold">{value}</div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ title, subtitle }) {
  return (
    <div className="p-6 text-center text-white/70">
      <div className="text-sm font-medium">{title}</div>
      <div className="text-xs opacity-80 mt-1">{subtitle}</div>
    </div>
  );
}

function ExerciseItem({ ex }) {
  return (
    <div className="p-4 transition duration-150 hover:bg-white/5">
      <div className="flex items-start justify-between flex-wrap gap-2 pb-2">
        <div>
          <div className="font-semibold text-base truncate">{ex.name}</div>
          {ex.muscle && (
            <div className="text-xs opacity-70 mt-0.5 italic">{ex.muscle}</div>
          )}
        </div>
      </div>

      <div className="mt-3 overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full text-[13px] min-w-[400px]">
          <thead className="bg-white/5">
            <tr className="text-left opacity-90 text-xs uppercase tracking-wider">
              <th className="py-2 px-3">#</th>
              <th className="py-2 px-3">Ciężar</th>
              <th className="py-2 px-3">Powt.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {ex.sets?.map((s, i) => (
              <tr key={i} className="hover:bg-white/5">
                <td className="py-2 px-3 font-mono text-cyan-300">
                  {s.setNo ?? i + 1}
                </td>
                <td className="py-2 px-3 font-medium">
                  {fmt(s.weight, "kg")}
                </td>
                <td className="py-2 px-3">{fmt(s.reps)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HabitItem({ habit, isCompleted }) {
  const Icon = isCompleted ? CheckCircle2 : X;
  const color = isCompleted ? "text-green-400" : "text-red-400";
  const bg = isCompleted ? "bg-green-400/10" : "bg-red-400/10";
  return (
    <li className="flex items-center justify-between p-3 border-b border-white/5 last:border-b-0">
      <span className="font-medium text-sm">{habit.name}</span>
      <div className={`p-1.5 rounded-full ${bg} ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
    </li>
  );
}

/* ====================== GŁÓWNY KOMPONENT ====================== */
export function DayDetailsModal({ dateStr, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dateStr) return;
    (async () => {
      setLoading(true);
      const res = await workoutService.getWorkoutDetails(dateStr);
      setData(res);
      setLoading(false);
    })();
  }, [dateStr]);

  const prettyDate = useMemo(() => {
    if (!dateStr) return "—";
    const d = new Date(`${dateStr}T12:00:00`);
    const formatted = d.toLocaleDateString("pl-PL", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }, [dateStr]);

  const exercises = data?.exercises ?? [];
  const habits = data?.habits ?? [];
  const entriesMap = data?.entriesMap ?? {};

  const durationMin = data?.durationMin || 0;
  const startedAt = data?.startedAt
    ? new Date(data.startedAt).toLocaleTimeString("pl-PL", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-3 sm:p-6">
      <button
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />
      <div className="relative w-full sm:max-w-4xl max-h-[90vh] rounded-2xl border border-white/10 bg-gradient-to-br from-[#0b1224]/95 to-[#0b0f1c]/95 shadow-2xl text-white overflow-hidden">
        <header className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/[0.03]">
          <div>
            <div className="text-xs uppercase tracking-widest text-white/70">
              Szczegóły dnia
            </div>
            <h2 className="font-extrabold text-xl sm:text-2xl truncate mt-1">
              {prettyDate}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl border border-white/10 hover:bg-white/10"
          >
            <X className="w-5 h-5 text-white/80" />
          </button>
        </header>

        {loading ? (
          <div className="flex items-center justify-center h-64 text-white/70">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Ładowanie danych...
          </div>
        ) : (
          <div className="overflow-y-auto p-5 space-y-6">
            <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <StatCard
                icon={Clock}
                label="Rozpoczęto"
                value={startedAt}
              />
              <StatCard
                icon={Timer}
                label="Czas trwania"
                value={durationMin ? `${durationMin} min` : "—"}
              />
              <StatCard
                icon={ClipboardList}
                label="Ćwiczenia"
                value={String(exercises.length)}
              />
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <Section title="Nawyki" icon={ListChecks}>
                  {habits.length === 0 ? (
                    <EmptyState
                      title="Brak nawyków"
                      subtitle="Nie dodano jeszcze żadnych nawyków."
                    />
                  ) : (
                    <ul className="divide-y divide-white/10 p-2">
                      {habits.map((h) => (
                        <HabitItem
                          key={h.id}
                          habit={h}
                          isCompleted={!!entriesMap[h.id]}
                        />
                      ))}
                    </ul>
                  )}
                </Section>
              </div>

              <div className="lg:col-span-2">
                <Section title="Wykonane ćwiczenia" icon={Dumbbell}>
                  {exercises.length === 0 ? (
                    <EmptyState
                      title="Brak ćwiczeń"
                      subtitle="Nie zapisano żadnego treningu tego dnia."
                    />
                  ) : (
                    <div className="divide-y divide-white/10">
                      {exercises.map((ex) => (
                        <ExerciseItem key={ex.id} ex={ex} />
                      ))}
                    </div>
                  )}
                </Section>
              </div>
            </div>
          </div>
        )}

        <footer className="px-5 py-4 border-t border-white/10 bg-white/[0.03] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-bold shadow-lg shadow-cyan-900/50 transition"
          >
            Zamknij
          </button>
        </footer>
      </div>
    </div>
  );
}

export default DayDetailsModal;
