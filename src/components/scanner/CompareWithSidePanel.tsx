"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CATEGORIES } from "@/data/indicators";
import { getRelevantRightIndicators } from "@/lib/rightOperandIndicators";
import { cn } from "@/lib/utils";

/**
 * Right-hand panel: “Value” (number + Apply) and “Indicators” (search + grouped list),
 * limited to series valid for the selected left operand.
 */
export function CompareWithSidePanel({
  leftIndicatorId,
  initialRightValue = "",
  onClose,
  onPickValue,
  onPickIndicator,
}: {
  leftIndicatorId: string | null;
  initialRightValue?: string;
  onClose: () => void;
  onPickValue: (value: string) => void;
  onPickIndicator: (indicatorId: string) => void;
}) {
  const [q, setQ] = useState("");
  const [valueDraft, setValueDraft] = useState(initialRightValue ?? "");

  const indicators = useMemo(
    () => getRelevantRightIndicators(leftIndicatorId),
    [leftIndicatorId]
  );

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return indicators;
    return indicators.filter(
      (ind) =>
        ind.name.toLowerCase().includes(s) ||
        ind.id.toLowerCase().includes(s)
    );
  }, [indicators, q]);

  const groupedByCategory = useMemo(() => {
    const byKey = new Map<string, (typeof filtered)[number][]>();
    for (const ind of filtered) {
      const list = byKey.get(ind.category) ?? [];
      list.push(ind);
      byKey.set(ind.category, list);
    }
    return CATEGORIES.filter((c) => (byKey.get(c.key)?.length ?? 0) > 0).map((c) => ({
      category: c,
      items: byKey.get(c.key)!,
    }));
  }, [filtered]);

  useEffect(() => {
    setQ("");
    setValueDraft(initialRightValue ?? "");
  }, [leftIndicatorId, initialRightValue]);

  const canApplyValue =
    valueDraft.trim() !== "" && !Number.isNaN(Number(valueDraft.trim()));

  function commitValue() {
    const v = valueDraft.trim();
    if (v === "" || Number.isNaN(Number(v))) return;
    onPickValue(v);
    onClose();
  }

  return (
    <div className="flex flex-col h-full min-h-0 bg-background">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-2 shrink-0">
        <h2 className="text-sm font-semibold text-foreground">Compare with</h2>
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground p-1 rounded-md shrink-0 -mr-1"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        <div className="px-4 py-3 space-y-2 shrink-0">
          <h3 className="text-sm font-semibold text-foreground">Value</h3>
          <Input
            type="number"
            inputMode="decimal"
            placeholder="Enter number"
            value={valueDraft}
            onChange={(e) => setValueDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitValue();
              }
            }}
            className="h-9 text-sm"
            autoFocus
          />
          <Button
            type="button"
            variant="default"
            size="sm"
            className="h-9 w-full text-xs"
            disabled={!canApplyValue}
            onClick={commitValue}
          >
            Apply
          </Button>
        </div>

        <div
          className="flex items-center gap-3 px-4 py-3 shrink-0 bg-muted/50 border-y border-border"
          role="separator"
          aria-label="Or pick an indicator below"
        >
          <div className="h-px flex-1 bg-border" />
          <span className="shrink-0 rounded-full bg-primary/12 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Or
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="flex-1 min-h-0 flex flex-col">
          <div className="px-4 pt-3 pb-2 space-y-2 shrink-0 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Indicators</h3>
            <div className="relative">
              <Search
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
              <Input
                placeholder="Search indicators…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="h-9 text-sm pl-8"
              />
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto px-2 py-2">
            {indicators.length === 0 && (
              <p className="px-3 py-4 text-sm text-muted-foreground">
                Select a technical indicator on the left to see comparable series.
              </p>
            )}
            {groupedByCategory.map(({ category, items }) => (
              <div key={category.key} className="mb-1">
                <div className="px-2 py-2 text-xs font-bold text-foreground">{category.label}</div>
                {items.map((ind) => (
                  <button
                    key={ind.id}
                    type="button"
                    onClick={() => {
                      onPickIndicator(ind.id);
                      onClose();
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg text-left",
                      "hover:bg-primary/5 transition-colors"
                    )}
                  >
                    <span className="flex items-center gap-1.5 min-w-0">
                      <span className="truncate">
                        {ind.id === "close" ? "Close (Price)" : ind.name}
                      </span>
                      {ind.isNew && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0 h-4 shrink-0 bg-primary/10 text-primary font-semibold"
                        >
                          New
                        </Badge>
                      )}
                    </span>
                    <span className="text-muted-foreground shrink-0">›</span>
                  </button>
                ))}
              </div>
            ))}
            {indicators.length > 0 && filtered.length === 0 && (
              <p className="px-3 py-3 text-xs text-muted-foreground">No matches.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
