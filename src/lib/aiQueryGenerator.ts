/**
 * AI query generator — Option B format:
 *   INDICATOR(params)[TF] OPERATOR VALUE_OR_INDICATOR(params)[TF]
 *   INDICATOR(params)[TF]    ← pattern indicator, no operator needed
 *
 * Replace the body of generateQueryFormula() with a real API call
 * (Claude, OpenAI, etc.) when ready. Signature stays the same.
 */

export interface AiExample {
  label: string;
  prompt: string;
  formula: string; // pre-baked Option B formula — shown instantly on chip click
}

export const AI_EXAMPLES: AiExample[] = [
  {
    label: "Oversold bounce",
    prompt: "RSI below 30 on daily with price above 50-day SMA",
    formula: "RSI(14)[1D] < 30\nClose[1D] > SMA(50)[1D]",
  },
  {
    label: "Golden cross",
    prompt: "50-day SMA crossed above 200-day SMA",
    formula: "SMA(50)[1D] crossed_above SMA(200)[1D]",
  },
  {
    label: "Breakout",
    prompt: "Price broke above 52-week high with 2x average volume",
    formula: "Close[1D] crossed_above High_52W[1D]\nVolume[1D] > VolSMA(20)[1D]",
  },
  {
    label: "MACD bullish",
    prompt: "MACD(12,26,9) crossed above signal line with RSI above 50",
    formula: "MACD(12,26,9)[1D] crossed_above MACDSig(12,26,9)[1D]\nRSI(14)[1D] > 50",
  },
  {
    label: "Bullish engulfing",
    prompt: "Bullish engulfing pattern with RSI between 40 and 65",
    formula: "Bullish_Engulfing[1D]\nRSI(14)[1D] > 40\nRSI(14)[1D] < 65",
  },
  {
    label: "Strong uptrend",
    prompt: "Price above 20, 50 and 200-day EMA with ADX above 25",
    formula: "Close[1D] > EMA(20)[1D]\nClose[1D] > EMA(50)[1D]\nClose[1D] > EMA(200)[1D]\nADX(14)[1D] > 25",
  },
  {
    label: "15m momentum",
    prompt: "RSI above 60 on 15-minute chart with price above VWAP",
    formula: "RSI(14)[15m] > 60\nClose[15m] > VWAP[15m]\nVolume[15m] > VolSMA(20)[15m]",
  },
  {
    label: "EMA crossover",
    prompt: "9-day EMA crossed above 21-day EMA with above-average volume",
    formula: "EMA(9)[1D] crossed_above EMA(21)[1D]\nVolume[1D] > VolSMA(20)[1D]",
  },
  {
    label: "Supertrend flip",
    prompt: "Supertrend(10,3) flipped bullish on daily timeframe",
    formula: "Supertrend_Bullish[1D]",
  },
  {
    label: "Volume surge",
    prompt: "Volume 3x the 20-day average with bullish close above open",
    formula: "Volume[1D] > VolSMA(20)[1D]\nClose[1D] > Open[1D]\nRSI(14)[1D] > 40",
  },
];

// ─── Mock implementation ──────────────────────────────────────────────────────

export async function generateQueryFormula(naturalLanguage: string): Promise<string> {
  await new Promise((r) => setTimeout(r, 1200));

  const t = naturalLanguage.toLowerCase();

  // Golden / death cross
  if (t.includes("golden cross") || (t.includes("50") && t.includes("200") && t.includes("cross") && !t.includes("death"))) {
    return "SMA(50)[1D] crossed_above SMA(200)[1D]";
  }
  if (t.includes("death cross")) {
    return "SMA(50)[1D] crossed_below SMA(200)[1D]";
  }

  // EMA crossover
  if (t.includes("ema") && t.includes("cross")) {
    const fast = t.includes("9") ? 9 : 20;
    const slow = t.includes("21") ? 21 : 50;
    return [
      `EMA(${fast})[1D] crossed_above EMA(${slow})[1D]`,
      `Volume[1D] > VolSMA(20)[1D]`,
    ].join("\n");
  }

  // MACD bullish
  if (t.includes("macd") && (t.includes("cross") || t.includes("bullish"))) {
    const withRsi = t.includes("rsi") ? "\nRSI(14)[1D] > 50" : "";
    return `MACD(12,26,9)[1D] crossed_above MACDSig(12,26,9)[1D]${withRsi}`;
  }

  // MACD bearish
  if (t.includes("macd") && t.includes("bearish")) {
    return [
      "MACD(12,26,9)[1D] crossed_below MACDSig(12,26,9)[1D]",
      "RSI(14)[1D] < 50",
    ].join("\n");
  }

  // Breakout
  if (t.includes("breakout") || (t.includes("52") && t.includes("high"))) {
    return [
      "Close[1D] crossed_above High_52W[1D]",
      "Volume[1D] > VolSMA(20)[1D]",
    ].join("\n");
  }

  // Bullish engulfing
  if (t.includes("bullish engulfing") || t.includes("engulfing")) {
    return [
      "Bullish_Engulfing[1D]",
      "RSI(14)[1D] > 40",
      "RSI(14)[1D] < 65",
    ].join("\n");
  }

  // Oversold / RSI bounce
  if (t.includes("oversold") || (t.includes("rsi") && (t.includes("below") || t.includes("30")))) {
    const tf = t.includes("15") ? "15m" : "1D";
    return [
      `RSI(14)[${tf}] < 30`,
      `Close[${tf}] > SMA(50)[${tf}]`,
    ].join("\n");
  }

  // Strong uptrend — multiple EMAs
  if (t.includes("uptrend") || (t.includes("ema") && (t.includes("200") || t.includes("20, 50")))) {
    return [
      "Close[1D] > EMA(20)[1D]",
      "Close[1D] > EMA(50)[1D]",
      "Close[1D] > EMA(200)[1D]",
      "ADX(14)[1D] > 25",
    ].join("\n");
  }

  // 15-min momentum
  if (t.includes("15") && (t.includes("min") || t.includes("minute") || t.includes("15m"))) {
    return [
      "RSI(14)[15m] > 60",
      "Close[15m] > VWAP[15m]",
      "Volume[15m] > VolSMA(20)[15m]",
    ].join("\n");
  }

  // Supertrend flip
  if (t.includes("supertrend")) {
    return "Supertrend_Bullish[1D]";
  }

  // Volume surge
  if (t.includes("volume") && (t.includes("surge") || t.includes("spike") || t.includes("3x") || t.includes("2x"))) {
    return [
      "Volume[1D] > VolSMA(20)[1D]",
      "Close[1D] > Open[1D]",
      "RSI(14)[1D] > 40",
    ].join("\n");
  }

  // Default: generic momentum scan
  return [
    "RSI(14)[1D] < 30",
    "Close[1D] > SMA(200)[1D]",
    "Volume[1D] > VolSMA(20)[1D]",
  ].join("\n");
}
