import { ChevronLeft } from "lucide-react";

export function FloatingBackButton({ onBack }) {
  return (
    <button
      onClick={onBack}
      aria-label="Wróć"
      title="Wróć"
      className="
        fixed top-4 left-4 z-[100]
        p-2 rounded-xl
        border border-[rgba(var(--rgb-white),0.16)]
        bg-[rgba(var(--rgb-black),0.45)]
        hover:bg-[rgba(var(--rgb-black),0.7)]
        backdrop-blur-md
        shadow-[0_8px_24px_rgba(0,0,0,0.45)]
        transition-all
        hover:scale-[1.03]
        active:scale-[0.97]
      "
    >
      <ChevronLeft className="w-6 h-6 text-[color:var(--color-primary-300)]" />
    </button>
  );
}
