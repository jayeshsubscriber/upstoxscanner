import { cn } from "@/lib/utils";
import type { ScannerPersona } from "@/data/mockData";

const CHIPS: { key: "all" | ScannerPersona; label: string; emoji: string }[] = [
  { key: "all", label: "For You", emoji: "✨" },
  { key: "intraday", label: "Intraday", emoji: "⚡" },
  { key: "btst", label: "BTST", emoji: "🌙" },
  { key: "swing", label: "Swing", emoji: "📈" },
  { key: "positional", label: "Positional", emoji: "🏦" },
  { key: "longterm", label: "Long-Term", emoji: "💎" },
];

interface Props {
  value: "all" | ScannerPersona;
  onChange: (v: "all" | ScannerPersona) => void;
}

export function PersonaFilterChips({ value, onChange }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {CHIPS.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => onChange(chip.key)}
          className={cn(
            "shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all",
            value === chip.key
              ? "bg-primary text-primary-foreground border-primary shadow-sm"
              : "bg-white text-foreground border-border/70 hover:border-primary/40 active:scale-95"
          )}
        >
          <span className="text-xs">{chip.emoji}</span>
          {chip.label}
        </button>
      ))}
    </div>
  );
}
