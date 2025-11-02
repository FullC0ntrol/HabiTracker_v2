import { Dumbbell, CheckCircle2, X, ClipboardList, Timer, BarChart3, NotebookPen } from "lucide-react";
import { useMemo } from "react";

/**
 * Ładne okienko dzienne – tylko podgląd (bez przełączników):
 * - sekcja podsumowania: czas trwania, objętość, liczba ćwiczeń
 * - lista ćwiczeń z tabelką serii (ciężar, powt., RPE, notatka)
 * - nawyki (siatka chipów, odczyt z propsów)
 *
 * API:
 * - dateStr: YYYY-MM-DD
 * - onClose: () => void
 * - habits: Array<{ id: string|number, name: string }>
 * - entriesMap: Record<habitId, number>  // 1 = zrobione
 * - workout: {
 *     durationMin?: number,
 *     totalVolume?: number,  // suma (weight*reps)
 *     notes?: string,
 *     exercises?: Array<{
 *       id: string|number,
 *       name: string,
 *       muscle?: string,
 *       sets: Array<{ setNo?: number, weight?: number, reps?: number, rpe?: number, notes?: string }>
 *     }>
 *   }
 *
 * Wszystko jest opcjonalne – ładne puste stany, jeśli nie ma danych.
 */
export function DayDetailsModal({ dateStr, onClose, habits = [], entriesMap = {}, workout = {} }) {
  const pretty = useMemo(() => new Date(dateStr + "T00:00:00"), [dateStr]);

  const { durationMin = 0, totalVolume = 0, notes = "", exercises = [] } = workout ?? {};
  const exercisesCount = exercises.length;

  const allHabitsDone = habits.length > 0 ? habits.every(h => (entriesMap[h.id] || 0) >= 1) : false;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-3">
      {/* tło z rozmyciem i lekką winietą */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:max-w-2xl rounded-2xl border border-white/10 bg-gradient-to-br from-[#0b1224]/95 to-[#0b0f1c]/95 shadow-2xl overflow-hidden">
        {/* górny pasek */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400">Szczegóły dnia</span>
            <span className="font-bold text-lg">
              {pretty.toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70">
            <X className="w-5 h-5 text-gray-200" />
          </button>
        </div>

        {/* zawartość */}
        <div className="p-5 space-y-6">
          {/* podsumowanie dnia */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <StatCard icon={Timer} label="Czas" value={durationMin ? `${durationMin} min` : "—"} />
            <StatCard icon={BarChart3} label="Objętość" value={totalVolume ? formatVolume(totalVolume) : "—"} />
            <StatCard icon={ClipboardList} label="Ćwiczenia" value={String(exercisesCount)} />
          </section>

          {/* ćwiczenia */}
          <section className="rounded-2xl border border-white/10 bg-white/5">
            <header className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-400/15 border border-amber-300/20">
                  <Dumbbell className="w-4 h-4 text-amber-200" />
                </div>
                <h3 className="font-semibold">Wykonane ćwiczenia</h3>
              </div>
            </header>

            {exercisesCount === 0 ? (
              <EmptyState title="Brak zapisanych ćwiczeń" subtitle="Dodaj serię w widoku treningu, a pojawi się tutaj." />)
            : (
              <ul className="divide-y divide-white/10">
                {exercises.map((ex) => (
                  <li key={ex.id} className="p-4">
                    <div className="flex items-start justify-between flex-wrap gap-2">
                      <div>
                        <div className="font-semibold">{ex.name}</div>
                        {ex.muscle && (
                          <div className="text-xs text-gray-400">{ex.muscle}</div>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">
                        {calcExerciseVolume(ex.sets) ? `objętość: ${formatVolume(calcExerciseVolume(ex.sets))}` : ""}
                      </div>
                    </div>

                    <div className="mt-3 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-gray-300">
                            <th className="py-1 pr-3 font-medium">Seria</th>
                            <th className="py-1 pr-3 font-medium">Ciężar</th>
                            <th className="py-1 pr-3 font-medium">Powt.</th>
                            <th className="py-1 pr-3 font-medium">RPE</th>
                            <th className="py-1 pr-3 font-medium">Notatka</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {ex.sets?.map((s, i) => (
                            <tr key={i} className="align-top">
                              <td className="py-2 pr-3 text-gray-200">{s.setNo ?? i + 1}</td>
                              <td className="py-2 pr-3">{fmtNum(s.weight)} {s.weight ? "kg" : ""}</td>
                              <td className="py-2 pr-3">{fmtNum(s.reps)}</td>
                              <td className="py-2 pr-3">{fmtNum(s.rpe)}</td>
                              <td className="py-2 pr-3 text-gray-300">{s.notes || ""}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* notatki dnia */}
          <section className="rounded-2xl border border-white/10 bg-white/5">
            <header className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
              <div className="p-1.5 rounded-lg bg-cyan-400/15 border border-cyan-300/20">
                <NotebookPen className="w-4 h-4 text-cyan-200" />
              </div>
              <h3 className="font-semibold">Notatki dnia</h3>
            </header>
            <div className="p-4 text-sm text-gray-200 min-h-[2.25rem] whitespace-pre-wrap">
              {notes?.trim() ? notes : <span className="text-gray-400">Brak notatek.</span>}
            </div>
          </section>

          {/* nawyki */}
          <section className="rounded-2xl border border-white/10 bg-white/5">
            <header className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-400/15 border border-emerald-300/20">
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                </div>
                <h3 className="font-semibold">Nawyki</h3>
              </div>
              <span className={`text-xs px-2 py-1 rounded-md border ${allHabitsDone ? "bg-emerald-500/15 text-emerald-200 border-emerald-400/30" : "bg-white/5 text-gray-300 border-white/10"}`}>
                {allHabitsDone ? "Wszystkie zrobione" : "Nie wszystkie zrobione"}
              </span>
            </header>

            {habits.length === 0 ? (
              <EmptyState title="Brak zdefiniowanych nawyków" subtitle="Dodaj nawyk, aby śledzić postępy." />
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-4">
                {habits.map(h => {
                  const done = (entriesMap[h.id] || 0) >= 1;
                  return (
                    <li key={h.id} className={`flex items-center justify-between rounded-xl border px-3 py-2 ${done ? "bg-emerald-500/10 border-emerald-400/20" : "bg-white/5 border-white/10"}`}>
                      <span className="font-medium text-sm">{h.name}</span>
                      <span className={`text-xs px-2 py-1 rounded-md border ${done ? "bg-emerald-500/15 text-emerald-200 border-emerald-400/30" : "bg-white/5 text-gray-300 border-white/10"}`}>
                        {done ? "zrobione" : "niezrobione"}
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </div>

        {/* dolny pasek */}
        <div className="px-5 py-4 border-t border-white/10 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-semibold">
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-white/5 border border-white/10">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-gray-400">{label}</span>
          <span className="text-base font-semibold">{value}</span>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ title, subtitle }) {
  return (
    <div className="p-6 text-center">
      <div className="text-sm font-medium text-gray-200">{title}</div>
      <div className="text-xs text-gray-400 mt-1">{subtitle}</div>
    </div>
  );
}

function fmtNum(n) {
  return (n || n === 0) ? String(n) : "—";
}

function calcExerciseVolume(sets = []) {
  return sets.reduce((acc, s) => acc + (Number(s.weight) || 0) * (Number(s.reps) || 0), 0);
}

function formatVolume(v) {
  if (!v) return "—";
  const intl = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });
  return intl.format(v) + " kg·powt";
}
