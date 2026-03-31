import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  Zap,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Radio,
  Sunset,
  Target,
  Minus,
  CandlestickChart,
  CalendarClock,
  BriefcaseBusiness,
  Landmark,
  Bell,
  LineChart,
  Flame,
  Clock,
  type LucideIcon,
} from "lucide-react";
import {
  PRE_BUILT_SCANNERS,
} from "@/data/mockData";
import { cn } from "@/lib/utils";
import { QuickScannerSection } from "@/components/scanner/mobile/QuickScannerSection";

export type LiveSignalSentiment = "bullish" | "bearish" | "neutral";

/** Primary filter: what kind of setup (Row 1 pills). */
export type LiveSignalType = "breakouts" | "momentum" | "reversal";

/** Secondary dimension: holding / session context — shown on cards and Row 2 pills. */
export type LiveTimeHorizon = "morning" | "intraday" | "btst" | "swing" | "positional" | "longterm";


export interface LiveMarketSignal {
  id: string;
  symbol: string;
  companyName: string;
  ltp: number;
  changeAbs: number;
  changePct: number;
  /** Scanner strategy name shown as the indicator */
  indicator: string;
  scannerId: string;
  /** Optional metric tied to the strategy (e.g. volume multiple, gap %). */
  attribute?: { label: string; value: string };
  sentiment: LiveSignalSentiment;
  detectedAgo: string;
  /** Row 1 filter + taxonomy — drives Breakouts / Momentum / Reversal. */
  signalType: LiveSignalType;
  /** Row 2 filter + card chips — Morning / Intraday / BTST / Swing. */
  timeHorizons: LiveTimeHorizon[];
  /** Optional extra context on the card (e.g. volume-led setup) — not a primary pill. */
  extraTags?: string[];

  /* ── New actionable content fields ── */
  /** Factual event: "Broke above ₹2,840 (15-min high)" */
  contextLine: string;
  /** API-provided trigger descriptor for metrics row (preferred over parsing contextLine). */
  triggerContext?: string;
  /** Volume proof: "Vol 2.1× avg" */
  volumeContext?: string;
  /** Educational: pattern typical duration label */
  typicalDuration: string;
  /** Total pattern window in minutes (for progress bar) */
  typicalDurationMins: number;
  /** Minutes since detected (for progress bar) */
  detectedMinsAgo: number;
}

