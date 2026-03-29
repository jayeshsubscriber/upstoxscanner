import { DIY_MOCK_FUNDAMENTAL_NAMESPACES } from "@/data/diyMockCatalog";
import { isFundamentalRightAllowed } from "@/lib/fundamentalRhsCompatibility";
import { INDICATORS, type IndicatorCategory, type IndicatorDef } from "@/data/indicators";

/** Semantic bucket for right-operand filtering (not units / evaluator math). */
export type ComparisonKind =
  | "price_absolute"
  | "percent_return"
  | "percent_position"
  | "oscillator"
  | "macd_family"
  | "volume_shares"
  | "volume_flow"
  | "trend_strength"
  | "trend_price_overlay"
  | "volatility_price"
  | "relative_strength"
  | "fundamental";

/** Per-id overrides when category/default split is wrong. */
const KIND_BY_ID: Partial<Record<string, ComparisonKind>> = {
  supertrend: "trend_price_overlay",
  delivery_pct: "percent_position",
  volume_roc: "percent_position",
  bb_bandwidth: "percent_position",
  bb_pct_b: "percent_position",
  atr_pct: "percent_position",
  hist_volatility: "percent_position",
  cpr_width_pct: "percent_position",
  obv: "volume_flow",
  ad_line: "volume_flow",
  cmf: "volume_flow",
};

const PRICE_ABSOLUTE_IDS = new Set<string>([
  "close",
  "open",
  "high",
  "low",
  "prev_close",
  "prev_high",
  "prev_low",
  "high_52w",
  "low_52w",
  "orb_high",
  "orb_low",
]);

const PERCENT_RETURN_IDS = new Set<string>(["change_1d_pct", "change_1w_pct", "change_1m_pct"]);

const PERCENT_POSITION_IDS = new Set<string>([
  "pct_from_sma",
  "pct_from_ema",
  "pct_from_52w_high",
  "pct_from_52w_low",
  "close_position_in_range",
]);

const RELATIVE_STRENGTH_IDS = new Set<string>(["rs_vs_nifty50", "rs_vs_sector"]);

const TREND_STRENGTH_IDS = new Set<string>(["adx", "plus_di", "minus_di", "aroon_up", "aroon_down"]);

const TREND_OVERLAY_IDS = new Set<string>([
  "parabolic_sar",
  "ichimoku_tenkan",
  "ichimoku_kijun",
  "ichimoku_senkou_a",
  "ichimoku_senkou_b",
]);

const VOLATILITY_PRICE_IDS = new Set<string>([
  "bb_upper",
  "bb_middle",
  "bb_lower",
  "atr",
  "keltner_upper",
  "keltner_lower",
  "donchian_upper",
  "donchian_lower",
  "pivot_pp",
  "pivot_r1",
  "pivot_r2",
  "pivot_r3",
  "pivot_s1",
  "pivot_s2",
  "pivot_s3",
  "camarilla_r1",
  "camarilla_r2",
  "camarilla_r3",
  "camarilla_r4",
  "camarilla_s1",
  "camarilla_s2",
  "camarilla_s3",
  "camarilla_s4",
  "cpr_upper",
  "cpr_lower",
]);

const VOLUME_SHARES_IDS = new Set<string>([
  "volume",
  "volume_sma",
  "volume_ema",
  "relative_volume",
  "vwap",
]);

/** Right kinds allowed when `left` is the comparison anchor (asymmetric). */
const ALLOWED_RIGHT_WHEN_LEFT: Record<ComparisonKind, Set<ComparisonKind>> = {
  price_absolute: new Set(["price_absolute", "volatility_price", "trend_price_overlay"]),
  volatility_price: new Set(["price_absolute", "volatility_price", "trend_price_overlay"]),
  trend_price_overlay: new Set(["price_absolute", "volatility_price", "trend_price_overlay"]),
  percent_return: new Set(["percent_return"]),
  percent_position: new Set(["percent_position"]),
  relative_strength: new Set(["relative_strength"]),
  oscillator: new Set(["oscillator"]),
  macd_family: new Set(["macd_family"]),
  volume_shares: new Set(["volume_shares", "price_absolute"]),
  volume_flow: new Set(["volume_flow"]),
  trend_strength: new Set(["trend_strength"]),
  fundamental: new Set(["fundamental"]),
};

function kindFromCategoryFallback(cat: IndicatorCategory): ComparisonKind {
  switch (cat) {
    case "moving_averages":
      return "price_absolute";
    case "oscillators":
      return "oscillator";
    case "macd":
      return "macd_family";
    case "volume":
      return "volume_shares";
    case "trend":
      return "trend_strength";
    case "volatility":
      return "volatility_price";
    case "pivot":
      return "volatility_price";
    case "price":
      return "price_absolute";
    default:
      return "price_absolute";
  }
}

function kindForRealIndicator(ind: IndicatorDef): ComparisonKind {
  const o = KIND_BY_ID[ind.id];
  if (o) return o;

  if (ind.category === "price") {
    if (PRICE_ABSOLUTE_IDS.has(ind.id)) return "price_absolute";
    if (PERCENT_RETURN_IDS.has(ind.id)) return "percent_return";
    if (PERCENT_POSITION_IDS.has(ind.id)) return "percent_position";
    if (RELATIVE_STRENGTH_IDS.has(ind.id)) return "relative_strength";
    return "price_absolute";
  }

  if (ind.category === "trend") {
    if (TREND_STRENGTH_IDS.has(ind.id)) return "trend_strength";
    if (TREND_OVERLAY_IDS.has(ind.id)) return "trend_price_overlay";
    return kindFromCategoryFallback(ind.category);
  }

  if (ind.category === "volatility") {
    if (VOLATILITY_PRICE_IDS.has(ind.id)) return "volatility_price";
    return kindFromCategoryFallback(ind.category);
  }

  if (ind.category === "volume") {
    if (VOLUME_SHARES_IDS.has(ind.id)) return "volume_shares";
    return kindFromCategoryFallback(ind.category);
  }

  return kindFromCategoryFallback(ind.category);
}

/**
 * Comparison kind for an indicator id (catalog or `mock:namespace:slug`).
 */
export function getComparisonKind(indicatorId: string): ComparisonKind {
  if (indicatorId.startsWith("mock:")) {
    const ns = indicatorId.split(":")[1]?.toLowerCase() ?? "";
    return DIY_MOCK_FUNDAMENTAL_NAMESPACES.has(ns) ? "fundamental" : "price_absolute";
  }

  const ind = INDICATORS.find((i) => i.id === indicatorId);
  if (!ind) return "price_absolute";
  return kindForRealIndicator(ind);
}

export function isRightComparable(leftKind: ComparisonKind, rightKind: ComparisonKind): boolean {
  return ALLOWED_RIGHT_WHEN_LEFT[leftKind]?.has(rightKind) ?? false;
}

export function isPairComparable(leftIndicatorId: string, rightIndicatorId: string): boolean {
  if (!leftIndicatorId || !rightIndicatorId) return true;
  const lk = getComparisonKind(leftIndicatorId);
  const rk = getComparisonKind(rightIndicatorId);
  if (!isRightComparable(lk, rk)) return false;
  if (lk === "fundamental" && rk === "fundamental") {
    return isFundamentalRightAllowed(leftIndicatorId, rightIndicatorId);
  }
  return true;
}
