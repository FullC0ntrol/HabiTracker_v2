// PlanItem.jsx
import {
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  Trash2,
  Dumbbell,
} from "lucide-react";
import { plansService } from "../services/plans.service";

export function PlanItem({ plan, onDelete, activePlanId, onSetActive }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await plansService.getById(plan.id);
      setItems(res);
    } catch (e) {
      console.error("Nie udało się pobrać szczegółów planu:", e);
    } finally {
      setLoading(false);
    }
  }, [plan.id]);

  useEffect(() => {
    if (open && items.length === 0) loadItems();
  }, [open, items.length, loadItems]);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm(`Usunąć plan: ${plan.name}?`)) return;
    await onDelete?.(plan.id);
  };

  const grouped = useMemo(() => {
    if (items.some((it) => typeof it.day !== "undefined")) {
      const byDay = new Map();
      for (const it of items) {
        const d = Number(it.day || 1);
        if (!byDay.has(d)) byDay.set(d, []);
        byDay.get(d).push(it);
      }
      const sortedDays = Array.from(byDay.keys()).sort((a, b) => a - b);
      return sortedDays.map((d) =>
        (byDay.get(d) || []).sort(
          (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)
        )
      );
    }
    return [items];
  }, [items]);

  const isActive = activePlanId === plan.id;

  return (
    <div
      className={[
        "rounded-2xl px-3.5 py-3",
        "bg-[rgba(15,23,42,0.9)]",
        "border",
        isActive
          ? "border-[rgba(var(--rgb-primary),0.8)] shadow-[0_18px_40px_rgba(59,130,246,0.55)]"
          : "border-[color:var(--color-card-border)] hover:border-[rgba(var(--rgb-primary),0.7)] hover:shadow-[0_14px_35px_rgba(15,23,42,0.9)]",
        "backdrop-blur-xl transition-all duration-300",
      ].join(" ")}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex-1 flex items-center gap-2 text-left"
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {open ? (
              <ChevronUp className="w-4 h-4 text-[color:var(--color-primary-300)] flex-shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[color:var(--color-primary-300)] flex-shrink-0" />
            )}

            <div className="w-8 h-8 rounded-xl bg-[rgba(var(--rgb-primary),0.16)] border border-[rgba(var(--rgb-primary),0.55)] flex items-center justify-center flex-shrink-0">
              <Dumbbell className="w-4 h-4 text-[color:var(--color-primary-300)]" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="font-medium text-sm text-[color:var(--color-text-base)] truncate">
                  {plan.name}
                </div>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-[color:var(--color-text-soft)] mt-0.5">
                <span className="uppercase tracking-wide">
                  {plan.plan_type}
                </span>
                <span className="w-1 h-1 rounded-full bg-[rgba(var(--rgb-primary),0.7)]" />
                <span>{plan.days} dni</span>
              </div>
            </div>
          </div>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSetActive?.(plan.id);
            }}
            className={[
              "px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all",
              isActive
                ? "bg-[rgba(var(--rgb-primary),0.2)] border-[rgba(var(--rgb-primary),0.8)] text-[color:var(--color-primary-300)] shadow-[0_0_18px_rgba(59,130,246,0.6)]"
                : "bg-[rgba(var(--rgb-black),0.4)] border-[rgba(var(--rgb-primary),0.5)] text-[color:var(--color-text-soft)] hover:bg-[rgba(var(--rgb-primary),0.18)] hover:text-[color:var(--color-primary-300)]",
            ].join(" ")}
          >
            {isActive ? "Aktywny plan" : "Ustaw jako aktywny"}
          </button>

          <button
            onClick={handleDelete}
            className="p-1.5 rounded-lg border border-rose-500/25 text-rose-300 hover:bg-rose-500/15 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SZCZEGÓŁY */}
      {open && (
        <div className="mt-3 pt-3 border-t border-[rgba(var(--rgb-white),0.12)]">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-4 text-[color:var(--color-text-soft)] text-sm">
              <Loader2 className="w-4 h-4 animate-spin text-[color:var(--color-primary-300)]" />
              <span>Ładowanie szczegółów planu...</span>
            </div>
          ) : grouped.length === 0 || grouped[0].length === 0 ? (
            <div className="text-xs text-[color:var(--color-text-soft)] py-3">
              Brak przypisanych ćwiczeń w tym planie.
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {grouped.map((dayItems, di) => (
                <div
                  key={`day-${di}`}
                  className="rounded-xl bg-[rgba(15,23,42,0.95)] border border-[rgba(var(--rgb-white),0.15)] px-3 py-2.5"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-lg bg-[rgba(var(--rgb-primary),0.18)] border border-[rgba(var(--rgb-primary),0.6)] flex items-center justify-center">
                      <Dumbbell className="w-3.5 h-3.5 text-[color:var(--color-primary-300)]" />
                    </div>
                    <div className="text-sm font-semibold text-[color:var(--color-primary-300)]">
                      Dzień {di + 1}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {dayItems.map((it, i) => (
                      <div
                        key={`${it.id}-${i}`}
                        className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-[rgba(var(--rgb-black),0.5)] border border-[rgba(var(--rgb-primary),0.22)]"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-xs sm:text-sm text-[color:var(--color-text-base)] truncate">
                            {i + 1}. {it.name}
                          </div>
                          <div className="text-[10px] uppercase tracking-wide text-[color:var(--color-text-soft)]">
                            {it.category}
                          </div>
                        </div>
                        <div className="text-[10px] px-2 py-1 rounded-full bg-[rgba(250,204,21,0.16)] border border-[rgba(250,204,21,0.5)] text-amber-100 whitespace-nowrap">
                          {it.sets} × {it.reps}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
