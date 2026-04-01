import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { ConditionState, QueryState, ScanResultRow } from "@/types/screener";
import { runCustomScan } from "@/lib/customScanRunner";
import { cn } from "@/lib/utils";
import { BellRing, Check, ChevronRight, Loader2, Pencil, Search, Share2, SlidersHorizontal, X, Zap } from "lucide-react";
import { INDICATORS, type IndicatorDef } from "@/data/indicators";

type QuickIndicator = "price" | "ema" | "rsi" | "macd";

type RsiMode = "above" | "below" | "between";
type EmaSide = "above" | "below";
type MacdSide = "bullish" | "bearish";
type PriceMode = "above" | "below" | "between";
type ValuationCriteriaMode = "higher_than_industry" | "lower_than_industry" | "custom";
type IncomeGrowthCriteriaMode = "higher_than_benchmark" | "lower_than_benchmark" | "custom";
type BalanceSheetCriteriaMode = "higher_than_benchmark" | "lower_than_benchmark" | "custom";

type QuickInterval = {
  id: string;
  label: string;
  engineTf: "15m" | "1d" | "1M";
  note?: string;
};

type ValuationCriteria = {
  mode: ValuationCriteriaMode;
  benchmarkLabel: string;
  marginPercent: number;
  maLength: 10 | 20 | 50;
  averageVolumeWindow: "20D" | "1 Week" | "1 Month" | "3 Months";
  value: number;
  min: number;
  max: number;
};

type IncomeGrowthCriteria = {
  mode: IncomeGrowthCriteriaMode;
  benchmarkLabel: string;
  value: number;
  min: number;
  max: number;
};

type BalanceSheetCriteria = {
  mode: BalanceSheetCriteriaMode;
  benchmarkLabel: string;
  value: number;
  min: number;
  max: number;
};

type TechnicalCriteriaMode = "higher_than" | "lower_than" | "custom";

/** Benchmark target for Higher/Lower rules (aligned with other fundamental bottom sheets). */
type TechnicalBenchmarkKind =
  | "underlying_price"
  | "sma"
  | "ema"
  | "wma"
  | "value_rs"
  | "value_level"
  | "macd_signal"
  | "zero_line";

type UnderlyingPriceField = "close" | "open" | "high" | "low";

type TechnicalCriteria = {
  timeframeId: string;
  paramValues: Record<string, number>;
  paramSelect: Record<string, string>;
  mode: TechnicalCriteriaMode;
  technicalBenchmarkKind: TechnicalBenchmarkKind;
  underlyingPriceField: UnderlyingPriceField;
  /** Length for benchmark SMA / EMA / WMA (9, 20, 21, 50, 100, 200). */
  benchmarkOtherLength: number;
  value: number;
  min: number;
  max: number;
};

export type QuickScreenerSnapshot = {
  indicator: QuickIndicator;
  rsiMode: RsiMode;
  rsiMin: number;
  rsiMax: number;
  rsiIntervalId: string;
  emaSide: EmaSide;
  emaIntervalId: string;
  macdSide: MacdSide;
  macdIntervalId: string;
  priceMode: PriceMode;
  priceMin: number;
  priceMax: number;
  priceIntervalId: string;
  candlestickFilters: string[];
  valuationFilters: string[];
  incomeGrowthFilters: string[];
  balanceSheetFilters: string[];
  technicalFilters: string[];
  candlestickCriteriaByIndicator: Record<string, { timeframeId: string }>;
  valuationCriteriaByIndicator: Record<string, ValuationCriteria>;
  incomeGrowthCriteriaByIndicator: Record<string, IncomeGrowthCriteria>;
  balanceSheetCriteriaByIndicator: Record<string, BalanceSheetCriteria>;
  technicalCriteriaByIndicator: Record<string, TechnicalCriteria>;
};

type QuickScannerSectionProps = {
  fullScreen?: boolean;
  initialState?: QuickScreenerSnapshot;
};

const TECHNICAL_MA_BENCHMARK_LENGTHS = [9, 20, 21, 50, 100, 200] as const;

const DEFAULT_TECHNICAL_CRITERIA: TechnicalCriteria = {
  timeframeId: "15m",
  paramValues: {},
  paramSelect: {},
  mode: "higher_than",
  technicalBenchmarkKind: "underlying_price",
  underlyingPriceField: "close",
  benchmarkOtherLength: 20,
  value: 0,
  min: 0,
  max: 100,
};

type TechnicalBenchmarkUiStyle = "moving_average" | "macd" | "pivot_or_volume" | "value_only";

function getTechnicalBenchmarkUiStyle(def: IndicatorDef): TechnicalBenchmarkUiStyle {
  if (def.category === "moving_averages") return "moving_average";
  if (def.category === "macd") return "macd";
  if (def.category === "pivot" || def.category === "volume") return "pivot_or_volume";
  return "value_only";
}

function defaultBenchmarkKindForDef(def: IndicatorDef): TechnicalBenchmarkKind {
  const style = getTechnicalBenchmarkUiStyle(def);
  if (style === "moving_average") return "underlying_price";
  if (style === "macd") return "macd_signal";
  if (style === "pivot_or_volume") return "underlying_price";
  return "value_level";
}

function formatTechnicalBenchmarkSummary(c: TechnicalCriteria, _def: IndicatorDef): string {
  switch (c.technicalBenchmarkKind) {
    case "underlying_price": {
      const pf = c.underlyingPriceField;
      return pf.charAt(0).toUpperCase() + pf.slice(1);
    }
    case "sma":
      return `SMA (${c.benchmarkOtherLength})`;
    case "ema":
      return `EMA (${c.benchmarkOtherLength})`;
    case "wma":
      return `WMA (${c.benchmarkOtherLength})`;
    case "value_rs":
      return `₹${c.value}`;
    case "value_level":
      return `${c.value}`;
    case "macd_signal":
      return "MACD Signal";
    case "zero_line":
      return "Zero line";
    default:
      return `${c.value}`;
  }
}

function allowedBenchmarkKindsForStyle(style: TechnicalBenchmarkUiStyle): TechnicalBenchmarkKind[] {
  switch (style) {
    case "moving_average":
      return ["underlying_price", "sma", "ema", "wma", "value_rs"];
    case "macd":
      return ["macd_signal", "zero_line", "value_level"];
    case "pivot_or_volume":
      return ["underlying_price", "value_rs"];
    case "value_only":
      return ["value_level"];
  }
}

function sanitizeTechnicalCriteriaForDef(c: TechnicalCriteria, def: IndicatorDef): TechnicalCriteria {
  const style = getTechnicalBenchmarkUiStyle(def);
  const allowed = allowedBenchmarkKindsForStyle(style);
  let technicalBenchmarkKind = c.technicalBenchmarkKind;
  if (!allowed.includes(technicalBenchmarkKind)) {
    technicalBenchmarkKind = defaultBenchmarkKindForDef(def);
  }
  const allowedLengths = TECHNICAL_MA_BENCHMARK_LENGTHS as readonly number[];
  const benchmarkOtherLength = allowedLengths.includes(c.benchmarkOtherLength) ? c.benchmarkOtherLength : 20;
  const uf = c.underlyingPriceField;
  const underlyingPriceField: UnderlyingPriceField =
    uf === "open" || uf === "high" || uf === "low" || uf === "close" ? uf : "close";
  return { ...c, technicalBenchmarkKind, benchmarkOtherLength, underlyingPriceField };
}

function getTechnicalIndicatorDef(label: string): IndicatorDef {
  const found = INDICATORS.find((i) => i.name === label);
  if (found) return found;
  return {
    id: `quick_placeholder:${label}`,
    name: label,
    category: "oscillators",
    params: [
      { key: "n", label: "Lookback (n)", type: "number", defaultValue: 20, min: 1, max: 500 },
    ],
    outputType: "numeric",
  };
}

function buildDefaultTechnicalCriteria(def: IndicatorDef): TechnicalCriteria {
  const paramValues: Record<string, number> = {};
  const paramSelect: Record<string, string> = {};
  for (const p of def.params) {
    if (p.type === "number") paramValues[p.key] = p.defaultValue;
    if (p.type === "select") paramSelect[p.key] = p.defaultValue;
  }
  return {
    ...DEFAULT_TECHNICAL_CRITERIA,
    technicalBenchmarkKind: defaultBenchmarkKindForDef(def),
    paramValues,
    paramSelect,
  };
}

function mergeTechnicalCriteria(saved: TechnicalCriteria | undefined, def: IndicatorDef): TechnicalCriteria {
  const base = buildDefaultTechnicalCriteria(def);
  const merged = !saved
    ? base
    : {
        ...base,
        timeframeId: saved.timeframeId,
        mode: saved.mode,
        value: saved.value,
        min: saved.min,
        max: saved.max,
        technicalBenchmarkKind: saved.technicalBenchmarkKind ?? base.technicalBenchmarkKind,
        underlyingPriceField: saved.underlyingPriceField ?? base.underlyingPriceField,
        benchmarkOtherLength: saved.benchmarkOtherLength ?? base.benchmarkOtherLength,
        paramValues: { ...base.paramValues, ...saved.paramValues },
        paramSelect: { ...base.paramSelect, ...saved.paramSelect },
      };
  return sanitizeTechnicalCriteriaForDef(merged, def);
}

const INTERVALS: QuickInterval[] = [
  { id: "1m", label: "1 min", engineTf: "15m", note: "uses 15m data" },
  { id: "5m", label: "5 min", engineTf: "15m", note: "uses 15m data" },
  { id: "15m", label: "15 min", engineTf: "15m" },
  { id: "30m", label: "30 min", engineTf: "15m", note: "uses 15m data" },
  { id: "1d", label: "1 Day", engineTf: "1d" },
];

const PICKER_GROUPS = [
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
] as const;

const PICKER_ITEMS: Record<string, string[]> = {
  Universe: ["NSE ALL", "NIFTY 50", "NIFTY 100", "NIFTY 500"],
  Price: [
    "Close",
    "Open",
    "High",
    "Low",
    "Previous Close",
    "Previous High",
    "Previous Low",
    "52-Week High",
    "52-Week Low",
    "1D Change %",
    "1W Change %",
    "1M Change %",
    "% from SMA",
    "% from EMA",
    "% from 52W High",
    "% from 52W Low",
    "Close Position in Range %",
    "Opening Range High",
    "Opening Range Low",
  ],
  /** Flat list unused when `TECHNICAL_SECTIONS` drives the catalog for Technicals */
  Technicals: [],
  "Volume & Delivery": [
    "Volume",
    "Volume SMA",
    "Volume EMA",
    "OBV",
    "VWAP",
    "Delivery %",
    "Relative Volume",
    "Chaikin Money Flow",
    "Accumulation/Distribution",
    "Volume ROC",
  ],
  Candlesticks: [
    "Doji",
    "Hammer",
    "Inverted Hammer",
    "Spinning Top",
    "Marubozu",
    "Hanging Man",
    "Shooting Star",
    "Bullish Engulfing",
    "Bearish Engulfing",
    "Piercing Line",
    "Dark Cloud Cover",
    "Bullish Harami",
    "Bearish Harami",
    "Tweezer Top",
    "Tweezer Bottom",
    "Morning Star",
    "Evening Star",
    "Three White Soldiers",
    "Three Black Crows",
    "Three Inside Up",
    "Three Inside Down",
  ],
  "Financial Ratios": [
    "Return on Equity (ROE)",
    "Return on Capital Employed (ROCE)",
    "Return on Assets (ROA)",
    "Return on Invested Capital (ROIC)",
    "Debt to Equity",
    "Financial Leverage",
    "Quick Ratio",
    "Asset Turnover Ratio",
    "Inventory Turnover Ratio",
    "Book Value",
    "Piotroski Score",
  ],
  Profitability: [
    "Gross Profit Margin (GPM)",
    "Operating Profit Margin (OPM)",
    "Net Profit Margin (NPM)",
    "Operating Profit",
    "EBITDA",
    "EBIT",
    "Profit Before Tax",
    "Profit After Tax",
    "Net Profit",
    "EPS",
  ],
  "Income & Growth": [
    "Revenue (TTM)",
    "Profit After Tax (TTM)",
    "EPS (TTM)",
    "Revenue (Latest Quarter)",
    "Profit After Tax (Latest Quarter)",
    "EPS (Latest Quarter)",
    "Revenue Growth (TTM)",
    "Profit Growth (TTM)",
    "EPS Growth (TTM)",
    "Revenue Growth (3Y CAGR)",
    "Profit Growth (3Y CAGR)",
    "EPS Growth (3Y CAGR)",
    "Revenue Growth (5Y CAGR)",
    "Profit Growth (5Y CAGR)",
    "EPS Growth (5Y CAGR)",
    "Quarterly sales growth (YoY)",
    "Quarterly profit growth (YoY)",
    "Change in promoter holding",
  ],
  "Balance Sheet": [
    "Debt",
    "Working capital",
    "Total Assets",
    "Current assets",
    "Current liabilities",
    "Cash Equivalents",
    "Inventory",
    "Trade receivables",
    "Trade Payables",
    "Net block",
    "Investments",
    "Contingent liabilities",
  ],
  "Cash Flow": [
    "Operating Cash Flow (TTM)",
    "Free Cash Flow (TTM)",
    "Cash from Investing (TTM)",
    "Cash from Financing (TTM)",
    "Net Cash Flow (TTM)",
    "Cash & Cash Equivalents",
  ],
  Shareholding: [
    "Promoter holding",
    "FII holding",
    "DII holding",
    "Public holding",
    "Change in FII holding",
    "Change in DII holding",
    "Change in Promoter Holding",
    "Unpledged promoter holding",
    "Pledged percentage",
    "Number of Shareholders",
    "Number of Shareholders preceding quarter",
    "Number of Shareholders 1year back",
    "Change in FII holding 3Years",
    "Change in DII holding 3Years",
  ],
  Valuation: [
    "PE (TTM)",
    "Forward PE",
    "PB",
    "Price/ Sales",
    "Dividend Yield",
    "Divident Payout Ratio",
    "Return on Assets",
    "Return on Equity",
    "ROCE",
    "EV/ EBIDTA",
  ],
  "Futures & Options": ["OI Change", "Put-Call Ratio", "Max Pain"],
};

const INCOME_GROWTH_SECTIONS: Array<{ title: string; items: string[] }> = [
  {
    title: "Core TTM Metrics",
    items: ["Revenue (TTM)", "Profit After Tax (TTM)", "EPS (TTM)"],
  },
  {
    title: "Latest Quarter Metrics",
    items: [
      "Revenue (Latest Quarter)",
      "Profit After Tax (Latest Quarter)",
      "EPS (Latest Quarter)",
    ],
  },
  {
    title: "TTM Growth Rates",
    items: ["Revenue Growth (TTM)", "Profit Growth (TTM)", "EPS Growth (TTM)"],
  },
  {
    title: "CAGR Growth (3Y / 5Y)",
    items: [
      "Revenue Growth (3Y CAGR)",
      "Profit Growth (3Y CAGR)",
      "EPS Growth (3Y CAGR)",
      "Revenue Growth (5Y CAGR)",
      "Profit Growth (5Y CAGR)",
      "EPS Growth (5Y CAGR)",
    ],
  },
  {
    title: "Quarterly Growth (YoY)",
    items: ["Quarterly sales growth (YoY)", "Quarterly profit growth (YoY)"],
  },
  {
    title: "Ownership Trend",
    items: ["Change in promoter holding"],
  },
];

