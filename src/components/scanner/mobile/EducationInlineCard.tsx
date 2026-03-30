import { useState } from "react";
import { ChevronDown, ChevronUp, Lightbulb, X } from "lucide-react";
import type { OpportunityFeedItem } from "@/data/opportunityFeed";

interface Props {
  item: OpportunityFeedItem;
  index: number;
  onDismiss?: () => void;
}

export function EducationInlineCard({ item, index, onDismiss }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="feed-card-enter"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="rounded-xl bg-gradient-to-r from-primary/[0.06] via-primary/[0.03] to-transparent border border-primary/15 overflow-hidden">
        <div className="p-3.5">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <Lightbulb className="w-3.5 h-3.5 text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-primary uppercase tracking-wider">
                  Learn
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {item.educationScannerName}
                </p>
              </div>
            </div>
            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                className="w-6 h-6 rounded-full hover:bg-muted/60 flex items-center justify-center"
              >
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Education text */}
          <p className="text-[11px] text-foreground/80 leading-relaxed mb-2">
            {item.educationText}
          </p>

          {/* Expand to see more */}
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-[10px] font-semibold text-primary"
          >
            {expanded ? (
              <>
                Show less <ChevronUp className="w-3 h-3" />
              </>
            ) : (
              <>
                Why does this work? <ChevronDown className="w-3 h-3" />
              </>
            )}
          </button>

          {expanded && (
            <div className="mt-2.5 pt-2.5 border-t border-primary/10 space-y-2.5">
              <div>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
                  Why it works
                </p>
                <p className="text-[10px] text-foreground/70 leading-relaxed">
                  {item.tradeThesis.why}
                </p>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 rounded-lg bg-primary/5 p-2">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase mb-0.5">
                    Entry
                  </p>
                  <p className="text-[10px] text-foreground/70 leading-relaxed">
                    {item.tradeThesis.entry}
                  </p>
                </div>
                <div className="flex-1 rounded-lg bg-primary/5 p-2">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase mb-0.5">
                    Risk
                  </p>
                  <p className="text-[10px] text-foreground/70 leading-relaxed">
                    {item.tradeThesis.riskReward}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
