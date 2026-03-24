// Mock data for the Upstox Scanners Platform

export type ScannerPersona = "intraday" | "btst" | "swing" | "positional" | "longterm";
export type ScannerDifficulty = "beginner" | "intermediate" | "advanced";
export type PlanTier = "free" | "plus";

export interface PreBuiltScanner {
  id: string;
  name: string;
  description: string;
  persona: ScannerPersona;
  subCategory: string;
  difficulty: ScannerDifficulty;
  plan: PlanTier;
  timeframe: string;
  indicators: string[];
  resultCount: number;
  viewCount: number;
  runCount: number;
  lastUpdated: string;
  activeWindow?: { start: string; end: string; label: string };
  education: {
    what: string;
    why: string;
    entry: string;
    stopLoss: string;
    holdDuration: string;
    riskReward: string;
  };
}

export interface ScanResult {
  rank: number;
  symbol: string;
  company: string;
  price: number;
  change1d: number;
  volume: number;
  volumeAvg: number;
  signalReason: string;
  details: Record<string, string | number>;
}

export interface MarketplaceScreener {
  id: string;
  name: string;
  description: string;
  creator: {
    handle: string;
    displayName: string;
    verified: boolean;
    followers: number;
  };
  tags: string[];
  persona: ScannerPersona;
  likes: number;
  views: number;
  uses: number;
  copies: number;
  createdAt: string;
  updatedAt: string;
  isEditorChoice: boolean;
  isFeatured: boolean;
  performance: { hitRate: number; sampleSize: number; badge: "high" | "moderate" | "new" };
  conditions: string;
}

export interface AlertItem {
  id: string;
  name: string;
  scannerName: string;
  scannerId: string;
  channels: string[];
  status: "active" | "paused";
  lastTriggered: string | null;
  triggersThisWeek: number;
  createdAt: string;
}

// ─── PRE-BUILT SCANNERS ──────────────────────────────────────────────────────