/** Technicals: sectioned like DIY desktop indicator sidebar (Popular first, then families). */
const TECHNICAL_SECTIONS: Array<{ title: string; items: string[] }> = [
  {
    title: "Popular",
    items: [
      "SMA",
      "EMA",
      "RSI",
      "MACD Line",
      "Bollinger Middle",
      "ADX",
      "CCI",
      "MFI",
      "Supertrend",
      "ATR",
      "VWAP",
    ],
  },
  {
    title: "Moving Averages",
    items: ["SMA", "EMA", "WMA", "Hull MA", "VWMA", "DEMA", "TEMA"],
  },
  {
    title: "Oscillators",
    items: [
      "RSI",
      "Stochastic %K",
      "Stochastic %D",
      "StochRSI %K",
      "StochRSI %D",
      "Williams %R",
      "CCI",
      "ROC",
      "MFI",
    ],
  },
  {
    title: "MACD",
    items: ["MACD Line", "MACD Signal", "MACD Histogram"],
  },
  {
    title: "Trend",
    items: [
      "ADX",
      "+DI",
      "-DI",
      "Parabolic SAR",
      "Ichimoku Tenkan",
      "Ichimoku Kijun",
      "Ichimoku Senkou A",
      "Ichimoku Senkou B",
      "Aroon Up",
      "Aroon Down",
    ],
  },
  {
    title: "Volatility",
    items: [
      "Bollinger Upper",
      "Bollinger Middle",
      "Bollinger Lower",
      "Bollinger Bandwidth",
      "Bollinger %B",
      "ATR",
      "ATR %",
      "Supertrend",
      "Keltner Upper",
      "Keltner Lower",
      "Donchian Upper",
      "Donchian Lower",
      "Historical Volatility",
      "Lowest BB Width over n candles",
      "Lowest ATR Width over n candles",
    ],
  },
  {
    title: "Pivot Levels",
    items: [
      "Pivot Point",
      "Pivot R1",
      "Pivot R2",
      "Pivot R3",
      "Pivot S1",
      "Pivot S2",
      "Pivot S3",
      "Camarilla R1",
      "Camarilla R2",
      "Camarilla R3",
      "Camarilla R4",
      "Camarilla S1",
      "Camarilla S2",
      "Camarilla S3",
      "Camarilla S4",
      "CPR Upper",
      "CPR Lower",
      "CPR Width %",
    ],
  },
];

function getFlatPickerItemsForGroup(group: string): string[] {
  if (group === "Technicals") return TECHNICAL_SECTIONS.flatMap((s) => s.items);
  if (group === "Income & Growth") return INCOME_GROWTH_SECTIONS.flatMap((s) => s.items);
  return PICKER_ITEMS[group] ?? [];
}

const DEFAULT_VALUATION_CRITERIA: ValuationCriteria = {
  mode: "higher_than_industry",
  benchmarkLabel: "Industry benchmark",
  marginPercent: 15,
  maLength: 20,
  averageVolumeWindow: "20D",
  value: 0,
  min: 0,
  max: 0,
};

const DEFAULT_INCOME_GROWTH_CRITERIA: IncomeGrowthCriteria = {
  mode: "higher_than_benchmark",
  benchmarkLabel: "Last FY",
  value: 0,
  min: 0,
  max: 0,
};

const DEFAULT_BALANCE_SHEET_CRITERIA: BalanceSheetCriteria = {
  mode: "higher_than_benchmark",
  benchmarkLabel: "Preceding year",
  value: 0,
  min: 0,
  max: 0,
};

const CANDLESTICK_INTERVALS: Array<{ id: string; label: string }> = [
  { id: "1m", label: "1 min" },
  { id: "5m", label: "5 min" },
  { id: "15m", label: "15 min" },
  { id: "30m", label: "30 mins" },
  { id: "1d", label: "1 Day" },
];

const INDUSTRY_COMPARISON_VALUATION_INDICATORS = new Set<string>([
  "PE (TTM)",
  "Forward PE",
  "PB",
  "Price/ Sales",
  "Dividend Yield",
]);

const SHAREHOLDING_DIRECT_VALUE_ONLY = new Set<string>([
  "Change in Promoter Holding",
  "Change in FII holding",
  "Change in DII holding",
]);

function getIncomeGrowthCompareTargets(indicatorLabel: string | null): string[] {
  if (!indicatorLabel) return [];
  switch (indicatorLabel) {
    // Absolute levels
    case "Revenue (TTM)":
      return ["Revenue (Last FY)", "Revenue (Prev FY)"];
    case "Profit After Tax (TTM)":
      return ["Profit After Tax (Last FY)", "Profit After Tax (Prev FY)"];
    case "EPS (TTM)":
      return ["EPS (Last FY)", "EPS (Prev FY)"];
    case "Revenue (Latest Quarter)":
      return ["Revenue (Preceding Quarter)", "Revenue (Year-ago Quarter)"];
    case "Profit After Tax (Latest Quarter)":
      return ["Profit After Tax (Preceding Quarter)", "Profit After Tax (Year-ago Quarter)"];
    case "EPS (Latest Quarter)":
      return ["EPS (Preceding Quarter)", "EPS (Year-ago Quarter)"];

    // Growth metrics
    case "Revenue Growth (TTM)":
      return ["Revenue Growth (3Y CAGR)", "Revenue Growth (5Y CAGR)"];
    case "Profit Growth (TTM)":
      return ["Profit Growth (3Y CAGR)", "Profit Growth (5Y CAGR)"];
    case "EPS Growth (TTM)":
      return ["EPS Growth (3Y CAGR)", "EPS Growth (5Y CAGR)"];
    case "Revenue Growth (3Y CAGR)":
      return ["Revenue Growth (TTM)", "Revenue Growth (5Y CAGR)"];
    case "Profit Growth (3Y CAGR)":
      return ["Profit Growth (TTM)", "Profit Growth (5Y CAGR)"];
    case "EPS Growth (3Y CAGR)":
      return ["EPS Growth (TTM)", "EPS Growth (5Y CAGR)"];
    case "Revenue Growth (5Y CAGR)":
      return ["Revenue Growth (TTM)", "Revenue Growth (3Y CAGR)"];
    case "Profit Growth (5Y CAGR)":
      return ["Profit Growth (TTM)", "Profit Growth (3Y CAGR)"];
    case "EPS Growth (5Y CAGR)":
      return ["EPS Growth (TTM)", "EPS Growth (3Y CAGR)"];
    case "Quarterly sales growth (YoY)":
      return ["Revenue Growth (TTM)", "Revenue Growth (3Y CAGR)"];
    case "Quarterly profit growth (YoY)":
      return ["Profit Growth (TTM)", "Profit Growth (3Y CAGR)"];

    // Margins
    case "Operating margin (OPM)":
      return ["Operating margin (latest quarter)", "Operating margin (Last FY)"];
    case "Net margin (NPM)":
      return ["Net margin (latest quarter)", "Net margin (Last FY)"];
    case "Operating margin (latest quarter)":
      return ["Operating margin (OPM)", "Operating margin (Last FY)"];
    case "Net margin (latest quarter)":
      return ["Net margin (NPM)", "Net margin (Last FY)"];
    default:
      return [];
  }
}

function getIncomeGrowthValueUnit(indicatorLabel: string | null): "%" | "₹ Cr" {
  if (!indicatorLabel) return "%";
  const normalized = indicatorLabel.toLowerCase();
  if (normalized.includes("revenue (ttm)") || normalized.includes("profit after tax (ttm)") || normalized.includes("latest quarter")) {
    if (normalized.includes("growth") || normalized.includes("margin") || normalized.includes("yoy")) return "%";
    return "₹ Cr";
  }
  return "%";
}

function getBalanceSheetCompareTargets(indicatorLabel: string | null): string[] {
  if (!indicatorLabel) return ["Preceding year"];
  switch (indicatorLabel) {
    case "Debt":
      return ["Debt preceding year", "Debt 3Years back", "Debt 5Years back"];
    case "Working capital":
      return ["Working capital preceding year", "Working capital 3Years back", "Working capital 5Years back"];
    case "Net block":
      return ["Net block preceding year", "Net block 3Years back", "Net block 5Years back"];
    case "Gross block":
      return ["Gross block preceding year"];
    case "Capital work in progress":
      return ["Capital work in progress preceding year"];
    default:
      // Keep this lightweight for non-historical metrics.
      return ["Preceding year"];
  }
}

function getBalanceSheetValueUnit(indicatorLabel: string | null): "₹ Cr" | "%" {
  if (!indicatorLabel) return "₹ Cr";
  const normalized = indicatorLabel.toLowerCase();
  if (
    normalized.includes("margin") ||
    normalized.includes("yield") ||
    normalized.includes("ratio") ||
    normalized.includes("%")
  ) {
    return "%";
  }
  return "₹ Cr";
}

function getValuationCompareTargets(indicatorLabel: string | null): string[] {
  if (!indicatorLabel) return [];
  if (INDUSTRY_COMPARISON_VALUATION_INDICATORS.has(indicatorLabel)) {
    return [`Industry ${indicatorLabel}`];
  }
  switch (indicatorLabel) {
    // Financial Ratios: compare with own history
    case "Return on Equity (ROE)":
      return ["ROE (preceding year)", "Average ROE (3Y)", "Average ROE (5Y)"];
    case "Return on Capital Employed (ROCE)":
      return ["ROCE (preceding year)", "Average ROCE (3Y)", "Average ROCE (5Y)"];
    case "Return on Assets (ROA)":
      return ["ROA (preceding year)", "Average ROA (3Y)", "Average ROA (5Y)"];
    case "Return on Invested Capital (ROIC)":
      return ["ROIC (preceding year)", "Average ROIC (3Y)", "Average ROIC (5Y)"];
    case "Debt to Equity":
      return ["Debt to Equity (preceding year)", "Average Debt to Equity (3Y)"];
    case "Financial Leverage":
      return ["Financial Leverage (preceding year)", "Average Financial Leverage (3Y)"];
    case "Quick Ratio":
      return ["Quick Ratio (preceding year)", "Average Quick Ratio (3Y)"];
    case "Asset Turnover Ratio":
      return ["Asset Turnover (preceding year)", "Average Asset Turnover (3Y)"];
    case "Inventory Turnover Ratio":
      return ["Inventory Turnover (preceding year)", "Average Inventory Turnover (3Y)"];
    case "Book Value":
      return ["Book Value (preceding year)", "Book Value (3Y back)", "Book Value (5Y back)"];
    case "Piotroski Score":
      return ["Piotroski Score (preceding year)"];

    // Profitability: compare with own history
    case "Gross Profit Margin (GPM)":
      return ["GPM (latest quarter)", "GPM (preceding year)", "Average GPM (3Y)"];
    case "Operating Profit Margin (OPM)":
      return ["OPM (latest quarter)", "OPM (preceding year)", "Average OPM (3Y)"];
    case "Net Profit Margin (NPM)":
      return ["NPM (latest quarter)", "NPM (preceding year)", "Average NPM (3Y)"];
    case "Operating Profit":
      return ["Operating Profit (preceding year)", "Average Operating Profit (3Y)"];
    case "EBITDA":
      return ["EBITDA (preceding year)", "Average EBITDA (3Y)"];
    case "EBIT":
      return ["EBIT (preceding year)", "Average EBIT (3Y)"];
    case "Profit Before Tax":
      return ["PBT (preceding year)", "Average PBT (3Y)"];
    case "Profit After Tax":
      return ["PAT (preceding year)", "Average PAT (3Y)"];
    case "Net Profit":
      return ["Net Profit (preceding year)", "Average Net Profit (3Y)"];
    case "EPS":
      return ["EPS (preceding year)", "Average EPS (3Y)"];

    // Cash Flow: compare with own historical profile
    case "Operating Cash Flow (TTM)":
      return ["Operating Cash Flow (Last FY)", "Operating Cash Flow (Preceding FY)", "Operating Cash Flow (3Y Avg)", "Operating Cash Flow (5Y Avg)"];
    case "Free Cash Flow (TTM)":
      return ["Free Cash Flow (Last FY)", "Free Cash Flow (Preceding FY)", "Free Cash Flow (3Y Avg)", "Free Cash Flow (5Y Avg)"];
    case "Cash from Investing (TTM)":
      return ["Cash from Investing (Last FY)", "Cash from Investing (Preceding FY)", "Cash from Investing (3Y Avg)", "Cash from Investing (5Y Avg)"];
    case "Cash from Financing (TTM)":
      return ["Cash from Financing (Last FY)", "Cash from Financing (Preceding FY)", "Cash from Financing (3Y Avg)", "Cash from Financing (5Y Avg)"];
    case "Net Cash Flow (TTM)":
      return ["Net Cash Flow (Last FY)", "Net Cash Flow (Preceding FY)", "Net Cash Flow (3Y Avg)", "Net Cash Flow (5Y Avg)"];
    case "Cash & Cash Equivalents":
      return [
        "Cash & Cash Equivalents (Last FY)",
        "Cash & Cash Equivalents (Preceding FY)",
        "Cash & Cash Equivalents (3Y back)",
        "Cash & Cash Equivalents (5Y back)",
      ];

    // Shareholding: compare with prior quarter/year and medium-term trend
    case "Promoter holding":
      return ["Promoter holding (preceding quarter)", "Promoter holding (1Y back)", "Promoter holding (3Y avg)"];
    case "FII holding":
      return ["FII holding (preceding quarter)", "FII holding (1Y back)", "FII holding (3Y avg)"];
    case "DII holding":
      return ["DII holding (preceding quarter)", "DII holding (1Y back)", "DII holding (3Y avg)"];
    case "Public holding":
      return ["Public holding (preceding quarter)", "Public holding (1Y back)", "Public holding (3Y avg)"];
    case "Unpledged promoter holding":
      return ["Unpledged promoter holding (preceding quarter)", "Unpledged promoter holding (1Y back)", "Unpledged promoter holding (3Y avg)"];
    case "Pledged percentage":
      return ["Pledged percentage (preceding quarter)", "Pledged percentage (1Y back)", "Pledged percentage (3Y avg)"];

    // Change metrics compare against historical change baselines.
    case "Change in FII holding":
      return ["Change in FII holding (1Y avg)", "Change in FII holding (3Y avg)"];
    case "Change in DII holding":
      return ["Change in DII holding (1Y avg)", "Change in DII holding (3Y avg)"];
    case "Change in Promoter Holding":
      return ["Change in Promoter Holding (1Y avg)", "Change in Promoter Holding (3Y avg)"];
    case "Change in FII holding 3Years":
      return ["Change in FII holding (1Y avg)", "Change in FII holding (current period)"];
    case "Change in DII holding 3Years":
      return ["Change in DII holding (1Y avg)", "Change in DII holding (current period)"];

    // Volume & Delivery: compare against prior values or moving baselines.
    case "Volume":
      return [
        "Volume SMA",
        "Volume EMA",
        "Average Volume",
      ];
    case "Volume SMA":
      return ["Volume (current)", "Volume EMA", "Volume SMA"];
    case "Volume EMA":
      return ["Volume (current)", "Volume SMA", "Volume EMA"];
    case "OBV":
      return ["OBV (preceding day)", "OBV (20D avg)"];
    case "VWAP":
      return ["Price (current)", "VWAP (preceding session)"];
    case "Delivery %":
      return ["Delivery % (preceding day)", "Delivery % (20D avg)"];
    case "Relative Volume":
      return ["Relative Volume (20D baseline)", "Relative Volume (preceding day)"];
    case "Chaikin Money Flow":
      return ["CMF (preceding day)", "CMF (20D avg)"];
    case "Accumulation/Distribution":
      return ["A/D (preceding day)", "A/D (20D avg)"];
    case "Volume ROC":
      return ["Volume ROC (preceding day)", "Volume ROC (20D avg)"];

    // Shareholder count compares with prior observations/trend.
    case "Number of Shareholders":
      return ["Number of Shareholders (preceding quarter)", "Number of Shareholders (1Y back)", "Average Number of Shareholders (3Y)"];
    case "Number of Shareholders preceding quarter":
      return ["Number of Shareholders (1Y back)", "Average Number of Shareholders (3Y)"];
    case "Number of Shareholders 1year back":
      return ["Number of Shareholders (preceding quarter)", "Average Number of Shareholders (3Y)"];
    default:
      return [];
  }
}

