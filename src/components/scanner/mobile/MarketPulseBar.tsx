import { cn } from "@/lib/utils";
import type { MarketPulse } from "@/data/opportunityFeed";

interface Props {
  pulse: MarketPulse;
}

export function MarketPulseBar({ pulse }: Props) {
  const moodColor =
    pulse.mood === "Bullish"
      ? "text-green-600"
      : pulse.mood === "Bearish"
      ? "text-red-600"
      : "text-yellow-600";
  const moodBg =
    pulse.mood === "Bullish"
      ? "bg-green-500"
      : pulse.mood === "Bearish"
      ? "bg-red-500"
      : "bg-yellow-500";

  const advPct =
    (pulse.breadth.advancing / pulse.breadth.total) * 100;
  const decPct =
    (pulse.breadth.declining / pulse.breadth.total) * 100;

  return (
    <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/50">
      <div className="max-w-lg mx-auto px-4 py-2">
        {/* Row 1: Indices + Mood */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <IndexPill label="NIFTY" value={pulse.nifty.value} change={pulse.nifty.change} />
            <IndexPill label="BANK" value={pulse.bankNifty.value} change={pulse.bankNifty.change} />
          </div>
          <div className="flex items-center gap-1.5">
            <div className={cn("w-1.5 h-1.5 rounded-full", moodBg)} />
            <span className={cn("text-[10px] font-bold", moodColor)}>
              {pulse.mood}
            </span>
          </div>
        </div>

        {/* Row 2: Breadth bar */}
        <div className="mt-1.5 flex items-center gap-2">
          <div className="flex-1 h-1 rounded-full bg-muted/60 overflow-hidden flex">
            <div
              className="h-full bg-green-500/80 rounded-l-full"
              style={{ width: `${advPct}%` }}
            />
            <div
              className="h-full bg-red-500/80 rounded-r-full"
              style={{ width: `${decPct}%` }}
            />
          </div>
          <span className="text-[8px] text-muted-foreground tabular-nums shrink-0">
            {pulse.breadth.advancing}↑ {pulse.breadth.declining}↓
          </span>
        </div>
      </div>
    </div>
  );
}

function IndexPill({
  label,
  value,
  change,
}: {
  label: string;
  value: number;
  change: number;
}) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-[9px] text-muted-foreground font-medium">{label}</span>
      <span className="text-[11px] font-bold tabular-nums">
        {value.toLocaleString("en-IN")}
      </span>
      <span
        className={cn(
          "text-[9px] font-bold tabular-nums",
          change >= 0 ? "text-green-600" : "text-red-600"
        )}
      >
        {change >= 0 ? "+" : ""}
        {change}%
      </span>
    </div>
  );
}
