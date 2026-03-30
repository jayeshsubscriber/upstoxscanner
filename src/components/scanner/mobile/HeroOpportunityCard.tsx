import { Link } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  Flame,
  Clock,
  Bell,
  ChevronRight,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { OpportunityFeedItem, TimePhase } from "@/data/opportunityFeed";

interface Props {
  item: OpportunityFeedItem | null;
  phase: TimePhase;
}

export function HeroOpportunityCard({ item, phase }: Props) {
  if (!item) {
    // After-hours / no signals fallback
    return (
      <div className="rounded-2xl bg-gradient-to-br from-muted to-muted/50 p-5 border border-border/50">
        <p className="text-sm font-bold text-foreground mb-1">
          {phase.label}
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {phase.description}. Check back during market hours for live signals.
        </p>
      </div>
    );
  }

  const isBullish = item.direction === "bullish";

  // Extract compact thesis: first sentence of entry + stopLoss
  const compactEntry = item.tradeThesis.entry.split(". ")[0] + ".";
  const compactStop = item.tradeThesis.stopLoss.split(". ")[0] + ".";

  return (
    <Link to={`/scanners/${item.scannerId}`} className="block">
      <div
        className={cn(
          "rounded-2xl p-4 border relative overflow-hidden",
          isBullish
            ? "bg-gradient-to-br from-green-50 via-emerald-50/60 to-white border-green-200/60"
            : "bg-gradient-to-br from-red-50 via-orange-50/60 to-white border-red-200/60"
        )}
      >
        {/* "Best trade" badge */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
              Top opportunity right now
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Clock className="w-3 h-3" />
            {item.timestamp}
          </div>
        </div>

        {/* Stock info row */}
        <div className="flex items-start justify-between mb-2.5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-foreground tracking-tight">
                {item.symbol}
              </h2>
              {item.strength === "strong" && (
                <Flame className="w-4 h-4 text-orange-500" />
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {item.company} · ₹{item.price.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="text-right">
            <div
              className={cn(
                "flex items-center gap-1 text-base font-black tabular-nums",
                isBullish ? "text-green-600" : "text-red-600"
              )}
            >
              {isBullish ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {item.changePct >= 0 ? "+" : ""}
              {item.changePct.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Signal */}
        <p className="text-xs text-foreground/85 leading-relaxed mb-3">
          {item.signal}
        </p>

        {/* Compact trade thesis */}
        <div
          className={cn(
            "rounded-lg p-2.5 mb-3",
            isBullish ? "bg-green-100/50" : "bg-red-100/50"
          )}
        >
          <p className="text-[10px] font-bold text-foreground/70 uppercase tracking-wider mb-1">
            Trade thesis
          </p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
            <div>
              <span className="text-muted-foreground">Entry: </span>
              <span className="text-foreground font-medium">{compactEntry}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Stop: </span>
              <span className="text-foreground font-medium">{compactStop}</span>
            </div>
            <div>
              <span className="text-muted-foreground">R:R: </span>
              <span className="text-foreground font-medium">
                {item.tradeThesis.riskReward.split(". ")[0]}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Hold: </span>
              <span className="text-foreground font-medium">
                {item.tradeThesis.holdDuration.split(". ")[0]}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom row: source + actions */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">
            from{" "}
            <span className="font-semibold text-primary">{item.scannerName}</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="w-7 h-7 rounded-full bg-white/80 border border-border/50 flex items-center justify-center hover:bg-white transition-colors"
            >
              <Bell className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-primary">
              View Chart
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
