import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { ConditionState, QueryState, ScanResultRow } from "@/types/screener";
import { runCustomScan, extractIndicatorColumns } from "@/lib/customScanRunner";
import { cn } from "@/lib/utils";
import { ChevronRight, Loader2, SlidersHorizontal, Zap } from "lucide-react";

type QuickIndicator = "price" | "ema" | "rsi" | "macd";

type RsiMode = "above" | "below" | "between";
type EmaSide = "above" | "below";
type MacdSide = "bullish" | "bearish";
type PriceMode = "above" | "below" | "between";

type QuickInterval = {
  id: string;
  label: string;
  engineTf: "15m" | "1d" | "1M";
  note?: string;
};

const INTERVALS: QuickInterval[] = [
  { id: "1m", label: "1 min", engineTf: "15m", note: "uses 15m data" },
  { id: "5m", label: "5 min", engineTf: "15m", note: "uses 15m data" },
  { id: "15m", label: "15 min", engineTf: "15m" },
  { id: "30m", label: "30 min", engineTf: "15m", note: "uses 15m data" },
  { id: "1d", label: "1 Day", engineTf: "1d" },
];

function uid() {
  return `q_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function makeBaseCondition(): Omit<ConditionState, "id"> {
  return {
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
    timeModifierBars: 1,
  };
}

function formatInr(n: number) {
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function formatMaybePct(n: number) {
  const up = n >= 0;
  return `${up ? "+" : ""}${n.toFixed(2)}%`;
}

function getIndicatorValueHint(indicatorId: string) {
  switch (indicatorId) {
    case "rsi":
      return "RSI";
    case "ema":
      return "EMA";
    case "macd_line":
      return "MACD";
    case "change_1d_pct":
      return "Change";
    default:
      return indicatorId;
  }
}

const DEMO_SCRIPTS: { symbol: string; name: string; ltp: number; change1d: number }[] = [
  { symbol: "JSWSTEEL", name: "JSW Steel", ltp: 432.31, change1d: 4.5 },
  { symbol: "IDFCBANK", name: "IDFC First Bank", ltp: 331.51, change1d: 4.5 },
  { symbol: "HDFCBANK", name: "HDFC Bank", ltp: 412.34, change1d: 4.5 },
  { symbol: "YESBANK", name: "Yes Bank", ltp: 7423.21, change1d: 4.5 },
  { symbol: "ICICIBANK", name: "ICICI Bank", ltp: 101.34, change1d: -0.2 },
];

function getDemoIndicatorColumnConfig({
  indicator,
  rsiPeriod,
  emaPeriod,
  macdFast,
  macdSlow,
  macdSignal,
}: {
  indicator: QuickIndicator;
  rsiPeriod: number;
  emaPeriod: number;
  macdFast: number;
  macdSlow: number;
  macdSignal: number;
}): { key: string; label: string } {
  switch (indicator) {
    case "rsi":
      return { key: `rsi_${rsiPeriod}`, label: `RSI(${rsiPeriod})` };
    case "ema":
      return { key: `ema_${emaPeriod}`, label: `EMA(${emaPeriod})` };
    case "macd":
      return { key: `macd_line_${macdFast}_${macdSlow}_${macdSignal}`, label: `MACD Line(${macdFast},${macdSlow},${macdSignal})` };
    case "price":
    default:
      return { key: "change_1d_pct", label: "1D Change %" };
  }
}

function buildDemoScanResults({
  indicator,
  rsiMode,
  rsiMin,
  rsiMax,
  emaSide,
  macdSide,
  priceMode,
  priceMin,
  priceMax,
  rsiPeriod,
  emaPeriod,
  macdFast,
  macdSlow,
  macdSignal,
}: {
  indicator: QuickIndicator;
  rsiMode: RsiMode;
  rsiMin: number;
  rsiMax: number;
  emaSide: EmaSide;
  macdSide: MacdSide;
  priceMode: PriceMode;
  priceMin: number;
  priceMax: number;
  rsiPeriod: number;
  emaPeriod: number;
  macdFast: number;
  macdSlow: number;
  macdSignal: number;
}): ScanResultRow[] {
  const col = getDemoIndicatorColumnConfig({
    indicator,
    rsiPeriod,
    emaPeriod,
    macdFast,
    macdSlow,
    macdSignal,
  });

  return DEMO_SCRIPTS.map((s, idx) => {
    let v = 0;
    if (indicator === "rsi") {
      if (rsiMode === "above") v = 72 + idx * 2;
      else if (rsiMode === "below") v = 25 + idx * 3;
      else v = rsiMin + (idx % 3) * ((rsiMax - rsiMin) / 4);
    } else if (indicator === "ema") {
      const mult = emaSide === "above" ? 1.01 : 0.99;
      v = s.ltp * mult;
    } else if (indicator === "macd") {
      v = macdSide === "bullish" ? 0.6 + idx * 0.12 : -0.55 - idx * 0.1;
    } else {
      if (priceMode === "above") v = priceMin + idx * 0.6;
      else if (priceMode === "below") v = -(priceMin + idx * 0.6);
      else v = priceMin + idx * ((priceMax - priceMin) / 4);
    }

    return {
      symbol: s.symbol,
      name: s.name,
      close: s.ltp,
      change1d: s.change1d,
      volume: 0,
      matchedGroups: 1,
      indicatorValues: { [col.key]: v },
    };
  });
}

export function QuickScannerSection() {
  const [indicator, setIndicator] = useState<QuickIndicator>("rsi");

  // RSI config (limited)
  const [rsiMode, setRsiMode] = useState<RsiMode>("below");
  const [rsiMin, setRsiMin] = useState(30);
  const [rsiMax, setRsiMax] = useState(70);
  const [rsiPeriod] = useState(14);
  const [rsiIntervalId, setRsiIntervalId] = useState<string>("15m");

  // EMA config (limited)
  const [emaSide, setEmaSide] = useState<EmaSide>("above");
  const [emaPeriod] = useState(20);
  const [emaIntervalId, setEmaIntervalId] = useState<string>("15m");

  // MACD config (limited)
  const [macdSide, setMacdSide] = useState<MacdSide>("bullish");
  const [macdFast] = useState(12);
  const [macdSlow] = useState(26);
  const [macdSignal] = useState(9);
  const [macdIntervalId, setMacdIntervalId] = useState<string>("15m");

  // Price config (limited)
  const [priceMode, setPriceMode] = useState<PriceMode>("above");
  const [priceMin, setPriceMin] = useState(1);
  const [priceMax, setPriceMax] = useState(5);
  const [priceIntervalId, setPriceIntervalId] = useState<string>("15m");

  const [filterOpen, setFilterOpen] = useState(false);

  const [isDemo, setIsDemo] = useState(true);
  const [results, setResults] = useState<ScanResultRow[]>([]);
  const [matchedHint, setMatchedHint] = useState<string>("Apply to see matches");
  const [indicatorColumnKey, setIndicatorColumnKey] = useState<string | null>(null);
  const [indicatorColumnLabel, setIndicatorColumnLabel] = useState<string>("");

  const [isApplying, setIsApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const activeFilterCount = 1;

  useEffect(() => {
    if (!isDemo) return;
    const demo = buildDemoScanResults({
      indicator,
      rsiMode,
      rsiMin,
      rsiMax,
      emaSide,
      macdSide,
      priceMode,
      priceMin,
      priceMax,
      rsiPeriod,
      emaPeriod,
      macdFast,
      macdSlow,
      macdSignal,
    });
    const colCfg = getDemoIndicatorColumnConfig({
      indicator,
      rsiPeriod,
      emaPeriod,
      macdFast,
      macdSlow,
      macdSignal,
    });
    setResults(demo);
    setMatchedHint("Demo matches");
    setIndicatorColumnKey(colCfg.key);
    setIndicatorColumnLabel(colCfg.label);
  }, [
    isDemo,
    indicator,
    rsiMode,
    rsiMin,
    rsiMax,
    emaSide,
    macdSide,
    priceMode,
    priceMin,
    priceMax,
    rsiPeriod,
    emaPeriod,
    macdFast,
    macdSlow,
    macdSignal,
  ]);

  const activeInterval = useMemo(() => {
    const all = INTERVALS;
    const intervalId =
      indicator === "rsi"
        ? rsiIntervalId
        : indicator === "ema"
          ? emaIntervalId
          : indicator === "macd"
            ? macdIntervalId
            : priceIntervalId;
    return all.find((i) => i.id === intervalId) ?? all[2];
  }, [indicator, emaIntervalId, macdIntervalId, priceIntervalId, rsiIntervalId]);

  const indicatorConfigSummary = useMemo(() => {
    if (indicator === "rsi") {
      if (rsiMode === "above") return `RSI(${rsiPeriod}) above ${rsiMax}`;
      if (rsiMode === "below") return `RSI(${rsiPeriod}) below ${rsiMin}`;
      return `RSI(${rsiPeriod}) between ${rsiMin} and ${rsiMax}`;
    }
    if (indicator === "ema") return `Close ${emaSide === "above" ? ">" : "<"} EMA(${emaPeriod})`;
    if (indicator === "macd")
      return `MACD line ${macdSide === "bullish" ? ">" : "<"} signal (MACD ${macdFast},${macdSlow},${macdSignal})`;
    if (priceMode === "above") return `1D change % above ${priceMin}%`;
    if (priceMode === "below") return `1D change % below ${priceMin}%`;
    return `1D change % between ${priceMin}% and ${priceMax}%`;
    return `Quick filter`;
  }, [indicator, emaPeriod, emaSide, macdFast, macdSide, macdSignal, macdSlow, priceMax, priceMin, priceMode, rsiMax, rsiMin, rsiMode, rsiPeriod]);

  function openFor(ind: QuickIndicator) {
    setIndicator(ind);
    setIsDemo(true);
    setFilterOpen(true);
  }

  function clearAll() {
    setIndicator("rsi");
    setRsiMode("below");
    setRsiMin(30);
    setRsiMax(70);
    setRsiIntervalId("15m");
    setEmaSide("above");
    setEmaIntervalId("15m");
    setMacdSide("bullish");
    setMacdIntervalId("15m");
    setPriceMode("above");
    setPriceMin(1);
    setPriceMax(5);
    setPriceIntervalId("15m");
    setIsDemo(true);
    setResults([]);
    setIndicatorColumnKey(null);
    setIndicatorColumnLabel("");
    setMatchedHint("Apply to see matches");
  }

  function buildQuery(): { query: QueryState; displayIndicatorId: string } {
    const baseTimeframe = activeInterval.engineTf;

    if (indicator === "rsi") {
      const op = rsiMode === "above" ? "greater_than" : rsiMode === "below" ? "less_than" : "is_between";
      const condBase = makeBaseCondition();
      const rightValue = rsiMode === "between" ? String(rsiMin) : String(rsiMode === "above" ? rsiMax : rsiMin);
      const rightValue2 = rsiMode === "between" ? String(rsiMax) : "";
      const condition: ConditionState = {
        id: uid(),
        ...condBase,
        leftIndicatorId: "rsi",
        leftParams: { period: rsiPeriod },
        operator: op,
        rightType: "value",
        rightValue,
        rightValue2,
      };

      return {
        query: {
          name: "Quick Screener",
          universe: "nifty50",
          description: "Mini screener",
          groups: [
            {
              id: uid(),
              logic: "AND",
              connector: "AND",
              timeframe: baseTimeframe,
              conditions: [condition],
            },
          ],
        },
        displayIndicatorId: "rsi",
      };
    }

    if (indicator === "ema") {
      const condition: ConditionState = {
        id: uid(),
        ...makeBaseCondition(),
        leftIndicatorId: "close",
        leftParams: {},
        operator: emaSide === "above" ? "greater_than" : "less_than",
        rightType: "indicator",
        rightIndicatorId: "ema",
        rightParams: { period: emaPeriod },
      };

      return {
        query: {
          name: "Quick Screener",
          universe: "nifty50",
          description: "Mini screener",
          groups: [
            {
              id: uid(),
              logic: "AND",
              connector: "AND",
              timeframe: baseTimeframe,
              conditions: [condition],
            },
          ],
        },
        displayIndicatorId: "ema",
      };
    }

    if (indicator === "macd") {
      const condition: ConditionState = {
        id: uid(),
        ...makeBaseCondition(),
        leftIndicatorId: "macd_line",
        leftParams: { fast: macdFast, slow: macdSlow, signal: macdSignal },
        operator: macdSide === "bullish" ? "greater_than" : "less_than",
        rightType: "indicator",
        rightIndicatorId: "macd_signal",
        rightParams: { fast: macdFast, slow: macdSlow, signal: macdSignal },
      };

      return {
        query: {
          name: "Quick Screener",
          universe: "nifty50",
          description: "Mini screener",
          groups: [
            {
              id: uid(),
              logic: "AND",
              connector: "AND",
              timeframe: baseTimeframe,
              conditions: [condition],
            },
          ],
        },
        displayIndicatorId: "macd_line",
      };
    }

    // price
    const op = priceMode === "above" ? "greater_than" : priceMode === "below" ? "less_than" : "is_between";
    const condition: ConditionState = {
      id: uid(),
      ...makeBaseCondition(),
      leftIndicatorId: "change_1d_pct",
      leftParams: {},
      operator: op,
      rightType: "value",
      rightValue: priceMode === "between" ? String(priceMin) : String(priceMin),
      rightValue2: priceMode === "between" ? String(priceMax) : "",
    };

    return {
      query: {
        name: "Quick Screener",
        universe: "nifty50",
        description: "Mini screener",
        groups: [
          {
            id: uid(),
            logic: "AND",
            connector: "AND",
            timeframe: baseTimeframe,
            conditions: [condition],
          },
        ],
      },
      displayIndicatorId: "change_1d_pct",
    };
  }

  async function apply() {
    setApplyError(null);
    setIsDemo(false);
    setIsApplying(true);
    try {
      const { query, displayIndicatorId } = buildQuery();
      const cols = extractIndicatorColumns(query);
      const col = cols.find((c) => c.indicatorId === displayIndicatorId);
      setIndicatorColumnKey(col?.key ?? null);
      setIndicatorColumnLabel(col?.label ?? getIndicatorValueHint(displayIndicatorId));
      const matches = await runCustomScan(query);
      setResults(matches.slice(0, 8));
      setMatchedHint(`${matches.length} match${matches.length === 1 ? "" : "es"} found`);
    } catch (e) {
      setApplyError(e instanceof Error ? e.message : String(e));
      setResults([]);
      setMatchedHint("Could not run quick scan");
    } finally {
      setIsApplying(false);
    }
  }

  const quickTabs: { key: QuickIndicator; label: string }[] = [
    { key: "price", label: "Price" },
    { key: "ema", label: "EMA" },
    { key: "rsi", label: "RSI" },
    { key: "macd", label: "MACD" },
  ];

  return (
    <div className="mb-5" aria-label="Quick scanner">
      <Card className="w-full max-w-[360px] bg-white rounded-2xl shadow-[0_2px_8px_rgba(158,144,99,0.16)]">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-[16px] font-semibold text-foreground">Quick Screener</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Mini filter for beginners: one idea, fast matches.
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-0 text-xs font-semibold text-[#777777] hover:text-[#262626]"
              onClick={clearAll}
              disabled={isApplying}
            >
              Clear All
            </Button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-3 px-3 scrollbar-none">
            <button
              type="button"
              onClick={() => setFilterOpen(true)}
              className={cn(
                "relative shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-foreground text-background border border-foreground/10 transition-colors",
                activeFilterCount > 0 ? "" : "opacity-90"
              )}
            >
              <SlidersHorizontal size={16} />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-background text-foreground text-[10px] font-bold flex items-center justify-center leading-none border border-border/60">
                {activeFilterCount}
              </span>
            </button>

            {quickTabs.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => openFor(t.key)}
                className={cn(
                  "shrink-0 h-7 px-3 rounded-[6px] border text-[12px] font-semibold whitespace-nowrap transition-colors",
                  indicator === t.key
                    ? "bg-[#FBF8FD] border-[#542087] text-[#542087]"
                    : "bg-white border-[#E1E1E1] text-[#262626] hover:bg-muted/30"
                )}
              >
                {t.label}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setFilterOpen(true)}
              className="shrink-0 h-7 px-3 rounded-[6px] border border-dashed border-[#E1E1E1] text-[12px] font-semibold text-[#777777] whitespace-nowrap hover:bg-muted/30 transition-colors"
            >
              + Add filter
            </button>
          </div>

          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="min-w-0">
              <p className="text-[12px] font-bold text-[#777777] uppercase tracking-wider">CURRENT FILTER</p>
              <p className="text-[14px] font-bold text-foreground truncate">{indicatorConfigSummary}</p>
              {activeInterval.note && (
                <p className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2 py-0.5 mt-1">
                  Note: {activeInterval.note}
                </p>
              )}
            </div>
            <Button
              onClick={() => setFilterOpen(true)}
              className="shrink-0 bg-[#542087] text-white hover:bg-[#4A1D79] h-10 rounded-[6px] px-5"
              size="sm"
              type="button"
              disabled={isApplying}
            >
              Filters
            </Button>
          </div>

          {/* Results list (no outer table border to match Intraday layout) */}
          <div className="bg-white">
            {isApplying ? (
              <div className="flex items-center justify-center p-6 text-muted-foreground gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Running quick scan...
              </div>
            ) : !isDemo && results.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground">{matchedHint}</div>
            ) : (
              <div className="divide-y divide-[#F1F1F1] bg-white">
                {results.map((r) => {
                  const v = indicatorColumnKey ? r.indicatorValues[indicatorColumnKey] ?? 0 : 0;
                  const showCurrency = indicatorColumnLabel.toLowerCase().includes("ema") || indicatorColumnLabel.toLowerCase().includes("price");
                  const showAsPct = indicatorColumnLabel.toLowerCase().includes("change");
                  return (
                    <div
                      key={r.symbol}
                      className="flex items-center gap-2 px-3 h-[52px] transition-colors"
                    >
                      <div className="w-1/2 min-w-0 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-[6px] bg-[#FBF8FD] flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold text-primary">{r.symbol.slice(0, 2)}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{r.symbol}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{r.name}</p>
                        </div>
                      </div>
                      <div className="w-1/4 text-right">
                        <p className="text-sm font-semibold tabular-nums text-foreground">
                          {formatInr(r.close)}
                        </p>
                      </div>
                      <div className="w-1/4 text-right">
                        <p className="text-sm font-semibold tabular-nums text-foreground">
                          {showAsPct ? formatMaybePct(Number(v)) : showCurrency ? formatInr(Number(v)) : Number(v).toFixed(2)}
                        </p>
                      </div>
                      <div className="shrink-0 pl-1">
                        <Link
                          to={`/scanners/${getDefaultScannerIdForIndicator(indicator, r.symbol)}`}
                          className="text-primary/80"
                          aria-label={`Open scanner for ${r.symbol}`}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {applyError && (
            <p className="text-xs text-destructive mt-3 bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
              {applyError}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Filter dialog */}
      <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
        <DialogContent className="p-0 sm:max-w-lg">
          <div className="px-4 pt-4 pb-3 border-b border-border/60 bg-background">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-lg capitalize">
                {indicator === "price" ? "Price" : indicator === "ema" ? "EMA" : indicator === "rsi" ? "RSI" : "MACD"} Filter
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Pick a condition and interval length. Quick scan uses Nifty 50 for speed.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="px-4 py-4 space-y-4">
            {indicator === "rsi" && (
              <RsiFilter
                mode={rsiMode}
                min={rsiMin}
                max={rsiMax}
                period={rsiPeriod}
                onChangeMode={setRsiMode}
                onChangeMin={setRsiMin}
                onChangeMax={setRsiMax}
              />
            )}

            {indicator === "ema" && (
              <EmaFilter side={emaSide} onChangeSide={setEmaSide} period={emaPeriod} />
            )}

            {indicator === "macd" && (
              <MacdFilter side={macdSide} onChangeSide={setMacdSide} fast={macdFast} slow={macdSlow} signal={macdSignal} />
            )}

            {indicator === "price" && (
              <PriceFilter
                mode={priceMode}
                min={priceMin}
                max={priceMax}
                onChangeMode={setPriceMode}
                onChangeMin={setPriceMin}
                onChangeMax={setPriceMax}
              />
            )}

            <IntervalPicker
              value={
                indicator === "rsi"
                  ? rsiIntervalId
                  : indicator === "ema"
                    ? emaIntervalId
                    : indicator === "macd"
                      ? macdIntervalId
                      : priceIntervalId
              }
              onChange={(v) => {
                if (indicator === "rsi") setRsiIntervalId(v);
                else if (indicator === "ema") setEmaIntervalId(v);
                else if (indicator === "macd") setMacdIntervalId(v);
                else setPriceIntervalId(v);
              }}
            />
          </div>

          <div className="px-4 pb-4">
            <Button
              onClick={() => void apply()}
              className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
              disabled={isApplying}
            >
              {isApplying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
            </Button>
            <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
              Results update after scan completes. Intraday intervals map to 15-minute candle data.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function IntervalPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-foreground">Interval length</p>
      <div className="flex gap-2 flex-wrap">
        {INTERVALS.map((i) => {
          const active = i.id === value;
          return (
            <button
              key={i.id}
              type="button"
              onClick={() => onChange(i.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                active ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-foreground/80 hover:bg-muted/30"
              )}
            >
              {i.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RsiFilter({
  mode,
  min,
  max,
  period,
  onChangeMode,
  onChangeMin,
  onChangeMax,
}: {
  mode: RsiMode;
  min: number;
  max: number;
  period: number;
  onChangeMode: (m: RsiMode) => void;
  onChangeMin: (v: number) => void;
  onChangeMax: (v: number) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-bold text-foreground">RSI Condition</p>
      <div className="space-y-2">
        {[
          { key: "above" as const, label: `Above 70 (Overbought)` },
          { key: "below" as const, label: `Below 30 (Oversold)` },
          { key: "between" as const, label: "Is between" },
        ].map((opt) => (
          <label key={opt.key} className="flex items-center gap-2 text-sm text-foreground/90">
            <input
              type="radio"
              checked={mode === opt.key}
              onChange={() => onChangeMode(opt.key)}
              className="accent-primary"
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
      {mode === "between" ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground font-medium">Min Value</p>
            <Input type="number" value={min} onChange={(e) => onChangeMin(Number(e.target.value))} />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground font-medium">Max Value</p>
            <Input type="number" value={max} onChange={(e) => onChangeMax(Number(e.target.value))} />
          </div>
        </div>
      ) : null}
      {mode !== "between" ? (
        <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Uses RSI({period}) with the default thresholds for quick screening.
          </p>
        </div>
      ) : null}
    </div>
  );
}

function EmaFilter({
  side,
  onChangeSide,
  period,
}: {
  side: EmaSide;
  onChangeSide: (s: EmaSide) => void;
  period: number;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-bold text-foreground">EMA Condition</p>
      <div className="space-y-2">
        {[
          { key: "above" as const, label: `Price above EMA(${period})` },
          { key: "below" as const, label: `Price below EMA(${period})` },
        ].map((opt) => (
          <label key={opt.key} className="flex items-center gap-2 text-sm text-foreground/90">
            <input
              type="radio"
              checked={side === opt.key}
              onChange={() => onChangeSide(opt.key)}
              className="accent-primary"
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function MacdFilter({
  side,
  onChangeSide,
  fast,
  slow,
  signal,
}: {
  side: MacdSide;
  onChangeSide: (s: MacdSide) => void;
  fast: number;
  slow: number;
  signal: number;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-bold text-foreground">MACD Condition</p>
      <div className="space-y-2">
        {[
          { key: "bullish" as const, label: `MACD line > Signal (bullish)` },
          { key: "bearish" as const, label: `MACD line < Signal (bearish)` },
        ].map((opt) => (
          <label key={opt.key} className="flex items-center gap-2 text-sm text-foreground/90">
            <input
              type="radio"
              checked={side === opt.key}
              onChange={() => onChangeSide(opt.key)}
              className="accent-primary"
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
      <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Params: MACD({fast},{slow},{signal})
        </p>
      </div>
    </div>
  );
}

function PriceFilter({
  mode,
  min,
  max,
  onChangeMode,
  onChangeMin,
  onChangeMax,
}: {
  mode: PriceMode;
  min: number;
  max: number;
  onChangeMode: (m: PriceMode) => void;
  onChangeMin: (v: number) => void;
  onChangeMax: (v: number) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-bold text-foreground">Price Condition</p>
      <div className="space-y-2">
        {[
          { key: "above" as const, label: "Above threshold" },
          { key: "below" as const, label: "Below threshold" },
          { key: "between" as const, label: "Is between" },
        ].map((opt) => (
          <label key={opt.key} className="flex items-center gap-2 text-sm text-foreground/90">
            <input
              type="radio"
              checked={mode === opt.key}
              onChange={() => onChangeMode(opt.key)}
              className="accent-primary"
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
      {mode === "between" ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground font-medium">Min %</p>
            <Input type="number" value={min} onChange={(e) => onChangeMin(Number(e.target.value))} />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground font-medium">Max %</p>
            <Input type="number" value={max} onChange={(e) => onChangeMax(Number(e.target.value))} />
          </div>
        </div>
      ) : (
        <div className="space-y-1">
          <p className="text-[10px] text-muted-foreground font-medium">
            Threshold % {mode === "below" ? "(e.g. 0)" : "(e.g. 1)"}
          </p>
          <Input type="number" value={min} onChange={(e) => onChangeMin(Number(e.target.value))} />
        </div>
      )}
    </div>
  );
}

// We only have scanner detail pages for pre-built scanners, so we map quick types to a relevant one.
function getDefaultScannerIdForIndicator(ind: QuickIndicator, _symbol: string) {
  switch (ind) {
    case "rsi":
      return "intraday-rsi-oversold";
    case "ema":
      return "moving-average-bounce";
    case "macd":
      return "golden-crossover";
    case "price":
    default:
      return "gap-up-opening";
  }
}

