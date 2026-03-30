/**
 * Opportunity Feed — The data layer for the mobile scanner page.
 *
 * Instead of showing scanners, the page shows STOCKS that scanners found.
 * This module cross-references LIVE_SIGNALS × MOCK_SCAN_RESULTS × PRE_BUILT_SCANNERS
 * to produce enriched "opportunity" items with trade theses.
 */

import {
  PRE_BUILT_SCANNERS,
  MOCK_SCAN_RESULTS,
  MARKETPLACE_SCREENERS,
  type ScannerPersona,
  type PreBuiltScanner,
} from "./mockData";

// ─── TYPES ──────────────────────────────────────────────────────────────────

export interface OpportunityFeedItem {
  id: string;
  type: "signal" | "strong-signal" | "education" | "community";
  // Stock data
  symbol: string;
  company: string;
  price: number;
  changePct: number;
  volume: number;
  volumeAvg: number;
  // Signal context
  signal: string;
  scannerName: string;
  scannerId: string;
  persona: ScannerPersona;
  timestamp: string;
  direction: "bullish" | "bearish" | "neutral";
  strength: "strong" | "moderate";
  // Trade thesis (from scanner.education)
  tradeThesis: {
    entry: string;
    stopLoss: string;
    riskReward: string;
    holdDuration: string;
    what: string;
    why: string;
  };
  // Expansion data
  details: Record<string, string | number>;
  relatedScannerIds: string[];
  // Community-specific (only for type === "community")
  community?: {
    creatorName: string;
    creatorHandle: string;
    verified: boolean;
    hitRate: number;
    hitBadge: "high" | "moderate" | "new";
  };
  // Education-specific (only for type === "education")
  educationText?: string;
  educationScannerName?: string;
}

export interface MarketPulse {
  nifty: { value: number; change: number };
  bankNifty: { value: number; change: number };
  mood: "Bullish" | "Bearish" | "Sideways";
  breadth: { advancing: number; declining: number; total: number };
}

export interface TimePhase {
  id: string;
  label: string;
  description: string;
  scannerFilter: (s: PreBuiltScanner) => boolean;
  educationTheme: string;
}

export interface Playlist {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  persona: ScannerPersona;
  difficulty: "beginner" | "intermediate";
  steps: { scannerId: string; label: string; when: string }[];
  gradient: string;
}

// ─── MOCK MARKET DATA ───────────────────────────────────────────────────────

export const MARKET_PULSE: MarketPulse = {
  nifty: { value: 22847.5, change: 1.24 },
  bankNifty: { value: 48932.1, change: 0.87 },
  mood: "Bullish",
  breadth: { advancing: 312, declining: 188, total: 500 },
};

// ─── TIME PHASE LOGIC ───────────────────────────────────────────────────────

export function getTimePhase(): TimePhase {
  const h = new Date().getHours();
  const m = new Date().getMinutes();
  const t = h * 60 + m;

  if (t < 9 * 60 + 15)
    return {
      id: "pre-market",
      label: "Pre-Market",
      description: "Market opens at 9:15 — preview gap stocks",
      scannerFilter: (s) => /gap|pre/i.test(s.name + s.subCategory),
      educationTheme: "What are gaps and why they matter",
    };
  if (t < 9 * 60 + 35)
    return {
      id: "opening-bell",
      label: "Opening Bell",
      description: "First 15 minutes — ORB & volume spikes",
      scannerFilter: (s) =>
        /morning|opening|gap|orb|first|open/i.test(s.name + s.subCategory),
      educationTheme: "The first 15 minutes set the day's tone",
    };
  if (t < 11 * 60)
    return {
      id: "morning",
      label: "Morning Session",
      description: "Momentum building — breakouts & VWAP signals",
      scannerFilter: (s) =>
        /morning|momentum|vwap|volume|breakout|engulfing|pivot/i.test(
          s.name + s.subCategory
        ),
      educationTheme: "How VWAP guides institutional traders",
    };
  if (t < 14 * 60 + 30)
    return {
      id: "mid-session",
      label: "Mid-Session",
      description: "Continuation patterns & reversals",
      scannerFilter: (s) =>
        /momentum|rsi|vwap|volume|pattern|engulfing|pivot/i.test(
          s.name + s.subCategory
        ),
      educationTheme: "When to hold vs when to exit",
    };
  if (t < 15 * 60 + 30)
    return {
      id: "closing-bell",
      label: "Closing Bell",
      description: "BTST setups & strong close candidates",
      scannerFilter: (s) =>
        /btst|closing|close|nr7|strong/i.test(s.name + s.subCategory),
      educationTheme: "BTST basics — buying today, selling tomorrow",
    };
  return {
    id: "after-hours",
    label: "After Hours",
    description: "Prepare for tomorrow — swing & positional setups",
    scannerFilter: (s) =>
      /swing|breakout|crossover|moving|52w|fundament|dividend|value|fii|piotroski/i.test(
        s.name + s.subCategory
      ),
    educationTheme: "Weekend prep — building your swing watchlist",
  };
}

