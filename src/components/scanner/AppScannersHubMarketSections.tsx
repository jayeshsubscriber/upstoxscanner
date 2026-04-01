import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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
    <div
      className="shrink-0 snap-start rounded-xl border border-[#F2F0E5] bg-white overflow-hidden flex flex-col w-[min(360px,calc(100vw-2.5rem))] sm:w-[max(220px,min(380px,calc((min(100vw,1536px)-5.5rem)/4)))]"
      style={{ boxShadow: "0px 2px 0px #F2F0E5" }}
      role="listitem"
    >
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
        <div className="rounded-[4px] bg-muted/40 py-2 pl-2 pr-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 flex-1 items-start gap-1.5">
              <Radio
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-foreground"
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
                <FooterScanIcon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
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

type CandlestickFamily =
  | "bullish_candles"
  | "bullish_reversal"
  | "bullish_continuation"
  | "bearish_candles"
  | "bearish_reversal"
  | "bearish_continuation";

type CandlestickTimeframe = "1m" | "5m" | "15m" | "30m" | "1d";

interface CandlestickDetectionRow {
  symbol: string;
  ltp: number;
  changeAbs: number;
  changePct: number;
  detectedPattern: string;
  family: CandlestickFamily;
  timeframe: CandlestickTimeframe;
  indexUniverse: string;
}

const CANDLESTICK_INDEX_OPTIONS = [
  "Nifty 50",
  "Nifty Next 50",
  "Nifty 100",
  "Nifty 200",
  "Nifty 500",
] as const;

const CANDLESTICK_TIMEFRAME_OPTIONS: Array<{ value: CandlestickTimeframe; label: string }> = [
  { value: "1m", label: "1 min" },
  { value: "5m", label: "5 min" },
  { value: "15m", label: "15 min" },
  { value: "30m", label: "30 min" },
  { value: "1d", label: "1 Day" },
];

const CANDLESTICK_FAMILY_OPTIONS: Array<{ value: CandlestickFamily; label: string }> = [
  { value: "bullish_candles", label: "Bullish" },
  { value: "bullish_continuation", label: "Bullish Continuation" },
  { value: "bullish_reversal", label: "Bullish Reversal" },
  { value: "bearish_candles", label: "Bearish" },
  { value: "bearish_continuation", label: "Bearish Continuation" },
  { value: "bearish_reversal", label: "Bearish Reversal" },
];

const CANDLE_PATTERN_BUCKETS: Record<CandlestickFamily, string[]> = {
  bullish_candles: ["White Marubozu"],
  bullish_continuation: ["Neckline", "Upside Tasuki Gap"],
  bullish_reversal: [
    "Hammer",
    "Bullish Engulfing",
    "Dragonfly Doji",
    "Inverted Hammer",
    "Piercing Line",
    "Morning Star",
    "Bullish Harami",
    "Bullish Harami Cross",
    "Three White Soldiers",
  ],
  bearish_candles: ["Black Marubozu"],
  bearish_continuation: ["Downside Tasuki Gap"],
  bearish_reversal: [
    "Hanging Man",
    "Shooting Star",
    "Identical Three Crows",
    "Gravestone Doji",
    "Darkcloud Cover",
    "Bearish Harami",
    "Bearish Harami Cross",
    "Bearish Engulfing",
    "Abandoned Baby Top",
  ],
};

const CANDLE_SYMBOL_POOL = [
  "RELIANCE", "HDFCBANK", "TCS", "INFY", "ICICIBANK", "LT", "SBIN", "AXISBANK",
  "TATAMOTORS", "MARUTI", "SUNPHARMA", "BHARTIARTL", "WIPRO", "ADANIENT", "KOTAKBANK",
  "BAJFINANCE", "HCLTECH", "ITC", "ASIANPAINT", "NESTLEIND", "DRREDDY", "POWERGRID",
] as const;

const CANDLESTICK_DETECTIONS: CandlestickDetectionRow[] = (() => {
  const rows: CandlestickDetectionRow[] = [];
  const families = CANDLESTICK_FAMILY_OPTIONS.map((f) => f.value);
  const timeframes = CANDLESTICK_TIMEFRAME_OPTIONS.map((t) => t.value);
  let idx = 0;

  for (const family of families) {
    const patterns = CANDLE_PATTERN_BUCKETS[family];
    for (const indexUniverse of CANDLESTICK_INDEX_OPTIONS) {
      for (const timeframe of timeframes) {
        const countForBucket = 3; // keep 2-5 rows per filtered bucket
        for (let i = 0; i < countForBucket; i += 1) {
          const pattern = patterns[(idx + i) % patterns.length];
          const symbol = CANDLE_SYMBOL_POOL[(idx + i) % CANDLE_SYMBOL_POOL.length];
          const bull = family.startsWith("bullish");
          const base = 120 + ((idx + i) % 17) * 53;
          const changeAbs = Number((2 + ((idx + i) % 9) * 1.7).toFixed(2));
          const signedAbs = bull ? changeAbs : -changeAbs;
          const pct = Number(((Math.abs(signedAbs) / base) * 100).toFixed(2));
          rows.push({
            symbol,
            ltp: Number((base + signedAbs).toFixed(2)),
            changeAbs: signedAbs,
            changePct: bull ? pct : -pct,
            detectedPattern: pattern,
            family,
            timeframe,
            indexUniverse,
          });
        }
        idx += countForBucket;
      }
    }
  }
  return rows;
})();

