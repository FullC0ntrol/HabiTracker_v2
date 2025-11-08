export function Chip({ ok, icon, text }) {
  return (
    <span
      className={`inline-flex items-center gap-2 text-[12px] px-2.5 py-1 rounded-full border ${
        ok
          ? "bg-emerald-500/20 text-emerald-200 border-emerald-400/30"
          : "bg-white/10 text-gray-300 border-white/15"
      }`}
    >
      {icon}
      {text}
    </span>
  );
}