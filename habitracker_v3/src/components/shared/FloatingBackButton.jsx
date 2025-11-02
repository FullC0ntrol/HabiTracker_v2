import { ChevronLeft } from "lucide-react";

export function FloatingBackButton({ onBack }) {
  return (
    <button
      onClick={onBack}
      aria-label="Wróć"
      className="fixed top-4 left-4 z-[100] p-2 rounded-xl border border-white/10 bg-white/10 hover:bg-white/15 backdrop-blur-md shadow-lg transition"
      title="Wróć"
    >
      <ChevronLeft className="w-6 h-6 text-cyan-300" />
    </button>
  );
}