function candlestickPatternImage(family: CandlestickFamily): string {
  const isBull = family.startsWith("bullish");
  const up = isBull ? "#16A34A" : "#DC2626";
  const down = isBull ? "#DC2626" : "#16A34A";
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='64' viewBox='0 0 120 64'>
  <line x1='12' y1='18' x2='12' y2='50' stroke='${up}' stroke-width='2'/>
  <rect x='8' y='24' width='8' height='18' rx='1.5' fill='${up}'/>
  <line x1='32' y1='10' x2='32' y2='54' stroke='${down}' stroke-width='2'/>
  <rect x='28' y='16' width='8' height='22' rx='1.5' fill='${down}'/>
  <line x1='52' y1='14' x2='52' y2='56' stroke='${up}' stroke-width='2'/>
  <rect x='48' y='28' width='8' height='16' rx='1.5' fill='${up}'/>
  <line x1='72' y1='8' x2='72' y2='46' stroke='${down}' stroke-width='2'/>
  <rect x='68' y='20' width='8' height='18' rx='1.5' fill='${down}'/>
  <line x1='92' y1='12' x2='92' y2='52' stroke='${up}' stroke-width='2'/>
  <rect x='88' y='22' width='8' height='20' rx='1.5' fill='${up}'/>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function candlestickOutlook(row: CandlestickDetectionRow): string {
  if (row.family === "bullish_reversal") {
    return "Upside reversal possible if follow-through buying continues.";
  }
  if (row.family === "bullish_continuation") {
    return "Trend continuation likely if price holds above breakout zone.";
  }
  if (row.family === "bullish_candles") {
    return "Buyers are in control; momentum can stay positive near-term.";
  }
  if (row.family === "bearish_reversal") {
    return "Downside reversal risk if selling pressure sustains.";
  }
  if (row.family === "bearish_continuation") {
    return "Downtrend continuation likely if support levels break.";
  }
  return "Sellers are dominant; weakness can extend in the near term.";
}

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
  const shown = symbols.slice(0, 3);
  const extra = total - shown.length;
  return (
    <div className="flex items-center gap-0.5">
      {shown.map((s) => (
        <StockLogoAvatar key={s} symbol={s} size={20} />
      ))}
      {extra > 0 && (
        <span className="ml-0.5 text-[10px] font-medium text-muted-foreground leading-none whitespace-nowrap">
          + {extra} stocks
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
  "Golden Crossover":                 { symbols: ["SBIN", "ICICIBANK", "LT", "TCS"], total: 17 },
  "Death Cross Alert":                { symbols: ["WIPRO", "ASIANPAINT", "KOTAKBANK", "SUNPHARMA"], total: 13 },
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
  "Stocks Near All-Time High":        { symbols: ["ZOMATO", "TRENT", "ADANIENT", "RELIANCE"], total: 14 },
  "Darvas Box Breakout":              { symbols: ["TRENT", "TITAN", "BHARTIARTL", "LT"], total: 11 },
  "Gap Up Opening (>1%)":             { symbols: ["RELIANCE", "TATAMOTORS", "HDFCBANK", "INFY"], total: 23 },
  "Gap Down Opening (<-1%)":          { symbols: ["ASIANPAINT", "WIPRO", "SUNPHARMA", "ITC"], total: 11 },
  "Open = High (Bearish)":            { symbols: ["SBIN", "HCLTECH", "KOTAKBANK", "TITAN"], total: 17 },
  "Open = Low (Bullish)":             { symbols: ["LT", "MARUTI", "BAJFINANCE", "ADANIENT"], total: 20 },
};

/** Fundamentals + technicals: larger subtext on small screens for readability; `sm+` stays compact. */
const hubScanSubtextClassName =
  "mt-1 text-sm sm:text-xs text-muted-foreground leading-snug line-clamp-2";

const TECHNICAL_SCAN_RUN_LABELS = [
  "15 mins ago",
  "32 mins ago",
  "1 hr ago",
  "2 hrs ago",
  "Yesterday",
  "EOD",
] as const;

function technicalScanRunLabel(sectionTitle: string, rowIdx: number): string {
  const seed = sectionTitle.length * 11 + rowIdx * 7;
  return TECHNICAL_SCAN_RUN_LABELS[seed % TECHNICAL_SCAN_RUN_LABELS.length];
}

function plusOnlySeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) % 1000003;
  }
  return hash;
}

