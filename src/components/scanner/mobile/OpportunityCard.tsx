import { useState } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Bell,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Activity,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PRE_BUILT_SCANNERS } from "@/data/mockData";
import type { OpportunityFeedItem } from "@/data/opportunityFeed";

interface Props {
  item: OpportunityFeedItem;
  index: number;
}

export function OpportunityCard({ item, index }: Props) {
  const [expanded, setExpanded] = useState(false);

  const isBullish = item.direction === "bullish";

  // Related scanner names
  const relatedNames = item.relatedScannerIds
    .map((id) => PRE_BUILT_SCANNERS.find((s) => s.id === id)?.name)
    .filter(Boolean);

  return (
    <div
      className="feed-card-enter"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div
        className={cn(
          "rounded-xl border bg-white overflow-hidden transition-all",
          expanded ? "border-primary/25 shadow-sm" : "border-border/60"
        )}
      >
        {/* Clickable main area */}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full text-left p-3.5"
        >
          {/* Row 1: Stock + Change */}
          <div className="flex items-start justify-between mb-1.5">
            <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                  isBullish ? "bg-green-50" : "bg-red-50"
                )}
              >
                {isBullish ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                )}
              </div>
              <div>
                <span className="text-sm font-bold text-foreground">
                  {item.symbol}
                </span>
                <p className="text-[10px] text-muted-foreground">
                  ₹{item.price.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
            <div className="text-right flex flex-col items-end gap-0.5">
              <span
                className={cn(
                  "text-sm font-bold tabular-nums",
                  isBullish ? "text-green-600" : "text-red-600"
                )}
              >
                {item.changePct >= 0 ? "+" : ""}
                {item.changePct.toFixed(2)}%
              </span>
              <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                <Clock className="w-2.5 h-2.5" />
                {item.timestamp}
              </span>
            </div>
          </div>

          {/* Signal line */}
          <p className="text-[11px] text-foreground/80 leading-relaxed mb-2">
            {item.signal}
          </p>

          {/* Compact thesis: Entry + Stop in one line */}
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-2">
            <span>
              <span className="font-medium text-foreground/70">Entry:</span>{" "}
              {truncate(item.tradeThesis.entry, 40)}
            </span>
          </div>

          {/* Bottom: source + expand indicator */}
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
                  Trade thesis <ChevronDown className="w-3 h-3" />
                </>
              )}
            </div>
          </div>
        </button>

        {/* Expanded trade thesis */}
        {expanded && (
          <div className="px-3.5 pb-3.5 border-t border-border/40 pt-3 space-y-3">
            {/* Full thesis grid */}
            <div className="grid grid-cols-2 gap-2">
              <ThesisItem label="Entry" value={item.tradeThesis.entry} />
              <ThesisItem label="Stop-Loss" value={item.tradeThesis.stopLoss} />
              <ThesisItem label="Risk:Reward" value={item.tradeThesis.riskReward} />
              <ThesisItem label="Hold Duration" value={item.tradeThesis.holdDuration} />
            </div>

            {/* Key metrics */}
            {Object.keys(item.details).length > 0 && (
              <div className="flex items-center gap-3 flex-wrap">
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

            {/* Action buttons */}
            <div className="flex items-center gap-2 pt-1">
              <Link
                to={`/scanners/${item.scannerId}`}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Trade in Upstox
              </Link>
              <button
                type="button"
                className="w-10 h-10 rounded-lg border border-border/70 bg-white flex items-center justify-center hover:border-primary/30 transition-colors"
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
    <div className="rounded-lg bg-muted/40 p-2">
      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
        {label}
      </p>
      <p className="text-[10px] text-foreground leading-relaxed">{value}</p>
    </div>
  );
}

function truncate(str: string, len: number): string {
  if (str.length <= len) return str;
  return str.slice(0, len).trimEnd() + "…";
}
