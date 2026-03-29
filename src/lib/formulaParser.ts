/**
 * Parser for Option B query format:
 *
 *   INDICATOR(params)[TF] OPERATOR VALUE_OR_INDICATOR(params)[TF]
 *   INDICATOR(params)[TF]                 ← pattern — no operator needed
 *
 * One condition per line; lines are implicitly AND-joined.
 * Inline AND / OR on the same line is also supported.
 *
 * Examples:
 *   RSI(14)[1D] < 30
 *   Close[1D] > SMA(200)[1D]
 *   SMA(50)[1D] crossed_above SMA(200)[1D]
 *   MACD(12,26,9)[1D] crossed_above MACDSig(12,26,9)[1D]
 *   Volume[1D] > VolSMA(20)[1D]
 *   Bullish_Engulfing[1D]
 *   EMA(9)[1D] crossed_above EMA(21)[1D] AND Volume[1D] > VolSMA(20)[1D]
 */

import { INDICATORS, getIndicator } from "@/data/indicators";
import type { QueryState, GroupState, ConditionState } from "@/types/screener";
import type { OperatorId } from "@/data/indicators";

// ─── Timeframe token map ─────────────────────────────────────────────────────

const TIMEFRAME_MAP: Record<string, string> = {
  "1d":      "1d",
  "daily":   "1d",
  "day":     "1d",
  "d":       "1d",
  "15m":     "15m",
  "15min":   "15m",
  "1m":      "1M",
  "monthly": "1M",
  "month":   "1M",
  "m":       "1M",
};

// ─── Indicator name aliases ───────────────────────────────────────────────────
// Keyed by lowercase, underscore-normalised name.
// Underscores in user input are converted to spaces before lookup, so
// "Bullish_Engulfing" → "bullish engulfing" → "bullish_engulfing".

const NAME_ALIASES: Record<string, string> = {
  // Price
  "close":           "close",
  "price":           "close",
  "open":            "open",
  "high":            "high",
  "low":             "low",
  "prev close":      "prev_close",
  "previous close":  "prev_close",
  "high 52w":        "high_52w",
  "52w high":        "high_52w",
  "52 week high":    "high_52w",
  "52-week high":    "high_52w",
  "low 52w":         "low_52w",
  "52w low":         "low_52w",
  "52 week low":     "low_52w",
  "52-week low":     "low_52w",
  // MAs
  "sma":             "sma",
  "ema":             "ema",
  "wma":             "wma",
  "hull ma":         "hull_ma",
  "hullma":          "hull_ma",
  "vwma":            "vwma",
  "dema":            "dema",
  "tema":            "tema",
  // Oscillators
  "rsi":             "rsi",
  "stoch":           "stoch_k",
  "stochastic":      "stoch_k",
  "stochrsi":        "stochrsi",
  "williams r":      "williams_r",
  "williams %r":     "williams_r",
  "cci":             "cci",
  "roc":             "roc",
  "mfi":             "mfi",
  // MACD — compact aliases used in Option B format
  "macd":            "macd_line",
  "macd line":       "macd_line",
  "macdsig":         "macd_signal",
  "macd sig":        "macd_signal",
  "macd signal":     "macd_signal",
  "macd hist":       "macd_hist",
  "macd histogram":  "macd_hist",
  // Volatility
  "bb upper":        "bband_upper",
  "bb lower":        "bband_lower",
  "bb middle":       "bband_middle",
  "bollinger upper": "bband_upper",
  "bollinger lower": "bband_lower",
  "atr":             "atr",
  "supertrend":      "supertrend",
  // Volume — compact aliases
  "volume":          "volume",
  "vol":             "volume",
  "volsma":          "volume_sma",
  "vol sma":         "volume_sma",
  "volume sma":      "volume_sma",
  "obv":             "obv",
  "vwap":            "vwap",
  "cmf":             "cmf",
  // Trend
  "adx":             "adx",
  "aroon up":        "aroon_up",
  "aroon down":      "aroon_down",
  "parabolic sar":   "parabolic_sar",
  "sar":             "parabolic_sar",
  // Setups (pattern indicators)
  "ema cross bullish":        "ema_cross_bullish",
  "ema bullish cross":        "ema_cross_bullish",
  "ema cross bearish":        "ema_cross_bearish",
  "sma cross bullish":        "sma_cross_bullish",
  "golden cross":             "sma_cross_bullish",
  "sma cross bearish":        "sma_cross_bearish",
  "death cross":              "sma_cross_bearish",
  "macd cross bullish":       "macd_cross_bullish",
  "macd bullish cross":       "macd_cross_bullish",
  "macd cross bearish":       "macd_cross_bearish",
  "supertrend flip bullish":  "supertrend_flip_bullish",
  "supertrend bullish":       "supertrend_flip_bullish",
  "supertrend flip bearish":  "supertrend_flip_bearish",
  "supertrend bearish":       "supertrend_flip_bearish",
  "inside bar":               "inside_bar",
  "nr4":                      "nr4",
  "nr7":                      "nr7",
  // Divergence
  "rsi divergence":           "rsi_divergence",
  "macd divergence":          "macd_divergence",
  // Candlestick patterns
  "doji":                 "doji",
  "hammer":               "hammer",
  "inverted hammer":      "inverted_hammer",
  "spinning top":         "spinning_top",
  "marubozu":             "marubozu",
  "hanging man":          "hanging_man",
  "shooting star":        "shooting_star",
  "bullish engulfing":    "bullish_engulfing",
  "bearish engulfing":    "bearish_engulfing",
  "piercing line":        "piercing_line",
  "dark cloud cover":     "dark_cloud_cover",
  "bullish harami":       "bullish_harami",
  "bearish harami":       "bearish_harami",
  "tweezer top":          "tweezer_top",
  "tweezer bottom":       "tweezer_bottom",
  "morning star":         "morning_star",
  "evening star":         "evening_star",
  "three white soldiers": "three_white_soldiers",
  "three black crows":    "three_black_crows",
  "three inside up":      "three_inside_up",
  "three inside down":    "three_inside_down",
};

