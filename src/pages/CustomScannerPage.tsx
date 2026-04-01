import { useState, useEffect, useCallback, useRef, useMemo, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  X, Plus, Search, Loader2, Sparkles, Lock, ChevronDown, ChevronRight, Pencil, RotateCcw,
  SlidersHorizontal, TrendingUp, TrendingDown, Share2, Save, Settings2, BellRing, BarChart3, Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CATEGORIES,
  INDICATORS,
  OPERATORS,
  getOperatorsForType,
  getIndicator,
  type IndicatorDef,
  type OperatorId,
  type OperatorDef,
  type IndicatorCategory,
} from "@/data/indicators";
import {
  BALANCE_SHEET_ITEMS,
  CASH_FLOW_ITEMS,
  FINANCIAL_RATIOS_ITEMS,
  INCOME_GROWTH_ITEMS,
  FUTURES_OPTIONS_ITEMS,
  mockIndicatorId,
  PROFITABILITY_ITEMS,
  SHAREHOLDING_ITEMS,
  VALUATION_ITEMS,
} from "@/data/diyMockCatalog";
import { getRelevantRightIndicators } from "@/lib/rightOperandIndicators";
import { isPairComparable } from "@/lib/indicatorComparisonKind";
import { groupUsesChartTimeframe, indicatorUsesChartTimeframe } from "@/lib/indicatorUsesChartTimeframe";

const SUPPORTED_TIMEFRAMES = [
  { value: "1d", label: "Daily" },
  { value: "15m", label: "15 min" },
  { value: "1M", label: "Monthly" },
];

const CONDITION_GROUPS = [
  "Universe",
  "Price",
  "Technicals",
  "Volume & Delivery",
  "Candlesticks",
  "Financial Ratios",
  "Profitability",
  "Income & Growth",
  "Balance Sheet",
  "Cash Flow",
  "Shareholding",
  "Valuation",
  "Futures & Options",
];

import type {
  ConditionState,
  GroupState,
  QueryState,
  ScanResultRow,
  ScanProgress,
  IndicatorColumn,
  ScreenerPreferences,
} from "@/types/screener";
import { DEFAULT_SCREENER_PREFERENCES } from "@/types/screener";
import { runCustomScan, extractIndicatorColumns } from "@/lib/customScanRunner";
import { loadTokenFromSupabase, saveTokenToSupabase, getTokenStatus } from "@/lib/upstoxTokenStore";
import { refreshDailyCandles, refresh15mCandles, refreshMonthlyCandles, getDataFreshness, getInstrumentList, type PipelineProgress } from "@/lib/scannerDataPipeline";
import { supabase } from "@/lib/supabase";
import { generateQueryFormula, AI_EXAMPLES } from "@/lib/aiQueryGenerator";
import { parseFormula, FormulaParseError } from "@/lib/formulaParser";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { Field } from "@/components/ui/field";
import { CompareWithSidePanel } from "@/components/scanner/CompareWithSidePanel";
import { SaveScreenerDialog } from "@/components/screener/SaveScreenerDialog";
import { createSavedScreener, updateSavedScreener } from "@/lib/savedScreeners";

const DIY_SCREENER_STORAGE_KEY = "upstox:diy-screener:v1";
const DEFAULT_SCREENER_NAME = "Untitled screener";

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Lightweight snapshot: fetch latest close/volume for every symbol in the
 * universe with a handful of Supabase queries (no full scan needed).
 */
async function loadUniverseSnapshot(universe: string): Promise<ScanResultRow[]> {
  if (!supabase) return [];
  const instruments = await getInstrumentList(universe);
  if (!instruments.length) return [];

  // Get the 2 most recent dates from the first symbol (fast single-row query)
  const { data: dateSample } = await supabase
    .from("stock_candles_1d")
    .select("date")
    .eq("symbol", instruments[0].symbol)
    .order("date", { ascending: false })
    .limit(2);

  const latestDate: string | undefined = dateSample?.[0]?.date;
  const prevDate: string | undefined = dateSample?.[1]?.date;
  if (!latestDate) return [];

  // Fetch latest-day prices for all symbols (single query, up to 2000 rows)
  const { data: latest } = await supabase
    .from("stock_candles_1d")
    .select("symbol, close, volume")
    .eq("date", latestDate)
    .limit(2000);

  // Fetch previous-day prices for change % calculation
  const { data: prev } = prevDate
    ? await supabase
        .from("stock_candles_1d")
        .select("symbol, close")
        .eq("date", prevDate)
        .limit(2000)
    : { data: [] };

  const latestMap = new Map((latest ?? []).map((r) => [r.symbol as string, r]));
  const prevMap = new Map((prev ?? []).map((r) => [r.symbol as string, r]));

  return instruments
    .filter((inst) => latestMap.has(inst.symbol))
    .map((inst) => {
      const l = latestMap.get(inst.symbol)!;
      const p = prevMap.get(inst.symbol);
      const close = Number(l.close);
      const prevClose = p ? Number(p.close) : close;
      const change1d = prevClose ? ((close - prevClose) / prevClose) * 100 : 0;
      return {
        symbol: inst.symbol,
        name: inst.name,
        close,
        change1d,
        volume: Number(l.volume),
        matchedGroups: 0,
        indicatorValues: {},
      } satisfies ScanResultRow;
    })
    .sort((a, b) => a.symbol.localeCompare(b.symbol));
}

const LOCAL_FALLBACK_STOCKS_50: Array<{ symbol: string; name: string }> = [
  { symbol: "RELIANCE", name: "Reliance Industries" },
  { symbol: "TCS", name: "Tata Consultancy Services" },
  { symbol: "HDFCBANK", name: "HDFC Bank" },
  { symbol: "ICICIBANK", name: "ICICI Bank" },
  { symbol: "INFY", name: "Infosys" },
  { symbol: "SBIN", name: "State Bank of India" },
  { symbol: "BHARTIARTL", name: "Bharti Airtel" },
  { symbol: "LT", name: "Larsen & Toubro" },
  { symbol: "ITC", name: "ITC" },
  { symbol: "HINDUNILVR", name: "Hindustan Unilever" },
  { symbol: "KOTAKBANK", name: "Kotak Mahindra Bank" },
  { symbol: "AXISBANK", name: "Axis Bank" },
  { symbol: "BAJFINANCE", name: "Bajaj Finance" },
  { symbol: "ASIANPAINT", name: "Asian Paints" },
  { symbol: "MARUTI", name: "Maruti Suzuki" },
  { symbol: "SUNPHARMA", name: "Sun Pharmaceutical" },
  { symbol: "ULTRACEMCO", name: "UltraTech Cement" },
  { symbol: "NESTLEIND", name: "Nestle India" },
  { symbol: "TITAN", name: "Titan Company" },
  { symbol: "POWERGRID", name: "Power Grid Corp" },
  { symbol: "NTPC", name: "NTPC" },
  { symbol: "ONGC", name: "ONGC" },
  { symbol: "COALINDIA", name: "Coal India" },
  { symbol: "ADANIENT", name: "Adani Enterprises" },
  { symbol: "ADANIPORTS", name: "Adani Ports" },
  { symbol: "BAJAJFINSV", name: "Bajaj Finserv" },
  { symbol: "HCLTECH", name: "HCL Technologies" },
  { symbol: "WIPRO", name: "Wipro" },
  { symbol: "TECHM", name: "Tech Mahindra" },
  { symbol: "M&M", name: "Mahindra & Mahindra" },
  { symbol: "TATAMOTORS", name: "Tata Motors" },
  { symbol: "TATASTEEL", name: "Tata Steel" },
  { symbol: "JSWSTEEL", name: "JSW Steel" },
  { symbol: "INDUSINDBK", name: "IndusInd Bank" },
  { symbol: "DRREDDY", name: "Dr Reddy's Labs" },
  { symbol: "CIPLA", name: "Cipla" },
  { symbol: "EICHERMOT", name: "Eicher Motors" },
  { symbol: "HEROMOTOCO", name: "Hero MotoCorp" },
  { symbol: "APOLLOHOSP", name: "Apollo Hospitals" },
  { symbol: "GRASIM", name: "Grasim Industries" },
  { symbol: "HDFCLIFE", name: "HDFC Life" },
  { symbol: "SBILIFE", name: "SBI Life Insurance" },
  { symbol: "BRITANNIA", name: "Britannia Industries" },
  { symbol: "DIVISLAB", name: "Divi's Laboratories" },
  { symbol: "BPCL", name: "Bharat Petroleum" },
  { symbol: "SHRIRAMFIN", name: "Shriram Finance" },
  { symbol: "BAJAJ-AUTO", name: "Bajaj Auto" },
  { symbol: "HINDALCO", name: "Hindalco Industries" },
  { symbol: "TATACONSUM", name: "Tata Consumer Products" },
  { symbol: "UPL", name: "UPL" },
];

function buildLocalFallbackRows(): ScanResultRow[] {
  const hashToUnit = (text: string): number => {
    let h = 2166136261;
    for (let i = 0; i < text.length; i++) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return ((h >>> 0) % 10000) / 10000;
  };

  const between = (u: number, min: number, max: number): number => min + (max - min) * u;

  return LOCAL_FALLBACK_STOCKS_50.map((s) => {
    const u1 = hashToUnit(`${s.symbol}:price`);
    const u2 = hashToUnit(`${s.symbol}:chg`);
    const u3 = hashToUnit(`${s.symbol}:vol`);
    const u4 = hashToUnit(`${s.symbol}:mcap`);

    // Keep values in plausible Indian large-cap ranges.
    const close = Number(between(u1, 120, 4200).toFixed(2));
    const change1d = Number((between(u2, -4.2, 4.2)).toFixed(2));
    const volume = Math.round(between(u3, 300000, 28000000));
    const marketCap = Math.round(between(u4, 35000, 2200000) * 1e7); // INR Crores -> INR

    return {
      symbol: s.symbol,
      name: s.name,
      close,
      change1d,
      volume,
      marketCap,
      matchedGroups: 0,
      indicatorValues: {},
    };
  });
}

let _nextId = 1;
function uid() {
  return `c${_nextId++}_${Date.now()}`;
}

function defaultParams(ind: IndicatorDef): Record<string, number | string> {
  const p: Record<string, number | string> = {};
  for (const param of ind.params) p[param.key] = param.defaultValue;
  return p;
}

function createCondition(): ConditionState {
  return {
    id: uid(),
    leftIndicatorId: "",
    leftParams: {},
    operator: "",
    rightType: "value",
    rightValue: "",
    rightIndicatorId: "",
    rightParams: {},
    rightMultiplier: 1,
    comparisonMarginPercent: 0,
    rightValue2: "",
    hasTimeModifier: false,
    timeModifierMode: "within_last",
    timeModifierBars: 5,
  };
}

function createGroup(connector: "AND" | "OR" = "AND", timeframe = "1d"): GroupState {
  return { id: uid(), logic: "AND", timeframe, connector, conditions: [createCondition()] };
}

function formatIndicator(id: string, params: Record<string, number | string>): string {
  const ind = getIndicator(id);
  if (!ind) return "";
  const numberParams = ind.params.filter((p) => p.type === "number");
  const selectParams = ind.params.filter((p) => p.type === "select");

  let label = ind.name;

  if (selectParams.length > 0) {
    const selVals = selectParams.map((p) => {
      const val = String(params[p.key] ?? p.defaultValue);
      const opt = p.options.find((o) => o.value === val);
      return opt ? opt.label : val;
    });
    label += ` [${selVals.join(", ")}]`;
  }

  if (numberParams.length > 0) {
    const numVals = numberParams.map((p) => params[p.key] ?? p.defaultValue).join(",");
    label += `(${numVals})`;
  }

  return label;
}

function generateSummary(groups: GroupState[]): string {
  const parts = groups
    .map((group) => {
      const sentences = group.conditions
        .filter((c) => c.leftIndicatorId && c.operator)
        .map((c) => {
          const left = formatIndicator(c.leftIndicatorId, c.leftParams);
          const op = OPERATORS.find((o) => o.id === c.operator);
          if (!op) return "";

          let s = `${left} ${op.label}`;

          if (op.needsRight) {
            if (op.rightType === "range") {
              s += ` ${c.rightValue || "?"} and ${c.rightValue2 || "?"}`;
            } else if (c.rightType === "indicator" && c.rightIndicatorId) {
              const mult = c.rightMultiplier !== 1 ? `${c.rightMultiplier}× ` : "";
              s += ` ${mult}${formatIndicator(c.rightIndicatorId, c.rightParams)}`;
            } else if (c.rightValue) {
              s += ` ${c.rightValue}`;
            }
            const m = c.comparisonMarginPercent ?? 0;
            if (
              m > 0 &&
              (c.operator === "greater_than" || c.operator === "less_than")
            ) {
              s += ` (${m}% margin)`;
            }
          }

          if (c.hasTimeModifier && c.timeModifierBars > 0) {
            if (op.id === "detected") {
              const n = c.timeModifierBars;
              s += ` within ${n} ${n === 1 ? "bar" : "bars"}`;
            } else if (op.timeModifier === "required_for") {
              s += ` for ${c.timeModifierBars} bars`;
            } else if (c.timeModifierMode === "exactly_ago") {
              s += ` exactly ${c.timeModifierBars} bars ago`;
            } else if (c.timeModifierMode === "all_of_last") {
              s += ` in all of last ${c.timeModifierBars} bars`;
            } else {
              s += ` within last ${c.timeModifierBars} bars`;
            }
          }

          return s;
        })
        .filter(Boolean);

      if (sentences.length === 0) return { text: "", connector: group.connector, timeframe: group.timeframe };
      const tf = SUPPORTED_TIMEFRAMES.find((t) => t.value === group.timeframe)?.label ?? group.timeframe;
      const body = sentences.join(` ${group.logic} `);
      const needsTf = groupUsesChartTimeframe(group);
      return {
        text: needsTf ? `[${tf}] ${body}` : body,
        connector: group.connector,
        timeframe: group.timeframe,
      };
    })
    .filter((p) => p.text);

  if (parts.length === 0) return "";
  if (parts.length === 1) return `Stocks where ${parts[0].text}`;

  return `Stocks where ${parts
    .map((p, i) => (i > 0 ? `${p.connector} (${p.text})` : `(${p.text})`))
    .join(" ")}`;
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function IndicatorSelect({
  value,
  onChange,
  excludePatterns,
}: {
  value: string;
  onChange: (id: string) => void;
  excludePatterns?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "h-8 w-full rounded-md border border-input bg-transparent px-2 text-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        !value && "text-muted-foreground"
      )}
    >
      <option value="">Select indicator...</option>
      {CATEGORIES.filter(
        (cat) => !excludePatterns || cat.key !== "candlestick"
      ).map((cat) => {
        const items = INDICATORS.filter((i) => i.category === cat.key);
        if (items.length === 0) return null;
        return (
          <optgroup key={cat.key} label={cat.label}>
            {items.map((ind) => (
              <option key={ind.id} value={ind.id}>
                {ind.name}{ind.isNew ? " ✦ New" : ""}
              </option>
            ))}
          </optgroup>
        );
      })}
    </select>
  );
}

