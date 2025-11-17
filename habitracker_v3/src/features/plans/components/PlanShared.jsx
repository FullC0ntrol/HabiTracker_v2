// PlanFormFields.jsx (tam gdzie masz FieldLabel / Toggle)
export function FieldLabel({ children, hint }) {
  return (
    <div className="flex items-center gap-2 mb-1">
      <span className="text-sm font-semibold text-[color:var(--color-text-base)]">
        {children}
      </span>
      {hint && (
        <span className="text-[11px] text-[color:var(--color-text-soft)] italic">
          {hint}
        </span>
      )}
    </div>
  );
}

export function Toggle({ checked, onChange, label, description }) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-2xl glass border border-[color:var(--color-card-border)] px-3 py-3 hover:glass-strong hover:border-[rgba(var(--rgb-primary),0.55)] transition-all cursor-pointer">
      <div className="flex-1 pr-2">
        <div className="text-sm font-semibold text-[color:var(--color-text-base)]">
          {label}
        </div>
        {description && (
          <p className="text-[11px] text-[color:var(--color-text-soft)] mt-0.5">
            {description}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={[
          "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200",
          checked
            ? "bg-[rgba(var(--rgb-primary),0.9)] shadow-[0_0_12px_rgba(59,130,246,0.6)]"
            : "bg-[rgba(var(--rgb-white),0.18)]",
        ].join(" ")}
        aria-pressed={checked}
      >
        <span
          className={[
            "absolute top-[3px] left-[3px] h-4.5 w-4.5 rounded-full bg-white shadow-md transition-transform duration-200",
            checked ? "translate-x-5" : "translate-x-0",
          ].join(" ")}
        />
      </button>
    </label>
  );
}
