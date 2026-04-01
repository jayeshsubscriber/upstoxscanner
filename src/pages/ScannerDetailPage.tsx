import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft, ChevronDown, TrendingUp, TrendingDown,
  Zap, Lock, Info, BookOpen, Target, ShieldAlert, BellRing, Share2,
  Timer, RefreshCw, Layers, BarChart3, Plus,
  Flame, Crosshair, LogOut, DollarSign, SlidersHorizontal,
} from "lucide-react";
import {
  PRE_BUILT_SCANNERS, MOCK_SCAN_RESULTS, PERSONA_COLORS, PERSONA_LABELS,
  formatVolume,
} from "@/data/mockData";
import { cn } from "@/lib/utils";

const MARKET_CAP_BY_SYMBOL_CR: Record<string, number> = {
  RELIANCE: 1960000,
  HDFCBANK: 1260000,
  INFY: 650000,
  WIPRO: 270000,
  ICICIBANK: 780000,
  TATAMOTORS: 320000,
  SUNPHARMA: 380000,
  BAJFINANCE: 480000,
  ASIANPAINT: 300000,
  TITAN: 320000,
  HCLTECH: 360000,
  MARUTI: 350000,
};

const RUN_DAY_OPTIONS = [
  { id: "all-market-days", label: "All market days", hint: "Runs on every trading session" },
  { id: "custom", label: "Specific weekdays", hint: "Choose exact days manually" },
] as const;

const RUN_TIMING_OPTIONS = [
  { id: "every-1m", label: "Every 1 min" },
  { id: "every-5m", label: "Every 5 mins" },
  { id: "every-15m", label: "Every 15 mins" },
  { id: "specific-time", label: "Specific time of day" },
] as const;

const WEEKDAY_OPTIONS = [
  { id: "mon", label: "Mon" },
  { id: "tue", label: "Tue" },
  { id: "wed", label: "Wed" },
  { id: "thu", label: "Thu" },
  { id: "fri", label: "Fri" },
  { id: "sat", label: "Sat" },
  { id: "sun", label: "Sun" },
] as const;

function formatMarketCapFromCr(valueCr?: number): string {
  if (!valueCr || valueCr <= 0) return "—";
  if (valueCr >= 100000) return `₹${(valueCr / 100000).toFixed(2)}L Cr`;
  return `₹${valueCr.toLocaleString("en-IN")} Cr`;
}

const CONSOLIDATION_BREAKOUT_PLAYBOOK = {
  hook: "Tight ranges are coiled springs. The longer price compresses, the more explosive the breakout — stocks routinely deliver 5-15% moves within days of breaking out of a multi-week range.",
  whyItWorks:
    "Institutional accumulation happens quietly inside ranges. When price finally breaks out on volume, it means big money has finished building positions and is ready to let the stock run. You're riding the same wave.",
  checklist: [
    "Range has held for at least 5-10 sessions (tighter = better)",
    "Breakout candle closes above range high, not just a wick",
    "Volume on breakout day is 1.5x+ the 20-day average",
    "Stock is in a higher timeframe uptrend (above 50 DMA)",
    "Sector is not in a broad selloff",
  ],
  entry:
    "Buy on a clean close above the range high with volume confirmation. If you miss the breakout candle, wait for a pullback to the breakout level — if it holds as support on lower volume, that's your second entry.",
  exit:
    "Book 50% at 1R (risk = entry minus stop). Trail the rest with a stop below each new higher low. If the stock closes back inside the range on any day, exit everything — the setup has failed.",
  stopLoss:
    "Place stop just below the breakout candle's low. For retest entries, use the retest low. Keep risk to 0.5-1% of capital per trade — this is non-negotiable.",
  holdingPeriod:
    "Intraday breakouts: 30 min to session end. Swing setups: 3-10 sessions. If price stalls sideways for 2-3 candles after breakout, reduce position by half — momentum is fading.",
  riskReward:
    "Only take setups with at least 1:2 risk-reward. Best consolidation breakouts offer 1:3 to 1:5. The math: win 50% of trades at 1:3 and you're up 100% on risk over 10 trades.",
  proTip:
    "The best breakouts don't look back. If a stock retests the breakout level multiple times, it's a sign of weak demand — skip it. Chase the stocks that break and go.",
} as const;