/** Classic builder: right indicator list filtered like the Compare-with panel. */
function IndicatorSelectRight({
  leftIndicatorId,
  value,
  onChange,
}: {
  leftIndicatorId: string;
  value: string;
  onChange: (id: string) => void;
}) {
  const relevant = getRelevantRightIndicators(leftIndicatorId || null);
  const byCat = new Map<IndicatorCategory, IndicatorDef[]>();
  for (const ind of relevant) {
    const list = byCat.get(ind.category) ?? [];
    list.push(ind);
    byCat.set(ind.category, list);
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "h-8 w-full rounded-md border border-input bg-transparent px-2 text-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        !value && "text-muted-foreground"
      )}
    >
      <option value="">Select indicator...</option>
      {CATEGORIES.filter((cat) => (byCat.get(cat.key)?.length ?? 0) > 0).map((cat) => (
        <optgroup key={cat.key} label={cat.label}>
          {(byCat.get(cat.key) ?? []).map((ind) => (
            <option key={ind.id} value={ind.id}>
              {ind.name}
              {ind.isNew ? " ✦ New" : ""}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}

function ParamFields({
  indicator,
  params,
  onChange,
}: {
  indicator: IndicatorDef;
  params: Record<string, number | string>;
  onChange: (p: Record<string, number | string>) => void;
}) {
  if (indicator.params.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-1.5">
      {indicator.params.map((p) => {
        if (p.type === "select") {
          return (
            <label
              key={p.key}
              className="flex items-center gap-1 text-xs text-muted-foreground"
            >
              {p.label}
              <select
                value={String(params[p.key] ?? p.defaultValue)}
                onChange={(e) =>
                  onChange({ ...params, [p.key]: e.target.value })
                }
                className="h-6 rounded border border-input bg-transparent px-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {p.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          );
        }
        return (
          <label
            key={p.key}
            className="flex items-center gap-1 text-xs text-muted-foreground"
          >
            {p.label}
            <Input
              type="number"
              value={params[p.key] ?? p.defaultValue}
              onChange={(e) => {
                const raw = e.target.value;
                onChange({ ...params, [p.key]: raw === "" ? "" : Number(raw) });
              }}
              onBlur={(e) => {
                const v = e.target.value;
                if (v === "" || isNaN(Number(v)))
                  onChange({ ...params, [p.key]: p.defaultValue });
              }}
              className="h-6 w-14 text-xs px-1.5"
              min={p.min}
              max={p.max}
              step={p.step ?? 1}
            />
          </label>
        );
      })}
    </div>
  );
}

function ConditionCard({
  condition,
  onChange,
  onDelete,
  canDelete,
  embedded,
}: {
  condition: ConditionState;
  onChange: (c: ConditionState) => void;
  onDelete: () => void;
  canDelete: boolean;
  embedded?: boolean;
}) {
  const leftInd = condition.leftIndicatorId
    ? getIndicator(condition.leftIndicatorId)
    : null;
  const opDef: OperatorDef | undefined = condition.operator
    ? OPERATORS.find((o) => o.id === condition.operator)
    : undefined;

  const validOps = leftInd ? getOperatorsForType(leftInd.outputType) : [];
  const needsRight = opDef?.needsRight ?? false;
  const isRange = opDef?.rightType === "range";

  const showTimeMod =
    opDef?.timeModifier === "optional_within" ||
    opDef?.timeModifier === "required_for";
  const forceTimeMod = opDef?.timeModifier === "required_for";
  const isCrossOperator =
    condition.operator === "crossed_above" || condition.operator === "crossed_below";
  const showConditionTimeModifierUi = showTimeMod && !isCrossOperator;
  const inlineTimeMod = forceTimeMod || condition.operator === "detected";

  function update(patch: Partial<ConditionState>) {
    onChange({ ...condition, ...patch });
  }

  function handleLeftChange(indicatorId: string) {
    const ind = indicatorId ? getIndicator(indicatorId) : null;
    const isPattern = ind?.outputType === "pattern";
    update({
      leftIndicatorId: indicatorId,
      leftParams: ind ? defaultParams(ind) : {},
      operator: isPattern ? "detected" : "",
      rightType: "value",
      rightValue: "",
      rightIndicatorId: "",
      rightParams: {},
      rightValue2: "",
      ...(isPattern
        ? { hasTimeModifier: true, timeModifierMode: "within_last" as const, timeModifierBars: 1 }
        : { hasTimeModifier: false, timeModifierBars: 5 }),
    });
  }

  function handleOperatorChange(newOp: string) {
    const opId = newOp as OperatorId;
    const incDec = opId === "is_increasing" || opId === "is_decreasing";
    const isDetected = opId === "detected";
    update({
      operator: opId || "",
      hasTimeModifier: incDec || isDetected,
      timeModifierBars: incDec || isDetected ? 1 : 5,
      ...(isDetected ? { timeModifierMode: "within_last" as const } : {}),
    });
  }

  useEffect(() => {
    if (
      condition.rightType !== "indicator" ||
      !condition.rightIndicatorId ||
      !condition.leftIndicatorId
    ) {
      return;
    }
    if (!isPairComparable(condition.leftIndicatorId, condition.rightIndicatorId)) {
      onChange({
        ...condition,
        rightType: "value",
        rightIndicatorId: "",
        rightParams: {},
        rightValue: "",
      });
    }
  }, [
    condition.leftIndicatorId,
    condition.rightIndicatorId,
    condition.rightType,
    onChange,
    condition,
  ]);

  return (
    <div className={cn(
      "p-3 relative group/cond",
      embedded ? "bg-transparent" : "rounded-lg border border-border bg-white"
    )}>
      {canDelete && (
        <button
          onClick={onDelete}
          className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center text-muted-foreground/50 hover:text-destructive rounded-sm opacity-0 group-hover/cond:opacity-100 transition-opacity"
          title="Remove condition"
        >
          <X size={14} />
        </button>
      )}

      {/* Left indicator */}
      <div className="pr-6">
        <IndicatorSelect
          value={condition.leftIndicatorId}
          onChange={handleLeftChange}
        />
        {leftInd && (
          <ParamFields
            indicator={leftInd}
            params={condition.leftParams}
            onChange={(p) => update({ leftParams: p })}
          />
        )}
      </div>

      {/* Operator */}
      {leftInd && (
        <div className="mt-2">
          <select
            value={condition.operator}
            onChange={(e) => handleOperatorChange(e.target.value)}
            className={cn(
              "h-8 w-full rounded-md border border-input bg-transparent px-2 text-sm",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              !condition.operator && "text-muted-foreground"
            )}
          >
            <option value="">Select condition...</option>
            {validOps.map((op) => (
              <option key={op.id} value={op.id}>
                {op.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Right operand — value or indicator */}
      {opDef && needsRight && !isRange && (
        <div className="mt-2 space-y-1.5">
          <div className="flex gap-0">
            <button
              type="button"
              className={cn(
                "px-2.5 py-1 text-xs rounded-l-md border transition-colors",
                condition.rightType === "value"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-input text-muted-foreground hover:bg-accent"
              )}
              onClick={() =>
                update({
                  rightType: "value",
                  rightIndicatorId: "",
                  rightParams: {},
                })
              }
            >
              Value
            </button>
            <button
              type="button"
              className={cn(
                "px-2.5 py-1 text-xs rounded-r-md border-y border-r transition-colors",
                condition.rightType === "indicator"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-input text-muted-foreground hover:bg-accent"
              )}
              onClick={() => update({ rightType: "indicator", rightValue: "" })}
            >
              Indicator
            </button>
          </div>

          {condition.rightType === "value" ? (
            <Input
              type="number"
              value={condition.rightValue}
              onChange={(e) => update({ rightValue: e.target.value })}
              placeholder="Enter value"
              className="h-8 text-sm"
            />
          ) : (
            <>
              <IndicatorSelectRight
                leftIndicatorId={condition.leftIndicatorId}
                value={condition.rightIndicatorId}
                onChange={(id) => {
                  const ind = id ? getIndicator(id) : null;
                  update({
                    rightIndicatorId: id,
                    rightParams: ind ? defaultParams(ind) : {},
                  });
                }}
              />
              {condition.rightIndicatorId &&
                getIndicator(condition.rightIndicatorId) && (
                  <ParamFields
                    indicator={getIndicator(condition.rightIndicatorId)!}
                    params={condition.rightParams}
                    onChange={(p) => update({ rightParams: p })}
                  />
                )}
            </>
          )}
        </div>
      )}

      {/* Right operand — range (is_between) */}
      {opDef && isRange && (
        <div className="mt-2 flex items-center gap-2">
          <Input
            type="number"
            value={condition.rightValue}
            onChange={(e) => update({ rightValue: e.target.value })}
            placeholder="Min"
            className="h-8 text-sm flex-1"
          />
          <span className="text-xs text-muted-foreground shrink-0">and</span>
          <Input
            type="number"
            value={condition.rightValue2}
            onChange={(e) => update({ rightValue2: e.target.value })}
            placeholder="Max"
            className="h-8 text-sm flex-1"
          />
        </div>
      )}

      {/* Time modifier — not for cross operators */}
      {showConditionTimeModifierUi && (
        <div className="mt-2 space-y-1.5">
          {inlineTimeMod ? (
            <div className="flex items-center gap-2">
              {condition.operator === "detected" ? (
                <>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">within</span>
                  <Input
                    type="number"
                    value={condition.timeModifierBars}
                    onChange={(e) => {
                      const raw = e.target.value;
                      const next = raw === "" ? ("" as unknown as number) : Number(raw);
                      update({
                        timeModifierBars: next,
                        hasTimeModifier: true,
                        timeModifierMode: "within_last",
                      });
                    }}
                    onBlur={(e) => {
                      const v = Number(e.target.value);
                      if (!v || isNaN(v)) update({ timeModifierBars: 1 });
                    }}
                    className="h-6 w-12 text-xs px-1.5"
                    min={1}
                    max={200}
                  />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">bars</span>
                </>
              ) : (
                <>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">for</span>
                  <Input
                    type="number"
                    value={condition.timeModifierBars}
                    onChange={(e) => {
                      const raw = e.target.value;
                      update({ timeModifierBars: raw === "" ? ("" as unknown as number) : Number(raw) });
                    }}
                    onBlur={(e) => {
                      const v = Number(e.target.value);
                      if (!v || isNaN(v)) update({ timeModifierBars: 1 });
                    }}
                    className="h-6 w-12 text-xs px-1.5"
                    min={1}
                    max={200}
                  />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">consecutive bars</span>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="checkbox"
                checked={condition.hasTimeModifier}
                onChange={(e) => update({ hasTimeModifier: e.target.checked })}
                className="rounded border-border accent-primary"
              />
              {condition.hasTimeModifier ? (
                <>
                  <select
                    value={condition.timeModifierMode}
                    onChange={(e) =>
                      update({
                        timeModifierMode: e.target.value as ConditionState["timeModifierMode"],
                      })
                    }
                    className="h-6 rounded border border-input bg-transparent px-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="within_last">Within last</option>
                    <option value="exactly_ago">Exactly</option>
                    <option value="all_of_last">All of last</option>
                  </select>
                  <Input
                    type="number"
                    value={condition.timeModifierBars}
                    onChange={(e) => {
                      const raw = e.target.value;
                      update({ timeModifierBars: raw === "" ? ("" as unknown as number) : Number(raw) });
                    }}
                    onBlur={(e) => {
                      const v = Number(e.target.value);
                      if (!v || isNaN(v)) update({ timeModifierBars: 5 });
                    }}
                    className="h-6 w-12 text-xs px-1.5"
                    min={1}
                    max={200}
                  />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {condition.timeModifierMode === "exactly_ago"
                      ? "bars ago"
                      : "bars"}
                  </span>
                </>
              ) : (
                <span className="text-xs text-muted-foreground">
                  Add time constraint
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function GroupCard({
  group,
  onChange,
  onDelete,
  isOnly,
}: {
  group: GroupState;
  onChange: (g: GroupState) => void;
  onDelete: () => void;
  isOnly: boolean;
}) {
  function addCondition() {
    onChange({
      ...group,
      conditions: [...group.conditions, createCondition()],
    });
  }

  function updateCondition(conditionId: string, updated: ConditionState) {
    onChange({
      ...group,
      conditions: group.conditions.map((c) =>
        c.id === conditionId ? updated : c
      ),
    });
  }

  function deleteCondition(conditionId: string) {
    if (group.conditions.length <= 1) return;
    onChange({
      ...group,
      conditions: group.conditions.filter((c) => c.id !== conditionId),
    });
  }

  return (
    <div className="rounded-xl border-2 border-border/60 bg-muted/20 overflow-hidden">
      {/* Group header */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 bg-muted/40 border-b border-border/60">
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={group.timeframe}
            onChange={(e) =>
              onChange({ ...group, timeframe: e.target.value })
            }
            className="h-6 rounded border border-input bg-transparent px-1.5 text-xs font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {SUPPORTED_TIMEFRAMES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <span className="text-[10px] text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">Match</span>
          <select
            value={group.logic}
            onChange={(e) =>
              onChange({ ...group, logic: e.target.value as "AND" | "OR" })
            }
            className="h-6 rounded border border-input bg-transparent px-1.5 text-xs font-semibold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="AND">ALL</option>
            <option value="OR">ANY</option>
          </select>
        </div>
        {!isOnly && (
          <button
            onClick={onDelete}
            className="text-muted-foreground/60 hover:text-destructive transition-colors shrink-0"
            title="Remove group"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Conditions list */}
      <div className="p-3 space-y-2">
        {group.conditions.map((condition, idx) => (
          <div key={condition.id}>
            {idx > 0 && (
              <div className="flex items-center justify-center my-1.5">
                <span className="text-[10px] font-semibold text-primary/60 uppercase tracking-wider">
                  {group.logic}
                </span>
              </div>
            )}
            <ConditionCard
              condition={condition}
              onChange={(c) => updateCondition(condition.id, c)}
              onDelete={() => deleteCondition(condition.id)}
              canDelete={group.conditions.length > 1}
            />
          </div>
        ))}

        <button
          onClick={addCondition}
          className="w-full py-1.5 text-xs text-primary font-medium rounded-lg border border-dashed border-primary/40 hover:bg-primary/5 transition-colors flex items-center justify-center gap-1"
        >
          <Plus size={12} />
          Add condition
        </button>
      </div>
    </div>
  );
}

// ─── Helpers for volume formatting ──────────────────────────────────────────

function formatVolume(vol: number): string {
  if (vol >= 1e7) return (vol / 1e7).toFixed(1) + "Cr";
  if (vol >= 1e5) return (vol / 1e5).toFixed(1) + "L";
  if (vol >= 1e3) return (vol / 1e3).toFixed(1) + "K";
  return String(vol);
}

function formatMarketCap(value?: number): string {
  if (!value || value <= 0) return "—";
  if (value >= 1e12) return "₹" + (value / 1e12).toFixed(2) + "T";
  if (value >= 1e9) return "₹" + (value / 1e9).toFixed(2) + "B";
  if (value >= 1e7) return "₹" + (value / 1e7).toFixed(1) + "Cr";
  return "₹" + value.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

/** Sticky right “Watch” column — shared by default universe table and scan results. */
const WATCH_COL_CLASS =
  "sticky right-0 z-20 w-[208px] min-w-[208px] max-w-[208px] box-border border-l border-border/40 bg-background shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.06)]";

function DesktopWatchColumnHeader() {
  return (
    <th className={cn("py-3 px-2 font-medium text-right text-muted-foreground whitespace-nowrap", WATCH_COL_CLASS)}>
      Watch
    </th>
  );
}

function DesktopWatchColumnCell({ symbol }: { symbol: string }) {
  return (
    <td className={cn("py-2.5 px-2", WATCH_COL_CLASS)}>
      <div className="flex w-full items-center justify-end gap-1.5">
        <div className="flex min-w-0 shrink items-center justify-end gap-1 opacity-0 pointer-events-none transition-opacity group-hover:opacity-100 group-hover:pointer-events-auto">
          <button
            type="button"
            className="h-7 min-w-7 px-1.5 rounded-md border border-[#008858]/30 text-[#008858] text-[11px] font-semibold hover:bg-[#DEF5ED]"
            title="Buy"
          >
            B
          </button>
          <button
            type="button"
            className="h-7 min-w-7 px-1.5 rounded-md border border-[#D53627]/30 text-[#D53627] text-[11px] font-semibold hover:bg-[#FCE7E7]"
            title="Sell"
          >
            S
          </button>
          <button
            type="button"
            className="h-7 w-7 shrink-0 rounded-md border border-border text-muted-foreground inline-flex items-center justify-center hover:text-foreground hover:bg-muted"
            title="Option chain"
            aria-label={`Open option chain for ${symbol}`}
          >
            <Layers className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className="h-7 w-7 shrink-0 rounded-md border border-border text-muted-foreground inline-flex items-center justify-center hover:text-foreground hover:bg-muted"
            title="Open chart"
            aria-label={`Open chart for ${symbol}`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
          </button>
        </div>
        <button
          type="button"
          title="Add to watchlist"
          aria-label={`Add ${symbol} to watchlist`}
          className="h-7 w-7 shrink-0 rounded-full border border-[#542087] text-[#542087] inline-flex items-center justify-center hover:bg-[#F5F2F9]"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </td>
  );
}

function MobileWatchPlusButton({ symbol }: { symbol: string }) {
  return (
    <button
      type="button"
      title="Add to watchlist"
      aria-label={`Add ${symbol} to watchlist`}
      className="h-7 w-7 shrink-0 rounded-full border border-[#542087] text-[#542087] inline-flex items-center justify-center hover:bg-[#F5F2F9]"
    >
      <Plus className="h-3.5 w-3.5" />
    </button>
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Simple UI types & helpers ──────────────────────────────────────────────

interface SimpleConditionRow extends ConditionState {
  timeframe: string;
  connector: "AND" | "OR";
}

function isPersistedDiyV1(x: unknown): x is {
  v: 1;
  query: QueryState;
  simpleConditions: SimpleConditionRow[];
  customFormula: string;
  customNlInput: string;
  customUniverse: string;
  activeTab: "standard" | "custom";
  savedScreenerId?: string;
} {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  if (o.v !== 1) return false;
  const q = o.query;
  if (!q || typeof q !== "object") return false;
  const qs = q as QueryState;
  if (typeof qs.name !== "string" || typeof qs.universe !== "string" || !Array.isArray(qs.groups)) return false;
  if (!Array.isArray(o.simpleConditions)) return false;
  if (typeof o.customFormula !== "string" || typeof o.customNlInput !== "string" || typeof o.customUniverse !== "string") return false;
  if (o.activeTab !== "standard" && o.activeTab !== "custom") return false;
  return true;
}

function createSimpleCondition(connector: "AND" | "OR" = "AND"): SimpleConditionRow {
  return { ...createCondition(), rightType: "indicator", timeframe: "1d", connector };
}

/** Convert flat simple conditions → QueryState (each condition = 1 group) */
function simpleToQuery(
  name: string,
  conditions: SimpleConditionRow[],
  universe: string = "nifty50",
  description: string = "",
  preferences?: QueryState["preferences"]
): QueryState {
  return {
    name,
    universe,
    description,
    preferences,
    groups: conditions.map((c) => ({
      id: c.id + "_g",
      logic: "AND" as const,
      timeframe: c.timeframe,
      connector: c.connector,
      conditions: [{
        id: c.id,
        leftIndicatorId: c.leftIndicatorId,
        leftParams: c.leftParams,
        operator: c.operator,
        rightType: c.rightType,
        rightValue: c.rightValue,
        rightIndicatorId: c.rightIndicatorId,
        rightParams: c.rightParams,
        rightMultiplier: c.rightMultiplier,
        comparisonMarginPercent: c.comparisonMarginPercent,
        rightValue2: c.rightValue2,
        hasTimeModifier: c.hasTimeModifier,
        timeModifierMode: c.timeModifierMode,
        timeModifierBars: c.timeModifierBars,
      }],
    })),
  };
}

/** Convert QueryState → flat simple conditions (for switching from classic) */
function queryToSimple(query: QueryState): SimpleConditionRow[] {
  const rows: SimpleConditionRow[] = [];
  for (const group of query.groups) {
    for (let i = 0; i < group.conditions.length; i++) {
      const c = group.conditions[i];
      rows.push({
        ...c,
        timeframe: group.timeframe,
        connector: i === 0 ? group.connector : group.logic,
      });
    }
  }
  return rows;
}

if (import.meta.env.DEV) {
  void queryToSimple;
}

// ─── Indicator Sidebar ──────────────────────────────────────────────────────

function ConditionGroupSidebar({
  selectedGroup,
  onSelectGroup,
}: {
  selectedGroup: string | null;
  onSelectGroup: (group: string) => void;
}) {
  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex-1 overflow-y-auto">
        {CONDITION_GROUPS.map((group) => (
          <button
            key={group}
            type="button"
            onClick={() => onSelectGroup(group)}
            className={cn(
              "flex h-10 w-full items-center justify-between border-b border-[#F5F5F5] px-4 text-left text-[14px]",
              selectedGroup === group
                ? "bg-[#F5F2F9] font-medium text-[#542087]"
                : "bg-white font-normal text-[#262626] hover:bg-primary/5"
            )}
          >
            <span>{group}</span>
            <ChevronRight size={12} className="text-[#777777]" />
          </button>
        ))}
      </div>
    </div>
  );
}

function IndicatorSidebar({
  open,
  search,
  onSelect,
  excludePatterns,
  activeCategories,
  customItems,
  disableSelection,
}: {
  open: boolean;
  search: string;
  onSelect: (id: string) => void;
  excludePatterns?: boolean;
  activeCategories?: IndicatorCategory[] | null;
  customItems?: { id: string; label: string; locked?: boolean }[];
  disableSelection?: boolean;
}) {
  const q = search.trim().toLowerCase();

  if (!open) return null;

  // Custom static items (e.g. Futures & Options)
  if (customItems && customItems.length > 0) {
    const filtered = q
      ? customItems.filter((item) =>
          item.label.toLowerCase().includes(q)
        )
      : customItems;

    return (
      <div className="flex flex-col bg-background h-full">
        <div className="flex-1 overflow-y-auto px-1 py-2">
          {filtered.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (disableSelection) return;
                onSelect(item.id);
              }}
              aria-disabled={disableSelection}
              className={cn(
                "mb-0.5 flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm text-[#262626]",
                "hover:bg-primary/5",
                disableSelection && "cursor-default text-muted-foreground"
              )}
            >
              <span className="flex items-center gap-2">
                {item.locked && (
                  <Lock size={14} className="text-muted-foreground" />
                )}
                <span className="text-sm">{item.label}</span>
              </span>
              <span className="shrink-0 text-sm leading-none text-muted-foreground">›</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Default indicator list backed by INDICATORS
  return (
    <div className="flex flex-col bg-background h-full">
      <div className="flex-1 overflow-y-auto px-1 py-2">
        {CATEGORIES.filter((cat) => {
          if (
            excludePatterns &&
            (cat.key === "candlestick" || cat.key === "divergence")
          ) {
            return false;
          }
          if (activeCategories && !activeCategories.includes(cat.key)) {
            return false;
          }
          return true;
        }).map((cat) => {
          const items = INDICATORS.filter(
            (i) =>
              i.category === cat.key &&
              (!q || i.name.toLowerCase().includes(q) || i.id.includes(q))
          );
          if (items.length === 0) return null;
          return (
            <div key={cat.key} className="mb-1">
              <div className="px-3 py-2 text-[16px] font-bold leading-5 text-[#262626]">
                {cat.label}
              </div>
              {items.map((ind) => (
                <button
                  key={ind.id}
                  onClick={() => onSelect(ind.id)}
                  className="mb-0.5 flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm text-[#262626] transition-colors hover:bg-primary/5"
                >
                  <span className="flex items-center gap-1.5">
                    <span className="text-sm">{ind.name}</span>
                    {ind.isNew && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary font-semibold">
                        New
                      </Badge>
                    )}
                  </span>
                  <span className="shrink-0 text-sm leading-none text-muted-foreground">›</span>
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Param Customize Modal ──────────────────────────────────────────────────

function ParamModal({
  open,
  indicator,
  params,
  onApply,
  onClose,
}: {
  open: boolean;
  indicator: IndicatorDef;
  params: Record<string, number | string>;
  onApply: (p: Record<string, number | string>) => void;
  onClose: () => void;
}) {
  const [local, setLocal] = useState(params);

  useEffect(() => {
    if (open) setLocal(params);
  }, [open, params]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-background rounded-xl border border-border shadow-2xl w-[320px] p-5">
        <h3 className="font-semibold text-sm mb-4">
          Customize {indicator.name}
        </h3>
        <div className="space-y-3">
          {indicator.params.map((p) => (
            <div key={p.key}>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                {p.label}
              </label>
              {p.type === "select" ? (
                <select
                  value={String(local[p.key] ?? p.defaultValue)}
                  onChange={(e) => setLocal({ ...local, [p.key]: e.target.value })}
                  className="h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {p.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : (
                <Input
                  type="number"
                  value={local[p.key] ?? p.defaultValue}
                  onChange={(e) => {
                    const raw = e.target.value;
                    setLocal({ ...local, [p.key]: raw === "" ? "" : Number(raw) });
                  }}
                  className="h-9 text-sm"
                  min={p.min}
                  max={p.max}
                  step={p.step ?? 1}
                />
              )}
            </div>
          ))}
        </div>
        <Button
          className="w-full mt-5"
          onClick={() => { onApply(local); onClose(); }}
        >
          Apply
        </Button>
      </div>
    </div>
  );
}

/** Down chevron for native `<select>` fields (Length, Timeframe, Condition, etc.). */
function SelectFieldChevron() {
  return (
    <svg
      className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 6l4 4 4-4" />
    </svg>
  );
}

/** Right chevron only for Indicator 2 (opens compare side panel, not a native dropdown). */
function Indicator2FieldChevron() {
  return (
    <ChevronRight
      className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground shrink-0"
      aria-hidden
    />
  );
}

function parseMockNamespace(id: string): string | null {
  if (!id.startsWith("mock:")) return null;
  const parts = id.split(":");
  return parts.length >= 3 ? parts[1] : null;
}

function getMockNamespaceItems(namespace: string): string[] {
  if (namespace === "valuation") return VALUATION_ITEMS;
  if (namespace === "financial") return FINANCIAL_RATIOS_ITEMS;
  if (namespace === "profitability") return PROFITABILITY_ITEMS;
  if (namespace === "cashflow") return CASH_FLOW_ITEMS;
  if (namespace === "incomegrowth") return INCOME_GROWTH_ITEMS;
  if (namespace === "balancesheet") return BALANCE_SHEET_ITEMS;
  if (namespace === "shareholding") return SHAREHOLDING_ITEMS;
  if (namespace === "fno") return FUTURES_OPTIONS_ITEMS;
  return [];
}

function baseMockLabel(label: string): string {
  return label
    .replace(/\s*\([^)]*\)\s*/g, " ")
    .replace(/\b(ttm|latest quarter|last fy|prev fy)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

// ─── Simple Condition Form (vertical labeled layout) ────────────────────────

function SimpleConditionForm({
  condition,
  index,
  onChange,
  onDelete,
  canDelete,
  onIndicatorClick,
  onRequestCompareWith,
  variant = "card",
}: {
  condition: SimpleConditionRow;
  index: number;
  onChange: (patch: Partial<SimpleConditionRow>) => void;
  onDelete: () => void;
  canDelete: boolean;
  onIndicatorClick: (side: "left" | "right") => void;
  /** Opens the page-level “Compare with” side panel (value / limited indicators). */
  onRequestCompareWith: () => void;
  variant?: "card" | "accordion";
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [paramModal, setParamModal] = useState<"left" | "right" | null>(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [marginDraft, setMarginDraft] = useState("");

  useEffect(() => {
    if (
      condition.rightType !== "indicator" ||
      !condition.rightIndicatorId ||
      !condition.leftIndicatorId
    ) {
      return;
    }
    if (!isPairComparable(condition.leftIndicatorId, condition.rightIndicatorId)) {
      onChange({
        rightType: "value",
        rightIndicatorId: "",
        rightParams: {},
        rightValue: "",
      });
    }
  }, [
    condition.leftIndicatorId,
    condition.rightIndicatorId,
    condition.rightType,
    onChange,
  ]);

  const leftInd = condition.leftIndicatorId ? getIndicator(condition.leftIndicatorId) : null;
  const rightInd = condition.rightIndicatorId ? getIndicator(condition.rightIndicatorId) : null;
  const leftUsesChartTf = indicatorUsesChartTimeframe(condition.leftIndicatorId);
  const rightUsesChartTf =
    condition.rightType === "indicator" &&
    !!condition.rightIndicatorId &&
    indicatorUsesChartTimeframe(condition.rightIndicatorId);
  const opDef = condition.operator ? OPERATORS.find((o) => o.id === condition.operator) : undefined;
  const validOps = leftInd ? getOperatorsForType(leftInd.outputType) : [];
  const needsRight = opDef?.needsRight ?? false;
  const isRange = opDef?.rightType === "range";
  const showTimeMod = opDef?.timeModifier === "optional_within" || opDef?.timeModifier === "required_for";
  const forceTimeMod = opDef?.timeModifier === "required_for";
  const isCrossOperator =
    condition.operator === "crossed_above" || condition.operator === "crossed_below";
  const showConditionTimeModifierUi = showTimeMod && !isCrossOperator;
  const inlineTimeMod = forceTimeMod || condition.operator === "detected";

  function presetOptionsFor(indicatorId: string | null, params: Record<string, unknown>) {
    if (!indicatorId) return null;
    const MA_IDS = new Set(["sma", "ema", "wma", "hull_ma", "vwma", "dema", "tema"]);
    const VOL_MA_IDS = new Set(["volume_sma", "volume_ema"]);
    const SUPER_IDS = new Set(["supertrend", "supertrend_flip_bullish", "supertrend_flip_bearish"]);

    if (MA_IDS.has(indicatorId)) {
      const periods = [9, 20, 21, 50, 100, 200];
      return {
        label: "Length",
        value: String((params as Record<string, unknown>)?.period ?? 20),
        options: periods.map((p) => ({ value: String(p), label: String(p), params: { period: p } })),
        kind: "period" as const,
      };
    }
    if (VOL_MA_IDS.has(indicatorId)) {
      const periods = [10, 20, 50];
      return {
        label: "Length",
        value: String((params as Record<string, unknown>)?.period ?? 20),
        options: periods.map((p) => ({ value: String(p), label: String(p), params: { period: p } })),
        kind: "period" as const,
      };
    }
    if (SUPER_IDS.has(indicatorId)) {
      const combos: Array<{ period: number; multiplier: number }> = [
        { period: 10, multiplier: 3 },
        { period: 7, multiplier: 2 },
        { period: 10, multiplier: 2 },
        { period: 14, multiplier: 3 },
      ];
      const currentPeriod = Number((params as Record<string, unknown>)?.period ?? 10);
      const currentMult = Number((params as Record<string, unknown>)?.multiplier ?? 3);
      const current = `${currentPeriod},${currentMult}`;
      return {
        label: "Preset",
        value: current,
        options: combos.map((c) => ({
          value: `${c.period},${c.multiplier}`,
          label: `(${c.period}, ${c.multiplier})`,
          params: { period: c.period, multiplier: c.multiplier },
        })),
        kind: "combo" as const,
      };
    }
    return null;
  }

  const leftPreset = presetOptionsFor(condition.leftIndicatorId || null, condition.leftParams as Record<string, unknown>);
  const rightPreset = presetOptionsFor(condition.rightIndicatorId || null, condition.rightParams as Record<string, unknown>);

  function leftLabel() {
    if (!leftInd) return "";
    const parts: string[] = [];
    for (const p of leftInd.params) {
      if (p.type === "number") {
        parts.push(String(condition.leftParams[p.key] ?? p.defaultValue));
      } else if (p.type === "select") {
        const val = String(condition.leftParams[p.key] ?? p.defaultValue);
        const opt = p.options.find((o) => o.value === val);
        parts.push(opt ? opt.label : val);
      }
    }
    if (parts.length === 0) return leftInd.name;
    return `${leftInd.name} (${parts.join(", ")})`;
  }

  function rightLabel() {
    if (!rightInd) return "";
    const numP = rightInd.params.filter((p) => p.type === "number");
    if (numP.length === 0) return rightInd.name;
    const vals = numP.map((p) => condition.rightParams[p.key] ?? p.defaultValue).join(",");
    return `${rightInd.name} (${vals})`;
  }

  const showAdvancedMarginUi =
    leftInd &&
    (condition.operator === "greater_than" || condition.operator === "less_than");
  const isMockIndicator = condition.leftIndicatorId.startsWith("mock:");
  const usesRuleBenchmarkUi = !!leftInd && leftInd.outputType === "numeric";
  const mockNamespace = parseMockNamespace(condition.leftIndicatorId);
  const mockCandidateBenchmarks = useMemo(() => {
    if (!isMockIndicator || !mockNamespace || !leftInd) return [];
    const items = getMockNamespaceItems(mockNamespace);
    const base = baseMockLabel(leftInd.name);
    if (!base) return [];
    const preferred = items.filter((label) => {
      const lower = label.toLowerCase();
      const sameBase = baseMockLabel(label).includes(base) || base.includes(baseMockLabel(label));
      const looksLikePeriodBenchmark =
        /\b(last year|preceding year|prev year|last fy|prev fy|preceding quarter|year-ago|last quarter)\b/i.test(lower);
      return sameBase && looksLikePeriodBenchmark;
    });
    return preferred.slice(0, 2).map((label) => ({
      id: mockIndicatorId(mockNamespace, label),
      label,
    }));
  }, [isMockIndicator, mockNamespace, leftInd]);
  const technicalCandidateBenchmarks = useMemo(() => {
    if (!leftInd || isMockIndicator) return [];
    return getRelevantRightIndicators(condition.leftIndicatorId)
      .slice(0, 3)
      .map((ind) => ({ id: ind.id, label: ind.name }))
      .filter((item): item is { id: string; label: string } => Boolean(item));
  }, [condition.leftIndicatorId, isMockIndicator, leftInd]);
  const benchmarkOptions = isMockIndicator ? mockCandidateBenchmarks : technicalCandidateBenchmarks;
  const selectedRule =
    condition.operator === "less_than"
      ? "lower"
      : condition.operator === "is_between"
        ? "custom"
        : "higher";

  function openAdvancedDialog() {
    setMarginDraft(
      condition.comparisonMarginPercent > 0
        ? String(condition.comparisonMarginPercent)
        : ""
    );
    setAdvancedOpen(true);
  }

  /**
   * Fields use flex-1; clear (X) lines up with header collapse control.
   * Card: collapse is `w-7` — center X in `w-7`.
   * Accordion: chevron is `w-4` at the row’s right edge — right-align in `w-4` + nudge so X centers on the chevron; slight `translate-y` to match Field input vs `py-3` header.
   */
  function FormRowWithHeaderGutter({
    children,
    trailingAction,
  }: {
    children: ReactNode;
    trailingAction?: ReactNode;
  }) {
    const collapseColumnCard = (
      <div className="flex h-7 w-7 shrink-0 items-center justify-center self-center">
        {trailingAction}
      </div>
    );

    const collapseColumnAccordion = (
      <div className="flex min-w-4 w-4 shrink-0 items-center justify-end overflow-visible self-center">
        {trailingAction ? (
          <div className="translate-x-1.5 translate-y-px">{trailingAction}</div>
        ) : null}
      </div>
    );

    if (variant === "card") {
      return (
        <div className="flex w-full min-w-0 items-center gap-1.5">
          <div className="min-w-0 flex-1">{children}</div>
          {collapseColumnCard}
        </div>
      );
    }

    return (
      <div className="flex w-full min-w-0 items-center gap-2">
        <div className="min-w-0 flex-1">{children}</div>
        {collapseColumnAccordion}
      </div>
    );
  }

  function clearLeftIndicator() {
    onChange({
      leftIndicatorId: "",
      leftParams: {},
      operator: "" as OperatorId,
      rightType: "indicator",
      rightIndicatorId: "",
      rightParams: {},
      rightValue: "",
      rightValue2: "",
      comparisonMarginPercent: 0,
      hasTimeModifier: false,
      timeModifierMode: "within_last",
      timeModifierBars: 5,
    });
  }

  function clearRightIndicatorOperand() {
    onChange({
      rightType: "indicator",
      rightIndicatorId: "",
      rightParams: {},
      rightValue: "",
    });
  }

  const clearIconButtonClass =
    "flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-500";

  return (
    <>
    <div className={cn(
      variant === "card" ? "rounded-xl border border-border bg-white overflow-hidden relative" : "bg-transparent"
    )}>
      {variant === "card" && (
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/40">
          <span className="text-sm font-semibold text-foreground">
            Condition {index + 1}
          </span>
          <div className="flex items-center gap-1.5">
            {canDelete && (
              <button
                onClick={onDelete}
                className="w-7 h-7 flex items-center justify-center rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Delete condition"
              >
                <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M2 4h12M5.33 4V2.67a1.33 1.33 0 011.34-1.34h2.66a1.33 1.33 0 011.34 1.34V4m2 0v9.33a1.33 1.33 0 01-1.34 1.34H4.67a1.33 1.33 0 01-1.34-1.34V4h9.34z" />
                </svg>
              </button>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              title={collapsed ? "Expand" : "Collapse"}
            >
              <svg
                className={cn("w-4 h-4 transition-transform", collapsed && "rotate-180")}
                viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
              >
                <path d="M4 6l4 4 4-4" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {(variant !== "card" || !collapsed) && (
        <div className={cn(variant === "card" ? "p-4 space-y-4" : "space-y-4")}>
          <FormRowWithHeaderGutter
            trailingAction={
              condition.leftIndicatorId ? (
                <button
                  type="button"
                  onClick={clearLeftIndicator}
                  className={clearIconButtonClass}
                  title="Clear indicator"
                  aria-label="Clear indicator"
                >
                  <X className="h-4 w-4 shrink-0" strokeWidth={2} />
                </button>
              ) : undefined
            }
          >
            <div className="grid grid-cols-12 gap-2 items-start w-full min-w-0">
              {/* Indicator 1 + Length | Timeframe (9/3); Length w-24; Indicator min-w floor */}
              <div className={cn("min-w-0", leftUsesChartTf ? "col-span-9" : "col-span-12")}>
                <div className="flex items-stretch gap-2 min-w-0 flex-nowrap">
                  <Field
                    label="Indicator"
                    className={cn(
                      "max-w-full flex-1 min-w-[7.25rem]",
                      condition.leftIndicatorId &&
                        "border-muted bg-muted/40 [&:focus-within]:border-muted [&:focus-within]:ring-0"
                    )}
                    contentClassName="px-2 py-1"
                  >
                    {condition.leftIndicatorId ? (
                      <div
                        className="h-8 w-full flex items-center px-1 text-sm text-muted-foreground truncate cursor-not-allowed select-none"
                        title={leftLabel()}
                        aria-disabled="true"
                      >
                        {leftLabel()}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onIndicatorClick("left")}
                        className="h-8 w-full flex items-center justify-between rounded-md bg-transparent px-1 text-sm text-left text-muted-foreground hover:bg-accent/50 transition-colors"
                      >
                        <span className="truncate">Select indicator...</span>
                        <span className="text-muted-foreground ml-1">›</span>
                      </button>
                    )}
                  </Field>
                  {leftInd && leftInd.params.length > 0 && (
                    leftPreset ? (
                      <Field label={leftPreset.label} className="w-24 shrink-0" contentClassName="px-2 py-1">
                        <div className="relative">
                          <select
                            value={leftPreset.value}
                            onChange={(e) => {
                              const opt = leftPreset.options.find((o) => o.value === e.target.value);
                              if (opt) onChange({ leftParams: opt.params });
                            }}
                            className="h-8 w-full rounded-md bg-transparent pl-1 pr-8 text-sm appearance-none focus-visible:outline-none focus-visible:ring-0"
                          >
                            {leftPreset.options.map((o) => (
                              <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                          </select>
                          <SelectFieldChevron />
                        </div>
                      </Field>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setParamModal("left")}
                        className="w-12 rounded-md border border-input bg-background flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                        title="Customize parameters"
                      >
                        <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <circle cx="3" cy="4" r="1.5" /><line x1="5" y1="4" x2="15" y2="4" />
                          <circle cx="10" cy="8" r="1.5" /><line x1="1" y1="8" x2="8" y2="8" /><line x1="12" y1="8" x2="15" y2="8" />
                          <circle cx="6" cy="12" r="1.5" /><line x1="1" y1="12" x2="4" y2="12" /><line x1="8" y1="12" x2="15" y2="12" />
                        </svg>
                      </button>
                    )
                  )}
                </div>
              </div>

              {leftUsesChartTf && (
                <div className="col-span-3 min-w-0">
                  <Field label="Timeframe" contentClassName="px-2 py-1">
                    <div className="relative">
                      <select
                        value={condition.timeframe}
                        onChange={(e) => onChange({ timeframe: e.target.value })}
                        className="h-8 w-full rounded-md bg-transparent pl-1 pr-8 text-sm appearance-none focus-visible:outline-none focus-visible:ring-0"
                      >
                        {SUPPORTED_TIMEFRAMES.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                      <SelectFieldChevron />
                    </div>
                  </Field>
                </div>
              )}
            </div>
          </FormRowWithHeaderGutter>

          {/* Condition (operator) */}
          {leftInd && !usesRuleBenchmarkUi && (
            <div className="space-y-2">
              <FormRowWithHeaderGutter>
                <Field label="Condition" contentClassName="px-2 py-1">
                  <div className="relative">
                    <select
                      value={condition.operator}
                      onChange={(e) => {
                        const opId = e.target.value as OperatorId;
                        const incDec =
                          opId === "is_increasing" ||
                          opId === "is_decreasing";
                        const isDetected = opId === "detected";
                        const keepMargin =
                          opId === "greater_than" || opId === "less_than";
                        onChange({
                          operator: opId || ("" as OperatorId),
                          hasTimeModifier: incDec || isDetected,
                          timeModifierBars: incDec || isDetected ? 1 : 5,
                          ...(isDetected ? { timeModifierMode: "within_last" as const } : {}),
                          ...(!keepMargin ? { comparisonMarginPercent: 0 } : {}),
                        });
                      }}
                      className={cn(
                        "h-8 w-full rounded-md bg-transparent pl-1 pr-8 text-sm appearance-none focus-visible:outline-none focus-visible:ring-0",
                        !condition.operator && "text-muted-foreground"
                      )}
                    >
                      <option value="">Select condition...</option>
                      {validOps.map((op) => (
                        <option key={op.id} value={op.id}>{op.label}</option>
                      ))}
                    </select>
                    <SelectFieldChevron />
                  </div>
                </Field>
              </FormRowWithHeaderGutter>
              {showAdvancedMarginUi && (
                <button
                  type="button"
                  className="text-xs font-medium text-primary hover:text-primary/90 w-fit"
                  onClick={openAdvancedDialog}
                >
                  Advanced
                  {condition.comparisonMarginPercent > 0
                    ? ` (${condition.comparisonMarginPercent}%)`
                    : ""}
                </button>
              )}
            </div>
          )}

          {/* Numeric indicators: mobile-consistent Rule + Benchmark parameter UX */}
          {leftInd && usesRuleBenchmarkUi && (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-[14px] font-medium leading-5 text-[#262626]">Rule</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onChange({ operator: "greater_than", rightType: "indicator" })}
                    className={cn(
                      "h-9 rounded-md border px-4 text-sm",
                      selectedRule === "higher"
                        ? "border-[#37135B] bg-[#FBF8FD] text-[#37135B]"
                        : "border-[#E1E1E1] text-[#262626]"
                    )}
                  >
                    Higher than
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange({ operator: "less_than", rightType: "indicator" })}
                    className={cn(
                      "h-9 rounded-md border px-4 text-sm",
                      selectedRule === "lower"
                        ? "border-[#37135B] bg-[#FBF8FD] text-[#37135B]"
                        : "border-[#E1E1E1] text-[#262626]"
                    )}
                  >
                    Lower than
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange({ operator: "is_between", rightType: "value" })}
                    className={cn(
                      "h-9 rounded-md border px-4 text-sm",
                      selectedRule === "custom"
                        ? "border-[#37135B] bg-[#FBF8FD] text-[#37135B]"
                        : "border-[#E1E1E1] text-[#262626]"
                    )}
                  >
                    Custom range
                  </button>
                </div>
              </div>

              {selectedRule !== "custom" && (
                <div className="space-y-2">
                  <p className="text-[14px] font-medium leading-5 text-[#262626]">Benchmark parameter</p>
                  <div className="space-y-2">
                    {benchmarkOptions.map((b) => (
                      <label key={b.id} className="flex cursor-pointer items-center gap-2 text-sm text-[#262626]">
                        <input
                          type="radio"
                          name={`benchmark-${condition.id}`}
                          checked={condition.rightType === "indicator" && condition.rightIndicatorId === b.id}
                          onChange={() =>
                            onChange({
                              rightType: "indicator",
                              rightIndicatorId: b.id,
                              rightParams: (() => {
                                const ind = getIndicator(b.id);
                                return ind ? defaultParams(ind) : {};
                              })(),
                              rightValue: "",
                            })
                          }
                          className="h-4 w-4 accent-primary"
                        />
                        <span>{b.label}</span>
                      </label>
                    ))}
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-[#262626]">
                      <input
                        type="radio"
                        name={`benchmark-${condition.id}`}
                        checked={condition.rightType === "value"}
                        onChange={() =>
                          onChange({
                            rightType: "value",
                            rightIndicatorId: "",
                            rightParams: {},
                          })
                        }
                        className="h-4 w-4 accent-primary"
                      />
                      <span>Value</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Right operand — searchable picker + row mirroring Indicator 1 when an indicator is chosen */}
          {opDef && needsRight && !isRange && !usesRuleBenchmarkUi && (
            <div className="space-y-3">
              {condition.rightType === "value" ? (
                <FormRowWithHeaderGutter>
                  <Field label="Value" contentClassName="px-2 py-1">
                    <div className="relative flex items-center">
                      <Input
                        type="number"
                        value={condition.rightValue}
                        onChange={(e) => onChange({ rightValue: e.target.value })}
                        placeholder="Enter value"
                        className="h-8 w-full border-0 bg-transparent pl-1 pr-9 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                      {condition.rightValue.trim() !== "" ? (
                        <button
                          type="button"
                          onClick={() =>
                            onChange({
                              rightType: "indicator",
                              rightIndicatorId: "",
                              rightParams: {},
                              rightValue: "",
                            })
                          }
                          className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-9 flex items-center justify-center rounded-md text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                          aria-label="Clear value"
                        >
                          <X className="h-4 w-4 shrink-0" strokeWidth={2} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onRequestCompareWith()}
                          className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-primary hover:bg-accent/50 transition-colors"
                          aria-label="Choose value or indicator"
                        >
                          <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
                        </button>
                      )}
                    </div>
                  </Field>
                </FormRowWithHeaderGutter>
              ) : !condition.rightIndicatorId ? (
                <FormRowWithHeaderGutter>
                  <Field label="Indicator 2" contentClassName="px-2 py-1">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => onRequestCompareWith()}
                        className="h-8 w-full flex items-center rounded-md bg-transparent pl-1 pr-8 text-sm text-left text-muted-foreground hover:bg-accent/50 transition-colors"
                      >
                        <span className="truncate min-w-0">Select indicator or value…</span>
                      </button>
                      <Indicator2FieldChevron />
                    </div>
                  </Field>
                </FormRowWithHeaderGutter>
              ) : (
                <FormRowWithHeaderGutter
                  trailingAction={
                    <button
                      type="button"
                      onClick={clearRightIndicatorOperand}
                      className={clearIconButtonClass}
                      title="Clear indicator"
                      aria-label="Clear indicator"
                    >
                      <X className="h-4 w-4 shrink-0" strokeWidth={2} />
                    </button>
                  }
                >
                  <div className="grid grid-cols-12 gap-2 items-start w-full min-w-0">
                    <div className={cn("min-w-0", rightUsesChartTf ? "col-span-9" : "col-span-12")}>
                      <div className="flex items-start gap-2 min-w-0 flex-nowrap">
                        <div className="max-w-full flex-1 min-w-[7.25rem]">
                          <Field label="Indicator 2" className="min-w-0" contentClassName="px-2 py-1">
                            <button
                              type="button"
                              onClick={() => onRequestCompareWith()}
                              className="h-8 w-full flex items-center rounded-md bg-transparent px-1 text-sm text-left text-foreground hover:bg-accent/50 transition-colors"
                              title={rightLabel()}
                            >
                              <span className="truncate min-w-0">{rightLabel()}</span>
                            </button>
                          </Field>
                        </div>
                        {rightInd && rightInd.params.length > 0 &&
                          (rightPreset ? (
                            <Field label={rightPreset.label} className="w-24 shrink-0" contentClassName="px-2 py-1">
                              <div className="relative">
                                <select
                                  value={rightPreset.value}
                                  onChange={(e) => {
                                    const opt = rightPreset.options.find((o) => o.value === e.target.value);
                                    if (opt) onChange({ rightParams: opt.params });
                                  }}
                                  className="h-8 w-full rounded-md bg-transparent pl-1 pr-8 text-sm appearance-none focus-visible:outline-none focus-visible:ring-0"
                                >
                                  {rightPreset.options.map((o) => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                  ))}
                                </select>
                                <SelectFieldChevron />
                              </div>
                            </Field>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setParamModal("right")}
                              className="w-12 h-8 shrink-0 rounded-md border border-input bg-background flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                              title="Customize parameters"
                            >
                              <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <circle cx="3" cy="4" r="1.5" /><line x1="5" y1="4" x2="15" y2="4" />
                                <circle cx="10" cy="8" r="1.5" /><line x1="1" y1="8" x2="8" y2="8" /><line x1="12" y1="8" x2="15" y2="8" />
                                <circle cx="6" cy="12" r="1.5" /><line x1="1" y1="12" x2="4" y2="12" /><line x1="8" y1="12" x2="15" y2="12" />
                              </svg>
                            </button>
                          ))}
                      </div>
                    </div>
                    {rightUsesChartTf && (
                      <div className="col-span-3 min-w-0">
                        <Field label="Timeframe" contentClassName="px-2 py-1">
                          <div className="relative">
                            <select
                              value={condition.timeframe}
                              onChange={(e) => onChange({ timeframe: e.target.value })}
                              className="h-8 w-full rounded-md bg-transparent pl-1 pr-8 text-sm appearance-none focus-visible:outline-none focus-visible:ring-0"
                            >
                              {SUPPORTED_TIMEFRAMES.map((t) => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                              ))}
                            </select>
                            <SelectFieldChevron />
                          </div>
                        </Field>
                      </div>
                    )}
                  </div>
                </FormRowWithHeaderGutter>
              )}
            </div>
          )}

          {/* Range (is_between) */}
          {opDef && isRange && (
            <div>
              <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
                <Field label="Min" contentClassName="px-2 py-1" className="w-full">
                  <Input
                    type="number"
                    value={condition.rightValue}
                    onChange={(e) => onChange({ rightValue: e.target.value })}
                    className="h-8 w-full border-0 bg-transparent px-1 text-sm focus-visible:ring-0"
                  />
                </Field>
                <span className="text-sm text-muted-foreground text-center">to</span>
                <Field label="Max" contentClassName="px-2 py-1" className="w-full">
                  <Input
                    type="number"
                    value={condition.rightValue2}
                    onChange={(e) => onChange({ rightValue2: e.target.value })}
                    className="h-8 w-full border-0 bg-transparent px-1 text-sm focus-visible:ring-0"
                  />
                </Field>
              </div>
            </div>
          )}

          {/* Time modifiers — inline for inc/dec/detected (cross ops excluded above) */}
          {showConditionTimeModifierUi && inlineTimeMod && (
            <div className="flex items-center gap-2">
              {condition.operator === "detected" ? (
                <>
                  <span className="text-sm text-muted-foreground">within</span>
                  <Input
                    type="number"
                    value={condition.timeModifierBars}
                    onChange={(e) => {
                      const raw = e.target.value;
                      const next = raw === "" ? ("" as unknown as number) : Number(raw);
                      onChange({
                        timeModifierBars: next,
                        hasTimeModifier: true,
                        timeModifierMode: "within_last",
                      });
                    }}
                    onBlur={(e) => { if (!Number(e.target.value)) onChange({ timeModifierBars: 1 }); }}
                    className="h-9 w-24 text-sm"
                    min={1}
                    max={200}
                  />
                  <span className="text-sm text-muted-foreground">bars</span>
                </>
              ) : (
                <>
                  <span className="text-sm text-muted-foreground">for</span>
                  <Input
                    type="number"
                    value={condition.timeModifierBars}
                    onChange={(e) => {
                      const raw = e.target.value;
                      onChange({ timeModifierBars: raw === "" ? ("" as unknown as number) : Number(raw) });
                    }}
                    onBlur={(e) => { if (!Number(e.target.value)) onChange({ timeModifierBars: 1 }); }}
                    className="h-9 w-24 text-sm"
                    min={1}
                    max={200}
                  />
                  <span className="text-sm text-muted-foreground">consecutive bars</span>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Param modals */}
      {leftInd && (
        <ParamModal
          open={paramModal === "left"}
          indicator={leftInd}
          params={condition.leftParams}
          onApply={(p) => onChange({ leftParams: p })}
          onClose={() => setParamModal(null)}
        />
      )}
      {rightInd && (
        <ParamModal
          open={paramModal === "right"}
          indicator={rightInd}
          params={condition.rightParams}
          onApply={(p) => onChange({ rightParams: p })}
          onClose={() => setParamModal(null)}
        />
      )}

    </div>

    <Dialog open={advancedOpen} onOpenChange={setAdvancedOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Advanced comparison</DialogTitle>
          <DialogDescription>
            {condition.operator === "greater_than"
              ? "Require the left side to be greater than the right by at least this percentage of the right value. Example: 5% means left > right × 1.05."
              : "Require the left side to be less than the right by at least this percentage of the right value. Example: 5% means left < right × 0.95."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-1">
          <span className="text-xs font-medium text-muted-foreground">Margin (%)</span>
          <Input
            type="number"
            inputMode="decimal"
            placeholder="0"
            min={0}
            step={0.1}
            value={marginDraft}
            onChange={(e) => setMarginDraft(e.target.value)}
            className="h-9 text-sm"
          />
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onChange({ comparisonMarginPercent: 0 });
              setAdvancedOpen(false);
            }}
          >
            Clear
          </Button>
          <Button
            type="button"
            onClick={() => {
              const raw = marginDraft.trim();
              const n = raw === "" ? 0 : Number(raw);
              if (raw !== "" && (Number.isNaN(n) || n < 0)) return;
              onChange({ comparisonMarginPercent: n });
              setAdvancedOpen(false);
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}

// ─── Simple Builder View ────────────────────────────────────────────────────

function SimpleBuilderView({
  conditions,
  onChange,
  onOpenSidebar,
  onOpenCompareWith,
  universe,
  onUniverseChange,
  accordionOpen,
  onAccordionOpenChange,
}: {
  conditions: SimpleConditionRow[];
  onChange: (c: SimpleConditionRow[]) => void;
  onOpenSidebar: (target: "new" | { id: string; side: "left" | "right" }) => void;
  onOpenCompareWith: (rowId: string) => void;
  universe: string;
  onUniverseChange: (value: string) => void;
  accordionOpen: string[];
  onAccordionOpenChange: (value: string[]) => void;
}) {
  function updateRow(id: string, patch: Partial<SimpleConditionRow>) {
    onChange(conditions.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  function deleteRow(id: string) {
    onChange(conditions.filter((c) => c.id !== id));
  }

  const SECTORS = [
    { name: "Aerospace & Defence", count: 31 },
    { name: "Agro Chemicals", count: 24 },
    { name: "Air Transport Service", count: 5 },
    { name: "Alcoholic Beverages", count: 16 },
    { name: "Auto Ancillaries", count: 81 },
    { name: "Automobile", count: 23 },
    { name: "Banks", count: 41 },
    { name: "Bearings", count: 7 },
    { name: "Cables", count: 22 },
    { name: "Capital Goods - Electrical Equipment", count: 77 },
    { name: "Cement", count: 19 },
    { name: "Chemicals", count: 102 },
    { name: "Consumer Durables", count: 56 },
    { name: "FMCG", count: 48 },
    { name: "Healthcare", count: 92 },
    { name: "IT Services", count: 67 },
    { name: "Metals", count: 44 },
    { name: "Oil & Gas", count: 26 },
    { name: "Pharma", count: 118 },
    { name: "Power", count: 35 },
    { name: "Real Estate", count: 28 },
    { name: "Telecom", count: 9 },
  ];

  const [sectorQuery, setSectorQuery] = useState("");
  const [showAllSectors, setShowAllSectors] = useState(false);
  const [selectedSectors, setSelectedSectors] = useState<Set<string>>(new Set());

  const filteredSectors = SECTORS.filter((s) =>
    !sectorQuery.trim()
      ? true
      : s.name.toLowerCase().includes(sectorQuery.trim().toLowerCase())
  );

  const visibleSectors = showAllSectors ? filteredSectors : filteredSectors.slice(0, 10);

  function toggleSector(name: string) {
    setSelectedSectors((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  // Note: Select-all / clear CTAs intentionally removed per design.

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto bg-background">
        <Accordion
          type="multiple"
          className="w-full"
          value={accordionOpen}
          onValueChange={onAccordionOpenChange}
        >
          <AccordionItem value="universe">
            <div className="px-4">
              <AccordionTrigger className="py-3 text-foreground">
                Stock Universe
              </AccordionTrigger>
              <AccordionContent className="px-0">
                <div className="space-y-3">
                  <div className="relative">
                    <Input
                      placeholder="search"
                      className="h-9 pr-9"
                      readOnly
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Search size={16} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    {[
                      { id: "nifty50", label: "Nifty 50 Stocks" },
                      { id: "nifty500", label: "Nifty 500 Stocks" },
                    ].map((u) => (
                      <label
                        key={u.id}
                        className="flex items-center justify-between gap-3 text-sm text-foreground cursor-pointer select-none"
                      >
                        <span className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="universe"
                            checked={universe === u.id}
                            onChange={() => onUniverseChange(u.id)}
                            className="h-4 w-4 accent-primary"
                          />
                          <span className="text-muted-foreground">{u.label}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </div>
          </AccordionItem>

          <AccordionItem value="sector">
            <div className="px-4">
              <AccordionTrigger className="py-3 text-foreground">
                Sector
              </AccordionTrigger>
              <AccordionContent className="px-0">
                <div className="space-y-3">
                  <div className="relative">
                    <Input
                      value={sectorQuery}
                      onChange={(e) => setSectorQuery(e.target.value)}
                      placeholder="search"
                      className="h-9 pr-9"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Search size={16} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    {visibleSectors.map((s) => {
                      const checked = selectedSectors.has(s.name);
                      return (
                        <label
                          key={s.name}
                          className="flex items-center justify-between gap-3 text-sm text-foreground cursor-pointer select-none"
                        >
                          <span className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleSector(s.name)}
                              className="h-4 w-4 accent-primary"
                            />
                            <span className="text-muted-foreground">{s.name}</span>
                          </span>
                          <span className="text-muted-foreground">({s.count})</span>
                        </label>
                      );
                    })}
                  </div>

                  {filteredSectors.length > 10 && (
                    <button
                      type="button"
                      onClick={() => setShowAllSectors((v) => !v)}
                      className="text-sm text-primary hover:underline"
                    >
                      {showAllSectors ? "Show less" : "Show more"}
                    </button>
                  )}
                </div>
              </AccordionContent>
            </div>
          </AccordionItem>

          {conditions.map((row, idx) => {
            const ind = row.leftIndicatorId ? getIndicator(row.leftIndicatorId) : null;
            const title = ind?.name ?? "Select Indicator";
            return (
              <AccordionItem key={row.id} value={row.id}>
                <div className="px-4">
                  <AccordionPrimitive.Header className="flex items-center">
                    <AccordionPrimitive.Trigger className="flex flex-1 min-w-0 items-center gap-2 py-3 text-sm text-foreground transition-all hover:text-primary [&[data-state=open]>svg:last-child]:rotate-180">
                      <span className="min-w-0 flex-1 truncate text-left text-sm font-semibold">{title}</span>
                      <span
                        role="button"
                        tabIndex={0}
                        aria-label="Delete condition"
                        className="shrink-0 w-7 h-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          deleteRow(row.id);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            e.stopPropagation();
                            deleteRow(row.id);
                          }
                        }}
                      >
                        <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                          <path d="M2 4h12M5.33 4V2.67a1.33 1.33 0 011.34-1.34h2.66a1.33 1.33 0 011.34 1.34V4m2 0v9.33a1.33 1.33 0 01-1.34 1.34H4.67a1.33 1.33 0 01-1.34-1.34V4h9.34z" />
                        </svg>
                      </span>
                      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
                    </AccordionPrimitive.Trigger>
                  </AccordionPrimitive.Header>
                  <AccordionContent className="px-0">
                    <div className="pt-1">
                      <SimpleConditionForm
                        condition={row}
                        index={idx}
                        onChange={(patch) => updateRow(row.id, patch)}
                        onDelete={() => deleteRow(row.id)}
                        canDelete={true}
                        onIndicatorClick={(side) => onOpenSidebar({ id: row.id, side })}
                        onRequestCompareWith={() => onOpenCompareWith(row.id)}
                        variant="accordion"
                      />
                    </div>
                  </AccordionContent>
                </div>
              </AccordionItem>
            );
          })}
        </Accordion>

        {conditions.length === 0 && (
          <div className="px-4 py-10 text-center">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Search size={20} className="text-primary/50" />
            </div>
            <p className="text-sm text-muted-foreground">
              Add filters to scan for stocks matching your criteria
            </p>
            <button
              type="button"
              onClick={() => onChange([])}
              className="mt-4 text-xs font-medium text-foreground border border-border rounded-md px-3 py-1.5 hover:bg-muted"
            >
              Reset all
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export function CustomScannerPage() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<"standard" | "custom">("standard");
  const uiMode = "simple" as const;
  const [query, setQuery] = useState<QueryState>({
    name: DEFAULT_SCREENER_NAME,
    universe: "nifty50",
    groups: [createGroup("AND", "1d")],
    description: "",
    preferences: { ...DEFAULT_SCREENER_PREFERENCES },
  });
  const [simpleConditions, setSimpleConditions] = useState<SimpleConditionRow[]>([]);
  const [builderAccordionOpen, setBuilderAccordionOpen] = useState<string[]>([]);
  const [results, setResults] = useState<ScanResultRow[]>([]);
  const [lastScannedAt, setLastScannedAt] = useState<string | null>(null);
  const [hasRun, setHasRun] = useState(false);
  const [scanProgress, setScanProgress] = useState<ScanProgress | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [sortBy, setSortBy] = useState<"close" | "change1d" | "volume">("change1d");
  const [sortDesc, setSortDesc] = useState(true);

  // Custom tab state
  const [customPhase, setCustomPhase] = useState<"idle" | "generating">("idle");
  const [customNlInput, setCustomNlInput] = useState("");
  const [customFormula, setCustomFormula] = useState("");
  const [customFormulaError, setCustomFormulaError] = useState<string | null>(null);
  const [customUniverse, setCustomUniverse] = useState("nifty500");

  // Default stocks (shown before any scan is run)
  const [defaultStocks, setDefaultStocks] = useState<ScanResultRow[]>([]);
  const [isLoadingDefaults, setIsLoadingDefaults] = useState(true);

  // Mobile filter sheet
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  // Mobile per-condition edit sheet
  const [mobileConditionEditId, setMobileConditionEditId] = useState<string | null>(null);
  // Which view inside the mobile condition modal: "form" (default) or "compareWith"
  const [mobileConditionView, setMobileConditionView] = useState<"form" | "compareWith">("form");
  /** After picking an indicator from the mobile edit sheet, reopen this row's edit modal (picker cancel uses it too). */
  const [mobilePickerResumeRowId, setMobilePickerResumeRowId] = useState<string | null>(null);

  const [headerNotice, setHeaderNotice] = useState<string | null>(null);
  const headerNoticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const customQueryTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  const [savedScreenerId, setSavedScreenerId] = useState<string | null>(null);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [pendingActionAfterSave, setPendingActionAfterSave] = useState<"share" | "alerts" | null>(null);
  /** Fingerprint after last successful save via modal (for “unsaved changes”). */
  const [savedWorkspaceFingerprint, setSavedWorkspaceFingerprint] = useState<string | null>(null);

  function flashHeaderNotice(message: string) {
    if (headerNoticeTimerRef.current) clearTimeout(headerNoticeTimerRef.current);
    setHeaderNotice(message);
    headerNoticeTimerRef.current = setTimeout(() => {
      setHeaderNotice(null);
      headerNoticeTimerRef.current = null;
    }, 2500);
  }

  useEffect(() => {
    return () => {
      if (headerNoticeTimerRef.current) clearTimeout(headerNoticeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const state = location.state as { quickQuery?: QueryState } | null;
    if (!state?.quickQuery) return;
    const incomingQuery = state.quickQuery;
    if (!Array.isArray(incomingQuery.groups)) return;
    setQuery({
      ...incomingQuery,
      name: (incomingQuery.name && incomingQuery.name.trim()) ? incomingQuery.name : DEFAULT_SCREENER_NAME,
      preferences: { ...DEFAULT_SCREENER_PREFERENCES, ...incomingQuery.preferences },
    });
    setSimpleConditions(queryToSimple(incomingQuery));
    setActiveTab("standard");
  }, [location.key, location.state]);

  // Data refresh state
  // Sidebar state (lifted to page level so it renders outside the scroll area)
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarTarget, setSidebarTarget] = useState<"new" | { id: string; side: "left" | "right" }>("new");
  const [indicatorSearch, setIndicatorSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string | null>("Price");
  const [compareWithOpen, setCompareWithOpen] = useState(false);
  const [compareWithRowId, setCompareWithRowId] = useState<string | null>(null);

  useEffect(() => {
    const valid = new Set<string>(["universe", "sector", ...simpleConditions.map((c) => c.id)]);
    setBuilderAccordionOpen((prev) => prev.filter((v) => valid.has(v)));
  }, [simpleConditions]);

  useEffect(() => {
    if (
      compareWithRowId &&
      !simpleConditions.some((c) => c.id === compareWithRowId)
    ) {
      setCompareWithOpen(false);
      setCompareWithRowId(null);
    }
  }, [simpleConditions, compareWithRowId]);

  function handleOpenSidebar(target: "new" | { id: string; side: "left" | "right" }) {
    setCompareWithOpen(false);
    setCompareWithRowId(null);
    if (target === "new") {
      setBuilderAccordionOpen([]);
      setMobilePickerResumeRowId(null);
    }
    setSidebarTarget(target);
    setSidebarOpen(true);
    setIndicatorSearch("");
    setSelectedGroup("Price");
  }

  /**
   * Mobile: closing the indicator picker without a selection — return to main screener,
   * or back to the edit-criteria sheet if the picker was opened from there.
   */
  function handleCloseIndicatorSidebar() {
    setSidebarOpen(false);
    if (mobilePickerResumeRowId) {
      setMobileConditionEditId(mobilePickerResumeRowId);
      setMobilePickerResumeRowId(null);
    }
    setMobileFilterOpen(false);
  }

  function handleOpenCompareWith(rowId: string) {
    setSidebarOpen(false);
    setCompareWithRowId(rowId);
    setCompareWithOpen(true);
    setBuilderAccordionOpen((prev) => (prev.includes(rowId) ? prev : [...prev, rowId]));
  }

  function handleCloseCompareWith() {
    setCompareWithOpen(false);
    setCompareWithRowId(null);
  }

  function patchCompareWithRow(patch: Partial<SimpleConditionRow>) {
    if (!compareWithRowId) return;
    setSimpleConditions((prev) =>
      prev.map((c) => (c.id === compareWithRowId ? { ...c, ...patch } : c))
    );
  }

  const compareWithRow = compareWithRowId
    ? simpleConditions.find((c) => c.id === compareWithRowId)
    : undefined;

  function handleSidebarSelect(indicatorId: string) {
    let rowIdForMobileEdit: string;

    if (sidebarTarget === "new") {
      const ind = getIndicator(indicatorId);
      const isPattern = ind?.outputType === "pattern";
      const row = createSimpleCondition("AND");
      row.leftIndicatorId = indicatorId;
      row.leftParams = ind ? defaultParams(ind) : {};
      row.operator = isPattern ? "detected" : "greater_than";
      if (isPattern) {
        row.hasTimeModifier = true;
        row.timeModifierMode = "within_last";
        row.timeModifierBars = 1;
      }
      rowIdForMobileEdit = row.id;
      setSimpleConditions((prev) => [...prev, row]);
      setBuilderAccordionOpen((prev) =>
        prev.includes(row.id) ? prev : [...prev, row.id]
      );
    } else {
      const { id, side } = sidebarTarget;
      rowIdForMobileEdit = id;
      setSimpleConditions((prev) =>
        prev.map((c) => {
          if (c.id !== id) return c;
          if (side === "left") {
            const ind = getIndicator(indicatorId);
            const isPattern = ind?.outputType === "pattern";
            return {
              ...c,
              leftIndicatorId: indicatorId,
              leftParams: ind ? defaultParams(ind) : {},
              operator: isPattern ? "detected" : "greater_than",
              rightType: "indicator" as const,
              rightValue: "",
              rightIndicatorId: "",
              rightParams: {},
              rightValue2: "",
              ...(isPattern
                ? { hasTimeModifier: true, timeModifierMode: "within_last" as const, timeModifierBars: 1 }
                : { hasTimeModifier: false, timeModifierBars: 5 }),
            };
          }
          const ind = getIndicator(indicatorId);
          return {
            ...c,
            rightIndicatorId: indicatorId,
            rightParams: ind ? defaultParams(ind) : {},
          };
        })
      );
      setBuilderAccordionOpen((prev) => (prev.includes(id) ? prev : [...prev, id]));
    }

    setSidebarOpen(false);

    const openMobileCriteriaSheet =
      mobileFilterOpen || mobilePickerResumeRowId !== null;
    if (openMobileCriteriaSheet) {
      setMobileFilterOpen(false);
      setMobileConditionEditId(rowIdForMobileEdit);
      setMobileConditionView("form");
    }
    setMobilePickerResumeRowId(null);
  }

  const sidebarExcludePatterns =
    sidebarTarget !== "new" && typeof sidebarTarget === "object" && sidebarTarget.side === "right";

  const [dynamicColumns, setDynamicColumns] = useState<IndicatorColumn[]>([]);
  const [_isRefreshing, setIsRefreshing] = useState(false);
  const [_refreshProgress, setRefreshProgress] = useState<PipelineProgress | null>(null);
  const [freshness, setFreshness] = useState<{ daily: string | null; intraday15m: string | null; monthly: string | null }>({
    daily: null,
    intraday15m: null,
    monthly: null,
  });

  // Token state (used when Settings tab is re-enabled)
  const [_tokenStatus, setTokenStatus] = useState<{ isSet: boolean; lastUpdated: string | null; maskedToken: string | null }>({
    isSet: false, lastUpdated: null, maskedToken: null,
  });
  const [tokenInput, setTokenInput] = useState("");
  const [_tokenSaving, setTokenSaving] = useState(false);
  const [_tokenSaveError, setTokenSaveError] = useState<string | null>(null);

  // Load default universe snapshot on mount
  useEffect(() => {
    let cancelled = false;
    const loadDefaults = async () => {
      setIsLoadingDefaults(true);
      try {
        const snapshot = await loadUniverseSnapshot("nifty500");
        if (snapshot.length > 0) {
          if (!cancelled) setDefaultStocks(snapshot.slice(0, 50));
          return;
        }

        // Fallback: still show 50 symbols even when candles are not configured yet.
        const instruments = await getInstrumentList("nifty500");
        const fallbackRows: ScanResultRow[] = instruments.length > 0
          ? instruments.slice(0, 50).map((inst) => ({
              symbol: inst.symbol,
              name: inst.name,
              close: 0,
              change1d: 0,
              volume: 0,
              marketCap: undefined,
              matchedGroups: 0,
              indicatorValues: {},
            }))
          : buildLocalFallbackRows();
        if (!cancelled) setDefaultStocks(fallbackRows);
      } catch {
        if (!cancelled) setDefaultStocks(buildLocalFallbackRows());
      } finally {
        if (!cancelled) setIsLoadingDefaults(false);
      }
    };
    void loadDefaults();
    return () => {
      cancelled = true;
    };
  }, []);

  // Load token + data freshness on mount
  useEffect(() => {
    loadTokenFromSupabase().catch(() => {});
    getTokenStatus().then(setTokenStatus).catch(() => {});
    getDataFreshness().then(setFreshness).catch(() => {});
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DIY_SCREENER_STORAGE_KEY);
      if (!raw) return;
      const parsed: unknown = JSON.parse(raw);
      if (!isPersistedDiyV1(parsed)) return;
      const pq = parsed.query;
      setQuery({
        ...pq,
        name: (pq.name && pq.name.trim()) ? pq.name : DEFAULT_SCREENER_NAME,
        preferences: { ...DEFAULT_SCREENER_PREFERENCES, ...pq.preferences },
      });
      setSimpleConditions(parsed.simpleConditions);
      setCustomFormula(parsed.customFormula);
      setCustomNlInput(parsed.customNlInput);
      setCustomUniverse(parsed.customUniverse);
      // DIY should always open in standard mode.
      setActiveTab("standard");
      setSavedScreenerId(parsed.savedScreenerId ?? null);
    } catch {
      /* ignore corrupt storage */
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(
          DIY_SCREENER_STORAGE_KEY,
          JSON.stringify({
            v: 1,
            query,
            simpleConditions,
            customFormula,
            customNlInput,
            customUniverse,
            activeTab,
            savedScreenerId: savedScreenerId ?? undefined,
          })
        );
      } catch {
        /* quota or private mode */
      }
    }, 400);
    return () => clearTimeout(t);
  }, [query, simpleConditions, customFormula, customNlInput, customUniverse, activeTab, savedScreenerId]);

  async function _handleSaveToken() {
    if (!tokenInput.trim()) return;
    setTokenSaving(true);
    setTokenSaveError(null);
    try {
      await saveTokenToSupabase(tokenInput.trim());
      setTokenInput("");
      const status = await getTokenStatus();
      setTokenStatus(status);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.error("Failed to save token:", e);
      setTokenSaveError(message);
    } finally {
      setTokenSaving(false);
    }
  }

  // Derive the effective query from whichever mode is active
  const effectiveQuery = useMemo(() => {
    const prefs = query.preferences ?? DEFAULT_SCREENER_PREFERENCES;
    if (uiMode === "simple") {
      return simpleToQuery(
        query.name,
        simpleConditions,
        query.universe,
        query.description ?? "",
        prefs
      );
    }
    return { ...query, preferences: prefs };
  }, [query, simpleConditions, uiMode]);

  const handleRunScan = useCallback(async () => {
    const q = effectiveQuery;
    setIsScanning(true);
    setHasRun(true);
    setResults([]);
    const cols = extractIndicatorColumns(q);
    setDynamicColumns(cols);
    setScanProgress({ phase: "loading_data", message: "Updating results..." });
    try {
      const matches = await runCustomScan(q, setScanProgress);
      setResults(matches);
      setLastScannedAt(new Date().toISOString());
    } catch (err) {
      setScanProgress({ phase: "error", message: String(err) });
    } finally {
      setIsScanning(false);
    }
  }, [effectiveQuery]);

  async function handleGenerateQuery() {
    if (!customNlInput.trim()) return;
    setCustomPhase("generating");
    setCustomFormulaError(null);
    try {
      const formula = await generateQueryFormula(customNlInput);
      setCustomFormula(formula);
      setCustomPhase("idle");
    } catch (e) {
      setCustomPhase("idle");
      setCustomFormulaError(e instanceof Error ? e.message : "Failed to generate query.");
    }
  }

  async function handleRunCustomScan() {
    setCustomFormulaError(null);
    let parsedQuery: QueryState;
    try {
      parsedQuery = parseFormula(customFormula, customUniverse);
    } catch (e) {
      setCustomFormulaError(e instanceof FormulaParseError ? e.message : "Could not parse query.");
      return;
    }
    const prefs = query.preferences ?? DEFAULT_SCREENER_PREFERENCES;
    parsedQuery = { ...parsedQuery, preferences: prefs };
    setIsScanning(true);
    setHasRun(true);
    setResults([]);
    const cols = extractIndicatorColumns(parsedQuery);
    setDynamicColumns(cols);
    setScanProgress({ phase: "loading_data", message: "Updating results..." });
    try {
      const matches = await runCustomScan(parsedQuery, setScanProgress);
      setResults(matches);
      setLastScannedAt(new Date().toISOString());
    } catch (err) {
      setScanProgress({ phase: "error", message: String(err) });
    } finally {
      setIsScanning(false);
    }
  }

  const _handleRefreshData = useCallback(async (phase: "1d" | "15m" | "1M" | "all") => {
    setIsRefreshing(true);
    setRefreshProgress(null);
    try {
      if (phase === "1d" || phase === "all") {
        await refreshDailyCandles(setRefreshProgress);
      }
      if (phase === "15m" || phase === "all") {
        await refresh15mCandles(setRefreshProgress);
      }
      if (phase === "1M" || phase === "all") {
        await refreshMonthlyCandles(setRefreshProgress);
      }
      const f = await getDataFreshness();
      setFreshness(f);
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setIsRefreshing(false);
      setRefreshProgress(null);
    }
  }, []);

  if (import.meta.env.DEV) {
    void _handleSaveToken;
    void _handleRefreshData;
  }

  const sortedResults = [...results].sort((a, b) => {
    const mul = sortDesc ? -1 : 1;
    return mul * (a[sortBy] - b[sortBy]);
  });

  function addGroup(connector: "AND" | "OR") {
    setQuery((q) => ({ ...q, groups: [...q.groups, createGroup(connector, "1d")] }));
  }

  function updateGroup(groupId: string, updated: GroupState) {
    setQuery((q) => ({
      ...q,
      groups: q.groups.map((g) => (g.id === groupId ? updated : g)),
    }));
  }

  function deleteGroup(groupId: string) {
    setQuery((q) => ({
      ...q,
      groups: q.groups.filter((g) => g.id !== groupId),
    }));
  }

  function updateConnector(groupId: string, connector: "AND" | "OR") {
    setQuery((q) => ({
      ...q,
      groups: q.groups.map((g) => (g.id === groupId ? { ...g, connector } : g)),
    }));
  }

  const summary = generateSummary(effectiveQuery.groups);
  const conditionCount = effectiveQuery.groups.reduce(
    (sum, g) => sum + g.conditions.filter((c) => c.leftIndicatorId && c.operator).length,
    0
  );

  const workspaceFingerprint = useMemo(
    () =>
      JSON.stringify({
        activeTab,
        customFormula,
        customUniverse,
        simpleConditions,
        name: query.name,
        desc: query.description,
        prefs: query.preferences,
        groups: query.groups,
        universe: query.universe,
      }),
    [activeTab, customFormula, customUniverse, simpleConditions, query]
  );

  const fpBootstrappedRef = useRef(false);
  useEffect(() => {
    if (fpBootstrappedRef.current) return;
    if (savedScreenerId && savedWorkspaceFingerprint === null) {
      setSavedWorkspaceFingerprint(workspaceFingerprint);
      fpBootstrappedRef.current = true;
    }
  }, [savedScreenerId, savedWorkspaceFingerprint, workspaceFingerprint]);

  const hasUnsavedChanges =
    !!savedScreenerId &&
    savedWorkspaceFingerprint !== null &&
    workspaceFingerprint !== savedWorkspaceFingerprint;

  const handleRunScanRef = useRef(handleRunScan);
  handleRunScanRef.current = handleRunScan;
  const handleRunCustomScanRef = useRef(handleRunCustomScan);
  handleRunCustomScanRef.current = handleRunCustomScan;

  useEffect(() => {
    if (activeTab !== "standard") return;
    if (conditionCount === 0) {
      setHasRun(false);
      setResults([]);
      setScanProgress(null);
      return;
    }
    const t = setTimeout(() => void handleRunScanRef.current(), 750);
    return () => clearTimeout(t);
  }, [activeTab, conditionCount, simpleConditions, query.universe]);

  useEffect(() => {
    if (activeTab !== "custom") return;
    if (!customFormula.trim()) {
      setHasRun(false);
      setResults([]);
      setScanProgress(null);
      return;
    }
    try {
      parseFormula(customFormula, customUniverse);
    } catch {
      setHasRun(false);
      setResults([]);
      return;
    }
    const t = setTimeout(() => void handleRunCustomScanRef.current(), 750);
    return () => clearTimeout(t);
  }, [activeTab, customFormula, customUniverse]);

  // Mobile filter chips — one per active Standard condition, or per formula line for Custom
  const mobileFilterChips: { id: string; label: string; onPress: () => void }[] =
    activeTab === "standard"
      ? simpleConditions
          .filter((c) => c.leftIndicatorId && c.operator)
          .map((c) => {
            const ind = getIndicator(c.leftIndicatorId);
            const op = OPERATORS.find((o) => o.id === c.operator);
            let label = ind?.name ?? c.leftIndicatorId;
            if (op && !op.needsRight) label += ` ${op.label}`;
            else if (op && c.rightType === "value" && c.rightValue)
              label += ` ${op.label} ${c.rightValue}`;
            return {
              id: c.id,
              label: label.length > 22 ? label.slice(0, 21) + "…" : label,
              onPress: () => {
                setBuilderAccordionOpen((prev) =>
                  prev.includes(c.id) ? prev : [...prev, c.id]
                );
              },
            };
          })
      : customFormula
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean)
          .map((line, i) => ({
            id: `fl-${i}`,
            label: line.length > 22 ? line.slice(0, 21) + "…" : line,
            onPress: () => {}, // just opens the sheet
          }));

  const customQueryIsValid = useMemo(() => {
    if (!customFormula.trim()) return false;
    try {
      parseFormula(customFormula, customUniverse);
      return true;
    } catch {
      return false;
    }
  }, [customFormula, customUniverse]);

  const canSaveScreener =
    activeTab === "standard" ? conditionCount > 0 : customQueryIsValid;
  const alertsConfigured = useMemo(() => {
    const prefs = query.preferences ?? DEFAULT_SCREENER_PREFERENCES;
    return (
      prefs.runSchedule !== "manual" ||
      prefs.notifyInApp ||
      prefs.notifyEmail ||
      prefs.notifyPush
    );
  }, [query.preferences]);

  const saveCtaLabel = !savedScreenerId
    ? "Save"
    : hasUnsavedChanges
      ? "Save changes"
      : "Saved";

  async function handleShareSavedScreener() {
    const title = query.name.trim() || DEFAULT_SCREENER_NAME;
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}${window.location.pathname}?screener=${encodeURIComponent(savedScreenerId!)}`
        : "";
    const summaryLine = summary.trim();
    const statusLine =
      isScanning
        ? scanProgress?.message ?? "Updating results..."
        : hasRun
          ? `${results.length} match${results.length !== 1 ? "es" : ""} found`
          : "DIY screener on Upstox Scanners";
    const text = [statusLine, summaryLine ? summaryLine.slice(0, 400) : ""].filter(Boolean).join("\n\n");

    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(`${title}\n\n${text}\n\n${url}`);
      flashHeaderNotice("Copied to clipboard");
    } catch {
      flashHeaderNotice("Could not share or copy");
    }
  }

  function requireSaveBefore(action: "share" | "alerts"): boolean {
    if (!savedScreenerId || hasUnsavedChanges) {
      setPendingActionAfterSave(action);
      setSaveModalOpen(true);
      return true;
    }
    return false;
  }

  async function handleSaveModalSubmit(payload: {
    name: string;
    description: string;
    preferences: ScreenerPreferences;
  }): Promise<{ ok: true } | { ok: false; message: string }> {
    let fullQuery: QueryState;
    if (activeTab === "custom") {
      try {
        const parsed = parseFormula(customFormula, customUniverse);
        fullQuery = {
          ...parsed,
          name: payload.name,
          description: payload.description,
          preferences: payload.preferences,
        };
      } catch {
        return { ok: false, message: "Fix your custom query before saving." };
      }
    } else {
      fullQuery = {
        ...effectiveQuery,
        name: payload.name,
        description: payload.description,
        preferences: payload.preferences,
      };
    }

    setQuery((q) => ({
      ...q,
      name: payload.name,
      description: payload.description,
      preferences: payload.preferences,
    }));

    if (savedScreenerId && !savedScreenerId.startsWith("local_")) {
      const ok = await updateSavedScreener(savedScreenerId, fullQuery);
      if (!ok) {
        return { ok: false, message: "Could not update. Check your connection and try again." };
      }
    } else {
      const created = await createSavedScreener(fullQuery);
      if (created) {
        setSavedScreenerId(created);
      } else if (!savedScreenerId) {
        setSavedScreenerId(`local_${crypto.randomUUID()}`);
      }
    }

    const nextFp = JSON.stringify({
      activeTab,
      customFormula,
      customUniverse,
      simpleConditions,
      name: payload.name,
      desc: payload.description,
      prefs: payload.preferences,
      groups: fullQuery.groups,
      universe: fullQuery.universe,
    });
    setSavedWorkspaceFingerprint(nextFp);
    flashHeaderNotice("Screener saved");
    const pending = pendingActionAfterSave;
    setPendingActionAfterSave(null);
    if (pending === "share") {
      setTimeout(() => {
        void handleShareSavedScreener();
      }, 0);
    } else if (pending === "alerts") {
      flashHeaderNotice("Alerts preferences saved");
    }
    return { ok: true };
  }

  async function handleShareDiyScreener() {
    if (requireSaveBefore("share")) return;
    await handleShareSavedScreener();
  }

  function handleAlertsAction() {
    if (requireSaveBefore("alerts")) return;
    setSaveModalOpen(true);
  }

  function openSaveScreenerModal() {
    setSaveModalOpen(true);
  }

  const screenerNameInput = (
    <Input
      value={query.name}
      onChange={(e) => setQuery((q) => ({ ...q, name: e.target.value }))}
      placeholder={DEFAULT_SCREENER_NAME}
      aria-label="Screener name"
      className="h-9 font-bold text-base text-foreground bg-background border-input shadow-sm w-full max-w-md md:font-semibold md:text-sm"
    />
  );

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] min-h-[500px] relative">
      {/* ── Full-width page header (Conditions + stock list) ── */}
      {/* Mobile */}
      <div className="md:hidden px-4 pt-5 pb-3 border-b border-border bg-background shrink-0 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <Search size={20} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            {screenerNameInput}
            <p className="text-xs text-muted-foreground">
              {isScanning
                ? scanProgress?.message ?? "Updating results..."
                : hasRun
                  ? `${results.length} match${results.length !== 1 ? "es" : ""}${lastScannedAt ? ` · Updated ${timeAgo(lastScannedAt)}` : ""}`
                  : isLoadingDefaults
                    ? "Loading..."
                    : `${defaultStocks.length}+ items`}
            </p>
            {hasUnsavedChanges && (
              <p className="text-[10px] font-medium text-amber-800">Unsaved changes — save to sync settings</p>
            )}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Button
                type="button"
                size="sm"
                className="gap-1.5 h-9"
                disabled={!canSaveScreener}
                onClick={openSaveScreenerModal}
              >
                <Save className="h-3.5 w-3.5" />
                {saveCtaLabel}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="gap-1.5 h-9"
                onClick={() => void handleShareDiyScreener()}
              >
                <Share2 className="h-3.5 w-3.5" />
                Share
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="gap-1.5 h-9"
                onClick={handleAlertsAction}
              >
                <BellRing className="h-3.5 w-3.5" />
                Alerts
              </Button>
              {headerNotice && (
                <span className="text-xs text-primary font-medium w-full sm:w-auto">{headerNotice}</span>
              )}
            </div>
          </div>
        </div>
        {/* ── Robinhood-style scrollable filter chip row ── */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none -mx-4 px-4 pb-0.5">
          {/* Filter icon chip — always first */}
          <button
            type="button"
            onClick={() => {
              if (activeTab === "standard") handleOpenSidebar("new");
              setMobileFilterOpen(true);
            }}
            className={cn(
              "shrink-0 flex items-center gap-1.5 h-9 px-3.5 rounded-full border text-sm font-medium transition-colors",
              mobileFilterChips.length > 0
                ? "bg-foreground text-background border-foreground"
                : "bg-muted border-border text-foreground"
            )}
          >
            <SlidersHorizontal size={14} />
            {mobileFilterChips.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-background text-foreground text-[10px] font-bold flex items-center justify-center leading-none">
                {mobileFilterChips.length}
              </span>
            )}
          </button>

          {/* Active condition chips — tap to open per-condition edit sheet */}
          {mobileFilterChips.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => {
                // Standard tab: open focused per-condition sheet
                // Custom tab: open the full builder (no per-line targeting)
                if (activeTab === "standard") {
                  setMobileConditionEditId(chip.id);
                  setMobileConditionView("form");
                } else {
                  setMobileFilterOpen(true);
                }
              }}
              className="shrink-0 h-9 px-3.5 rounded-full bg-muted border border-border text-sm font-medium text-foreground whitespace-nowrap hover:bg-muted/70 active:bg-muted/50 transition-colors"
            >
              {chip.label}
            </button>
          ))}

          {/* "Add filter" ghost chip — always last */}
          <button
            type="button"
            onClick={() => {
              if (activeTab === "standard") handleOpenSidebar("new");
              setMobileFilterOpen(true);
            }}
            className="shrink-0 h-9 px-3.5 rounded-full border border-dashed border-border text-sm font-medium text-muted-foreground whitespace-nowrap hover:bg-muted/40 transition-colors"
          >
            + Add filter
          </button>

          {/* Right-edge spacer */}
          <div className="shrink-0 w-2" />
        </div>
      </div>

      <div className="flex flex-row flex-1 min-h-0 min-w-0 md:p-4 md:pt-3 md:gap-4">
      {/* ── Left: Query Builder ── */}
      <div className={cn(
        "flex flex-col min-h-0 bg-background md:border md:border-border/70",
        // Desktop: slightly narrower fixed sidebar
        "md:w-[420px] md:shrink-0 md:relative md:flex",
        // Mobile: full-screen overlay when open, hidden otherwise
        mobileFilterOpen ? "fixed inset-0 z-50 flex" : "hidden md:flex"
      )}>
        {/* Filters header + mobile-only close button */}
        <div className="flex border-b border-border bg-muted/20 items-center justify-between min-h-11">
          <div className="hidden md:flex items-center px-4">
            <h2 className="text-sm font-semibold text-foreground">Filters</h2>
          </div>
          <button
            type="button"
            onClick={() => setSimpleConditions([])}
            disabled={conditionCount === 0}
            className="hidden md:inline-flex items-center mr-4 text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Clear all
          </button>
          <button
            onClick={() => setMobileFilterOpen(false)}
            className="md:hidden shrink-0 px-3 h-full flex items-center text-muted-foreground hover:text-foreground border-l border-border"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable: Header + Builder content (no sticky header) */}
        <div className="flex-1 overflow-y-auto">
        {/* Builder area */}
        <div className="pt-0 space-y-3">
          {activeTab === "custom" ? (
            <div className="bg-background">
              <div className="px-4 pt-4 pb-4 space-y-4">
                {/* Universe dropdown — Field style matching Operator input */}
                <Field label="Stock Universe" contentClassName="px-2 py-1">
                  <div className="relative">
                    <select
                      value={customUniverse}
                      onChange={(e) => setCustomUniverse(e.target.value)}
                      className="h-8 w-full rounded-md bg-transparent pl-1 pr-8 text-sm appearance-none focus-visible:outline-none focus-visible:ring-0"
                    >
                      <option value="nifty50">Nifty 50 Stocks</option>
                      <option value="nifty500">Nifty 500 Stocks</option>
                    </select>
                    <SelectFieldChevron />
                  </div>
                </Field>

                {/* Example chips — below universe, above NL input */}
                <div className="space-y-2">
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    Try an example
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {AI_EXAMPLES.map((ex) => (
                      <button
                        key={ex.label}
                        onClick={() => {
                          setCustomNlInput(ex.prompt);
                          setCustomFormula(ex.formula);
                          setCustomFormulaError(null);
                        }}
                        className={cn(
                          "text-xs px-2.5 py-1 rounded-full border transition-colors",
                          customNlInput === ex.prompt
                            ? "border-primary/40 bg-primary/10 text-primary"
                            : "border-border bg-background text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                        )}
                      >
                        {ex.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Natural language input with inline Generate CTA */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Describe your scan in plain English
                  </label>
                  <div className="rounded-md border border-input bg-background focus-within:border-primary focus-within:ring-2 focus-within:ring-ring focus-within:ring-inset">
                    <textarea
                      value={customNlInput}
                      onChange={(e) => setCustomNlInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void handleGenerateQuery();
                      }}
                      placeholder="e.g. RSI below 30 on daily timeframe with price above 200-day SMA and bullish engulfing today"
                      rows={3}
                      className="w-full text-sm bg-transparent px-3 pt-2.5 pb-1.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none resize-none leading-relaxed"
                    />
                    {/* Generate CTA — bottom row inside the same box */}
                    <div className="flex items-center justify-between px-3 py-1.5 border-t border-border/50">
                      <span className="text-[10px] text-muted-foreground/60">⌘↵ to generate</span>
                      <button
                        onClick={() => void handleGenerateQuery()}
                        disabled={!customNlInput.trim() || customPhase === "generating"}
                        className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 disabled:text-muted-foreground/50 disabled:cursor-not-allowed transition-colors"
                      >
                        {customPhase === "generating"
                          ? <Loader2 size={11} className="animate-spin" />
                          : <Sparkles size={11} />}
                        {customPhase === "generating" ? "Generating..." : "Generate query"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Generated query — always visible, editable */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Pencil size={9} />
                      Query
                    </span>
                    {customFormula.trim() && (
                      <button
                        onClick={() => {
                          setCustomFormula("");
                          setCustomNlInput("");
                          setCustomFormulaError(null);
                        }}
                        className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                      >
                        <RotateCcw size={9} />
                        Clear
                      </button>
                    )}
                  </div>
                  <Field label="" contentClassName="p-0">
                    <textarea
                      ref={customQueryTextareaRef}
                      value={customFormula}
                      onChange={(e) => {
                        setCustomFormula(e.target.value);
                        setCustomFormulaError(null);
                      }}
                      rows={6}
                      spellCheck={false}
                      placeholder={"RSI(14)[1D] < 30\nClose[1D] > SMA(200)[1D]\nVolume[1D] > VolSMA(20)[1D]"}
                      className="w-full text-sm font-mono bg-transparent px-3 py-2.5 text-foreground placeholder:text-muted-foreground/30 focus:outline-none resize-none leading-relaxed"
                    />
                  </Field>
                  {customFormulaError && (
                    <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                      {customFormulaError}
                    </p>
                  )}
                  <p className="text-[10px] text-muted-foreground leading-relaxed font-mono">
                    <span className="text-foreground/60">INDICATOR(params)[TF] OP VALUE</span>
                    {"  ·  "}
                    <span className="text-foreground/50">one condition per line</span>
                    <br />
                    <span className="text-foreground/50">[1D]</span>{" · "}
                    <span className="text-foreground/50">[15m]</span>{" · "}
                    <span className="text-foreground/50">[1M]</span>
                    {"  ·  ops: "}
                    <span className="text-foreground/50">{"< > <= >= crossed_above crossed_below"}</span>
                  </p>
                </div>
              </div>
            </div>
          ) : uiMode === "simple" ? (
            <SimpleBuilderView
              conditions={simpleConditions}
              onChange={setSimpleConditions}
              onOpenSidebar={handleOpenSidebar}
              onOpenCompareWith={handleOpenCompareWith}
              universe={query.universe}
              onUniverseChange={(v) => setQuery((q) => ({ ...q, universe: v }))}
              accordionOpen={builderAccordionOpen}
              onAccordionOpenChange={setBuilderAccordionOpen}
            />
          ) : (
            <>
              {query.groups.map((group, idx) => (
                <div key={group.id}>
                  {idx > 0 && (
                    <div className="flex items-center gap-3 my-3">
                      <div className="flex-1 h-px bg-border" />
                      <button
                        onClick={() =>
                          updateConnector(
                            group.id,
                            group.connector === "AND" ? "OR" : "AND"
                          )
                        }
                        className="text-[10px] font-bold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-0.5 rounded-full uppercase tracking-wider transition-colors cursor-pointer select-none"
                        title="Click to toggle AND / OR"
                      >
                        {group.connector}
                      </button>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                  )}
                  <GroupCard
                    group={group}
                    onChange={(g) => updateGroup(group.id, g)}
                    onDelete={() => deleteGroup(group.id)}
                    isOnly={query.groups.length === 1}
                  />
                </div>
              ))}

              <div className="flex gap-2">
                <button
                  onClick={() => addGroup("AND")}
                  className="flex-1 py-2 text-xs font-medium text-primary rounded-xl border border-dashed border-primary/30 hover:bg-primary/5 transition-colors flex items-center justify-center gap-1"
                >
                  <Plus size={12} />
                  AND Group
                </button>
                <button
                  onClick={() => addGroup("OR")}
                  className="flex-1 py-2 text-xs font-medium text-primary rounded-xl border border-dashed border-primary/30 hover:bg-primary/5 transition-colors flex items-center justify-center gap-1"
                >
                  <Plus size={12} />
                  OR Group
                </button>
              </div>
            </>
          )}
        </div>

        </div>

        {/* Summary + Actions */}
        <div className="border-t border-border">
          <div className="p-3 space-y-2">
            {activeTab === "custom" ? (
              <>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      customQueryTextareaRef.current?.focus();
                      customQueryTextareaRef.current?.setSelectionRange(
                        customFormula.length,
                        customFormula.length
                      );
                    }}
                    className="flex-1 gap-1.5 h-11 text-sm border-primary/30"
                  >
                    <Plus size={14} />
                    Add condition
                  </Button>
                  <Button
                    type="button"
                    onClick={openSaveScreenerModal}
                    disabled={!canSaveScreener}
                    className="flex-1 gap-1.5 h-11 text-sm bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    <Save size={14} />
                    Save screener
                  </Button>
                </div>
                <p className="text-[10px] text-center text-muted-foreground leading-relaxed px-1">
                  Results update automatically when your query is valid.
                </p>
                {savedScreenerId && (
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                    <span className="text-[10px] text-muted-foreground">Saved</span>
                    <button
                      type="button"
                      onClick={() => void handleShareDiyScreener()}
                      className="text-[10px] font-medium text-primary hover:underline inline-flex items-center gap-1"
                    >
                      <Share2 size={10} />
                      Share
                    </button>
                    <button
                      type="button"
                      onClick={openSaveScreenerModal}
                      className="text-[10px] font-medium text-primary hover:underline inline-flex items-center gap-1"
                    >
                      <Settings2 size={10} />
                      Edit settings
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                {uiMode === "simple" ? (
                  <Button
                    type="button"
                    onClick={() => handleOpenSidebar("new")}
                    className="w-full gap-1.5 h-11 text-sm bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Plus size={14} />
                    Add condition
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={openSaveScreenerModal}
                    disabled={!canSaveScreener}
                    className="w-full gap-1.5 h-11 text-sm bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    <Save size={14} />
                    Save screener
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Right: Results ── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-background md:border md:border-border/70">
        {/* Desktop results header */}
        <div className="hidden md:flex items-center justify-between gap-4 px-4 h-12 border-b border-border bg-background">
          <div className="flex items-center gap-2 min-w-0 flex-1 group">
            <input
              value={query.name}
              onChange={(e) => setQuery((q) => ({ ...q, name: e.target.value }))}
              placeholder={DEFAULT_SCREENER_NAME}
              aria-label="Screener name"
              className="text-lg font-bold text-foreground bg-transparent border-0 outline-none p-0 m-0 min-w-0 w-auto max-w-xs placeholder:text-muted-foreground/50 focus:ring-0 focus:outline-none truncate"
              style={{ width: `${Math.max((query.name || DEFAULT_SCREENER_NAME).length, 12)}ch` }}
            />
            <Pencil
              size={13}
              className="text-muted-foreground/40 shrink-0 group-hover:text-muted-foreground transition-colors cursor-pointer"
              onClick={(e) => {
                const input = (e.currentTarget.parentElement?.querySelector("input") as HTMLInputElement | null);
                input?.focus();
              }}
            />
            {hasUnsavedChanges && (
              <Badge variant="outline" className="text-[10px] font-medium border-amber-300 text-amber-800 bg-amber-50 shrink-0">
                Unsaved changes
              </Badge>
            )}
            {headerNotice && (
              <span className="text-xs text-primary font-medium ml-1">{headerNotice}</span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10 border-[#E1E1E1] text-[#777777] hover:text-[#262626] hover:bg-white"
              onClick={() => {
                const input = document.querySelector<HTMLInputElement>('[aria-label="Screener name"]');
                input?.focus();
              }}
              title="Edit screener name"
              aria-label="Edit screener name"
            >
              <Pencil size={16} />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10 border-[#E1E1E1] text-[#777777] hover:text-[#262626] hover:bg-white"
              onClick={() => void handleShareDiyScreener()}
              title="Share screener"
              aria-label="Share screener"
            >
              <Share2 size={16} />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className={cn(
                "h-10 w-10 border-[#E1E1E1] text-[#777777] hover:text-[#262626] hover:bg-white",
                alertsConfigured && "border-primary/40 text-primary bg-primary/5 hover:bg-primary/10"
              )}
              onClick={handleAlertsAction}
              title={alertsConfigured ? "Alerts on" : "Set alerts"}
              aria-label={alertsConfigured ? "Alerts on" : "Set alerts"}
            >
              <BellRing size={16} />
            </Button>
            <Button
              type="button"
              className={cn(
                "h-11 min-w-[140px] px-7 text-base font-semibold bg-primary hover:bg-primary/90",
                savedScreenerId && !hasUnsavedChanges && "bg-primary/85"
              )}
              disabled={!canSaveScreener}
              onClick={openSaveScreenerModal}
            >
              Save
            </Button>
          </div>
        </div>

        {/* Results body */}
        {!hasRun ? (
          <>
            {/* ── Mobile: Robinhood-style default stock list ── */}
            <div className="md:hidden flex-1 overflow-y-auto">
              {isLoadingDefaults ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3">
                  <Loader2 size={24} className="animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Loading stocks...</p>
                </div>
              ) : defaultStocks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3 px-6 text-center">
                  <Search size={28} className="text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">
                    No data yet. Tap <strong>Add filter</strong> — results update automatically when you add conditions.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center px-4 py-2.5 border-b border-border/60 bg-muted/20 sticky top-0 z-10">
                    <div className="w-7 shrink-0 text-[10px] font-medium text-muted-foreground">#</div>
                    <div className="flex-1 text-[10px] font-medium text-muted-foreground">Symbol</div>
                    <div className="w-24 text-right text-[10px] font-medium text-muted-foreground">Price</div>
                    <div className="w-16 text-right text-[10px] font-medium text-muted-foreground">1D Chg%</div>
                    <div className="w-9 shrink-0 text-center text-[10px] font-medium text-muted-foreground">Watch</div>
                  </div>
                  {defaultStocks.map((row, idx) => (
                    <div key={row.symbol} className="flex items-center px-4 py-3.5 border-b border-border/40">
                      <div className="w-7 shrink-0 text-xs text-muted-foreground/50 tabular-nums">{idx + 1}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-foreground">{row.symbol}</div>
                        <div className="text-xs text-muted-foreground truncate">{row.name}</div>
                      </div>
                      <div className="w-24 text-right">
                        <div className="text-sm font-semibold tabular-nums text-foreground">
                          ₹{row.close.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                        </div>
                      </div>
                      <div className={cn(
                        "w-16 text-right text-xs font-medium tabular-nums",
                        row.change1d >= 0 ? "text-green-500" : "text-red-500"
                      )}>
                        <div className="inline-flex items-center justify-end gap-0.5">
                          {row.change1d >= 0
                            ? <TrendingUp size={10} className="shrink-0" />
                            : <TrendingDown size={10} className="shrink-0" />}
                          {Math.abs(row.change1d).toFixed(2)}%
                        </div>
                      </div>
                      <div className="w-9 shrink-0 flex justify-center">
                        <MobileWatchPlusButton symbol={row.symbol} />
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* ── Desktop: default stocks table or empty state ── */}
            {defaultStocks.length > 0 ? (
              <div className="hidden md:block flex-1 overflow-auto">
                <table className="text-sm border-collapse" style={{ minWidth: "100%" }}>
                  <thead className="sticky top-0 bg-background border-b border-border/60 z-10">
                    <tr className="text-left text-muted-foreground whitespace-nowrap">
                      <th className="py-3 px-3 font-medium w-8 sticky left-0 bg-background z-20">#</th>
                      <th className="py-3 px-3 font-medium sticky left-8 bg-background z-20 min-w-[130px]">Symbol</th>
                      <th className="py-3 px-3 font-medium">Price</th>
                      <th className="py-3 px-3 font-medium">1D Chg%</th>
                      <th className="py-3 px-3 font-medium">Volume</th>
                      <th className="py-3 px-3 font-medium">Market Cap</th>
                      <DesktopWatchColumnHeader />
                    </tr>
                  </thead>
                  <tbody>
                    {defaultStocks.slice(0, 50).map((row, idx) => (
                      <tr key={row.symbol} className="group border-b border-border/30 even:bg-muted/15 hover:bg-muted/30 transition-colors whitespace-nowrap">
                        <td className="py-2.5 px-3 text-muted-foreground text-xs sticky left-0 bg-background">{idx + 1}</td>
                        <td className="py-2.5 px-3 sticky left-8 bg-background">
                          <span className="font-medium">{row.symbol}</span>
                          <div className="text-xs text-muted-foreground truncate max-w-[160px]">{row.name}</div>
                        </td>
                        <td className="py-2.5 px-3 font-medium tabular-nums">
                          {row.close > 0
                            ? `₹${row.close.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
                            : "—"}
                        </td>
                        <td className="py-2.5 px-3">
                          {row.close > 0 ? (
                            <span className={cn("inline-flex items-center gap-0.5 tabular-nums", row.change1d >= 0 ? "text-green-600" : "text-red-600")}>
                              {row.change1d >= 0 ? "▲" : "▼"} {Math.abs(row.change1d).toFixed(2)}%
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground tabular-nums">
                          {row.volume > 0 ? formatVolume(row.volume) : "—"}
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground tabular-nums">
                          {formatMarketCap(row.marketCap)}
                        </td>
                        <DesktopWatchColumnCell symbol={row.symbol} />
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="hidden md:flex flex-1 items-center justify-center p-8">
                <div className="text-center max-w-sm">
                  <div className="w-20 h-20 rounded-2xl bg-primary/10 ring-1 ring-border/30 flex items-center justify-center mx-auto mb-4">
                    <Search size={32} className="text-primary/60" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">Build your screener</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Add conditions using technical indicators, price, volume, candlestick patterns, and more — results
                    update automatically. <strong>Save screener</strong> to turn on alerts, a run schedule, and sharing.
                  </p>
                  {!freshness.daily && (
                    <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 leading-relaxed">
                      No candle data loaded yet. Use <strong>Refresh 1D</strong>, <strong>Refresh 15m</strong>, or{" "}
                      <strong>Refresh 1M</strong> to fetch data from Upstox into Supabase. You can still save your
                      screener; matches need fresh data to be accurate.
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        ) : isScanning ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <Loader2 size={32} className="animate-spin text-primary mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                {scanProgress?.message ?? "Running scan..."}
              </p>
              {scanProgress?.total && scanProgress.total > 0 && (
                <div className="mt-3 w-48 mx-auto">
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.round(((scanProgress.matched ?? 0) / scanProgress.total) * 100) || (scanProgress.phase === "done" ? 100 : 10)}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : scanProgress?.phase === "error" ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-sm">
              <div className="w-16 h-16 rounded-xl bg-red-50 ring-1 ring-border/30 flex items-center justify-center mx-auto mb-3">
                <X size={20} className="text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Scan failed</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{scanProgress.message}</p>
            </div>
          </div>
        ) : results.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-xs">
              <div className="w-16 h-16 rounded-xl bg-muted ring-1 ring-border/30 flex items-center justify-center mx-auto mb-3">
                <Search size={20} className="text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">No matches</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                No stocks matched your conditions. Try adjusting the parameters or relaxing some constraints.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile: card list for scan results */}
            <div className="md:hidden flex-1 overflow-y-auto divide-y divide-border/40">
              <div className="flex items-center px-4 py-2.5 border-b border-border/60 bg-muted/20 sticky top-0 z-10">
                <div className="w-7 shrink-0 text-[10px] font-medium text-muted-foreground">#</div>
                <div className="flex-1 text-[10px] font-medium text-muted-foreground">Symbol</div>
                <div className="w-24 text-right text-[10px] font-medium text-muted-foreground">Price</div>
                <div className="w-16 text-right text-[10px] font-medium text-muted-foreground">1D Chg%</div>
                <div className="w-9 shrink-0 text-center text-[10px] font-medium text-muted-foreground">Watch</div>
              </div>
              {sortedResults.map((row, idx) => (
                <div key={row.symbol} className="flex items-center px-4 py-3.5">
                  <div className="w-7 shrink-0 text-xs text-muted-foreground/50 tabular-nums">{idx + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-foreground">{row.symbol}</div>
                    <div className="text-xs text-muted-foreground truncate">{row.name}</div>
                  </div>
                  <div className="w-24 text-right">
                    <div className="text-sm font-semibold tabular-nums text-foreground">
                      ₹{row.close.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className={cn(
                    "w-16 text-right text-xs font-medium tabular-nums",
                    row.change1d >= 0 ? "text-green-500" : "text-red-500"
                  )}>
                    <div className="inline-flex items-center justify-end gap-0.5">
                      {row.change1d >= 0
                        ? <TrendingUp size={10} className="shrink-0" />
                        : <TrendingDown size={10} className="shrink-0" />}
                      {Math.abs(row.change1d).toFixed(2)}%
                    </div>
                  </div>
                  <div className="w-9 shrink-0 flex justify-center">
                    <MobileWatchPlusButton symbol={row.symbol} />
                  </div>
                </div>
              ))}
            </div>
            {/* Desktop: full table */}
            <div className="hidden md:block flex-1 overflow-auto">
            <table className="text-sm border-collapse" style={{ minWidth: "100%" }}>
              <thead className="sticky top-0 bg-background border-b border-border/60 z-10">
                <tr className="text-left text-muted-foreground whitespace-nowrap">
                  <th className="py-3 px-3 font-medium w-8 sticky left-0 bg-background z-20">#</th>
                  <th className="py-3 px-3 font-medium sticky left-8 bg-background z-20 min-w-[130px]">Symbol</th>
                  <th
                    className="py-3 px-3 font-medium cursor-pointer hover:text-foreground select-none"
                    onClick={() => {
                      if (sortBy === "close") setSortDesc(!sortDesc);
                      else { setSortBy("close"); setSortDesc(true); }
                    }}
                  >
                    Price {sortBy === "close" ? (sortDesc ? "↓" : "↑") : ""}
                  </th>
                  <th
                    className="py-3 px-3 font-medium cursor-pointer hover:text-foreground select-none"
                    onClick={() => {
                      if (sortBy === "change1d") setSortDesc(!sortDesc);
                      else { setSortBy("change1d"); setSortDesc(true); }
                    }}
                  >
                    1D Chg% {sortBy === "change1d" ? (sortDesc ? "↓" : "↑") : ""}
                  </th>
                  <th
                    className="py-3 px-3 font-medium cursor-pointer hover:text-foreground select-none"
                    onClick={() => {
                      if (sortBy === "volume") setSortDesc(!sortDesc);
                      else { setSortBy("volume"); setSortDesc(true); }
                    }}
                  >
                    Volume {sortBy === "volume" ? (sortDesc ? "↓" : "↑") : ""}
                  </th>
                  {dynamicColumns.map((col) => (
                    <th key={col.key} className="py-3 px-3 font-medium">
                      <span className="inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                        {col.label}
                      </span>
                    </th>
                  ))}
                  <DesktopWatchColumnHeader />
                </tr>
              </thead>
              <tbody>
                {sortedResults.map((row, idx) => (
                  <tr
                    key={row.symbol}
                    className="group border-b border-border/30 even:bg-muted/15 hover:bg-muted/30 transition-colors whitespace-nowrap"
                  >
                    <td className="py-2.5 px-3 text-muted-foreground text-xs sticky left-0 bg-background">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-3 sticky left-8 bg-background">
                      <div>
                        <span className="font-medium">{row.symbol}</span>
                        <div className="text-xs text-muted-foreground truncate max-w-[130px]">
                          {row.name}
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-medium tabular-nums">
                      ₹{row.close.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-0.5 tabular-nums",
                          row.change1d >= 0 ? "text-green-600" : "text-red-600"
                        )}
                      >
                        {row.change1d >= 0 ? "▲" : "▼"}{" "}
                        {Math.abs(row.change1d).toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground tabular-nums">
                      {formatVolume(row.volume)}
                    </td>
                    {dynamicColumns.map((col) => {
                      const val = row.indicatorValues?.[col.key];
                      return (
                        <td key={col.key} className="py-2.5 px-3 tabular-nums text-foreground/80">
                          {val !== undefined && val !== null
                            ? Math.abs(val) >= 1000
                              ? val.toLocaleString("en-IN", { maximumFractionDigits: 0 })
                              : Math.abs(val) >= 1
                                ? val.toFixed(2)
                                : val.toFixed(4)
                            : "—"}
                        </td>
                      );
                    })}
                    <DesktopWatchColumnCell symbol={row.symbol} />
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </>
        )}
      </div>
      </div>

      {/* Indicator sidebar — rendered at page level, outside scroll areas */}
      {uiMode === "simple" && sidebarOpen && (
        <>
          {/* Backdrop — fixed on mobile (above filter overlay), absolute on desktop */}
          <div
            className={cn(
              "inset-0",
              mobileFilterOpen ? "fixed z-[59]" : "absolute z-30"
            )}
            onClick={handleCloseIndicatorSidebar}
          />
          {/* Indicator panel — full-screen on mobile, beside-builder on desktop */}
          <div className={cn(
            "flex flex-col bg-background border-l border-border shadow-xl",
            mobileFilterOpen
              ? "fixed inset-0 z-[60]"
              : "absolute top-0 bottom-0 left-[420px] z-40 w-[520px]"
          )}>
            <div className="shrink-0 border-b border-[#E1E1E1] bg-white">
              <div className="flex items-center justify-between gap-2 px-4 pt-3 pb-2">
                <p className="text-base font-semibold text-[#262626]">Add filters</p>
                <button
                  type="button"
                  onClick={handleCloseIndicatorSidebar}
                  className="shrink-0 p-1 text-[#777777]"
                  aria-label="Close indicator picker"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="px-4 pb-3">
                <div className="relative min-w-0">
                  <Search
                    size={14}
                    className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[#777777]"
                  />
                  <Input
                    placeholder="Search all indicators..."
                    value={indicatorSearch}
                    onChange={(e) => setIndicatorSearch(e.target.value)}
                    className="h-10 w-full border-[#542087] pl-8 pr-3 focus-visible:ring-[#542087]"
                    autoFocus
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-1 min-h-0">
              <div className={cn(
                "shrink-0 overflow-y-auto border-r border-[#E1E1E1]",
                mobileFilterOpen ? "w-[38%]" : "w-[40%]"
              )}>
                <ConditionGroupSidebar
                  selectedGroup={selectedGroup}
                  onSelectGroup={setSelectedGroup}
                />
              </div>
              <div className={cn(
                "overflow-y-auto",
                mobileFilterOpen ? "flex-1" : "flex-1"
              )}>
                <IndicatorSidebar
                  open={true}
                  search={indicatorSearch}
                  onSelect={handleSidebarSelect}
                  excludePatterns={sidebarExcludePatterns}
                  activeCategories={
                    selectedGroup === "Price"
                      ? (["price"] as IndicatorCategory[])
                      : selectedGroup === "Volume & Delivery"
                        ? (["volume"] as IndicatorCategory[])
                        : selectedGroup === "Technicals"
                          ? ([
                              "moving_averages",
                              "oscillators",
                              "macd",
                              "trend",
                              "volatility",
                              "pivot",
                              "setups",
                              "divergence",
                            ] as IndicatorCategory[])
                          : selectedGroup === "Candlesticks"
                            ? (["candlestick"] as IndicatorCategory[])
                    : selectedGroup === "Universe" ||
                      selectedGroup === "Financial Ratios" ||
                      selectedGroup === "Profitability" ||
                      selectedGroup === "Income & Growth" ||
                      selectedGroup === "Balance Sheet" ||
                      selectedGroup === "Cash Flow" ||
                      selectedGroup === "Shareholding" ||
                      selectedGroup === "Valuation" ||
                      selectedGroup === "Futures & Options"
                      ? ([] as IndicatorCategory[])
                      : null
                  }
                  customItems={
                    selectedGroup === "Futures & Options"
                      ? FUTURES_OPTIONS_ITEMS.map((label) => ({
                          id: mockIndicatorId("fno", label),
                          label,
                          locked: false,
                        }))
                      : selectedGroup === "Profitability"
                        ? PROFITABILITY_ITEMS.map((label) => ({
                            id: mockIndicatorId("profitability", label),
                            label,
                            locked: false,
                          }))
                        : selectedGroup === "Income & Growth"
                          ? INCOME_GROWTH_ITEMS.map((label) => ({
                              id: mockIndicatorId("incomegrowth", label),
                              label,
                              locked: false,
                            }))
                          : selectedGroup === "Balance Sheet"
                            ? BALANCE_SHEET_ITEMS.map((label) => ({
                                id: mockIndicatorId("balancesheet", label),
                                label,
                                locked: false,
                              }))
                        : selectedGroup === "Cash Flow"
                          ? CASH_FLOW_ITEMS.map((label) => ({
                              id: mockIndicatorId("cashflow", label),
                              label,
                              locked: false,
                            }))
                          : selectedGroup === "Shareholding"
                            ? SHAREHOLDING_ITEMS.map((label) => ({
                                id: mockIndicatorId("shareholding", label),
                                label,
                                locked: false,
                              }))
                          : selectedGroup === "Valuation"
                            ? VALUATION_ITEMS.map((label) => ({
                                id: mockIndicatorId("valuation", label),
                                label,
                                locked: false,
                              }))
                            : selectedGroup === "Financial Ratios"
                              ? FINANCIAL_RATIOS_ITEMS.map((label) => ({
                                  id: mockIndicatorId("financial", label),
                                  label,
                                  locked: false,
                                }))
                            : undefined
                  }
                  disableSelection={
                    false
                  }
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Compare-with side panel — same anchor as indicator sidebar, mutually exclusive */}
      {uiMode === "simple" && compareWithOpen && compareWithRowId && compareWithRow && (
        <>
          <div
            className={cn(
              "inset-0",
              mobileFilterOpen ? "fixed z-[59]" : "absolute z-30"
            )}
            onClick={handleCloseCompareWith}
          />
          <div className={cn(
            "flex flex-col bg-background border-l border-border shadow-xl",
            mobileFilterOpen
              ? "fixed inset-0 z-[60]"
              : "absolute top-0 bottom-0 left-[420px] z-40 w-[300px]"
          )}>
            <CompareWithSidePanel
              leftIndicatorId={compareWithRow.leftIndicatorId}
              initialRightValue={
                compareWithRow.rightType === "value" ? compareWithRow.rightValue : ""
              }
              onClose={handleCloseCompareWith}
              onPickValue={(v) => {
                patchCompareWithRow({
                  rightType: "value",
                  rightIndicatorId: "",
                  rightParams: {},
                  rightValue: v,
                });
              }}
              onPickIndicator={(id) => {
                const ind = getIndicator(id);
                patchCompareWithRow({
                  rightType: "indicator",
                  rightIndicatorId: id,
                  rightParams: ind ? defaultParams(ind) : {},
                  rightValue: "",
                });
              }}
            />

          </div>
        </>
      )}

      {/* Per-condition mobile full-screen modal */}
      {mobileConditionEditId && (() => {
        const cond = simpleConditions.find((c) => c.id === mobileConditionEditId);
        if (!cond) return null;
        const ind = getIndicator(cond.leftIndicatorId);
        if (!ind) return null;
        function patchCond(patch: Partial<SimpleConditionRow>) {
          setSimpleConditions((prev) =>
            prev.map((c) => (c.id === mobileConditionEditId ? { ...c, ...patch } : c))
          );
        }
        function deleteCond() {
          setSimpleConditions((prev) => prev.filter((c) => c.id !== mobileConditionEditId));
          setMobileConditionEditId(null);
          setMobileFilterOpen(false);
          setMobilePickerResumeRowId(null);
        }
        const condIndex = simpleConditions.findIndex((c) => c.id === mobileConditionEditId);

        return (
          <>
            {/* Full-screen edit condition modal */}
            <div className="md:hidden fixed inset-0 z-[70] bg-background flex flex-col">
              {/* Header — always "Edit Condition", just X to close */}
              <div className="px-4 py-3 flex items-center gap-3 border-b border-border shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setMobileConditionEditId(null);
                    setMobileFilterOpen(false);
                    setMobilePickerResumeRowId(null);
                  }}
                  className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Close"
                >
                  <X size={15} />
                </button>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base truncate">{ind.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Edit condition</p>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-4 py-4">
                <SimpleConditionForm
                  condition={cond}
                  index={condIndex >= 0 ? condIndex : 0}
                  onChange={patchCond}
                  onDelete={deleteCond}
                  canDelete={true}
                  variant="accordion"
                  onIndicatorClick={(side) => {
                    setMobilePickerResumeRowId(cond.id);
                    setMobileConditionEditId(null);
                    handleOpenSidebar({ id: cond.id, side });
                    setMobileFilterOpen(true);
                  }}
                  onRequestCompareWith={() => setMobileConditionView("compareWith")}
                />
              </div>

              {/* Footer */}
              <div className="px-4 pt-3 pb-8 flex gap-3 border-t border-border shrink-0">
                <button
                  type="button"
                  onClick={deleteCond}
                  className="flex-1 h-11 rounded-xl border border-red-300 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors"
                >
                  Delete filter
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileConditionEditId(null);
                    setMobileFilterOpen(false);
                    setMobilePickerResumeRowId(null);
                    setMobileConditionView("form");
                  }}
                  className="flex-[2] h-11 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>

            {/* Compare-with bottom sheet — slides up ON TOP of the form modal */}
            {mobileConditionView === "compareWith" && (
              <>
                {/* Dim backdrop over the form modal */}
                <div
                  className="md:hidden fixed inset-0 z-[71] bg-black/40"
                  onClick={() => setMobileConditionView("form")}
                />
                {/* Sheet */}
                <div className="md:hidden fixed bottom-0 left-0 right-0 z-[72] bg-background rounded-t-2xl shadow-2xl flex flex-col max-h-[85vh]">
                  {/* Drag handle */}
                  <div className="flex justify-center pt-3 pb-1 shrink-0">
                    <div className="w-9 h-1 rounded-full bg-muted-foreground/30" />
                  </div>
                  {/* CompareWithSidePanel has its own "Compare with" header + X — render it directly */}
                  <div className="flex-1 overflow-y-auto">
                    <CompareWithSidePanel
                      leftIndicatorId={cond.leftIndicatorId}
                      initialRightValue={cond.rightType === "value" ? cond.rightValue : ""}
                      onClose={() => setMobileConditionView("form")}
                      onPickValue={(v) => {
                        patchCond({ rightType: "value", rightIndicatorId: "", rightParams: {}, rightValue: v });
                        setMobileConditionView("form");
                      }}
                      onPickIndicator={(id) => {
                        const picked = getIndicator(id);
                        patchCond({ rightType: "indicator", rightIndicatorId: id, rightParams: picked ? defaultParams(picked) : {}, rightValue: "" });
                        setMobileConditionView("form");
                      }}
                    />
                  </div>
                </div>
              </>
            )}
          </>
        );
      })()}

      <SaveScreenerDialog
        open={saveModalOpen}
        onOpenChange={setSaveModalOpen}
        isFirstSave={savedScreenerId === null}
        initialName={query.name}
        initialDescription={query.description ?? ""}
        initialPreferences={query.preferences ?? DEFAULT_SCREENER_PREFERENCES}
        onSubmit={handleSaveModalSubmit}
        onShare={() => void handleShareSavedScreener()}
      />
    </div>
  );
}
