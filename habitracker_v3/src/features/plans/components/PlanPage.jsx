// PlanPage.jsx
import { useState } from "react";
import {
  ClipboardList,
  Dumbbell,
  Zap,
  Loader2,
  ArrowLeft,
  Plus,
} from "lucide-react";
import { usePlans } from "../hooks/usePlans";
import { PlanConfig } from "./PlanConfig";
import { PlanBuilder } from "./PlanBuilder";
import { PlanItem } from "./PlanItem";

export default function PlanPage() {
  const {
    plans,
    exercises,
    activePlan,
    setActive,
    remove,
    loading,
    error,
    load,
  } = usePlans();

  const [step, setStep] = useState("chooseType");
  const [planType, setPlanType] = useState(null);
  const [daysCount, setDaysCount] = useState(3);
  const [repeatFBW, setRepeatFBW] = useState(true);
  const [splitLabels, setSplitLabels] = useState([
    "Poniedziałek",
    "Wtorek",
    "Środa",
  ]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mesh">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl glass-strong flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-6 h-6 animate-spin text-[color:var(--color-primary-300)]" />
          </div>
          <p className="text-[color:var(--color-text-soft)] text-sm">
            Ładowanie planów treningowych...
          </p>
        </div>
      </div>
    );
  }

  const BackButton = ({ onClick, step }) => (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm rounded-xl glass text-[color:var(--color-text-soft)] hover:text-[color:var(--color-primary-300)] hover:glass-strong transition-all mb-4"
    >
      <ArrowLeft className="w-4 h-4" />
      <span>
        {step === "config" ? "Wróć do wyboru typu planu" : "Wróć do konfiguracji"}
      </span>
    </button>
  );

  if (step === "chooseType") {
    return (
      <div className="min-h-screen bg-mesh px-3 sm:px-4 pb-24 text-[color:var(--color-text-base)]">
        <div className="max-w-4xl mx-auto pt-5 sm:pt-8 flex flex-col gap-6">
          {/* HEADER */}
          <header className="text-center flex flex-col items-center gap-3">
            <div className="inline-flex items-center gap-3 px-4 py-3 rounded-2xl glass-strong glow-emerald">
              <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6 text-[color:var(--color-primary-300)]" />
              <h1 className="text-lg sm:text-2xl font-bold leading-tight">
                Kreator planu treningowego
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[color:var(--color-text-soft)] max-w-md">
              Wybierz styl planu, który najlepiej pasuje do Twojego tygodnia
              i sposobu trenowania.
            </p>
          </header>

          {/* NOWY PLAN */}
          <section className="glass-strong rounded-2xl border border-[color:var(--color-card-border)] p-4 sm:p-5 shadow-[0_18px_45px_rgba(0,0,0,0.65)]">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-[rgba(var(--rgb-primary),0.16)] border border-[rgba(var(--rgb-primary),0.45)] flex items-center justify-center">
                <Plus className="w-4 h-4 text-[color:var(--color-primary-300)]" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-semibold">
                  Utwórz nowy plan
                </h2>
                <p className="text-[11px] text-[color:var(--color-text-soft)]">
                  Wybierz szablon – szczegóły ustawisz w następnym kroku
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
              {/* FBW */}
              <button
                onClick={() => {
                  setPlanType("FBW");
                  setStep("config");
                }}
                className="
                  relative overflow-hidden
                  rounded-2xl border
                  border-[rgba(var(--rgb-primary),0.35)]
                  bg-[rgba(15,23,42,0.90)]
                  px-4 py-4 sm:py-5 text-left
                  flex gap-3
                  group
                  hover:border-[rgba(var(--rgb-primary),0.8)]
                  hover:shadow-[0_18px_40px_rgba(59,130,246,0.45)]
                  transition-all duration-300
                "
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_0%_0%,rgba(var(--rgb-primary),0.16),transparent_60%),radial-gradient(circle_at_100%_100%,rgba(var(--rgb-secondary),0.14),transparent_60%)]" />
                <div className="relative flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[rgba(251,191,36,0.15)] border border-[rgba(251,191,36,0.4)] flex items-center justify-center flex-shrink-0">
                    <Dumbbell className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base sm:text-lg font-semibold text-amber-200">
                        FBW
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full border border-amber-300/40 bg-amber-500/10 text-amber-100">
                        Full Body Workout
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-[color:var(--color-text-soft)] max-w-xs">
                      Trenujesz całe ciało na każdym treningu. Idealne przy 2–4
                      sesjach tygodniowo.
                    </p>
                  </div>
                </div>
              </button>

              {/* SPLIT */}
              <button
                onClick={() => {
                  setPlanType("SPLIT");
                  setStep("config");
                }}
                className="
                  relative overflow-hidden
                  rounded-2xl border
                  border-[rgba(var(--rgb-primary),0.35)]
                  bg-[rgba(15,23,42,0.90)]
                  px-4 py-4 sm:py-5 text-left
                  flex gap-3
                  group
                  hover:border-[rgba(var(--rgb-primary),0.9)]
                  hover:shadow-[0_18px_40px_rgba(79,70,229,0.5)]
                  transition-all duration-300
                "
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_0%_0%,rgba(var(--rgb-primary),0.2),transparent_60%),radial-gradient(circle_at_100%_100%,rgba(var(--rgb-accent),0.18),transparent_60%)]" />
                <div className="relative flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[rgba(var(--rgb-primary),0.18)] border border-[rgba(var(--rgb-primary),0.6)] flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-[color:var(--color-primary-300)]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base sm:text-lg font-semibold text-[color:var(--color-primary-300)]">
                        SPLIT
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full border border-[rgba(var(--rgb-primary),0.5)] bg-[rgba(var(--rgb-primary),0.15)] text-[color:var(--color-primary-300)]">
                        Podział na partie
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-[color:var(--color-text-soft)] max-w-xs">
                      Każda jednostka treningowa ma inną grupę mięśni. Dobre przy
                      3+ treningach w tygodniu.
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </section>

          {/* ISTNIEJĄCE PLANY */}
          <section className="glass rounded-2xl border border-[color:var(--color-card-border)] p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-[rgba(var(--rgb-primary),0.9)]" />
              <h3 className="text-sm sm:text-base font-semibold">
                Twoje plany treningowe
              </h3>
              <span className="ml-auto text-[11px] px-2 py-0.5 rounded-full bg-[rgba(var(--rgb-primary),0.16)] border border-[rgba(var(--rgb-primary),0.5)] text-[color:var(--color-primary-300)]">
                {plans.length}{" "}
                {plans.length === 1
                  ? "plan"
                  : plans.length < 5
                  ? "plany"
                  : "planów"}
              </span>
            </div>

            {error && (
              <div className="mb-3 text-xs sm:text-sm text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2">
                {error}
              </div>
            )}

            {plans.length === 0 ? (
              <div className="text-center py-8 text-[11px] sm:text-sm text-[color:var(--color-text-soft)]">
                Nie masz jeszcze żadnych planów. Zacznij od utworzenia pierwszego powyżej.
              </div>
            ) : (
              <div className="space-y-3">
                {plans.map((p) => (
                  <PlanItem
                    key={p.id}
                    plan={p}
                    onDelete={remove}
                    activePlanId={activePlan?.id}
                    onSetActive={setActive}
                  />
                ))}
              </div>
            )}
          </section>

          {/* AKTYWNY PLAN – pasek na dole */}
          {activePlan && (
            <div className="fixed left-3 right-3 bottom-20 sm:left-6 sm:right-6 sm:bottom-6 z-30">
              <div className="glass-strong rounded-2xl border border-[rgba(var(--rgb-primary),0.55)] px-3.5 py-2.5 shadow-[0_18px_40px_rgba(37,99,235,0.55)] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-[rgba(var(--rgb-primary),0.16)] border border-[rgba(var(--rgb-primary),0.6)] flex items-center justify-center">
                    <Dumbbell className="w-4 h-4 text-[color:var(--color-primary-300)]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] uppercase tracking-wide text-[color:var(--color-text-soft)]">
                      Aktywny plan
                    </div>
                    <div className="text-sm font-semibold truncate">
                      {activePlan.name}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(var(--rgb-primary),0.16)] border border-[rgba(var(--rgb-primary),0.6)] text-[color:var(--color-primary-300)]">
                    {activePlan.plan_type} • {activePlan.days} dni
                  </span>
                  <button
                    className="text-[10px] text-[color:var(--color-text-soft)] hover:text-[color:var(--color-primary-300)] transition-colors"
                    onClick={load}
                  >
                    Odśwież listę
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (step === "config") {
    return (
      <div className="min-h-screen bg-mesh px-3 sm:px-4 pb-24 text-[color:var(--color-text-base)]">
        <div className="max-w-3xl mx-auto pt-5 sm:pt-8">
          <BackButton onClick={() => setStep("chooseType")} step="config" />
          <PlanConfig
            planType={planType}
            daysCount={daysCount}
            setDaysCount={setDaysCount}
            repeatFBW={repeatFBW}
            setRepeatFBW={setRepeatFBW}
            splitLabels={splitLabels}
            setSplitLabels={setSplitLabels}
            setStep={setStep}
          />
        </div>
      </div>
    );
  }

  if (step === "build") {
    return (
      <div className="min-h-screen bg-mesh px-3 sm:px-4 pb-24 text-[color:var(--color-text-base)]">
        <div className="max-w-4xl mx-auto pt-5 sm:pt-8">
          <BackButton onClick={() => setStep("config")} step="build" />
          <PlanBuilder
            planType={planType}
            daysCount={daysCount}
            repeatFBW={repeatFBW}
            splitLabels={splitLabels}
            exercises={exercises}
            setStep={setStep}
            reloadPlans={load}
          />
        </div>
      </div>
    );
  }

  return null;
}