export const PRE_BUILT_SCANNERS: PreBuiltScanner[] = [
  // INTRADAY - Morning
  {
    id: "gap-up-opening",
    name: "Gap Up Opening (>1%)",
    description: "Stocks that opened more than 1% above yesterday's close. Classic gap-and-go setup.",
    persona: "intraday",
    subCategory: "Morning Scanners",
    difficulty: "beginner",
    plan: "free",
    timeframe: "Daily",
    indicators: ["Open", "Prev Close"],
    resultCount: 23,
    viewCount: 12400,
    runCount: 5800,
    lastUpdated: "2 min ago",
    activeWindow: { start: "09:00", end: "10:00", label: "Best: 9:00–10:00 AM" },
    education: {
      what: "A gap up occurs when a stock opens significantly higher than its previous close due to overnight news, earnings, or broad market momentum.",
      why: "Gap ups show strong buying interest before the market even opens. When volume confirms, these stocks often continue moving in the direction of the gap.",
      entry: "Enter on the first 5-min candle close above the gap-up open price, with volume 2x above average.",
      stopLoss: "Place stop below the opening candle low. Risk no more than 0.5–1% of capital.",
      holdDuration: "Intraday — exit before 3:15 PM or when price hits resistance.",
      riskReward: "Aim for 1:2 minimum. Target previous day high or R1 pivot.",
    },
  },
  {
    id: "gap-down-opening",
    name: "Gap Down Opening (<-1%)",
    description: "Stocks that opened more than 1% below yesterday's close. Short or reversal candidates.",
    persona: "intraday",
    subCategory: "Morning Scanners",
    difficulty: "beginner",
    plan: "free",
    timeframe: "Daily",
    indicators: ["Open", "Prev Close"],
    resultCount: 18,
    viewCount: 9800,
    runCount: 4200,
    lastUpdated: "2 min ago",
    activeWindow: { start: "09:00", end: "10:00", label: "Best: 9:00–10:00 AM" },
    education: {
      what: "A gap down occurs when a stock opens significantly lower than its previous close, indicating strong selling pressure.",
      why: "Gap downs create powerful short setups in bear markets, or high-risk reversal bounce trades in bull markets.",
      entry: "For shorts: enter on first candle below gap-down open. For reversal: wait for gap-fill attempt with volume.",
      stopLoss: "For shorts: above opening candle high. For longs: below opening candle low.",
      holdDuration: "Intraday — typically 30 min to 2 hours.",
      riskReward: "1:1.5 minimum. Do not hold overnight.",
    },
  },
  {
    id: "orb-15",
    name: "Opening Range Breakout (15-min)",
    description: "Price breaks above or below the first 15-minute candle range. The most popular intraday setup in India.",
    persona: "intraday",
    subCategory: "Morning Scanners",
    difficulty: "beginner",
    plan: "free",
    timeframe: "15 min",
    indicators: ["ORB High", "ORB Low", "Volume"],
    resultCount: 31,
    viewCount: 28700,
    runCount: 14200,
    lastUpdated: "Just now",
    activeWindow: { start: "09:30", end: "11:00", label: "Active after 9:30 AM" },
    education: {
      what: "The Opening Range is the high and low of the first 15-minute candle (9:15–9:30 AM). A breakout above or below this range signals the direction of the day.",
      why: "The first 15 minutes contain the most volatility and price discovery. A clean breakout with volume typically continues for 60–120 minutes.",
      entry: "Buy when price closes above ORB high on 5-min chart with volume > 1.5x average. Sell short when price closes below ORB low.",
      stopLoss: "Bullish: below ORB low. Bearish: above ORB high.",
      holdDuration: "1–3 hours. Exit at R2/S2 pivot or by 1:30 PM.",
      riskReward: "1:2 to 1:3. This is a high-probability setup when volume confirms.",
    },
  },
  {
    id: "first-15m-volume-shocker",
    name: "First 15-min Volume Shocker",
    description: "Stocks where the first candle volume is greater than yesterday's full day average volume.",
    persona: "intraday",
    subCategory: "Morning Scanners",
    difficulty: "intermediate",
    plan: "free",
    timeframe: "15 min",
    indicators: ["Volume", "Volume SMA(20)"],
    resultCount: 12,
    viewCount: 8900,
    runCount: 3400,
    lastUpdated: "3 min ago",
    activeWindow: { start: "09:15", end: "09:35", label: "First candle only" },
    education: {
      what: "When the first 15-minute candle's volume equals the entire previous day's volume, it signals massive institutional or retail participation from the open.",
      why: "Extraordinary volume at the open often precedes extraordinary price moves. These are the stocks 'in play' for the day.",
      entry: "Enter on the direction of the first candle (bull/bear) with 1% confirmation move.",
      stopLoss: "Tight stop: 0.5% below entry for longs.",
      holdDuration: "Can be held for the full day if the move is strong.",
      riskReward: "1:3 or better when setup is clean.",
    },
  },
  {
    id: "open-high",
    name: "Open = High (Bearish)",
    description: "Stocks where the open price equals the day's high — strong selling from the open.",
    persona: "intraday",
    subCategory: "Morning Scanners",
    difficulty: "beginner",
    plan: "free",
    timeframe: "Daily",
    indicators: ["Open", "High"],
    resultCount: 28,
    viewCount: 11200,
    runCount: 6100,
    lastUpdated: "1 min ago",
    education: {
      what: "When a stock's open price is the same as its day high, it means sellers were present from the very first tick — no buyer could push it higher.",
      why: "This pattern indicates strong short-side dominance. The stock is likely to trend down throughout the day.",
      entry: "Short on first red 5-min candle close. Confirmation: volume above average.",
      stopLoss: "Above the open/high price.",
      holdDuration: "Intraday. Exit by 3:15 PM.",
      riskReward: "1:1.5 minimum. Target S1 pivot.",
    },
  },
  {
    id: "open-low",
    name: "Open = Low (Bullish)",
    description: "Stocks where the open price equals the day's low — strong buying from the open.",
    persona: "intraday",
    subCategory: "Morning Scanners",
    difficulty: "beginner",
    plan: "free",
    timeframe: "Daily",
    indicators: ["Open", "Low"],
    resultCount: 21,
    viewCount: 10500,
    runCount: 5600,
    lastUpdated: "1 min ago",
    education: {
      what: "When the open is the same as the day's low, buyers dominated from the first tick — no seller could push it lower.",
      why: "These stocks are in strong intraday uptrends. Momentum traders love this pattern for its clean risk management.",
      entry: "Buy on first green 5-min candle. Volume confirmation required.",
      stopLoss: "Below the open/low price.",
      holdDuration: "Intraday. Can trail stop as price moves up.",
      riskReward: "1:2 minimum. Target R1/R2 pivot.",
    },
  },
  // INTRADAY - Live Momentum
  {
    id: "volume-shockers-live",
    name: "Volume Shockers (Live)",
    description: "Stocks with current volume more than 5x their 5-day average. The most-watched intraday scan.",
    persona: "intraday",
    subCategory: "Live Momentum",
    difficulty: "beginner",
    plan: "free",
    timeframe: "15 min",
    indicators: ["Volume", "Volume SMA(5)"],
    resultCount: 19,
    viewCount: 45200,
    runCount: 22000,
    lastUpdated: "Just now",
    education: {
      what: "Volume Shockers are stocks experiencing abnormally high trading volume — often 5x to 20x their normal level — signaling a major catalyst or institutional activity.",
      why: "Volume is the fuel of price moves. Without volume, a breakout is likely to fail. With 5x volume, even small-cap stocks can make 5–10% moves intraday.",
      entry: "Enter in the direction of the volume spike. If price is rising with volume, buy. If falling with volume, consider shorting.",
      stopLoss: "Below the last swing low for longs. Above the last swing high for shorts.",
      holdDuration: "30 minutes to 2 hours. Volume often dries up after the spike.",
      riskReward: "1:2 minimum. Let the trade breathe with a trailing stop.",
    },
  },
  {
    id: "vwap-cross-bullish",
    name: "VWAP Cross Bullish (5-min)",
    description: "Price crossing above VWAP on the 5-minute chart — institutional buying signal.",
    persona: "intraday",
    subCategory: "Live Momentum",
    difficulty: "intermediate",
    plan: "free",
    timeframe: "15 min",
    indicators: ["VWAP", "Close"],
    resultCount: 24,
    viewCount: 18700,
    runCount: 8900,
    lastUpdated: "1 min ago",
    education: {
      what: "VWAP (Volume-Weighted Average Price) is the average price of a stock weighted by volume. It's used by institutional traders as a benchmark.",
      why: "When price crosses above VWAP with momentum, it signals that buyers have taken control and institutions may start accumulating.",
      entry: "Buy when price closes above VWAP on the 5-min chart, with candle body above VWAP and volume > average.",
      stopLoss: "Below VWAP. If price recrosses back below, exit immediately.",
      holdDuration: "30 minutes to rest of day if price stays above VWAP.",
      riskReward: "1:2. VWAP acts as dynamic support once price is above it.",
    },
  },
  {
    id: "intraday-rsi-oversold",
    name: "Intraday RSI Oversold (<30)",
    description: "RSI below 30 on the 15-min chart — mean reversion bounce candidates.",
    persona: "intraday",
    subCategory: "Live Momentum",
    difficulty: "intermediate",
    plan: "free",
    timeframe: "15 min",
    indicators: ["RSI(14)"],
    resultCount: 16,
    viewCount: 9200,
    runCount: 4100,
    lastUpdated: "2 min ago",
    education: {
      what: "RSI below 30 indicates oversold conditions — the stock has been sold heavily and may be due for a bounce.",
      why: "Mean reversion is one of the most reliable intraday strategies. When RSI drops below 30 with price at a support level, the probability of a bounce is high.",
      entry: "Wait for RSI to turn back up from below 30. Enter on the first 15-min candle close with RSI rising.",
      stopLoss: "Below the recent swing low.",
      holdDuration: "1–2 hours. Target RSI 50 (neutral zone).",
      riskReward: "1:1.5. This is a counter-trend trade — be disciplined with stops.",
    },
  },
  // INTRADAY - Pattern
  {
    id: "bullish-engulfing-15m",
    name: "Bullish Engulfing (15-min)",
    description: "Bullish engulfing candlestick pattern detected on 15-minute chart. Reversal signal at support.",
    persona: "intraday",
    subCategory: "Pattern Scanners",
    difficulty: "intermediate",
    plan: "free",
    timeframe: "15 min",
    indicators: ["Candlestick Pattern"],
    resultCount: 9,
    viewCount: 14300,
    runCount: 6700,
    lastUpdated: "3 min ago",
    education: {
      what: "A Bullish Engulfing pattern occurs when a red candle is completely covered by the next green candle — the bulls overpowered the bears.",
      why: "At a key support level, a bullish engulfing on the 15-min chart is one of the strongest short-term reversal signals in technical analysis.",
      entry: "Buy on the close of the engulfing (green) candle. Volume should be higher than the red candle.",
      stopLoss: "Below the low of the engulfing pattern (the green candle's low).",
      holdDuration: "2–4 candles (30–60 minutes). Exit at the nearest resistance.",
      riskReward: "1:2. Works best when the pattern forms near VWAP, S1 support, or a moving average.",
    },
  },
  {
    id: "pivot-breakout",
    name: "Pivot Point Breakout (R1/S1)",
    description: "Price crossing above R1 or below S1 pivot levels — classic intraday breakout setup.",
    persona: "intraday",
    subCategory: "Pattern Scanners",
    difficulty: "beginner",
    plan: "free",
    timeframe: "15 min",
    indicators: ["Pivot R1", "Pivot S1", "Close"],
    resultCount: 34,
    viewCount: 11800,
    runCount: 5200,
    lastUpdated: "Just now",
    education: {
      what: "Pivot points are calculated from the previous day's high, low, and close. R1 is the first resistance level; S1 is the first support level.",
      why: "Thousands of traders watch pivot levels, making them self-fulfilling. A breakout above R1 with volume is a strong continuation signal.",
      entry: "Buy on close above R1. Short on close below S1. Volume must confirm.",
      stopLoss: "For R1 breakout: below the pivot point (PP). For S1 break: above PP.",
      holdDuration: "Intraday. Target R2 for longs, S2 for shorts.",
      riskReward: "1:2. Pivot levels are fixed and known, making risk calculation easy.",
    },
  },

  // BTST
  {
    id: "closing-range-breakout",
    name: "Closing Range Breakout",
    description: "Stock breaking day's high in the last 30 minutes with strong volume. The definitive BTST scan.",
    persona: "btst",
    subCategory: "BTST Setups",
    difficulty: "intermediate",
    plan: "free",
    timeframe: "15 min",
    indicators: ["Close", "Day High", "Volume"],
    resultCount: 14,
    viewCount: 19600,
    runCount: 9200,
    lastUpdated: "5 min ago",
    activeWindow: { start: "14:45", end: "15:30", label: "Active: 2:45–3:30 PM" },
    education: {
      what: "A Closing Range Breakout occurs when a stock breaks its day's high in the final 30 minutes of trading with increasing volume — signaling continuation tomorrow.",
      why: "Smart money often accumulates near the close to avoid market impact. A late-day breakout with volume almost always gaps up the next morning.",
      entry: "Buy on close above the day's high in the last 30 minutes. Hold overnight.",
      stopLoss: "Below the day's low. Be willing to exit at open if stock gaps down.",
      holdDuration: "1–2 days. Exit next morning on gap up or at first sign of weakness.",
      riskReward: "1:2 to 1:3 overnight. High win rate with volume confirmation.",
    },
  },
  {
    id: "nr7-breakout",
    name: "NR7 Breakout",
    description: "Narrowest range in 7 days with a late-session breakout. Compression leads to expansion.",
    persona: "btst",
    subCategory: "BTST Setups",
    difficulty: "advanced",
    plan: "free",
    timeframe: "Daily",
    indicators: ["Day Range", "7-day Range History"],
    resultCount: 8,
    viewCount: 12400,
    runCount: 4800,
    lastUpdated: "EOD",
    education: {
      what: "NR7 stands for Narrowest Range in the last 7 trading days. When a stock has been compressing in range and then breaks out in the afternoon, it signals explosive potential.",
      why: "Price volatility is cyclical — low volatility is always followed by high volatility. NR7 identifies stocks at the peak of low volatility.",
      entry: "Buy on close above the NR7 day's high after 2:30 PM with volume picking up.",
      stopLoss: "Below the NR7 day's low.",
      holdDuration: "2–5 days. The expansion phase often lasts several days.",
      riskReward: "1:3 or better. The tight range provides excellent risk:reward.",
    },
  },
  {
    id: "strong-close-near-high",
    name: "Strong Close Near Day High",
    description: "Closing price within 1% of day's high with volume above average. Bullish overnight carry.",
    persona: "btst",
    subCategory: "BTST Setups",
    difficulty: "beginner",
    plan: "free",
    timeframe: "Daily",
    indicators: ["Close", "High", "Volume SMA(20)"],
    resultCount: 27,
    viewCount: 9800,
    runCount: 3900,
    lastUpdated: "EOD",
    education: {
      what: "When a stock closes within 1% of its day high with above-average volume, buyers held control all day and there was no late selling.",
      why: "A strong close indicates bulls are confident enough to hold overnight — often resulting in a gap up or continued buying the next day.",
      entry: "Buy near the close (3:20–3:25 PM) when price is within 1% of the high and volume is confirming.",
      stopLoss: "Below the day's low. Risk is small due to the tight range.",
      holdDuration: "1 day. Sell the next morning's open or when momentum fades.",
      riskReward: "1:1.5 to 1:2 typically.",
    },
  },

  // SWING
  {
    id: "52w-high-breakout",
    name: "52-Week High Breakout",
    description: "Price crossing its 52-week high with strong volume. The most popular swing scan globally.",
    persona: "swing",
    subCategory: "Breakout Screens",
    difficulty: "beginner",
    plan: "free",
    timeframe: "Daily",
    indicators: ["Close", "52W High", "Volume"],
    resultCount: 11,
    viewCount: 38900,
    runCount: 18400,
    lastUpdated: "EOD",
    education: {
      what: "A 52-week high breakout occurs when a stock trades above its highest price over the last year, often marking the start of a new leg up.",
      why: "At a 52-week high, there are no underwater buyers (everyone is profitable), removing the ceiling of resistance. Stocks that make new highs tend to continue making new highs.",
      entry: "Buy on close above the 52-week high with volume 1.5x above average.",
      stopLoss: "10-day EMA or 5% below entry — whichever is closer.",
      holdDuration: "2–8 weeks. This is a trend-following, not a timing play.",
      riskReward: "1:3 or better. The biggest winners in any year are usually 52-week high breakouts.",
    },
  },
  {
    id: "golden-crossover",
    name: "Golden Crossover",
    description: "50 DMA crosses above 200 DMA — the classic bullish trend signal.",
    persona: "swing",
    subCategory: "Moving Average Signals",
    difficulty: "beginner",
    plan: "free",
    timeframe: "Daily",
    indicators: ["SMA(50)", "SMA(200)"],
    resultCount: 6,
    viewCount: 22100,
    runCount: 10800,
    lastUpdated: "EOD",
    education: {
      what: "The Golden Cross occurs when the 50-day moving average crosses above the 200-day moving average — a widely watched signal of long-term trend reversal.",
      why: "When short-term average rises above long-term average, it confirms that recent price action is stronger than the long-term trend. Institutions often use this as a buy signal.",
      entry: "Buy on the day of the crossover or on the first pullback to the 50 DMA after the cross.",
      stopLoss: "Below the 200 DMA. A 'death cross' (50 DMA below 200 DMA) invalidates the setup.",
      holdDuration: "4–12 weeks. This is a medium-term trend signal.",
      riskReward: "1:3 to 1:5 on strong markets.",
    },
  },
  {
    id: "consolidation-breakout",
    name: "Consolidation Breakout (BB Squeeze)",
    description: "Bollinger Band squeeze followed by expansion — low volatility transitioning to high.",
    persona: "swing",
    subCategory: "Breakout Screens",
    difficulty: "intermediate",
    plan: "free",
    timeframe: "Daily",
    indicators: ["Bollinger Bandwidth", "Close", "Volume"],
    resultCount: 17,
    viewCount: 24500,
    runCount: 11200,
    lastUpdated: "EOD",
    education: {
      what: "Bollinger Band Squeeze occurs when bands narrow to their tightest level in months, indicating a stock is consolidating before its next big move.",
      why: "Volatility is cyclical. After compression, expansion is inevitable. The direction of the breakout (not the squeeze) determines the trade.",
      entry: "Wait for price to close outside the Bollinger Band with volume 2x average. Enter in the direction of the break.",
      stopLoss: "Below the lower band for bullish breaks. Above the upper band for bearish.",
      holdDuration: "1–4 weeks.",
      riskReward: "1:3 typical. The longer the consolidation, the bigger the breakout.",
    },
  },
  {
    id: "rsi-oversold-daily",
    name: "RSI Oversold (Daily < 30)",
    description: "RSI below 30 on the daily chart — swing bounce candidates from oversold levels.",
    persona: "swing",
    subCategory: "Mean Reversion Screens",
    difficulty: "beginner",
    plan: "free",
    timeframe: "Daily",
    indicators: ["RSI(14)"],
    resultCount: 22,
    viewCount: 16800,
    runCount: 7600,
    lastUpdated: "EOD",
    education: {
      what: "Daily RSI below 30 means the stock has been selling off sharply over the past 14 days and is statistically in oversold territory.",
      why: "Most stocks mean-revert. An RSI below 30 in an overall bullish market is often a high-probability bounce trade with defined risk.",
      entry: "Wait for RSI to turn up from below 30. Enter on the candle where RSI crosses back above 30.",
      stopLoss: "Below the recent swing low.",
      holdDuration: "5–10 trading days. Target RSI 50–60 zone.",
      riskReward: "1:2. This is a counter-trend trade, so position sizing should be conservative.",
    },
  },
  {
    id: "price-volume-breakout",
    name: "Price-Volume Breakout",
    description: "Price up more than 3% with volume 2x above average — confirmed breakout signal.",
    persona: "swing",
    subCategory: "Breakout Screens",
    difficulty: "beginner",
    plan: "free",
    timeframe: "Daily",
    indicators: ["1D Change%", "Volume", "Volume SMA(20)"],
    resultCount: 19,
    viewCount: 14200,
    runCount: 6400,
    lastUpdated: "EOD",
    education: {
      what: "When price jumps more than 3% on double the normal volume, it signals genuine demand — not just noise or thin-market moves.",
      why: "Volume validates price moves. A 3% move on low volume is unreliable. The same move on 2x volume means serious buyers entered.",
      entry: "Buy within 1% of the breakout candle close. Do not chase if price has already run 5%+.",
      stopLoss: "Below the breakout candle's low.",
      holdDuration: "5–15 trading days.",
      riskReward: "1:2 to 1:3.",
    },
  },
  {
    id: "moving-average-bounce",
    name: "Moving Average Bounce (50 EMA)",
    description: "Price touching 50-EMA from above and bouncing — pullback entry in a strong uptrend.",
    persona: "swing",
    subCategory: "Moving Average Signals",
    difficulty: "intermediate",
    plan: "free",
    timeframe: "Daily",
    indicators: ["EMA(50)", "Close"],
    resultCount: 29,
    viewCount: 17400,
    runCount: 8300,
    lastUpdated: "EOD",
    education: {
      what: "In a strong uptrend, stocks pull back to the 50-EMA and bounce. This is a lower-risk entry compared to buying at highs.",
      why: "The 50-EMA is the most widely watched moving average among institutional traders. Buying at this level puts you alongside institutions.",
      entry: "Buy when price touches or slightly pierces the 50 EMA and a bullish candle forms (hammer, engulfing, or pin bar).",
      stopLoss: "A close below the 50 EMA is your stop.",
      holdDuration: "1–3 weeks.",
      riskReward: "1:2 to 1:4 if the uptrend is strong.",
    },
  },

  // POSITIONAL / LONG-TERM
  {
    id: "fii-buying-surge",
    name: "FII/DII Buying Surge",
    description: "FII stake increased by more than 1% in the latest quarter — institutional accumulation signal.",
    persona: "positional",
    subCategory: "Institutional Screens",
    difficulty: "intermediate",
    plan: "free",
    timeframe: "Daily",
    indicators: ["FII Stake Change"],
    resultCount: 14,
    viewCount: 18900,
    runCount: 8100,
    lastUpdated: "Weekly",
    education: {
      what: "FII (Foreign Institutional Investor) and DII (Domestic Institutional Investor) stake changes are disclosed quarterly. A 1%+ increase signals sustained institutional conviction.",
      why: "Institutions cannot enter and exit quickly due to their size. When they increase stake, they're committing to a multi-month thesis — a powerful signal for retail traders to follow.",
      entry: "Buy on the close of the day when the FII/DII data is reported, if the stock is in an uptrend.",
      stopLoss: "Below the 200 DMA. This is a positional trade — use wider stops.",
      holdDuration: "1–3 months.",
      riskReward: "1:3 or better. Institutional-backed moves tend to be sustained.",
    },
  },
  {
    id: "stocks-near-ath",
    name: "Stocks Near All-Time High",
    description: "Within 5% of their all-time high — momentum continuation setup.",
    persona: "positional",
    subCategory: "Breakout Screens",
    difficulty: "beginner",
    plan: "free",
    timeframe: "Daily",
    indicators: ["Close", "All-Time High"],
    resultCount: 21,
    viewCount: 15600,
    runCount: 6800,
    lastUpdated: "EOD",
    education: {
      what: "Stocks within 5% of their all-time high are in the strongest uptrends in the market — they have absorbed all available selling and are poised for new highs.",
      why: "The best stocks in the market consistently trade near their highs. Weakness is temporary; the trend is durable.",
      entry: "Buy on any pullback to key moving averages or on a breakout to a new ATH.",
      stopLoss: "Below the 50 DMA or 10% below ATH.",
      holdDuration: "3–6 months for full trend capture.",
      riskReward: "Variable. Use a trailing stop to let winners run.",
    },
  },
  {
    id: "death-cross",
    name: "Death Cross Alert",
    description: "50 DMA crosses below 200 DMA — early warning for bearish trend shift.",
    persona: "swing",
    subCategory: "Moving Average Signals",
    difficulty: "beginner",
    plan: "free",
    timeframe: "Daily",
    indicators: ["SMA(50)", "SMA(200)"],
    resultCount: 4,
    viewCount: 11200,
    runCount: 4800,
    lastUpdated: "EOD",
    education: {
      what: "The Death Cross is the inverse of the Golden Cross — the 50-day MA crosses below the 200-day MA, signaling a long-term bearish shift.",
      why: "This signal is used by fund managers as a trigger to reduce equity exposure. It generates significant selling pressure.",
      entry: "Use as an exit signal for existing longs, or as a short entry for aggressive traders.",
      stopLoss: "Above the 50 DMA for shorts.",
      holdDuration: "Weeks to months — this is a trend signal, not a timing signal.",
      riskReward: "Primarily a risk management tool rather than a high-R trade.",
    },
  },

  // ADVANCED SWING - Plus Only
  {
    id: "darvas-box-breakout",
    name: "Darvas Box Breakout",
    description: "Within 10% of 52W high, 100%+ above 52W low, with volume > 1L — classic position trade.",
    persona: "swing",
    subCategory: "Advanced Breakout",
    difficulty: "advanced",
    plan: "plus",
    timeframe: "Daily",
    indicators: ["52W High", "52W Low", "Volume"],
    resultCount: 7,
    viewCount: 9800,
    runCount: 3200,
    lastUpdated: "EOD",
    education: {
      what: "The Darvas Box strategy, developed by Nicolas Darvas in the 1950s, selects stocks that have risen 100%+ from their 52-week low and are breaking to new highs.",
      why: "Stocks that have doubled are in extraordinary demand. When they break out of a Darvas Box (a period of consolidation near highs), the moves can be explosive.",
      entry: "Buy on close above the box high (prior 52W high) with volume.",
      stopLoss: "Below the box low (lower boundary of consolidation).",
      holdDuration: "4–12 weeks.",
      riskReward: "1:5 or better on the best setups.",
    },
  },
  {
    id: "rsi-bullish-divergence",
    name: "Bullish Divergence (RSI)",
    description: "Price making lower lows while RSI makes higher lows — powerful reversal signal.",
    persona: "swing",
    subCategory: "Mean Reversion Screens",
    difficulty: "advanced",
    plan: "plus",
    timeframe: "Daily",
    indicators: ["RSI(14)", "Close"],
    resultCount: 5,
    viewCount: 8700,
    runCount: 2900,
    lastUpdated: "EOD",
    education: {
      what: "Bullish divergence occurs when the price chart makes a lower low, but the RSI makes a higher low — indicating that selling momentum is weakening despite the lower price.",
      why: "Divergence signals a disconnect between price and momentum. When momentum improves before price, it suggests a trend reversal is imminent.",
      entry: "Buy on the first higher low in price that confirms the divergence, with a bullish candle pattern.",
      stopLoss: "Below the price's most recent low.",
      holdDuration: "1–4 weeks.",
      riskReward: "1:3. Divergence setups have high win rates when volume confirms.",
    },
  },

  // LONG-TERM
  {
    id: "undervalued-strong-fundamentals",
    name: "Undervalued + Strong Fundamentals",
    description: "Low PE ratio with high ROE and consistent profit growth — quality at a discount.",
    persona: "longterm",
    subCategory: "Value Screens",
    difficulty: "intermediate",
    plan: "free",
    timeframe: "Daily",
    indicators: ["PE Ratio", "ROE", "Revenue Growth"],
    resultCount: 38,
    viewCount: 29800,
    runCount: 12400,
    lastUpdated: "Weekly",
    education: {
      what: "This screen identifies companies with PE ratios below 20, ROE above 15%, and consistent 3-year profit growth — fundamentally strong businesses trading at reasonable valuations.",
      why: "Warren Buffett's core strategy: buy wonderful companies at fair prices. Low PE + high ROE is the textbook definition of a value compounder.",
      entry: "Buy when the technical chart also shows an uptrend or breakout. Don't fight a downtrend even for value stocks.",
      stopLoss: "Below the 200 DMA or if fundamentals deteriorate (profit turns negative).",
      holdDuration: "12–36 months. This is a wealth-building, not a trading, strategy.",
      riskReward: "Variable. The goal is 15–25% CAGR over multiple years.",
    },
  },
  {
    id: "dividend-aristocrats",
    name: "Dividend Aristocrats",
    description: "Stocks with 5+ consecutive years of dividend growth and yield above 2%.",
    persona: "longterm",
    subCategory: "Dividend Screens",
    difficulty: "beginner",
    plan: "free",
    timeframe: "Daily",
    indicators: ["Dividend Yield", "Dividend Growth History"],
    resultCount: 18,
    viewCount: 16200,
    runCount: 6800,
    lastUpdated: "Monthly",
    education: {
      what: "Dividend Aristocrats are companies that have consistently grown their dividend payouts for 5 or more consecutive years — a sign of durable earnings and disciplined management.",
      why: "Dividend growth stocks outperform the broader market over long periods. The growing dividend provides income and acts as a floor for the stock price.",
      entry: "Buy on any significant pullback (10–15% correction) or when dividend yield hits a multi-year high.",
      stopLoss: "If the company cuts or freezes its dividend, exit immediately.",
      holdDuration: "3–10 years. Reinvest dividends for compounding.",
      riskReward: "Total return = capital appreciation + dividend income. Aim for 12-15% CAGR.",
    },
  },
  // Plus-only positional
  {
    id: "piotroski-score",
    name: "Piotroski Score > 7",
    description: "Companies scoring 8-9 on the Piotroski F-Score — the strongest fundamental quality screen.",
    persona: "longterm",
    subCategory: "Institutional Screens",
    difficulty: "advanced",
    plan: "plus",
    timeframe: "Daily",
    indicators: ["Piotroski F-Score"],
    resultCount: 12,
    viewCount: 7800,
    runCount: 2400,
    lastUpdated: "Quarterly",
    education: {
      what: "The Piotroski F-Score rates companies 0–9 based on 9 financial health criteria: profitability (3), leverage (3), and operating efficiency (3). Score above 7 = financially strong.",
      why: "Academic research shows that buying high Piotroski-score stocks and avoiding low-score stocks generates 7.5% alpha annually over the market.",
      entry: "Buy on any technical pullback to the 50 or 200 DMA.",
      stopLoss: "If next quarterly results show deteriorating fundamentals (score drops below 5).",
      holdDuration: "6–18 months. Update the score every quarter.",
      riskReward: "1:4 or better on 12-month horizon.",
    },
  },
];

