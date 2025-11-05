import {
  Dumbbell,
  CheckCircle2,
  X,
  ClipboardList,
  Timer,
  BarChart3,
  NotebookPen,
} from "lucide-react";
import { useMemo } from "react";

/**
 * READ-ONLY podgląd dnia (bez przełączników i edycji).
 * Props:
 * - dateStr: YYYY-MM-DD (wymagane)
 * - onClose: () => void (wymagane)
 * - habits: { id, name }[]
 * - entriesMap: Record<habitId, number> // 1 = zrobione, 0/undefined = nie
 * - workout: {
 *     durationMin?: number,
 *     totalVolume?: number,
 *     notes?: string,
 *     exercises?: {
 *       id, name, muscle?, sets: { setNo?, weight?, reps?, rpe?, notes? }[]
 *     }[]
 *   }
 */
export function DayDetailsModal({
  dateStr,
  onClose,
  habits = [],
  entriesMap = {},
  workout = {},
}) {
  // Format ładnej daty (PL), z kapitalizacją pierwszej litery
  const prettyDate = useMemo(() => {
    if (!dateStr) return "—";
    const d = new Date(`${dateStr}T12:00:00`); // 12:00 unika przesunięć strefowych
    const s = d.toLocaleDateString("pl-PL", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return s.charAt(0).toUpperCase() + s.slice(1);
  }, [dateStr]);

  const {
    durationMin = 0,
    totalVolume = 0,
    notes = "",
    exercises = [],
  } = workout ?? {};

  const exercisesCount = exercises.length;
  const allHabitsDone =
    habits.length > 0
      ? habits.every((h) => (entriesMap[h.id] || 0) >= 1)
      : false;

  // NEW: jeśli totalVolume nieprzekazane, policz z ćwiczeń (suma wagi*powt.)
  const effectiveTotalVolume = totalVolume || calcTotalVolume(exercises);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-3"
      role="dialog"
      aria-modal="true"
      aria-labelledby="day-details-title"
    >
      {/* Backdrop */}
      <button
        onClick={onClose}
        aria-label="Zamknij"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Modal */}
      <div className="relative w-full sm:max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0b1224]/95 to-[#0b0f1c]/95 shadow-2xl text-white">
        {/* Pasek góra */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-white/10 bg-white/[0.03]">
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-wide">
              Szczegóły dnia
            </div>
            <h2
              id="day-details-title"
              className="mt-0.5 font-bold text-lg sm:text-xl truncate"
              title={prettyDate}
            >
              {prettyDate}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl border border-white/10 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
            aria-label="Zamknij okno"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Zawartość – własny scroll wewnątrz modala */}
        <div className="overflow-y-auto max-h-[calc(90vh-52px-56px)] p-5 space-y-6">
          {/* Podsumowanie dnia */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <StatCard icon={Timer} label="Czas" value={durationMin ? `${durationMin} min` : "—"} />
            <StatCard
              icon={BarChart3}
              label="Objętość"
              value={effectiveTotalVolume ? formatVolume(effectiveTotalVolume) : "—"}
            />
            <StatCard
              icon={ClipboardList}
              label="Ćwiczenia"
              value={String(exercisesCount)}
            />
          </section>

          {/* Ćwiczenia */}
          <Section title="Wykonane ćwiczenia" tone="amber" icon={Dumbbell}>
            {exercisesCount === 0 ? (
              <EmptyState
                title="Brak zapisanych ćwiczeń"
                subtitle="Dodaj serię w widoku treningu, a pojawi się tutaj."
              />
            ) : (
              <ul className="divide-y divide-white/10">
                {exercises.map((ex) => {
                  const exVol = calcExerciseVolume(ex.sets);
                  return (
                    <li key={ex.id} className="p-4">
                      {/* Nagłówek ćwiczenia */}
                      <div className="flex items-start justify-between flex-wrap gap-2">
                        <div className="min-w-0">
                          <div className="font-semibold truncate" title={ex.name}>
                            {ex.name}
                          </div>
                          {ex.muscle && (
                            <div className="text-xs opacity-80">{ex.muscle}</div>
                          )}
                        </div>
                        <div className="text-xs opacity-80">
                          {exVol ? `Objętość: ${formatVolume(exVol)}` : ""}
                        </div>
                      </div>

                      {/* Tabela / lista zestawów */}
                      <div className="mt-3">
                        {/* Widok mobile – kompaktowa lista */}
                        <div className="sm:hidden space-y-2">
                          {ex.sets?.map((s, i) => (
                            <div
                              key={i}
                              className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2"
                            >
                              <div className="text-sm font-medium">
                                Seria {s.setNo ?? i + 1}
                              </div>
                              <div className="mt-1 grid grid-cols-2 gap-y-1 text-[13px]">
                                <span className="opacity-80">Ciężar:</span>
                                <span>{fmtNum(s.weight)}{s.weight ? " kg" : ""}</span>
                                <span className="opacity-80">Powt.:</span>
                                <span>{fmtNum(s.reps)}</span>
                                <span className="opacity-80">RPE:</span>
                                <span>{fmtNum(s.rpe)}</span>
                                {s.notes ? (
                                  <>
                                    <span className="opacity-80">Notatka:</span>
                                    <span>{s.notes}</span>
                                  </>
                                ) : null}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Widok desktop – tabela */}
                        <div className="hidden sm:block overflow-x-auto">
                          <table className="w-full text-[13px]">
                            <thead>
                              <tr className="text-left opacity-90">
                                <Th>Seria</Th>
                                <Th>Ciężar</Th>
                                <Th>Powt.</Th>
                                <Th>RPE</Th>
                                <Th>Notatka</Th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {ex.sets?.map((s, i) => (
                                <tr key={i} className="align-top">
                                  <Td>{s.setNo ?? i + 1}</Td>
                                  <Td>
                                    {fmtNum(s.weight)} {s.weight ? "kg" : ""}
                                  </Td>
                                  <Td>{fmtNum(s.reps)}</Td>
                                  <Td>{fmtNum(s.rpe)}</Td>
                                  <Td>{s.notes || ""}</Td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Section>

          {/* Notatki dnia — USUNIĘTE zgodnie z prośbą */}
        </div>

        {/* Pasek dół */}
        <div className="px-5 py-4 border-t border-white/10 bg-white/[0.03] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-semibold"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============== Małe, spójne klocki UI ============== */

function Section({ title, icon: Icon, tone = "neutral", right, children }) {
  const toneBg =
    tone === "amber"
      ? "bg-amber-400/15 border-amber-300/20 text-amber-100"
      : tone === "cyan"
      ? "bg-cyan-400/15 border-cyan-300/20 text-cyan-100"
      : tone === "emerald"
      ? "bg-emerald-400/15 border-emerald-300/20 text-emerald-100"
      : "bg-white/10 border-white/20";

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg border ${toneBg}`}>
            <Icon className="w-4 h-4" />
          </div>
          <h3 className="font-semibold">{title}</h3>
        </div>
        {right ?? null}
      </header>
      {children}
    </section>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-white/5 border border-white/10">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] opacity-80">{label}</span>
          <span className="text-base font-semibold">{value}</span>
        </div>
      </div>
    </div>
  );
}

function Th({ children }) {
  return <th className="py-1.5 pr-3 font-medium">{children}</th>;
}
function Td({ children, className = "" }) {
  return <td className={`py-2 pr-3 ${className}`}>{children}</td>;
}

function EmptyState({ title, subtitle }) {
  return (
    <div className="p-6 text-center">
      <div className="text-sm font-medium">{title}</div>
      <div className="text-xs opacity-80 mt-1">{subtitle}</div>
    </div>
  );
}

/* ============== Helpers ============== */

function fmtNum(n) {
  return n || n === 0 ? String(n) : "—";
}

function calcExerciseVolume(sets = []) {
  return sets.reduce(
    (acc, s) => acc + (Number(s.weight) || 0) * (Number(s.reps) || 0),
    0
  );
}

function calcTotalVolume(exercises = []) {
  return exercises.reduce((sum, ex) => sum + calcExerciseVolume(ex.sets), 0);
}

function formatVolume(v) {
  if (!v) return "—";
  const intl = new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 0 });
  return intl.format(v) + " kg·powt";
}
