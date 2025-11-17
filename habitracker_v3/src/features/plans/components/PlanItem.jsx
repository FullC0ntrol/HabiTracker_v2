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

export function PlanItem({
  plan,
  onDelete,
  activePlanId,
  onSetActive,
}) {
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
      const sortedDays = Array.from(byDay.keys()).sort(
        (a, b) => a - b
      );
      return sortedDays.map((d) =>
        (byDay.get(d) || []).sort(
          (a, b) =>
            (a.order_index ?? 0) - (b.order_index ?? 0)
        )
      );
    }
    return [items];
  }, [items]);

  return (
    <div className="bg-[rgba(var(--rgb-white),0.05)] backdrop-blur-md rounded-xl border border-[rgba(var(--rgb-primary),0.2)] p-3 transition-all hover:border-[rgba(var(--rgb-primary),0.45)]">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex-1 flex items-center gap-2 text-left"
        >
          {open ? (
            <ChevronUp className="w-4 h-4 text-[var(--color-primary-300)] flex-shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[var(--color-primary-300)] flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <div className="font-medium text-[var(--color-text-base)] text-sm truncate">
              {plan.name}
            </div>
            <div className="text-xs text-[var(--color-primary-300)] opacity-70">
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
            className={`
              px-2 py-1 rounded text-xs border transition-colors
              ${
                activePlanId === plan.id
                  ? `
                    border-[rgba(var(--rgb-primary),0.6)]
                    bg-[rgba(var(--rgb-primary),0.25)]
                    text-[var(--color-primary-300)]
                  `
                  : `
                    border border-[rgba(var(--rgb-primary),0.3)]
                    bg-[rgba(var(--rgb-primary),0.15)]
                    text-[rgba(var(--rgb-primary),0.85)]
                    hover:bg-[rgba(var(--rgb-primary),0.25)]
                  `
              }
            `}
          >
            {activePlanId === plan.id ? "Aktywny" : "Aktywuj"}
          </button>

          <button
            onClick={handleDelete}
            className="
              p-1.5 rounded
              border border-[rgba(var(--rgb-accent),0.35)]
              text-[rgba(var(--rgb-accent),0.95)]
              hover:bg-[rgba(var(--rgb-accent),0.2)]
              transition-colors
            "
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {open && (
        <div className="mt-3 pt-3 border-t border-[rgba(var(--rgb-primary),0.25)]">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-4 text-[var(--color-primary-300)] opacity-70">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Ładowanie...</span>
            </div>
          ) : (
            <div className="space-y-2">
              {grouped.map((dayItems, di) => (
                <div
                  key={`day-${di}`}
                  className="
                    bg-[rgba(var(--rgb-black),0.25)]
                    rounded-lg
                    border border-[rgba(var(--rgb-primary),0.18)]
                    p-2
                  "
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Dumbbell className="w-3 h-3 text-[var(--color-primary-300)]" />
                    <div className="text-sm font-medium text-[var(--color-primary-300)]">
                      Dzień {di + 1}
                    </div>
                  </div>
                  <div className="space-y-1">
                    {dayItems.map((it, i) => (
                      <div
                        key={`${it.id}-${i}`}
                        className="
                          flex items-center justify-between gap-2
                          px-2 py-1.5 rounded
                          bg-[rgba(var(--rgb-primary),0.08)]
                          border border-[rgba(var(--rgb-primary),0.18)]
                        "
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-[var(--color-text-base)] truncate">
                            {i + 1}. {it.name}
                          </div>
                          <div className="text-xs text-[var(--color-primary-300)] uppercase opacity-75">
                            {it.category}
                          </div>
                        </div>
                        <div className="text-xs bg-[rgba(var(--rgb-accent),0.25)] text-[rgba(var(--rgb-accent),0.95)] px-2 py-1 rounded border border-[rgba(var(--rgb-accent),0.5)]">
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