// ─── SCAN RESULTS (Mock) ─────────────────────────────────────────────────────

export const MOCK_SCAN_RESULTS: ScanResult[] = [
  { rank: 1, symbol: "RELIANCE", company: "Reliance Industries", price: 2847.50, change1d: 2.14, volume: 4820000, volumeAvg: 3200000, signalReason: "Volume 5.2x above 5-day avg", details: { RSI: 58.4, "Vol Ratio": "5.2x" } },
  { rank: 2, symbol: "HDFCBANK", company: "HDFC Bank", price: 1692.30, change1d: 1.87, volume: 6120000, volumeAvg: 4100000, signalReason: "Price crossed 52W high with volume", details: { RSI: 64.2, "Vol Ratio": "2.8x" } },
  { rank: 3, symbol: "INFY", company: "Infosys", price: 1548.75, change1d: 3.42, volume: 8940000, volumeAvg: 4800000, signalReason: "Bullish engulfing + VWAP cross", details: { RSI: 61.7, "Vol Ratio": "3.1x" } },
  { rank: 4, symbol: "WIPRO", company: "Wipro Ltd", price: 487.20, change1d: 2.91, volume: 3210000, volumeAvg: 2100000, signalReason: "Volume 4.8x above average", details: { RSI: 55.3, "Vol Ratio": "4.8x" } },
  { rank: 5, symbol: "ICICIBANK", company: "ICICI Bank", price: 1124.60, change1d: 1.64, volume: 9840000, volumeAvg: 7200000, signalReason: "Breaking above 20-day high", details: { RSI: 59.8, "Vol Ratio": "2.1x" } },
  { rank: 6, symbol: "TATAMOTORS", company: "Tata Motors", price: 876.40, change1d: 4.12, volume: 12400000, volumeAvg: 6800000, signalReason: "Volume 7.3x above average", details: { RSI: 67.1, "Vol Ratio": "7.3x" } },
  { rank: 7, symbol: "SUNPHARMA", company: "Sun Pharma", price: 1234.85, change1d: 1.28, volume: 2840000, volumeAvg: 2200000, signalReason: "Consolidation breakout with volume", details: { RSI: 56.4, "Vol Ratio": "1.9x" } },
  { rank: 8, symbol: "BAJFINANCE", company: "Bajaj Finance", price: 7842.30, change1d: 2.74, volume: 1890000, volumeAvg: 1240000, signalReason: "Above all key EMAs", details: { RSI: 62.9, "Vol Ratio": "2.4x" } },
  { rank: 9, symbol: "ASIANPAINT", company: "Asian Paints", price: 3124.50, change1d: -0.42, volume: 1240000, volumeAvg: 980000, signalReason: "RSI divergence forming", details: { RSI: 48.2, "Vol Ratio": "1.3x" } },
  { rank: 10, symbol: "TITAN", company: "Titan Company", price: 3456.80, change1d: 1.92, volume: 2180000, volumeAvg: 1560000, signalReason: "50 EMA bounce with volume", details: { RSI: 60.1, "Vol Ratio": "2.2x" } },
  { rank: 11, symbol: "HCLTECH", company: "HCL Technologies", price: 1384.20, change1d: 2.18, volume: 3420000, volumeAvg: 2400000, signalReason: "Price above 200 DMA with RSI rising", details: { RSI: 57.6, "Vol Ratio": "1.7x" } },
  { rank: 12, symbol: "MARUTI", company: "Maruti Suzuki", price: 10284.00, change1d: 0.98, volume: 890000, volumeAvg: 720000, signalReason: "Near 52-week high with momentum", details: { RSI: 63.4, "Vol Ratio": "1.5x" } },
];