function formatInr(n: number) {
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Mock live signals — in production: websocket + screener runs */
const LIVE_MARKET_SIGNALS: LiveMarketSignal[] = [
  /* ────── BREAKOUTS ────── */
  {
    id: "sig-orb",
    symbol: "RELIANCE",
    companyName: "Reliance Industries Ltd.",
    ltp: 2847.5,
    changeAbs: 39.85,
    changePct: 1.42,
    indicator: "Opening Range Breakout",
    scannerId: "orb-15",
    attribute: { label: "ORB range", value: "0.8% of spot" },
    contextLine: "Broke above ₹2,840 (15-min high)",
    volumeContext: "Vol 2.1× avg",
    typicalDuration: "~2 hours",
    typicalDurationMins: 120,
    detectedMinsAgo: 2,
    sentiment: "bullish",
    detectedAgo: "2 mins ago",
    signalType: "breakouts",
    timeHorizons: ["morning", "intraday"],
  },
  {
    id: "sig-orbd",
    symbol: "TATAMOTORS",
    companyName: "Tata Motors Ltd.",
    ltp: 648.3,
    changeAbs: -11.5,
    changePct: -1.74,
    indicator: "Opening Range Breakdown",
    scannerId: "orb-15",
    attribute: { label: "ORB range", value: "1.1% of spot" },
    contextLine: "Broke below ₹652 (15-min low)",
    volumeContext: "Vol 1.8× avg",
    typicalDuration: "~2 hours",
    typicalDurationMins: 120,
    detectedMinsAgo: 5,
    sentiment: "bearish",
    detectedAgo: "5 mins ago",
    signalType: "breakouts",
    timeHorizons: ["morning", "intraday"],
  },
  {
    id: "sig-gap-up",
    symbol: "HDFCBANK",
    companyName: "HDFC Bank Ltd.",
    ltp: 1682.3,
    changeAbs: 34.6,
    changePct: 2.1,
    indicator: "Gap Up Opening",
    scannerId: "gap-up-opening",
    attribute: { label: "Gap size", value: "+1.2% vs prev close" },
    contextLine: "Opened at ₹1,680 vs prev close ₹1,660",
    volumeContext: "Vol 1.4× avg",
    typicalDuration: "First ~1 hour",
    typicalDurationMins: 60,
    detectedMinsAgo: 1,
    sentiment: "bullish",
    detectedAgo: "Just now",
    signalType: "breakouts",
    timeHorizons: ["morning", "intraday"],
  },
  {
    id: "sig-gap-down",
    symbol: "WIPRO",
    companyName: "Wipro Ltd.",
    ltp: 442.1,
    changeAbs: -8.9,
    changePct: -1.97,
    indicator: "Gap Down Opening",
    scannerId: "gap-down-opening",
    attribute: { label: "Gap size", value: "-1.97% vs prev close" },
    contextLine: "Opened at ₹443 vs prev close ₹451",
    volumeContext: "Vol 2.3× avg",
    typicalDuration: "First ~1 hour",
    typicalDurationMins: 60,
    detectedMinsAgo: 3,
    sentiment: "bearish",
    detectedAgo: "3 mins ago",
    signalType: "breakouts",
    timeHorizons: ["morning", "intraday"],
  },
  {
    id: "sig-consol",
    symbol: "BHARTIARTL",
    companyName: "Bharti Airtel Ltd.",
    ltp: 1545.0,
    changeAbs: 42.3,
    changePct: 2.81,
    indicator: "Consolidation Breakout",
    scannerId: "consolidation-breakout",
    attribute: { label: "Range days", value: "14 sessions" },
    contextLine: "Broke above ₹1,520 resistance (14-day range)",
    volumeContext: "Vol 3.2× avg",
    typicalDuration: "~3–5 sessions",
    typicalDurationMins: 1800,
    detectedMinsAgo: 15,
    sentiment: "bullish",
    detectedAgo: "15 mins ago",
    signalType: "breakouts",
    timeHorizons: ["intraday", "swing"],
  },
  {
    id: "sig-darvas",
    symbol: "TRENT",
    companyName: "Trent Ltd.",
    ltp: 5820.0,
    changeAbs: 195.0,
    changePct: 3.47,
    indicator: "Darvas Box Breakout",
    scannerId: "darvas-box-breakout",
    attribute: { label: "Box range", value: "₹5,440–₹5,650" },
    contextLine: "Above Darvas box ceiling",
    volumeContext: "Vol 2.8× avg",
    typicalDuration: "~5–10 sessions",
    typicalDurationMins: 3600,
    detectedMinsAgo: 20,
    sentiment: "bullish",
    detectedAgo: "20 mins ago",
    signalType: "breakouts",
    timeHorizons: ["swing"],
  },
  {
    id: "sig-ath",
    symbol: "ZOMATO",
    companyName: "Zomato Ltd.",
    ltp: 268.5,
    changeAbs: 8.4,
    changePct: 3.23,
    indicator: "Near All-Time High",
    scannerId: "near-ath",
    attribute: { label: "vs ATH", value: "0.3% away" },
    contextLine: "Trading at ₹268.5 — ATH is ₹269.3",
    volumeContext: "Vol 1.9× avg",
    typicalDuration: "~1–3 sessions",
    typicalDurationMins: 1200,
    detectedMinsAgo: 8,
    sentiment: "bullish",
    detectedAgo: "8 mins ago",
    signalType: "breakouts",
    timeHorizons: ["intraday", "swing"],
  },
  {
    id: "sig-pvb",
    symbol: "ADANIENT",
    companyName: "Adani Enterprises Ltd.",
    ltp: 2980.0,
    changeAbs: 87.5,
    changePct: 3.02,
    indicator: "Price-Volume Breakout",
    scannerId: "price-volume-breakout",
    attribute: { label: "Price level", value: "20-day high" },
    contextLine: "Crossed ₹2,950 (20-day high) on heavy volume",
    volumeContext: "Vol 4.1× avg",
    typicalDuration: "~2–5 sessions",
    typicalDurationMins: 2400,
    detectedMinsAgo: 12,
    sentiment: "bullish",
    detectedAgo: "12 mins ago",
    signalType: "breakouts",
    timeHorizons: ["intraday", "swing"],
    extraTags: ["Volume"],
  },
  {
    id: "sig-nr7",
    symbol: "ICICIBANK",
    companyName: "ICICI Bank Ltd.",
    ltp: 1245.0,
    changeAbs: 18.5,
    changePct: 1.51,
    indicator: "NR7 Breakout",
    scannerId: "nr7-breakout",
    attribute: { label: "NR7 range", value: "₹1,225–₹1,238" },
    contextLine: "Broke above ₹1,238 — narrowest range of 7 sessions",
    volumeContext: "Vol 1.6× avg",
    typicalDuration: "~1–2 sessions",
    typicalDurationMins: 900,
    detectedMinsAgo: 6,
    sentiment: "bullish",
    detectedAgo: "6 mins ago",
    signalType: "breakouts",
    timeHorizons: ["btst", "swing"],
  },
  {
    id: "sig-crb",
    symbol: "BAJFINANCE",
    companyName: "Bajaj Finance Ltd.",
    ltp: 7320.0,
    changeAbs: 112.0,
    changePct: 1.55,
    indicator: "Closing Range Breakout",
    scannerId: "closing-range-breakout",
    attribute: { label: "Close vs range", value: "Top 5% of day’s range" },
    contextLine: "Closed at ₹7,320 — near top of day’s ₹7,210–₹7,325 range",
    volumeContext: "Vol 1.3× avg",
    typicalDuration: "Next session open",
    typicalDurationMins: 960,
    detectedMinsAgo: 2,
    sentiment: "bullish",
    detectedAgo: "2 mins ago",
    signalType: "breakouts",
    timeHorizons: ["btst"],
  },

  /* ────── MOMENTUM ────── */
  {
    id: "sig-vol-shock",
    symbol: "INFY",
    companyName: "Infosys Ltd.",
    ltp: 1850.25,
    changeAbs: -6.5,
    changePct: -0.35,
    indicator: "First 15-min Volume Shocker",
    scannerId: "first-15m-volume-shocker",
    attribute: { label: "1st 15m vol", value: "3.1× prev day" },
    contextLine: "First 15-min candle traded 3.1× yesterday’s full-day avg volume",
    volumeContext: "Vol 3.1× avg",
    typicalDuration: "First ~1 hour",
    typicalDurationMins: 60,
    detectedMinsAgo: 1,
    sentiment: "neutral",
    detectedAgo: "1 min ago",
    signalType: "momentum",
    timeHorizons: ["morning", "intraday"],
    extraTags: ["Volume"],
  },
  {
    id: "sig-vwap-bull",
    symbol: "TCS",
    companyName: "Tata Consultancy Services",
    ltp: 3824.0,
    changeAbs: 33.4,
    changePct: 0.88,
    indicator: "VWAP Cross (Bullish)",
    scannerId: "vwap-cross-bullish",
    attribute: { label: "vs VWAP", value: "+0.3% above" },
    contextLine: "Crossed above session VWAP at ₹3,812",
    volumeContext: "Vol 1.6× avg",
    typicalDuration: "Rest of session",
    typicalDurationMins: 180,
    detectedMinsAgo: 1,
    sentiment: "bullish",
    detectedAgo: "42s ago",
    signalType: "momentum",
    timeHorizons: ["intraday"],
  },
  {
    id: "sig-vwap-bear",
    symbol: "KOTAKBANK",
    companyName: "Kotak Mahindra Bank",
    ltp: 1780.0,
    changeAbs: -22.5,
    changePct: -1.25,
    indicator: "VWAP Rejection (Bearish)",
    scannerId: "vwap-rejection-bearish",
    attribute: { label: "vs VWAP", value: "-0.4% below" },
    contextLine: "Rejected at session VWAP ₹1,790 and falling",
    volumeContext: "Vol 1.4× avg",
    typicalDuration: "Rest of session",
    typicalDurationMins: 180,
    detectedMinsAgo: 4,
    sentiment: "bearish",
    detectedAgo: "4 mins ago",
    signalType: "momentum",
    timeHorizons: ["intraday"],
  },
  {
    id: "sig-vol-shk",
    symbol: "TATASTEEL",
    companyName: "Tata Steel Ltd.",
    ltp: 142.8,
    changeAbs: 6.3,
    changePct: 4.61,
    indicator: "Volume Shocker",
    scannerId: "volume-shockers",
    attribute: { label: "Vol multiple", value: "5.2× 20D avg" },
    contextLine: "Volume surged to 5.2× the 20-day average",
    volumeContext: "Vol 5.2× avg",
    typicalDuration: "~1–2 hours",
    typicalDurationMins: 120,
    detectedMinsAgo: 7,
    sentiment: "bullish",
    detectedAgo: "7 mins ago",
    signalType: "momentum",
    timeHorizons: ["intraday"],
    extraTags: ["Volume"],
  },
  {
    id: "sig-above-emas",
    symbol: "LT",
    companyName: "Larsen & Toubro Ltd.",
    ltp: 3420.0,
    changeAbs: 48.0,
    changePct: 1.42,
    indicator: "Price > All Key EMAs (5/9/20)",
    scannerId: "above-all-emas",
    attribute: { label: "Lowest EMA", value: "20 EMA at ₹3,380" },
    contextLine: "Trading above all key EMAs on 5-min chart — ₹3,420 > 5/9/20 EMA",
    volumeContext: "Vol 1.3× avg",
    typicalDuration: "Rest of session",
    typicalDurationMins: 180,
    detectedMinsAgo: 10,
    sentiment: "bullish",
    detectedAgo: "10 mins ago",
    signalType: "momentum",
    timeHorizons: ["intraday"],
  },
  {
    id: "sig-open-low",
    symbol: "MARUTI",
    companyName: "Maruti Suzuki India",
    ltp: 12450.0,
    changeAbs: 185.0,
    changePct: 1.51,
    indicator: "Open = Low (Bullish)",
    scannerId: "open-eq-low",
    attribute: { label: "Open", value: "₹12,265 = Day low" },
    contextLine: "Opened at day’s low ₹12,265 and moved up — no lower wick",
    volumeContext: "Vol 1.5× avg",
    typicalDuration: "~2–3 hours",
    typicalDurationMins: 150,
    detectedMinsAgo: 8,
    sentiment: "bullish",
    detectedAgo: "8 mins ago",
    signalType: "momentum",
    timeHorizons: ["morning", "intraday"],
  },
  {
    id: "sig-open-high",
    symbol: "SUNPHARMA",
    companyName: "Sun Pharma Industries",
    ltp: 1720.0,
    changeAbs: -28.0,
    changePct: -1.6,
    indicator: "Open = High (Bearish)",
    scannerId: "open-eq-high",
    attribute: { label: "Open", value: "₹1,748 = Day high" },
    contextLine: "Opened at day’s high ₹1,748 and moved down — no upper wick",
    volumeContext: "Vol 1.7× avg",
    typicalDuration: "~2–3 hours",
    typicalDurationMins: 150,
    detectedMinsAgo: 6,
    sentiment: "bearish",
    detectedAgo: "6 mins ago",
    signalType: "momentum",
    timeHorizons: ["morning", "intraday"],
  },
  {
    id: "sig-325pm",
    symbol: "AXISBANK",
    companyName: "Axis Bank Ltd.",
    ltp: 1120.5,
    changeAbs: 12.3,
    changePct: 1.11,
    indicator: "3:25 PM Momentum",
    scannerId: "325pm-momentum",
    attribute: { label: "Last 5-min move", value: "+0.6%" },
    contextLine: "Strong buying in last 5 mins — ₹1,114 to ₹1,120 near close",
    volumeContext: "Vol 2.4× last-5m avg",
    typicalDuration: "Next session open",
    typicalDurationMins: 960,
    detectedMinsAgo: 1,
    sentiment: "bullish",
    detectedAgo: "1 min ago",
    signalType: "momentum",
    timeHorizons: ["btst"],
  },
  {
    id: "sig-strong-close",
    symbol: "HCLTECH",
    companyName: "HCL Technologies Ltd.",
    ltp: 1580.0,
    changeAbs: 24.0,
    changePct: 1.54,
    indicator: "Strong Close Near Day High",
    scannerId: "strong-close-btst",
    attribute: { label: "Close vs high", value: "0.08% from high" },
    contextLine: "Closed at ₹1,580 — day high was ₹1,581.2",
    volumeContext: "Vol 1.2× avg",
    typicalDuration: "Next session open",
    typicalDurationMins: 960,
    detectedMinsAgo: 3,
    sentiment: "bullish",
    detectedAgo: "3 mins ago",
    signalType: "momentum",
    timeHorizons: ["btst"],
  },
  {
    id: "sig-emas-close",
    symbol: "SBIN",
    companyName: "State Bank of India",
    ltp: 810.0,
    changeAbs: 14.5,
    changePct: 1.82,
    indicator: "Above All Key EMAs at Close",
    scannerId: "above-emas-close",
    attribute: { label: "vs 200 EMA", value: "+3.2% above" },
    contextLine: "Closed above 5/9/20/50/200 EMA — all EMAs aligned bullish",
    volumeContext: "Vol 1.1× avg",
    typicalDuration: "~2–5 sessions",
    typicalDurationMins: 2400,
    detectedMinsAgo: 5,
    sentiment: "bullish",
    detectedAgo: "5 mins ago",
    signalType: "momentum",
    timeHorizons: ["btst", "swing"],
  },
  {
    id: "sig-fii",
    symbol: "NIFTY50",
    companyName: "Nifty 50 Index",
    ltp: 23850.0,
    changeAbs: 180.0,
    changePct: 0.76,
    indicator: "FII Heavy Buying",
    scannerId: "fii-heavy-buying",
    attribute: { label: "FII net buy", value: "₹4,200 Cr" },
    contextLine: "FIIs net bought ₹4,200 Cr in cash segment today",
    typicalDuration: "~1–3 sessions",
    typicalDurationMins: 1200,
    detectedMinsAgo: 15,
    sentiment: "bullish",
    detectedAgo: "15 mins ago",
    signalType: "momentum",
    timeHorizons: ["intraday", "swing"],
    extraTags: ["FII/DII"],
  },
  {
    id: "sig-sector-rot",
    symbol: "BANKNIFTY",
    companyName: "Bank Nifty Index",
    ltp: 51200.0,
    changeAbs: 620.0,
    changePct: 1.22,
    indicator: "Sector Rotation Leader",
    scannerId: "sector-rotation",
    attribute: { label: "Sector RS rank", value: "#1 today" },
    contextLine: "Banking sector leading — relative strength rank #1 across 12 sectors",
    typicalDuration: "~3–5 sessions",
    typicalDurationMins: 2400,
    detectedMinsAgo: 20,
    sentiment: "bullish",
    detectedAgo: "20 mins ago",
    signalType: "momentum",
    timeHorizons: ["intraday", "swing"],
    extraTags: ["Sector"],
  },

  /* ────── REVERSAL ────── */
  {
    id: "sig-rsi-oversold-intra",
    symbol: "HINDUNILVR",
    companyName: "Hindustan Unilever Ltd.",
    ltp: 2388.0,
    changeAbs: -42.0,
    changePct: -1.73,
    indicator: "Intraday RSI Oversold",
    scannerId: "intraday-rsi-oversold",
    attribute: { label: "RSI (15-min)", value: "22.4" },
    contextLine: "RSI dropped to 22.4 on 15-min chart — below 30 threshold",
    volumeContext: "Vol 1.9× avg",
    typicalDuration: "~30–90 mins",
    typicalDurationMins: 60,
    detectedMinsAgo: 3,
    sentiment: "bearish",
    detectedAgo: "3 mins ago",
    signalType: "reversal",
    timeHorizons: ["intraday"],
  },
  {
    id: "sig-rsi-overbought",
    symbol: "POWERGRID",
    companyName: "Power Grid Corp.",
    ltp: 312.0,
    changeAbs: 14.5,
    changePct: 4.87,
    indicator: "Intraday RSI Overbought",
    scannerId: "intraday-rsi-overbought",
    attribute: { label: "RSI (15-min)", value: "82.1" },
    contextLine: "RSI reached 82.1 on 15-min chart — above 80 threshold",
    volumeContext: "Vol 2.1× avg",
    typicalDuration: "~30–90 mins",
    typicalDurationMins: 60,
    detectedMinsAgo: 5,
    sentiment: "bullish",
    detectedAgo: "5 mins ago",
    signalType: "reversal",
    timeHorizons: ["intraday"],
  },
  {
    id: "sig-ma-bounce",
    symbol: "ASIANPAINT",
    companyName: "Asian Paints Ltd.",
    ltp: 2850.0,
    changeAbs: 35.0,
    changePct: 1.24,
    indicator: "Moving Average Bounce",
    scannerId: "moving-average-bounce",
    attribute: { label: "Bounced off", value: "50 EMA at ₹2,820" },
    contextLine: "Bounced off 50-day EMA at ₹2,820 — holding above support",
    volumeContext: "Vol 1.4× avg",
    typicalDuration: "~3–5 sessions",
    typicalDurationMins: 2400,
    detectedMinsAgo: 12,
    sentiment: "bullish",
    detectedAgo: "12 mins ago",
    signalType: "reversal",
    timeHorizons: ["swing"],
  },
  {
    id: "sig-rsi-daily",
    symbol: "ITC",
    companyName: "ITC Ltd.",
    ltp: 418.0,
    changeAbs: -3.2,
    changePct: -0.76,
    indicator: "RSI Oversold (Daily)",
    scannerId: "rsi-oversold",
    attribute: { label: "RSI (Daily)", value: "26.8" },
    contextLine: "Daily RSI at 26.8 — historically oversold zone for this stock",
    volumeContext: "Vol 1.1× avg",
    typicalDuration: "~5–10 sessions",
    typicalDurationMins: 4800,
    detectedMinsAgo: 30,
    sentiment: "bearish",
    detectedAgo: "30 mins ago",
    signalType: "reversal",
    timeHorizons: ["positional"],
  },
  {
    id: "sig-200dma",
    symbol: "TITAN",
    companyName: "Titan Company Ltd.",
    ltp: 3180.0,
    changeAbs: -15.0,
    changePct: -0.47,
    indicator: "200 DMA Support Zone",
    scannerId: "200-dma-support",
    attribute: { label: "vs 200 DMA", value: "0.2% above" },
    contextLine: "Trading at ₹3,180 — 200 DMA is at ₹3,173",
    typicalDuration: "~3–10 sessions",
    typicalDurationMins: 4800,
    detectedMinsAgo: 18,
    sentiment: "neutral",
    detectedAgo: "18 mins ago",
    signalType: "reversal",
    timeHorizons: ["positional"],
  },
  {
    id: "sig-boll",
    symbol: "NESTLEIND",
    companyName: "Nestle India Ltd.",
    ltp: 2280.0,
    changeAbs: -38.0,
    changePct: -1.64,
    indicator: "Below Lower Bollinger Band",
    scannerId: "below-bollinger",
    attribute: { label: "Lower band", value: "₹2,295 (20,2)" },
    contextLine: "Closed below lower Bollinger Band at ₹2,295 (20-period, 2 SD)",
    volumeContext: "Vol 1.6× avg",
    typicalDuration: "~3–7 sessions",
    typicalDurationMins: 3600,
    detectedMinsAgo: 10,
    sentiment: "bearish",
    detectedAgo: "10 mins ago",
    signalType: "reversal",
    timeHorizons: ["swing"],
  },
  {
    id: "sig-div",
    symbol: "DRREDDY",
    companyName: "Dr. Reddy’s Laboratories",
    ltp: 5920.0,
    changeAbs: 45.0,
    changePct: 0.77,
    indicator: "Bullish Divergence",
    scannerId: "bullish-divergence",
    attribute: { label: "Divergence on", value: "RSI (Daily)" },
    contextLine: "Price made lower low but RSI made higher low — classic bullish divergence",
    volumeContext: "Vol 1.2× avg",
    typicalDuration: "~5–15 sessions",
    typicalDurationMins: 7200,
    detectedMinsAgo: 25,
    sentiment: "bullish",
    detectedAgo: "25 mins ago",
    signalType: "reversal",
    timeHorizons: ["positional"],
  },
];

const LIVE_TIME_HORIZON_PILLS: { id: "all" | LiveTimeHorizon; label: string }[] = [
  { id: "all", label: "All" },
  { id: "intraday", label: "Intraday" },
  { id: "btst", label: "BTST" },
  { id: "swing", label: "Swing" },
  { id: "positional", label: "Positional" },
];

/** Footer headline — signal family first (Breakout / Momentum / Reversal). */
function liveSignalScanTitle(signalType: LiveSignalType): string {
  if (signalType === "breakouts") return "Breakout";
  if (signalType === "momentum") return "Momentum";
  return "Reversal";
}

/** Footer muted line — holding style / horizon label. */
function liveSignalHorizonLabel(horizons: LiveTimeHorizon[]): string {
  const h = new Set(horizons);
  if (h.has("longterm")) return "Long-Term";
  if (h.has("positional")) return "Positional";
  if (h.has("swing")) return "Swing";
  if (h.has("btst")) return "BTST";
  return "Intraday";
}

function formatVolumeMetric(volumeContext?: string): string | undefined {
  if (!volumeContext) return undefined;
  return volumeContext.replace(/^vol\s+/i, "").trim();
}

type MetricKey = "price" | "setup" | "volume";
type MetricManualConfig = {
  columns: MetricKey[];
  labels?: Partial<Record<MetricKey, string>>;
  /** Optional explicit cell values (overrides mock attribute / derived price line). */
  values?: Partial<Record<MetricKey, string>>;
};

const LIVE_SIGNAL_METRIC_CONFIG: Record<string, MetricManualConfig> = {
  "sig-orb": { columns: ["price", "setup", "volume"] },
  "sig-orbd": { columns: ["price", "setup", "volume"] },
  "sig-gap-up": {
    columns: ["setup", "volume"],
    labels: { setup: "Gap up", volume: "Volume" },
    values: { setup: "1.2%", volume: "1.4x avg" },
  },
  "sig-gap-down": {
    columns: ["setup", "volume"],
    labels: { setup: "Gap down", volume: "Volume" },
    values: { setup: "-1.97%", volume: "2.3x avg" },
  },
  "sig-consol": { columns: ["price", "setup", "volume"] },
  "sig-darvas": { columns: ["price", "setup"] },
  "sig-ath": { columns: ["setup", "volume"], labels: { setup: "ATH" } },
  "sig-pvb": {
    columns: ["setup", "volume"],
    labels: { setup: "Price Breakout", volume: "Volume" },
    values: { setup: "20-day high", volume: "4.1x avg" },
  },
  "sig-nr7": { columns: ["setup", "volume"], labels: { setup: "NR7 range", volume: "Volume" } },
  "sig-crb": { columns: ["price", "setup", "volume"] },
  "sig-vol-shock": { columns: ["setup", "volume"], labels: { setup: "Volume setup" } },
  "sig-vwap-bull": { columns: ["setup", "volume"], labels: { setup: "Price vs VWAP", volume: "Volume" } },
  "sig-vwap-bear": { columns: ["setup", "volume"], labels: { setup: "Price vs VWAP", volume: "Volume" } },
  "sig-vol-shk": { columns: ["setup", "volume"], labels: { setup: "Volume spike" } },
  "sig-above-emas": { columns: ["price", "setup"] },
  "sig-open-low": { columns: ["price", "setup"] },
  "sig-open-high": { columns: ["price", "setup"] },
  "sig-325pm": { columns: ["price", "setup", "volume"] },
  "sig-strong-close": { columns: ["price", "setup"] },
  "sig-emas-close": { columns: ["price", "setup"] },
  "sig-fii": { columns: ["price", "setup"] },
  "sig-sector-rot": { columns: ["price", "setup"] },
  "sig-rsi-oversold-intra": { columns: ["price", "setup", "volume"] },
  "sig-rsi-overbought": { columns: ["price", "setup", "volume"] },
  "sig-ma-bounce": { columns: ["price", "setup"] },
  "sig-rsi-daily": { columns: ["price", "setup"] },
  "sig-200dma": { columns: ["price", "setup"] },
  "sig-boll": { columns: ["price", "setup"] },
  "sig-div": { columns: ["price", "setup"] },
};

function formatSetupMetric(label: string, value: string): { label: string; value: string } {
  let nextLabel = label;
  let nextValue = value.trim();

  // ORB range: "0.8% of spot" -> "0.8%"
  if (/orb range/i.test(nextLabel)) {
    nextValue = nextValue.replace(/\s+of\s+spot$/i, "");
  }

  // Gap size already implies previous close; keep it crisp.
  if (/gap size/i.test(nextLabel)) {
    nextValue = nextValue.replace(/\s+vs\s+prev\s+close$/i, "");
  }

  // Compact overly verbose suffixes that repeat context.
  nextValue = nextValue
    .replace(/\s+the\s+20-day\s+average$/i, " 20D avg")
    .replace(/\s+yesterday'?s\s+full-day\s+avg\s+volume$/i, " prev-day avg");

  return { label: nextLabel, value: nextValue };
}

function compactTriggerMetric(contextLine: string): string {
  const c = contextLine.trim();

  const brokeAboveBracket = c.match(/^Broke above .*?\(([^)]+)\)/i);
  if (brokeAboveBracket?.[1]) return `Above ${brokeAboveBracket[1]}`;

  const brokeBelowBracket = c.match(/^Broke below .*?\(([^)]+)\)/i);
  if (brokeBelowBracket?.[1]) return `Below ${brokeBelowBracket[1]}`;

  if (/crossed above session vwap/i.test(c)) return "Above VWAP";
  if (/rejected at session vwap/i.test(c)) return "VWAP rejection";

  const rsiDrop = c.match(/^RSI dropped to ([\d.]+)/i);
  if (rsiDrop?.[1]) return `RSI ${rsiDrop[1]} (oversold)`;

  const rsiRise = c.match(/^RSI reached ([\d.]+)/i);
  if (rsiRise?.[1]) return `RSI ${rsiRise[1]} (overbought)`;

  if (/opened at .*?vs prev close/i.test(c)) return "Open vs prev close";
  if (/closed at .*near top/i.test(c)) return "Near day high close";
  if (/closed below lower bollinger/i.test(c)) return "Below lower band";
  if (/price made lower low/i.test(c)) return "Bullish divergence";
  if (/bounced off .*?EMA/i.test(c)) return "EMA support bounce";
  if (/FIIs net bought/i.test(c)) return "FII net buying";
  if (/sector leading/i.test(c)) return "Sector leadership";

  return c;
}

