export function FieldLabel({ children, hint }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold text-[var(--color-text-base)]">
        {children}
      </span>
      {hint && (
        <span className="text-[11px] text-[var(--color-text-muted)] italic">
          {hint}
        </span>
      )}
    </div>
  );
}

export function Toggle({ checked, onChange, label, description }) {
  return (
    <label
      className="
        flex items-start justify-between gap-4
        rounded-xl
        border border-[rgba(var(--rgb-white),0.12)]
        bg-[rgba(var(--rgb-white),0.04)]
        p-3
        hover:bg-[rgba(var(--rgb-white),0.06)]
        transition-all
        cursor-pointer
      "
    >
      <div className="flex-1">
        <div className="text-sm font-semibold text-[var(--color-text-base)]">
          {label}
        </div>
        {description && (
          <p className="text-[12px] text-[var(--color-text-muted)] mt-0.5">
            {description}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`
          relative h-6 w-11 shrink-0 rounded-full transition
          ${
            checked
              ? "bg-[rgba(var(--rgb-secondary),0.9)]"
              : "bg-[rgba(var(--rgb-white),0.15)]"
          }
        `}
        aria-pressed={checked}
      >
        <span
          className={`
            absolute top-0.5 left-0.5 h-5 w-5 rounded-full
            bg-[rgba(var(--rgb-white),0.98)]
            shadow
            transition-transform
            ${checked ? "translate-x-5" : "translate-x-0"}
          `}
        />
      </button>
    </label>
  );
}
