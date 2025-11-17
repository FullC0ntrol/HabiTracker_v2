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
    <section className="rounded-2xl border border-[rgba(var(--rgb-white),0.1)] bg-[rgba(var(--rgb-white),0.05)] backdrop-blur-sm overflow-hidden shadow-[0_0_20px_rgba(var(--rgb-primary),0.1)]">
      <header className="flex items-center gap-2 px-4 py-3 border-b border-[rgba(var(--rgb-white),0.1)] bg-gradient-to-r from-[rgba(var(--rgb-primary),0.1)] to-[rgba(var(--rgb-secondary),0.1)]">
        <div className="p-1.5 rounded-lg bg-[rgba(var(--rgb-secondary-400),0.1)] border border-[rgba(var(--rgb-secondary-400),0.2)] text-[var(--color-secondary-200)]">
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
    <div className="rounded-2xl border border-[rgba(var(--rgb-white),0.1)] bg-gradient-to-br from-[rgba(var(--rgb-primary-900),0.2)] to-[rgba(var(--rgb-secondary-900),0.2)] p-4 shadow-inner shadow-[var(--color-primary)]/10">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-[rgba(var(--rgb-white),0.05)] border border-[rgba(var(--rgb-white),0.1)] text-[var(--color-secondary-400)]">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[11px] opacity-80 uppercase">{label}</span>
          <div className="text-lg font-bold text-[var(--color-text-base)]">{value}</div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ title, subtitle }) {
  return (
    <div className="p-6 text-center text-[rgba(var(--rgb-white),0.6)]">
      <div className="text-sm font-medium">{title}</div>
      <div className="text-xs opacity-70 mt-1">{subtitle}</div>
    </div>
  );
}

function ExerciseItem({ ex }) {
  return (
    <div className="p-4 transition duration-150 hover:bg-[rgba(var(--rgb-white),0.05)]">
      <div className="flex items-start justify-between flex-wrap gap-2 pb-2">
        <div>
          <div className="font-semibold text-base truncate">{ex.name}</div>
          {ex.muscle && (
            <div className="text-xs opacity-70 mt-0.5 italic">{ex.muscle}</div>
          )}
        </div>
      </div>

      <div className="mt-3 overflow-x-auto rounded-lg border border-[rgba(var(--rgb-white),0.1)]">
        <table className="w-full text-[13px] min-w-[400px]">
          <thead className="bg-[rgba(var(--rgb-white),0.05)] text-[rgba(var(--rgb-white),0.7)]">
            <tr className="text-left text-xs uppercase tracking-wider">
              <th className="py-2 px-3">#</th>
              <th className="py-2 px-3">Ciężar</th>
              <th className="py-2 px-3">Powt.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(var(--rgb-white),0.1)]">
            {ex.sets?.map((s, i) => (
              <tr key={i} className="hover:bg-[rgba(var(--rgb-white),0.05)]">
                <td className="py-2 px-3 font-mono text-[var(--color-secondary-300)]">
                  {s.setNo ?? i + 1}
                </td>
                <td className="py-2 px-3">{fmt(s.weight, "kg")}</td>
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
  const color = isCompleted ? "text-[var(--color-primary-400)]" : "text-[var(--color-danger-400)]";
  const bg = isCompleted ? "bg-[rgba(var(--rgb-primary-400),0.1)]" : "bg-[rgba(var(--rgb-danger-400),0.1)]";
  return (
    <li className="flex items-center justify-between p-3 border-b border-[rgba(var(--rgb-white),0.05)] last:border-b-0">
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

  const startedAt = data?.startedAt
    ? new Date(data.startedAt).toLocaleTimeString("pl-PL", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  const durationMin = useMemo(() => {
    if (!data?.startedAt) return 0;
    const start = new Date(data.startedAt);
    const end =
      data?.durationMin > 0
        ? new Date(start.getTime() + data.durationMin * 60 * 1000)
        : new Date();
    const diff = Math.max(0, Math.floor((end - start) / 60000));
    return diff;
  }, [data]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <button
        onClick={onClose}
        className="absolute inset-0 bg-[rgba(var(--rgb-black),0.7)] backdrop-blur-sm"
      />
      <div className="relative w-full sm:max-w-4xl max-h-[90vh] rounded-2xl border border-[rgba(var(--rgb-white),0.1)] bg-gradient-to-br from-[var(--color-bg-modal-from)]/95 to-[var(--color-bg-modal-to)]/95 shadow-[0_0_40px_rgba(var(--rgb-primary),0.2)] text-[var(--color-text-base)] flex flex-col overflow-hidden animate-slideUp">
        <header className="flex items-center justify-between px-5 py-4 border-b border-[rgba(var(--rgb-white),0.1)] bg-gradient-to-r from-[rgba(var(--rgb-primary),0.1)] to-[rgba(var(--rgb-secondary),0.1)]">
          <div>
            <div className="text-xs uppercase tracking-widest text-[rgba(var(--rgb-white),0.7)]">
              Szczegóły dnia
            </div>
            <h2 className="font-extrabold text-xl sm:text-2xl truncate mt-1">
              {prettyDate}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl border border-[rgba(var(--rgb-white),0.1)] hover:bg-[rgba(var(--rgb-white),0.1)] transition"
          >
            <X className="w-5 h-5 text-[var(--color-text-muted)]" />
          </button>
        </header>

        {loading ? (
          <div className="flex items-center justify-center flex-1 text-[rgba(var(--rgb-white),0.7)]">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Ładowanie danych...
          </div>
        ) : (
          <div className="p-5 space-y-6 overflow-y-auto flex-1 pr-2 custom-scroll">
            <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <StatCard icon={Clock} label="Rozpoczęto" value={startedAt} />
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
                    <ul className="divide-y divide-[rgba(var(--rgb-white),0.1)] p-2">
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
                    <div className="divide-y divide-[rgba(var(--rgb-white),0.1)]">
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

        <footer className="px-5 py-4 border-t border-[rgba(var(--rgb-white),0.1)] bg-gradient-to-r from-[rgba(var(--rgb-secondary),0.1)] to-[rgba(var(--rgb-primary),0.1)] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] font-bold shadow-lg shadow-[var(--color-primary-900)]/40 hover:opacity-90 transition"
          >
            Zamknij
          </button>
        </footer>
      </div>

      {/* Scrollbar i animacje */}
      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 8px; }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(var(--rgb-primary),0.6), rgba(var(--rgb-secondary),0.3));
          border-radius: 9999px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, rgba(var(--rgb-primary),0.9), rgba(var(--rgb-secondary),0.5));
        }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll { scrollbar-width: thin; scrollbar-color: rgba(var(--rgb-primary),0.6) transparent; }

        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(40px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }

        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideUp { animation: slideUp 0.4s ease-out; }
      `}</style>
    </div>
  );
}

export default DayDetailsModal;