/** Footer icon — matches scan title priority (intraday / BTST / swing / positional). */
function liveSignalFooterScanIcon(horizons: LiveTimeHorizon[]): LucideIcon {
  const h = new Set(horizons);
  if (h.has("positional")) return BriefcaseBusiness;
  if (h.has("btst")) return Sunset;
  if (h.has("swing")) return CalendarClock;
  return Zap;
}

function LiveSignalCard({ signal }: { signal: LiveMarketSignal }) {
  const scannerHref = `/scanners/${signal.scannerId}`;
  const up = signal.changePct >= 0;
  const changeColor = up ? "text-[#008858]" : "text-[#D53627]";
  const SentimentIcon = signal.sentiment === "bullish" ? TrendingUp : signal.sentiment === "bearish" ? TrendingDown : Minus;
  const sentimentLabel = signal.sentiment === "bullish" ? "Bullish" : signal.sentiment === "bearish" ? "Bearish" : "Neutral";

  const sentimentOiTagClass =
    signal.sentiment === "bullish"
      ? "text-[#008858] bg-[linear-gradient(90deg,#DEF5ED_24%,rgba(114,216,181,0)_100%)]"
      : signal.sentiment === "bearish"
        ? "text-[#B91C1C] bg-[linear-gradient(90deg,#FCE7E7_24%,rgba(239,68,68,0)_100%)]"
        : "text-[#64748B] bg-[linear-gradient(90deg,#E9E9EF_24%,rgba(100,116,139,0)_100%)]";

  const FooterScanIcon = liveSignalFooterScanIcon(signal.timeHorizons);
  const formattedAttribute = signal.attribute
    ? formatSetupMetric(signal.attribute.label, signal.attribute.value)
    : null;
  const priceMetric = signal.triggerContext ?? compactTriggerMetric(signal.contextLine);
  const volumeMetric = formatVolumeMetric(signal.volumeContext);
  const manualMetric = LIVE_SIGNAL_METRIC_CONFIG[signal.id] ?? { columns: ["price", "setup", "volume"] as MetricKey[] };
  const metricDataByKey: Record<MetricKey, { label: string; value: string } | null> = {
    price: { label: manualMetric.labels?.price ?? "Price", value: manualMetric.values?.price ?? priceMetric },
    setup:
      manualMetric.values?.setup != null
        ? { label: manualMetric.labels?.setup ?? "Setup", value: manualMetric.values.setup }
        : formattedAttribute
          ? { label: manualMetric.labels?.setup ?? formattedAttribute.label, value: formattedAttribute.value }
          : null,
    volume:
      manualMetric.values?.volume != null
        ? { label: manualMetric.labels?.volume ?? "Volume", value: manualMetric.values.volume }
        : volumeMetric
          ? { label: manualMetric.labels?.volume ?? "Volume", value: volumeMetric }
          : null,
  };
  const metrics = manualMetric.columns
    .map((key) => metricDataByKey[key])
    .filter((metric): metric is { label: string; value: string } => Boolean(metric));

  return (
    <div className="w-[360px] shrink-0 rounded-xl border border-[#F2F0E5] bg-white overflow-hidden flex flex-col snap-start" style={{ boxShadow: "0px 2px 0px #F2F0E5" }}>
      {/* HEADER: Stock + Price */}
      <div className="px-3.5 pt-3 pb-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold text-[#1A1A1A] tracking-tight leading-5">{signal.symbol}</p>
            <p className="text-[11px] text-[#777777] mt-0.5 truncate">{signal.companyName}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[15px] font-semibold tabular-nums text-[#1A1A1A] leading-5">{formatInr(signal.ltp)}</p>
            <p className={cn("text-[12px] font-semibold tabular-nums mt-0.5 leading-4", changeColor)}>
              {up ? "+" : ""}{signal.changePct.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>

      {/* BODY: Signal + Context — market-view (purple panel + OI-style sentiment tag) */}
      <div className="px-3.5 py-2.5 space-y-3 flex-1">
        <div className="rounded-[4px] bg-[#FBF8FD] py-2 pl-2 pr-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 flex-1 items-start gap-1.5">
              <Radio
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#542087]"
                aria-hidden
              />
              <p className="min-w-0 truncate text-[12px] font-semibold leading-4 text-[#262626]">{signal.indicator}</p>
            </div>
            <span
              className={cn(
                "inline-flex shrink-0 items-center gap-0.5 rounded-[4px] py-0 pl-1.5 pr-1 text-[12px] font-semibold leading-4",
                sentimentOiTagClass
              )}
            >
              {sentimentLabel}
              <SentimentIcon className="h-3.5 w-3.5" aria-hidden />
            </span>
          </div>
        </div>

        {/* Dynamic metrics row: show only relevant columns (2 or 3). */}
        <div className={cn("grid items-start gap-2", metrics.length === 2 ? "grid-cols-2" : "grid-cols-3")}>
          {metrics.map((metric, idx) => {
            const textAlignClass =
              metrics.length === 3
                ? idx === 0
                  ? "text-left"
                  : idx === 1
                    ? "text-center"
                    : "text-right"
                : idx === 0
                  ? "text-left"
                  : "text-right";
            return (
              <div key={`${metric.label}-${idx}`} className={cn("min-w-0", textAlignClass)}>
                <p className="text-[13px] leading-4 text-[#777] truncate">{metric.label}</p>
                <p className="mt-1 text-[14px] leading-5 font-medium text-[#262626] line-clamp-2 break-words">
                  {metric.value}
                </p>
              </div>
            );
          })}
        </div>

      </div>

      {/* Footer — signal family + horizon (brand purple; contextual scan icon) */}
      <div className="border-t border-[#F1F1F1] mt-auto">
        <div className="px-3.5 py-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-1.5 max-w-[calc(100%-6.75rem)]">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded">
                <FooterScanIcon className="h-3.5 w-3.5 text-[#542087]" aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold leading-4 text-[#262626] truncate">
                  {liveSignalScanTitle(signal.signalType)}
                </p>
                <p className="text-[11px] leading-4 text-[#777777] truncate">{liveSignalHorizonLabel(signal.timeHorizons)}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <Button
                asChild
                variant="outline"
                size="icon"
                className="h-7 w-7 rounded-md border-[#E1E1E1] bg-white p-0 text-[#262626] hover:bg-muted/50"
              >
                <Link to={scannerHref} aria-label="Set alert on this signal">
                  <Bell className="h-3.5 w-3.5" />
                </Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="h-7 min-w-[72px] gap-1 rounded-md border-0 bg-[#542087] px-2 text-[12px] font-semibold text-white shadow-sm hover:bg-[#431a6b]"
              >
                <Link to={scannerHref} className="inline-flex items-center gap-1">
                  <LineChart className="h-3.5 w-3.5 shrink-0" />
                  View chart
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


const OPPORTUNITY_TRACKS = [
  {
    key: "intraday",
    label: "Intraday",
    desc: "Same-day momentum setups.",
    scans: "5 Scans",
    icon: CandlestickChart,
  },
  {
    key: "swing",
    label: "Swing",
    desc: "Multi-day breakouts.",
    scans: "8 Scans",
    icon: CalendarClock,
  },
  {
    key: "positional",
    label: "Positional",
    desc: "Weeks-based trend holds.",
    scans: "6 Scans",
    icon: BriefcaseBusiness,
  },
  {
    key: "long-term",
    label: "Long Term Investing",
    desc: "Long-horizon compounding picks.",
    scans: "10 Scans",
    icon: Landmark,
  },
] as const;

/** Fallback brand colors per symbol. */
const STOCK_COLORS: Record<string, string> = {
  RELIANCE: "#3B82F6", HDFCBANK: "#1E40AF", INFY: "#0EA5E9", WIPRO: "#6366F1",
  ICICIBANK: "#F97316", TATAMOTORS: "#1D4ED8", SUNPHARMA: "#F59E0B", BAJFINANCE: "#10B981",
  ASIANPAINT: "#EF4444", TITAN: "#8B5CF6", HCLTECH: "#14B8A6", MARUTI: "#E11D48",
  TCS: "#2563EB", SBIN: "#4338CA", ITC: "#059669", LT: "#DC2626",
  KOTAKBANK: "#D97706", BHARTIARTL: "#7C3AED", ADANIENT: "#0D9488", HINDUNILVR: "#2DD4BF",
};

function StockLogoAvatar({ symbol, size = 22 }: { symbol: string; size?: number }) {
  const fallbackColor = STOCK_COLORS[symbol] ?? "#6B7280";
  const initials = symbol.slice(0, 2);
  const logoUrl = `/stock-logos/${symbol}.png`;

  return (
    <div
      className="shrink-0 rounded-[5px] overflow-hidden border border-border/40 bg-white"
      style={{ width: size, height: size }}
      title={symbol}
    >
      <img
        src={logoUrl}
        alt={symbol}
        width={size}
        height={size}
        className="h-full w-full object-contain p-[1px]"
        loading="lazy"
        onError={(e) => {
          const el = e.currentTarget;
          el.style.display = "none";
          const parent = el.parentElement;
          if (parent) {
            parent.style.backgroundColor = fallbackColor;
            parent.style.display = "flex";
            parent.style.alignItems = "center";
            parent.style.justifyContent = "center";
            parent.style.color = "white";
            parent.style.fontSize = `${size * 0.4}px`;
            parent.style.fontWeight = "600";
            parent.textContent = initials;
          }
        }}
      />
    </div>
  );
}

function StockLogoRow({ symbols, total }: { symbols: string[]; total: number }) {
  const shown = symbols.slice(0, 4);
  const extra = total - shown.length;
  return (
    <div className="flex items-center gap-0.5">
      {shown.map((s) => (
        <StockLogoAvatar key={s} symbol={s} size={20} />
      ))}
      {extra > 0 && (
        <span className="ml-0.5 text-[10px] font-medium text-muted-foreground leading-none whitespace-nowrap">
          +{extra}
        </span>
      )}
    </div>
  );
}

/** Mock top symbols per scanner — in production comes from API. */
const SCANNER_TOP_SYMBOLS: Record<string, { symbols: string[]; total: number }> = {
  "Opening Range Breakout (15-min)":  { symbols: ["RELIANCE", "TATAMOTORS", "HDFCBANK", "INFY"], total: 23 },
  "Pivot Point Breakout (R1/S1)":     { symbols: ["ICICIBANK", "BAJFINANCE", "TCS", "SBIN"], total: 18 },
  "Closing Range Breakout":           { symbols: ["HCLTECH", "TITAN", "WIPRO", "LT"], total: 31 },
  "NR7 Breakout":                     { symbols: ["SUNPHARMA", "MARUTI", "ITC", "KOTAKBANK"], total: 12 },
  "Consolidation Breakout (BB Squeeze)": { symbols: ["BHARTIARTL", "ADANIENT", "HINDUNILVR", "ASIANPAINT"], total: 28 },
  "RSI Oversold (Daily < 30)":        { symbols: ["ASIANPAINT", "WIPRO", "SUNPHARMA", "ITC"], total: 9 },
  "Intraday RSI Oversold (<30)":      { symbols: ["TATAMOTORS", "MARUTI", "HCLTECH", "SBIN"], total: 14 },
  "Bullish Divergence (RSI)":         { symbols: ["RELIANCE", "TITAN", "BAJFINANCE", "INFY"], total: 8 },
  "Moving Average Bounce (50 EMA)":   { symbols: ["HDFCBANK", "ICICIBANK", "TCS", "LT"], total: 19 },
  "RSI Reversal Hunter":              { symbols: ["KOTAKBANK", "BHARTIARTL", "ADANIENT", "HINDUNILVR"], total: 11 },
  "Volume Shockers (Live)":           { symbols: ["TATAMOTORS", "RELIANCE", "SBIN", "HDFCBANK"], total: 34 },
  "First 15-min Volume Shocker":      { symbols: ["INFY", "WIPRO", "HCLTECH", "TCS"], total: 21 },
  "Volume Shockers Alert":            { symbols: ["BAJFINANCE", "ICICIBANK", "SUNPHARMA", "TITAN"], total: 16 },
  "VWAP Cross Bullish (5-min)":       { symbols: ["LT", "MARUTI", "KOTAKBANK", "ITC"], total: 24 },
  "Price-Volume Breakout":            { symbols: ["BHARTIARTL", "ADANIENT", "RELIANCE", "HDFCBANK"], total: 19 },
  "BTST Closing Bell Scanner":        { symbols: ["RELIANCE", "HDFCBANK", "TITAN", "ITC"], total: 18 },
  "Strong Close Near Day High":       { symbols: ["ICICIBANK", "BAJFINANCE", "TCS", "SBIN"], total: 22 },
  "52-Week High Breakout":            { symbols: ["TATAMOTORS", "MARUTI", "BHARTIARTL", "INFY"], total: 15 },
  "Gap Up Opening (>1%)":             { symbols: ["RELIANCE", "TATAMOTORS", "HDFCBANK", "INFY"], total: 23 },
  "Gap Down Opening (<-1%)":          { symbols: ["ASIANPAINT", "WIPRO", "SUNPHARMA", "ITC"], total: 11 },
  "Open = High (Bearish)":            { symbols: ["SBIN", "HCLTECH", "KOTAKBANK", "TITAN"], total: 17 },
  "Open = Low (Bullish)":             { symbols: ["LT", "MARUTI", "BAJFINANCE", "ADANIENT"], total: 20 },
};

const TECHNICAL_SCREEN_SECTIONS: Array<{
  title: string;
  Icon: LucideIcon;
  scannerNames: string[];
}> = [
  {
    title: "Breakout Scans",
    Icon: CandlestickChart,
    scannerNames: [
      "Opening Range Breakout (15-min)",
      "Pivot Point Breakout (R1/S1)",
      "Closing Range Breakout",
      "NR7 Breakout",
      "Consolidation Breakout (BB Squeeze)",
    ],
  },
  {
    title: "Mean Reversion Scans",
    Icon: LineChart,
    scannerNames: [
      "RSI Oversold (Daily < 30)",
      "Intraday RSI Oversold (<30)",
      "Bullish Divergence (RSI)",
      "Moving Average Bounce (50 EMA)",
      "RSI Reversal Hunter",
    ],
  },
  {
    title: "Momentum & Volume Shockers",
    Icon: Flame,
    scannerNames: [
      "Volume Shockers (Live)",
      "First 15-min Volume Shocker",
      "Volume Shockers Alert",
      "VWAP Cross Bullish (5-min)",
      "Price-Volume Breakout",
    ],
  },
  {
    title: "BTST Scans",
    Icon: Sunset,
    scannerNames: [
      "BTST Closing Bell Scanner",
      "Strong Close Near Day High",
      "Closing Range Breakout",
      "NR7 Breakout",
      "52-Week High Breakout",
    ],
  },
  {
    title: "Intraday Scans",
    Icon: CalendarClock,
    scannerNames: [
      "Gap Up Opening (>1%)",
      "Gap Down Opening (<-1%)",
      "First 15-min Volume Shocker",
      "Open = High (Bearish)",
      "Open = Low (Bullish)",
    ],
  },
];

const FUNDAMENTAL_SCREEN_SECTIONS: Array<{
  title: string;
  Icon: LucideIcon;
  scans: Array<{ label: string; matchName: string }>;
}> = [
  {
    title: "Thematic",
    Icon: BriefcaseBusiness,
    scans: [
      { label: "FII Heavy Buying", matchName: "FII/DII Buying Surge" },
      { label: "Profitable Small Caps", matchName: "Undervalued + Strong Fundamentals" },
      { label: "Green Energy / EV Plays", matchName: "Sector Leader Rotation" },
      { label: "Defence & Railways", matchName: "Sector Leader Rotation" },
    ],
  },
  {
    title: "Value screens",
    Icon: Landmark,
    scans: [
      { label: "Low PE + High Growth", matchName: "Undervalued + Strong Fundamentals" },
      { label: "Value + Growth Compounder", matchName: "Value + Growth Compounder" },
      { label: "High ROE Value Picks", matchName: "Piotroski Score > 7" },
      { label: "Cash-Rich Value Leaders", matchName: "Dividend Aristocrats" },
    ],
  },
  {
    title: "Quality & Compounding Screens",
    Icon: Target,
    scans: [
      { label: "Coffee Can Portfolio", matchName: "Value + Growth Compounder" },
      { label: "Piotroski Score = 9", matchName: "Piotroski Score > 7" },
      { label: "Consistent Compounders", matchName: "Dividend Aristocrats" },
      { label: "Bluest of BlueChips", matchName: "52-Week High Breakout" },
      { label: "Magic formula", matchName: "Undervalued + Strong Fundamentals" },
    ],
  },
];

export function AppScannersHubPage() {
  const [liveTimeHorizon, setLiveTimeHorizon] = useState<"all" | LiveTimeHorizon>("all");

  const filtered = useMemo(() => PRE_BUILT_SCANNERS, []);

  const technicalScreenSections = useMemo(() => {
    const scannerByName = new Map(filtered.map((s) => [s.name, s] as const));
    return TECHNICAL_SCREEN_SECTIONS.map((section) => ({
      ...section,
      scanners: section.scannerNames
        .map((name) => scannerByName.get(name))
        .filter((s): s is (typeof filtered)[number] => Boolean(s))
        .slice(0, 5),
    })).filter((section) => section.scanners.length > 0);
  }, [filtered]);

  const fundamentalScreenSections = useMemo(() => {
    const scannerByName = new Map(filtered.map((s) => [s.name, s] as const));
    return FUNDAMENTAL_SCREEN_SECTIONS.map((section) => ({
      ...section,
      scans: section.scans
        .map((item) => ({ ...item, scanner: scannerByName.get(item.matchName) }))
        .filter((item): item is typeof item & { scanner: (typeof filtered)[number] } => Boolean(item.scanner)),
    }));
  }, [filtered]);

  const liveSignalsFiltered = useMemo(() => {
    return LIVE_MARKET_SIGNALS.filter((s) => {
      if (liveTimeHorizon !== "all" && !s.timeHorizons.includes(liveTimeHorizon)) return false;
      return true;
    });
  }, [liveTimeHorizon]);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-b from-primary/[0.03] to-background pb-24 md:pb-12">
      {/* App canvas: mobile-first width */}
      <div className="max-w-lg mx-auto px-4 pt-4 sm:pt-6">
        {/* Header */}
        <header className="mb-5">
          <div className="flex items-start justify-between gap-3 mb-1">
            <div>
              <h1 className="text-[28px] sm:text-[32px] font-bold text-foreground tracking-tight leading-[1.12]">
                <span className="block">Find your next trade</span>
                <span className="block text-[#542087]">in seconds.</span>
              </h1>
              <p className="text-[13px] sm:text-[14px] text-muted-foreground mt-3 leading-snug line-clamp-2">
                80+ ready scans. Build your own with 300+ indicators.
              </p>
            </div>
          </div>
        </header>

        {/* Live market signals — vertical stack, dense card (mobile app) */}
        <div className="mb-6 -mx-4 bg-white relative">
          <section className="px-4 pt-5 pb-4" aria-label="Live market signals">
            <div className="flex items-center gap-2 min-w-0 mb-3">
              <span className="relative flex h-3 w-3 shrink-0 items-center justify-center" aria-hidden>
                <span className="animate-[ping_0.65s_cubic-bezier(0,0,0.2,1)_infinite] absolute inline-flex h-3 w-3 rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600 shadow-[0_0_0_2px_rgba(220,38,38,0.35)]" />
              </span>
              <h2 className="text-xl leading-7 font-bold text-foreground truncate">Live market signals</h2>
            </div>


            <div className="mb-3">
              <div
                className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none"
                role="tablist"
                aria-label="Time horizon filters"
              >
                {LIVE_TIME_HORIZON_PILLS.map((pill) => {
                  const active = liveTimeHorizon === pill.id;
                  return (
                    <button
                      key={pill.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setLiveTimeHorizon(pill.id)}
                      className={cn(
                        "shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-semibold leading-none transition-colors whitespace-nowrap",
                        active
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-border bg-white text-foreground hover:border-primary/35"
                      )}
                    >
                      {pill.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {liveSignalsFiltered.length === 0 ? (
              <p className="text-[11px] text-[#777777] leading-relaxed py-2">
                No signals match these filters. Try a different signal type or time horizon.
              </p>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-2 -mr-4 pr-0 snap-x snap-mandatory scrollbar-none">
                {liveSignalsFiltered.map((signal) => (
                  <LiveSignalCard key={signal.id} signal={signal} />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Quick Scanner — mini screener */}
        <QuickScannerSection />

        <section className="mb-6" aria-label="Fundamental screens">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl leading-7 font-bold text-foreground">Fundamental Screens</h2>
            <Link to="/scanners" className="text-xs font-medium text-primary">
              View all
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mr-4 pr-4 snap-x snap-mandatory scrollbar-none">
            {fundamentalScreenSections.map((section) => (
              <div
                key={section.title}
                className="w-[90%] min-w-[320px] max-w-[360px] shrink-0 snap-start rounded-2xl border border-border/60 bg-white overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <section.Icon className="w-5 h-5 text-primary shrink-0" />
                    <h3 className="text-[15px] leading-5 font-semibold text-foreground truncate">{section.title}</h3>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/60 shrink-0" />
                </div>
                <div>
                  {section.scans.map((item, idx) => (
                    <Link
                      key={`${section.title}-${item.label}`}
                      to={`/scanners/${item.scanner.id}`}
                      className={cn(
                        "flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/30 transition-colors",
                        idx !== section.scans.length - 1 && "border-b border-border/50"
                      )}
                    >
                      <span className="text-[14px] leading-5 font-medium text-foreground">{item.label}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/70 shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-6" aria-label="Technical screens">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl leading-7 font-bold text-foreground">Technical Screens</h2>
            <Link to="/scanners" className="text-xs font-medium text-primary">
              View all
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mr-4 pr-4 snap-x snap-mandatory scrollbar-none">
            {technicalScreenSections.map((section) => (
                <div
                  key={section.title}
                  className="w-[90%] min-w-[320px] max-w-[360px] shrink-0 snap-start rounded-2xl border border-border/60 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden"
                >
                  {/* Section header */}
                  <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/50">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <section.Icon className="w-5 h-5 text-primary shrink-0" />
                      <h3 className="text-[15px] leading-5 font-semibold text-foreground truncate">
                        {section.title}
                      </h3>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/60 shrink-0" />
                  </div>

                  {/* Scanner rows */}
                  <div>
                    {section.scanners.map((scanner, rowIdx) => {
                      const isLast = rowIdx === section.scanners.length - 1;
                      const stockData = SCANNER_TOP_SYMBOLS[scanner.name];
                      return (
                        <Link
                          key={scanner.id}
                          to={`/scanners/${scanner.id}`}
                          className={cn(
                            "block px-4 py-4 hover:bg-muted/30 transition-colors",
                            !isLast && "border-b border-border/50"
                          )}
                        >
                          <div className="flex items-start gap-2">
                            <div className="min-w-0 flex-1">
                              <h4 className="text-[14px] leading-5 font-semibold text-foreground truncate pr-1">
                                {scanner.name}
                              </h4>

                              {/* Stock logos + last updated */}
                              <div className="flex items-center justify-between mt-2.5">
                                {stockData ? (
                                  <StockLogoRow symbols={stockData.symbols} total={stockData.total} />
                                ) : (
                                  <span />
                                )}
                                <span className="flex items-center gap-1 text-[10px] text-muted-foreground/70 shrink-0">
                                  <Clock className="h-2.5 w-2.5" />
                                  {scanner.lastUpdated}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
            ))}
          </div>
        </section>

        {/* DIY CTA */}
        <Card className="border-primary/20 bg-primary/5 mb-6">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">Build your own</p>
              <p className="text-xs text-muted-foreground">Indicators, patterns &amp; formulas — DIY screener.</p>
            </div>
            <Button asChild size="sm" className="shrink-0">
              <Link to="/diy">Open</Link>
            </Button>
          </CardContent>
        </Card>

        <section className="mb-6" aria-label="Discover opportunities">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl leading-7 font-bold text-foreground">Discover by trading style</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {OPPORTUNITY_TRACKS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.key}
                  className="relative rounded-xl border border-border/80 bg-white p-3 shadow-[0_1px_4px_rgba(0,0,0,0.05)]"
                >
                  <span className="absolute top-3 right-3 inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary">
                    {item.scans}
                  </span>
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-[15px] leading-5 font-semibold text-foreground">{item.label}</p>
                  <p className="text-[11px] leading-4 text-muted-foreground mt-1 line-clamp-1">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="font-medium text-foreground">No scanners match</p>
            <p className="text-sm mt-1">Try again in a moment</p>
          </div>
        )}

      </div>
    </div>
  );
}