// ─── PLAYLISTS ──────────────────────────────────────────────────────────────

export const PLAYLISTS: Playlist[] = [
  {
    id: "pl-morning",
    title: "Morning Routine",
    subtitle: "Run these 3 scans between 9:15–10:00 AM",
    emoji: "🌅",
    persona: "intraday",
    difficulty: "beginner",
    steps: [
      { scannerId: "gap-up-opening", label: "Check gap-ups", when: "9:00 AM" },
      { scannerId: "orb-15", label: "Watch ORB breakout", when: "9:30 AM" },
      {
        scannerId: "first-15m-volume-shocker",
        label: "Spot volume spikes",
        when: "9:35 AM",
      },
    ],
    gradient: "from-orange-500/10 via-amber-500/5 to-transparent",
  },
  {
    id: "pl-btst",
    title: "BTST Playbook",
    subtitle: "End-of-day setup at 3:00–3:25 PM",
    emoji: "🌙",
    persona: "btst",
    difficulty: "intermediate",
    steps: [
      {
        scannerId: "closing-range-breakout",
        label: "Late-day breakouts",
        when: "2:45 PM",
      },
      {
        scannerId: "strong-close-near-high",
        label: "Strong close stocks",
        when: "3:15 PM",
      },
      { scannerId: "nr7-breakout", label: "NR7 compression breaks", when: "3:20 PM" },
    ],
    gradient: "from-blue-500/10 via-indigo-500/5 to-transparent",
  },
  {
    id: "pl-swing",
    title: "Weekend Swing Setup",
    subtitle: "Prepare your swing watchlist on Saturday",
    emoji: "📊",
    persona: "swing",
    difficulty: "beginner",
    steps: [
      { scannerId: "52w-high-breakout", label: "52W high breakouts", when: "Step 1" },
      {
        scannerId: "consolidation-breakout",
        label: "BB squeeze setups",
        when: "Step 2",
      },
      { scannerId: "golden-crossover", label: "Golden cross stocks", when: "Step 3" },
    ],
    gradient: "from-green-500/10 via-emerald-500/5 to-transparent",
  },
  {
    id: "pl-longterm",
    title: "Quarterly Portfolio Review",
    subtitle: "Find quality compounders for your core portfolio",
    emoji: "💎",
    persona: "longterm",
    difficulty: "beginner",
    steps: [
      {
        scannerId: "undervalued-strong-fundamentals",
        label: "Value + quality",
        when: "Step 1",
      },
      { scannerId: "dividend-aristocrats", label: "Dividend growers", when: "Step 2" },
      { scannerId: "fii-buying-surge", label: "FII accumulation", when: "Step 3" },
    ],
    gradient: "from-teal-500/10 via-cyan-500/5 to-transparent",
  },
];

// ─── RAW SIGNAL DATA (would come from websocket in prod) ────────────────────

interface RawSignal {
  symbol: string;
  scannerId: string;
  signal: string;
  timestamp: string;
  strength: "strong" | "moderate";
}

const RAW_SIGNALS: RawSignal[] = [
  {
    symbol: "RELIANCE",
    scannerId: "orb-15",
    signal: "Broke above Opening Range high at 9:17 AM with 2.1x volume",
    timestamp: "Just now",
    strength: "strong",
  },
  {
    symbol: "TATAMOTORS",
    scannerId: "volume-shockers-live",
    signal: "Volume 7.3x average — institutional activity detected",
    timestamp: "32s ago",
    strength: "strong",
  },
  {
    symbol: "HDFCBANK",
    scannerId: "52w-high-breakout",
    signal: "Crossed 52-week high with volume confirmation",
    timestamp: "1m ago",
    strength: "strong",
  },
  {
    symbol: "INFY",
    scannerId: "intraday-rsi-oversold",
    signal: "RSI dropped to 28.4 — oversold bounce candidate at support",
    timestamp: "2m ago",
    strength: "moderate",
  },
  {
    symbol: "TCS",
    scannerId: "vwap-cross-bullish",
    signal: "Price crossed above VWAP with rising volume",
    timestamp: "3m ago",
    strength: "moderate",
  },
  {
    symbol: "BAJFINANCE",
    scannerId: "bullish-engulfing-15m",
    signal: "Bullish engulfing on 15-min chart near 50-EMA support",
    timestamp: "4m ago",
    strength: "strong",
  },
  {
    symbol: "WIPRO",
    scannerId: "gap-up-opening",
    signal: "Opened 2.9% above yesterday's close — gap-and-go setup",
    timestamp: "5m ago",
    strength: "moderate",
  },
  {
    symbol: "ICICIBANK",
    scannerId: "pivot-breakout",
    signal: "Price broke above R1 pivot with above-average volume",
    timestamp: "6m ago",
    strength: "moderate",
  },
  {
    symbol: "TITAN",
    scannerId: "moving-average-bounce",
    signal: "Bounced off 50-EMA with hammer candle — pullback entry",
    timestamp: "8m ago",
    strength: "moderate",
  },
  {
    symbol: "SUNPHARMA",
    scannerId: "consolidation-breakout",
    signal: "Bollinger Band squeeze breakout — volatility expanding",
    timestamp: "12m ago",
    strength: "strong",
  },
  {
    symbol: "HCLTECH",
    scannerId: "golden-crossover",
    signal: "50 DMA crossed above 200 DMA — golden cross confirmed",
    timestamp: "Today",
    strength: "strong",
  },
  {
    symbol: "MARUTI",
    scannerId: "stocks-near-ath",
    signal: "Within 2% of all-time high — momentum continuation",
    timestamp: "Today",
    strength: "moderate",
  },
];

