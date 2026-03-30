import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Search,
  Zap,
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  ChevronRight,
  Sparkles,
  BookOpen,
  Radio,
  Sun,
  Sunset,
  Target,
  Lock,
  Minus,
} from "lucide-react";
import {
  PRE_BUILT_SCANNERS,
  PERSONA_LABELS,
  PERSONA_COLORS,
  DIFFICULTY_COLORS,
  formatCount,
  type ScannerPersona,
} from "@/data/mockData";
import { cn } from "@/lib/utils";
import { QuickScannerSection } from "@/components/scanner/mobile/QuickScannerSection";

export type LiveSignalSentiment = "bullish" | "bearish" | "neutral";

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
  /** Short context or trade guidance */
  oneLiner: string;
  sentiment: LiveSignalSentiment;
  detectedAgo: string;
  tags: string[];
}

function formatInr(n: number) {
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Mock live signals — in production: websocket + screener runs */
const LIVE_MARKET_SIGNALS: LiveMarketSignal[] = [
  {
    id: "sig-1",
    symbol: "RELIANCE",
    companyName: "Reliance Industries Ltd.",
    ltp: 2847.5,
    changeAbs: 39.85,
    changePct: 1.42,
    indicator: "Opening Range Breakout (15-min)",
    scannerId: "orb-15",
    attribute: { label: "ORB range", value: "0.8% of spot" },
    oneLiner:
      "Price broke above the 9:15–9:30 high with volume. Often used for continuation in the first ~2 hours.",
    sentiment: "bullish",
    detectedAgo: "2 mins ago",
    tags: ["Intraday", "Morning"],
  },
  {
    id: "sig-2",
    symbol: "HDFCBANK",
    companyName: "HDFC Bank Ltd.",
    ltp: 1682.3,
    changeAbs: 34.6,
    changePct: 2.1,
    indicator: "Gap Up Opening (>1%)",
    scannerId: "gap-up-opening",
    attribute: { label: "Gap vs prev close", value: "+1.2%" },
    oneLiner:
      "Opened above yesterday’s close by more than 1%. Watch for gap-fill vs continuation with volume.",
    sentiment: "bullish",
    detectedAgo: "Just now",
    tags: ["Intraday", "Opening"],
  },
  {
    id: "sig-3",
    symbol: "TCS",
    companyName: "Tata Consultancy Services",
    ltp: 3824.0,
    changeAbs: 33.4,
    changePct: 0.88,
    indicator: "VWAP Cross (bullish)",
    scannerId: "vwap-cross-bullish",
    attribute: { label: "Vol vs 20D avg", value: "1.6×" },
    oneLiner:
      "Crossed above session VWAP with participation. Common intraday filter for long bias.",
    sentiment: "bullish",
    detectedAgo: "42s ago",
    tags: ["Intraday", "Live session"],
  },
  {
    id: "sig-4",
    symbol: "INFY",
    companyName: "Infosys Ltd.",
    ltp: 1850.25,
    changeAbs: -6.5,
    changePct: -0.35,
    indicator: "First 15-min Volume Shocker",
    scannerId: "first-15m-volume-shocker",
    attribute: { label: "1st 15m vol", value: "3.1× prev day avg" },
    oneLiner:
      "First 15-min volume is ~3× the previous day’s average — unusual activity; confirm direction on chart.",
    sentiment: "neutral",
    detectedAgo: "1 min ago",
    tags: ["Intraday", "Volume"],
  },
  {
    id: "sig-5",
    symbol: "HINDUNILVR",
    companyName: "Hindustan Unilever Ltd.",
    ltp: 2388.0,
    changeAbs: 28.4,
    changePct: 1.2,
    indicator: "Moving Average Bounce (50 EMA)",
    scannerId: "moving-average-bounce",
    attribute: { label: "vs 50 EMA", value: "+0.4%" },
    oneLiner:
      "Price bounced off the 50-day EMA — swing traders often watch for follow-through over several sessions.",
    sentiment: "bullish",
    detectedAgo: "8 mins ago",
    tags: ["Swing", "Positional"],
  },
  {
    id: "sig-6",
    symbol: "SBIN",
    companyName: "State Bank of India",
    ltp: 796.4,
    changeAbs: -9.2,
    changePct: -1.14,
    indicator: "Death Cross (50/200 SMA)",
    scannerId: "death-cross",
    attribute: { label: "50 vs 200", value: "Crossed down" },
    oneLiner:
      "Long-term MA cross — often watched by swing/positional traders as a risk-off cue; confirm on chart.",
    sentiment: "bearish",
    detectedAgo: "5 mins ago",
    tags: ["Swing", "Positional"],
  },
];

function SentimentBadge({ sentiment }: { sentiment: LiveSignalSentiment }) {
  const cfg = {
    bullish: {
      label: "Bullish",
      className: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
      icon: TrendingUp,
    },
    bearish: {
      label: "Bearish",
      className: "bg-red-50 text-red-800 border-red-200/80",
      icon: TrendingDown,
    },
    neutral: {
      label: "Neutral",
      className: "bg-slate-100 text-slate-700 border-slate-200",
      icon: Minus,
    },
  }[sentiment];
  const Icon = cfg.icon;
  return (
    <Badge variant="outline" className={cn("text-[10px] font-semibold px-2 py-0.5 h-6 gap-0.5 border", cfg.className)}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </Badge>
  );
}

function LiveSignalCard({ signal }: { signal: LiveMarketSignal }) {
  const scannerHref = `/scanners/${signal.scannerId}`;
  const up = signal.changePct >= 0;

  return (
    <Card
      className={cn(
        "overflow-hidden border bg-white shadow-sm transition-shadow hover:shadow-md",
        signal.sentiment === "bullish" && "border-l-[3px] border-l-emerald-500",
        signal.sentiment === "bearish" && "border-l-[3px] border-l-red-500",
        signal.sentiment === "neutral" && "border-l-[3px] border-l-slate-400"
      )}
    >
      <CardContent className="p-3">
        {/* Header: scrip on left, LTP+change on right */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <Link to={scannerHref} className="font-bold text-base text-foreground tracking-tight hover:text-primary">
              {signal.symbol}
            </Link>
            <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2 mt-0.5">{signal.companyName}</p>
          </div>
          <div className="text-right shrink-0 self-start">
            <p className={cn("text-[14px] leading-5 font-medium tabular-nums tracking-tight", up ? "text-emerald-700" : "text-red-600")}>
              {formatInr(signal.ltp)}
            </p>
            <p className="mt-0.5 text-[12px] leading-4 font-normal tabular-nums text-muted-foreground">
              {up ? "+" : ""}
              {signal.changeAbs.toFixed(2)} ({up ? "+" : ""}
              {signal.changePct.toFixed(2)}%)
            </p>
          </div>
        </div>

        {/* Indicator (strategy) + sentiment label */}
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <p className="text-sm font-semibold text-primary leading-snug">{signal.indicator}</p>
          <SentimentBadge sentiment={signal.sentiment} />
        </div>

        {/* Optional attribute */}
        {signal.attribute && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-medium text-muted-foreground shrink-0">{signal.attribute.label}</span>
            <span className="inline-flex items-center rounded-md bg-primary/10 border border-primary/20 px-2 py-0.5 text-[11px] font-semibold text-primary tabular-nums">
              {signal.attribute.value}
            </span>
          </div>
        )}

        {/* One-liner insight */}
        <div className="rounded-[4px] bg-[#FBF8FD] border border-border/60 pt-1 pb-1 pr-1 pl-2 mb-2">
          <p className="text-[10px] font-medium text-[#262626] leading-4">{signal.oneLiner}</p>
        </div>

        {/* Tags + detection time */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap gap-1.5">
            {signal.tags.map((t) => (
              <span
                key={t}
                className="text-[10px] font-medium text-muted-foreground bg-muted/80 px-2 py-0.5 rounded-full border border-border/60"
              >
                {t}
              </span>
            ))}
          </div>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1 shrink-0 tabular-nums">
            <Clock className="w-3 h-3 opacity-70" />
            {signal.detectedAgo}
          </span>
        </div>

        {/* CTA */}
        <div className="flex gap-2">
          <Button asChild className="flex-1 h-10 font-semibold shadow-sm" size="sm">
            <Link to={scannerHref}>Trade</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="h-10 px-3 shrink-0">
            <Link to={scannerHref} aria-label="Open scanner details">
              <ChevronRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

const PERSONA_CHIPS: { key: "all" | ScannerPersona; label: string; emoji: string }[] = [
  { key: "all", label: "For me", emoji: "✨" },
  { key: "intraday", label: "Intraday", emoji: "⚡" },
  { key: "btst", label: "BTST", emoji: "🌙" },
  { key: "swing", label: "Swing", emoji: "📈" },
  { key: "positional", label: "Positional", emoji: "🏦" },
  { key: "longterm", label: "Long-term", emoji: "💎" },
];

const TIME_BUCKETS = [
  { id: "morning", label: "Morning", icon: Sun, hint: "9:15 – 11:00", match: (sub: string) => /morning|opening|gap|orb|first candle/i.test(sub) },
  { id: "live", label: "Live session", icon: Radio, hint: "Intraday", match: (sub: string) => /momentum|vwap|volume|intraday/i.test(sub) },
  { id: "eod", label: "EOD / BTST", icon: Sunset, hint: "Close & overnight", match: (sub: string) => /closing|btst|3:25|nr7/i.test(sub) },
];

export function AppScannersHubPage() {
  const [persona, setPersona] = useState<"all" | ScannerPersona>("all");
  const [search, setSearch] = useState("");
  const [timeBucket, setTimeBucket] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return PRE_BUILT_SCANNERS.filter((s) => {
      const matchPersona = persona === "all" || s.persona === persona;
      const matchSearch =
        !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.description.toLowerCase().includes(search.toLowerCase());
      const bucket = TIME_BUCKETS.find((b) => b.id === timeBucket);
      const matchBucket = !bucket || bucket.match(s.subCategory + s.name);
      return matchPersona && matchSearch && matchBucket;
    });
  }, [persona, search, timeBucket]);

  const featured = useMemo(() => {
    const pool = persona === "all" ? PRE_BUILT_SCANNERS : PRE_BUILT_SCANNERS.filter((s) => s.persona === persona);
    return pool.find((s) => s.plan === "free" && s.resultCount > 20) ?? pool[0];
  }, [persona]);

  const quickPicks = useMemo(() => filtered.slice(0, 5), [filtered]);

  const grouped = useMemo(() => {
    return filtered.reduce<Record<string, typeof filtered>>((acc, s) => {
      const key = s.subCategory;
      if (!acc[key]) acc[key] = [];
      acc[key].push(s);
      return acc;
    }, {});
  }, [filtered]);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-b from-primary/[0.03] to-background pb-24 md:pb-12">
      {/* App canvas: mobile-first width */}
      <div className="max-w-lg mx-auto px-4 pt-4 sm:pt-6">
        {/* Header */}
        <header className="mb-5">
          <div className="flex items-start justify-between gap-3 mb-1">
            <div>
              <Badge className="mb-2 bg-primary/10 text-primary border-0 text-[10px] font-semibold">
                <Sparkles className="w-3 h-3 mr-1" />
                Upstox app
              </Badge>
              <h1 className="text-2xl font-bold text-foreground tracking-tight leading-tight">
                Scanners &amp; signals
              </h1>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                Pick how you trade — we surface the right screens, live matches, and bite-sized help.
              </p>
            </div>
          </div>
        </header>

        {/* Persona — primary discovery */}
        <section className="mb-5" aria-label="Trading style">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            I trade as…
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
            {PERSONA_CHIPS.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setPersona(p.key)}
                className={cn(
                  "shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold border transition-colors",
                  persona === p.key
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-white text-foreground border-border hover:border-primary/35"
                )}
              >
                <span aria-hidden>{p.emoji}</span>
                {p.label}
              </button>
            ))}
          </div>
        </section>

        {/* Search */}
        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search scanners by name or idea…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 rounded-xl border-border/80 bg-white shadow-sm"
          />
        </div>

        {/* Quick Scanner — mini screener */}
        <QuickScannerSection />

        {/* Live market signals — vertical stack, dense card (mobile app) */}
        <section className="mb-6" aria-label="Live market signals">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <h2 className="text-sm font-semibold text-foreground truncate">Live market signals</h2>
            </div>
            <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full shrink-0">
              Mock · Demo
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed">
            Live matches from your scanners — LTP, sentiment, and a quick read before you trade.
          </p>
          <div className="space-y-4">
            {LIVE_MARKET_SIGNALS.map((signal) => (
              <LiveSignalCard key={signal.id} signal={signal} />
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">
            Trade opens the scanner workflow; confirm price and risk in the order screen. Signals refresh
            while the market is open.
          </p>
        </section>

        {/* Time-of-day buckets — secondary filter */}
        <section className="mb-6" aria-label="When do you trade">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            When do you want ideas?
          </p>
          <div className="grid grid-cols-3 gap-2">
            {TIME_BUCKETS.map((b) => {
              const Icon = b.icon;
              const active = timeBucket === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setTimeBucket(active ? null : b.id)}
                  className={cn(
                    "rounded-xl border px-2 py-3 text-center transition-colors",
                    active
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-white hover:border-primary/25"
                  )}
                >
                  <Icon className="w-4 h-4 mx-auto mb-1 opacity-80" />
                  <p className="text-[11px] font-semibold leading-tight">{b.label}</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">{b.hint}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Featured + pulse */}
        {featured && (
          <section className="mb-6" aria-label="Featured scanner">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold">Featured for {persona === "all" ? "today" : PERSONA_LABELS[persona]}</h2>
            </div>
            <Link to={`/scanners/${featured.id}`}>
              <Card className="border-primary/25 bg-gradient-to-br from-primary/10 via-white to-white overflow-hidden shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={cn("text-[10px] border-0", PERSONA_COLORS[featured.persona])}>
                      {PERSONA_LABELS[featured.persona]}
                    </Badge>
                    <Badge className={cn("text-[10px] border-0", DIFFICULTY_COLORS[featured.difficulty])}>
                      {featured.difficulty}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-1 pr-6">{featured.name}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-2">{featured.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs">
                      <span className="font-semibold text-foreground">{featured.resultCount} matches</span>
                      <span className="text-muted-foreground">{featured.lastUpdated}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </section>
        )}

        {/* Quick picks — compact horizontal */}
        <section className="mb-6" aria-label="Quick picks">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Quick picks</h2>
            <Link to="/scanners" className="text-xs font-medium text-primary">
              Full catalog
            </Link>
          </div>
          <div className="space-y-2">
            {quickPicks.map((s, i) => (
              <Link key={s.id} to={`/scanners/${s.id}`}>
                <div
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border bg-white transition-colors",
                    i === 0 ? "border-primary/20 shadow-sm" : "border-border/80 hover:border-primary/25"
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold",
                      i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{s.name}</p>
                    <p className="text-[11px] text-muted-foreground">{s.resultCount} matches · {s.lastUpdated}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Plus nudge */}
        <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Advanced packs</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Darvas, divergence, Piotroski &amp; more — Plus members get priority signals.
              </p>
            </div>
          </div>
          <Button size="sm" className="shrink-0 bg-gradient-to-r from-[#542087] to-[#7c3abf] w-full sm:w-auto">
            Upgrade
          </Button>
        </div>

        {/* Grouped scanners — accordion-style sections for less monotony */}
        <section className="mb-6" aria-label="All scanners">
          <h2 className="text-sm font-semibold mb-3">Browse by theme</h2>
          <Accordion type="multiple" defaultValue={Object.keys(grouped).slice(0, 2)} className="space-y-2">
            {Object.entries(grouped).map(([category, scanners]) => (
              <AccordionItem key={category} value={category} className="border border-border rounded-xl px-3 bg-white">
                <AccordionTrigger className="text-sm font-semibold hover:no-underline py-3">
                  <span className="flex items-center gap-2">
                    {category}
                    <Badge variant="secondary" className="text-[10px] font-normal">
                      {scanners.length}
                    </Badge>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-3 pt-0">
                  <div className="space-y-2">
                    {scanners.map((scanner) => (
                      <CompactScannerRow key={scanner.id} scanner={scanner} />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="font-medium text-foreground">No scanners match</p>
            <p className="text-sm mt-1">Try another style or clear search</p>
            <Button variant="outline" className="mt-4" onClick={() => { setPersona("all"); setSearch(""); setTimeBucket(null); }}>
              Reset filters
            </Button>
          </div>
        )}

        {/* Beginner help */}
        <section className="mb-8" aria-label="How to use scanners">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold">New to scanners?</h2>
          </div>
          <Accordion type="single" collapsible className="border border-border rounded-xl bg-white overflow-hidden">
            <AccordionItem value="a" className="border-0 px-4">
              <AccordionTrigger className="text-sm py-3">What is a scanner?</AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed pb-3">
                A scanner runs a rule across thousands of stocks (e.g. “gap up &gt; 1%”) and shows who qualifies right now — so you spend less time hunting and more time deciding.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="b" className="border-t border-border">
              <AccordionTrigger className="text-sm px-4 py-3">How do I place a trade?</AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed px-4 pb-3">
                Open a scanner → tap a stock → review price &amp; charts in Upstox → place your order. Always use a stop-loss and size positions for your risk.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="c" className="border-t border-border">
              <AccordionTrigger className="text-sm px-4 py-3">Beginner vs intermediate</AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed px-4 pb-3">
                Start with <strong className="text-foreground">beginner</strong> badges and shorter time windows (morning). Move to swing and positional once you’re comfortable managing overnight risk.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* DIY CTA */}
        <Card className="border-primary/20 bg-primary/5 mb-8">
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
      </div>
    </div>
  );
}

function CompactScannerRow({ scanner }: { scanner: (typeof PRE_BUILT_SCANNERS)[0] }) {
  const isPlus = scanner.plan === "plus";
  return (
    <Link
      to={`/scanners/${scanner.id}`}
      className="flex items-center gap-3 p-2.5 rounded-lg border border-transparent hover:border-primary/20 hover:bg-muted/40 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
          <Badge className={cn("text-[9px] px-1.5 py-0 h-4 border-0", PERSONA_COLORS[scanner.persona])}>
            {PERSONA_LABELS[scanner.persona]}
          </Badge>
          {isPlus && (
            <Badge className="text-[9px] px-1.5 py-0 h-4 bg-gradient-to-r from-[#542087] to-[#7c3abf] text-white border-0">
              <Lock className="w-2 h-2 mr-0.5" />
              Plus
            </Badge>
          )}
        </div>
        <p className="text-xs font-semibold text-foreground truncate">{scanner.name}</p>
        <p className="text-[10px] text-muted-foreground flex items-center gap-2 mt-0.5">
          <TrendingUp className="w-3 h-3 text-green-600" />
          {scanner.resultCount} matches
          <span className="text-border">·</span>
          <Users className="w-3 h-3" />
          {formatCount(scanner.runCount)}
        </p>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
    </Link>
  );
}
