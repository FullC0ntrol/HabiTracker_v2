/* eslint-disable no-unused-vars */
import {
  Dumbbell,
  CheckCircle2,
  X,
  ClipboardList,
  Timer,
  BarChart3,
  ListChecks,
} from "lucide-react";
import { useMemo } from "react";

// ====================================================================
// POMOCNICZE FUNKCJE (HELPERS)
// ====================================================================

/** Formatowanie liczby z opcjonalnym sufiksem, zwraca '—' dla wartości pustej/null. */
function fmt(val, suffix = "") {
  return val || val === 0 ? `${val} ${suffix}`.trim() : "—";
}

/** Oblicza objętość (ciężar * powtórzenia) dla danego zestawu ćwiczeń. */
function calcExerciseVolume(sets = []) {
  return sets.reduce(
    (acc, s) => acc + (Number(s.weight) || 0) * (Number(s.reps) || 0),
    0
  );
}

/** Oblicza całkowitą objętość treningu. */
function calcTotalVolume(exercises = []) {
  return exercises.reduce((sum, ex) => sum + calcExerciseVolume(ex.sets), 0);
}

/** Formatowanie objętości treningowej w formacie "1 234 kg·powt". */
function formatVolume(v) {
  if (!v || v < 0.1) return "—";
  const intl = new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 0 });
  return intl.format(v) + " kg·powt";
}


// ====================================================================
// MAŁE KOMPONENTY UI
// ====================================================================

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

// eslint-disable-next-line no-unused-vars
function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 transition duration-200 hover:border-cyan-400/40">
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

function HabitItem({ habit, isCompleted }) {
    const Icon = isCompleted ? CheckCircle2 : X;
    const colorClass = isCompleted ? "text-green-400" : "text-red-400";
    const bgClass = isCompleted ? "bg-green-400/10" : "bg-red-400/10";

    return (
        <li className="flex items-center justify-between p-3 border-b border-white/5 last:border-b-0">
            <span className="font-medium text-sm">{habit.name}</span>
            <div className={`p-1.5 rounded-full ${bgClass} ${colorClass}`}>
                <Icon className="w-4 h-4" />
            </div>
        </li>
    );
}