function isPlusOnlyScan(sectionTitle: string, scanLabel: string): boolean {
  // Keep ~30% rows as Plus-only using deterministic pseudo-random selection.
  return plusOnlySeed(`${sectionTitle}::${scanLabel}`) % 10 < 3;
}

const TECHNICAL_SCREEN_SECTIONS: Array<{
  title: string;
  Icon: LucideIcon;
  scans: Array<{ label: string; matchName: string; subtext: string }>;
}> = [
  {
    title: "Moving Average Signals",
    Icon: LineChart,
    scans: [
      { label: "Golden Crossover", matchName: "Golden Crossover", subtext: "50/200 MA bull cross — trend bias flips up." },
      { label: "Death Cross Alert", matchName: "Death Cross Alert", subtext: "50/200 MA bear cross — trend bias weakens." },
      { label: "EMA Bullish Alignment", matchName: "Moving Average Bounce (50 EMA)", subtext: "Price stacked above short EMAs." },
      { label: "Moving Average Bounce", matchName: "Moving Average Bounce (50 EMA)", subtext: "Pullback holds at key moving average." },
      { label: "Price Reclaimed 200 DMA", matchName: "Golden Crossover", subtext: "Close back above the 200-day line." },
    ],
  },
  {
    title: "Breakout Scans",
    Icon: CandlestickChart,
    scans: [
      { label: "52-Week High Breakout", matchName: "52-Week High Breakout", subtext: "Fresh 52-week high with volume." },
      { label: "Stocks Near All-Time High", matchName: "Stocks Near All-Time High", subtext: "Trading tight to lifetime highs." },
      { label: "Consolidation Breakout (BB Squeeze)", matchName: "Consolidation Breakout (BB Squeeze)", subtext: "Squeeze resolves with expansion." },
      { label: "Darvas Box Breakout", matchName: "Darvas Box Breakout", subtext: "Break above the box ceiling." },
      { label: "Donchian Channel Breakout", matchName: "Consolidation Breakout (BB Squeeze)", subtext: "Upper Donchian channel break." },
      { label: "NR7 Breakout", matchName: "NR7 Breakout", subtext: "Narrowest range in 7 sessions breaks." },
    ],
  },
  {
    title: "Mean Reversion Scans",
    Icon: LineChart,
    scans: [
      { label: "RSI Oversold (Daily < 30)", matchName: "RSI Oversold (Daily < 30)", subtext: "Daily RSI deep oversold zone." },
      { label: "200 DMA Support Zone", matchName: "Moving Average Bounce (50 EMA)", subtext: "Long-term average acting as support." },
      { label: "Price Below Lower Bollinger Band", matchName: "Consolidation Breakout (BB Squeeze)", subtext: "Close stretched under lower band." },
      { label: "Bullish Divergence (RSI)", matchName: "Bullish Divergence (RSI)", subtext: "RSI disagrees with lower lows." },
      { label: "Stochastic Oversold + Turning Up", matchName: "RSI Reversal Hunter", subtext: "Stoch turns up from oversold." },
    ],
  },
  {
    title: "Momentum Scans",
    Icon: Flame,
    scans: [
      { label: "RSI Entering Overbought", matchName: "RSI Reversal Hunter", subtext: "RSI pushing into overbought." },
      { label: "MACD Bullish Cross", matchName: "VWAP Cross Bullish (5-min)", subtext: "MACD line crosses above signal." },
      { label: "Supertrend Flip (Bullish)", matchName: "Supertrend Flip (Bullish)", subtext: "Indicator switches to buy mode." },
      { label: "ADX Trending (Strong)", matchName: "First 15-min Volume Shocker", subtext: "Strong trend strength reading." },
      { label: "Aroon Bullish", matchName: "Sector Leader Rotation", subtext: "Aroon Up leads — early strength." },
    ],
  },
];

