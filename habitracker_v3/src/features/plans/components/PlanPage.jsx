import { useState } from "react";
import { ClipboardList, Dumbbell, Zap, Loader2, ArrowLeft, Plus } from "lucide-react";
import { usePlans } from "../hooks/usePlans";
import { PlanConfig } from "./PlanConfig";
import { PlanBuilder } from "./PlanBuilder";
import { PlanItem } from "./PlanItem";

export default function PlanPage() {
  const { plans, exercises, activePlan, setActive, remove, loading, error, load } = usePlans();

  const [step, setStep] = useState("chooseType");
  const [planType, setPlanType] = useState(null);
  const [daysCount, setDaysCount] = useState(3);
  const [repeatFBW, setRepeatFBW] = useState(true);
  const [splitLabels, setSplitLabels] = useState(["Poniedziałek", "Wtorek", "Środa"]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[rgb(var(--color-bg-grad-from))]/20 to-[rgb(var(--color-bg-grad-to))]/40">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[rgb(var(--color-primary-light))] mx-auto mb-3" />
          <p className="text-white/60 text-sm">Ładowanie planów...</p>
        </div>
      </div>
    );
  }

  // Back button component
  const BackButton = ({ onClick, step }) => (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 text-sm text-[rgb(var(--color-primary-light))] hover:text-[rgb(var(--color-primary))] transition-colors mb-4"
    >
      <ArrowLeft className="w-4 h-4" />
      {step === "config" ? "Wybierz typ planu" : "Konfiguracja"}
    </button>
  );

  if (step === "chooseType") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[rgb(var(--color-bg-grad-from))]/20 to-[rgb(var(--color-bg-grad-to))]/40 p-4 pb-20">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 p-3 bg-[rgb(var(--rgb-primary))]/20 rounded-2xl border border-[rgb(var(--color-primary-light))]/30 mb-4">
            <ClipboardList className="w-6 h-6 text-[rgb(var(--color-primary-light))]" />
            <h1 className="text-xl font-bold text-white">Kreator planu</h1>
          </div>
          <p className="text-white/60 text-sm">Wybierz styl planu treningowego</p>
        </div>

        {/* Create New Plan Section */}
        <div className="bg-white/5 backdrop-blur-md rounded-xl border border-[rgb(var(--color-primary-light))]/20 p-4 mb-6">
          <h2 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-[rgb(var(--color-primary-light))]" />
            Nowy plan
          </h2>
          
          <div className="grid gap-3">
            <button
              onClick={() => {
                setPlanType("FBW");
                setStep("config");
              }}
              className="p-4 rounded-xl border border-[rgb(var(--color-primary-light))]/20 bg-white/5 backdrop-blur-md hover:bg-[rgb(var(--rgb-primary))]/10 hover:border-[rgb(var(--color-primary-light))]/30 transition-all duration-300 group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 rounded-lg border border-amber-400/30 group-hover:scale-110 transition-transform">
                  <Dumbbell className="w-5 h-5 text-amber-300" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-amber-300 text-lg">FBW</div>
                  <div className="text-white/60 text-xs">Całe ciało w każdym treningu</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                setPlanType("SPLIT");
                setStep("config");
              }}
              className="p-4 rounded-xl border border-[rgb(var(--color-primary-light))]/20 bg-white/5 backdrop-blur-md hover:bg-[rgb(var(--rgb-primary))]/10 hover:border-[rgb(var(--color-primary-light))]/30 transition-all duration-300 group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[rgb(var(--rgb-primary))]/20 rounded-lg border border-[rgb(var(--color-primary-light))]/30 group-hover:scale-110 transition-transform">
                  <Zap className="w-5 h-5 text-[rgb(var(--color-primary-light))]" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-[rgb(var(--color-primary-light))] text-lg">SPLIT</div>
                  <div className="text-white/60 text-xs">Podział na grupy mięśniowe</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Existing Plans */}
        <div className="bg-white/5 backdrop-blur-md rounded-xl border border-[rgb(var(--color-primary-light))]/20 p-4">
          <h3 className="font-bold text-white text-lg mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-[rgb(var(--color-primary-light))] rounded-full"></div>
            Twoje plany
            <span className="text-[rgb(var(--color-primary-light))]/60 text-sm font-normal ml-auto">
              {plans.length} {plans.length === 1 ? 'plan' : plans.length < 5 ? 'plany' : 'planów'}
            </span>
          </h3>
          
          {error && (
            <div className="text-rose-400 text-sm bg-rose-500/10 border border-rose-500/20 rounded-lg p-2 mb-3">
              {error}
            </div>
          )}
          
          {plans.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-white/40 text-sm mb-2">Brak zapisanych planów</div>
              <div className="text-white/20 text-xs">Stwórz swój pierwszy plan!</div>
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
          <div className="fixed bottom-20 left-4 right-4 bg-[rgb(var(--rgb-primary))]/20 backdrop-blur-md rounded-xl border border-[rgb(var(--color-primary-light))]/30 p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-[rgb(var(--color-primary-light))]/80">Aktywny plan</div>
                <div className="text-sm font-medium text-white">{activePlan.name}</div>
              </div>
              <div className="text-xs text-[rgb(var(--color-primary-light))] bg-[rgb(var(--rgb-primary))]/20 px-2 py-1 rounded-full border border-[rgb(var(--color-primary-light))]/30">
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
      <div className="min-h-screen bg-gradient-to-br from-[rgb(var(--color-bg-grad-from))]/20 to-[rgb(var(--color-bg-grad-to))]/40 p-4 pb-20">
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
      <div className="min-h-screen bg-gradient-to-br from-[rgb(var(--color-bg-grad-from))]/20 to-[rgb(var(--color-bg-grad-to))]/40 p-4 pb-20">
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