const CONSOLIDATION_ARTICLE_CONTENT = {
  intro:
    "A consolidation breakout strategy is one of the most reliable momentum setups in the Indian stock market. Price compresses inside a defined range, volatility drops, and then a decisive move above resistance can begin a fresh trend leg. This setup is popular among swing traders because it offers clear structure, disciplined risk placement, and repeatable execution.",
  sections: [
    {
      title: "Market Structure Behind Consolidation Breakouts",
      paragraphs: [
        "Consolidation typically reflects balance: buyers and sellers are active, but neither side has enough conviction to create trend extension. On charts, this appears as a horizontal range, tight candles, and reduced intraday expansion.",
        "When institutions finish accumulating within this base, a close above resistance with strong participation often shifts the market from balance to imbalance. That transition is where breakout traders look for opportunity.",
      ],
    },
    {
      title: "How to Identify High-Quality Breakouts",
      paragraphs: [
        "Not every resistance breakout is tradable. Quality setups show clean range definition, improving relative strength versus peers, and visible volume expansion on the breakout candle. The more time price spends building a tight base, the higher the probability of a meaningful move.",
      ],
      checklist: [
        "Range duration is at least 5 to 10 candles with repeated rejection near resistance.",
        "Breakout is confirmed on closing basis, not only intraday wick above the level.",
        "Volume on breakout day is at least 1.5x the recent average.",
        "Broader market and sector trend are neutral-to-bullish, not in distribution.",
      ],
    },
    {
      title: "Trade Management: Entry, Stop-Loss, and Exit Framework",
      paragraphs: [
        "Execution can be done either on the breakout close or on a retest that holds above the broken resistance. The retest approach usually improves risk-reward, while direct breakout entries capture momentum early.",
        "A practical stop-loss sits below the breakout candle low or retest swing low. If price closes back inside the old range, the breakout thesis weakens and capital protection becomes the priority. Partial profit-taking at 1R and trailing the remaining position below higher lows helps protect gains while allowing trend continuation.",
      ],
    },
    {
      title: "Common Traps and Risk Controls for Retail Traders",
      paragraphs: [
        "The most expensive mistake is chasing an extended breakout candle after the initial expansion move. Late entries increase stop distance and reduce expectancy. Another frequent error is trading low-volume breakouts in weak sectors where follow-through is limited.",
        "Professional risk control remains simple: fixed per-trade risk, strict invalidation, and no averaging down if the setup fails. Over a sample of trades, discipline matters more than predicting every single breakout correctly.",
      ],
    },
  ],
} as const;

const CONSOLIDATION_BREAKOUT_CASE_STUDIES = [
  {
    stock: "Ajanta Pharma (NSE: AJANTPHARM)",
    setup:
      "Consolidation breakout observed after buyers repeatedly defended the 2300-2400 zone, with strong bullish candles around support.",
    happened:
      "Price expanded above the consolidation structure and the author later marked the setup as target reached.",
    reward: "Outcome shared as successful breakout follow-through (target reached update).",
    sourceUrl: "https://in.tradingview.com/chart/AJANTPHARM/V5yIKutm-Consolidation-breakout-seen-in-ajanta-pharma/",
    chartUrl:
      "https://s.tradingview.com/widgetembed/?frameElementId=tv-ajantapharm&symbol=NSE%3AAJANTPHARM&interval=D&hidesidetoolbar=1&symboledit=0&saveimage=0&toolbarbg=F1F3F6&theme=light&style=1&timezone=Asia%2FKolkata&studies=[]&hideideas=1&withdateranges=1&hidevolume=0&locale=en&utm_source=localhost&utm_medium=widget&utm_campaign=chart&utm_term=NSE%3AAJANTPHARM",
  },
  {
    stock: "Ramkrishna Forgings (NSE: RKFORGE)",
    setup:
      "Six-month rectangle consolidation (Jan-Jun 2025) with compressed volatility, followed by a wide-range breakout candle and volume spike.",
    happened:
      "Breakout attempt triggered above the base with participation; the analysis mapped staged upside zones post-breakout.",
    reward: "Projected reward bands: ~15% (750-760), ~30% (850-880), and up to ~50% (980-1000).",
    sourceUrl: "https://in.tradingview.com/chart/RKFORGE/IrbwLzyy-RKF-Massive-Breakout-After-6-Month-Consolidation/",
    chartUrl:
      "https://s.tradingview.com/widgetembed/?frameElementId=tv-rkforge&symbol=NSE%3ARKFORGE&interval=D&hidesidetoolbar=1&symboledit=0&saveimage=0&toolbarbg=F1F3F6&theme=light&style=1&timezone=Asia%2FKolkata&studies=[]&hideideas=1&withdateranges=1&hidevolume=0&locale=en&utm_source=localhost&utm_medium=widget&utm_campaign=chart&utm_term=NSE%3ARKFORGE",
  },
  {
    stock: "Lupin (NSE: LUPIN)",
    setup:
      "Five-month consolidation breakout after a long-term base, supported by trend filters and momentum alignment in the shared analysis.",
    happened:
      "Breakout was triggered and later marked as trade active, with continuation bias as long as structure held.",
    reward: "Potential reward discussed around 65-70% (CMP 2360 toward 3400 in the source idea).",
    sourceUrl: "https://in.tradingview.com/chart/LUPIN/lCWCHUYU-LUPIN-5-Months-Consolidation-breakout/",
    chartUrl:
      "https://s.tradingview.com/widgetembed/?frameElementId=tv-lupin&symbol=NSE%3ALUPIN&interval=D&hidesidetoolbar=1&symboledit=0&saveimage=0&toolbarbg=F1F3F6&theme=light&style=1&timezone=Asia%2FKolkata&studies=[]&hideideas=1&withdateranges=1&hidevolume=0&locale=en&utm_source=localhost&utm_medium=widget&utm_campaign=chart&utm_term=NSE%3ALUPIN",
  },
  {
    stock: "TVS Motor (NSE: TVSMOTOR)",
    setup:
      "52-week breakout after consolidation, confirmed by a strong bullish candle, RSI breakout, Bollinger expansion, and elevated volume.",
    happened:
      "Price moved into expansion-phase behavior with breakout level around 3658 becoming the reference pivot for continuation.",
    reward: "Near-term follow-through zones discussed around 3683-3712-3765 after the breakout confirmation.",
    sourceUrl: "https://in.tradingview.com/chart/TVSMOTOR/qkfBvPlg-TVS-Motor-52-Week-Breakout-Case-Study/",
    chartUrl:
      "https://s.tradingview.com/widgetembed/?frameElementId=tv-tvsmotor&symbol=NSE%3ATVSMOTOR&interval=D&hidesidetoolbar=1&symboledit=0&saveimage=0&toolbarbg=F1F3F6&theme=light&style=1&timezone=Asia%2FKolkata&studies=[]&hideideas=1&withdateranges=1&hidevolume=0&locale=en&utm_source=localhost&utm_medium=widget&utm_campaign=chart&utm_term=NSE%3ATVSMOTOR",
  },
  {
    stock: "Sterlite Technologies (NSE: STLTECH)",
    setup:
      "Multi-year base and downtrend-line breakout with exceptionally high volume (described as 12x average) in the source analysis.",
    happened:
      "Breakout candle closed strong and shifted structure from range-bound behavior toward trend initiation.",
    reward: "Illustrated upside path: initial 140-145, then 175-180, with 200+ as extended objective.",
    sourceUrl: "https://in.tradingview.com/chart/STLTECH/vcPBTvwI-Sterlite-Tech-From-Despair-to-Breakout-A-Textbook-Turnaround/",
    chartUrl:
      "https://s.tradingview.com/widgetembed/?frameElementId=tv-stltech&symbol=NSE%3ASTLTECH&interval=W&hidesidetoolbar=1&symboledit=0&saveimage=0&toolbarbg=F1F3F6&theme=light&style=1&timezone=Asia%2FKolkata&studies=[]&hideideas=1&withdateranges=1&hidevolume=0&locale=en&utm_source=localhost&utm_medium=widget&utm_campaign=chart&utm_term=NSE%3ASTLTECH",
  },
] as const;