const FUNDAMENTAL_SCREEN_SECTIONS: Array<{
  title: string;
  Icon: LucideIcon;
  scans: Array<{ label: string; matchName: string; subtext: string }>;
}> = [
  {
    title: "Quality & Compounding",
    Icon: Target,
    scans: [
      {
        label: "Coffee Can Portfolio",
        matchName: "Value + Growth Compounder",
        subtext: "Long-hold quality: durable ROE and cash.",
      },
      {
        label: "Consistent Compounders",
        matchName: "Value + Growth Compounder",
        subtext: "Earnings compounding year on year.",
      },
      {
        label: "Bluest of Blue Chips",
        matchName: "52-Week High Breakout",
        subtext: "Large-cap strength and liquidity.",
      },
      {
        label: "Piotroski Score = 9",
        matchName: "Piotroski Score > 7",
        subtext: "Full F-Score fundamentals checklist.",
      },
      {
        label: "Magic Formula",
        matchName: "Undervalued + Strong Fundamentals",
        subtext: "High earnings yield plus strong ROIC.",
      },
    ],
  },
  {
    title: "Emerging Gems",
    Icon: BriefcaseBusiness,
    scans: [
      {
        label: "Cash-Rich Small Caps",
        matchName: "Undervalued + Strong Fundamentals",
        subtext: "Small caps with surplus cash, low debt.",
      },
      {
        label: "Fast-Growing Micro Caps",
        matchName: "Value + Growth Compounder",
        subtext: "Fast EPS growth in micro caps.",
      },
      {
        label: "Multi-Bagger Candidates",
        matchName: "Sector Leader Rotation",
        subtext: "Improving growth plus momentum.",
      },
      {
        label: "Under-the-Radar Compounders",
        matchName: "Value + Growth Compounder",
        subtext: "Quiet earners off the radar.",
      },
      {
        label: "Small Cap Turnarounds",
        matchName: "Undervalued + Strong Fundamentals",
        subtext: "Profit recovery in small caps.",
      },
    ],
  },
  {
    title: "Value Screens",
    Icon: Landmark,
    scans: [
      {
        label: "Low PE + High Growth",
        matchName: "Undervalued + Strong Fundamentals",
        subtext: "Low multiple with solid EPS growth.",
      },
      {
        label: "PEG Ratio < 1",
        matchName: "Value + Growth Compounder",
        subtext: "Cheap versus growth — GARP tilt.",
      },
      {
        label: "Graham's Net-Net",
        matchName: "Undervalued + Strong Fundamentals",
        subtext: "Below net current assets — deep value.",
      },
      {
        label: "High ROE Value Picks",
        matchName: "Piotroski Score > 7",
        subtext: "Strong ROE at fair valuations.",
      },
      {
        label: "Cash-Rich Value Leaders",
        matchName: "Dividend Aristocrats",
        subtext: "Yield plus cash-rich balance sheets.",
      },
    ],
  },
  {
    title: "Dividend Screens",
    Icon: Bell,
    scans: [
      {
        label: "Dividend Aristocrats (India)",
        matchName: "Dividend Aristocrats",
        subtext: "Stable or rising payouts, quality filters.",
      },
      {
        label: "High Dividend Yield",
        matchName: "Dividend Aristocrats",
        subtext: "Above-market yield, basic safety checks.",
      },
      {
        label: "Dividend + Low Debt",
        matchName: "Dividend Aristocrats",
        subtext: "Income with conservative leverage.",
      },
    ],
  },
  {
    title: "Turnaround & Special Situations",
    Icon: LineChart,
    scans: [
      {
        label: "Loss to Profit Turnaround",
        matchName: "Undervalued + Strong Fundamentals",
        subtext: "Back to sustainable profits and cash.",
      },
      {
        label: "Debt Reduction Champions",
        matchName: "Value + Growth Compounder",
        subtext: "Active deleveraging, better equity story.",
      },
      {
        label: "Capacity Expansion",
        matchName: "Sector Leader Rotation",
        subtext: "Capex that can lift future earnings.",
      },
    ],
  },
  {
    title: "Shareholding & Ownership",
    Icon: BriefcaseBusiness,
    scans: [
      {
        label: "FII Heavy Buying",
        matchName: "FII/DII Buying Surge",
        subtext: "Strong recent FII buying flows.",
      },
      {
        label: "Promoter Buying",
        matchName: "FII/DII Buying Surge",
        subtext: "Insiders adding — aligned incentives.",
      },
      {
        label: "Promoter Pledge Reduction",
        matchName: "Piotroski Score > 7",
        subtext: "Lower pledge, cleaner risk profile.",
      },
      {
        label: "DII Accumulation",
        matchName: "FII/DII Buying Surge",
        subtext: "Domestic institutions building size.",
      },
      {
        label: "High Promoter Holding + Low Debt",
        matchName: "Value + Growth Compounder",
        subtext: "High skin in the game, low leverage.",
      },
    ],
  },
  {
    title: "Thematic",
    Icon: BriefcaseBusiness,
    scans: [
      {
        label: "Profitable Small Caps",
        matchName: "Undervalued + Strong Fundamentals",
        subtext: "Earnings-positive small caps.",
      },
      {
        label: "PSU Gems",
        matchName: "Dividend Aristocrats",
        subtext: "PSU yield, reform, quality angles.",
      },
      {
        label: "Defence & Railways",
        matchName: "Sector Leader Rotation",
        subtext: "Defence and rail capex themes.",
      },
      {
        label: "Green Energy / EV Plays",
        matchName: "Sector Leader Rotation",
        subtext: "Renewables, EV chain, clean energy.",
      },
    ],
  },
];

