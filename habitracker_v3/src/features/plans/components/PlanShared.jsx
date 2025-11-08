export function FieldLabel({ children, hint }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold text-white/90">{children}</span>
      {hint && <span className="text-[11px] text-white/50 italic">{hint}</span>}
    </div>
  );
}

export function Toggle({ checked, onChange, label, description }) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.05] p-3 hover:bg-white/[0.07] transition-all cursor-pointer">
      <div className="flex-1">
        <div className="text-sm font-semibold text-white/90">{label}</div>
        {description && <p className="text-[12px] text-white/60 mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-cyan-500/90" : "bg-white/15"
        }`}
        aria-pressed={checked}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </label>
  );
}
