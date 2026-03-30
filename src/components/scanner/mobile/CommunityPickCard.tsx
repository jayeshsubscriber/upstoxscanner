import { Link } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  ChevronRight,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { OpportunityFeedItem } from "@/data/opportunityFeed";

interface Props {
  item: OpportunityFeedItem;
  index: number;
}

export function CommunityPickCard({ item, index }: Props) {
  if (!item.community) return null;

  const isBullish = item.direction === "bullish";

  return (
    <div
      className="feed-card-enter"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="rounded-xl border border-amber-200/60 bg-gradient-to-r from-amber-50/50 to-white overflow-hidden">
        <div className="p-3.5">
          {/* Community header */}
          <div className="flex items-center gap-2.5 mb-3">
            {/* Creator avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {item.community.creatorName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-bold text-foreground truncate">
                  {item.community.creatorName}
                </span>
                {item.community.verified && (
                  <CheckCircle2 className="w-3 h-3 text-blue-500 shrink-0" />
                )}
              </div>
              <p className="text-[9px] text-muted-foreground">
                @{item.community.creatorHandle}
              </p>
            </div>
            <Badge
              className={cn(
                "text-[9px] border-0 shrink-0",
                item.community.hitBadge === "high"
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              )}
            >
              {item.community.hitRate}% hit rate
            </Badge>
          </div>

          {/* Stock info */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-7 h-7 rounded-md flex items-center justify-center",
                  isBullish ? "bg-green-50" : "bg-red-50"
                )}
              >
                {isBullish ? (
                  <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-red-600" />
                )}
              </div>
              <div>
                <span className="text-sm font-bold text-foreground">
                  {item.symbol}
                </span>
                <p className="text-[9px] text-muted-foreground">
                  ₹{item.price.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
            <span
              className={cn(
                "text-sm font-bold tabular-nums",
                isBullish ? "text-green-600" : "text-red-600"
              )}
            >
              {item.changePct >= 0 ? "+" : ""}
              {item.changePct.toFixed(2)}%
            </span>
          </div>

          {/* Signal */}
          <p className="text-[11px] text-foreground/75 leading-relaxed mb-2.5">
            {item.signal}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Users className="w-3 h-3" />
              Community scanner
            </div>
            <Link
              to={`/marketplace/${item.scannerId}`}
              className="flex items-center gap-0.5 text-[10px] font-semibold text-primary"
            >
              View scanner
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