export function AppScannersHubMarketSections() {
  const [liveTimeHorizon, setLiveTimeHorizon] = useState<"all" | LiveTimeHorizon>("all");
  const [candlestickIndex, setCandlestickIndex] = useState<string>("Nifty 50");
  const [candlestickTimeframe, setCandlestickTimeframe] = useState<CandlestickTimeframe>("15m");
  const [candlestickFamily, setCandlestickFamily] = useState<CandlestickFamily>("bullish_reversal");
  const [indexSheetOpen, setIndexSheetOpen] = useState(false);
  const [timeframeSheetOpen, setTimeframeSheetOpen] = useState(false);

  const filtered = useMemo(() => PRE_BUILT_SCANNERS, []);

  const technicalScreenSections = useMemo(() => {
    const scannerByName = new Map(filtered.map((s) => [s.name, s] as const));
    const fallbackScanner =
      scannerByName.get("Golden Crossover") ??
      scannerByName.get("Moving Average Bounce (50 EMA)") ??
      filtered[0];
    return TECHNICAL_SCREEN_SECTIONS.map((section) => ({
      ...section,
      scans: section.scans
        .map((item) => ({
          ...item,
          scanner: scannerByName.get(item.matchName) ?? fallbackScanner,
        }))
        .filter((item): item is typeof item & { scanner: (typeof filtered)[number] } => Boolean(item.scanner))
        .slice(0, 5),
    })).filter((section) => section.scans.length > 0);
  }, [filtered]);

  const fundamentalScreenSections = useMemo(() => {
    const scannerByName = new Map(filtered.map((s) => [s.name, s] as const));
    const fallbackScanner =
      scannerByName.get("Value + Growth Compounder") ??
      scannerByName.get("Undervalued + Strong Fundamentals") ??
      filtered[0];
    return FUNDAMENTAL_SCREEN_SECTIONS.map((section) => ({
      ...section,
      scans: section.scans
        .map((item) => ({
          ...item,
          scanner: scannerByName.get(item.matchName) ?? fallbackScanner,
        }))
        .filter((item): item is typeof item & { scanner: (typeof filtered)[number] } => Boolean(item.scanner)),
    }));
  }, [filtered]);

  const liveSignalsFiltered = useMemo(() => {
    return LIVE_MARKET_SIGNALS.filter((s) => {
      if (liveTimeHorizon !== "all" && !s.timeHorizons.includes(liveTimeHorizon)) return false;
      return true;
    });
  }, [liveTimeHorizon]);

  const candlestickRows = useMemo(() => {
    return CANDLESTICK_DETECTIONS.filter((row) => {
      if (row.indexUniverse !== candlestickIndex) return false;
      if (row.timeframe !== candlestickTimeframe) return false;
      if (row.family !== candlestickFamily) return false;
      return true;
    });
  }, [candlestickFamily, candlestickIndex, candlestickTimeframe]);

  return (
    <>
        {/* Live market signals */}
        <div className="mb-6 lg:mb-8 -mx-4 lg:mx-0 bg-white lg:bg-transparent relative lg:rounded-2xl">
          <section className="px-4 lg:px-0 pt-5 pb-4" aria-label="Live market signals">
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
                          : "border-border bg-white text-foreground hover:border-foreground/20"
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
              <div
                className="flex flex-nowrap gap-3 overflow-x-auto overscroll-x-contain pb-2 -mr-4 pr-4 snap-x snap-mandatory scrollbar-none sm:pr-6 lg:mr-0 lg:pr-0 touch-pan-x"
                role="list"
              >
                {liveSignalsFiltered.map((signal) => (
                  <LiveSignalCard key={signal.id} signal={signal} />
                ))}
              </div>
            )}
          </section>
        </div>

        <section className="mb-6 lg:mb-8" aria-label="Fundamental screens">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl leading-7 font-bold text-foreground">Fundamental Screens</h2>
            <Link
              to="/scanners"
              className="text-xs font-medium text-foreground underline-offset-4 hover:underline"
            >
              View all
            </Link>
          </div>
          <div
            className="flex flex-nowrap gap-3 overflow-x-auto overscroll-x-contain pb-2 -mr-4 pr-4 snap-x snap-mandatory scrollbar-none sm:pr-6 lg:mr-0 lg:pr-0 touch-pan-x"
            role="list"
          >
            {fundamentalScreenSections.map((section) => (
              <div
                key={section.title}
                className="shrink-0 snap-start rounded-2xl border border-neutral-200/90 bg-white overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04)] w-[min(360px,calc(100vw-2.5rem))] sm:w-[max(220px,min(380px,calc((min(100vw,1536px)-5.5rem)/4)))]"
                role="listitem"
              >
                <div className="px-4 py-3 border-b border-border/70 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <section.Icon className="w-5 h-5 text-foreground shrink-0" />
                    <h3 className="text-[15px] leading-5 font-semibold text-foreground truncate">{section.title}</h3>
                  </div>
                </div>
                <div>
                  {section.scans.map((item, idx) => (
                    <Link
                      key={`${section.title}-${item.label}`}
                      to={`/scanners/${item.scanner.id}`}
                      className={cn(
                        "block px-4 py-3.5 sm:py-4 hover:bg-muted/30 transition-colors",
                        idx !== section.scans.length - 1 && "border-b border-border/60"
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <div className="min-w-0 flex-1">
                          <h4 className="text-[14px] leading-5 font-semibold text-foreground pr-1">
                            <span className="inline-flex items-center gap-1.5">
                              <span>{item.label}</span>
                              {isPlusOnlyScan(section.title, item.label) && (
                                <img
                                  src="/plus-logo.png"
                                  alt="Plus"
                                  className="h-4 w-[29px] shrink-0"
                                />
                              )}
                            </span>
                          </h4>
                          <p className={hubScanSubtextClassName}>{item.subtext}</p>
                          <div className="mt-2 flex items-center">
                            <span className="text-xs sm:text-[11px] font-medium text-muted-foreground tabular-nums">
                              {item.scanner.resultCount} stocks
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground/70 shrink-0 mt-0.5" aria-hidden />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-6 lg:mb-8" aria-label="Technical screens">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl leading-7 font-bold text-foreground">Technical Screens</h2>
            <Link
              to="/scanners"
              className="text-xs font-medium text-foreground underline-offset-4 hover:underline"
            >
              View all
            </Link>
          </div>
          <div
            className="flex flex-nowrap gap-3 overflow-x-auto overscroll-x-contain pb-2 -mr-4 pr-4 snap-x snap-mandatory scrollbar-none sm:pr-6 lg:mr-0 lg:pr-0 touch-pan-x"
            role="list"
          >
            {technicalScreenSections.map((section) => (
                <div
                  key={section.title}
                  className="shrink-0 snap-start rounded-2xl border border-neutral-200/90 bg-white overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04)] w-[min(360px,calc(100vw-2.5rem))] sm:w-[max(220px,min(380px,calc((min(100vw,1536px)-5.5rem)/4)))]"
                  role="listitem"
                >
                  {/* Section header */}
                  <div className="flex items-center px-4 py-3.5 border-b border-border/70">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <section.Icon className="w-5 h-5 text-foreground shrink-0" />
                      <h3 className="text-[15px] leading-5 font-semibold text-foreground truncate">
                        {section.title}
                      </h3>
                    </div>
                  </div>

                  {/* Scanner rows */}
                  <div>
                    {section.scans.map((item, rowIdx) => {
                      const isLast = rowIdx === section.scans.length - 1;
                      const stockData = SCANNER_TOP_SYMBOLS[item.scanner.name];
                      const runLabel = technicalScanRunLabel(section.title, rowIdx);
                      return (
                        <Link
                          key={`${section.title}-${item.label}-${item.scanner.id}`}
                          to={`/scanners/${item.scanner.id}`}
                          className={cn(
                            "block px-4 py-4 hover:bg-muted/30 transition-colors",
                            !isLast && "border-b border-border/60"
                          )}
                        >
                          <div className="relative">
                            <div className="min-w-0">
                              <h4 className="text-[14px] leading-5 font-semibold text-foreground truncate pr-5">
                                <span className="inline-flex items-center gap-1.5">
                                  <span className="truncate">{item.label}</span>
                                  {isPlusOnlyScan(section.title, item.label) && (
                                    <img
                                      src="/plus-logo.png"
                                      alt="Plus"
                                      className="h-4 w-[29px] shrink-0"
                                    />
                                  )}
                                </span>
                              </h4>
                              <p className={hubScanSubtextClassName}>{item.subtext}</p>

                              {/* Stock logos + last updated */}
                              <div className="mt-2 grid grid-cols-[1fr_auto] items-center gap-2">
                                {stockData ? (
                                  <StockLogoRow symbols={stockData.symbols} total={stockData.total} />
                                ) : (
                                  <span />
                                )}
                                <span className="inline-flex h-4 min-w-[74px] items-center justify-end gap-1 text-[10px] leading-none text-muted-foreground/70 whitespace-nowrap justify-self-end text-right">
                                  <Clock className="h-2.5 w-2.5 shrink-0" />
                                  {runLabel}
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground/70 absolute right-0 top-0.5" />
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
        <Card className="border-border bg-muted/30 mb-6 lg:mb-8">
          <CardContent className="p-4 lg:p-6 flex items-center gap-3 lg:gap-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm lg:text-base font-semibold text-foreground">Build your own</p>
              <p className="text-xs lg:text-sm text-muted-foreground">Indicators, patterns &amp; formulas — DIY screener.</p>
            </div>
            <Button asChild size="sm" className="shrink-0">
              <Link to="/diy">Open</Link>
            </Button>
          </CardContent>
        </Card>

        <section className="mb-6 lg:mb-8" aria-label="Discover opportunities">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl leading-7 font-bold text-foreground">Discover by trading style</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {OPPORTUNITY_TRACKS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.key}
                  className="relative rounded-xl border border-border/80 bg-white p-3 shadow-[0_1px_4px_rgba(0,0,0,0.05)]"
                >
                  <span className="absolute top-3 right-3 inline-flex items-center rounded-full bg-muted border border-border px-2 py-0.5 text-[10px] font-semibold text-foreground">
                    {item.scans}
                  </span>
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center mb-2">
                    <Icon className="w-4 h-4 text-foreground" />
                  </div>
                  <p className="text-[15px] leading-5 font-semibold text-foreground">{item.label}</p>
                  <p className="text-[11px] leading-4 text-muted-foreground mt-1 line-clamp-1">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mb-6 lg:mb-8" aria-label="Candlesticks scan">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl leading-7 font-bold text-foreground">Candlesticks Scan</h2>
          </div>

          <div className="p-0">
            <div className="mb-4">
              <div className="flex h-11 items-center gap-3 overflow-x-auto whitespace-nowrap">
                <button
                  type="button"
                  onClick={() => setIndexSheetOpen(true)}
                  className={cn(
                    "shrink-0 box-border inline-flex w-auto max-w-none items-center gap-[2px] h-[28px] rounded-[6px] border transition-colors",
                    "pl-[10px] pr-[6px] py-[6px]",
                    indexSheetOpen ? "bg-muted/60 border-foreground/25" : "bg-[#FFFFFF] border-[#E1E1E1]"
                  )}
                >
                  <span
                    className={cn(
                      "h-[16px] text-[12px] font-semibold leading-[16px] flex items-center whitespace-nowrap",
                      indexSheetOpen ? "text-foreground" : "text-[#262626]"
                    )}
                  >
                    {candlestickIndex}
                  </span>
                  <span className="flex h-[16px] w-[16px] items-center justify-center" aria-hidden="true">
                    <span
                      className="h-0 w-0"
                      style={{
                        borderLeft: "5px solid transparent",
                        borderRight: "5px solid transparent",
                        borderTop: `7px solid ${indexSheetOpen ? "hsl(var(--foreground))" : "#262626"}`,
                      }}
                    />
                  </span>
                </button>
                <span className="h-7 w-px shrink-0 bg-[#F1F1F1]" aria-hidden />
                <button
                  type="button"
                  onClick={() => setTimeframeSheetOpen(true)}
                  className={cn(
                    "shrink-0 box-border inline-flex w-auto max-w-none items-center gap-[2px] h-[28px] rounded-[6px] border transition-colors",
                    "pl-[10px] pr-[6px] py-[6px]",
                    timeframeSheetOpen ? "bg-muted/60 border-foreground/25" : "bg-[#FFFFFF] border-[#E1E1E1]"
                  )}
                >
                  <span
                    className={cn(
                      "h-[16px] text-[12px] font-semibold leading-[16px] flex items-center whitespace-nowrap",
                      timeframeSheetOpen ? "text-foreground" : "text-[#262626]"
                    )}
                  >
                    {CANDLESTICK_TIMEFRAME_OPTIONS.find((opt) => opt.value === candlestickTimeframe)?.label ?? "Timeframe"}
                  </span>
                  <span className="flex h-[16px] w-[16px] items-center justify-center" aria-hidden="true">
                    <span
                      className="h-0 w-0"
                      style={{
                        borderLeft: "5px solid transparent",
                        borderRight: "5px solid transparent",
                        borderTop: `7px solid ${timeframeSheetOpen ? "hsl(var(--foreground))" : "#262626"}`,
                      }}
                    />
                  </span>
                </button>
                <div className="flex items-center gap-2">
                  {CANDLESTICK_FAMILY_OPTIONS.map((opt) => {
                    const active = candlestickFamily === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setCandlestickFamily(opt.value)}
                        className={cn(
                          "inline-flex h-7 items-center justify-center rounded-md border px-3 text-xs font-semibold",
                          active
                            ? "border-foreground/30 bg-muted text-foreground"
                            : "border-[#E1E1E1] bg-white text-[#262626]"
                        )}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-3">
              <div className="flex items-center border-b border-border/60 px-3 py-2.5 bg-muted/20">
                <div className="w-[120px] shrink-0 text-[10px] font-medium text-muted-foreground">Scrip</div>
                <div className="flex-1 text-[10px] font-medium text-muted-foreground">SparkCandle</div>
                <div className="w-[150px] shrink-0 text-right text-[10px] font-medium text-muted-foreground">Price</div>
              </div>
              {candlestickRows.length === 0 ? (
                <p className="text-sm text-muted-foreground py-3">
                  No candlestick detections for selected filters.
                </p>
              ) : (
                candlestickRows.map((row, idx) => {
                  const up = row.changePct >= 0;
                  const toneTagClass = up
                    ? "bg-[linear-gradient(90deg,#DEF5ED_24%,rgba(114,216,181,0)_100%)] text-[#008858]"
                    : "bg-[linear-gradient(90deg,#FCE7E7_24%,rgba(239,68,68,0)_100%)] text-[#B91C1C]";
                  const ToneIcon = up ? TrendingUp : TrendingDown;
                  return (
                    <div
                      key={`${row.symbol}-${row.detectedPattern}-${row.timeframe}`}
                      className={cn("px-3 py-3", idx !== candlestickRows.length - 1 && "border-b border-border/50")}
                    >
                      <div className="grid grid-cols-[120px_1fr_150px] items-start gap-3">
                        <div className="min-w-0">
                          <p className="text-[14px] font-semibold text-foreground leading-5">{row.symbol}</p>
                        </div>

                        <div className="min-w-0">
                          <img
                            src={candlestickPatternImage(row.family)}
                            alt={`${row.detectedPattern} pattern preview`}
                            className="h-14 w-24 object-cover"
                            loading="lazy"
                          />
                          <p className="mt-1.5 text-[12px] font-medium text-foreground leading-4 whitespace-nowrap">{row.detectedPattern}</p>
                        </div>

                        <div className="min-w-0 text-right">
                          <p className="text-[14px] font-semibold text-foreground">{formatInr(row.ltp)}</p>
                          <p className={cn("text-[12px] mt-0.5", up ? "text-[#008858]" : "text-[#D53627]")}>
                            {up ? "+" : ""}{row.changeAbs.toFixed(2)} ({up ? "+" : ""}{row.changePct.toFixed(2)}%)
                          </p>
                        </div>
                      </div>

                      <div className="mt-2 flex h-6 items-center rounded-[4px] bg-muted/40 px-2 py-1">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[10px] font-medium leading-4 text-[#262626]">
                            {candlestickOutlook(row)}
                          </p>
                        </div>
                        <div className="ml-1 inline-flex h-4 items-center justify-center rounded-[4px] px-1">
                          <span className={cn("inline-flex items-center gap-0.5 rounded-[4px] px-1 py-0 text-[10px] font-semibold leading-4", toneTagClass)}>
                            {up ? "Bullish" : "Bearish"}
                            <ToneIcon className="h-3 w-3" aria-hidden />
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <Dialog open={indexSheetOpen} onOpenChange={setIndexSheetOpen}>
            <DialogContent className="!p-0 !gap-0 !border-0 !shadow-none !rounded-t-2xl !rounded-b-none !bg-white w-full max-w-none h-auto max-h-[calc(100vh-20px)] overflow-hidden !left-0 !top-auto !bottom-0 !translate-x-0 !translate-y-0 sm:rounded-t-2xl [&>button]:hidden">
              <div className="flex flex-col bg-white">
                <div className="border-b border-[#F1F1F1] px-4 py-4">
                  <DialogTitle className="text-[14px] font-medium leading-6 text-[#262626]">Filter by</DialogTitle>
                </div>
                <div className="px-4 py-3 space-y-4">
                  {CANDLESTICK_INDEX_OPTIONS.map((opt) => {
                    const active = candlestickIndex === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setCandlestickIndex(opt);
                          setIndexSheetOpen(false);
                        }}
                        className="flex items-center gap-2 text-left"
                      >
                        <span
                          className={cn(
                            "inline-flex h-4 w-4 items-center justify-center rounded-full border-[1.5px]",
                            active ? "border-foreground" : "border-[#919191]"
                          )}
                        >
                          {active ? <span className="h-2 w-2 rounded-full bg-foreground" /> : null}
                        </span>
                        <span className="text-xs font-semibold text-[#262626]">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={timeframeSheetOpen} onOpenChange={setTimeframeSheetOpen}>
            <DialogContent className="!p-0 !gap-0 !border-0 !shadow-none !rounded-t-2xl !rounded-b-none !bg-white w-full max-w-none h-auto max-h-[calc(100vh-20px)] overflow-hidden !left-0 !top-auto !bottom-0 !translate-x-0 !translate-y-0 sm:rounded-t-2xl [&>button]:hidden">
              <div className="flex flex-col bg-white">
                <div className="border-b border-[#F1F1F1] px-4 py-4">
                  <DialogTitle className="text-[14px] font-medium leading-6 text-[#262626]">Timeframe</DialogTitle>
                </div>
                <div className="px-4 py-3 space-y-4">
                  {CANDLESTICK_TIMEFRAME_OPTIONS.map((opt) => {
                    const active = candlestickTimeframe === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setCandlestickTimeframe(opt.value);
                          setTimeframeSheetOpen(false);
                        }}
                        className="flex items-center gap-2 text-left"
                      >
                        <span
                          className={cn(
                            "inline-flex h-4 w-4 items-center justify-center rounded-full border-[1.5px]",
                            active ? "border-foreground" : "border-[#919191]"
                          )}
                        >
                          {active ? <span className="h-2 w-2 rounded-full bg-foreground" /> : null}
                        </span>
                        <span className="text-xs font-semibold text-[#262626]">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </section>

        {/* Quick Scanner — mini screener (last section) */}
        <QuickScannerSection />

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="font-medium text-foreground">No scanners match</p>
            <p className="text-sm mt-1">Try again in a moment</p>
          </div>
        )}

    </>
  );
}
