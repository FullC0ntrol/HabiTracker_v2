import { useState } from "react";
import { ClipboardList, Dumbbell, Zap, Loader2 } from "lucide-react";
import { usePlans } from "../hooks/usePlans";
import { PlanConfig } from "./PlanConfig";
import { PlanBuilder } from "./PlanBuilder";
import { PlanItem } from "./PlanItem";

export default function PlanPage() {
  const { plans, exercises, activePlan, setActive, remove, loading, error, load } = usePlans();

  const [step, setStep] = useState("chooseType"); // chooseType | config | build
  const [planType, setPlanType] = useState(null);
  const [daysCount, setDaysCount] = useState(3);
  const [repeatFBW, setRepeatFBW] = useState(true);
  const [splitLabels, setSplitLabels] = useState(["Poniedziałek", "Wtorek", "Środa"]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16 text-cyan-400">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (step === "chooseType") {
    return (
      <div className="space-y-6 max-w-4xl mx-auto text-white">
        <h2 className="text-3xl font-black text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-cyan-600">
          <div className="inline-flex items-center gap-2">
            <ClipboardList className="w-7 h-7" /> Kreator planu
          </div>
        </h2>
        <p className="text-center text-white/70">Wybierz styl planu, aby rozpocząć.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => {
              setPlanType("FBW");
              setStep("config");
            }}
            className="rounded-3xl border border-white/10 hover:border-amber-400/40 bg-white/[0.05] p-6 text-left transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-3">
              <Dumbbell className="w-8 h-8 text-amber-400" />
              <div>
                <div className="font-extrabold text-amber-300 text-xl">FBW (Całe ciało)</div>
                <div className="text-sm text-white/70">Te same lub różne zestawy – do wyboru w kolejnym kroku.</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              setPlanType("SPLIT");
              setStep("config");
            }}
            className="rounded-3xl border border-white/10 hover:border-emerald-400/40 bg-white/[0.05] p-6 text-left transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-3">
              <Zap className="w-8 h-8 text-emerald-400" />
              <div>
                <div className="font-extrabold text-emerald-300 text-xl">SPLIT</div>
                <div className="text-sm text-white/70">Osobne dni (np. Push / Pull / Nogi).</div>
              </div>
            </div>
          </button>
        </div>

        {/* Lista planów */}
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <h3 className="text-xl font-bold mb-3">Twoje plany</h3>
          {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
          {plans.length === 0 ? (
            <p className="text-white/70">Nie masz jeszcze żadnych planów.</p>
          ) : (
            <ul className="space-y-2">
              {plans.map((p) => (
                <PlanItem
                  key={p.id}
                  plan={p}
                  onDelete={remove}
                  activePlanId={activePlan?.id}
                  onSetActive={setActive}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

  if (step === "config") {
    return (
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
    );
  }

  if (step === "build") {
    return (
      <PlanBuilder
        planType={planType}
        daysCount={daysCount}
        repeatFBW={repeatFBW}
        splitLabels={splitLabels}
        exercises={exercises}
        setStep={setStep}
        reloadPlans={load}
      />
    );
  }

  return null;
}
