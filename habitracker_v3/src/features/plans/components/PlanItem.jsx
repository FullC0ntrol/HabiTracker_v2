import { useState, useCallback, useEffect, useMemo } from "react";
import { ChevronDown, ChevronUp, Loader2, Trash2 } from "lucide-react";
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
    <li className="rounded-2xl border border-white/10 hover:border-cyan-400/40 transition-all p-4 bg-white/[0.04]">
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex-1 flex items-center gap-3 text-left font-semibold text-lg"
        >
          {open ? <ChevronUp className="w-5 h-5 text-cyan-400" /> : <ChevronDown className="w-5 h-5 text-cyan-400" />}
          <span className="truncate">{plan.name}</span>
          {activePlanId === plan.id && (
            <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full border border-emerald-400/40 text-emerald-300 bg-emerald-500/10">
              Aktywny
            </span>
          )}
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSetActive?.(plan.id);
            }}
            className={`px-2 py-1 rounded-md border text-xs ${
              activePlanId === plan.id
                ? "border-emerald-400/40 text-emerald-300 bg-emerald-500/10"
                : "border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/10"
            }`}
          >
            {activePlanId === plan.id ? "Aktywny" : "Ustaw jako aktywny"}
          </button>

          <button
            onClick={handleDelete}
            className="p-2 rounded-md text-rose-400 hover:bg-rose-500/15"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {open && (
        <div className="mt-3 pt-3 border-t border-white/10">
          {loading ? (
            <p className="text-gray-300 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Ładowanie…
            </p>
          ) : (
            <div className="space-y-3">
              {grouped.map((dayItems, di) => (
                <div key={`day-${di}`} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="text-sm font-semibold text-white/80 mb-2">
                    Dzień {di + 1}
                  </div>
                  <ul className="space-y-2">
                    {dayItems.map((it, i) => (
                      <li
                        key={`${it.id}-${i}`}
                        className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2"
                      >
                        <span className="font-medium truncate">
                          {i + 1}. {it.name}
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-200 border border-amber-400/30">
                          {it.sets} × {it.reps}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </li>
  );
}