// ─── FEED GENERATION ────────────────────────────────────────────────────────

/**
 * Cross-references raw signals with stock data and scanner education
 * to produce enriched opportunity feed items.
 */
function enrichSignal(raw: RawSignal): OpportunityFeedItem | null {
  const stock = MOCK_SCAN_RESULTS.find((s) => s.symbol === raw.symbol);
  const scanner = PRE_BUILT_SCANNERS.find((s) => s.id === raw.scannerId);
  if (!stock || !scanner) return null;

  // Find other scanners this stock could match (for "also matched" feature)
  const relatedScannerIds = RAW_SIGNALS.filter(
    (s) => s.symbol === raw.symbol && s.scannerId !== raw.scannerId
  ).map((s) => s.scannerId);

  const direction: "bullish" | "bearish" | "neutral" =
    stock.change1d > 0.5 ? "bullish" : stock.change1d < -0.5 ? "bearish" : "neutral";

  return {
    id: `${raw.symbol}-${raw.scannerId}`,
    type: raw.strength === "strong" ? "strong-signal" : "signal",
    symbol: stock.symbol,
    company: stock.company,
    price: stock.price,
    changePct: stock.change1d,
    volume: stock.volume,
    volumeAvg: stock.volumeAvg,
    signal: raw.signal,
    scannerName: scanner.name,
    scannerId: scanner.id,
    persona: scanner.persona,
    timestamp: raw.timestamp,
    direction,
    strength: raw.strength,
    tradeThesis: {
      entry: scanner.education.entry,
      stopLoss: scanner.education.stopLoss,
      riskReward: scanner.education.riskReward,
      holdDuration: scanner.education.holdDuration,
      what: scanner.education.what,
      why: scanner.education.why,
    },
    details: stock.details,
    relatedScannerIds,
  };
}

/** Generate education inline cards from scanners relevant to current time phase */
function generateEducationCards(phase: TimePhase): OpportunityFeedItem[] {
  const relevantScanners = PRE_BUILT_SCANNERS.filter(phase.scannerFilter).slice(0, 3);

  return relevantScanners.map((scanner) => {
    // Take the first sentence of the "what" field
    const firstSentence =
      scanner.education.what.split(". ").slice(0, 1).join(". ") + ".";

    return {
      id: `edu-${scanner.id}`,
      type: "education" as const,
      symbol: "",
      company: "",
      price: 0,
      changePct: 0,
      volume: 0,
      volumeAvg: 0,
      signal: "",
      scannerName: scanner.name,
      scannerId: scanner.id,
      persona: scanner.persona,
      timestamp: "",
      direction: "neutral" as const,
      strength: "moderate" as const,
      tradeThesis: {
        entry: scanner.education.entry,
        stopLoss: scanner.education.stopLoss,
        riskReward: scanner.education.riskReward,
        holdDuration: scanner.education.holdDuration,
        what: scanner.education.what,
        why: scanner.education.why,
      },
      details: {},
      relatedScannerIds: [],
      educationText: firstSentence,
      educationScannerName: scanner.name,
    };
  });
}