// ─── MARKETPLACE SCREENERS ───────────────────────────────────────────────────

export const MARKETPLACE_SCREENERS: MarketplaceScreener[] = [
  {
    id: "ms-001",
    name: "Morning Power Scanner",
    description: "My go-to scan every morning at 9:20 AM. Combines ORB setup with volume shocker conditions. Works best in trending markets.",
    creator: { handle: "trader_vikram", displayName: "Vikram Mehta", verified: true, followers: 2840 },
    tags: ["Intraday", "ORB", "Volume", "Morning"],
    persona: "intraday",
    likes: 1248,
    views: 34200,
    uses: 8940,
    copies: 312,
    createdAt: "2025-11-12",
    updatedAt: "2026-03-10",
    isEditorChoice: true,
    isFeatured: false,
    performance: { hitRate: 68, sampleSize: 340, badge: "high" },
    conditions: "RSI(14, 15m) > 55 AND Volume > 3x Volume SMA(20) AND Close > VWAP AND ORB Breakout detected",
  },
  {
    id: "ms-002",
    name: "Nifty 500 Momentum Beast",
    description: "Finds stocks in the sweet spot — above all 3 key EMAs, RSI 50-65, and breaking out of a tight range. Perfect for 2-5 day trades.",
    creator: { handle: "quant_priya", displayName: "Priya Sharma", verified: true, followers: 5120 },
    tags: ["Swing", "EMA", "Momentum", "Nifty500"],
    persona: "swing",
    likes: 2840,
    views: 78400,
    uses: 22100,
    copies: 891,
    createdAt: "2025-09-05",
    updatedAt: "2026-03-14",
    isEditorChoice: true,
    isFeatured: true,
    performance: { hitRate: 72, sampleSize: 580, badge: "high" },
    conditions: "Close > EMA(20) AND Close > EMA(50) AND Close > EMA(200) AND RSI(14) BETWEEN 50 AND 65 AND Bollinger Bandwidth < 5",
  },
  {
    id: "ms-003",
    name: "BTST Closing Bell Scanner",
    description: "Run this at 3:15 PM every day. Stocks closing near their day high with rising volume in the last 3 candles.",
    creator: { handle: "btst_king", displayName: "Rahul Trades", verified: false, followers: 890 },
    tags: ["BTST", "Closing", "Volume", "Overnight"],
    persona: "btst",
    likes: 678,
    views: 19800,
    uses: 4320,
    copies: 189,
    createdAt: "2025-12-01",
    updatedAt: "2026-03-15",
    isEditorChoice: false,
    isFeatured: false,
    performance: { hitRate: 61, sampleSize: 210, badge: "moderate" },
    conditions: "Close > 99% of Day High AND Volume > Volume SMA(5) AND 1D Change > 1.5%",
  },
  {
    id: "ms-004",
    name: "Value + Growth Compounder",
    description: "Long-term portfolio builder. PE < 20, ROE > 15%, 3yr revenue growth > 12%, no FII selling. Rerun quarterly.",
    creator: { handle: "invest_ananya", displayName: "Ananya Krishnan", verified: true, followers: 3240 },
    tags: ["Long-term", "Value", "Fundamental", "Compounders"],
    persona: "longterm",
    likes: 1890,
    views: 42100,
    uses: 11400,
    copies: 562,
    createdAt: "2025-08-20",
    updatedAt: "2026-02-28",
    isEditorChoice: false,
    isFeatured: false,
    performance: { hitRate: 78, sampleSize: 420, badge: "high" },
    conditions: "PE Ratio < 20 AND ROE > 15 AND 3Y Revenue Growth > 12 AND FII Stake Change > 0",
  },
  {
    id: "ms-005",
    name: "RSI Reversal Hunter",
    description: "Catches oversold stocks on the daily chart that are starting to reverse. Best used during market corrections.",
    creator: { handle: "rsi_master", displayName: "Arjun Patel", verified: false, followers: 420 },
    tags: ["Swing", "RSI", "Oversold", "Reversal"],
    persona: "swing",
    likes: 342,
    views: 8900,
    uses: 1840,
    copies: 78,
    createdAt: "2026-01-10",
    updatedAt: "2026-03-12",
    isEditorChoice: false,
    isFeatured: false,
    performance: { hitRate: 54, sampleSize: 89, badge: "moderate" },
    conditions: "RSI(14, 1d) crossed above 30 AND RSI(14, 1d) < 45 AND Volume > Volume SMA(20)",
  },
  {
    id: "ms-006",
    name: "Sector Leader Rotation",
    description: "Identifies the top 3-5 stocks outperforming their sector index by >5% in the last month. Sector rotation at its finest.",
    creator: { handle: "sectorpro", displayName: "Deepak Iyer", verified: true, followers: 1680 },
    tags: ["Positional", "Sector", "Relative Strength", "Rotation"],
    persona: "positional",
    likes: 920,
    views: 24600,
    uses: 6200,
    copies: 284,
    createdAt: "2025-10-15",
    updatedAt: "2026-03-08",
    isEditorChoice: false,
    isFeatured: false,
    performance: { hitRate: 65, sampleSize: 180, badge: "high" },
    conditions: "1M Return > Sector 1M Return + 5 AND Volume > Volume SMA(20) AND ADX(14) > 25",
  },
  {
    id: "ms-007",
    name: "New to Platform Scanner",
    description: "Testing out my first scanner on Upstox! Looking for stocks with increasing OBV and price above 50 DMA.",
    creator: { handle: "newtrader99", displayName: "Sneha Gupta", verified: false, followers: 45 },
    tags: ["Swing", "OBV", "Volume", "EMA"],
    persona: "swing",
    likes: 12,
    views: 340,
    uses: 89,
    copies: 4,
    createdAt: "2026-03-14",
    updatedAt: "2026-03-16",
    isEditorChoice: false,
    isFeatured: false,
    performance: { hitRate: 0, sampleSize: 12, badge: "new" },
    conditions: "OBV is increasing for 5 consecutive bars AND Close > EMA(50)",
  },
];

