export function Chip({ ok, icon, text }) {
  const baseClasses =
    "inline-flex items-center gap-2 text-[12px] px-2.5 py-1 rounded-full border";

  const okClasses = `
    bg-[rgba(var(--rgb-primary),0.16)]
    text-[color:var(--color-primary-300)]
    border-[rgba(var(--rgb-primary),0.5)]
    shadow-[0_0_10px_rgba(var(--rgb-primary),0.25)]
  `;

  const neutralClasses = `
    bg-[rgba(var(--rgb-white),0.06)]
    text-[color:var(--color-text-soft)]
    border-[rgba(var(--rgb-white),0.14)]
  `;

  return (
    <span className={`${baseClasses} ${ok ? okClasses : neutralClasses}`}>
      {icon}
      {text}
    </span>
  );
}
