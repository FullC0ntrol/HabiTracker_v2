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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[rgba(var(--rgb-primary-950),0.2)] to-[rgba(var(--rgb-slate-900),0.4)]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary-400)] mx-auto mb-3" />
          <p className="text-[rgba(var(--rgb-white),0.6)] text-sm">
            Ładowanie planów...
          </p>
        </div>
      </div>
    );
  }

  const BackButton = ({ onClick, step }) => (
    <button
      onClick={onClick}
      className="
        flex items-center gap-2 px-3 py-2 text-sm
        text-[var(--color-primary-300)]
        hover:text-[var(--color-primary-400)]
        transition-colors mb-4
      "
    >
      <ArrowLeft className="w-4 h-4" />
      {step === "config" ? "Wybierz typ planu" : "Konfiguracja"}
    </button>
  );

  if (step === "chooseType") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[rgba(var(--rgb-primary-950),0.2)] to-[rgba(var(--rgb-slate-900),0.4)] p-4 pb-20">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 p-3 bg-[rgba(var(--rgb-primary),0.2)] rounded-2xl border border-[rgba(var(--rgb-primary),0.45)] mb-4">
            <ClipboardList className="w-6 h-6 text-[var(--color-primary-300)]" />
            <h1 className="text-xl font-bold text-[var(--color-text-base)]">
              Kreator planu
            </h1>
          </div>
          <p className="text-[rgba(var(--rgb-white),0.6)] text-sm">
            Wybierz styl planu treningowego
          </p>
        </div>

        {/* Create New Plan Section */}
        <div className="bg-[rgba(var(--rgb-white),0.05)] backdrop-blur-md rounded-xl border border-[rgba(var(--rgb-primary),0.2)] p-4 mb-6">
          <h2 className="font-bold text-[var(--color-text-base)] text-lg mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-[var(--color-primary-300)]" />
            Nowy plan
          </h2>

          <div className="grid gap-3">
            <button
              onClick={() => {
                setPlanType("FBW");
                setStep("config");
              }}
              className="
                p-4 rounded-xl
                border border-[rgba(var(--rgb-primary),0.2)]
                bg-[rgba(var(--rgb-white),0.04)]
                backdrop-blur-md
                hover:bg-[rgba(var(--rgb-primary),0.15)]
                hover:border-[rgba(var(--rgb-primary),0.45)]
                transition-all duration-300 group
              "
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[rgba(var(--rgb-accent),0.25)] rounded-lg border border-[rgba(var(--rgb-accent),0.5)] group-hover:scale-110 transition-transform">
                  <Dumbbell className="w-5 h-5 text-[rgba(var(--rgb-accent),0.96)]" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-[rgba(var(--rgb-accent),0.96)] text-lg">
                    FBW
                  </div>
                  <div className="text-[rgba(var(--rgb-white),0.6)] text-xs">
                    Całe ciało w każdym treningu
                  </div>
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                setPlanType("SPLIT");
                setStep("config");
              }}
              className="
                p-4 rounded-xl
                border border-[rgba(var(--rgb-primary),0.2)]
                bg-[rgba(var(--rgb-white),0.04)]
                backdrop-blur-md
                hover:bg-[rgba(var(--rgb-primary),0.15)]
                hover:border-[rgba(var(--rgb-primary),0.45)]
                transition-all duration-300 group
              "
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[rgba(var(--rgb-primary),0.25)] rounded-lg border border-[rgba(var(--rgb-primary),0.5)] group-hover:scale-110 transition-transform">
                  <Zap className="w-5 h-5 text-[var(--color-primary-300)]" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-[var(--color-primary-300)] text-lg">
                    SPLIT
                  </div>
                  <div className="text-[rgba(var(--rgb-white),0.6)] text-xs">
                    Podział na grupy mięśniowe
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Existing Plans */}
        <div className="bg-[rgba(var(--rgb-white),0.05)] backdrop-blur-md rounded-xl border border-[rgba(var(--rgb-primary),0.2)] p-4">
          <h3 className="font-bold text-[var(--color-text-base)] text-lg mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-[var(--color-primary-400)] rounded-full" />
            Twoje plany
            <span className="text-[var(--color-primary-300)] opacity-70 text-sm font-normal ml-auto">
              {plans.length}{" "}
              {plans.length === 1
                ? "plan"
                : plans.length < 5
                ? "plany"
                : "planów"}
            </span>
          </h3>

          {error && (
            <div className="text-sm bg-[rgba(var(--rgb-accent),0.18)] border border-[rgba(var(--rgb-accent),0.45)] rounded-lg p-2 mb-3 text-[rgba(var(--rgb-accent),0.96)]">
              {error}
            </div>
          )}

          {plans.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-[rgba(var(--rgb-white),0.4)] text-sm mb-2">
                Brak zapisanych planów
              </div>
              <div className="text-[rgba(var(--rgb-white),0.2)] text-xs">
                Stwórz swój pierwszy plan!
              </div>
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
        </div>

        {/* Active Plan Indicator */}
        {activePlan && (
          <div className="fixed bottom-20 left-4 right-4 bg-[rgba(var(--rgb-primary),0.22)] backdrop-blur-md rounded-xl border border-[rgba(var(--rgb-primary),0.5)] p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-[var(--color-primary-300)] opacity-85">
                  Aktywny plan
                </div>
                <div className="text-sm font-medium text-[var(--color-text-base)]">
                  {activePlan.name}
                </div>
              </div>
              <div className="text-xs text-[var(--color-primary-300)] bg-[rgba(var(--rgb-primary),0.25)] px-2 py-1 rounded-full border border-[rgba(var(--rgb-primary),0.5)]">
                {activePlan.plan_type}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (step === "config") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[rgba(var(--rgb-primary-950),0.2)] to-[rgba(var(--rgb-slate-900),0.4)] p-4 pb-20">
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
    );
  }

  if (step === "build") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[rgba(var(--rgb-primary-950),0.2)] to-[rgba(var(--rgb-slate-900),0.4)] p-4 pb-20">
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
    );
  }

  return null;
}
