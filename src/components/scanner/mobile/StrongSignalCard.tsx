import { useState } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Bell,
  Flame,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Activity,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PRE_BUILT_SCANNERS } from "@/data/mockData";
import type { OpportunityFeedItem } from "@/data/opportunityFeed";

interface Props {
  item: OpportunityFeedItem;
  index: number;
}

export function StrongSignalCard({ item, index }: Props) {
  const [expanded, setExpanded] = useState(false);

  const isBullish = item.direction === "bullish";

  const relatedNames = item.relatedScannerIds
    .map((id) => PRE_BUILT_SCANNERS.find((s) => s.id === id)?.name)
    .filter(Boolean);

  // Compact thesis
  const compactEntry = item.tradeThesis.entry.split(". ")[0] + ".";
  const compactStop = item.tradeThesis.stopLoss.split(". ")[0] + ".";

  return (
    <div
      className="feed-card-enter"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div
        className={cn(
          "rounded-xl border overflow-hidden transition-all mobile-signal-highlight",
          isBullish
            ? "bg-gradient-to-br from-green-50/80 via-white to-white border-green-200/70"
            : "bg-gradient-to-br from-red-50/80 via-white to-white border-red-200/70",
          expanded && "shadow-md"
        )}
      >
        {/* Strong signal banner */}
        <div
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-1.5",
            isBullish ? "bg-green-100/60" : "bg-red-100/60"
          )}
        >
          <Flame className="w-3 h-3 text-orange-500" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/70">
            Strong Signal
          </span>
          <Zap className="w-3 h-3 text-orange-500 ml-auto" />
        </div>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full text-left p-3.5"
        >
          {/* Stock + Change */}
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-foreground">
                  {item.symbol}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground">
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
              <span className="text-[9px] text-muted-foreground flex items-center gap-0.5 justify-end mt-0.5">
                <Clock className="w-2.5 h-2.5" />
                {item.timestamp}
              </span>
            </div>
          </div>

          {/* Signal */}
          <p className="text-[11px] text-foreground/85 leading-relaxed mb-2.5">
            {item.signal}
          </p>

          {/* Inline compact thesis */}
          <div className="flex gap-3 text-[10px] mb-2.5">
            <span className="text-muted-foreground">
              <span className="font-semibold text-foreground/70">Entry:</span>{" "}
              {compactEntry}
            </span>
            <span className="text-muted-foreground">
              <span className="font-semibold text-foreground/70">Stop:</span>{" "}
              {compactStop}
            </span>
          </div>

          {/* Volume bar */}
          <div className="flex items-center gap-2 mb-2.5">
            <div className="flex-1 h-1.5 rounded-full bg-muted/60 overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full",
                  isBullish ? "bg-green-500/70" : "bg-red-500/70"
                )}
                style={{
                  width: `${Math.min((item.volume / item.volumeAvg) * 20, 100)}%`,
                }}
              />
            </div>
            <span className="text-[9px] text-muted-foreground tabular-nums shrink-0">
              {(item.volume / item.volumeAvg).toFixed(1)}x vol
            </span>
          </div>

          {/* Bottom: source + expand */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-primary font-medium flex items-center gap-1">
              <Activity className="w-3 h-3" />
              {item.scannerName}
            </span>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              {expanded ? (
                <>
                  Less <ChevronUp className="w-3 h-3" />
                </>
              ) : (
                <>
                  Full thesis <ChevronDown className="w-3 h-3" />
                </>
              )}
            </div>
          </div>
        </button>

        {/* Expanded */}
        {expanded && (
          <div className="px-3.5 pb-3.5 border-t border-border/30 pt-3 space-y-3">
            {/* Why this signal is strong */}
            <div className="rounded-lg bg-amber-50/60 border border-amber-200/40 p-2.5">
              <p className="text-[10px] font-bold text-amber-800 mb-1">Why it's strong</p>
              <p className="text-[10px] text-amber-900/70 leading-relaxed">
                {item.tradeThesis.why}
              </p>
            </div>

            {/* Full thesis grid */}
            <div className="grid grid-cols-2 gap-2">
              <ThesisItem label="Entry" value={item.tradeThesis.entry} />
              <ThesisItem label="Stop-Loss" value={item.tradeThesis.stopLoss} />
              <ThesisItem label="Risk:Reward" value={item.tradeThesis.riskReward} />
              <ThesisItem label="Hold Duration" value={item.tradeThesis.holdDuration} />
            </div>

            {/* Metrics */}
            {Object.keys(item.details).length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                {Object.entries(item.details).map(([key, val]) => (
                  <Badge
                    key={key}
                    variant="secondary"
                    className="text-[9px] font-medium"
                  >
                    {key}: {val}
                  </Badge>
                ))}
              </div>
            )}

            {/* Also matched */}
            {relatedNames.length > 0 && (
              <p className="text-[10px] text-muted-foreground">
                Also matched:{" "}
                {relatedNames.map((name, i) => (
                  <span key={name}>
                    <span className="font-medium text-foreground/70">{name}</span>
                    {i < relatedNames.length - 1 ? ", " : ""}
                  </span>
                ))}
              </p>
            )}

            {/* CTAs */}
            <div className="flex items-center gap-2 pt-1">
              <Link
                to={`/scanners/${item.scannerId}`}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Trade in Upstox
              </Link>
              <button
                type="button"
                className="w-10 h-10 rounded-lg border border-border/70 bg-white flex items-center justify-center"
              >
                <Bell className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ThesisItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/80 border border-border/30 p-2">
      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
        {label}
      </p>
      <p className="text-[10px] text-foreground leading-relaxed">{value}</p>
    </div>
  );
}
