import { useState, useMemo } from "react";
import { useExercises } from "../hooks/useExercises";
import { Plus, Dumbbell, Edit3, Trash2, Search } from "lucide-react";

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
  const { list, addExercise, patchExercise, removeExercise } = useExercises();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("inne");
  const [activeCat, setActiveCat] = useState("wszystkie");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const byCat =
      activeCat === "wszystkie"
        ? list
        : list.filter((ex) => ex.category === activeCat);

    const term = search.trim().toLowerCase();
    if (!term) return byCat;

    return byCat.filter((ex) =>
      ex.name.toLowerCase().includes(term)
    );
  }, [list, activeCat, search]);

  const handleAdd = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    addExercise({ name: trimmed, category });
    setName("");
  };

  const handleEdit = (ex) => {
    const current = ex.name || "";
    const next = window.prompt("Nowa nazwa ćwiczenia:", current);
    if (!next) return;
    const trimmed = next.trim();
    if (!trimmed || trimmed === current) return;
    patchExercise(ex.id, { name: trimmed });
  };

  return (
    <div className="min-h-screen bg-mesh text-[color:var(--color-text-base)] px-3 sm:px-4 pb-24">
      <div className="max-w-5xl mx-auto pt-4 sm:pt-6 flex flex-col gap-4 sm:gap-6">
        {/* HEADER */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl glass-strong glow-emerald flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-[color:var(--color-primary-300)]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold leading-tight">
                Biblioteka ćwiczeń
              </h1>
              <p className="text-[11px] sm:text-xs text-[color:var(--color-text-soft)]">
                Buduj własną bazę ruchów do planów treningowych
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="text-right">
              <div className="text-xs uppercase tracking-wide text-[color:var(--color-text-soft)]">
                Liczba ćwiczeń
              </div>
              <div className="text-lg sm:text-2xl font-semibold text-[color:var(--color-primary-300)]">
                {list.length}
              </div>
            </div>
          </div>
        </header>

        {/* GÓRNY PASEK: SZUKAJ + DODAJ */}
        <section className="bg-[color:var(--color-card-bg)] border border-[color:var(--color-card-border)] rounded-2xl p-4 sm:p-5 backdrop-blur-xl shadow-[0_18px_45px_rgba(0,0,0,0.55)] flex flex-col gap-3">
          {/* Search */}
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-[color:var(--color-text-soft)]" />
              </div>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Szukaj po nazwie ćwiczenia..."
                className="
                  w-full pl-9 pr-3 py-2.5 rounded-xl text-sm
                  bg-[color:var(--color-input-bg)]
                  border border-[color:var(--color-input-border)]
                  text-[color:var(--color-text-base)]
                  placeholder-[color:var(--color-muted-500)]
                  focus:outline-none focus:ring-1
                  focus:border-[rgba(var(--rgb-primary),0.8)]
                  focus:ring-[rgba(var(--rgb-primary),0.25)]
                  transition
                "
              />
            </div>

            <div className="flex gap-2">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="
                  bg-[color:var(--color-input-bg)]
                  border border-[color:var(--color-input-border)]
                  rounded-xl px-3 py-2
                  text-xs sm:text-sm
                  text-[color:var(--color-text-base)]
                  focus:outline-none focus:ring-1
                  focus:border-[rgba(var(--rgb-primary),0.8)]
                  focus:ring-[rgba(var(--rgb-primary),0.25)]
                "
              >
                {MUSCLE_CATEGORIES.filter(
                  (c) => c.value !== "wszystkie"
                ).map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Add form row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nazwa ćwiczenia (np. Wyciskanie sztangi na ławce poziomej)"
              className="
                flex-1 rounded-xl px-3 py-2.5 text-sm
                bg-[color:var(--color-input-bg)]
                border border-[color:var(--color-input-border)]
                text-[color:var(--color-text-base)]
                placeholder-[color:var(--color-muted-500)]
                focus:outline-none focus:ring-1
                focus:border-[rgba(var(--rgb-primary),0.8)]
                focus:ring-[rgba(var(--rgb-primary),0.25)]
                transition
              "
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />

            <button
              onClick={handleAdd}
              disabled={!name.trim()}
              className="
                w-full sm:w-auto px-4 py-2.5 rounded-xl
                text-sm font-semibold flex items-center justify-center gap-2
                bg-[linear-gradient(135deg,var(--color-primary),var(--color-secondary))]
                text-[color:var(--color-text-base)]
                shadow-[0_0_22px_rgba(var(--rgb-primary),0.5)]
                hover:shadow-[0_0_30px_rgba(var(--rgb-primary),0.7)]
                hover:scale-[1.02]
                active:scale-[0.98]
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-all
              "
            >
              <Plus className="w-4 h-4" />
              Dodaj ćwiczenie
            </button>
          </div>
        </section>

        {/* KATEGORIE */}
        <section className="flex flex-col gap-2">
          <div className="text-[11px] uppercase tracking-wide text-[color:var(--color-text-soft)] mb-1">
            Kategorie mięśniowe
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
            {MUSCLE_CATEGORIES.map((cat) => {
              const isActive = activeCat === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => setActiveCat(cat.value)}
                  className={[
                    "whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-medium border transition-all duration-200",
                    isActive
                      ? "bg-[rgba(var(--rgb-primary),0.18)] border-[rgba(var(--rgb-primary),0.65)] text-[color:var(--color-primary-300)] shadow-[0_0_16px_rgba(var(--rgb-primary),0.45)]"
                      : "bg-[rgba(var(--rgb-black),0.35)] border-[rgba(var(--rgb-white),0.12)] text-[color:var(--color-text-soft)] hover:bg-[rgba(var(--rgb-primary),0.16)] hover:text-[color:var(--color-primary-300)]",
                  ].join(" ")}
                >
                  <span className="mr-1.5">{cat.icon}</span>
                  {cat.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* LISTA ĆWICZEŃ */}
        <section className="flex-1 min-h-0">
          <div className="text-[11px] uppercase tracking-wide text-[color:var(--color-text-soft)] mb-2">
            Ćwiczenia
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[65vh] overflow-y-auto pr-1">
            {filtered.length === 0 ? (
              <div className="col-span-full text-center text-[color:var(--color-text-soft)] text-sm py-10">
                Brak ćwiczeń pasujących do filtrów
              </div>
            ) : (
              filtered.map((ex) => {
                const cat =
                  MUSCLE_CATEGORIES.find(
                    (c) => c.value === ex.category
                  ) || MUSCLE_CATEGORIES[0];

                return (
                  <article
                    key={ex.id}
                    className="
                      group relative rounded-xl
                      bg-[rgba(15,23,42,0.92)]
                      border border-[rgba(var(--rgb-white),0.12)]
                      px-3.5 py-3
                      backdrop-blur-md
                      shadow-[0_18px_40px_rgba(0,0,0,0.8)]
                      hover:border-[rgba(var(--rgb-primary),0.6)]
                      hover:shadow-[0_22px_55px_rgba(15,118,255,0.45)]
                      transition-all duration-300
                    "
                  >
                    {/* Glow overlay */}
                    <div className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_0%_0%,rgba(var(--rgb-primary),0.18),transparent_60%),radial-gradient(circle_at_100%_100%,rgba(var(--rgb-secondary),0.16),transparent_60%)]" />

                    <div className="relative flex flex-col gap-2 z-10">
                      {/* Title row */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-[rgba(var(--rgb-primary),0.16)] border border-[rgba(var(--rgb-primary),0.4)] flex items-center justify-center text-base">
                            {cat.icon}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-sm text-[color:var(--color-text-base)] truncate">
                              {ex.name}
                            </h3>
                            <div className="text-[10px] uppercase tracking-wide text-[color:var(--color-text-soft)]">
                              {cat.label}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-1">
                        <button
                          onClick={() => handleEdit(ex)}
                          className="
                            flex-1 inline-flex items-center justify-center gap-1.5
                            text-[11px] font-medium
                            rounded-lg px-2 py-1.5
                            bg-[rgba(var(--rgb-secondary),0.15)]
                            border border-[rgba(var(--rgb-secondary),0.45)]
                            text-[color:var(--color-secondary-400)]
                            hover:bg-[rgba(var(--rgb-secondary),0.24)]
                            hover:border-[rgba(var(--rgb-secondary),0.7)]
                            transition-all
                          "
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Edytuj
                        </button>
                        <button
                          onClick={() => removeExercise(ex.id)}
                          className="
                            flex-1 inline-flex items-center justify-center gap-1.5
                            text-[11px] font-medium
                            rounded-lg px-2 py-1.5
                            bg-[rgba(239,68,68,0.18)]
                            border border-[rgba(248,113,113,0.55)]
                            text-[rgba(252,165,165,0.95)]
                            hover:bg-[rgba(239,68,68,0.28)]
                            hover:border-[rgba(248,113,113,0.8)]
                            transition-all
                          "
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Usuń
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

      {/* hide-scrollbar helper (opcjonalnie jeśli nie masz globalnie) */}
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
