import { useState, useMemo } from "react";
import { useExercises } from "../hooks/useExercises";
import { Plus, Dumbbell, Edit3, Trash2, Filter } from "lucide-react";

// Definicja stałych kategorii
const MUSCLE_CATEGORIES = [
  { value: "wszystkie", label: "Wszystkie", icon: "🎯" },
  { value: "klatka", label: "Klatka", icon: "💪" },
  { value: "plecy", label: "Plecy", icon: "🦸" },
  { value: "nogi", label: "Nogi", icon: "🦵" },
  { value: "barki", label: "Barki", icon: "🏋️" },
  { value: "biceps", label: "Biceps", icon: "💪" },
  { value: "triceps", label: "Triceps", icon: "🔧" },
  { value: "brzuch", label: "Brzuch", icon: "⭐" },
  { value: "cardio", label: "Cardio", icon: "❤️" },
  { value: "inne", label: "Inne", icon: "✨" },
];

export default function ExercisesPage() {
  const { list: exercises, addExercise, patchExercise, removeExercise } = useExercises();
  
  const [newExerciseName, setNewExerciseName] = useState("");
  const [newExerciseCategory, setNewExerciseCategory] = useState("inne");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("wszystkie");

  // Filtrowanie ćwiczeń
  const filteredExercises = useMemo(() => {
    if (activeCategoryFilter === "wszystkie") {
      return exercises;
    }
    return exercises.filter((ex) => ex.category === activeCategoryFilter);
  }, [exercises, activeCategoryFilter]);

  // Obsługa dodawania ćwiczenia
  const handleAddExercise = () => {
    const trimmedName = newExerciseName.trim();
    if (!trimmedName) return;
    
    addExercise({ name: trimmedName, category: newExerciseCategory });
    setNewExerciseName("");
  };

  // Obsługa edycji ćwiczenia
  const handleEditExercise = (exercise) => {
    const currentName = exercise.name || "";
    const newName = window.prompt("Nowa nazwa ćwiczenia:", currentName);
    
    if (!newName) return;
    
    const trimmedName = newName.trim();
    if (trimmedName && trimmedName !== currentName) {
      patchExercise(exercise.id, { name: trimmedName });
    }
  };

  return (
    <div className="min-h-screen bg-mesh text-white px-3 py-4">
      <div className="max-w-md mx-auto space-y-4">
        
        {/* ## Wycentrowany nagłówek */}
        <header className="text-center space-y-3">
          <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[rgb(var(--rgb-primary))] to-[rgb(var(--color-secondary))] flex items-center justify-center shadow-lg">
              <Dumbbell className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[rgb(var(--color-primary-light))] to-[rgb(var(--color-secondary))] bg-clip-text text-transparent">
                Ćwiczenia
              </h1>
              <p className="text-white/70 text-sm">
                Twoja baza ćwiczeń
              </p>
            </div>
          </div>

          {/* Statystyki */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/10 backdrop-blur-md p-3 text-center border border-white/15">
              <div className="text-lg font-bold text-white">{exercises.length}</div>
              <p className="text-white/60 text-xs">Wszystkie</p>
            </div>
            <div className="rounded-xl bg-[rgb(var(--rgb-primary))]/20 backdrop-blur-md p-3 text-center border border-[rgb(var(--color-primary-light))]/30">
              <div className="text-lg font-bold text-[rgb(var(--color-primary-light))]">
                {filteredExercises.length}
              </div>
              <p className="text-[rgb(var(--color-primary-light))]/70 text-xs">Po filtrze</p>
            </div>
          </div>
        </header>

        {/* ## Kompaktowy formularz dodawania */}
        <section className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4 space-y-3">
          <h2 className="text-base font-semibold text-white text-center flex items-center justify-center gap-2">
            <Plus className="w-4 h-4 text-[rgb(var(--color-primary-light))]" />
            Dodaj ćwiczenie
          </h2>
          
          <div className="space-y-3">
            <input
              value={newExerciseName}
              onChange={(e) => setNewExerciseName(e.target.value)}
              placeholder="Nazwa ćwiczenia..."
              className="w-full rounded-lg px-3 py-2.5 text-sm bg-white/5 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:border-[rgb(var(--color-primary-light))]"
              onKeyDown={(e) => e.key === "Enter" && handleAddExercise()}
            />

            <div className="flex gap-2">
              <select
                value={newExerciseCategory}
                onChange={(e) => setNewExerciseCategory(e.target.value)}
                className="flex-1 rounded-lg px-3 py-2.5 text-sm bg-white/5 border border-white/20 text-white focus:outline-none focus:border-[rgb(var(--color-primary-light))]"
              >
                {MUSCLE_CATEGORIES.filter((c) => c.value !== "wszystkie").map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
              
              <button
                onClick={handleAddExercise}
                disabled={!newExerciseName.trim()}
                className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-[rgb(var(--rgb-primary))] to-[rgb(var(--color-secondary))] text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Dodaj
              </button>
            </div>
          </div>
        </section>

        {/* ## Filtry kategorii - poziomy scroll */}
        <section className="space-y-2">
          <div className="flex items-center justify-center gap-2 text-white/70 text-xs">
            <Filter className="w-3 h-3" />
            Filtruj kategorie
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-2 hide-scrollbar">
            {MUSCLE_CATEGORIES.map((cat) => {
              const isActive = activeCategoryFilter === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategoryFilter(cat.value)}
                  className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-full text-xs border transition-all ${
                    isActive
                      ? "bg-[rgb(var(--rgb-primary))]/20 border-[rgb(var(--color-primary-light))]/50 text-white shadow-lg"
                      : "bg-white/5 border-white/20 text-white/70 hover:bg-white/10"
                  }`}
                >
                  <span className="text-sm">{cat.icon}</span>
                  {cat.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* ## Lista ćwiczeń z przewijaniem */}
        <section className="space-y-3">
          <div className="text-center">
            <div className="text-white/60 text-sm flex items-center justify-center gap-2">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[rgb(var(--color-primary-light))]"></span>
              <span>
                {filteredExercises.length} z {exercises.length} ćwiczeń
              </span>
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredExercises.length === 0 ? (
              <div className="text-center py-8 rounded-xl border border-dashed border-white/20 bg-white/5">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-white/10 flex items-center justify-center">
                  <Dumbbell className="w-6 h-6 text-white/40" />
                </div>
                <p className="text-white/60 text-sm">
                  Brak ćwiczeń w kategorii:{" "}
                  <span className="font-semibold text-white">
                    {MUSCLE_CATEGORIES.find(c => c.value === activeCategoryFilter)?.label}
                  </span>
                </p>
              </div>
            ) : (
              filteredExercises.map((ex) => {
                const cat = MUSCLE_CATEGORIES.find((c) => c.value === ex.category) || MUSCLE_CATEGORIES[0];

                return (
                  <article
                    key={ex.id}
                    className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 transition-all hover:border-[rgb(var(--color-primary-light))]/40"
                  >
                    <div className="flex items-start justify-between gap-3">
                      {/* Ikona i nazwa */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-lg border border-white/20">
                          {cat.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-white text-sm truncate">
                            {ex.name}
                          </h3>
                          <p className="text-white/60 text-xs">
                            {cat.label}
                          </p>
                        </div>
                      </div>

                      {/* Przyciski akcji */}
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditExercise(ex)}
                          className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/40 flex items-center justify-center hover:bg-blue-500/30 transition-all"
                          title="Edytuj"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-blue-300" />
                        </button>
                        <button
                          onClick={() => removeExercise(ex.id)}
                          className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-400/40 flex items-center justify-center hover:bg-red-500/30 transition-all"
                          title="Usuń"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-300" />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>
      </div>

      <style jsx>{`
        .hide-scrollbar {
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}