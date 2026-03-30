import { useState, useCallback } from "react";
import type { OpportunityFeedItem } from "@/data/opportunityFeed";
import { OpportunityCard } from "./OpportunityCard";
import { StrongSignalCard } from "./StrongSignalCard";
import { EducationInlineCard } from "./EducationInlineCard";
import { CommunityPickCard } from "./CommunityPickCard";

interface Props {
  items: OpportunityFeedItem[];
}

export function OpportunityFeed({ items }: Props) {
  const [dismissed, setDismissed] = useState<Set<string>>(() => new Set());
  const [showCount, setShowCount] = useState(8);

  const dismiss = useCallback((id: string) => {
    setDismissed((prev) => new Set(prev).add(id));
  }, []);

  const visible = items
    .filter((item) => !dismissed.has(item.id))
    .slice(0, showCount);

  const hasMore = items.filter((item) => !dismissed.has(item.id)).length > showCount;

  return (
    <div className="space-y-3">
      {visible.map((item, i) => {
        switch (item.type) {
          case "strong-signal":
            return <StrongSignalCard key={item.id} item={item} index={i} />;
          case "education":
            return (
              <EducationInlineCard
                key={item.id}
                item={item}
                index={i}
                onDismiss={() => dismiss(item.id)}
              />
            );
          case "community":
            return <CommunityPickCard key={item.id} item={item} index={i} />;
          default:
            return <OpportunityCard key={item.id} item={item} index={i} />;
        }
      })}

      {hasMore && (
        <button
          type="button"
          onClick={() => setShowCount((c) => c + 6)}
          className="w-full py-3 rounded-xl border border-border/60 bg-white text-xs font-semibold text-foreground hover:border-primary/30 transition-colors"
        >
          Load more signals
        </button>
      )}

      {!hasMore && visible.length > 0 && (
        <p className="text-center text-[10px] text-muted-foreground py-2">
          You've seen all active signals. Pull down to refresh.
        </p>
      )}
    </div>
  );
}