function ExerciseItem({ ex }) {
  const exVol = calcExerciseVolume(ex.sets);
  return (
    <div className="p-4 transition duration-150 hover:bg-white/5">
      <div className="flex items-start justify-between flex-wrap gap-2 pb-2">
        <div>
          <div className="font-semibold text-base truncate">{ex.name}</div>
          {ex.muscle && <div className="text-xs opacity-70 mt-0.5 italic">{ex.muscle}</div>}
        </div>
        <div className="text-sm font-medium text-cyan-400/90 whitespace-nowrap">
          {exVol ? `Objętość: ${formatVolume(exVol)}` : ""}
        </div>
      </div>

      {/* Zestawy */}
      <div className="mt-3 overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full text-[13px] min-w-[400px]">
          <thead className="bg-white/5">
            <tr className="text-left opacity-90 text-xs uppercase tracking-wider">
              <th className="py-2 px-3">#</th>
              <th className="py-2 px-3">Ciężar</th>
              <th className="py-2 px-3">Powt.</th>
              <th className="py-2 px-3">RPE</th>
              <th className="py-2 px-3">Notatka</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {ex.sets?.map((s, i) => (
              <tr key={i} className="transition-colors hover:bg-white/5">
                <td className="py-2 px-3 font-mono text-cyan-300">{s.setNo ?? i + 1}</td>
                <td className="py-2 px-3 font-medium">{fmt(s.weight, "kg")}</td>
                <td className="py-2 px-3">{fmt(s.reps)}</td>
                <td className="py-2 px-3">{fmt(s.rpe)}</td>
                <td className="py-2 px-3 text-white/80">{s.notes || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


// ====================================================================
// GŁÓWNY KOMPONENT MODALNY
// ====================================================================

/**
 * Modal ze szczegółami dnia (trening, nawyki, statystyki)
 * @param {{
 * dateStr: string,
 * onClose: () => void,
 * habits: { id: string, name: string }[],
 * entriesMap: { [habitId: string]: boolean },
 * workout: { durationMin?: number, totalVolume?: number, exercises: { id: string, name: string, muscle?: string, sets: { setNo?: number, weight?: number, reps?: number, rpe?: number, notes?: string }[] }[] } | null
 * }} props
 */
export function DayDetailsModal({
  dateStr,
  onClose,
  habits = [],
  entriesMap = {},
  workout = {},
}) {
  // Formatowanie daty PL
  const prettyDate = useMemo(() => {
    if (!dateStr) return "—";
    const d = new Date(`${dateStr}T12:00:00`); // unikamy przesunięć strefowych
    const formatted = d.toLocaleDateString("pl-PL", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }, [dateStr]);

  const {
    durationMin = 0,
    totalVolume = 0,
    exercises = [],
  } = workout ?? {};

  const effectiveTotalVolume = totalVolume || calcTotalVolume(exercises);
  const exercisesCount = exercises.length;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="day-details-title"
    >
      {/* Backdrop */}
      <button
        onClick={onClose}
        aria-label="Zamknij"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 hover:bg-black/80"
      />

      {/* Główne okno */}
      <div className="relative w-full sm:max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0b1224]/95 to-[#0b0f1c]/95 shadow-2xl text-white transform transition-all duration-300 translate-y-0 sm:scale-100">
        
        {/* Pasek nagłówka */}
        <header className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/[0.03] sticky top-0 z-10">
          <div>
            <div className="text-xs uppercase tracking-widest text-white/70">Szczegóły dnia</div>
            <h2 id="day-details-title" className="font-extrabold text-xl sm:text-2xl truncate mt-1">
              {prettyDate}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl border border-white/10 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 transition-colors"
            aria-label="Zamknij okno szczegółów"
          >
            <X className="w-5 h-5 text-white/80" />
          </button>
        </header>

        {/* Zawartość */}
        <div className="overflow-y-auto max-h-[calc(90vh-70px-65px)] p-5 space-y-6">
          
          {/* Statystyki dnia */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <StatCard icon={Timer} label="Czas treningu" value={durationMin ? `${durationMin} min` : "—"} />
            <StatCard icon={BarChart3} label="Objętość całkowita" value={formatVolume(effectiveTotalVolume)} />
            <StatCard icon={ClipboardList} label="Liczba ćwiczeń" value={String(exercisesCount)} />
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Nawyki (sekcja nowa) */}
            <div className="lg:col-span-1">
                <Section title="Nawyki" icon={ListChecks}>
                    {habits.length === 0 ? (
                        <EmptyState
                            title="Brak nawyków do śledzenia"
                            subtitle="Dodaj nawyki, aby zobaczyć ich status."
                        />
                    ) : (
                        <ul className="divide-y divide-white/10 p-2">
                            {habits.map((habit) => (
                                <HabitItem 
                                    key={habit.id} 
                                    habit={habit} 
                                    isCompleted={!!entriesMap[habit.id]} 
                                />
                            ))}
                        </ul>
                    )}
                </Section>
            </div>

            {/* Lista ćwiczeń */}
            <div className="lg:col-span-2">
                <Section title="Wykonane ćwiczenia" icon={Dumbbell}>
                    {exercisesCount === 0 ? (
                        <EmptyState
                            title="Brak zapisanych ćwiczeń"
                            subtitle="Trening nie został zapisany lub wykonany."
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

        {/* Pasek na dole */}
        <footer className="px-5 py-4 border-t border-white/10 bg-white/[0.03] flex justify-end sticky bottom-0 z-10">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-bold shadow-lg shadow-cyan-900/50 transition transform hover:scale-[1.02]"
          >
            Zamknij
          </button>
        </footer>
      </div>
    </div>
  );
}

// Komponent eksportowany, zgodnie z wymogami projektu
export default DayDetailsModal;