/** Generate community pick cards from marketplace screeners */
function generateCommunityCards(): OpportunityFeedItem[] {
  // Pick the top-rated marketplace screeners
  const topScreeners = MARKETPLACE_SCREENERS.filter(
    (s) => s.performance.badge === "high"
  ).slice(0, 2);

  // Pair each with a mock stock
  const stockPool = MOCK_SCAN_RESULTS.slice(4, 8);

  return topScreeners.map((screener, idx) => {
    const stock = stockPool[idx % stockPool.length];
    return {
      id: `community-${screener.id}`,
      type: "community" as const,
      symbol: stock.symbol,
      company: stock.company,
      price: stock.price,
      changePct: stock.change1d,
      volume: stock.volume,
      volumeAvg: stock.volumeAvg,
      signal: `Found by ${screener.creator.displayName}'s "${screener.name}"`,
      scannerName: screener.name,
      scannerId: screener.id,
      persona: screener.persona,
      timestamp: "Today",
      direction: stock.change1d > 0 ? ("bullish" as const) : ("bearish" as const),
      strength: "moderate" as const,
      tradeThesis: {
        entry: "Follow the scanner's conditions for entry.",
        stopLoss: "Use the scanner's built-in stop-loss rules.",
        riskReward: `${screener.performance.hitRate}% win rate over ${screener.performance.sampleSize} trades.`,
        holdDuration: screener.persona === "intraday" ? "Intraday" : "2-5 days",
        what: screener.description,
        why: `${screener.performance.hitRate}% win rate across ${screener.performance.sampleSize} trades.`,
      },
      details: stock.details,
      relatedScannerIds: [],
      community: {
        creatorName: screener.creator.displayName,
        creatorHandle: screener.creator.handle,
        verified: screener.creator.verified,
        hitRate: screener.performance.hitRate,
        hitBadge: screener.performance.badge,
      },
    };
  });
}

/**
 * The main feed generator.
 *
 * Produces an interleaved feed of:
 * - ~70% standard/strong signal cards (stocks that matched scanners)
 * - ~10% education cards (inserted every ~5 stock cards)
 * - ~5% community cards (inserted at specific positions)
 *
 * Supports persona filtering and deduplication.
 */
export function generateFeed(
  persona: "all" | ScannerPersona,
  phase: TimePhase
): OpportunityFeedItem[] {
  // 1. Generate stock signal cards
  const signalCards = RAW_SIGNALS.map(enrichSignal).filter(
    Boolean
  ) as OpportunityFeedItem[];

  // 2. Filter by persona
  const filtered =
    persona === "all"
      ? signalCards
      : signalCards.filter((item) => item.persona === persona);

  // 3. Sort: strong signals first, then by recency (index serves as proxy)
  const sorted = [...filtered].sort((a, b) => {
    if (a.strength === "strong" && b.strength !== "strong") return -1;
    if (b.strength === "strong" && a.strength !== "strong") return 1;
    return 0; // preserve original order as proxy for recency
  });

  // 4. Deduplicate: if same symbol appears multiple times, keep first, add related
  const seen = new Set<string>();
  const deduped = sorted.filter((item) => {
    if (seen.has(item.symbol)) return false;
    seen.add(item.symbol);
    return true;
  });

  // 5. Generate education and community cards
  const eduCards = generateEducationCards(phase);
  const communityCards = generateCommunityCards().filter(
    (c) => persona === "all" || c.persona === persona
  );

  // 6. Interleave: insert edu card every ~5 items, community every ~8
  const feed: OpportunityFeedItem[] = [];
  let eduIdx = 0;
  let comIdx = 0;

  deduped.forEach((item, i) => {
    feed.push(item);

    // Insert education card after positions 4, 9, 14...
    if ((i + 1) % 5 === 0 && eduIdx < eduCards.length) {
      feed.push(eduCards[eduIdx++]);
    }

    // Insert community card after positions 7, 15...
    if ((i + 1) % 8 === 0 && comIdx < communityCards.length) {
      feed.push(communityCards[comIdx++]);
    }
  });

  // If feed is short, append remaining edu/community cards
  while (eduIdx < eduCards.length) feed.push(eduCards[eduIdx++]);
  while (comIdx < communityCards.length) feed.push(communityCards[comIdx++]);

  return feed;
}

/** Get the hero opportunity — the single best trade right now */
export function getHeroOpportunity(
  persona: "all" | ScannerPersona,
  phase: TimePhase
): OpportunityFeedItem | null {
  const feed = generateFeed(persona, phase);
  // Best = strong signal matching the current time phase
  const phaseMatch = feed.find(
    (item) =>
      item.type !== "education" &&
      item.type !== "community" &&
      item.strength === "strong" &&
      PRE_BUILT_SCANNERS.find((s) => s.id === item.scannerId && phase.scannerFilter(s))
  );
  return phaseMatch ?? feed.find((f) => f.type !== "education") ?? null;
}

/** Get total active signal count */
export function getActiveSignalCount(persona: "all" | ScannerPersona): number {
  if (persona === "all") return RAW_SIGNALS.length;
  return RAW_SIGNALS.filter((s) => {
    const scanner = PRE_BUILT_SCANNERS.find((sc) => sc.id === s.scannerId);
    return scanner && scanner.persona === persona;
  }).length;
}