// ─── Operator tokens ─────────────────────────────────────────────────────────
// Listed longest-first so greedy matching doesn't mis-fire.

const OPERATOR_TOKENS: Array<{ tokens: string[]; op: OperatorId }> = [
  { tokens: ["crossed_above", "crossed above", "cross above", "crosses above"], op: "crossed_above" },
  { tokens: ["crossed_below", "crossed below", "cross below", "crosses below"], op: "crossed_below" },
  { tokens: ["is_increasing", "is increasing"], op: "is_increasing" },
  { tokens: ["is_decreasing", "is decreasing"], op: "is_decreasing" },
  { tokens: [">=", "≥"], op: "greater_equal" },
  { tokens: ["<=", "≤"], op: "less_equal" },
  { tokens: [">"],        op: "greater_than" },
  { tokens: ["<"],        op: "less_than" },
  { tokens: ["=", "=="],  op: "greater_equal" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

function defaultParams(indicatorId: string): Record<string, number | string> {
  const def = getIndicator(indicatorId);
  if (!def) return {};
  const out: Record<string, number | string> = {};
  for (const p of def.params) out[p.key] = p.defaultValue;
  return out;
}

/** Normalise a raw name for alias lookup: lowercase + underscores → spaces. */
function normaliseName(name: string): string {
  return name.trim().toLowerCase().replace(/_/g, " ");
}

/** Resolve a display name (underscores OK) to an internal indicator id. */
function resolveId(name: string): string | null {
  const key = normaliseName(name);

  // 1. Direct alias hit
  if (NAME_ALIASES[key]) return NAME_ALIASES[key];

  // 2. Direct id match (indicator ids use underscores)
  const asId = key.replace(/ /g, "_");
  if (INDICATORS.find((i) => i.id === asId)) return asId;

  // 3. Name match against full indicator list
  for (const ind of INDICATORS) {
    if (ind.name.toLowerCase() === key) return ind.id;
  }

  return null;
}

// ─── Indicator-with-timeframe token ─────────────────────────────────────────

interface IndToken {
  id: string;
  params: Record<string, number | string>;
  timeframe: string;
}

/**
 * Parse a token like:
 *   RSI(14)[1D]          → { id:"rsi", params:{period:14}, timeframe:"1d" }
 *   SMA(200)[1D]         → { id:"sma", params:{period:200}, timeframe:"1d" }
 *   MACD(12,26,9)[15m]   → { id:"macd_line", params:{fast:12,slow:26,signal:9}, timeframe:"15m" }
 *   Close[1D]            → { id:"close", params:{}, timeframe:"1d" }
 *   Bullish_Engulfing[1D]→ { id:"bullish_engulfing", params:{}, timeframe:"1d" }
 *   VolSMA(20)[1D]       → { id:"volume_sma", params:{period:20}, timeframe:"1d" }
 */
function parseIndToken(raw: string): IndToken | null {
  raw = raw.trim();

  // Strip trailing [TF] tag
  let timeframe = "1d";
  const tfMatch = raw.match(/\[([^\]]+)\]$/);
  if (tfMatch) {
    const tfKey = tfMatch[1].toLowerCase();
    timeframe = TIMEFRAME_MAP[tfKey] ?? "1d";
    raw = raw.slice(0, raw.lastIndexOf("[")).trim();
  }

  // NAME(p1, p2, ...)  or  NAME
  const parenMatch = raw.match(/^(.+?)\s*\(([^)]*)\)\s*$/);
  if (parenMatch) {
    const id = resolveId(parenMatch[1]);
    if (!id) return null;

    const params = defaultParams(id);
    const def = getIndicator(id);
    if (def) {
      const numericParams = def.params.filter((p) => p.type === "number");
      parenMatch[2]
        .split(",")
        .map((s) => s.trim())
        .forEach((part, i) => {
          const n = parseFloat(part);
          if (!isNaN(n) && numericParams[i]) params[numericParams[i].key] = n;
        });
    }
    return { id, params, timeframe };
  }

  // Plain name (no parens)
  const id = resolveId(raw);
  if (!id) return null;
  return { id, params: defaultParams(id), timeframe };
}