function breakoutArticleImage(kind: "range" | "breakout"): string {
  const svg =
    kind === "range"
      ? `<svg xmlns='http://www.w3.org/2000/svg' width='640' height='220' viewBox='0 0 640 220'>
          <rect width='640' height='220' fill='#ffffff'/>
          <rect x='64' y='70' width='512' height='90' rx='8' fill='#f8f7fb' stroke='#d9d2e8' stroke-width='2'/>
          <line x1='64' y1='70' x2='576' y2='70' stroke='#9c7ec3' stroke-dasharray='6 6' stroke-width='2'/>
          <line x1='64' y1='160' x2='576' y2='160' stroke='#9c7ec3' stroke-dasharray='6 6' stroke-width='2'/>
          <polyline points='80,128 120,122 160,132 200,118 240,126 280,121 320,129 360,120 400,127 440,123 480,130 520,124 560,129'
            fill='none' stroke='#5b21b6' stroke-width='3'/>
          <text x='74' y='58' font-size='12' fill='#5b21b6' font-family='sans-serif'>Resistance</text>
          <text x='74' y='177' font-size='12' fill='#5b21b6' font-family='sans-serif'>Support</text>
        </svg>`
      : `<svg xmlns='http://www.w3.org/2000/svg' width='640' height='220' viewBox='0 0 640 220'>
          <rect width='640' height='220' fill='#ffffff'/>
          <line x1='64' y1='110' x2='576' y2='110' stroke='#9c7ec3' stroke-dasharray='6 6' stroke-width='2'/>
          <polyline points='80,145 120,140 160,146 200,138 240,143 280,141 320,144 360,137 400,130 440,108 480,86 520,72 560,60'
            fill='none' stroke='#16a34a' stroke-width='3'/>
          <circle cx='440' cy='108' r='5' fill='#5b21b6'/>
          <text x='450' y='104' font-size='12' fill='#5b21b6' font-family='sans-serif'>Breakout close</text>
          <rect x='432' y='120' width='16' height='42' fill='#86efac' stroke='#16a34a'/>
          <text x='455' y='147' font-size='12' fill='#166534' font-family='sans-serif'>Volume expansion</text>
        </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function ScannerDetailPage() {
  const { id } = useParams();
  const scanner = PRE_BUILT_SCANNERS.find((s) => s.id === id);
  const [playbookOpen, setPlaybookOpen] = useState(false);
  const [filtersAppliedOpen, setFiltersAppliedOpen] = useState(false);
  const [expandedFilterRows, setExpandedFilterRows] = useState<Record<string, boolean>>({});
  const [sortBy, setSortBy] = useState<"rank" | "change" | "volume">("rank");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [alertsDialogOpen, setAlertsDialogOpen] = useState(false);
  const [runDaysMode, setRunDaysMode] = useState<(typeof RUN_DAY_OPTIONS)[number]["id"]>("all-market-days");
  const [runTimingMode, setRunTimingMode] = useState<(typeof RUN_TIMING_OPTIONS)[number]["id"]>("every-5m");
  const [specificTime, setSpecificTime] = useState("09:20");
  const [customDays, setCustomDays] = useState<string[]>(["mon", "tue", "wed", "thu", "fri"]);
  const [alertsSaved, setAlertsSaved] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  if (!scanner) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-16 text-center">
        <p className="text-muted-foreground">Scanner not found.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/scanners"><ArrowLeft className="w-4 h-4 mr-2" />Back to Scanners</Link>
        </Button>
      </div>
    );
  }

  const isPlus = scanner.plan === "plus";
  const results = MOCK_SCAN_RESULTS.slice(0, scanner.resultCount > 12 ? 12 : scanner.resultCount);

  const sorted = [...results].sort((a, b) => {
    let diff = 0;
    if (sortBy === "change") diff = a.change1d - b.change1d;
    else if (sortBy === "volume") diff = a.volume - b.volume;
    else diff = a.rank - b.rank;
    return sortDir === "asc" ? diff : -diff;
  });

  const handleSort = (col: "rank" | "change" | "volume") => {
    if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("asc"); }
  };

  const appliedFilterRows = [
    {
      id: "stock-universe",
      label: "Stock Universe",
      detail: "Nifty 500 stocks (fixed in this pre-built scanner).",
      highlight: false,
      kind: "base" as const,
    },
    {
      id: "sector",
      label: "Sector",
      detail: "All sectors enabled (no manual sector override).",
      highlight: false,
      kind: "base" as const,
    },
    ...scanner.indicators.map((indicator, idx) => ({
      id: `indicator-${idx}-${indicator.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      label: indicator,
      detail: `${indicator} condition is pre-configured and locked for this scanner.`,
      highlight: true,
      kind: "indicator" as const,
    })),
  ];

  function toggleCustomDay(dayId: string) {
    setCustomDays((prev) =>
      prev.includes(dayId) ? prev.filter((id) => id !== dayId) : [...prev, dayId]
    );
  }

  function alertsScheduleSummary() {
    const runDaysLabel =
      runDaysMode === "all-market-days"
        ? "All market days"
        : customDays.length > 0
            ? WEEKDAY_OPTIONS.filter((d) => customDays.includes(d.id))
                .map((d) => d.label)
                .join(", ")
            : "No weekdays selected";

    const timingLabel =
      runTimingMode === "every-1m"
        ? "Every 1 min"
        : runTimingMode === "every-5m"
          ? "Every 5 mins"
          : runTimingMode === "every-15m"
            ? "Every 15 mins"
            : `At ${specificTime}`;

    return `${runDaysLabel} • ${timingLabel}`;
  }

  function saveAlertSchedule() {
    setAlertsSaved(true);
    setAlertsDialogOpen(false);
  }

  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link to="/scanners" className="hover:text-primary flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />Scanners
        </Link>
        <span>/</span>
        <span className="text-foreground">{scanner.name}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-4">
        {/* Left: Scanner info + education */}
        <div className="space-y-4 lg:w-[420px] lg:shrink-0">
          {/* Scanner header card */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <Badge className={`text-xs px-2 h-5 border-0 ${PERSONA_COLORS[scanner.persona]}`}>
                  {PERSONA_LABELS[scanner.persona]}
                </Badge>
                {isPlus && (
                  <Badge className="text-xs px-2 h-5 bg-gradient-to-r from-[#542087] to-[#7c3abf] text-white border-0">
                    <Zap className="w-2.5 h-2.5 mr-1" />PLUS
                  </Badge>
                )}
              </div>
              <h1 className="text-xl font-bold text-foreground mb-2">{scanner.name}</h1>
              <p className="text-sm text-muted-foreground mb-4">{CONSOLIDATION_BREAKOUT_PLAYBOOK.hook}</p>
              <div className="rounded-lg bg-primary/10 border border-primary/20 p-3 mb-3">
                <p className="text-xs font-semibold text-primary flex items-center gap-1.5 mb-1">
                  <Flame className="w-3.5 h-3.5" />
                  The Edge
                </p>
                <p className="text-xs text-primary/90 leading-relaxed">
                  {CONSOLIDATION_BREAKOUT_PLAYBOOK.whyItWorks}
                </p>
              </div>

              {scanner.activeWindow && (
                <div className="flex items-center gap-2 text-xs bg-orange-50 text-orange-700 rounded-lg p-2.5 mb-4">
                  <Timer className="w-3.5 h-3.5 shrink-0" />
                  <span>{scanner.activeWindow.label}</span>
                </div>
              )}

            </CardContent>
          </Card>

          {/* Strategy playbook */}
          <Card>
            <CardContent className="p-5 space-y-4">
              <button
                onClick={() => setPlaybookOpen((prev) => !prev)}
                className="w-full flex items-center justify-between text-left"
              >
                <p className="text-sm font-semibold flex items-center gap-2 text-foreground">
                  <BookOpen className="w-4 h-4 text-primary" />
                  Playbook
                </p>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-muted-foreground transition-transform duration-200",
                    playbookOpen && "rotate-180"
                  )}
                />
              </button>

              {playbookOpen && (
                <>
                  <div className="space-y-4">
                    <div className="flex gap-2.5">
                      <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Target className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground mb-1">Pre-trade checklist</p>
                        <ul className="space-y-1.5">
                          {CONSOLIDATION_BREAKOUT_PLAYBOOK.checklist.map((item, i) => (
                            <li key={i} className="flex gap-2 text-xs text-muted-foreground leading-relaxed">
                              <span className="text-primary mt-0.5 shrink-0">&#10003;</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <EducationItem icon={Crosshair} label="When to enter" text={CONSOLIDATION_BREAKOUT_PLAYBOOK.entry} />
                    <EducationItem icon={LogOut} label="When to exit" text={CONSOLIDATION_BREAKOUT_PLAYBOOK.exit} />
                    <EducationItem icon={ShieldAlert} label="Stop-loss rules" text={CONSOLIDATION_BREAKOUT_PLAYBOOK.stopLoss} />
                    <EducationItem icon={Timer} label="Holding period" text={CONSOLIDATION_BREAKOUT_PLAYBOOK.holdingPeriod} />
                    <EducationItem icon={DollarSign} label="Risk : Reward" text={CONSOLIDATION_BREAKOUT_PLAYBOOK.riskReward} />
                  </div>

                  {/* Pro tip */}
                  <div className="rounded-lg bg-primary/10 border border-primary/20 p-3">
                    <p className="text-xs font-semibold text-primary flex items-center gap-1.5 mb-1">
                      <Zap className="w-3.5 h-3.5" />
                      Pro tip
                    </p>
                    <p className="text-xs text-primary/90 leading-relaxed">
                      {CONSOLIDATION_BREAKOUT_PLAYBOOK.proTip}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">Was this helpful?</p>
                    <div className="flex gap-2">
                      <button className="text-xs px-2 py-1 rounded bg-green-50 text-green-700 hover:bg-green-100 transition-colors">Yes</button>
                      <button className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground hover:bg-border transition-colors">No</button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Filters applied */}
          <Card>
            <CardContent className="p-0">
              <button
                onClick={() => setFiltersAppliedOpen((prev) => !prev)}
                className="w-full px-4 py-3 flex items-center justify-between text-left"
              >
                <p className="text-sm font-semibold text-muted-foreground">Filters Applied</p>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-muted-foreground transition-transform duration-200",
                    filtersAppliedOpen && "rotate-180"
                  )}
                />
              </button>

              {filtersAppliedOpen && (
                <div className="border-t border-border/60">
                  {appliedFilterRows.map((row) => {
                    const rowOpen = Boolean(expandedFilterRows[row.id]);
                    const ruleLabel =
                      row.kind === "indicator" && /volume/i.test(row.label)
                        ? "Higher than"
                        : row.kind === "indicator" && /close/i.test(row.label)
                          ? "Custom range"
                          : "Higher than";
                    const benchmarkOptions =
                      row.kind === "indicator" && /close/i.test(row.label)
                        ? ["% from 52W High", "% from 52W Low", "% from EMA", "Value"]
                        : ["% from 52W High", "% from 52W Low", "Value"];
                    return (
                      <div key={row.id} className="border-b border-border/60 last:border-b-0">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedFilterRows((prev) => ({
                              ...prev,
                              [row.id]: !prev[row.id],
                            }))
                          }
                          className="w-full px-4 py-4 flex items-center justify-between text-left"
                        >
                          <div className="min-w-0 flex-1">
                            <span className="text-sm font-semibold text-foreground">
                              {row.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <ChevronDown
                              className={cn(
                                "w-4 h-4 text-muted-foreground transition-transform duration-200",
                                rowOpen && "rotate-180"
                              )}
                            />
                          </div>
                        </button>
                        {rowOpen && (
                          <div className="px-4 pb-4">
                            {row.kind === "base" ? (
                              <p className="text-xs text-muted-foreground leading-relaxed">{row.detail}</p>
                            ) : (
                              <div className="space-y-3 border-t border-border/60 pt-3">
                                <div className="grid grid-cols-[1fr_auto_auto] gap-2 items-end">
                                  <div className="rounded-md border border-border px-3 py-2 bg-muted/20">
                                    <p className="text-[10px] text-muted-foreground mb-0.5">Indicator</p>
                                    <p className="text-sm text-foreground">{row.label} (20, 2)</p>
                                  </div>
                                  <div className="h-[42px] w-[42px] rounded-md border border-border bg-background inline-flex items-center justify-center text-muted-foreground">
                                    <SlidersHorizontal className="w-4 h-4" />
                                  </div>
                                  <div className="rounded-md border border-border px-3 py-2 bg-muted/20 min-w-[108px]">
                                    <p className="text-[10px] text-muted-foreground mb-0.5">Timeframe</p>
                                    <p className="text-sm text-foreground">Daily</p>
                                  </div>
                                </div>

                                <div>
                                  <p className="text-sm font-medium text-foreground mb-1.5">Rule</p>
                                  <div className="inline-flex min-w-[150px] h-9 rounded-md border border-primary text-primary bg-primary/5 text-sm font-medium items-center justify-center px-3">
                                    {ruleLabel}
                                  </div>
                                </div>

                                <div>
                                  <p className="text-sm font-medium text-foreground mb-1.5">Benchmark parameter</p>
                                  <div className="inline-flex items-center gap-2 text-sm text-foreground">
                                    <span className="inline-flex h-4 w-4 rounded-full border-[1.5px] border-primary items-center justify-center">
                                      <span className="h-2 w-2 rounded-full bg-primary" />
                                    </span>
                                    {benchmarkOptions[0]}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div className="px-4 py-4 border-t border-border/60">
                    <Button className="w-full" variant="outline">
                      Modify Screener
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Results table */}
        <div className="min-w-0 flex-1">
          <Card>
            <CardHeader className="p-4 pb-3 border-b border-border">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <CardTitle className="text-base font-semibold">
                    {isPlus ? "Upgrade to see results" : `${results.length} Stocks Matched`}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {isPlus ? "This scanner requires Plus plan" : `Updated ${scanner.lastUpdated} · Nifty 500`}
                  </p>
                </div>
                {!isPlus && (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className={cn(
                        "h-8 gap-1.5 text-xs",
                        alertsSaved
                          ? "bg-primary/10 text-primary border border-primary/30 hover:bg-primary/15"
                          : "bg-primary text-primary-foreground hover:bg-primary/90"
                      )}
                      onClick={() => setAlertsDialogOpen(true)}
                    >
                      <BellRing className="w-3.5 h-3.5" />
                      {alertsSaved ? "Alerts On" : "Alerts"}
                    </Button>
                    <Button size="sm" className="h-8 gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90">
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      Modify
                    </Button>
                    <Button size="sm" className="h-8 gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90">
                      <Target className="w-3.5 h-3.5" />
                      Follow
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 border-primary/30 text-primary bg-primary/5 hover:bg-primary/10"
                      aria-label="Share screener"
                      title="Share screener"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 border-primary/30 text-primary bg-primary/5 hover:bg-primary/10"
                      aria-label="Refresh results"
                      title="Refresh results"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>

            {isPlus ? (
              <CardContent className="p-0">
                <div className="overflow-x-auto border-b border-border/60">
                  <table className="w-full text-sm table-fixed">
                    <colgroup>
                      <col className="w-8" />
                      <col className="w-[24%]" />
                      <col className="w-[17%]" />
                      <col className="w-[15%]" />
                      <col className="w-[15%]" />
                      <col className="w-[13%]" />
                      <col className="w-[16%]" />
                    </colgroup>
                    <thead>
                      <tr className="bg-muted/40 border-b border-border">
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground w-8">#</th>
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Stock</th>
                        <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground">Price (₹)</th>
                        <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground">1D Chg%</th>
                        <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground">Volume</th>
                        <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground">Market Cap</th>
                        <th className="text-right px-3 py-2.5 text-xs font-semibold text-muted-foreground">Watch</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sorted.slice(0, 1).map((row) => (
                        <tr key={`plus-visible-${row.symbol}`} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 text-xs text-muted-foreground">{row.rank}</td>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-sm text-foreground">{row.symbol}</div>
                            <div className="text-xs text-muted-foreground truncate">{row.company}</div>
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-sm text-foreground">
                            ₹{row.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={cn("text-sm font-semibold", row.change1d >= 0 ? "text-green-600" : "text-red-600")}>
                              {row.change1d >= 0 ? "+" : ""}{row.change1d.toFixed(2)}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-foreground">
                            {formatVolume(row.volume)}
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-foreground tabular-nums">
                            {formatMarketCapFromCr(MARKET_CAP_BY_SYMBOL_CR[row.symbol])}
                          </td>
                          <td className="px-3 py-3 text-right">
                            <Button variant="outline" size="sm" className="h-7 px-2 text-xs">Watch</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="relative">
                  <div className="overflow-x-auto blur-[2px] select-none pointer-events-none">
                    <table className="w-full text-sm table-fixed">
                      <colgroup>
                        <col className="w-8" />
                        <col className="w-[24%]" />
                        <col className="w-[17%]" />
                        <col className="w-[15%]" />
                        <col className="w-[15%]" />
                        <col className="w-[13%]" />
                        <col className="w-[16%]" />
                      </colgroup>
                      <tbody className="divide-y divide-border/60">
                        {sorted.slice(1, 8).map((row) => (
                          <tr key={`plus-blur-${row.symbol}`}>
                            <td className="px-4 py-3 text-xs text-muted-foreground">{row.rank}</td>
                            <td className="px-4 py-3">
                              <div className="font-semibold text-sm text-foreground">{row.symbol}</div>
                              <div className="text-xs text-muted-foreground truncate">{row.company}</div>
                            </td>
                            <td className="px-4 py-3 text-right font-medium text-sm text-foreground">
                              ₹{row.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-4 py-3 text-right text-sm font-semibold">{row.change1d.toFixed(2)}%</td>
                            <td className="px-4 py-3 text-right text-sm text-foreground">{formatVolume(row.volume)}</td>
                            <td className="px-4 py-3 text-right text-sm text-foreground tabular-nums">
                              {formatMarketCapFromCr(MARKET_CAP_BY_SYMBOL_CR[row.symbol])}
                            </td>
                            <td className="px-3 py-3 text-right text-sm text-muted-foreground">Locked</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center px-4">
                    <div className="rounded-xl border border-primary/30 bg-background/95 shadow-sm px-5 py-4 text-center max-w-sm">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                        <Lock className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-1">Plus Plan Required</h3>
                      <p className="text-xs text-muted-foreground mb-3">
                        Unlock all remaining stock results for this scanner.
                      </p>
                      <Button className="bg-gradient-to-r from-[#542087] to-[#7c3abf] h-8 text-xs">
                        <Zap className="w-3.5 h-3.5 mr-1.5" />Upgrade to Plus
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm table-fixed">
                    <colgroup>
                      <col className="w-8" />
                      <col className="w-[24%]" />
                      <col className="w-[17%]" />
                      <col className="w-[15%]" />
                      <col className="w-[15%]" />
                      <col className="w-[13%]" />
                      <col className="w-[16%]" />
                    </colgroup>
                    <thead>
                      <tr className="bg-muted/40 border-b border-border">
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground w-8">#</th>
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Stock</th>
                        <th
                          className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground cursor-pointer hover:text-foreground"
                          onClick={() => handleSort("rank")}
                        >
                          Price (₹)
                        </th>
                        <th
                          className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground cursor-pointer hover:text-foreground"
                          onClick={() => handleSort("change")}
                        >
                          1D Chg% {sortBy === "change" && (sortDir === "asc" ? "↑" : "↓")}
                        </th>
                        <th
                          className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground cursor-pointer hover:text-foreground"
                          onClick={() => handleSort("volume")}
                        >
                          Volume {sortBy === "volume" && (sortDir === "asc" ? "↑" : "↓")}
                        </th>
                        <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground">Market Cap</th>
                        <th className="text-right px-3 py-2.5 text-xs font-semibold text-muted-foreground">Watch</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {sorted.map((row) => (
                        <tr key={row.symbol} className="hover:bg-muted/30 transition-colors group">
                          <td className="px-4 py-3 text-xs text-muted-foreground">{row.rank}</td>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-sm text-foreground">{row.symbol}</div>
                            <div className="text-xs text-muted-foreground truncate">{row.company}</div>
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-sm text-foreground">
                            ₹{row.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={cn(
                              "text-sm font-semibold flex items-center justify-end gap-0.5",
                              row.change1d >= 0 ? "text-green-600" : "text-red-600"
                            )}>
                              {row.change1d >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                              {row.change1d >= 0 ? "+" : ""}{row.change1d.toFixed(2)}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-foreground">
                            {formatVolume(row.volume)}
                            <div className="text-xs text-muted-foreground">
                              {(row.volume / row.volumeAvg).toFixed(1)}x avg
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-foreground tabular-nums">
                            {formatMarketCapFromCr(MARKET_CAP_BY_SYMBOL_CR[row.symbol])}
                          </td>
                          <td className="px-3 py-3 text-right">
                            <div className="flex w-full items-center justify-end gap-1.5">
                              <div className="flex min-w-0 shrink items-center justify-end gap-1 opacity-0 pointer-events-none transition-opacity group-hover:opacity-100 group-hover:pointer-events-auto">
                                <button
                                  type="button"
                                  className="h-7 min-w-7 px-1.5 rounded-md border border-[#008858]/30 text-[#008858] text-[11px] font-semibold hover:bg-[#DEF5ED]"
                                  title="Buy"
                                >
                                  B
                                </button>
                                <button
                                  type="button"
                                  className="h-7 min-w-7 px-1.5 rounded-md border border-[#D53627]/30 text-[#D53627] text-[11px] font-semibold hover:bg-[#FCE7E7]"
                                  title="Sell"
                                >
                                  S
                                </button>
                                <button
                                  type="button"
                                  className="h-7 w-7 shrink-0 rounded-md border border-border text-muted-foreground inline-flex items-center justify-center hover:text-foreground hover:bg-muted"
                                  title="Option chain"
                                  aria-label={`Open option chain for ${row.symbol}`}
                                >
                                  <Layers className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  className="h-7 w-7 shrink-0 rounded-md border border-border text-muted-foreground inline-flex items-center justify-center hover:text-foreground hover:bg-muted"
                                  title="Open chart"
                                  aria-label={`Open chart for ${row.symbol}`}
                                >
                                  <BarChart3 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                              <button
                                type="button"
                                title="Add to watchlist"
                                aria-label={`Add ${row.symbol} to watchlist`}
                                className="h-7 w-7 shrink-0 rounded-full border border-[#542087] text-[#542087] inline-flex items-center justify-center hover:bg-[#F5F2F9]"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Gate for anonymous: show teaser for non-logged in */}
                <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Info className="w-3.5 h-3.5" />
                    Showing {results.length} of {scanner.resultCount} matches · Nifty 500
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={(results.length / scanner.resultCount) * 100} className="w-20 h-1.5" />
                    <span className="text-xs text-muted-foreground">{scanner.resultCount} total</span>
                  </div>
                </div>
              </>
            )}
          </Card>

          <Dialog open={alertsDialogOpen} onOpenChange={setAlertsDialogOpen}>
            <DialogContent className="sm:max-w-lg max-h-[min(90vh,680px)] overflow-y-auto gap-0 p-0">
              <DialogHeader className="p-6 pb-4 text-left border-b border-border/60">
                <DialogTitle className="text-lg">Configure Alerts</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
                  Choose when this scanner should run and alert you about new matches.
                </DialogDescription>
              </DialogHeader>

              <div className="px-6 py-4 space-y-5">
                <section className="space-y-2">
                  <h3 className="text-sm font-semibold text-foreground">Scan Run Schedule</h3>
                  <p className="text-xs text-muted-foreground">Days on which this scanner should run</p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {RUN_DAY_OPTIONS.map((option) => (
                      <label
                        key={option.id}
                        className={cn(
                          "flex items-start gap-2 rounded-lg border p-2.5 cursor-pointer transition-colors min-h-[98px]",
                          runDaysMode === option.id ? "border-primary/50 bg-primary/5" : "border-border/80 hover:bg-muted/40"
                        )}
                      >
                        <input
                          type="radio"
                          name="run-days"
                          checked={runDaysMode === option.id}
                          onChange={() => setRunDaysMode(option.id)}
                          className="mt-1 accent-primary"
                        />
                        <span className="min-w-0">
                          <span className="text-sm font-medium text-foreground block leading-5">{option.label}</span>
                          <span className="text-xs text-muted-foreground leading-4">{option.hint}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </section>

                {runDaysMode === "custom" && (
                  <section className="space-y-2">
                    <p className="text-xs text-muted-foreground">Select weekdays</p>
                    <div className="flex flex-wrap gap-2">
                      {WEEKDAY_OPTIONS.map((day) => {
                        const selected = customDays.includes(day.id);
                        return (
                          <button
                            key={day.id}
                            type="button"
                            onClick={() => toggleCustomDay(day.id)}
                            className={cn(
                              "h-8 rounded-full border px-3 text-xs font-semibold transition-colors",
                              selected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-white text-foreground hover:border-primary/40"
                            )}
                          >
                            {day.label}
                          </button>
                        );
                      })}
                    </div>
                  </section>
                )}

                <section className="space-y-2">
                  <h3 className="text-sm font-semibold text-foreground">Timings</h3>
                  <p className="text-xs text-muted-foreground">How often this scanner should run</p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
                    {RUN_TIMING_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setRunTimingMode(option.id)}
                        className={cn(
                          "rounded-lg border px-3 py-2 text-left text-sm transition-colors min-h-[44px]",
                          runTimingMode === option.id
                            ? "border-primary/50 bg-primary/5 text-foreground font-medium"
                            : "border-border/80 text-muted-foreground hover:bg-muted/40"
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </section>

                {runTimingMode === "specific-time" && (
                  <section className="space-y-2">
                    <p className="text-xs text-muted-foreground">Run once daily at</p>
                    <Input
                      type="time"
                      step={60}
                      value={specificTime}
                      onChange={(e) => setSpecificTime(e.target.value)}
                      className="w-full sm:w-[220px]"
                    />
                  </section>
                )}

                <div className="rounded-md border border-primary/20 bg-primary/5 px-3 py-2">
                  <p className="text-[11px] font-medium text-primary">Pricing for this schedule</p>
                  <p className="text-xs text-primary/90 mt-0.5">Rs 10/day</p>
                  <p className="text-[11px] text-primary/80 mt-1">{alertsScheduleSummary()}</p>
                </div>
              </div>

              <DialogFooter className="p-4 sm:p-6 flex-row gap-2 justify-end border-t border-border/60 bg-muted/20">
                <Button type="button" variant="outline" onClick={() => setAlertsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={saveAlertSchedule}
                  disabled={runDaysMode === "custom" && customDays.length === 0}
                >
                  Save schedule
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {alertsSaved && (
            <p className="mt-2 text-xs text-muted-foreground">
              Alerts configured: {alertsScheduleSummary()}
            </p>
          )}

          <Card className="mt-4">
            <CardHeader className="p-5 pb-3 border-b border-border/60">
              <CardTitle className="text-lg font-semibold text-foreground">Consolidation Breakout Guide</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                A practical long-form guide to spotting high-probability breakout setups and managing them with discipline.
              </p>
            </CardHeader>
            <CardContent className="p-5 space-y-6">
              <section className="space-y-2">
                <p className="text-sm text-muted-foreground leading-relaxed">{CONSOLIDATION_ARTICLE_CONTENT.intro}</p>
                <img
                  src={breakoutArticleImage("range")}
                  alt="Consolidation range with support and resistance"
                  className="w-full rounded-lg border border-border/60 bg-white"
                  loading="lazy"
                />
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">{CONSOLIDATION_ARTICLE_CONTENT.sections[0].title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{CONSOLIDATION_ARTICLE_CONTENT.sections[0].paragraphs[0]}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{CONSOLIDATION_ARTICLE_CONTENT.sections[0].paragraphs[1]}</p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">{CONSOLIDATION_ARTICLE_CONTENT.sections[1].title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{CONSOLIDATION_ARTICLE_CONTENT.sections[1].paragraphs[0]}</p>
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  {CONSOLIDATION_ARTICLE_CONTENT.sections[1].checklist?.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">{CONSOLIDATION_ARTICLE_CONTENT.sections[2].title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{CONSOLIDATION_ARTICLE_CONTENT.sections[2].paragraphs[0]}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{CONSOLIDATION_ARTICLE_CONTENT.sections[2].paragraphs[1]}</p>
                <img
                  src={breakoutArticleImage("breakout")}
                  alt="Breakout with volume expansion"
                  className="w-full rounded-lg border border-border/60 bg-white"
                  loading="lazy"
                />
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">{CONSOLIDATION_ARTICLE_CONTENT.sections[3].title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{CONSOLIDATION_ARTICLE_CONTENT.sections[3].paragraphs[0]}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{CONSOLIDATION_ARTICLE_CONTENT.sections[3].paragraphs[1]}</p>
              </section>

              <section className="space-y-3 pt-1">
                <h3 className="text-base font-semibold text-foreground">Real Market Case Studies (Web-Sourced)</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  These examples compile publicly shared breakout studies and chart structures to show how consolidation breakouts play out across different sectors and timeframes.
                </p>

                <div className="space-y-4">
                  {CONSOLIDATION_BREAKOUT_CASE_STUDIES.map((study) => (
                    <article key={study.stock} className="rounded-lg border border-border/70 bg-white p-4">
                      <h4 className="text-sm font-semibold text-foreground">{study.stock}</h4>

                      <div className="mt-3 overflow-hidden rounded-md border border-border/60 bg-muted/10">
                        <iframe
                          src={study.chartUrl}
                          title={`${study.stock} chart`}
                          className="h-64 w-full"
                          loading="lazy"
                        />
                      </div>

                      <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                        <p><span className="font-medium text-foreground">Setup:</span> {study.setup}</p>
                        <p><span className="font-medium text-foreground">What happened:</span> {study.happened}</p>
                        <p><span className="font-medium text-foreground">Reward:</span> {study.reward}</p>
                      </div>

                      <a
                        href={study.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex text-xs font-medium text-primary hover:underline"
                      >
                        View source study
                      </a>
                    </article>
                  ))}
                </div>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function EducationItem({ icon: Icon, label, text }: { icon: React.ElementType; label: string; text: string }) {
  return (
    <div className="flex gap-2.5">
      <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-primary" />
      </div>
      <div>
        <p className="text-xs font-semibold text-foreground mb-0.5">{label}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