// ─── ALERTS ──────────────────────────────────────────────────────────────────

export const MOCK_ALERTS: AlertItem[] = [
  {
    id: "alert-001",
    name: "Volume Shockers Alert",
    scannerName: "Volume Shockers (Live)",
    scannerId: "volume-shockers-live",
    channels: ["whatsapp", "push"],
    status: "active",
    lastTriggered: "Today, 11:42 AM",
    triggersThisWeek: 18,
    createdAt: "2026-03-01",
  },
  {
    id: "alert-002",
    name: "52W High Breakout",
    scannerName: "52-Week High Breakout",
    scannerId: "52w-high-breakout",
    channels: ["email", "push"],
    status: "active",
    lastTriggered: "Yesterday, 3:18 PM",
    triggersThisWeek: 4,
    createdAt: "2026-02-20",
  },
  {
    id: "alert-003",
    name: "My BTST Scan Alert",
    scannerName: "Morning Power Scanner",
    scannerId: "ms-001",
    channels: ["whatsapp"],
    status: "paused",
    lastTriggered: "Mar 12, 2:58 PM",
    triggersThisWeek: 0,
    createdAt: "2026-02-15",
  },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

export const PERSONA_LABELS: Record<ScannerPersona, string> = {
  intraday: "Intraday",
  btst: "BTST",
  swing: "Swing",
  positional: "Positional",
  longterm: "Long-Term",
};

export const PERSONA_COLORS: Record<ScannerPersona, string> = {
  intraday: "bg-orange-100 text-orange-700",
  btst: "bg-blue-100 text-blue-700",
  swing: "bg-green-100 text-green-700",
  positional: "bg-purple-100 text-purple-700",
  longterm: "bg-teal-100 text-teal-700",
};

export const DIFFICULTY_COLORS: Record<ScannerDifficulty, string> = {
  beginner: "bg-green-50 text-green-700",
  intermediate: "bg-yellow-50 text-yellow-700",
  advanced: "bg-red-50 text-red-700",
};

export function formatVolume(vol: number): string {
  if (vol >= 10000000) return `${(vol / 10000000).toFixed(1)} Cr`;
  if (vol >= 100000) return `${(vol / 100000).toFixed(1)} L`;
  if (vol >= 1000) return `${(vol / 1000).toFixed(0)} K`;
  return `${vol}`;
}

export function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return `${n}`;
}