// ─── Clause parser ───────────────────────────────────────────────────────────

function parseClause(clause: string): { condition: ConditionState; timeframe: string } {
  clause = clause.trim();

  // Try each operator (longest tokens first)
  for (const { tokens, op } of OPERATOR_TOKENS) {
    for (const tok of tokens) {
      // Case-insensitive search; avoid matching inside indicator names
      const regex = new RegExp(`(?<![\\w\\[\\]])${tok.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\w\\]])`, "i");
      const m = regex.exec(clause);
      if (!m) continue;

      const leftRaw = clause.slice(0, m.index).trim();
      const rightRaw = clause.slice(m.index + m[0].length).trim();
      if (!leftRaw || !rightRaw) continue;

      const left = parseIndToken(leftRaw);
      if (!left) throw new Error(`Unknown indicator: "${leftRaw}"`);

      // Right side: plain number or indicator token
      const numVal = parseFloat(rightRaw);
      if (!isNaN(numVal) && String(numVal) === rightRaw.trim()) {
        return {
          timeframe: left.timeframe,
          condition: {
            id: uid(),
            leftIndicatorId: left.id,
            leftParams: left.params,
            operator: op,
            rightType: "value",
            rightValue: String(numVal),
            rightIndicatorId: "",
            rightParams: {},
            rightMultiplier: 1,
            comparisonMarginPercent: 0,
            rightValue2: "",
            hasTimeModifier: false,
            timeModifierMode: "within_last",
            timeModifierBars: 1,
          },
        };
      }

      // Try as number even if there are trailing chars (e.g. "30.5")
      if (!isNaN(parseFloat(rightRaw))) {
        const n = parseFloat(rightRaw);
        return {
          timeframe: left.timeframe,
          condition: {
            id: uid(),
            leftIndicatorId: left.id,
            leftParams: left.params,
            operator: op,
            rightType: "value",
            rightValue: String(n),
            rightIndicatorId: "",
            rightParams: {},
            rightMultiplier: 1,
            comparisonMarginPercent: 0,
            rightValue2: "",
            hasTimeModifier: false,
            timeModifierMode: "within_last",
            timeModifierBars: 1,
          },
        };
      }

      const right = parseIndToken(rightRaw);
      if (!right) throw new Error(`Cannot parse right-hand side: "${rightRaw}"`);

      return {
        timeframe: left.timeframe,
        condition: {
          id: uid(),
          leftIndicatorId: left.id,
          leftParams: left.params,
          operator: op,
          rightType: "indicator",
          rightValue: "",
          rightIndicatorId: right.id,
          rightParams: right.params,
          rightMultiplier: 1,
          comparisonMarginPercent: 0,
          rightValue2: "",
          hasTimeModifier: false,
          timeModifierMode: "within_last",
          timeModifierBars: 1,
        },
      };
    }
  }

  // No operator found — treat as pattern indicator (e.g. Bullish_Engulfing[1D])
  const ind = parseIndToken(clause);
  if (!ind) throw new Error(`Cannot parse condition: "${clause}"`);

  const def = getIndicator(ind.id);
  if (def?.outputType !== "pattern") {
    throw new Error(
      `"${clause}" has no operator. Add one (e.g. > 30) or use a pattern indicator.`
    );
  }

  return {
    timeframe: ind.timeframe,
    condition: {
      id: uid(),
      leftIndicatorId: ind.id,
      leftParams: ind.params,
      operator: "detected",
      rightType: "value",
      rightValue: "",
      rightIndicatorId: "",
      rightParams: {},
      rightMultiplier: 1,
      comparisonMarginPercent: 0,
      rightValue2: "",
      hasTimeModifier: true,
      timeModifierMode: "within_last",
      timeModifierBars: 1,
    },
  };
}

