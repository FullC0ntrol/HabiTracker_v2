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
    <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden shadow-[0_0_20px_rgba(var(--rgb-primary),0.1)]">
      <header className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-gradient-to-r from-[rgb(var(--rgb-primary))]/10 to-[rgb(var(--color-secondary))]/10">
        <div className="p-1.5 rounded-lg bg-[rgb(var(--rgb-primary))]/10 border border-[rgb(var(--rgb-primary))]/20 text-[rgb(var(--color-primary-light))]">
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
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[rgb(var(--color-primary-dark))]/20 to-[rgb(var(--color-primary))]/20 p-4 shadow-inner shadow-[rgb(var(--rgb-primary))]/10">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-[rgb(var(--color-primary-light))]">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[11px] opacity-80 uppercase">{label}</span>
          <div className="text-lg font-bold text-white">{value}</div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ title, subtitle }) {
  return (
    <div className="p-6 text-center text-white/60">
      <div className="text-sm font-medium">{title}</div>
      <div className="text-xs opacity-70 mt-1">{subtitle}</div>
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
          <thead className="bg-white/5 text-white/70">
            <tr className="text-left text-xs uppercase tracking-wider">
              <th className="py-2 px-3">#</th>
              <th className="py-2 px-3">Ciężar</th>
              <th className="py-2 px-3">Powt.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {ex.sets?.map((s, i) => (
              <tr key={i} className="hover:bg-white/5">
                <td className="py-2 px-3 font-mono text-[rgb(var(--color-primary-light))]">
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
  const color = isCompleted
    ? "text-[rgb(var(--color-primary-light))]"
    : "text-red-400";
  const bg = isCompleted ? "bg-[rgb(var(--rgb-primary))]/10" : "bg-red-400/10";
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

  const startedAt = data?.startedAt
    ? new Date(data.startedAt).toLocaleTimeString("pl-PL", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  // 🔧 LICZENIE CZASU TYLKO NA PODSTAWIE BACKENDU
  const durationMin = useMemo(() => {
    if (!data) return null;

    // preferuj durationSec (np. z kolumny duration_sec)
    if (typeof data.durationSec === "number" && data.durationSec > 0) {
      return Math.round(data.durationSec / 60);
    }

    // fallback: jeśli backend jednak wystawia durationMin
    if (typeof data.durationMin === "number" && data.durationMin > 0) {
      return Math.round(data.durationMin);
    }

    // jak nie ma żadnej informacji – nie wymyślamy, pokazujemy brak danych
    return null;
  }, [data]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <button
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />
      <div className="relative w-full sm:max-w-4xl max-h-[90vh] rounded-2xl border border-white/10 bg-gradient-to-br from-[rgb(var(--color-bg-grad-from))]/95 to-[rgb(var(--color-bg-grad-to))]/95 shadow-[0_0_40px_rgba(var(--rgb-primary),0.2)] text-white flex flex-col overflow-hidden animate-slideUp">
        <header className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-gradient-to-r from-[rgb(var(--rgb-primary))]/10 to-[rgb(var(--color-secondary))]/10">
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
            className="p-2 rounded-xl border border-white/10 hover:bg-white/10 transition"
          >
            <X className="w-5 h-5 text-white/80" />
          </button>
        </header>

        {loading ? (
          <div className="flex items-center justify-center flex-1 text-white/70">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Ładowanie danych...
          </div>
        ) : (
          <div className="p-5 space-y-6 overflow-y-auto flex-1 pr-2 custom-scroll">
            <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <StatCard icon={Clock} label="Rozpoczęto" value={startedAt} />
              <StatCard
                icon={Timer}
                label="Czas trwania"
                value={
                  typeof durationMin === "number" && durationMin > 0
                    ? `${durationMin} min`
                    : "—"
                }
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

        <footer className="px-5 py-4 border-t border-white/10 bg-gradient-to-r from-[rgb(var(--color-secondary))]/10 to-[rgb(var(--rgb-primary))]/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[rgb(var(--rgb-primary))] to-[rgb(var(--color-secondary))] font-bold shadow-lg shadow-[rgb(var(--rgb-primary))]/40 hover:opacity-90 transition"
          >
            Zamknij
          </button>
        </footer>
      </div>

      {/* Scrollbar i animacje */}
      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 8px; }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(var(--rgb-primary),0.6), rgba(var(--color-secondary),0.3));
          border-radius: 9999px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, rgba(var(--rgb-primary),0.9), rgba(var(--color-secondary),0.5));
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