function getValuationValueUnit(indicatorLabel: string | null): "x" | "%" | "₹ Cr" | "count" {
  if (!indicatorLabel) return "x";
  const normalized = indicatorLabel.toLowerCase();
  if (
    normalized.includes("yield") ||
    normalized.includes("ratio") ||
    normalized.includes("return") ||
    normalized.includes("margin") ||
    normalized.includes("holding") ||
    normalized.includes("pledged") ||
    normalized.includes("delivery %") ||
    normalized.includes("volume roc")
  ) {
    return "%";
  }
  if (normalized.includes("shareholder")) return "count";
  if (
    normalized.includes("profit") ||
    normalized.includes("revenue") ||
    normalized.includes("ebit") ||
    normalized.includes("ebitda") ||
    normalized.includes("book value") ||
    normalized.includes("cash")
  ) {
    return "₹ Cr";
  }
  if (normalized.includes("number of shareholders")) {
    return "x";
  }
  return "x";
}

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

const DEMO_SCRIPTS: { symbol: string; name: string; ltp: number; change1d: number }[] = [
  { symbol: "JSWSTEEL", name: "JSW Steel", ltp: 432.31, change1d: 4.5 },
  { symbol: "IDFCBANK", name: "IDFC First Bank", ltp: 331.51, change1d: 4.5 },
  { symbol: "HDFCBANK", name: "HDFC Bank", ltp: 412.34, change1d: 4.5 },
  { symbol: "YESBANK", name: "Yes Bank", ltp: 7423.21, change1d: 4.5 },
  { symbol: "ICICIBANK", name: "ICICI Bank", ltp: 101.34, change1d: -0.2 },
  { symbol: "RELIANCE", name: "Reliance Industries", ltp: 2921.45, change1d: 1.2 },
  { symbol: "TCS", name: "Tata Consultancy Services", ltp: 4185.2, change1d: 0.9 },
  { symbol: "INFY", name: "Infosys", ltp: 1823.15, change1d: 1.1 },
  { symbol: "ITC", name: "ITC", ltp: 468.55, change1d: -0.4 },
  { symbol: "SBIN", name: "State Bank of India", ltp: 812.75, change1d: 2.1 },
  { symbol: "LT", name: "Larsen & Toubro", ltp: 3590.6, change1d: 1.7 },
  { symbol: "HINDUNILVR", name: "Hindustan Unilever", ltp: 2529.8, change1d: -0.3 },
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

export function QuickScannerSection({ fullScreen = false, initialState }: QuickScannerSectionProps = {}) {
  const navigate = useNavigate();
  const [indicator, setIndicator] = useState<QuickIndicator>(initialState?.indicator ?? "rsi");

  // RSI config (limited)
  const [rsiMode, setRsiMode] = useState<RsiMode>(initialState?.rsiMode ?? "below");
  const [rsiMin, setRsiMin] = useState(initialState?.rsiMin ?? 30);
  const [rsiMax, setRsiMax] = useState(initialState?.rsiMax ?? 70);
  const [rsiPeriod] = useState(14);
  const [rsiIntervalId, setRsiIntervalId] = useState<string>(initialState?.rsiIntervalId ?? "15m");

  // EMA config (limited)
  const [emaSide, setEmaSide] = useState<EmaSide>(initialState?.emaSide ?? "above");
  const [emaPeriod] = useState(20);
  const [emaIntervalId, setEmaIntervalId] = useState<string>(initialState?.emaIntervalId ?? "15m");

  // MACD config (limited)
  const [macdSide, setMacdSide] = useState<MacdSide>(initialState?.macdSide ?? "bullish");
  const [macdFast] = useState(12);
  const [macdSlow] = useState(26);
  const [macdSignal] = useState(9);
  const [macdIntervalId, setMacdIntervalId] = useState<string>(initialState?.macdIntervalId ?? "15m");

  // Price config (limited)
  const [priceMode, setPriceMode] = useState<PriceMode>(initialState?.priceMode ?? "above");
  const [priceMin, setPriceMin] = useState(initialState?.priceMin ?? 1);
  const [priceMax, setPriceMax] = useState(initialState?.priceMax ?? 5);
  const [priceIntervalId, setPriceIntervalId] = useState<string>(initialState?.priceIntervalId ?? "15m");

  const [filterOpen, setFilterOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [catalogGroup, setCatalogGroup] = useState<string>("Price");
  const [catalogSearch, setCatalogSearch] = useState("");
  const [candlestickFilters, setCandlestickFilters] = useState<string[]>(initialState?.candlestickFilters ?? []);
  const [activeCandlestickFilter, setActiveCandlestickFilter] = useState<string | null>(null);
  const [candlestickConfigOpen, setCandlestickConfigOpen] = useState(false);
  const [candlestickCriteriaByIndicator, setCandlestickCriteriaByIndicator] = useState<Record<string, { timeframeId: string }>>(initialState?.candlestickCriteriaByIndicator ?? {});
  const [candlestickDraft, setCandlestickDraft] = useState<{ timeframeId: string }>({ timeframeId: "15m" });
  const [valuationFilters, setValuationFilters] = useState<string[]>(initialState?.valuationFilters ?? []);
  const [activeValuationFilter, setActiveValuationFilter] = useState<string | null>(null);
  const [valuationConfigOpen, setValuationConfigOpen] = useState(false);
  const [valuationCriteriaByIndicator, setValuationCriteriaByIndicator] = useState<Record<string, ValuationCriteria>>(initialState?.valuationCriteriaByIndicator ?? {});
  const [valuationDraft, setValuationDraft] = useState<ValuationCriteria>(DEFAULT_VALUATION_CRITERIA);
  const [incomeGrowthFilters, setIncomeGrowthFilters] = useState<string[]>(initialState?.incomeGrowthFilters ?? []);
  const [activeIncomeGrowthFilter, setActiveIncomeGrowthFilter] = useState<string | null>(null);
  const [incomeGrowthConfigOpen, setIncomeGrowthConfigOpen] = useState(false);
  const [incomeGrowthCriteriaByIndicator, setIncomeGrowthCriteriaByIndicator] = useState<Record<string, IncomeGrowthCriteria>>(initialState?.incomeGrowthCriteriaByIndicator ?? {});
  const [incomeGrowthDraft, setIncomeGrowthDraft] = useState<IncomeGrowthCriteria>(DEFAULT_INCOME_GROWTH_CRITERIA);
  const [balanceSheetFilters, setBalanceSheetFilters] = useState<string[]>(initialState?.balanceSheetFilters ?? []);
  const [activeBalanceSheetFilter, setActiveBalanceSheetFilter] = useState<string | null>(null);
  const [balanceSheetConfigOpen, setBalanceSheetConfigOpen] = useState(false);
  const [balanceSheetCriteriaByIndicator, setBalanceSheetCriteriaByIndicator] = useState<Record<string, BalanceSheetCriteria>>(initialState?.balanceSheetCriteriaByIndicator ?? {});
  const [balanceSheetDraft, setBalanceSheetDraft] = useState<BalanceSheetCriteria>(DEFAULT_BALANCE_SHEET_CRITERIA);
  const [technicalFilters, setTechnicalFilters] = useState<string[]>(initialState?.technicalFilters ?? []);
  const [activeTechnicalFilter, setActiveTechnicalFilter] = useState<string | null>(null);
  const [technicalConfigOpen, setTechnicalConfigOpen] = useState(false);
  const [technicalCriteriaByIndicator, setTechnicalCriteriaByIndicator] = useState<Record<string, TechnicalCriteria>>(initialState?.technicalCriteriaByIndicator ?? {});
  const [technicalDraft, setTechnicalDraft] = useState<TechnicalCriteria>(DEFAULT_TECHNICAL_CRITERIA);

  const [isDemo, setIsDemo] = useState(!fullScreen);
  const [results, setResults] = useState<ScanResultRow[]>([]);
  const [matchedHint, setMatchedHint] = useState<string>("Apply to see matches");

  const [isApplying, setIsApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [shouldOpenFullScreenerOnApply, setShouldOpenFullScreenerOnApply] = useState(false);
  const [screenerName, setScreenerName] = useState(fullScreen ? "Untitled Screener" : "Quick Screener");
  const [isEditingScreenerName, setIsEditingScreenerName] = useState(false);
  const activeFilterCount =
    1 +
    candlestickFilters.length +
    valuationFilters.length +
    incomeGrowthFilters.length +
    balanceSheetFilters.length +
    technicalFilters.length;

  const appliedResultColumns = useMemo(() => {
    if (!fullScreen) return [] as Array<{ key: string; label: string }>;
    const cols: Array<{ key: string; label: string }> = [];
    const seen = new Set<string>();
    const pushCol = (key: string, label: string) => {
      if (seen.has(key)) return;
      seen.add(key);
      cols.push({ key, label });
    };
    const addFromIndicatorId = (indicatorId: string, label: string, params: Record<string, number | string>) => {
      const def = INDICATORS.find((i) => i.id === indicatorId);
      if (!def || def.outputType !== "numeric") return;
      const keyParts = def.params.filter((p) => p.type === "number").map((p) => String(params[p.key] ?? p.defaultValue));
      const key = keyParts.length > 0 ? `${indicatorId}_${keyParts.join("_")}` : indicatorId;
      pushCol(key, label);
    };

    if (indicator === "rsi") addFromIndicatorId("rsi", `RSI(${rsiPeriod})`, { period: rsiPeriod });
    else if (indicator === "ema") addFromIndicatorId("ema", `EMA(${emaPeriod})`, { period: emaPeriod });
    else if (indicator === "macd") addFromIndicatorId("macd_line", "MACD", { fast: macdFast, slow: macdSlow, signal: macdSignal });
    else addFromIndicatorId("change_1d_pct", "1D Change %", {});

    for (const label of technicalFilters) {
      const def = getTechnicalIndicatorDef(label);
      if (def.outputType === "pattern") continue;
      const crit = technicalCriteriaByIndicator[label];
      const params: Record<string, number | string> = {};
      for (const p of def.params) {
        if (p.type === "number") params[p.key] = crit?.paramValues[p.key] ?? p.defaultValue;
        if (p.type === "select") params[p.key] = crit?.paramSelect[p.key] ?? p.defaultValue;
      }
      const nums = def.params.filter((p) => p.type === "number").map((p) => params[p.key]);
      const display = nums.length > 0 ? `${label}(${nums.join(",")})` : label;
      addFromIndicatorId(def.id, display, params);
    }

    for (const label of [...valuationFilters, ...incomeGrowthFilters, ...balanceSheetFilters]) {
      const def = INDICATORS.find((i) => i.name === label);
      if (!def || def.outputType !== "numeric") continue;
      addFromIndicatorId(def.id, label, {});
    }
    return cols;
  }, [
    fullScreen,
    indicator,
    rsiPeriod,
    emaPeriod,
    macdFast,
    macdSlow,
    macdSignal,
    technicalFilters,
    technicalCriteriaByIndicator,
    valuationFilters,
    incomeGrowthFilters,
    balanceSheetFilters,
  ]);

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
    setResults(demo);
    setMatchedHint("Demo matches");
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

  function openFor(ind: QuickIndicator) {
    setIndicator(ind);
    setIsDemo(true);
    setShouldOpenFullScreenerOnApply(false);
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
    setMatchedHint("Apply to see matches");
    setCandlestickFilters([]);
    setActiveCandlestickFilter(null);
    setCandlestickConfigOpen(false);
    setCandlestickCriteriaByIndicator({});
    setCandlestickDraft({ timeframeId: "15m" });
    setValuationFilters([]);
    setActiveValuationFilter(null);
    setValuationConfigOpen(false);
    setValuationCriteriaByIndicator({});
    setValuationDraft(DEFAULT_VALUATION_CRITERIA);
    setIncomeGrowthFilters([]);
    setActiveIncomeGrowthFilter(null);
    setIncomeGrowthConfigOpen(false);
    setIncomeGrowthCriteriaByIndicator({});
    setIncomeGrowthDraft(DEFAULT_INCOME_GROWTH_CRITERIA);
    setBalanceSheetFilters([]);
    setActiveBalanceSheetFilter(null);
    setBalanceSheetConfigOpen(false);
    setBalanceSheetCriteriaByIndicator({});
    setBalanceSheetDraft(DEFAULT_BALANCE_SHEET_CRITERIA);
    setTechnicalFilters([]);
    setActiveTechnicalFilter(null);
    setTechnicalConfigOpen(false);
    setTechnicalCriteriaByIndicator({});
    setTechnicalDraft(DEFAULT_TECHNICAL_CRITERIA);
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
      const { query } = buildQuery();
      const matches = await runCustomScan(query);
      setResults(fullScreen ? matches : matches.slice(0, 8));
      setMatchedHint(`${matches.length} match${matches.length === 1 ? "" : "es"} found`);
      if (!fullScreen && shouldOpenFullScreenerOnApply) {
        const snapshot: QuickScreenerSnapshot = {
          indicator,
          rsiMode,
          rsiMin,
          rsiMax,
          rsiIntervalId,
          emaSide,
          emaIntervalId,
          macdSide,
          macdIntervalId,
          priceMode,
          priceMin,
          priceMax,
          priceIntervalId,
          candlestickFilters,
          valuationFilters,
          incomeGrowthFilters,
          balanceSheetFilters,
          technicalFilters,
          candlestickCriteriaByIndicator,
          valuationCriteriaByIndicator,
          incomeGrowthCriteriaByIndicator,
          balanceSheetCriteriaByIndicator,
          technicalCriteriaByIndicator,
        };
        navigate("/diy", { state: { quickFullScreen: true, quickQuery: query, quickSnapshot: snapshot } });
      }
    } catch (e) {
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
      setApplyError(null);
      setIsDemo(true);
      setResults(fullScreen ? demo : demo.slice(0, 8));
      setMatchedHint("Demo matches");
    } finally {
      setIsApplying(false);
      setShouldOpenFullScreenerOnApply(false);
    }
  }

  useEffect(() => {
    if (!fullScreen) return;
    setApplyError(null);
    setIsDemo(false);
    setIsApplying(true);
    const { query } = buildQuery();
    runCustomScan(query)
      .then((matches) => {
        setResults(matches);
        setMatchedHint(`${matches.length} match${matches.length === 1 ? "" : "es"} found`);
      })
      .catch(() => {
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
        setApplyError(null);
        setIsDemo(true);
        setResults(demo);
        setMatchedHint("Demo matches");
      })
      .finally(() => setIsApplying(false));
    // Run once for initial full-screen load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullScreen]);

  function navigateToFullScreenQuick() {
    const { query } = buildQuery();
    const snapshot: QuickScreenerSnapshot = {
      indicator,
      rsiMode,
      rsiMin,
      rsiMax,
      rsiIntervalId,
      emaSide,
      emaIntervalId,
      macdSide,
      macdIntervalId,
      priceMode,
      priceMin,
      priceMax,
      priceIntervalId,
      candlestickFilters,
      valuationFilters,
      incomeGrowthFilters,
      balanceSheetFilters,
      technicalFilters,
      candlestickCriteriaByIndicator,
      valuationCriteriaByIndicator,
      incomeGrowthCriteriaByIndicator,
      balanceSheetCriteriaByIndicator,
      technicalCriteriaByIndicator,
    };
    navigate("/diy", { state: { quickFullScreen: true, quickQuery: query, quickSnapshot: snapshot } });
  }

  const quickTabs: { key: QuickIndicator; label: string }[] = [
    { key: "price", label: "Price" },
    { key: "ema", label: "EMA" },
    { key: "rsi", label: "RSI" },
    { key: "macd", label: "MACD" },
  ];

  const catalogSections = useMemo(() => {
    const q = catalogSearch.trim().toLowerCase();
    if (catalogGroup === "Technicals") {
      const sections = TECHNICAL_SECTIONS.map((section) => ({
        title: section.title,
        items: q ? section.items.filter((v) => v.toLowerCase().includes(q)) : section.items,
      })).filter((section) => section.items.length > 0);
      return sections;
    }
    if (catalogGroup === "Income & Growth") {
      const sections = INCOME_GROWTH_SECTIONS.map((section) => ({
        title: section.title,
        items: q ? section.items.filter((v) => v.toLowerCase().includes(q)) : section.items,
      })).filter((section) => section.items.length > 0);
      return sections;
    }
    const base = PICKER_ITEMS[catalogGroup] ?? [];
    const items = q ? base.filter((v) => v.toLowerCase().includes(q)) : base;
    return [{ title: "", items }];
  }, [catalogGroup, catalogSearch]);

  /** Section headers + rows match Technicals list pattern (bold subheads, padded rows, ›). */
  const catalogTechnicalStyle =
    catalogGroup === "Technicals" || catalogGroup === "Income & Growth";

  const isCatalogGlobalSearch = catalogSearch.trim().length > 0;

  const globalCatalogSearchSections = useMemo(() => {
    const q = catalogSearch.trim().toLowerCase();
    if (!q) return [];
    const sections: { category: string; items: string[] }[] = [];
    for (const group of PICKER_GROUPS) {
      const raw = getFlatPickerItemsForGroup(group).filter((v) => v.toLowerCase().includes(q));
      const seen = new Set<string>();
      const items = raw.filter((v) => {
        if (seen.has(v)) return false;
        seen.add(v);
        return true;
      });
      if (items.length > 0) sections.push({ category: group, items });
    }
    return sections;
  }, [catalogSearch]);

  function getQuickTabLabel(tab: { key: QuickIndicator; label: string }) {
    if (tab.key === "ema") return `EMA(${emaPeriod})`;
    if (tab.key === "rsi") return `RSI(${rsiPeriod})`;
    return tab.label;
  }

  function getChipLabel(label: string) {
    const maLength = valuationCriteriaByIndicator[label]?.maLength ?? 20;
    if (label === "Volume SMA" || label === "Volume EMA" || label === "Relative Volume" || label === "Chaikin Money Flow") {
      return `${label}(${maLength})`;
    }
    return label;
  }

  function getTechnicalChipLabel(label: string) {
    const crit = technicalCriteriaByIndicator[label];
    const def = getTechnicalIndicatorDef(label);
    if (!crit) return label;
    const period = crit.paramValues.period;
    const fast = crit.paramValues.fast;
    let base = label;
    if (def.params.length === 1 && def.params[0].type === "number" && period !== undefined) {
      base = `${label}(${period})`;
    } else if (def.params.some((p) => p.key === "fast") && fast !== undefined) {
      const slow = crit.paramValues.slow;
      const sig = crit.paramValues.signal;
      if (slow !== undefined && sig !== undefined) base = `${label}(${fast},${slow},${sig})`;
    }
    if (def.outputType === "pattern") return base;
    if (crit.mode === "custom") return `${base} · range`;
    const op = crit.mode === "higher_than" ? ">" : "<";
    const bench = formatTechnicalBenchmarkSummary(crit, def);
    return `${base} · ${op} ${bench}`;
  }

  function handleCatalogItemClick(item: string, group: string = catalogGroup) {
    // For app scanner copy: selected fundamental indicators become additional quick filters.
    if (group === "Candlesticks") {
      const isNewlyAdded = !candlestickFilters.includes(item);
      setCandlestickFilters((prev) => (prev.includes(item) ? prev : [...prev, item]));
      setShouldOpenFullScreenerOnApply(isNewlyAdded);
      setCatalogOpen(false);
      openCandlestickCriteria(item);
      return;
    }
    if (group === "Technicals") {
      const isNewlyAdded = !technicalFilters.includes(item);
      setTechnicalFilters((prev) => (prev.includes(item) ? prev : [...prev, item]));
      setShouldOpenFullScreenerOnApply(isNewlyAdded);
      setActiveTechnicalFilter(item);
      setCatalogOpen(false);
      openTechnicalCriteria(item);
      return;
    }
    if (
      group === "Valuation" ||
      group === "Financial Ratios" ||
      group === "Profitability" ||
      group === "Cash Flow" ||
      group === "Volume & Delivery" ||
      group === "Shareholding"
    ) {
      const isNewlyAdded = !valuationFilters.includes(item);
      setValuationFilters((prev) => (prev.includes(item) ? prev : [...prev, item]));
      setShouldOpenFullScreenerOnApply(isNewlyAdded);
      setCatalogOpen(false);
      // Route through the centralized open handler so indicator-specific rules
      // (industry comparison allowed vs range-only) are always applied.
      openValuationCriteria(item);
      return;
    }
    if (group === "Income & Growth") {
      const isNewlyAdded = !incomeGrowthFilters.includes(item);
      setIncomeGrowthFilters((prev) => (prev.includes(item) ? prev : [...prev, item]));
      setShouldOpenFullScreenerOnApply(isNewlyAdded);
      setCatalogOpen(false);
      openIncomeGrowthCriteria(item);
      return;
    }
    if (group === "Balance Sheet") {
      const isNewlyAdded = !balanceSheetFilters.includes(item);
      setBalanceSheetFilters((prev) => (prev.includes(item) ? prev : [...prev, item]));
      setShouldOpenFullScreenerOnApply(isNewlyAdded);
      setCatalogOpen(false);
      openBalanceSheetCriteria(item);
    }
  }

  function openCandlestickCriteria(indicatorLabel: string) {
    setActiveCandlestickFilter(indicatorLabel);
    const criteria = candlestickCriteriaByIndicator[indicatorLabel] ?? { timeframeId: "15m" };
    setCandlestickDraft(criteria);
    setCandlestickConfigOpen(true);
  }

  function applyCandlestickCriteria() {
    if (!activeCandlestickFilter) return;
    setCandlestickCriteriaByIndicator((prev) => ({
      ...prev,
      [activeCandlestickFilter]: { ...candlestickDraft },
    }));
    setCandlestickConfigOpen(false);
    if (!fullScreen && shouldOpenFullScreenerOnApply) {
      setShouldOpenFullScreenerOnApply(false);
      navigateToFullScreenQuick();
    }
  }

  function openTechnicalCriteria(indicatorLabel: string) {
    setActiveTechnicalFilter(indicatorLabel);
    const def = getTechnicalIndicatorDef(indicatorLabel);
    const saved = technicalCriteriaByIndicator[indicatorLabel];
    setTechnicalDraft(mergeTechnicalCriteria(saved, def));
    setTechnicalConfigOpen(true);
  }

  function applyTechnicalCriteria() {
    if (!activeTechnicalFilter) return;
    setTechnicalCriteriaByIndicator((prev) => ({
      ...prev,
      [activeTechnicalFilter]: { ...technicalDraft },
    }));
    setTechnicalConfigOpen(false);
    if (!fullScreen && shouldOpenFullScreenerOnApply) {
      setShouldOpenFullScreenerOnApply(false);
      navigateToFullScreenQuick();
    }
  }

  function openValuationCriteria(indicatorLabel: string) {
    setActiveValuationFilter(indicatorLabel);
    const criteria = valuationCriteriaByIndicator[indicatorLabel] ?? DEFAULT_VALUATION_CRITERIA;
    const targets = getValuationCompareTargets(indicatorLabel);
    const hasBenchmarkTargets = targets.length > 0;
    const options = [...targets, "Value"];
    const safeBenchmark = options.includes(criteria.benchmarkLabel) ? criteria.benchmarkLabel : targets[0] ?? "Value";
    setValuationDraft({
      ...criteria,
      mode: hasBenchmarkTargets ? criteria.mode : "custom",
      benchmarkLabel: safeBenchmark,
    });
    setValuationConfigOpen(true);
  }

  function applyValuationCriteria() {
    if (!activeValuationFilter) return;
    const hasBenchmarkTargets = getValuationCompareTargets(activeValuationFilter).length > 0;
    setValuationCriteriaByIndicator((prev) => ({
      ...prev,
      [activeValuationFilter]: {
        ...valuationDraft,
        mode: hasBenchmarkTargets ? valuationDraft.mode : "custom",
      },
    }));
    setValuationConfigOpen(false);
    if (!fullScreen && shouldOpenFullScreenerOnApply) {
      setShouldOpenFullScreenerOnApply(false);
      navigateToFullScreenQuick();
    }
  }

  function openIncomeGrowthCriteria(indicatorLabel: string) {
    setActiveIncomeGrowthFilter(indicatorLabel);
    const criteria = incomeGrowthCriteriaByIndicator[indicatorLabel] ?? DEFAULT_INCOME_GROWTH_CRITERIA;
    const targetOptions = getIncomeGrowthCompareTargets(indicatorLabel);
    const options = [...targetOptions, "Value"];
    const safeBenchmark = options.includes(criteria.benchmarkLabel) ? criteria.benchmarkLabel : targetOptions[0] ?? "Value";
    setIncomeGrowthDraft({
      ...criteria,
      benchmarkLabel: safeBenchmark,
    });
    setIncomeGrowthConfigOpen(true);
  }

  function applyIncomeGrowthCriteria() {
    if (!activeIncomeGrowthFilter) return;
    setIncomeGrowthCriteriaByIndicator((prev) => ({
      ...prev,
      [activeIncomeGrowthFilter]: {
        ...incomeGrowthDraft,
      },
    }));
    setIncomeGrowthConfigOpen(false);
    if (!fullScreen && shouldOpenFullScreenerOnApply) {
      setShouldOpenFullScreenerOnApply(false);
      navigateToFullScreenQuick();
    }
  }

  function openBalanceSheetCriteria(indicatorLabel: string) {
    setActiveBalanceSheetFilter(indicatorLabel);
    const criteria = balanceSheetCriteriaByIndicator[indicatorLabel] ?? DEFAULT_BALANCE_SHEET_CRITERIA;
    const targets = getBalanceSheetCompareTargets(indicatorLabel);
    const options = [...targets, "Value"];
    const safeBenchmark = options.includes(criteria.benchmarkLabel) ? criteria.benchmarkLabel : targets[0];
    setBalanceSheetDraft({
      ...criteria,
      benchmarkLabel: safeBenchmark,
    });
    setBalanceSheetConfigOpen(true);
  }

  function applyBalanceSheetCriteria() {
    if (!activeBalanceSheetFilter) return;
    setBalanceSheetCriteriaByIndicator((prev) => ({
      ...prev,
      [activeBalanceSheetFilter]: {
        ...balanceSheetDraft,
      },
    }));
    setBalanceSheetConfigOpen(false);
    if (!fullScreen && shouldOpenFullScreenerOnApply) {
      setShouldOpenFullScreenerOnApply(false);
      navigateToFullScreenQuick();
    }
  }

  return (
    <div className={cn(fullScreen ? "mb-6 bg-white" : "mb-5 -mx-4 bg-white shadow-[0_2px_8px_rgba(158,144,99,0.16)]")} aria-label="Quick scanner">
      <div className={cn(fullScreen ? "px-0 py-4 pb-24" : "px-4 py-4")}>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              {!fullScreen ? (
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
              ) : null}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {fullScreen && isEditingScreenerName ? (
                    <Input
                      value={screenerName}
                      onChange={(e) => setScreenerName(e.target.value)}
                      onBlur={() => {
                        if (!screenerName.trim()) setScreenerName("Untitled Screener");
                        setIsEditingScreenerName(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          if (!screenerName.trim()) setScreenerName("Untitled Screener");
                          setIsEditingScreenerName(false);
                        }
                      }}
                      autoFocus
                      className="h-8 w-[240px] border-[#E1E1E1] focus-visible:ring-[#542087]"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => fullScreen && setIsEditingScreenerName(true)}
                      className="inline-flex items-center gap-2 text-left"
                    >
                      <p className="text-xl leading-7 font-bold text-foreground">{fullScreen ? screenerName : "Quick Screener"}</p>
                      {fullScreen ? <Pencil className="h-4 w-4 text-[#777777]" /> : null}
                    </button>
                  )}
                  {fullScreen && isEditingScreenerName ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (!screenerName.trim()) setScreenerName("Untitled Screener");
                        setIsEditingScreenerName(false);
                      }}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#E1E1E1]"
                      aria-label="Save screener name"
                    >
                      <Check className="h-4 w-4 text-[#542087]" />
                    </button>
                  ) : null}
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  {fullScreen ? "Full screener with all matching stocks." : "Mini filter for beginners: one idea, fast matches."}
                </p>
              </div>
            </div>
            {!fullScreen ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-0 text-xs font-semibold text-[#777777] hover:text-[#262626]"
                onClick={clearAll}
                disabled={isApplying}
              >
                Clear All
              </Button>
            ) : null}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-3 px-3 scrollbar-none">
            <button
              type="button"
              onClick={() => setCatalogOpen(true)}
              className={cn(
                "shrink-0 flex items-center justify-center gap-1 px-2 h-[28px] rounded-[6px] border transition-colors",
                activeFilterCount > 0
                  ? "bg-[#FBF8FD] border-[#37135B]"
                  : "bg-white border-[#E1E1E1]"
              )}
            >
              <SlidersHorizontal
                size={16}
                className={activeFilterCount > 0 ? "text-[#37135B]" : "text-[#262626]"}
              />
              <span className={cn("text-[11px] font-semibold leading-none", activeFilterCount > 0 ? "text-[#37135B]" : "text-[#262626]")}>
                {activeFilterCount}
              </span>
            </button>

            {quickTabs.map((t) => {
              const isActive = indicator === t.key;

              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => openFor(t.key)}
                  className={cn(
                    "shrink-0 box-border flex items-center gap-[2px] h-[28px] rounded-[6px] border transition-colors",
                    "pl-[10px] pr-[6px] py-[6px]",
                    isActive ? "bg-[#FBF8FD] border-[#37135B]" : "bg-[#FFFFFF] border-[#E1E1E1]"
                  )}
                >
                  <span
                    className={cn(
                      "h-[16px] text-[12px] font-semibold leading-[16px] flex items-center whitespace-nowrap",
                      isActive ? "text-[#37135B]" : "text-[#262626]"
                    )}
                  >
                    {getQuickTabLabel(t)}
                  </span>

                  <span
                    className="flex h-[16px] w-[16px] items-center justify-center"
                    aria-hidden="true"
                  >
                    <span
                      className="h-0 w-0"
                      style={{
                        borderLeft: "5px solid transparent",
                        borderRight: "5px solid transparent",
                        borderTop: `7px solid ${isActive ? "#37135B" : "#262626"}`,
                      }}
                    />
                  </span>
                </button>
              );
            })}
            {candlestickFilters.map((label) => {
              const isActive = activeCandlestickFilter === label;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => openCandlestickCriteria(label)}
                  className={cn(
                    "shrink-0 box-border flex items-center gap-[2px] h-[28px] rounded-[6px] border transition-colors",
                    "pl-[10px] pr-[6px] py-[6px]",
                    isActive ? "bg-[#FBF8FD] border-[#37135B]" : "bg-[#FFFFFF] border-[#E1E1E1]"
                  )}
                >
                  <span
                    className={cn(
                      "h-[16px] text-[12px] font-semibold leading-[16px] flex items-center whitespace-nowrap",
                      isActive ? "text-[#37135B]" : "text-[#262626]"
                    )}
                  >
                    {label}
                  </span>
                  <span
                    className="flex h-[16px] w-[16px] items-center justify-center"
                    aria-hidden="true"
                  >
                    <span
                      className="h-0 w-0"
                      style={{
                        borderLeft: "5px solid transparent",
                        borderRight: "5px solid transparent",
                        borderTop: `7px solid ${isActive ? "#37135B" : "#262626"}`,
                      }}
                    />
                  </span>
                </button>
              );
            })}
            {technicalFilters.map((label) => {
              const isActive = activeTechnicalFilter === label;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => openTechnicalCriteria(label)}
                  className={cn(
                    "shrink-0 box-border flex items-center gap-[2px] h-[28px] rounded-[6px] border transition-colors",
                    "pl-[10px] pr-[6px] py-[6px]",
                    isActive ? "bg-[#FBF8FD] border-[#37135B]" : "bg-[#FFFFFF] border-[#E1E1E1]"
                  )}
                >
                  <span
                    className={cn(
                      "h-[16px] text-[12px] font-semibold leading-[16px] flex items-center whitespace-nowrap",
                      isActive ? "text-[#37135B]" : "text-[#262626]"
                    )}
                  >
                    {getTechnicalChipLabel(label)}
                  </span>
                  <span className="flex h-[16px] w-[16px] items-center justify-center" aria-hidden="true">
                    <span
                      className="h-0 w-0"
                      style={{
                        borderLeft: "5px solid transparent",
                        borderRight: "5px solid transparent",
                        borderTop: `7px solid ${isActive ? "#37135B" : "#262626"}`,
                      }}
                    />
                  </span>
                </button>
              );
            })}
            {valuationFilters.map((label) => {
              const isActive = activeValuationFilter === label;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => openValuationCriteria(label)}
                  className={cn(
                    "shrink-0 box-border flex items-center gap-[2px] h-[28px] rounded-[6px] border transition-colors",
                    "pl-[10px] pr-[6px] py-[6px]",
                    isActive ? "bg-[#FBF8FD] border-[#37135B]" : "bg-[#FFFFFF] border-[#E1E1E1]"
                  )}
                >
                  <span
                    className={cn(
                      "h-[16px] text-[12px] font-semibold leading-[16px] flex items-center whitespace-nowrap",
                      isActive ? "text-[#37135B]" : "text-[#262626]"
                    )}
                  >
                    {getChipLabel(label)}
                  </span>
                  <span
                    className="flex h-[16px] w-[16px] items-center justify-center"
                    aria-hidden="true"
                  >
                    <span
                      className="h-0 w-0"
                      style={{
                        borderLeft: "5px solid transparent",
                        borderRight: "5px solid transparent",
                        borderTop: `7px solid ${isActive ? "#37135B" : "#262626"}`,
                      }}
                    />
                  </span>
                </button>
              );
            })}
            {incomeGrowthFilters.map((label) => {
              const isActive = activeIncomeGrowthFilter === label;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => openIncomeGrowthCriteria(label)}
                  className={cn(
                    "shrink-0 box-border flex items-center gap-[2px] h-[28px] rounded-[6px] border transition-colors",
                    "pl-[10px] pr-[6px] py-[6px]",
                    isActive ? "bg-[#FBF8FD] border-[#37135B]" : "bg-[#FFFFFF] border-[#E1E1E1]"
                  )}
                >
                  <span
                    className={cn(
                      "h-[16px] text-[12px] font-semibold leading-[16px] flex items-center whitespace-nowrap",
                      isActive ? "text-[#37135B]" : "text-[#262626]"
                    )}
                  >
                    {label}
                  </span>
                  <span
                    className="flex h-[16px] w-[16px] items-center justify-center"
                    aria-hidden="true"
                  >
                    <span
                      className="h-0 w-0"
                      style={{
                        borderLeft: "5px solid transparent",
                        borderRight: "5px solid transparent",
                        borderTop: `7px solid ${isActive ? "#37135B" : "#262626"}`,
                      }}
                    />
                  </span>
                </button>
              );
            })}
            {balanceSheetFilters.map((label) => {
              const isActive = activeBalanceSheetFilter === label;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => openBalanceSheetCriteria(label)}
                  className={cn(
                    "shrink-0 box-border flex items-center gap-[2px] h-[28px] rounded-[6px] border transition-colors",
                    "pl-[10px] pr-[6px] py-[6px]",
                    isActive ? "bg-[#FBF8FD] border-[#37135B]" : "bg-[#FFFFFF] border-[#E1E1E1]"
                  )}
                >
                  <span
                    className={cn(
                      "h-[16px] text-[12px] font-semibold leading-[16px] flex items-center whitespace-nowrap",
                      isActive ? "text-[#37135B]" : "text-[#262626]"
                    )}
                  >
                    {label}
                  </span>
                  <span
                    className="flex h-[16px] w-[16px] items-center justify-center"
                    aria-hidden="true"
                  >
                    <span
                      className="h-0 w-0"
                      style={{
                        borderLeft: "5px solid transparent",
                        borderRight: "5px solid transparent",
                        borderTop: `7px solid ${isActive ? "#37135B" : "#262626"}`,
                      }}
                    />
                  </span>
                </button>
              );
            })}

          </div>

          {/* Results list (multi-column, horizontally scrollable) */}
          <div className="bg-white overflow-x-auto">
            <div className={cn("min-w-[504px]", fullScreen && appliedResultColumns.length > 0 && "min-w-[880px]")}>
              <div className="flex items-center h-6 bg-[#F9F9F9] border-b border-[#F1F1F1]">
                <div className="w-[204px] px-4 text-[10px] leading-4 font-medium text-[#777777]">Scrip</div>
                <div className="w-[100px] px-4 text-right text-[10px] leading-4 font-medium text-[#777777]">Price</div>
                <div className="w-[100px] px-4 text-right text-[10px] leading-4 font-medium text-[#777777]">% change</div>
                {fullScreen
                  ? appliedResultColumns.map((col) => (
                    <div key={col.key} className="w-[120px] px-4 text-right text-[10px] leading-4 font-medium text-[#777777] truncate">
                      {col.label}
                    </div>
                  ))
                  : null}
                <div className="w-[100px] px-4 text-right text-[10px] leading-4 font-medium text-[#777777]">Low</div>
              </div>
            {isApplying ? (
              <div className="flex items-center justify-center p-6 text-muted-foreground gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Running quick scan...
              </div>
            ) : !isDemo && results.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground">{matchedHint}</div>
            ) : (
              <div className="bg-white">
                {results.map((r, idx) => {
                  const changeColor = r.change1d >= 0 ? "text-[#008858]" : "text-[#D53627]";
                  const dayLow = r.close * (1 - Math.abs(r.change1d) / 200);

                  return (
                    <div key={r.symbol} className={cn("flex items-center h-[60px] border-b border-[#F1F1F1]", fullScreen && idx === results.length - 1 && "border-b-0")}>
                      <div className="w-[204px] px-3 py-3">
                        <p className="text-[14px] leading-5 font-medium text-[#262626] truncate">{r.symbol}</p>
                        <p className="text-[12px] leading-4 text-[#777777] truncate">{r.name}</p>
                      </div>

                      <div className="w-[100px] px-3 text-right">
                        <p className="text-[14px] leading-5 font-medium text-[#262626] tabular-nums">{formatInr(r.close)}</p>
                      </div>

                      <div className="w-[100px] px-3 text-right">
                        <p className={cn("text-[14px] leading-5 font-medium tabular-nums", changeColor)}>
                          {formatMaybePct(r.change1d)}
                        </p>
                      </div>
                      {fullScreen
                        ? appliedResultColumns.map((col) => {
                          const raw = r.indicatorValues[col.key];
                          return (
                            <div key={`${r.symbol}-${col.key}`} className="w-[120px] px-3 text-right">
                              <p className="text-[14px] leading-5 font-medium text-[#262626] tabular-nums">
                                {typeof raw === "number" && Number.isFinite(raw) ? raw.toFixed(2) : "—"}
                              </p>
                            </div>
                          );
                        })
                        : null}

                      <div className="w-[100px] px-3 text-right">
                        <p className="text-[14px] leading-5 font-medium text-[#262626] tabular-nums">{formatInr(dayLow)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            </div>
          </div>
          {applyError && (
            <p className="text-xs text-destructive mt-3 bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
              {applyError}
            </p>
          )}
          {fullScreen ? (
            <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#E9E1F2] bg-white/95 backdrop-blur">
              <div className="mx-auto w-full max-w-[1200px] px-4 py-3 lg:px-6">
                <div className="flex items-center justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setIsEditingScreenerName(true)}
                    className="h-12 w-12 border-[#E1E1E1] text-[#777777] hover:text-[#262626] hover:bg-white"
                    aria-label="Edit screener"
                    title="Edit screener"
                  >
                    <Pencil className="h-5 w-5" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 border-[#E1E1E1] text-[#777777] hover:text-[#262626] hover:bg-white"
                    aria-label="Share screener"
                    title="Share screener"
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 border-[#E1E1E1] text-[#777777] hover:text-[#262626] hover:bg-white"
                    aria-label="Set alerts"
                    title="Set alerts"
                  >
                    <BellRing className="h-5 w-5" />
                  </Button>
                  <Button className="h-12 min-w-[170px] px-8 bg-[#542087] text-white hover:bg-[#4A1C78] text-lg font-semibold shadow-[0_6px_16px_rgba(84,32,135,0.28)]">
                    Save
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
      </div>

      {/* Filter dialog */}
      <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
        <DialogContent
          className="!p-0 !gap-0 !border-0 !shadow-none !rounded-t-2xl !rounded-b-none !bg-white w-full max-w-none h-[573px] max-h-[calc(100vh-20px)] overflow-hidden !left-0 !top-auto !bottom-0 !translate-x-0 !translate-y-0 sm:rounded-t-2xl [&>button]:hidden"
        >
          <div className="h-full flex flex-col bg-white">
            <div className="flex items-center justify-between px-4 py-4 border-b border-[#F1F1F1]">
              <p className="text-[16px] font-medium leading-6 text-[#262626]">
                {indicator === "price"
                  ? "Price"
                  : indicator === "ema"
                    ? "EMA"
                    : indicator === "rsi"
                      ? "RSI"
                      : "MACD"}{" "}
                Filter
              </p>
              <DialogClose asChild>
                <button
                  type="button"
                  className="h-6 w-6 inline-flex items-center justify-center text-[#777777]"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </DialogClose>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              <p className="text-[14px] leading-5 text-[#777777]">
                Pick a condition and interval length. Quick scan uses Nifty 50 for speed.
              </p>

              {indicator === "rsi" && (
                <RsiFilter
                  mode={rsiMode}
                  min={rsiMin}
                  max={rsiMax}
                  onChangeMode={setRsiMode}
                  onChangeMin={setRsiMin}
                  onChangeMax={setRsiMax}
                />
              )}

              {indicator === "ema" && <EmaFilter side={emaSide} onChangeSide={setEmaSide} period={emaPeriod} />}

              {indicator === "macd" && (
                <MacdFilter
                  side={macdSide}
                  onChangeSide={setMacdSide}
                  fast={macdFast}
                  slow={macdSlow}
                  signal={macdSignal}
                />
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

            <div className="px-4 py-3 border-t border-[#F1F1F1]">
              <Button
                onClick={() => void apply()}
                className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                disabled={isApplying}
              >
                {isApplying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
              </Button>
              <p className="text-[10px] text-[#777777] mt-2 leading-relaxed">
                Results update after scan completes. Intraday intervals map to 15-minute candle data.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* App scanners only: copied indicator picker (delinked from /diy) */}
      <Dialog
        open={catalogOpen}
        onOpenChange={(open) => {
          setCatalogOpen(open);
          if (!open) setCatalogSearch("");
        }}
      >
        <DialogContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="!p-0 !gap-0 !inset-0 !left-0 !top-0 !bottom-0 !translate-x-0 !translate-y-0 !w-screen !max-w-none !h-[100dvh] !max-h-[100dvh] overflow-hidden border-0 rounded-none [&>button]:hidden"
        >
          <div className="h-[100dvh] flex flex-col bg-white overflow-hidden">
            <div className="shrink-0 border-b border-[#E1E1E1]">
              <div className="flex items-center justify-between gap-2 px-3 pt-3 pb-2">
                <DialogTitle className="text-base font-semibold text-[#262626] p-0 m-0 text-left">
                  Add filters
                </DialogTitle>
                <DialogClose asChild>
                  <button
                    type="button"
                    className="shrink-0 text-[#777777] p-1"
                    aria-label="Close indicator picker"
                  >
                    <X size={16} />
                  </button>
                </DialogClose>
              </div>
              <div className="px-3 pb-3">
                <div className="relative min-w-0">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#777777] pointer-events-none" />
                  <Input
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    placeholder="Search all indicators…"
                    className="h-10 w-full pl-8 pr-3 border-[#542087] focus-visible:ring-[#542087]"
                    aria-label="Search indicators across all categories"
                  />
                </div>
              </div>
            </div>

            <div className="flex-1 min-h-0 flex overflow-hidden">
              {!isCatalogGlobalSearch ? (
                <div className="w-[40%] border-r border-[#E1E1E1] overflow-y-auto overscroll-contain">
                  {PICKER_GROUPS.map((group) => {
                    const active = group === catalogGroup;
                    return (
                      <button
                        key={group}
                        type="button"
                        onClick={() => setCatalogGroup(group)}
                        className={cn(
                          "w-full h-10 px-4 flex items-center justify-between text-left text-[14px] border-b border-[#F5F5F5]",
                          active ? "bg-[#F5F2F9] text-[#542087] font-medium" : "bg-white text-[#262626] font-normal"
                        )}
                      >
                        <span className="truncate">{group}</span>
                        <ChevronRight size={12} className="text-[#777777]" />
                      </button>
                    );
                  })}
                </div>
              ) : null}

              <div
                className={cn(
                  "flex-1 min-h-0 overflow-y-auto overscroll-contain min-w-0",
                  isCatalogGlobalSearch ? "pt-2 px-1" : catalogTechnicalStyle ? "pt-2" : "pt-3"
                )}
              >
                {isCatalogGlobalSearch ? (
                  globalCatalogSearchSections.length === 0 ? (
                    <p className="px-3 py-6 text-sm text-muted-foreground text-center">
                      No indicators match your search.
                    </p>
                  ) : (
                    globalCatalogSearchSections.map((block) => (
                      <div key={block.category} className="mb-2">
                        <div className="px-3 py-2 text-xs font-bold text-[#262626]">{block.category}</div>
                        {block.items.map((item) => (
                          <button
                            key={`${block.category}-${item}`}
                            type="button"
                            onClick={() => handleCatalogItemClick(item, block.category)}
                            className="w-full flex items-center justify-between text-left transition-colors px-3 py-2.5 text-sm rounded-lg text-[#262626] hover:bg-primary/5 mb-0.5"
                          >
                            <span className="text-sm">{item}</span>
                            <span className="text-muted-foreground shrink-0 text-sm leading-none">›</span>
                          </button>
                        ))}
                      </div>
                    ))
                  )
                ) : (
                  catalogSections.map((section, sectionIdx) => (
                    <div key={`${section.title}-${sectionIdx}`} className={catalogTechnicalStyle ? "mb-1" : ""}>
                      {section.title ? (
                        <div
                          className={cn(
                            catalogTechnicalStyle
                              ? "px-3 py-2 text-[16px] font-bold leading-5 text-[#262626]"
                              : "px-4 py-2 text-[11px] font-semibold tracking-wide uppercase text-[#777777] bg-[#FAFAFA] border-y border-[#F1F1F1]"
                          )}
                        >
                          {section.title}
                        </div>
                      ) : null}
                      {section.items.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => handleCatalogItemClick(item)}
                          className={cn(
                            "w-full flex items-center justify-between text-left transition-colors",
                            catalogTechnicalStyle
                              ? "px-3 py-2.5 text-sm rounded-lg text-[#262626] hover:bg-primary/5 mb-0.5"
                              : "h-10 px-4 text-[14px] leading-5 text-[#262626] border-b border-[#F7F7F7]"
                          )}
                        >
                          <span className={catalogTechnicalStyle ? "text-sm" : "text-[14px] leading-5"}>{item}</span>
                          {catalogTechnicalStyle ? (
                            <span className="text-muted-foreground shrink-0 text-sm leading-none">›</span>
                          ) : (
                            <ChevronRight size={14} className="text-[#777777] shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Candlestick timeframe sheet (app/scanners only) */}
      <Dialog open={candlestickConfigOpen} onOpenChange={setCandlestickConfigOpen}>
        <DialogContent
          className="!p-0 !gap-0 !border-0 !shadow-none !rounded-t-2xl !rounded-b-none !bg-white w-full max-w-none h-auto max-h-[calc(100vh-20px)] overflow-hidden !left-0 !top-auto !bottom-0 !translate-x-0 !translate-y-0 sm:rounded-t-2xl [&>button]:hidden"
        >
          <div className="flex flex-col bg-white">
            <div className="flex items-center justify-between px-4 py-4 border-b border-[#F1F1F1]">
              <p className="text-[16px] font-medium leading-6 text-[#262626]">
                Doji detection
              </p>
              <DialogClose asChild>
                <button
                  type="button"
                  className="h-6 w-6 inline-flex items-center justify-center text-[#777777]"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </DialogClose>
            </div>

            <div className="overflow-y-auto px-4 py-4 space-y-4 max-h-[calc(100vh-180px)]">
              <div className="space-y-2">
                <p className="text-[14px] font-medium leading-5 text-[#262626]">Timeframe</p>
                <div className="flex flex-wrap gap-2">
                  {CANDLESTICK_INTERVALS.map((interval) => (
                    <button
                      key={interval.id}
                      type="button"
                      onClick={() => setCandlestickDraft({ timeframeId: interval.id })}
                      className={cn(
                        "h-8 px-3 rounded border text-xs",
                        candlestickDraft.timeframeId === interval.id
                          ? "border-[#37135B] text-[#37135B] bg-[#FBF8FD]"
                          : "border-[#E1E1E1]"
                      )}
                    >
                      {interval.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-4 py-3 border-t border-[#F1F1F1]">
              <Button
                onClick={applyCandlestickCriteria}
                className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
              >
                Apply
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Technical criteria sheet (app/scanners only) */}
      <Dialog open={technicalConfigOpen} onOpenChange={setTechnicalConfigOpen}>
        <DialogContent
          className="!p-0 !gap-0 !border-0 !shadow-none !rounded-t-2xl !rounded-b-none !bg-white w-full max-w-none h-auto max-h-[calc(100vh-20px)] overflow-hidden !left-0 !top-auto !bottom-0 !translate-x-0 !translate-y-0 sm:rounded-t-2xl [&>button]:hidden"
        >
          {activeTechnicalFilter ? (
            <div className="flex flex-col bg-white">
              {(() => {
                const def = getTechnicalIndicatorDef(activeTechnicalFilter);
                const benchStyle = getTechnicalBenchmarkUiStyle(def);
                const tfLabel =
                  CANDLESTICK_INTERVALS.find((i) => i.id === technicalDraft.timeframeId)?.label ?? technicalDraft.timeframeId;
                const ruleSummary =
                  def.outputType === "pattern"
                    ? `Pattern · ${tfLabel}`
                    : technicalDraft.mode === "custom"
                      ? `between ${technicalDraft.min} and ${technicalDraft.max}`
                      : `${technicalDraft.mode === "higher_than" ? ">" : "<"} ${formatTechnicalBenchmarkSummary(technicalDraft, def)}`;

                return (
                  <>
                    <div className="flex items-center justify-between px-4 py-4 border-b border-[#F1F1F1]">
                      <p className="text-[16px] font-medium leading-6 text-[#262626] pr-2">{def.name}</p>
                      <DialogClose asChild>
                        <button
                          type="button"
                          className="h-6 w-6 inline-flex items-center justify-center text-[#777777] shrink-0"
                          aria-label="Close"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </DialogClose>
                    </div>

                    <div className="overflow-y-auto px-4 py-4 space-y-4 max-h-[calc(100vh-180px)]">
                      <div className="space-y-2">
                        <p className="text-[14px] font-medium leading-5 text-[#262626]">Timeframe</p>
                        <div className="flex flex-wrap gap-2">
                          {CANDLESTICK_INTERVALS.map((interval) => (
                            <button
                              key={interval.id}
                              type="button"
                              onClick={() => setTechnicalDraft((p) => ({ ...p, timeframeId: interval.id }))}
                              className={cn(
                                "h-8 px-3 rounded border text-xs",
                                technicalDraft.timeframeId === interval.id
                                  ? "border-[#37135B] text-[#37135B] bg-[#FBF8FD]"
                                  : "border-[#E1E1E1]"
                              )}
                            >
                              {interval.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {def.outputType === "pattern" ? (
                        <>
                          <p className="text-[12px] leading-5 text-[#777777]">
                            This indicator is evaluated as a pattern on the selected timeframe.
                          </p>
                          <p className="text-[12px] text-[#777777]">Current rule: {ruleSummary}</p>
                        </>
                      ) : (
                        <>
                          {def.params.length > 0 ? (
                            <div className="space-y-3">
                              <p className="text-[14px] font-medium leading-5 text-[#262626]">Parameters</p>
                              {def.params.map((param) =>
                                param.type === "number" ? (
                                  <div key={param.key} className="space-y-1">
                                    <p className="text-[10px] text-muted-foreground font-medium">{param.label}</p>
                                    <Input
                                      type="number"
                                      value={technicalDraft.paramValues[param.key] ?? param.defaultValue}
                                      onChange={(e) =>
                                        setTechnicalDraft((prev) => ({
                                          ...prev,
                                          paramValues: {
                                            ...prev.paramValues,
                                            [param.key]: Number(e.target.value) || 0,
                                          },
                                        }))
                                      }
                                    />
                                  </div>
                                ) : param.type === "select" ? (
                                  <div key={param.key} className="space-y-1">
                                    <p className="text-[10px] text-muted-foreground font-medium">{param.label}</p>
                                    <select
                                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                      value={technicalDraft.paramSelect[param.key] ?? param.defaultValue}
                                      onChange={(e) =>
                                        setTechnicalDraft((prev) => ({
                                          ...prev,
                                          paramSelect: {
                                            ...prev.paramSelect,
                                            [param.key]: e.target.value,
                                          },
                                        }))
                                      }
                                    >
                                      {param.options.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                          {opt.label}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                ) : null
                              )}
                            </div>
                          ) : null}

                          <div className="space-y-2">
                            <p className="text-[14px] font-medium text-[#262626]">Rule</p>
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => setTechnicalDraft((p) => ({ ...p, mode: "higher_than" }))}
                                className={cn(
                                  "h-8 px-3 rounded border text-xs",
                                  technicalDraft.mode === "higher_than"
                                    ? "border-[#37135B] text-[#37135B] bg-[#FBF8FD]"
                                    : "border-[#E1E1E1]"
                                )}
                              >
                                Higher than
                              </button>
                              <button
                                type="button"
                                onClick={() => setTechnicalDraft((p) => ({ ...p, mode: "lower_than" }))}
                                className={cn(
                                  "h-8 px-3 rounded border text-xs",
                                  technicalDraft.mode === "lower_than"
                                    ? "border-[#37135B] text-[#37135B] bg-[#FBF8FD]"
                                    : "border-[#E1E1E1]"
                                )}
                              >
                                Lower than
                              </button>
                              <button
                                type="button"
                                onClick={() => setTechnicalDraft((p) => ({ ...p, mode: "custom" }))}
                                className={cn(
                                  "h-8 px-3 rounded border text-xs",
                                  technicalDraft.mode === "custom"
                                    ? "border-[#37135B] text-[#37135B] bg-[#FBF8FD]"
                                    : "border-[#E1E1E1]"
                                )}
                              >
                                Custom range
                              </button>
                            </div>
                          </div>

                          {technicalDraft.mode !== "custom" ? (
                            benchStyle === "moving_average" ? (
                              <div className="space-y-2">
                                <p className="text-[14px] font-medium leading-5 text-[#262626]">Benchmark parameter</p>
                                <div className="space-y-2">
                                  <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[12px] leading-5 text-[#262626]">
                                      <input
                                        type="radio"
                                        className="accent-primary"
                                        checked={technicalDraft.technicalBenchmarkKind === "underlying_price"}
                                        onChange={() =>
                                          setTechnicalDraft((p) => ({ ...p, technicalBenchmarkKind: "underlying_price" }))
                                        }
                                      />
                                      <span>Underlying price</span>
                                    </label>
                                    {technicalDraft.technicalBenchmarkKind === "underlying_price" ? (
                                      <div className="pl-6 space-y-2">
                                        <p className="text-[12px] font-medium leading-5 text-[#262626]">Field</p>
                                        <div className="flex flex-wrap gap-2">
                                          {(["close", "open", "high", "low"] as const).map((field) => (
                                            <button
                                              key={field}
                                              type="button"
                                              onClick={() =>
                                                setTechnicalDraft((p) => ({ ...p, underlyingPriceField: field }))
                                              }
                                              className={cn(
                                                "h-8 px-3 rounded border text-xs capitalize",
                                                technicalDraft.underlyingPriceField === field
                                                  ? "border-[#37135B] text-[#37135B] bg-[#FBF8FD]"
                                                  : "border-[#E1E1E1]"
                                              )}
                                            >
                                              {field}
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    ) : null}
                                  </div>
                                  {(
                                    [
                                      { kind: "sma" as const, label: "SMA (length)" },
                                      { kind: "ema" as const, label: "EMA (length)" },
                                      { kind: "wma" as const, label: "WMA (length)" },
                                    ] as const
                                  ).map(({ kind, label: kindLabel }) => (
                                    <div key={kind} className="space-y-2">
                                      <label className="flex items-center gap-2 text-[12px] leading-5 text-[#262626]">
                                        <input
                                          type="radio"
                                          className="accent-primary"
                                          checked={technicalDraft.technicalBenchmarkKind === kind}
                                          onChange={() =>
                                            setTechnicalDraft((p) => ({ ...p, technicalBenchmarkKind: kind }))
                                          }
                                        />
                                        <span>{kindLabel}</span>
                                      </label>
                                      {technicalDraft.technicalBenchmarkKind === kind ? (
                                        <div className="pl-6 space-y-2">
                                          <p className="text-[12px] font-medium leading-5 text-[#262626]">Length</p>
                                          <div className="flex flex-wrap gap-2">
                                            {TECHNICAL_MA_BENCHMARK_LENGTHS.map((len) => (
                                              <button
                                                key={len}
                                                type="button"
                                                onClick={() =>
                                                  setTechnicalDraft((p) => ({ ...p, benchmarkOtherLength: len }))
                                                }
                                                className={cn(
                                                  "h-8 px-3 rounded border text-xs",
                                                  technicalDraft.benchmarkOtherLength === len
                                                    ? "border-[#37135B] text-[#37135B] bg-[#FBF8FD]"
                                                    : "border-[#E1E1E1]"
                                                )}
                                              >
                                                {len}
                                              </button>
                                            ))}
                                          </div>
                                        </div>
                                      ) : null}
                                    </div>
                                  ))}
                                  <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[12px] leading-5 text-[#262626]">
                                      <input
                                        type="radio"
                                        className="accent-primary"
                                        checked={technicalDraft.technicalBenchmarkKind === "value_rs"}
                                        onChange={() =>
                                          setTechnicalDraft((p) => ({ ...p, technicalBenchmarkKind: "value_rs" }))
                                        }
                                      />
                                      <span>Value (₹)</span>
                                    </label>
                                    {technicalDraft.technicalBenchmarkKind === "value_rs" ? (
                                      <div className="pl-6 space-y-1">
                                        <p className="text-[10px] text-muted-foreground font-medium">Enter amount (₹)</p>
                                        <Input
                                          type="number"
                                          value={technicalDraft.value}
                                          onChange={(e) =>
                                            setTechnicalDraft((prev) => ({
                                              ...prev,
                                              value: Number(e.target.value) || 0,
                                            }))
                                          }
                                        />
                                      </div>
                                    ) : null}
                                  </div>
                                </div>
                              </div>
                            ) : benchStyle === "macd" ? (
                              <div className="space-y-2">
                                <p className="text-[14px] font-medium leading-5 text-[#262626]">Benchmark parameter</p>
                                <div className="space-y-2">
                                  {(
                                    [
                                      { kind: "macd_signal" as const, label: "MACD Signal" },
                                      { kind: "zero_line" as const, label: "Zero line" },
                                      { kind: "value_level" as const, label: "Value (level)" },
                                    ] as const
                                  ).map(({ kind, label: optLabel }) => (
                                    <label
                                      key={kind}
                                      className="flex items-center gap-2 text-[12px] leading-5 text-[#262626]"
                                    >
                                      <input
                                        type="radio"
                                        className="accent-primary"
                                        checked={technicalDraft.technicalBenchmarkKind === kind}
                                        onChange={() =>
                                          setTechnicalDraft((p) => ({ ...p, technicalBenchmarkKind: kind }))
                                        }
                                      />
                                      <span>{optLabel}</span>
                                    </label>
                                  ))}
                                </div>
                                {technicalDraft.technicalBenchmarkKind === "value_level" ? (
                                  <div className="space-y-1 pt-1">
                                    <p className="text-[10px] text-muted-foreground font-medium">Level</p>
                                    <Input
                                      type="number"
                                      value={technicalDraft.value}
                                      onChange={(e) =>
                                        setTechnicalDraft((prev) => ({
                                          ...prev,
                                          value: Number(e.target.value) || 0,
                                        }))
                                      }
                                    />
                                  </div>
                                ) : null}
                              </div>
                            ) : benchStyle === "pivot_or_volume" ? (
                              <div className="space-y-2">
                                <p className="text-[14px] font-medium leading-5 text-[#262626]">Benchmark parameter</p>
                                <div className="space-y-2">
                                  <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[12px] leading-5 text-[#262626]">
                                      <input
                                        type="radio"
                                        className="accent-primary"
                                        checked={technicalDraft.technicalBenchmarkKind === "underlying_price"}
                                        onChange={() =>
                                          setTechnicalDraft((p) => ({ ...p, technicalBenchmarkKind: "underlying_price" }))
                                        }
                                      />
                                      <span>Underlying price</span>
                                    </label>
                                    {technicalDraft.technicalBenchmarkKind === "underlying_price" ? (
                                      <div className="pl-6 space-y-2">
                                        <p className="text-[12px] font-medium leading-5 text-[#262626]">Field</p>
                                        <div className="flex flex-wrap gap-2">
                                          {(["close", "open", "high", "low"] as const).map((field) => (
                                            <button
                                              key={field}
                                              type="button"
                                              onClick={() =>
                                                setTechnicalDraft((p) => ({ ...p, underlyingPriceField: field }))
                                              }
                                              className={cn(
                                                "h-8 px-3 rounded border text-xs capitalize",
                                                technicalDraft.underlyingPriceField === field
                                                  ? "border-[#37135B] text-[#37135B] bg-[#FBF8FD]"
                                                  : "border-[#E1E1E1]"
                                              )}
                                            >
                                              {field}
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    ) : null}
                                  </div>
                                  <label className="flex items-center gap-2 text-[12px] leading-5 text-[#262626]">
                                    <input
                                      type="radio"
                                      className="accent-primary"
                                      checked={technicalDraft.technicalBenchmarkKind === "value_rs"}
                                      onChange={() =>
                                        setTechnicalDraft((p) => ({ ...p, technicalBenchmarkKind: "value_rs" }))
                                      }
                                    />
                                    <span>Value (₹)</span>
                                  </label>
                                </div>
                                {technicalDraft.technicalBenchmarkKind === "value_rs" ? (
                                  <div className="space-y-1 pt-1">
                                    <p className="text-[10px] text-muted-foreground font-medium">Enter amount (₹)</p>
                                    <Input
                                      type="number"
                                      value={technicalDraft.value}
                                      onChange={(e) =>
                                        setTechnicalDraft((prev) => ({
                                          ...prev,
                                          value: Number(e.target.value) || 0,
                                        }))
                                      }
                                    />
                                  </div>
                                ) : null}
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <p className="text-[14px] font-medium leading-5 text-[#262626]">Benchmark parameter</p>
                                <div className="space-y-1">
                                  <p className="text-[10px] text-muted-foreground font-medium">Value (level)</p>
                                  <Input
                                    type="number"
                                    value={technicalDraft.value}
                                    onChange={(e) =>
                                      setTechnicalDraft((prev) => ({
                                        ...prev,
                                        technicalBenchmarkKind: "value_level",
                                        value: Number(e.target.value) || 0,
                                      }))
                                    }
                                  />
                                </div>
                              </div>
                            )
                          ) : (
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <p className="text-[10px] text-muted-foreground font-medium">Min</p>
                                <Input
                                  type="number"
                                  value={technicalDraft.min}
                                  onChange={(e) =>
                                    setTechnicalDraft((prev) => ({
                                      ...prev,
                                      min: Number(e.target.value) || 0,
                                    }))
                                  }
                                />
                              </div>
                              <div className="space-y-1">
                                <p className="text-[10px] text-muted-foreground font-medium">Max</p>
                                <Input
                                  type="number"
                                  value={technicalDraft.max}
                                  onChange={(e) =>
                                    setTechnicalDraft((prev) => ({
                                      ...prev,
                                      max: Number(e.target.value) || 0,
                                    }))
                                  }
                                />
                              </div>
                            </div>
                          )}

                          <p className="text-[12px] text-[#777777]">
                            Current rule: {ruleSummary} · {tfLabel}
                          </p>
                        </>
                      )}
                    </div>

                    <div className="px-4 py-3 border-t border-[#F1F1F1]">
                      <Button
                        onClick={applyTechnicalCriteria}
                        className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                      >
                        Apply
                      </Button>
                    </div>
                  </>
                );
              })()}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Valuation criteria sheet (app/scanners only) */}
      <Dialog open={valuationConfigOpen} onOpenChange={setValuationConfigOpen}>
        <DialogContent
          className="!p-0 !gap-0 !border-0 !shadow-none !rounded-t-2xl !rounded-b-none !bg-white w-full max-w-none h-auto max-h-[calc(100vh-20px)] overflow-hidden !left-0 !top-auto !bottom-0 !translate-x-0 !translate-y-0 sm:rounded-t-2xl [&>button]:hidden"
        >
          <div className="flex flex-col bg-white">
            <div className="flex items-center justify-between px-4 py-4 border-b border-[#F1F1F1]">
              <p className="text-[16px] font-medium leading-6 text-[#262626]">
                {activeValuationFilter ?? "Valuation"}
              </p>
              <DialogClose asChild>
                <button
                  type="button"
                  className="h-6 w-6 inline-flex items-center justify-center text-[#777777]"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </DialogClose>
            </div>

            <div className="overflow-y-auto px-4 py-4 space-y-4 max-h-[calc(100vh-180px)]">
              {(() => {
                const targets = getValuationCompareTargets(activeValuationFilter);
                const isDirectValueOnlyShareholding = activeValuationFilter
                  ? SHAREHOLDING_DIRECT_VALUE_ONLY.has(activeValuationFilter)
                  : false;
                const supportsIndustryComparison = targets.length > 0;
                const benchmarkOptions = [...targets, "Value"];
                const valueUnit = getValuationValueUnit(activeValuationFilter);
                const showLengthSelector = ["Volume SMA", "Volume EMA", "Relative Volume", "Chaikin Money Flow"].includes(
                  activeValuationFilter ?? ""
                );
                const isIndustryBenchmark = valuationDraft.benchmarkLabel.startsWith("Industry ");
                const isAverageVolumeBenchmark = valuationDraft.benchmarkLabel === "Average Volume";
                const formattedBenchmarkLabel =
                  valuationDraft.benchmarkLabel === "Volume EMA" || valuationDraft.benchmarkLabel === "Volume SMA"
                    ? `${valuationDraft.benchmarkLabel} (${valuationDraft.maLength})`
                    : valuationDraft.benchmarkLabel === "Average Volume"
                      ? `Average Volume (${valuationDraft.averageVolumeWindow})`
                    : valuationDraft.benchmarkLabel;
                const currentRuleLabel =
                  valuationDraft.mode === "custom"
                    ? `between ${valuationDraft.min} and ${valuationDraft.max}${valueUnit === "%" ? "%" : ""}`
                    : isDirectValueOnlyShareholding
                      ? `${valuationDraft.mode === "higher_than_industry" ? ">" : "<"} ${valuationDraft.value}${valueUnit === "%" ? "%" : valueUnit === "count" ? "" : ` ${valueUnit}`}`
                    : isIndustryBenchmark
                      ? `${valuationDraft.mode === "higher_than_industry" ? ">" : "<"} ${valuationDraft.benchmarkLabel} by ${valuationDraft.marginPercent}%`
                    : valuationDraft.benchmarkLabel === "Value"
                      ? `${valuationDraft.mode === "higher_than_industry" ? ">" : "<"} ${valuationDraft.value}${valueUnit === "%" ? "%" : ` ${valueUnit}`}`
                      : `${valuationDraft.mode === "higher_than_industry" ? ">" : "<"} ${formattedBenchmarkLabel}`;

                return (
                  <>
                    {showLengthSelector ? (
                      <div className="space-y-2">
                        <p className="text-[14px] font-medium leading-5 text-[#262626]">Length</p>
                        <div className="flex flex-wrap gap-2">
                          {[10, 20, 50].map((len) => (
                            <button
                              key={len}
                              type="button"
                              onClick={() =>
                                setValuationDraft((prev) => ({
                                  ...prev,
                                  maLength: len as 10 | 20 | 50,
                                }))
                              }
                              className={cn(
                                "h-8 px-3 rounded border text-xs",
                                valuationDraft.maLength === len
                                  ? "border-[#37135B] text-[#37135B] bg-[#FBF8FD]"
                                  : "border-[#E1E1E1]"
                              )}
                            >
                              {len}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    {supportsIndustryComparison ? (
                      <>
                        <p className="text-[14px] font-medium text-[#262626]">Rule</p>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setValuationDraft((p) => ({ ...p, mode: "higher_than_industry" }))}
                            className={cn(
                              "h-8 px-3 rounded border text-xs",
                              valuationDraft.mode === "higher_than_industry"
                                ? "border-[#37135B] text-[#37135B] bg-[#FBF8FD]"
                                : "border-[#E1E1E1]"
                            )}
                          >
                            Higher than
                          </button>
                          <button
                            type="button"
                            onClick={() => setValuationDraft((p) => ({ ...p, mode: "lower_than_industry" }))}
                            className={cn(
                              "h-8 px-3 rounded border text-xs",
                              valuationDraft.mode === "lower_than_industry"
                                ? "border-[#37135B] text-[#37135B] bg-[#FBF8FD]"
                                : "border-[#E1E1E1]"
                            )}
                          >
                            Lower than
                          </button>
                          <button
                            type="button"
                            onClick={() => setValuationDraft((p) => ({ ...p, mode: "custom" }))}
                            className={cn(
                              "h-8 px-3 rounded border text-xs",
                              valuationDraft.mode === "custom"
                                ? "border-[#37135B] text-[#37135B] bg-[#FBF8FD]"
                                : "border-[#E1E1E1]"
                            )}
                          >
                            Custom range
                          </button>
                        </div>
                      </>
                    ) : null}

                    {isDirectValueOnlyShareholding && valuationDraft.mode !== "custom" ? (
                      <div className="space-y-2">
                        <p className="text-[14px] font-medium leading-5 text-[#262626]">Enter value</p>
                        <div className="space-y-1 pt-1">
                          <p className="text-[10px] text-muted-foreground font-medium">
                            Value ({valueUnit === "count" ? "count" : valueUnit})
                          </p>
                          <Input
                            type="number"
                            value={valuationDraft.value}
                            onChange={(e) =>
                              setValuationDraft((prev) => ({
                                ...prev,
                                value: Number(e.target.value) || 0,
                              }))
                            }
                          />
                        </div>
                      </div>
                    ) : supportsIndustryComparison && valuationDraft.mode !== "custom" ? (
                      <div className="space-y-2">
                        <p className="text-[14px] font-medium leading-5 text-[#262626]">Benchmark parameter</p>
                        <div className="space-y-2">
                          {benchmarkOptions.map((target) => {
                            const isSelected = valuationDraft.benchmarkLabel === target;
                            const showInlineLength = isSelected && (target === "Volume EMA" || target === "Volume SMA");
                            return (
                              <div key={target} className="space-y-2">
                                <label className="flex items-center gap-2 text-[12px] leading-5 text-[#262626]">
                                  <input
                                    type="radio"
                                    checked={isSelected}
                                    onChange={() =>
                                      setValuationDraft((prev) => ({
                                        ...prev,
                                        benchmarkLabel: target,
                                      }))
                                    }
                                    className="accent-primary"
                                  />
                                  <span>{target}</span>
                                </label>
                                {showInlineLength ? (
                                  <div className="pl-6 space-y-2">
                                    <p className="text-[12px] font-medium leading-5 text-[#262626]">Length</p>
                                    <div className="flex flex-wrap gap-2">
                                      {[10, 20, 50].map((len) => (
                                        <button
                                          key={len}
                                          type="button"
                                          onClick={() =>
                                            setValuationDraft((prev) => ({
                                              ...prev,
                                              maLength: len as 10 | 20 | 50,
                                            }))
                                          }
                                          className={cn(
                                            "h-8 px-3 rounded border text-xs",
                                            valuationDraft.maLength === len
                                              ? "border-[#37135B] text-[#37135B] bg-[#FBF8FD]"
                                              : "border-[#E1E1E1]"
                                          )}
                                        >
                                          {len}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                ) : null}
                                {isSelected && isAverageVolumeBenchmark ? (
                                  <div className="pl-6 space-y-2">
                                    <p className="text-[12px] font-medium leading-5 text-[#262626]">Period</p>
                                    <div className="flex flex-wrap gap-2">
                                      {(["20D", "1 Week", "1 Month", "3 Months"] as const).map((window) => (
                                        <button
                                          key={window}
                                          type="button"
                                          onClick={() =>
                                            setValuationDraft((prev) => ({
                                              ...prev,
                                              averageVolumeWindow: window,
                                            }))
                                          }
                                          className={cn(
                                            "h-8 px-3 rounded border text-xs",
                                            valuationDraft.averageVolumeWindow === window
                                              ? "border-[#37135B] text-[#37135B] bg-[#FBF8FD]"
                                              : "border-[#E1E1E1]"
                                          )}
                                        >
                                          {window}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                ) : null}
                              </div>
                            );
                          })}
                        </div>
                        {valuationDraft.benchmarkLabel === "Value" ? (
                          <div className="space-y-1 pt-1">
                            <p className="text-[10px] text-muted-foreground font-medium">Enter value ({valueUnit})</p>
                            <Input
                              type="number"
                              value={valuationDraft.value}
                              onChange={(e) =>
                                setValuationDraft((prev) => ({
                                  ...prev,
                                  value: Number(e.target.value) || 0,
                                }))
                              }
                            />
                          </div>
                        ) : isIndustryBenchmark ? (
                          <div className="space-y-1 pt-1">
                            <p className="text-[10px] text-muted-foreground font-medium">
                              Margin ({valuationDraft.mode === "higher_than_industry" ? "Higher" : "Lower"} than {valuationDraft.benchmarkLabel})
                            </p>
                            <Input
                              type="number"
                              value={valuationDraft.marginPercent}
                              onChange={(e) =>
                                setValuationDraft((prev) => ({
                                  ...prev,
                                  marginPercent: Number(e.target.value) || 0,
                                }))
                              }
                            />
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <p className="text-[10px] text-muted-foreground font-medium">Min Value ({valueUnit})</p>
                          <Input
                            type="number"
                            value={valuationDraft.min}
                            onChange={(e) =>
                              setValuationDraft((prev) => ({
                                ...prev,
                                min: Number(e.target.value) || 0,
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] text-muted-foreground font-medium">Max Value ({valueUnit})</p>
                          <Input
                            type="number"
                            value={valuationDraft.max}
                            onChange={(e) =>
                              setValuationDraft((prev) => ({
                                ...prev,
                                max: Number(e.target.value) || 0,
                              }))
                            }
                          />
                        </div>
                      </div>
                    )}
                    <p className="text-[12px] text-[#777777]">Current rule: {currentRuleLabel}</p>
                  </>
                );
              })()}
            </div>

            <div className="px-4 py-3 border-t border-[#F1F1F1]">
              <Button
                onClick={applyValuationCriteria}
                className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
              >
                Apply
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Income & Growth criteria sheet (app/scanners only) */}
      <Dialog open={incomeGrowthConfigOpen} onOpenChange={setIncomeGrowthConfigOpen}>
        <DialogContent
          className="!p-0 !gap-0 !border-0 !shadow-none !rounded-t-2xl !rounded-b-none !bg-white w-full max-w-none h-auto max-h-[calc(100vh-20px)] overflow-hidden !left-0 !top-auto !bottom-0 !translate-x-0 !translate-y-0 sm:rounded-t-2xl [&>button]:hidden"
        >
          <div className="flex flex-col bg-white">
            <div className="flex items-center justify-between px-4 py-4 border-b border-[#F1F1F1]">
              <p className="text-[16px] font-medium leading-6 text-[#262626]">
                {activeIncomeGrowthFilter ?? "Income & Growth"}
              </p>
              <DialogClose asChild>
                <button
                  type="button"
                  className="h-6 w-6 inline-flex items-center justify-center text-[#777777]"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </DialogClose>
            </div>

            <div className="overflow-y-auto px-4 py-4 space-y-4 max-h-[calc(100vh-180px)]">
              {(() => {
                const targets = getIncomeGrowthCompareTargets(activeIncomeGrowthFilter);
                const benchmarkOptions = [...targets, "Value"];
                const valueUnit = getIncomeGrowthValueUnit(activeIncomeGrowthFilter);
                const currentRuleLabel =
                  incomeGrowthDraft.mode === "custom"
                    ? `between ${incomeGrowthDraft.min} and ${incomeGrowthDraft.max}${valueUnit === "%" ? "%" : ` ${valueUnit}`}`
                    : incomeGrowthDraft.benchmarkLabel === "Value"
                      ? `${incomeGrowthDraft.mode === "higher_than_benchmark" ? ">" : "<"} ${incomeGrowthDraft.value}${valueUnit === "%" ? "%" : ` ${valueUnit}`}`
                      : `${incomeGrowthDraft.mode === "higher_than_benchmark" ? ">" : "<"} ${incomeGrowthDraft.benchmarkLabel}`;

                return (
                  <>
                    <p className="text-[14px] font-medium text-[#262626]">Rule</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setIncomeGrowthDraft((p) => ({ ...p, mode: "higher_than_benchmark" }))}
                        className={cn(
                          "h-8 px-3 rounded border text-xs",
                          incomeGrowthDraft.mode === "higher_than_benchmark"
                            ? "border-[#37135B] text-[#37135B] bg-[#FBF8FD]"
                            : "border-[#E1E1E1]"
                        )}
                      >
                        Higher than
                      </button>
                      <button
                        type="button"
                        onClick={() => setIncomeGrowthDraft((p) => ({ ...p, mode: "lower_than_benchmark" }))}
                        className={cn(
                          "h-8 px-3 rounded border text-xs",
                          incomeGrowthDraft.mode === "lower_than_benchmark"
                            ? "border-[#37135B] text-[#37135B] bg-[#FBF8FD]"
                            : "border-[#E1E1E1]"
                        )}
                      >
                        Lower than
                      </button>
                      <button
                        type="button"
                        onClick={() => setIncomeGrowthDraft((p) => ({ ...p, mode: "custom" }))}
                        className={cn(
                          "h-8 px-3 rounded border text-xs",
                          incomeGrowthDraft.mode === "custom"
                            ? "border-[#37135B] text-[#37135B] bg-[#FBF8FD]"
                            : "border-[#E1E1E1]"
                        )}
                      >
                        Custom range
                      </button>
                    </div>

                    {incomeGrowthDraft.mode !== "custom" ? (
                      <div className="space-y-2">
                        <p className="text-[14px] font-medium leading-5 text-[#262626]">Benchmark parameter</p>
                        <div className="space-y-2">
                          {benchmarkOptions.map((target) => (
                            <label key={target} className="flex items-center gap-2 text-[12px] leading-5 text-[#262626]">
                              <input
                                type="radio"
                                checked={incomeGrowthDraft.benchmarkLabel === target}
                                onChange={() =>
                                  setIncomeGrowthDraft((prev) => ({
                                    ...prev,
                                    benchmarkLabel: target,
                                  }))
                                }
                                className="accent-primary"
                              />
                              <span>{target}</span>
                            </label>
                          ))}
                        </div>
                        {incomeGrowthDraft.benchmarkLabel === "Value" ? (
                          <div className="space-y-1 pt-1">
                            <p className="text-[10px] text-muted-foreground font-medium">Enter value ({valueUnit})</p>
                            <Input
                              type="number"
                              value={incomeGrowthDraft.value}
                              onChange={(e) =>
                                setIncomeGrowthDraft((prev) => ({
                                  ...prev,
                                  value: Number(e.target.value) || 0,
                                }))
                              }
                            />
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <p className="text-[10px] text-muted-foreground font-medium">Min Value ({valueUnit})</p>
                          <Input
                            type="number"
                            value={incomeGrowthDraft.min}
                            onChange={(e) =>
                              setIncomeGrowthDraft((prev) => ({
                                ...prev,
                                min: Number(e.target.value) || 0,
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] text-muted-foreground font-medium">Max Value ({valueUnit})</p>
                          <Input
                            type="number"
                            value={incomeGrowthDraft.max}
                            onChange={(e) =>
                              setIncomeGrowthDraft((prev) => ({
                                ...prev,
                                max: Number(e.target.value) || 0,
                              }))
                            }
                          />
                        </div>
                      </div>
                    )}

                    <p className="text-[12px] text-[#777777]">Current rule: {currentRuleLabel}</p>
                  </>
                );
              })()}
            </div>

            <div className="px-4 py-3 border-t border-[#F1F1F1]">
              <Button
                onClick={applyIncomeGrowthCriteria}
                className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
              >
                Apply
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Balance Sheet criteria sheet (app/scanners only) */}
      <Dialog open={balanceSheetConfigOpen} onOpenChange={setBalanceSheetConfigOpen}>
        <DialogContent
          className="!p-0 !gap-0 !border-0 !shadow-none !rounded-t-2xl !rounded-b-none !bg-white w-full max-w-none h-auto max-h-[calc(100vh-20px)] overflow-hidden !left-0 !top-auto !bottom-0 !translate-x-0 !translate-y-0 sm:rounded-t-2xl [&>button]:hidden"
        >
          <div className="flex flex-col bg-white">
            <div className="flex items-center justify-between px-4 py-4 border-b border-[#F1F1F1]">
              <p className="text-[16px] font-medium leading-6 text-[#262626]">
                {activeBalanceSheetFilter ?? "Balance Sheet"}
              </p>
              <DialogClose asChild>
                <button
                  type="button"
                  className="h-6 w-6 inline-flex items-center justify-center text-[#777777]"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </DialogClose>
            </div>

            <div className="overflow-y-auto px-4 py-4 space-y-4 max-h-[calc(100vh-180px)]">
              {(() => {
                const targets = getBalanceSheetCompareTargets(activeBalanceSheetFilter);
                const benchmarkOptions = [...targets, "Value"];
                const valueUnit = getBalanceSheetValueUnit(activeBalanceSheetFilter);
                const currentRuleLabel =
                  balanceSheetDraft.mode === "custom"
                    ? `between ${balanceSheetDraft.min} and ${balanceSheetDraft.max}${valueUnit === "%" ? "%" : ""}`
                    : balanceSheetDraft.benchmarkLabel === "Value"
                      ? `${balanceSheetDraft.mode === "higher_than_benchmark" ? ">" : "<"} ${balanceSheetDraft.value}${valueUnit === "%" ? "%" : ` ${valueUnit}`}`
                      : `${balanceSheetDraft.mode === "higher_than_benchmark" ? ">" : "<"} ${balanceSheetDraft.benchmarkLabel}`;

                return (
                  <>
                    <p className="text-[14px] font-medium text-[#262626]">Rule</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setBalanceSheetDraft((p) => ({ ...p, mode: "higher_than_benchmark" }))}
                        className={cn(
                          "h-8 px-3 rounded border text-xs",
                          balanceSheetDraft.mode === "higher_than_benchmark"
                            ? "border-[#37135B] text-[#37135B] bg-[#FBF8FD]"
                            : "border-[#E1E1E1]"
                        )}
                      >
                        Higher than
                      </button>
                      <button
                        type="button"
                        onClick={() => setBalanceSheetDraft((p) => ({ ...p, mode: "lower_than_benchmark" }))}
                        className={cn(
                          "h-8 px-3 rounded border text-xs",
                          balanceSheetDraft.mode === "lower_than_benchmark"
                            ? "border-[#37135B] text-[#37135B] bg-[#FBF8FD]"
                            : "border-[#E1E1E1]"
                        )}
                      >
                        Lower than
                      </button>
                      <button
                        type="button"
                        onClick={() => setBalanceSheetDraft((p) => ({ ...p, mode: "custom" }))}
                        className={cn(
                          "h-8 px-3 rounded border text-xs",
                          balanceSheetDraft.mode === "custom"
                            ? "border-[#37135B] text-[#37135B] bg-[#FBF8FD]"
                            : "border-[#E1E1E1]"
                        )}
                      >
                        Custom range
                      </button>
                    </div>

                    {balanceSheetDraft.mode !== "custom" ? (
                      <div className="space-y-2">
                        <p className="text-[14px] font-medium leading-5 text-[#262626]">Benchmark parameter</p>
                        <div className="space-y-2">
                          {benchmarkOptions.map((target) => (
                            <label key={target} className="flex items-center gap-2 text-[12px] leading-5 text-[#262626]">
                              <input
                                type="radio"
                                checked={balanceSheetDraft.benchmarkLabel === target}
                                onChange={() =>
                                  setBalanceSheetDraft((prev) => ({
                                    ...prev,
                                    benchmarkLabel: target,
                                  }))
                                }
                                className="accent-primary"
                              />
                              <span>{target}</span>
                            </label>
                          ))}
                        </div>
                        {balanceSheetDraft.benchmarkLabel === "Value" ? (
                          <div className="space-y-1 pt-1">
                            <p className="text-[10px] text-muted-foreground font-medium">Enter value ({valueUnit})</p>
                            <Input
                              type="number"
                              value={balanceSheetDraft.value}
                              onChange={(e) =>
                                setBalanceSheetDraft((prev) => ({
                                  ...prev,
                                  value: Number(e.target.value) || 0,
                                }))
                              }
                            />
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <p className="text-[10px] text-muted-foreground font-medium">Min Value ({valueUnit})</p>
                          <Input
                            type="number"
                            value={balanceSheetDraft.min}
                            onChange={(e) =>
                              setBalanceSheetDraft((prev) => ({
                                ...prev,
                                min: Number(e.target.value) || 0,
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] text-muted-foreground font-medium">Max Value ({valueUnit})</p>
                          <Input
                            type="number"
                            value={balanceSheetDraft.max}
                            onChange={(e) =>
                              setBalanceSheetDraft((prev) => ({
                                ...prev,
                                max: Number(e.target.value) || 0,
                              }))
                            }
                          />
                        </div>
                      </div>
                    )}

                    <p className="text-[12px] text-[#777777]">Current rule: {currentRuleLabel}</p>
                  </>
                );
              })()}
            </div>

            <div className="px-4 py-3 border-t border-[#F1F1F1]">
              <Button
                onClick={applyBalanceSheetCriteria}
                className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
              >
                Apply
              </Button>
            </div>
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
  onChangeMode,
  onChangeMin,
  onChangeMax,
}: {
  mode: RsiMode;
  min: number;
  max: number;
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

