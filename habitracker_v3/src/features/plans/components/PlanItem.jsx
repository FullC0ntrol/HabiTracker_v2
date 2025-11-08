import { useState, useCallback, useEffect, useMemo } from "react";
import { ChevronDown, ChevronUp, Loader2, Trash2, Dumbbell } from "lucide-react";
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
        (byDay.get(d) || []).sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
      );
    }
    return [items];
  }, [items]);

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-xl border border-emerald-500/20 p-3 transition-all hover:border-emerald-400/40">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex-1 flex items-center gap-2 text-left"
        >
          {open ? (
            <ChevronUp className="w-4 h-4 text-emerald-300 flex-shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-emerald-300 flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <div className="font-medium text-white text-sm truncate">{plan.name}</div>
            <div className="text-xs text-emerald-300/60">
              {plan.plan_type} • {plan.days} dni
            </div>
          </div>
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSetActive?.(plan.id);
            }}
            className={`px-2 py-1 rounded text-xs border transition-colors ${
              activePlanId === plan.id
                ? "border-emerald-400 bg-emerald-500/20 text-emerald-300"
                : "border-emerald-500/20 bg-emerald-500/10 text-emerald-300/80 hover:bg-emerald-500/20"
            }`}
          >
            {activePlanId === plan.id ? "Aktywny" : "Aktywuj"}
          </button>

          <button
            onClick={handleDelete}
            className="p-1.5 rounded border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {open && (
        <div className="mt-3 pt-3 border-t border-emerald-500/20">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-4 text-emerald-300/60">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Ładowanie...</span>
            </div>
          ) : (
            <div className="space-y-2">
              {grouped.map((dayItems, di) => (
                <div key={`day-${di}`} className="bg-black/20 rounded-lg border border-emerald-500/10 p-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Dumbbell className="w-3 h-3 text-emerald-300" />
                    <div className="text-sm font-medium text-emerald-300">
                      Dzień {di + 1}
                    </div>
                  </div>
                  <div className="space-y-1">
                    {dayItems.map((it, i) => (
                      <div
                        key={`${it.id}-${i}`}
                        className="flex items-center justify-between gap-2 px-2 py-1.5 rounded bg-emerald-500/5 border border-emerald-500/10"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-white truncate">
                            {i + 1}. {it.name}
                          </div>
                          <div className="text-xs text-emerald-300/60 uppercase">
                            {it.category}
                          </div>
                        </div>
                        <div className="text-xs bg-amber-500/20 text-amber-200 px-2 py-1 rounded border border-amber-400/30">
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