// ─── Formula splitter ────────────────────────────────────────────────────────

interface RawClause {
  text: string;
  connector: "AND" | "OR";
}

function splitClauses(formula: string): RawClause[] {
  // Normalise: each non-empty line is an implicit AND condition
  const oneLine = formula
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .join(" AND ");

  const parts: RawClause[] = [];
  // Split on AND/OR word boundaries, excluding those inside [...] (timeframes)
  const regex = /\b(AND|OR)\b/gi;
  let lastIndex = 0;
  let connector: "AND" | "OR" = "AND";
  let m: RegExpExecArray | null;

  while ((m = regex.exec(oneLine)) !== null) {
    const text = oneLine.slice(lastIndex, m.index).trim();
    if (text) parts.push({ text, connector });
    connector = m[1].toUpperCase() as "AND" | "OR";
    lastIndex = m.index + m[0].length;
  }

  const remaining = oneLine.slice(lastIndex).trim();
  if (remaining) parts.push({ text: remaining, connector });

  return parts;
}

// ─── Public API ──────────────────────────────────────────────────────────────

export class FormulaParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FormulaParseError";
  }
}

/**
 * Parse an Option B formula into a QueryState.
 * Throws FormulaParseError on invalid input.
 */
export function parseFormula(formula: string, universe = "nifty500"): QueryState {
  const trimmed = formula.trim();
  if (!trimmed) throw new FormulaParseError("Formula is empty.");

  const rawClauses = splitClauses(trimmed);
  if (!rawClauses.length) throw new FormulaParseError("No conditions found.");

  const groups: GroupState[] = [];
  let currentConditions: ConditionState[] = [];
  let currentTimeframe = "1d";

  for (let i = 0; i < rawClauses.length; i++) {
    const { text, connector } = rawClauses[i];

    // OR → flush current group and start new one
    if (i > 0 && connector === "OR" && currentConditions.length) {
      groups.push({
        id: uid(),
        logic: "AND",
        timeframe: currentTimeframe,
        connector: "OR",
        conditions: currentConditions,
      });
      currentConditions = [];
      currentTimeframe = "1d";
    }

    let parsed: ReturnType<typeof parseClause>;
    try {
      parsed = parseClause(text);
    } catch (e) {
      throw new FormulaParseError((e as Error).message);
    }

    currentConditions.push(parsed.condition);
    if (i === 0 || connector === "OR") currentTimeframe = parsed.timeframe;
  }

  if (currentConditions.length) {
    groups.push({
      id: uid(),
      logic: "AND",
      timeframe: currentTimeframe,
      connector: "AND",
      conditions: currentConditions,
    });
  }

  return { name: "Custom Query", universe, groups };
}

export { parseFormula as formulaToQueryState };
