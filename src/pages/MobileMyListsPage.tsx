import React, { useState, useEffect } from "react";
import { mobileColors as C, mobileButton, MOBILE_CANVAS_WIDTH } from "@/lib/mobileDesignSystem";

// ────────────────────────────────────────────────────────────────────────────
// Responsive helpers (desktop shell lives in this same file; mobile untouched)
// ────────────────────────────────────────────────────────────────────────────
function useIsDesktop(minWidth: number = 1024): boolean {
  const getInitial = () =>
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia(`(min-width: ${minWidth}px)`).matches
      : false;
  const [isDesktop, setIsDesktop] = useState<boolean>(getInitial);
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mql = window.matchMedia(`(min-width: ${minWidth}px)`);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    setIsDesktop(mql.matches);
    if (mql.addEventListener) mql.addEventListener("change", handler);
    else mql.addListener(handler);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", handler);
      else mql.removeListener(handler);
    };
  }, [minWidth]);
  return isDesktop;
}
import {
  Bell,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Plus,
  Search,
  Trash2,
  Pencil,
  Eye,
  Heart,
  Users,
  Lock,
  Globe,
  Settings,
  Sparkles,
  Wallet,
  X,
  Home,
  ListChecks,
  ShoppingCart,
  ArrowLeft,
  ArrowLeftRight,
  Briefcase,
  ArrowUpDown,
  MoreVertical,
  Wifi,
  Signal,
  BatteryFull,
  Compass,
  Wand2,
  Share2,
  Info,
  ArrowRight,
  Maximize2,
  Zap,
  TrendingUp,
  AlarmClock,
} from "lucide-react";

/**
 * Pixel replica of the Upstox "My Lists" watchlist screen.
 * Canvas: 360 × 800 (scrollable beyond viewport).
 * All values come from src/lib/mobileDesignSystem.ts.
 */
type TabKey = "Watchlist" | "Options" | "Screeners";
type View = "tabs" | "create" | "addFilter" | "discover";

type Filter = { label: string; value: string };

const SCAN_UNIVERSE_OPTIONS = [
  "Nifty 50", "F&O Stocks", "Sensex", "Nifty Next 50", "Nifty 100", "Nifty 200",
  "Nifty 500", "Nifty Midcap 50", "Nifty Midcap 100", "Nifty Midcap 150",
  "Nifty Midcap Select", "Nifty Total Market", "Nifty Smallcap 50",
  "Nifty Smallcap 100", "Nifty Smallcap 250", "Nifty Microcap 250",
  "Nifty MidSmallCap 400",
];

const SECTOR_OPTIONS = [
  "Aerospace & Defense","Automobiles","Aviation","Banks","Beverages","Cables",
  "Capital Goods","Capital Goods - Electrical Equipment","Capital Markets",
  "Castings, Forgings & Fastners","Chemicals","Commercial Services","Construction",
  "Consumer Goods","Consumer Services","Diamond, Gems and Jewellery","Diversified",
  "Education","Energy","Engineering Services","Financial Services","FMCG",
  "Food Products","Forest Materials","Healthcare","Healthcare Services",
  "Industrial Products","Information Technology","Insurance","Leisure Services",
  "Logistics & Cargo","Media","Metals & Mining","Oil & Gas","Packaging",
  "Petroleum Products","Power","Printing & Stationery","Realty","Retail","Steel",
  "Telecom","Telecomm Equipment & Infra Services","Textiles","Trading","Transport",
  "Transport Services","Utilities",
];

const INDUSTRY_OPTIONS = [
  "Aerospace & Defense","Automobiles","Aviation","Banks","Beverages","Cables",
  "Capital Goods","Capital Goods - Electrical Equipment","Capital Markets",
  "Castings, Forgings & Fastners","Chemicals","Commercial Services","Construction",
  "Consumer Goods","Consumer Services","Diamond, Gems and Jewellery","Diversified",
  "Education","Energy","Engineering Services","Financial Services","FMCG",
  "Food Products","Forest Materials","Healthcare","Healthcare Services",
  "Industrial Products","Information Technology","Insurance","Leisure Services",
  "Logistics & Cargo","Media","Metals & Mining","Oil & Gas","Packaging",
  "Petroleum Products","Power","Printing & Stationery","Realty","Retail","Steel",
  "Telecom","Telecomm Equipment & Infra Services","Textiles","Trading","Transport",
  "Transport Services","Utilities",
];

function sectorLabel(s: string[]): string {
  if (s.length === 0 || s.length === SECTOR_OPTIONS.length) return "All sectors";
  if (s.length === 1) return s[0];
  return `${s.length} selected`;
}

function industryLabel(s: string[]): string {
  if (s.length === 0 || s.length === INDUSTRY_OPTIONS.length) return "All industries";
  if (s.length === 1) return s[0];
  return `${s.length} selected`;
}

export function MobileMyListsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("Watchlist");
  const [view, setView] = useState<View>("tabs");
  const [scanUniverse, setScanUniverse] = useState<string>("Nifty 50");
  const [industries, setIndustries] = useState<string[]>([]);
  const [sectors, setSectors] = useState<string[]>([]);
  const [extraFilters, setExtraFilters] = useState<Filter[]>([]);
  const filters: Filter[] = [
    { label: "Scan Universe", value: scanUniverse },
    { label: "Industry", value: industryLabel(industries) },
    { label: "Sector", value: sectorLabel(sectors) },
    ...extraFilters,
  ];

  const isDesktop = useIsDesktop();
  if (isDesktop) {
    return (
      <DesktopShell
        scanUniverse={scanUniverse}
        setScanUniverse={setScanUniverse}
        industries={industries}
        setIndustries={setIndustries}
        sectors={sectors}
        setSectors={setSectors}
        extraFilters={extraFilters}
        setExtraFilters={setExtraFilters}
        filters={filters}
      />
    );
  }

  return (
    <div className="min-h-screen w-full flex justify-center bg-neutral-100 py-8">
      <div
        className="relative overflow-hidden shadow-lg flex flex-col"
        style={{
          width: MOBILE_CANVAS_WIDTH,
          height: view === "tabs" ? undefined : 780,
          minHeight: 780,
          background: C.bgDefault,
          fontFamily: "'Inter', system-ui, sans-serif",
          color: C.textPrimary,
        }}
      >
        {view === "discover" ? (
          <>
            <StatusBar />
            <DiscoverScreenersScreen onBack={() => setView("tabs")} />
            <SystemBar />
          </>
        ) : view === "addFilter" ? (
          <>
            <StatusBar />
            <AddFilterScreen
              onBack={() => setView("create")}
              onDone={(f) => {
                if (f) setExtraFilters([...extraFilters, f]);
                setView("create");
              }}
            />
            <SystemBar />
          </>
        ) : view === "create" ? (
          <>
            <StatusBar />
            <CreateScannerScreen
              onBack={() => setView("tabs")}
              onAddFilter={() => setView("addFilter")}
              filters={filters}
              scanUniverse={scanUniverse}
              setScanUniverse={setScanUniverse}
              industries={industries}
              setIndustries={setIndustries}
              sectors={sectors}
              setSectors={setSectors}
              extraFilters={extraFilters}
              setExtraFilters={setExtraFilters}
            />
            <SystemBar />
          </>
        ) : (
          <>
            <TopGradientContainer />
            <Topbar />
            <Tabs activeTab={activeTab} onChange={setActiveTab} />
            {activeTab === "Watchlist" && (
              <>
                <ChipFilterRow />
                <WatchlistGroupOne />
                <WatchlistGroupTwo />
                <ActivationCard />
                <Newsfeed />
                <LoadMoreButton />
              </>
            )}
            {activeTab === "Options" && <EmptyTabBody />}
            {activeTab === "Screeners" && (
              <ScreenersEmptyState
                onCreate={() => setView("create")}
                onDiscover={() => setView("discover")}
              />
            )}
            {activeTab !== "Screeners" && <BottomFABs />}
            <BottomNav />
            <SystemBar />
          </>
        )}
      </div>
    </div>
  );
}

function EmptyTabBody() {
  return <div style={{ minHeight: 480, background: C.bgDefault }} />;
}

function PlusInlineBadge() {
  return (
    <span
      style={{
        fontFamily: "'Messina Sans', 'Inter', sans-serif",
        fontStyle: "italic",
        fontWeight: 700,
        fontSize: 11,
        lineHeight: "16px",
        color: C.plusPurple,
      }}
    >
      Plus
    </span>
  );
}

// ───── Add Filter picker ─────
const FILTER_CATEGORIES = [
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
];

type FilterItem = { name: string; plus?: boolean };
type FilterGroup = { group?: string; items: FilterItem[] };

const asFlat = (names: string[]): FilterGroup[] => [
  { items: names.map((n) => ({ name: n })) },
];

const CANDLESTICK_PATTERNS_LIST = [
  "Doji", "Hammer", "Inverted Hammer", "Spinning Top", "Marubozu",
  "Hanging Man", "Shooting Star", "Bullish Engulfing", "Bearish Engulfing",
  "Piercing Line", "Dark Cloud Cover", "Bullish Harami", "Bearish Harami",
  "Tweezer Top", "Tweezer Bottom", "Morning Star", "Evening Star",
  "Three White Soldiers", "Three Black Crows", "Three Inside Up", "Three Inside Down",
];

const VALUATION_PARAMS: string[] = [
  "Market Capitalization",
  "PE Ratio (TTM)",
  "Forward PE Ratio",
  "PB Ratio",
  "Industry PE",
  "Industry PB",
  "Price / Sales",
  "Industry PS",
  "Price to Quarterly Earning",
  "Price / Free Cash Flow",
  "Price / CFO",
  "Earnings yield",
  "Dividend Yield",
  "Industry Dividend Yield",
  "Enterprise Value",
  "EV/EBITDA Ratio",
  "EV / EBIT Ratio",
  "EV / Revenue Ratio",
  "EV / Invested Capital",
  "EV / Free Cash Flow",
  "Graham Number",
];

const PROFITABILITY_PARAMS: string[] = [
  "Return on assets",
  "Return on equity",
  "ROIC",
  "ROCE",
  "Return on capital employed preceding year",
  "Return on assets preceding year",
  "Return on equity preceding year",
  "Average return on equity 3Years",
  "Average return on equity 5Years",
  "Average return on equity 7Years",
  "Average return on equity 10Years",
  "Average return on capital employed 3Years",
  "Average return on capital employed 5Years",
  "Average return on capital employed 7Years",
  "Average return on capital employed 10Years",
  "Return on equity 5years growth",
  "Return on assets 3years",
  "Return on assets 5years",
  "OPM 5Year",
  "OPM 10Year",
  "Earning Power",
];

const BALANCE_SHEET_PARAMS: string[] = [
  "Debt to equity",
  "Financial leverage",
  "Quick ratio",
  "Book value",
  "Book value preceding year",
  "Book value 3years back",
  "Book value 5years back",
  "Book value 10years back",
  "Inventory turnover ratio",
  "Inventory turnover ratio 3Years back",
  "Inventory turnover ratio 5Years back",
  "Inventory turnover ratio 7Years back",
  "Inventory turnover ratio 10Years back",
  "Asset Turnover Ratio",
  "Working Capital Days",
  "Average Working Capital Days 3years",
  "Cash Conversion Cycle",
  "Days Payable Outstanding",
  "Days Receivable Outstanding",
  "Days Inventory Outstanding",
  "Debtor days",
  "Debtor days 3years back",
  "Debtor days 5years back",
  "Average debtor days 3years",
];

const INCOME_GROWTH_PARAMS: string[] = [
  "Average 5years dividend",
  "Average dividend payout 3years",
  "Exports percentage",
  "Exports percentage 3Years back",
  "Exports percentage 5Years back",
];

const QUALITY_SCORE_PARAMS: string[] = [
  "Piotroski score",
  "G Factor",
];

// Unit classifier. Returns one of: "" | "%" | "x" | "days" | "Cr" | "₹".
function paramUnit(name: string): string {
  if (/^(Close|Open|High|Low|Previous (Close|High|Low)|52-Week (High|Low)|All Time (High|Low)|Opening Range (High|Low))$/.test(name)) return "₹";
  if (/Return %|Relative Strength|^% from|Close Position in Range/.test(name)) return "%";
  if (/over n candles/.test(name)) return "";
  if (/^Graham Number/.test(name)) return "₹";
  if (/^Market Capitalization|^Enterprise Value|^Book value|^Earning Power/.test(name)) return "Cr";
  if (/[Dd]ays|^Cash Conversion Cycle|Working Capital Days/.test(name)) return "days";
  if (/^Piotroski score|^G Factor|^Number of/.test(name)) return "";
  if (/^(Fair Value|Future Close Price|Basis|Fair Value Spread|Rollover Cost|Calendar Spread|Highest .* Strike)$/.test(name)) return "₹";
  if (/^Cash & Carry Profit$|^Percentage Rollover$|^(1[DW]) Change in (Future OI|Future Volume|Call OI|Put OI)$/.test(name)) return "%";
  if (/^(Future Open Interest|Future Volume|Call Open Interest|Put Open Interest|Put Call Ratio|1D Change in Put Call Ratio)$/.test(name)) return "";
  if (/yield|Yield|percentage|[Oo]n assets|[Oo]n equity|[Oo]n capital|ROA|ROE|ROIC|ROCE|OPM|dividend payout|dividend$|Average 5years dividend|5years growth|Holding|Pledged Percentage/.test(name)) return "%";
  return "x";
}

const FILTER_ITEMS_BY_CATEGORY: Record<string, FilterGroup[]> = {
  Price: asFlat([
    "Close",
    "Open",
    "High",
    "Low",
    "Previous Close",
    "Previous High",
    "Previous Low",
    "52-Week High",
    "52-Week Low",
    "1D Return %",
    "1W Return %",
    "1M Return %",
    "3M Return %",
    "1Y Return %",
    "3Y Return %",
    "5Y Return %",
    "Relative Strength vs Nifty50",
    "Relative Strength vs Sector",
    "All Time High",
    "All Time Low",
    "% from SMA",
    "% from EMA",
    "% from 52W High",
    "% from 52W Low",
    "Close Position in Range %",
    "Opening Range High",
    "Opening Range Low",
    "High over n candles",
    "Low over n candles",
  ]),
  Technicals: [
    {
      group: "Moving Averages",
      items: [
        { name: "SMA" },
        { name: "EMA" },
      ],
    },
    {
      group: "Oscillators",
      items: [
        { name: "RSI" },
        { name: "Stochastic %K" },
        { name: "Stochastic %D" },
        { name: "StochRSI %K" },
        { name: "StochRSI %D", plus: true },
        { name: "Williams %R" },
        { name: "CCI" },
        { name: "ROC" },
        { name: "MFI", plus: true },
      ],
    },
    {
      group: "MACD",
      items: [
        { name: "MACD Line" },
        { name: "MACD Signal", plus: true },
        { name: "MACD Histogram" },
      ],
    },
    {
      group: "Trend",
      items: [
        { name: "ADX" },
        { name: "+DI" },
        { name: "-DI" },
        { name: "Parabolic SAR" },
        { name: "Ichimoku Tenkan" },
        { name: "Ichimoku Kijun", plus: true },
        { name: "Ichimoku Senkou A" },
        { name: "Ichimoku Senkou B", plus: true },
        { name: "Aroon Up" },
        { name: "Aroon Down" },
      ],
    },
    {
      group: "Volatility",
      items: [
        { name: "Bollinger Upper", plus: true },
        { name: "Bollinger Middle" },
        { name: "Bollinger Lower", plus: true },
        { name: "Bollinger Bandwidth" },
        { name: "ATR" },
        { name: "Supertrend" },
        { name: "Keltner Upper" },
        { name: "Keltner Lower" },
        { name: "Bollinger %B" },
        { name: "ATR %", plus: true },
        { name: "Donchian Upper", plus: true },
        { name: "Donchian Lower" },
        { name: "Historical Volatility" },
      ],
    },
    {
      group: "Pivot Levels",
      items: [
        { name: "Pivot Point" },
        { name: "Pivot R1" },
        { name: "Pivot R2" },
        { name: "Pivot R3", plus: true },
        { name: "Pivot S1", plus: true },
        { name: "Pivot S2", plus: true },
        { name: "Pivot S3" },
        { name: "Camarilla R1", plus: true },
        { name: "Camarilla R2", plus: true },
        { name: "Camarilla R3", plus: true },
        { name: "Camarilla R4" },
        { name: "Camarilla S1" },
        { name: "Camarilla S2" },
        { name: "Camarilla S3" },
        { name: "Camarilla S4" },
        { name: "CPR Upper" },
        { name: "CPR Lower" },
        { name: "CPR Width %", plus: true },
      ],
    },
    {
      group: "Setups",
      items: [
        { name: "EMA Cross (Bullish)" },
        { name: "EMA Cross (Bearish)" },
        { name: "SMA Cross (Bullish)" },
        { name: "SMA Cross (Bearish)" },
        { name: "MACD Bullish Crossover" },
        { name: "MACD Bearish Crossover" },
        { name: "RSI Oversold Reversal" },
        { name: "RSI Overbought Reversal" },
      ],
    },
  ],
  "Volume & Delivery": asFlat([
    "Volume",
    "Average Volume (20D)",
    "Delivery %",
    "Delivery Volume",
    "Volume vs Avg Volume",
  ]),
  Candlesticks: asFlat(CANDLESTICK_PATTERNS_LIST),
  "Financial Ratios": asFlat([
    "Current Ratio",
    "Interest Coverage",
    ...QUALITY_SCORE_PARAMS,
  ]),
  Profitability: asFlat([
    "Operating Margin",
    "Net Margin",
    "Gross Margin",
    "EBITDA Margin",
    ...PROFITABILITY_PARAMS,
  ]),
  "Income & Growth": asFlat([
    "Revenue",
    "Net Profit",
    "EBITDA",
    "5 year revenue growth",
    "1 year revenue growth",
    "5 year EPS growth",
    "1 year EPS growth",
    ...INCOME_GROWTH_PARAMS,
  ]),
  "Balance Sheet": asFlat([
    "Total Assets",
    "Total Liabilities",
    "Shareholder Equity",
    "Long Term Debt",
    "Short Term Debt",
    "Cash & Equivalents",
    ...BALANCE_SHEET_PARAMS,
  ]),
  "Cash Flow": asFlat([
    "Operating Cash Flow",
    "Investing Cash Flow",
    "Financing Cash Flow",
    "Free Cash Flow",
    "Capex",
  ]),
  Shareholding: asFlat([
    "Promoter Holding",
    "FII Holding",
    "DII Holding",
    "Public Holding",
    "Change in FII Holding",
    "Change in DII Holding",
    "Change in Promoter Holding",
    "Unpledged Promoter Holding",
    "Pledged Percentage",
    "Number of Shareholders",
    "Number of Shareholders preceding quarter",
    "Number of equity shares 10years back",
    "Change in FII Holding (3 Years)",
    "Change in DII Holding (3 Years)",
  ]),
  Valuation: asFlat(VALUATION_PARAMS),
  "Futures & Options": asFlat([
    "Fair Value",
    "Future Close Price",
    "Future Open Interest",
    "1D Change in Future OI",
    "1W Change in Future OI",
    "Future Volume",
    "1D Change in Future Volume",
    "1W Change in Future Volume",
    "Basis",
    "Fair Value Spread",
    "Cash & Carry Profit",
    "Rollover Cost",
    "Percentage Rollover",
    "Calendar Spread",
    "Call Open Interest",
    "Put Open Interest",
    "1D Change in Call OI",
    "1D Change in Put OI",
    "1W Change in Call OI",
    "1W Change in Put OI",
    "Highest Call OI Strike",
    "Highest Put OI Strike",
    "Highest 1D OI Change CE Strike",
    "Highest 1D OI Change PE Strike",
    "Highest 1W OI Change CE Strike",
    "Highest 1W OI Change PE Strike",
    "Put Call Ratio",
    "1D Change in Put Call Ratio",
  ]),
};

function AddFilterScreen({
  onBack,
  onDone,
}: {
  onBack: () => void;
  onDone: (f?: Filter) => void;
}) {
  const [activeCategory, setActiveCategory] = useState<string>("Price");
  const [search, setSearch] = useState<string>("");
  const [configIndicator, setConfigIndicator] = useState<"SMA" | "EMA" | null>(null);
  const [boundedOsc, setBoundedOsc] = useState<string | null>(null);
  const [candlePattern, setCandlePattern] = useState<string | null>(null);
  const [numericParam, setNumericParam] = useState<{ name: string; unit: string; related: string[]; simpleCustom?: boolean } | null>(null);

  const groups = FILTER_ITEMS_BY_CATEGORY[activeCategory] ?? [];
  const visibleGroups: FilterGroup[] = search
    ? groups
        .map((g) => ({
          group: g.group,
          items: g.items.filter((x) =>
            x.name.toLowerCase().includes(search.toLowerCase())
          ),
        }))
        .filter((g) => g.items.length > 0)
    : groups;

  return (
    <div className="flex flex-col flex-1" style={{ background: C.bgDefault, minHeight: 0 }}>
      {/* Search bar row */}
      <div
        className="flex items-center"
        style={{ height: 56, padding: "0 12px", gap: 8, background: C.bgDefault }}
      >
        <button
          aria-label="Back"
          onClick={onBack}
          className="flex items-center justify-center shrink-0"
          style={{ width: 36, height: 36, borderRadius: 8 }}
        >
          <ChevronLeft size={22} color={C.textPrimary} />
        </button>
        <div
          className="flex items-center flex-1"
          style={{
            height: 36,
            padding: "0 12px",
            gap: 8,
            background: C.bgMuted,
            borderRadius: 18,
          }}
        >
          <Search size={16} color={C.textSecondary} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search filters"
            className="flex-1 bg-transparent outline-none"
            style={{
              fontSize: 14,
              color: C.textPrimary,
              border: "none",
            }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{ fontSize: 13, color: C.textSecondary, fontWeight: 500 }}
            >
              Clear
            </button>
          )}
          {!search && (
            <span style={{ fontSize: 13, color: C.textSecondary, fontWeight: 500 }}>
              Clear
            </span>
          )}
        </div>
      </div>

      {/* Category tabs */}
      <div
        className="relative"
        style={{ borderBottom: `1px solid ${C.ui2}` }}
      >
        <div
          className="flex items-center overflow-x-auto scrollbar-none"
          style={{ padding: "0 16px", gap: 20, height: 44 }}
        >
          {FILTER_CATEGORIES.map((cat) => {
            const active = cat === activeCategory;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className="flex items-center justify-center shrink-0"
                style={{
                  height: 44,
                  padding: "12px 0",
                  borderBottom: active
                    ? `2px solid ${C.textPrimary}`
                    : "2px solid transparent",
                  cursor: "pointer",
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    lineHeight: "20px",
                    fontWeight: active ? 700 : 500,
                    color: active ? C.textPrimary : C.textTertiary,
                    whiteSpace: "nowrap",
                  }}
                >
                  {cat}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Items list */}
      <div
        className="flex-1 flex flex-col overflow-y-auto"
        style={{ padding: "0 16px", minHeight: 0 }}
      >
        {visibleGroups.map((grp) => (
          <div key={grp.group ?? "flat"} className="flex flex-col">
            {grp.group && (
              <div
                style={{
                  padding: "16px 0 8px",
                  fontFamily: "'Messina Sans', 'Inter', sans-serif",
                  fontWeight: 700,
                  fontSize: 15,
                  lineHeight: "22px",
                  color: C.textPrimary,
                }}
              >
                {grp.group}
              </div>
            )}
            {grp.items.map((item, idx) => (
              <div key={item.name}>
                <button
                  className="flex items-center w-full"
                  style={{ padding: "14px 0", gap: 8 }}
                  onClick={() => {
                    if (item.name === "SMA" || item.name === "EMA") {
                      setConfigIndicator(item.name);
                    } else if (BOUNDED_OSC_CONFIG[item.name]) {
                      setBoundedOsc(item.name);
                    } else if (activeCategory === "Candlesticks") {
                      setCandlePattern(item.name);
                    } else if (activeCategory === "Price") {
                      const hasPresets = PRESETS_BY_PARAM[item.name] != null;
                      setNumericParam({ name: item.name, unit: paramUnit(item.name), related: PRICE_PARAMS, simpleCustom: !hasPresets });
                    } else if (activeCategory === "Shareholding") {
                      setNumericParam({ name: item.name, unit: paramUnit(item.name), related: SHAREHOLDING_PARAMS, simpleCustom: true });
                    } else if (activeCategory === "Valuation") {
                      setNumericParam({ name: item.name, unit: paramUnit(item.name), related: VALUATION_PARAMS, simpleCustom: true });
                    } else if (activeCategory === "Profitability" && PROFITABILITY_PARAMS.includes(item.name)) {
                      setNumericParam({ name: item.name, unit: paramUnit(item.name), related: PROFITABILITY_PARAMS });
                    } else if (activeCategory === "Balance Sheet" && BALANCE_SHEET_PARAMS.includes(item.name)) {
                      setNumericParam({ name: item.name, unit: paramUnit(item.name), related: BALANCE_SHEET_PARAMS });
                    } else if (activeCategory === "Income & Growth" && INCOME_GROWTH_PARAMS.includes(item.name)) {
                      setNumericParam({ name: item.name, unit: paramUnit(item.name), related: INCOME_GROWTH_PARAMS });
                    } else if (activeCategory === "Financial Ratios" && QUALITY_SCORE_PARAMS.includes(item.name)) {
                      setNumericParam({ name: item.name, unit: paramUnit(item.name), related: QUALITY_SCORE_PARAMS });
                    } else if (activeCategory === "Futures & Options") {
                      const hasPresets = PRESETS_BY_PARAM[item.name] != null;
                      setNumericParam({ name: item.name, unit: paramUnit(item.name), related: FUTURES_OPTIONS_PARAMS, simpleCustom: !hasPresets });
                    }
                  }}
                >
                  <span
                    className="text-left"
                    style={{
                      fontSize: 15,
                      lineHeight: "22px",
                      fontWeight: 400,
                      color: C.textPrimary,
                    }}
                  >
                    {item.name}
                  </span>
                  {item.plus && <PlusInlineBadge />}
                  <span className="flex-1" />
                  <ChevronRight size={18} color={C.textTertiary} />
                </button>
                {idx < grp.items.length - 1 && <HorizontalDivider />}
              </div>
            ))}
          </div>
        ))}
      </div>

      {configIndicator && (
        <IndicatorConfigSheet
          indicator={configIndicator}
          onClose={() => setConfigIndicator(null)}
          onAdd={(f) => {
            setConfigIndicator(null);
            onDone(f);
          }}
        />
      )}

      {boundedOsc && (
        <BoundedOscSheet
          indicator={boundedOsc}
          onClose={() => setBoundedOsc(null)}
          onAdd={(f) => {
            setBoundedOsc(null);
            onDone(f);
          }}
        />
      )}

      {candlePattern && (
        <CandlestickConfigSheet
          pattern={candlePattern}
          onClose={() => setCandlePattern(null)}
          onAdd={(f) => {
            setCandlePattern(null);
            onDone(f);
          }}
        />
      )}

      {numericParam && (
        <NumericConfigSheet
          param={numericParam.name}
          unit={numericParam.unit}
          relatedParams={numericParam.related}
          simpleCustom={numericParam.simpleCustom}
          onClose={() => setNumericParam(null)}
          onAdd={(f) => {
            setNumericParam(null);
            onDone(f);
          }}
        />
      )}
    </div>
  );
}

type NumericOp = "Above" | "Below" | "Between" | "Equal to" | "Crosses Above" | "Crosses Below";
const NUMERIC_OPS: NumericOp[] = ["Above", "Below", "Between", "Equal to"];
function numericOpPhrase(op: NumericOp): string {
  if (op === "Above") return "is above";
  if (op === "Below") return "is below";
  if (op === "Crosses Above") return "crosses above";
  if (op === "Crosses Below") return "crosses below";
  if (op === "Between") return "is between";
  return "equals";
}

function formatNum(n: number): string {
  return n.toLocaleString("en-IN");
}

type DeltaRange = { label: string; min?: number; max?: number; custom?: boolean };

type PresetRange = {
  label: string;
  sub: string;
  op: NumericOp;
  v1?: number;
  v2?: number;
  compareParam?: string;
  deltaRanges?: DeltaRange[];
  section?: "Intraday" | "Swing" | "Positional";
};

type PriceTimeframe = "5m" | "15m" | "1h" | "1D" | "1W" | "1M";
const PRICE_TIMEFRAME_OPTIONS: PriceTimeframe[] = ["5m", "15m", "1h", "1D", "1W", "1M"];
const PRICE_CANDLE_PARAMS = new Set<string>([
  "Close", "Open", "High", "Low",
  "Previous Close", "Previous High", "Previous Low",
  "Opening Range High", "Opening Range Low",
  "High over n candles", "Low over n candles",
]);
const PRICE_LOOKBACK_PARAMS = new Set<string>([
  "High over n candles", "Low over n candles",
]);
const PRICE_DELTA_RANGES: DeltaRange[] = [
  { label: "Any amount" },
  { label: "0–2%",  min: 0,  max: 2 },
  { label: "2–5%",  min: 2,  max: 5 },
  { label: "5–10%", min: 5,  max: 10 },
  { label: "10%+",  min: 10 },
  { label: "Custom", custom: true },
];
const PRICE_NEAR_DELTAS: DeltaRange[] = [
  { label: "0–2%",  min: 0, max: 2 },
  { label: "2–5%",  min: 2, max: 5 },
  { label: "5–10%", min: 5, max: 10 },
  { label: "Custom", custom: true },
];

// Common-sense "by how much" buckets for shareholder-count QoQ/YoY deltas.
// Same buckets for both horizons — small %s cover QoQ, large %s cover YoY swings.
const SHAREHOLDER_DELTA_RANGES: DeltaRange[] = [
  { label: "Any amount" },
  { label: "5–10%",      min: 5,   max: 10 },
  { label: "10–25%",     min: 10,  max: 25 },
  { label: "25–50%",     min: 25,  max: 50 },
  { label: "50% or more", min: 50 },
  { label: "Custom", custom: true },
];

const OI_DELTA_RANGES: DeltaRange[] = [
  { label: "Any amount" },
  { label: "5–15%",  min: 5,  max: 15 },
  { label: "15–30%", min: 15, max: 30 },
  { label: "30–50%", min: 30, max: 50 },
  { label: "50%+",   min: 50 },
  { label: "Custom", custom: true },
];

const STRIKE_PCT_DELTAS: DeltaRange[] = [
  { label: "Within 1%", min: 0, max: 1 },
  { label: "1–3%",      min: 1, max: 3 },
  { label: "3–5%",      min: 3, max: 5 },
  { label: "5–10%",     min: 5, max: 10 },
  { label: "Custom", custom: true },
];

const PCT_BUCKET = {
  promoter: [
    { label: "70% or above", sub: "Founder-controlled",   op: "Above"   as NumericOp, v1: 70 },
    { label: "50% to 70%",   sub: "Majority promoter",    op: "Between" as NumericOp, v1: 50, v2: 70 },
    { label: "25% to 50%",   sub: "Significant promoter", op: "Between" as NumericOp, v1: 25, v2: 50 },
    { label: "Below 25%",    sub: "Low promoter",         op: "Below"   as NumericOp, v1: 25 },
  ] as PresetRange[],
  fiiDii: [
    { label: "25% or above", sub: "Very high interest", op: "Above"   as NumericOp, v1: 25 },
    { label: "15% to 25%",   sub: "High interest",      op: "Between" as NumericOp, v1: 15, v2: 25 },
    { label: "5% to 15%",    sub: "Moderate",           op: "Between" as NumericOp, v1: 5,  v2: 15 },
    { label: "Below 5%",     sub: "Minimal",            op: "Below"   as NumericOp, v1: 5 },
  ] as PresetRange[],
  publicHolding: [
    { label: "50% or above", sub: "Widely held",       op: "Above"   as NumericOp, v1: 50 },
    { label: "30% to 50%",   sub: "Moderate float",    op: "Between" as NumericOp, v1: 30, v2: 50 },
    { label: "15% to 30%",   sub: "Concentrated",      op: "Between" as NumericOp, v1: 15, v2: 30 },
    { label: "Below 15%",    sub: "Very concentrated", op: "Below"   as NumericOp, v1: 15 },
  ] as PresetRange[],
  changeInstQoQ: [
    { label: "Above +2%",      sub: "Strong accumulation", op: "Above"   as NumericOp, v1: 2 },
    { label: "+0.5% to +2%",   sub: "Accumulation",        op: "Between" as NumericOp, v1: 0.5,  v2: 2 },
    { label: "-0.5% to +0.5%", sub: "Stable",              op: "Between" as NumericOp, v1: -0.5, v2: 0.5 },
    { label: "-2% to -0.5%",   sub: "Reduction",           op: "Between" as NumericOp, v1: -2,   v2: -0.5 },
    { label: "Below -2%",      sub: "Strong reduction",    op: "Below"   as NumericOp, v1: -2 },
  ] as PresetRange[],
  changePromoterQoQ: [
    { label: "Above +1%",      sub: "Promoter buying",  op: "Above"   as NumericOp, v1: 1 },
    { label: "+0.1% to +1%",   sub: "Slight buying",    op: "Between" as NumericOp, v1: 0.1,  v2: 1 },
    { label: "-0.1% to +0.1%", sub: "No change",        op: "Between" as NumericOp, v1: -0.1, v2: 0.1 },
    { label: "-1% to -0.1%",   sub: "Slight selling",   op: "Between" as NumericOp, v1: -1,   v2: -0.1 },
    { label: "Below -1%",      sub: "Promoter selling", op: "Below"   as NumericOp, v1: -1 },
  ] as PresetRange[],
  unpledged: [
    { label: "90% or above", sub: "Safe",              op: "Above"   as NumericOp, v1: 90 },
    { label: "75% to 90%",   sub: "Partially pledged", op: "Between" as NumericOp, v1: 75, v2: 90 },
    { label: "50% to 75%",   sub: "Moderate risk",     op: "Between" as NumericOp, v1: 50, v2: 75 },
    { label: "Below 50%",    sub: "High pledge risk",  op: "Below"   as NumericOp, v1: 50 },
  ] as PresetRange[],
  pledged: [
    { label: "Below 1%",   sub: "No/minimal pledge", op: "Below"   as NumericOp, v1: 1 },
    { label: "1% to 10%",  sub: "Low pledge",        op: "Between" as NumericOp, v1: 1,  v2: 10 },
    { label: "10% to 25%", sub: "Moderate pledge",   op: "Between" as NumericOp, v1: 10, v2: 25 },
    { label: "25% to 50%", sub: "High pledge risk",  op: "Between" as NumericOp, v1: 25, v2: 50 },
    { label: "Above 50%",  sub: "Very high risk",    op: "Above"   as NumericOp, v1: 50 },
  ] as PresetRange[],
  shareholdersCurrent: [
    { label: "5,00,000 or above",        sub: "Mega holder base",  op: "Above"   as NumericOp, v1: 500000 },
    { label: "1,00,000 to 5,00,000",     sub: "Large holder base", op: "Between" as NumericOp, v1: 100000, v2: 500000 },
    { label: "25,000 to 1,00,000",       sub: "Moderate base",     op: "Between" as NumericOp, v1: 25000,  v2: 100000 },
    { label: "5,000 to 25,000",          sub: "Small base",        op: "Between" as NumericOp, v1: 5000,   v2: 25000 },
    { label: "Below 5,000",              sub: "Concentrated",      op: "Below"   as NumericOp, v1: 5000 },
    { label: "More than last quarter",   sub: "QoQ accumulation",  op: "Above" as NumericOp, compareParam: "Number of Shareholders Preceding Quarter", deltaRanges: SHAREHOLDER_DELTA_RANGES },
    { label: "Fewer than last quarter",  sub: "QoQ distribution",  op: "Below" as NumericOp, compareParam: "Number of Shareholders Preceding Quarter", deltaRanges: SHAREHOLDER_DELTA_RANGES },
    { label: "More than 1 year ago",     sub: "Growing base (YoY)", op: "Above" as NumericOp, compareParam: "Number of Shareholders 1 Year Back", deltaRanges: SHAREHOLDER_DELTA_RANGES },
    { label: "Fewer than 1 year ago",    sub: "Shrinking base (YoY)", op: "Below" as NumericOp, compareParam: "Number of Shareholders 1 Year Back", deltaRanges: SHAREHOLDER_DELTA_RANGES },
  ] as PresetRange[],
  shareholderCount: [
    { label: "5,00,000 or above",       sub: "Mega holder base",   op: "Above"   as NumericOp, v1: 500000 },
    { label: "1,00,000 to 5,00,000",    sub: "Large holder base",  op: "Between" as NumericOp, v1: 100000, v2: 500000 },
    { label: "25,000 to 1,00,000",      sub: "Moderate base",      op: "Between" as NumericOp, v1: 25000,  v2: 100000 },
    { label: "5,000 to 25,000",         sub: "Small base",         op: "Between" as NumericOp, v1: 5000,   v2: 25000 },
    { label: "Below 5,000",             sub: "Concentrated",       op: "Below"   as NumericOp, v1: 5000 },
  ] as PresetRange[],
  change3Y: [
    { label: "Above +10%",  sub: "Strong 3Y accumulation", op: "Above"   as NumericOp, v1: 10 },
    { label: "+3% to +10%", sub: "3Y accumulation",        op: "Between" as NumericOp, v1: 3,   v2: 10 },
    { label: "-3% to +3%",  sub: "Stable",                 op: "Between" as NumericOp, v1: -3,  v2: 3 },
    { label: "-10% to -3%", sub: "3Y reduction",           op: "Between" as NumericOp, v1: -10, v2: -3 },
    { label: "Below -10%",  sub: "Strong 3Y reduction",    op: "Below"   as NumericOp, v1: -10 },
  ] as PresetRange[],

  // ── Valuation archetypes ───────────────────────────────────────────
  peLike: [
    { label: "Above 40x",   sub: "Rich valuation",   op: "Above"   as NumericOp, v1: 40 },
    { label: "20x to 40x",  sub: "Elevated",         op: "Between" as NumericOp, v1: 20, v2: 40 },
    { label: "10x to 20x",  sub: "Fair",             op: "Between" as NumericOp, v1: 10, v2: 20 },
    { label: "Below 10x",   sub: "Attractive",       op: "Below"   as NumericOp, v1: 10 },
  ] as PresetRange[],
  peCurrent: [
    { label: "Above 40x",   sub: "Rich valuation",   op: "Above"   as NumericOp, v1: 40 },
    { label: "20x to 40x",  sub: "Elevated",         op: "Between" as NumericOp, v1: 20, v2: 40 },
    { label: "10x to 20x",  sub: "Fair",             op: "Between" as NumericOp, v1: 10, v2: 20 },
    { label: "Below 10x",   sub: "Attractive",       op: "Below"   as NumericOp, v1: 10 },
    { label: "Below Industry PE",      sub: "Cheaper than peers",    op: "Below" as NumericOp, compareParam: "Industry PE",            deltaRanges: SHAREHOLDER_DELTA_RANGES },
    { label: "Above Industry PE",      sub: "Priced above peers",    op: "Above" as NumericOp, compareParam: "Industry PE",            deltaRanges: SHAREHOLDER_DELTA_RANGES },
  ] as PresetRange[],
  pb: [
    { label: "Above 6x",    sub: "Rich",              op: "Above"   as NumericOp, v1: 6 },
    { label: "3x to 6x",    sub: "Elevated",          op: "Between" as NumericOp, v1: 3, v2: 6 },
    { label: "1x to 3x",    sub: "Fair",              op: "Between" as NumericOp, v1: 1, v2: 3 },
    { label: "Below 1x",    sub: "Below book value",  op: "Below"   as NumericOp, v1: 1 },
  ] as PresetRange[],
  pbCurrent: [
    { label: "Above 6x",    sub: "Rich",              op: "Above"   as NumericOp, v1: 6 },
    { label: "3x to 6x",    sub: "Elevated",          op: "Between" as NumericOp, v1: 3, v2: 6 },
    { label: "1x to 3x",    sub: "Fair",              op: "Between" as NumericOp, v1: 1, v2: 3 },
    { label: "Below 1x",    sub: "Below book value",  op: "Below"   as NumericOp, v1: 1 },
    { label: "Below Industry PB", sub: "Cheaper than peers", op: "Below" as NumericOp, compareParam: "Industry PB", deltaRanges: SHAREHOLDER_DELTA_RANGES },
    { label: "Above Industry PB", sub: "Premium to peers",   op: "Above" as NumericOp, compareParam: "Industry PB", deltaRanges: SHAREHOLDER_DELTA_RANGES },
  ] as PresetRange[],
  ps: [
    { label: "Above 10x",   sub: "Rich",             op: "Above"   as NumericOp, v1: 10 },
    { label: "5x to 10x",   sub: "Elevated",         op: "Between" as NumericOp, v1: 5, v2: 10 },
    { label: "2x to 5x",    sub: "Fair",             op: "Between" as NumericOp, v1: 2, v2: 5 },
    { label: "Below 2x",    sub: "Attractive",       op: "Below"   as NumericOp, v1: 2 },
  ] as PresetRange[],
  psCurrent: [
    { label: "Above 10x",   sub: "Rich",             op: "Above"   as NumericOp, v1: 10 },
    { label: "5x to 10x",   sub: "Elevated",         op: "Between" as NumericOp, v1: 5, v2: 10 },
    { label: "2x to 5x",    sub: "Fair",             op: "Between" as NumericOp, v1: 2, v2: 5 },
    { label: "Below 2x",    sub: "Attractive",       op: "Below"   as NumericOp, v1: 2 },
    { label: "Below Industry PS", sub: "Cheaper than peers", op: "Below" as NumericOp, compareParam: "Industry PS", deltaRanges: SHAREHOLDER_DELTA_RANGES },
    { label: "Above Industry PS", sub: "Premium to peers",   op: "Above" as NumericOp, compareParam: "Industry PS", deltaRanges: SHAREHOLDER_DELTA_RANGES },
  ] as PresetRange[],
  priceFcf: [
    { label: "Above 40x",   sub: "Expensive",        op: "Above"   as NumericOp, v1: 40 },
    { label: "20x to 40x",  sub: "Elevated",         op: "Between" as NumericOp, v1: 20, v2: 40 },
    { label: "10x to 20x",  sub: "Fair",             op: "Between" as NumericOp, v1: 10, v2: 20 },
    { label: "Below 10x",   sub: "Attractive",       op: "Below"   as NumericOp, v1: 10 },
  ] as PresetRange[],
  debtEquity: [
    { label: "Above 2x",    sub: "Highly leveraged", op: "Above"   as NumericOp, v1: 2 },
    { label: "1x to 2x",    sub: "Moderate debt",    op: "Between" as NumericOp, v1: 1, v2: 2 },
    { label: "0.3x to 1x",  sub: "Comfortable",      op: "Between" as NumericOp, v1: 0.3, v2: 1 },
    { label: "Below 0.3x",  sub: "Low leverage",     op: "Below"   as NumericOp, v1: 0.3 },
  ] as PresetRange[],
  financialLev: [
    { label: "Above 5x",    sub: "Very high",        op: "Above"   as NumericOp, v1: 5 },
    { label: "3x to 5x",    sub: "High",             op: "Between" as NumericOp, v1: 3, v2: 5 },
    { label: "1.5x to 3x",  sub: "Moderate",         op: "Between" as NumericOp, v1: 1.5, v2: 3 },
    { label: "Below 1.5x",  sub: "Low",              op: "Below"   as NumericOp, v1: 1.5 },
  ] as PresetRange[],
  earningsYield: [
    { label: "Above 8%",    sub: "Very attractive",  op: "Above"   as NumericOp, v1: 8 },
    { label: "5% to 8%",    sub: "Attractive",       op: "Between" as NumericOp, v1: 5, v2: 8 },
    { label: "3% to 5%",    sub: "Modest",           op: "Between" as NumericOp, v1: 3, v2: 5 },
    { label: "Below 3%",    sub: "Low",              op: "Below"   as NumericOp, v1: 3 },
  ] as PresetRange[],
  divYield: [
    { label: "Above 4%",    sub: "High yield",       op: "Above"   as NumericOp, v1: 4 },
    { label: "2% to 4%",    sub: "Moderate yield",   op: "Between" as NumericOp, v1: 2, v2: 4 },
    { label: "0.5% to 2%",  sub: "Low yield",        op: "Between" as NumericOp, v1: 0.5, v2: 2 },
    { label: "Below 0.5%",  sub: "No/minimal",       op: "Below"   as NumericOp, v1: 0.5 },
  ] as PresetRange[],
  divYieldCurrent: [
    { label: "Above 4%",    sub: "High yield",       op: "Above"   as NumericOp, v1: 4 },
    { label: "2% to 4%",    sub: "Moderate yield",   op: "Between" as NumericOp, v1: 2, v2: 4 },
    { label: "0.5% to 2%",  sub: "Low yield",        op: "Between" as NumericOp, v1: 0.5, v2: 2 },
    { label: "Below 0.5%",  sub: "No/minimal",       op: "Below"   as NumericOp, v1: 0.5 },
    { label: "Above Industry Dividend Yield", sub: "Pays more than peers", op: "Above" as NumericOp, compareParam: "Industry Dividend Yield", deltaRanges: SHAREHOLDER_DELTA_RANGES },
    { label: "Above Average 5years dividend", sub: "Growing yield",        op: "Above" as NumericOp, compareParam: "Average 5years dividend", deltaRanges: SHAREHOLDER_DELTA_RANGES },
  ] as PresetRange[],
  returnOnX: [
    { label: "Above 25%",   sub: "Exceptional",      op: "Above"   as NumericOp, v1: 25 },
    { label: "15% to 25%",  sub: "Strong",           op: "Between" as NumericOp, v1: 15, v2: 25 },
    { label: "10% to 15%",  sub: "Decent",           op: "Between" as NumericOp, v1: 10, v2: 15 },
    { label: "Below 10%",   sub: "Weak",             op: "Below"   as NumericOp, v1: 10 },
  ] as PresetRange[],
  returnOnEquityCurrent: [
    { label: "Above 25%",   sub: "Exceptional",      op: "Above"   as NumericOp, v1: 25 },
    { label: "15% to 25%",  sub: "Strong",           op: "Between" as NumericOp, v1: 15, v2: 25 },
    { label: "10% to 15%",  sub: "Decent",           op: "Between" as NumericOp, v1: 10, v2: 15 },
    { label: "Below 10%",   sub: "Weak",             op: "Below"   as NumericOp, v1: 10 },
    { label: "Above preceding year",        sub: "Improving YoY",         op: "Above" as NumericOp, compareParam: "Return on equity preceding year",     deltaRanges: SHAREHOLDER_DELTA_RANGES },
    { label: "Below preceding year",        sub: "Deteriorating YoY",     op: "Below" as NumericOp, compareParam: "Return on equity preceding year",     deltaRanges: SHAREHOLDER_DELTA_RANGES },
    { label: "Above Avg ROE 3Years",        sub: "Better than recent avg",op: "Above" as NumericOp, compareParam: "Average return on equity 3Years",     deltaRanges: SHAREHOLDER_DELTA_RANGES },
  ] as PresetRange[],
  returnOnAssetsCurrent: [
    { label: "Above 25%",   sub: "Exceptional",      op: "Above"   as NumericOp, v1: 25 },
    { label: "15% to 25%",  sub: "Strong",           op: "Between" as NumericOp, v1: 15, v2: 25 },
    { label: "10% to 15%",  sub: "Decent",           op: "Between" as NumericOp, v1: 10, v2: 15 },
    { label: "Below 10%",   sub: "Weak",             op: "Below"   as NumericOp, v1: 10 },
    { label: "Above preceding year",    sub: "Improving YoY",         op: "Above" as NumericOp, compareParam: "Return on assets preceding year", deltaRanges: SHAREHOLDER_DELTA_RANGES },
    { label: "Above Return on assets 3years", sub: "Better than 3Y",  op: "Above" as NumericOp, compareParam: "Return on assets 3years",       deltaRanges: SHAREHOLDER_DELTA_RANGES },
  ] as PresetRange[],
  returnOnCapitalCurrent: [
    { label: "Above 25%",   sub: "Exceptional",      op: "Above"   as NumericOp, v1: 25 },
    { label: "15% to 25%",  sub: "Strong",           op: "Between" as NumericOp, v1: 15, v2: 25 },
    { label: "10% to 15%",  sub: "Decent",           op: "Between" as NumericOp, v1: 10, v2: 15 },
    { label: "Below 10%",   sub: "Weak",             op: "Below"   as NumericOp, v1: 10 },
    { label: "Above preceding year",    sub: "Improving YoY",         op: "Above" as NumericOp, compareParam: "Return on capital employed preceding year", deltaRanges: SHAREHOLDER_DELTA_RANGES },
    { label: "Above Avg ROCE 3Years",   sub: "Better than recent avg",op: "Above" as NumericOp, compareParam: "Average return on capital employed 3Years", deltaRanges: SHAREHOLDER_DELTA_RANGES },
  ] as PresetRange[],
  opmPct: [
    { label: "Above 30%",   sub: "Very profitable",  op: "Above"   as NumericOp, v1: 30 },
    { label: "15% to 30%",  sub: "Healthy margin",   op: "Between" as NumericOp, v1: 15, v2: 30 },
    { label: "5% to 15%",   sub: "Thin margin",      op: "Between" as NumericOp, v1: 5, v2: 15 },
    { label: "Below 5%",    sub: "Very thin",        op: "Below"   as NumericOp, v1: 5 },
  ] as PresetRange[],
  exportsPct: [
    { label: "Above 75%",   sub: "Export-led",       op: "Above"   as NumericOp, v1: 75 },
    { label: "25% to 75%",  sub: "Significant",      op: "Between" as NumericOp, v1: 25, v2: 75 },
    { label: "5% to 25%",   sub: "Partial",          op: "Between" as NumericOp, v1: 5, v2: 25 },
    { label: "Below 5%",    sub: "Minimal",          op: "Below"   as NumericOp, v1: 5 },
  ] as PresetRange[],
  exportsPctCurrent: [
    { label: "Above 75%",   sub: "Export-led",       op: "Above"   as NumericOp, v1: 75 },
    { label: "25% to 75%",  sub: "Significant",      op: "Between" as NumericOp, v1: 25, v2: 75 },
    { label: "5% to 25%",   sub: "Partial",          op: "Between" as NumericOp, v1: 5, v2: 25 },
    { label: "Below 5%",    sub: "Minimal",          op: "Below"   as NumericOp, v1: 5 },
    { label: "Above Exports percentage 3Years back", sub: "Growing exports", op: "Above" as NumericOp, compareParam: "Exports percentage 3Years back", deltaRanges: SHAREHOLDER_DELTA_RANGES },
  ] as PresetRange[],
  avgDivPayout: [
    { label: "Above 50%",   sub: "Large payout",     op: "Above"   as NumericOp, v1: 50 },
    { label: "25% to 50%",  sub: "Moderate payout",  op: "Between" as NumericOp, v1: 25, v2: 50 },
    { label: "10% to 25%",  sub: "Small payout",     op: "Between" as NumericOp, v1: 10, v2: 25 },
    { label: "Below 10%",   sub: "Minimal/none",     op: "Below"   as NumericOp, v1: 10 },
  ] as PresetRange[],
  invTurnover: [
    { label: "Above 8x",    sub: "Fast turnover",    op: "Above"   as NumericOp, v1: 8 },
    { label: "4x to 8x",    sub: "Healthy",          op: "Between" as NumericOp, v1: 4, v2: 8 },
    { label: "2x to 4x",    sub: "Moderate",         op: "Between" as NumericOp, v1: 2, v2: 4 },
    { label: "Below 2x",    sub: "Slow",             op: "Below"   as NumericOp, v1: 2 },
  ] as PresetRange[],
  invTurnoverCurrent: [
    { label: "Above 8x",    sub: "Fast turnover",    op: "Above"   as NumericOp, v1: 8 },
    { label: "4x to 8x",    sub: "Healthy",          op: "Between" as NumericOp, v1: 4, v2: 8 },
    { label: "2x to 4x",    sub: "Moderate",         op: "Between" as NumericOp, v1: 2, v2: 4 },
    { label: "Below 2x",    sub: "Slow",             op: "Below"   as NumericOp, v1: 2 },
    { label: "Above Inventory turnover 3Y back", sub: "Improving", op: "Above" as NumericOp, compareParam: "Inventory turnover ratio 3Years back", deltaRanges: SHAREHOLDER_DELTA_RANGES },
    { label: "Below Inventory turnover 3Y back", sub: "Slowing",   op: "Below" as NumericOp, compareParam: "Inventory turnover ratio 3Years back", deltaRanges: SHAREHOLDER_DELTA_RANGES },
  ] as PresetRange[],
  assetTurnover: [
    { label: "Above 2x",    sub: "Very efficient",   op: "Above"   as NumericOp, v1: 2 },
    { label: "1x to 2x",    sub: "Efficient",        op: "Between" as NumericOp, v1: 1, v2: 2 },
    { label: "0.5x to 1x",  sub: "Moderate",         op: "Between" as NumericOp, v1: 0.5, v2: 1 },
    { label: "Below 0.5x",  sub: "Asset-heavy",      op: "Below"   as NumericOp, v1: 0.5 },
  ] as PresetRange[],
  quickRatio: [
    { label: "Above 2x",    sub: "Very liquid",      op: "Above"   as NumericOp, v1: 2 },
    { label: "1x to 2x",    sub: "Healthy liquidity",op: "Between" as NumericOp, v1: 1, v2: 2 },
    { label: "0.5x to 1x",  sub: "Tight",            op: "Between" as NumericOp, v1: 0.5, v2: 1 },
    { label: "Below 0.5x",  sub: "Stressed",         op: "Below"   as NumericOp, v1: 0.5 },
  ] as PresetRange[],
  evMultiple: [
    { label: "Above 20x",   sub: "Rich",             op: "Above"   as NumericOp, v1: 20 },
    { label: "10x to 20x",  sub: "Elevated",         op: "Between" as NumericOp, v1: 10, v2: 20 },
    { label: "5x to 10x",   sub: "Fair",             op: "Between" as NumericOp, v1: 5, v2: 10 },
    { label: "Below 5x",    sub: "Attractive",       op: "Below"   as NumericOp, v1: 5 },
  ] as PresetRange[],
  evRevenue: [
    { label: "Above 10x",   sub: "Rich",             op: "Above"   as NumericOp, v1: 10 },
    { label: "5x to 10x",   sub: "Elevated",         op: "Between" as NumericOp, v1: 5, v2: 10 },
    { label: "2x to 5x",    sub: "Fair",             op: "Between" as NumericOp, v1: 2, v2: 5 },
    { label: "Below 2x",    sub: "Attractive",       op: "Below"   as NumericOp, v1: 2 },
  ] as PresetRange[],
  marketCap: [
    { label: "Above 1,00,000 Cr",     sub: "Large cap",    op: "Above"   as NumericOp, v1: 100000 },
    { label: "25,000 to 1,00,000 Cr", sub: "Large cap",    op: "Between" as NumericOp, v1: 25000,  v2: 100000 },
    { label: "5,000 to 25,000 Cr",    sub: "Mid cap",      op: "Between" as NumericOp, v1: 5000,   v2: 25000 },
    { label: "500 to 5,000 Cr",       sub: "Small cap",    op: "Between" as NumericOp, v1: 500,    v2: 5000 },
    { label: "Below 500 Cr",          sub: "Micro cap",    op: "Below"   as NumericOp, v1: 500 },
  ] as PresetRange[],
  marketCapCurrent: [
    { label: "Above 1,00,000 Cr",     sub: "Large cap",    op: "Above"   as NumericOp, v1: 100000 },
    { label: "25,000 to 1,00,000 Cr", sub: "Large cap",    op: "Between" as NumericOp, v1: 25000,  v2: 100000 },
    { label: "5,000 to 25,000 Cr",    sub: "Mid cap",      op: "Between" as NumericOp, v1: 5000,   v2: 25000 },
    { label: "500 to 5,000 Cr",       sub: "Small cap",    op: "Between" as NumericOp, v1: 500,    v2: 5000 },
    { label: "Below 500 Cr",          sub: "Micro cap",    op: "Below"   as NumericOp, v1: 500 },
  ] as PresetRange[],
  bookValueCr: [
    { label: "Above 500 Cr",  sub: "Large",            op: "Above"   as NumericOp, v1: 500 },
    { label: "100 to 500 Cr", sub: "Moderate",         op: "Between" as NumericOp, v1: 100, v2: 500 },
    { label: "20 to 100 Cr",  sub: "Small",            op: "Between" as NumericOp, v1: 20,  v2: 100 },
    { label: "Below 20 Cr",   sub: "Very small",       op: "Below"   as NumericOp, v1: 20 },
  ] as PresetRange[],
  grahamVsPrice: [
    { label: "Above Price", sub: "Undervalued per Graham", op: "Above" as NumericOp, compareParam: "Price" },
    { label: "Below Price", sub: "Overvalued per Graham",  op: "Below" as NumericOp, compareParam: "Price" },
  ] as PresetRange[],
  enterpriseValue: [
    { label: "Above 1,00,000 Cr",     sub: "Large cap", op: "Above"   as NumericOp, v1: 100000 },
    { label: "25,000 to 1,00,000 Cr", sub: "Large cap", op: "Between" as NumericOp, v1: 25000, v2: 100000 },
    { label: "5,000 to 25,000 Cr",    sub: "Mid cap",   op: "Between" as NumericOp, v1: 5000,  v2: 25000 },
    { label: "500 to 5,000 Cr",       sub: "Small cap", op: "Between" as NumericOp, v1: 500,   v2: 5000 },
    { label: "Below 500 Cr",          sub: "Micro cap", op: "Below"   as NumericOp, v1: 500 },
    { label: "Above Market Capitalization", sub: "Net debt (leveraged)", op: "Above" as NumericOp, compareParam: "Market Capitalization" },
    { label: "Below Market Capitalization", sub: "Net cash (cash-rich)", op: "Below" as NumericOp, compareParam: "Market Capitalization" },
  ] as PresetRange[],
  bookValueCurrent: [
    { label: "Above 500 Cr",  sub: "Large",            op: "Above"   as NumericOp, v1: 500 },
    { label: "100 to 500 Cr", sub: "Moderate",         op: "Between" as NumericOp, v1: 100, v2: 500 },
    { label: "20 to 100 Cr",  sub: "Small",            op: "Between" as NumericOp, v1: 20,  v2: 100 },
    { label: "Below 20 Cr",   sub: "Very small",       op: "Below"   as NumericOp, v1: 20 },
    { label: "Above Book value preceding year", sub: "Growing YoY", op: "Above" as NumericOp, compareParam: "Book value preceding year", deltaRanges: SHAREHOLDER_DELTA_RANGES },
    { label: "Above Book value 3years back",     sub: "Grown over 3Y", op: "Above" as NumericOp, compareParam: "Book value 3years back",     deltaRanges: SHAREHOLDER_DELTA_RANGES },
  ] as PresetRange[],
  daysShort: [
    { label: "Above 60 days",  sub: "Long",             op: "Above"   as NumericOp, v1: 60 },
    { label: "30 to 60 days",  sub: "Moderate",         op: "Between" as NumericOp, v1: 30, v2: 60 },
    { label: "15 to 30 days",  sub: "Short",            op: "Between" as NumericOp, v1: 15, v2: 30 },
    { label: "Below 15 days",  sub: "Very short",       op: "Below"   as NumericOp, v1: 15 },
  ] as PresetRange[],
  debtorDaysCurrent: [
    { label: "Above 60 days",  sub: "Slow collection",  op: "Above"   as NumericOp, v1: 60 },
    { label: "30 to 60 days",  sub: "Moderate",         op: "Between" as NumericOp, v1: 30, v2: 60 },
    { label: "15 to 30 days",  sub: "Quick",            op: "Between" as NumericOp, v1: 15, v2: 30 },
    { label: "Below 15 days",  sub: "Very quick",       op: "Below"   as NumericOp, v1: 15 },
    { label: "Below Debtor days 3years back",  sub: "Improving collection", op: "Below" as NumericOp, compareParam: "Debtor days 3years back",    deltaRanges: SHAREHOLDER_DELTA_RANGES },
    { label: "Below Average debtor days 3years", sub: "Better than recent avg", op: "Below" as NumericOp, compareParam: "Average debtor days 3years", deltaRanges: SHAREHOLDER_DELTA_RANGES },
  ] as PresetRange[],
  daysLong: [
    { label: "Above 120 days", sub: "Very long cycle",  op: "Above"   as NumericOp, v1: 120 },
    { label: "60 to 120 days", sub: "Long",             op: "Between" as NumericOp, v1: 60, v2: 120 },
    { label: "30 to 60 days",  sub: "Moderate",         op: "Between" as NumericOp, v1: 30, v2: 60 },
    { label: "Below 30 days",  sub: "Short",            op: "Below"   as NumericOp, v1: 30 },
  ] as PresetRange[],
  workingCapDaysCurrent: [
    { label: "Above 120 days", sub: "Very long cycle",  op: "Above"   as NumericOp, v1: 120 },
    { label: "60 to 120 days", sub: "Long",             op: "Between" as NumericOp, v1: 60, v2: 120 },
    { label: "30 to 60 days",  sub: "Moderate",         op: "Between" as NumericOp, v1: 30, v2: 60 },
    { label: "Below 30 days",  sub: "Short",            op: "Below"   as NumericOp, v1: 30 },
    { label: "Below Average Working Capital Days 3years", sub: "Improving", op: "Below" as NumericOp, compareParam: "Average Working Capital Days 3years", deltaRanges: SHAREHOLDER_DELTA_RANGES },
  ] as PresetRange[],
  score0to9: [
    { label: "7 to 9",  sub: "Strong",  op: "Between" as NumericOp, v1: 7, v2: 9 },
    { label: "5 to 6",  sub: "Decent",  op: "Between" as NumericOp, v1: 5, v2: 6 },
    { label: "3 to 4",  sub: "Mixed",   op: "Between" as NumericOp, v1: 3, v2: 4 },
    { label: "0 to 2",  sub: "Weak",    op: "Between" as NumericOp, v1: 0, v2: 2 },
  ] as PresetRange[],
  countShares: [
    { label: "Above 1,00,00,000", sub: "Very large float", op: "Above"   as NumericOp, v1: 10000000 },
    { label: "10,00,000 to 1,00,00,000", sub: "Large float", op: "Between" as NumericOp, v1: 1000000, v2: 10000000 },
    { label: "1,00,000 to 10,00,000", sub: "Moderate float", op: "Between" as NumericOp, v1: 100000, v2: 1000000 },
    { label: "Below 1,00,000", sub: "Tight float", op: "Below" as NumericOp, v1: 100000 },
  ] as PresetRange[],
  returnPct: [
    { label: "Strong gainers", sub: "10% or more",   op: "Above"   as NumericOp, v1: 10 },
    { label: "Gainers",        sub: "3% to 10%",     op: "Between" as NumericOp, v1: 3, v2: 10 },
    { label: "Flat",           sub: "-3% to 3%",     op: "Between" as NumericOp, v1: -3, v2: 3 },
    { label: "Losers",         sub: "-10% to -3%",   op: "Between" as NumericOp, v1: -10, v2: -3 },
    { label: "Strong losers",  sub: "-10% or less",  op: "Below"   as NumericOp, v1: -10 },
  ] as PresetRange[],
  pctFromLevel: [
    { label: "Above level",    sub: "0% and higher", op: "Above"   as NumericOp, v1: 0 },
    { label: "Near level",     sub: "-5% to 5%",     op: "Between" as NumericOp, v1: -5, v2: 5 },
    { label: "Slightly below", sub: "-15% to -5%",   op: "Between" as NumericOp, v1: -15, v2: -5 },
    { label: "Well below",     sub: "-15% or lower", op: "Below"   as NumericOp, v1: -15 },
  ] as PresetRange[],
  closePosInRange: [
    { label: "Near high",   sub: "75% to 100%", op: "Between" as NumericOp, v1: 75, v2: 100 },
    { label: "Upper half",  sub: "50% to 75%",  op: "Between" as NumericOp, v1: 50, v2: 75 },
    { label: "Lower half",  sub: "25% to 50%",  op: "Between" as NumericOp, v1: 25, v2: 50 },
    { label: "Near low",    sub: "0% to 25%",   op: "Between" as NumericOp, v1: 0, v2: 25 },
  ] as PresetRange[],

  // ── Price: Close (persona-grouped) ───────────────────────────────
  closeRelational: [
    { section: "Intraday", label: "Above Opening Range High", sub: "ORB breakout",     op: "Above" as NumericOp, compareParam: "Opening Range High", deltaRanges: PRICE_DELTA_RANGES },
    { section: "Intraday", label: "Below Opening Range Low",  sub: "ORB breakdown",    op: "Below" as NumericOp, compareParam: "Opening Range Low",  deltaRanges: PRICE_DELTA_RANGES },
    { section: "Intraday", label: "Above Previous High",      sub: "Higher high",      op: "Above" as NumericOp, compareParam: "Previous High",      deltaRanges: PRICE_DELTA_RANGES },
    { section: "Intraday", label: "Below Previous Low",       sub: "Lower low",        op: "Below" as NumericOp, compareParam: "Previous Low",       deltaRanges: PRICE_DELTA_RANGES },
    { section: "Intraday", label: "Above Previous Close",     sub: "Green day",        op: "Above" as NumericOp, compareParam: "Previous Close",     deltaRanges: PRICE_DELTA_RANGES },
    { section: "Swing",    label: "Crosses above Previous High", sub: "Intraday breakout",   op: "Crosses Above" as NumericOp, compareParam: "Previous High" },
    { section: "Swing",    label: "Crosses below Previous Low",  sub: "Intraday breakdown",  op: "Crosses Below" as NumericOp, compareParam: "Previous Low"  },
    { section: "Swing",    label: "Above 52-Week High",          sub: "New 52W breakout",    op: "Above" as NumericOp, compareParam: "52-Week High", deltaRanges: PRICE_DELTA_RANGES },
    { section: "Swing",    label: "Near 52-Week High",           sub: "Within X% below high", op: "Below" as NumericOp, compareParam: "52-Week High", deltaRanges: PRICE_NEAR_DELTAS },
    { section: "Swing",    label: "Below 52-Week Low",           sub: "Breakdown",           op: "Below" as NumericOp, compareParam: "52-Week Low",  deltaRanges: PRICE_DELTA_RANGES },
    { section: "Positional", label: "Above All Time High", sub: "New lifetime high",  op: "Above" as NumericOp, compareParam: "All Time High", deltaRanges: PRICE_DELTA_RANGES },
    { section: "Positional", label: "Near All Time High",  sub: "Within X% below ATH", op: "Below" as NumericOp, compareParam: "All Time High", deltaRanges: PRICE_NEAR_DELTAS },
    { section: "Positional", label: "Below All Time Low",  sub: "Lifetime breakdown", op: "Below" as NumericOp, compareParam: "All Time Low",  deltaRanges: PRICE_DELTA_RANGES },
  ] as PresetRange[],

  // ── Price: Open ──────────────────────────────────────────────────
  openRelational: [
    { section: "Intraday", label: "Gap up from Previous Close",   sub: "Open > yesterday's close", op: "Above" as NumericOp, compareParam: "Previous Close", deltaRanges: PRICE_DELTA_RANGES },
    { section: "Intraday", label: "Gap down from Previous Close", sub: "Open < yesterday's close", op: "Below" as NumericOp, compareParam: "Previous Close", deltaRanges: PRICE_DELTA_RANGES },
    { section: "Intraday", label: "Gap up above Previous High",   sub: "Strong gap up",            op: "Above" as NumericOp, compareParam: "Previous High",  deltaRanges: PRICE_DELTA_RANGES },
    { section: "Intraday", label: "Gap down below Previous Low",  sub: "Strong gap down",          op: "Below" as NumericOp, compareParam: "Previous Low",   deltaRanges: PRICE_DELTA_RANGES },
  ] as PresetRange[],

  // ── Price: High ──────────────────────────────────────────────────
  highRelational: [
    { section: "Intraday",   label: "Above Previous High",       sub: "Higher high today",      op: "Above" as NumericOp, compareParam: "Previous High",      deltaRanges: PRICE_DELTA_RANGES },
    { section: "Intraday",   label: "Above Opening Range High",  sub: "Broke out of ORB",       op: "Above" as NumericOp, compareParam: "Opening Range High", deltaRanges: PRICE_DELTA_RANGES },
    { section: "Swing",      label: "At or above 52-Week High",  sub: "52W breakout day",       op: "Above" as NumericOp, compareParam: "52-Week High",       deltaRanges: PRICE_NEAR_DELTAS },
    { section: "Positional", label: "At or above All Time High", sub: "Lifetime breakout day",  op: "Above" as NumericOp, compareParam: "All Time High",      deltaRanges: PRICE_NEAR_DELTAS },
  ] as PresetRange[],

  // ── Price: Low ───────────────────────────────────────────────────
  lowRelational: [
    { section: "Intraday",   label: "Above Previous Low",       sub: "Higher low today",      op: "Above" as NumericOp, compareParam: "Previous Low",      deltaRanges: PRICE_DELTA_RANGES },
    { section: "Intraday",   label: "Below Previous Low",       sub: "Lower low today",       op: "Below" as NumericOp, compareParam: "Previous Low",      deltaRanges: PRICE_DELTA_RANGES },
    { section: "Swing",      label: "At or below 52-Week Low",  sub: "52W breakdown day",     op: "Below" as NumericOp, compareParam: "52-Week Low",       deltaRanges: PRICE_NEAR_DELTAS },
    { section: "Positional", label: "At or below All Time Low", sub: "Lifetime breakdown day", op: "Below" as NumericOp, compareParam: "All Time Low",     deltaRanges: PRICE_NEAR_DELTAS },
  ] as PresetRange[],

  // ── Price: Previous Close/High/Low (yesterday's levels) ──────────
  prevCloseRelational: [
    { section: "Swing",      label: "Above 52-Week High", sub: "Yesterday closed at highs", op: "Above" as NumericOp, compareParam: "52-Week High", deltaRanges: PRICE_NEAR_DELTAS },
    { section: "Swing",      label: "Below 52-Week Low",  sub: "Yesterday closed at lows",  op: "Below" as NumericOp, compareParam: "52-Week Low",  deltaRanges: PRICE_NEAR_DELTAS },
    { section: "Positional", label: "Near All Time High", sub: "Yesterday near ATH",        op: "Below" as NumericOp, compareParam: "All Time High", deltaRanges: PRICE_NEAR_DELTAS },
  ] as PresetRange[],

  // ── Price: Opening Range High/Low ────────────────────────────────
  openingRangeRelational: [
    { section: "Intraday", label: "Above Previous High",  sub: "OR formed above prior high", op: "Above" as NumericOp, compareParam: "Previous High",  deltaRanges: PRICE_DELTA_RANGES },
    { section: "Intraday", label: "Below Previous Low",   sub: "OR formed below prior low",  op: "Below" as NumericOp, compareParam: "Previous Low",   deltaRanges: PRICE_DELTA_RANGES },
    { section: "Intraday", label: "Above Previous Close", sub: "Gap-up opening range",       op: "Above" as NumericOp, compareParam: "Previous Close", deltaRanges: PRICE_DELTA_RANGES },
    { section: "Intraday", label: "Below Previous Close", sub: "Gap-down opening range",     op: "Below" as NumericOp, compareParam: "Previous Close", deltaRanges: PRICE_DELTA_RANGES },
  ] as PresetRange[],

  // ── Futures & Options ────────────────────────────────────────────
  pcr: [
    { label: "Above 1.3",   sub: "Bearish sentiment",  op: "Above"   as NumericOp, v1: 1.3 },
    { label: "1.0 to 1.3",  sub: "Mildly bearish",     op: "Between" as NumericOp, v1: 1.0, v2: 1.3 },
    { label: "0.8 to 1.0",  sub: "Balanced",           op: "Between" as NumericOp, v1: 0.8, v2: 1.0 },
    { label: "Below 0.8",   sub: "Bullish sentiment",  op: "Below"   as NumericOp, v1: 0.8 },
  ] as PresetRange[],
  pcrChange: [
    { label: "Above +0.2",     sub: "Strong put buildup",  op: "Above"   as NumericOp, v1: 0.2 },
    { label: "0 to +0.2",      sub: "Rising puts",         op: "Between" as NumericOp, v1: 0, v2: 0.2 },
    { label: "-0.2 to 0",      sub: "Rising calls",        op: "Between" as NumericOp, v1: -0.2, v2: 0 },
    { label: "Below -0.2",     sub: "Strong call buildup", op: "Below"   as NumericOp, v1: -0.2 },
  ] as PresetRange[],
  pctRollover: [
    { label: "85% or above",  sub: "Strong rollover",   op: "Above"   as NumericOp, v1: 85 },
    { label: "70% to 85%",    sub: "Normal",            op: "Between" as NumericOp, v1: 70, v2: 85 },
    { label: "50% to 70%",    sub: "Weak",              op: "Between" as NumericOp, v1: 50, v2: 70 },
    { label: "Below 50%",     sub: "Unwinding",         op: "Below"   as NumericOp, v1: 50 },
    { label: "Above Previous Month Rollover", sub: "Improving carry", op: "Above" as NumericOp, compareParam: "Previous Month Rollover %", deltaRanges: SHAREHOLDER_DELTA_RANGES },
    { label: "Below Previous Month Rollover", sub: "Weakening carry", op: "Below" as NumericOp, compareParam: "Previous Month Rollover %", deltaRanges: SHAREHOLDER_DELTA_RANGES },
  ] as PresetRange[],
  cashCarryPct: [
    { label: "Above 8%",   sub: "Arb opportunity",    op: "Above"   as NumericOp, v1: 8 },
    { label: "5% to 8%",   sub: "Above risk-free",    op: "Between" as NumericOp, v1: 5, v2: 8 },
    { label: "2% to 5%",   sub: "Fair",               op: "Between" as NumericOp, v1: 2, v2: 5 },
    { label: "Below 2%",   sub: "Reverse arb zone",   op: "Below"   as NumericOp, v1: 2 },
  ] as PresetRange[],
  basisPrice: [
    { label: "Above 0",  sub: "Contango (future > spot)",      op: "Above" as NumericOp, v1: 0 },
    { label: "Below 0",  sub: "Backwardation (future < spot)", op: "Below" as NumericOp, v1: 0 },
    { label: "Above Close", sub: "Premium to spot",   op: "Above" as NumericOp, compareParam: "Close", deltaRanges: PRICE_DELTA_RANGES },
    { label: "Below Close", sub: "Discount to spot",  op: "Below" as NumericOp, compareParam: "Close", deltaRanges: PRICE_DELTA_RANGES },
  ] as PresetRange[],
  fvSpread: [
    { label: "Above 0", sub: "Future overpriced vs FV",  op: "Above" as NumericOp, v1: 0 },
    { label: "Below 0", sub: "Future underpriced vs FV", op: "Below" as NumericOp, v1: 0 },
    { label: "Above Fair Value", sub: "Premium vs FV",  op: "Above" as NumericOp, compareParam: "Fair Value", deltaRanges: PRICE_DELTA_RANGES },
    { label: "Below Fair Value", sub: "Discount vs FV", op: "Below" as NumericOp, compareParam: "Fair Value", deltaRanges: PRICE_DELTA_RANGES },
  ] as PresetRange[],
  rolloverCost: [
    { label: "Above 0", sub: "Positive carry",  op: "Above" as NumericOp, v1: 0 },
    { label: "Below 0", sub: "Negative carry",  op: "Below" as NumericOp, v1: 0 },
  ] as PresetRange[],
  calendarSpread: [
    { label: "Above 0", sub: "Near > Far (backwardation)",  op: "Above" as NumericOp, v1: 0 },
    { label: "Below 0", sub: "Near < Far (contango)",       op: "Below" as NumericOp, v1: 0 },
  ] as PresetRange[],
  oiChangeHybrid: [
    { label: "Strong rise >30%",  sub: "Heavy buildup",      op: "Above"   as NumericOp, v1: 30 },
    { label: "Moderate 15% to 30%", sub: "Meaningful buildup", op: "Between" as NumericOp, v1: 15, v2: 30 },
    { label: "Mild 5% to 15%",    sub: "Gradual buildup",    op: "Between" as NumericOp, v1: 5,  v2: 15 },
    { label: "Flat -5% to +5%",   sub: "Minimal change",     op: "Between" as NumericOp, v1: -5, v2: 5 },
    { label: "Moderate fall -30% to -5%", sub: "Gradual unwinding", op: "Between" as NumericOp, v1: -30, v2: -5 },
    { label: "Strong fall <-30%", sub: "Heavy unwinding",    op: "Below"   as NumericOp, v1: -30 },
    { label: "Long buildup",   sub: "Price ↑ & OI ↑",  op: "Above" as NumericOp, compareParam: "Today's Price Change %", deltaRanges: OI_DELTA_RANGES },
    { label: "Short buildup",  sub: "Price ↓ & OI ↑",  op: "Below" as NumericOp, compareParam: "Today's Price Change %", deltaRanges: OI_DELTA_RANGES },
    { label: "Long unwinding", sub: "Price ↓ & OI ↓",  op: "Below" as NumericOp, compareParam: "Today's Price Change %", deltaRanges: OI_DELTA_RANGES },
    { label: "Short covering", sub: "Price ↑ & OI ↓",  op: "Above" as NumericOp, compareParam: "Today's Price Change %", deltaRanges: OI_DELTA_RANGES },
  ] as PresetRange[],
  oiCountLarge: [
    { label: "50L or above",      sub: "Very heavy interest", op: "Above"   as NumericOp, v1: 5000000 },
    { label: "10L to 50L",        sub: "Heavy interest",      op: "Between" as NumericOp, v1: 1000000, v2: 5000000 },
    { label: "1L to 10L",         sub: "Moderate interest",   op: "Between" as NumericOp, v1: 100000,  v2: 1000000 },
    { label: "Below 1L",          sub: "Light interest",      op: "Below"   as NumericOp, v1: 100000 },
  ] as PresetRange[],
  strikeNearSpot: [
    { label: "ATM",              sub: "Within 1% of Close",        op: "Between" as NumericOp, compareParam: "Close", deltaRanges: [{ label: "1%", min: 0, max: 1 }] },
    { label: "OTM Call",         sub: "1–5% above Close",          op: "Above"   as NumericOp, compareParam: "Close", deltaRanges: STRIKE_PCT_DELTAS },
    { label: "Deep OTM Call",    sub: ">5% above Close",           op: "Above"   as NumericOp, compareParam: "Close", deltaRanges: [{ label: "5–10%", min: 5, max: 10 }, { label: "10%+", min: 10 }, { label: "Custom", custom: true }] },
    { label: "ITM Call / OTM Put", sub: "Below Close",             op: "Below"   as NumericOp, compareParam: "Close", deltaRanges: STRIKE_PCT_DELTAS },
  ] as PresetRange[],
};

const PRICE_PARAMS = [
  "Close","Open","High","Low",
  "Previous Close","Previous High","Previous Low",
  "52-Week High","52-Week Low",
  "1D Return %","1W Return %","1M Return %","3M Return %","1Y Return %","3Y Return %","5Y Return %",
  "Relative Strength vs Nifty50","Relative Strength vs Sector",
  "All Time High","All Time Low",
  "% from SMA","% from EMA","% from 52W High","% from 52W Low",
  "Close Position in Range %",
  "Opening Range High","Opening Range Low",
  "High over n candles","Low over n candles",
];

const PRESETS_BY_PARAM: Record<string, PresetRange[]> = {
  "Promoter Holding": PCT_BUCKET.promoter,
  "FII Holding": PCT_BUCKET.fiiDii,
  "DII Holding": PCT_BUCKET.fiiDii,
  "Public Holding": PCT_BUCKET.publicHolding,
  "Change in FII Holding": PCT_BUCKET.changeInstQoQ,
  "Change in DII Holding": PCT_BUCKET.changeInstQoQ,
  "Change in Promoter Holding": PCT_BUCKET.changePromoterQoQ,
  "Unpledged Promoter Holding": PCT_BUCKET.unpledged,
  "Pledged Percentage": PCT_BUCKET.pledged,
  "Number of Shareholders": PCT_BUCKET.shareholdersCurrent,
  "Number of Shareholders Preceding Quarter": PCT_BUCKET.shareholderCount,
  "Number of Shareholders 1 Year Back": PCT_BUCKET.shareholderCount,
  "Change in FII Holding (3 Years)": PCT_BUCKET.change3Y,
  "Change in DII Holding (3 Years)": PCT_BUCKET.change3Y,

  // ── Valuation ────────────────────────────────────────────────────
  "Market Capitalization": PCT_BUCKET.marketCapCurrent,
  "PE Ratio (TTM)": PCT_BUCKET.peCurrent,
  "Forward PE Ratio": PCT_BUCKET.peLike,
  "PB Ratio": PCT_BUCKET.pbCurrent,
  "Price / Sales": PCT_BUCKET.psCurrent,
  "Debt to equity": PCT_BUCKET.debtEquity,
  "Earnings yield": PCT_BUCKET.earningsYield,
  "Dividend Yield": PCT_BUCKET.divYieldCurrent,
  "Price to Quarterly Earning": PCT_BUCKET.peLike,
  "Price / Free Cash Flow": PCT_BUCKET.priceFcf,
  "Price / CFO": PCT_BUCKET.priceFcf,
  "Return on assets": PCT_BUCKET.returnOnAssetsCurrent,
  "Return on equity": PCT_BUCKET.returnOnEquityCurrent,
  "ROIC": PCT_BUCKET.returnOnX,
  "ROCE": PCT_BUCKET.returnOnCapitalCurrent,
  "Financial leverage": PCT_BUCKET.financialLev,
  "Book value": PCT_BUCKET.bookValueCurrent,
  "Inventory turnover ratio": PCT_BUCKET.invTurnoverCurrent,
  "Quick ratio": PCT_BUCKET.quickRatio,
  "Exports percentage": PCT_BUCKET.exportsPctCurrent,
  "Piotroski score": PCT_BUCKET.score0to9,
  "G Factor": PCT_BUCKET.score0to9,
  "Asset Turnover Ratio": PCT_BUCKET.assetTurnover,
  "EV/EBITDA Ratio": PCT_BUCKET.evMultiple,
  "Enterprise Value": PCT_BUCKET.enterpriseValue,
  "EV / EBIT Ratio": PCT_BUCKET.evMultiple,
  "EV / Revenue Ratio": PCT_BUCKET.evRevenue,
  "EV / Invested Capital": PCT_BUCKET.evMultiple,
  "EV / Free Cash Flow": PCT_BUCKET.evMultiple,
  "Industry PE": PCT_BUCKET.peLike,
  "Industry PB": PCT_BUCKET.pb,
  "Industry PS": PCT_BUCKET.ps,
  "Industry Dividend Yield": PCT_BUCKET.divYield,
  "Graham Number": PCT_BUCKET.grahamVsPrice,
  "Working Capital Days": PCT_BUCKET.workingCapDaysCurrent,
  "Cash Conversion Cycle": PCT_BUCKET.daysLong,
  "Days Payable Outstanding": PCT_BUCKET.daysLong,
  "Days Receivable Outstanding": PCT_BUCKET.daysShort,
  "Days Inventory Outstanding": PCT_BUCKET.daysShort,
  "Earning Power": PCT_BUCKET.bookValueCr,
  "Debtor days": PCT_BUCKET.debtorDaysCurrent,
  "Book value preceding year": PCT_BUCKET.bookValueCr,
  "Return on capital employed preceding year": PCT_BUCKET.returnOnX,
  "Return on assets preceding year": PCT_BUCKET.returnOnX,
  "Return on equity preceding year": PCT_BUCKET.returnOnX,
  "Number of Shareholders preceding quarter": PCT_BUCKET.shareholderCount,
  "Average return on equity 5Years": PCT_BUCKET.returnOnX,
  "Average return on equity 3Years": PCT_BUCKET.returnOnX,
  "Number of equity shares 10years back": PCT_BUCKET.countShares,
  "Book value 3years back": PCT_BUCKET.bookValueCr,
  "Book value 5years back": PCT_BUCKET.bookValueCr,
  "Book value 10years back": PCT_BUCKET.bookValueCr,
  "Inventory turnover ratio 3Years back": PCT_BUCKET.invTurnover,
  "Inventory turnover ratio 5Years back": PCT_BUCKET.invTurnover,
  "Inventory turnover ratio 7Years back": PCT_BUCKET.invTurnover,
  "Inventory turnover ratio 10Years back": PCT_BUCKET.invTurnover,
  "Exports percentage 3Years back": PCT_BUCKET.exportsPct,
  "Exports percentage 5Years back": PCT_BUCKET.exportsPct,
  "Average 5years dividend": PCT_BUCKET.divYield,
  "Average return on capital employed 3Years": PCT_BUCKET.returnOnX,
  "Average return on capital employed 5Years": PCT_BUCKET.returnOnX,
  "Average return on capital employed 7Years": PCT_BUCKET.returnOnX,
  "Average return on capital employed 10Years": PCT_BUCKET.returnOnX,
  "Average return on equity 10Years": PCT_BUCKET.returnOnX,
  "Average return on equity 7Years": PCT_BUCKET.returnOnX,
  "Return on equity 5years growth": PCT_BUCKET.returnOnX,
  "OPM 5Year": PCT_BUCKET.opmPct,
  "OPM 10Year": PCT_BUCKET.opmPct,
  "Average dividend payout 3years": PCT_BUCKET.avgDivPayout,
  "Average debtor days 3years": PCT_BUCKET.daysShort,
  "Debtor days 3years back": PCT_BUCKET.daysShort,
  "Debtor days 5years back": PCT_BUCKET.daysShort,
  "Return on assets 5years": PCT_BUCKET.returnOnX,
  "Return on assets 3years": PCT_BUCKET.returnOnX,
  "Average Working Capital Days 3years": PCT_BUCKET.daysLong,

  // ── Price: candle params (relational) ────────────────────────────
  "Close": PCT_BUCKET.closeRelational,
  "Open": PCT_BUCKET.openRelational,
  "High": PCT_BUCKET.highRelational,
  "Low": PCT_BUCKET.lowRelational,
  "Previous Close": PCT_BUCKET.prevCloseRelational,
  "Previous High":  PCT_BUCKET.prevCloseRelational,
  "Previous Low":   PCT_BUCKET.prevCloseRelational,
  "Opening Range High": PCT_BUCKET.openingRangeRelational,
  "Opening Range Low":  PCT_BUCKET.openingRangeRelational,

  // ── Price: returns & derived % ───────────────────────────────────
  "1D Return %": PCT_BUCKET.returnPct,
  "1W Return %": PCT_BUCKET.returnPct,
  "1M Return %": PCT_BUCKET.returnPct,
  "3M Return %": PCT_BUCKET.returnPct,
  "1Y Return %": PCT_BUCKET.returnPct,
  "3Y Return %": PCT_BUCKET.returnPct,
  "5Y Return %": PCT_BUCKET.returnPct,
  "Relative Strength vs Nifty50": PCT_BUCKET.returnPct,
  "Relative Strength vs Sector": PCT_BUCKET.returnPct,
  "% from SMA": PCT_BUCKET.pctFromLevel,
  "% from EMA": PCT_BUCKET.pctFromLevel,
  "% from 52W High": PCT_BUCKET.pctFromLevel,
  "% from 52W Low": PCT_BUCKET.pctFromLevel,
  "Close Position in Range %": PCT_BUCKET.closePosInRange,

  // ── Futures & Options ────────────────────────────────────────────
  "Fair Value": PCT_BUCKET.basisPrice,
  "Future Close Price": PCT_BUCKET.closeRelational,
  "Future Open Interest": PCT_BUCKET.oiCountLarge,
  "1D Change in Future OI": PCT_BUCKET.oiChangeHybrid,
  "1W Change in Future OI": PCT_BUCKET.oiChangeHybrid,
  "Future Volume": PCT_BUCKET.oiCountLarge,
  "1D Change in Future Volume": PCT_BUCKET.oiChangeHybrid,
  "1W Change in Future Volume": PCT_BUCKET.oiChangeHybrid,
  "Basis": PCT_BUCKET.basisPrice,
  "Fair Value Spread": PCT_BUCKET.fvSpread,
  "Cash & Carry Profit": PCT_BUCKET.cashCarryPct,
  "Rollover Cost": PCT_BUCKET.rolloverCost,
  "Percentage Rollover": PCT_BUCKET.pctRollover,
  "Calendar Spread": PCT_BUCKET.calendarSpread,
  "Call Open Interest": PCT_BUCKET.oiCountLarge,
  "Put Open Interest": PCT_BUCKET.oiCountLarge,
  "1D Change in Call OI": PCT_BUCKET.oiChangeHybrid,
  "1D Change in Put OI": PCT_BUCKET.oiChangeHybrid,
  "1W Change in Call OI": PCT_BUCKET.oiChangeHybrid,
  "1W Change in Put OI": PCT_BUCKET.oiChangeHybrid,
  "Highest Call OI Strike": PCT_BUCKET.strikeNearSpot,
  "Highest Put OI Strike": PCT_BUCKET.strikeNearSpot,
  "Highest 1D OI Change CE Strike": PCT_BUCKET.strikeNearSpot,
  "Highest 1D OI Change PE Strike": PCT_BUCKET.strikeNearSpot,
  "Highest 1W OI Change CE Strike": PCT_BUCKET.strikeNearSpot,
  "Highest 1W OI Change PE Strike": PCT_BUCKET.strikeNearSpot,
  "Put Call Ratio": PCT_BUCKET.pcr,
  "1D Change in Put Call Ratio": PCT_BUCKET.pcrChange,
};

const FUTURES_OPTIONS_PARAMS = [
  "Fair Value",
  "Future Close Price",
  "Future Open Interest",
  "1D Change in Future OI",
  "1W Change in Future OI",
  "Future Volume",
  "1D Change in Future Volume",
  "1W Change in Future Volume",
  "Basis",
  "Fair Value Spread",
  "Cash & Carry Profit",
  "Rollover Cost",
  "Percentage Rollover",
  "Calendar Spread",
  "Call Open Interest",
  "Put Open Interest",
  "1D Change in Call OI",
  "1D Change in Put OI",
  "1W Change in Call OI",
  "1W Change in Put OI",
  "Highest Call OI Strike",
  "Highest Put OI Strike",
  "Highest 1D OI Change CE Strike",
  "Highest 1D OI Change PE Strike",
  "Highest 1W OI Change CE Strike",
  "Highest 1W OI Change PE Strike",
  "Put Call Ratio",
  "1D Change in Put Call Ratio",
];

const SHAREHOLDING_PARAMS = [
  "Promoter Holding", "FII Holding", "DII Holding", "Public Holding",
  "Change in FII Holding", "Change in DII Holding", "Change in Promoter Holding",
  "Unpledged Promoter Holding", "Pledged Percentage",
  "Number of Shareholders", "Number of Shareholders Preceding Quarter", "Number of Shareholders 1 Year Back",
  "Number of Shareholders preceding quarter", "Number of equity shares 10years back",
  "Change in FII Holding (3 Years)", "Change in DII Holding (3 Years)",
];

function presetPhrase(p: PresetRange, unit: string, delta?: DeltaRange): string {
  const fmt = (n: number) => {
    const num = Math.abs(n) >= 1000 ? formatNum(n) : String(n);
    if (unit === "days") return `${num} days`;
    if (unit === "Cr") return `${num} Cr`;
    if (unit === "₹") return `₹${num}`;
    return num + unit; // "", "%", "x"
  };
  if (p.compareParam) {
    const suffix =
      delta && (delta.min != null || delta.max != null)
        ? ` by ${delta.label}`
        : "";
    if (p.op === "Between") {
      if (delta) return `is within ${delta.label} of ${p.compareParam}`;
      return `is near ${p.compareParam}`;
    }
    if (p.op === "Above") return `is above ${p.compareParam}${suffix}`;
    if (p.op === "Below") return `is below ${p.compareParam}${suffix}`;
    if (p.op === "Crosses Above") return `crosses above ${p.compareParam}${suffix}`;
    if (p.op === "Crosses Below") return `crosses below ${p.compareParam}${suffix}`;
    return `equals ${p.compareParam}`;
  }
  if (p.op === "Between" && p.v1 != null && p.v2 != null) return `is between ${fmt(p.v1)} and ${fmt(p.v2)}`;
  if (p.op === "Above" && p.v1 != null) return `is above ${fmt(p.v1)}`;
  if (p.op === "Below" && p.v1 != null) return `is below ${fmt(p.v1)}`;
  if (p.v1 != null) return `equals ${fmt(p.v1)}`;
  return "";
}

function NumericConfigSheet({
  param, unit, relatedParams, simpleCustom, onClose, onAdd,
}: {
  param: string;
  unit: string;
  relatedParams?: string[];
  simpleCustom?: boolean;
  onClose: () => void;
  onAdd: (f: Filter) => void;
}) {
  const presets = PRESETS_BY_PARAM[param] ?? [];
  const [bucket, setBucket] = useState<string>("preset_0");
  const [customOp, setCustomOp] = useState<NumericOp>("Above");
  const [compareMode, setCompareMode] = useState<"value" | "param">("value");
  const [customVal, setCustomVal] = useState<string>("");
  const [customMin, setCustomMin] = useState<string>("");
  const [customMax, setCustomMax] = useState<string>("");
  const otherParams = (relatedParams ?? SHAREHOLDING_PARAMS).filter((p) => p !== param);
  const [compareParam, setCompareParam] = useState<string>(otherParams[0] ?? "");
  const [deltaByPreset, setDeltaByPreset] = useState<Record<number, number>>({});
  const [customDeltaByPreset, setCustomDeltaByPreset] = useState<Record<number, { min: string; max: string }>>({});
  // Price-tab timeframe selector (only rendered for candle params).
  const showTimeframe = PRICE_CANDLE_PARAMS.has(param);
  const showLookback = PRICE_LOOKBACK_PARAMS.has(param);
  const [timeframe, setTimeframe] = useState<PriceTimeframe>("1D");
  const [lookbackN, setLookbackN] = useState<string>("20");

  const fmt = (v: string) => v === "" ? (unit ? `_${unit}` : "_") : `${v}${unit}`;

  let phrase: string;
  if (bucket !== "custom") {
    const idx = Number(bucket.replace("preset_", ""));
    const p = presets[idx];
    const dIdx = deltaByPreset[idx] ?? 0;
    const delta = p?.deltaRanges?.[dIdx];
    phrase = p ? presetPhrase(p, unit, delta) : "";
  } else if (simpleCustom) {
    phrase = `is between ${fmt(customMin)} and ${fmt(customMax)}`;
  } else {
    if (compareMode === "param") {
      phrase = `${numericOpPhrase(customOp)} ${compareParam}`;
      if (customOp === "Between") {
        phrase = `is between ${compareParam} and ${compareParam}`; // edge case — not meaningful
      }
    } else {
      if (customOp === "Between") {
        phrase = `is between ${fmt(customMin)} and ${fmt(customMax)}`;
      } else {
        phrase = `${numericOpPhrase(customOp)} ${fmt(customVal)}`;
      }
    }
  }

  const tfPrefix = showTimeframe ? `[${timeframe}] ` : "";
  const lbPrefix = showLookback && lookbackN ? `over ${lookbackN} candles · ` : "";
  const finalValue = `${tfPrefix}${lbPrefix}${phrase}`;

  return (
    <BottomSheetShell
      title={param}
      onClose={onClose}
      actionLabel="Add filter"
      onAction={() => onAdd({ label: param, value: finalValue })}
    >
      <div style={{ padding: "4px 16px 16px" }}>
        {showTimeframe && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 6 }}>Timeframe</div>
            <div className="flex" style={{ gap: 6, flexWrap: "wrap" }}>
              {PRICE_TIMEFRAME_OPTIONS.map((tf) => {
                const active = tf === timeframe;
                return (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => setTimeframe(tf)}
                    style={{
                      height: 28, padding: "0 12px", borderRadius: 14,
                      border: `1px solid ${active ? C.brandPurple : C.ui3}`,
                      background: active ? C.bgPlusChipBg : C.bgDefault,
                      color: active ? C.brandPurple : C.textPrimary,
                      fontSize: 12, fontWeight: active ? 600 : 500, cursor: "pointer",
                    }}
                  >
                    {tf}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        {showLookback && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 6 }}>Lookback (n candles)</div>
            <input
              type="number"
              inputMode="numeric"
              placeholder="e.g. 20"
              value={lookbackN}
              onChange={(e) => setLookbackN(e.target.value)}
              style={{
                width: 120, height: 32, padding: "0 10px",
                borderRadius: 6, border: `1px solid ${C.ui3}`,
                background: C.bgDefault, fontSize: 12, color: C.textPrimary,
                outline: "none",
              }}
            />
          </div>
        )}
        {presets.map((p, i) => {
          const v = `preset_${i}`;
          const active = bucket === v;
          const prevSection = i > 0 ? presets[i - 1].section : undefined;
          const showSection = p.section && p.section !== prevSection;
          return (
            <div key={v}>
              {showSection && (
                <div
                  style={{
                    padding: "10px 4px 6px",
                    fontSize: 11,
                    fontWeight: 600,
                    color: C.brandPurple,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                  }}
                >
                  {p.section}
                </div>
              )}
              <button
                type="button"
                onClick={() => setBucket(v)}
                className="flex items-center w-full"
                style={{ padding: "10px 4px", gap: 12, background: "transparent", border: "none", cursor: "pointer" }}
              >
                <div style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
                  <div style={{ fontSize: 14, color: C.textPrimary, fontWeight: active ? 600 : 500 }}>
                    {p.label}
                  </div>
                  <div style={{ fontSize: 11, color: C.textSecondary, marginTop: 2 }}>
                    {p.sub}
                  </div>
                </div>
                <span
                  className="flex items-center justify-center shrink-0"
                  style={{
                    width: 20, height: 20, borderRadius: 10,
                    border: `2px solid ${active ? C.brandPurple : C.ui4}`,
                  }}
                >
                  {active && <span style={{ width: 10, height: 10, borderRadius: 5, background: C.brandPurple }} />}
                </span>
              </button>
              {active && p.deltaRanges && (
                <div
                  style={{
                    padding: "6px 4px 12px",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                  }}
                >
                  <div style={{ width: "100%", fontSize: 11, color: C.textSecondary, marginBottom: 4 }}>
                    By how much?
                  </div>
                  {p.deltaRanges.map((d, di) => {
                    const dActive = (deltaByPreset[i] ?? 0) === di;
                    return (
                      <button
                        key={d.label}
                        type="button"
                        onClick={() => setDeltaByPreset((prev) => ({ ...prev, [i]: di }))}
                        style={{
                          height: 28,
                          padding: "0 10px",
                          borderRadius: 14,
                          border: `1px solid ${dActive ? C.brandPurple : C.ui3}`,
                          background: dActive ? C.bgPlusChipBg : C.bgDefault,
                          color: dActive ? C.brandPurple : C.textPrimary,
                          fontSize: 12,
                          fontWeight: dActive ? 600 : 500,
                          cursor: "pointer",
                        }}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                  {(() => {
                    const activeDelta = p.deltaRanges[deltaByPreset[i] ?? 0];
                    if (!activeDelta?.custom) return null;
                    const val = customDeltaByPreset[i] ?? { min: "", max: "" };
                    const updateVal = (patch: Partial<typeof val>) =>
                      setCustomDeltaByPreset((prev) => ({ ...prev, [i]: { ...val, ...patch } }));
                    return (
                      <div style={{ width: "100%", marginTop: 4, display: "flex", alignItems: "center", gap: 8 }}>
                        <input
                          type="number"
                          inputMode="decimal"
                          placeholder="Min %"
                          value={val.min}
                          onChange={(e) => updateVal({ min: e.target.value })}
                          style={{
                            flex: 1, height: 32, padding: "0 10px",
                            borderRadius: 6, border: `1px solid ${C.ui3}`,
                            background: C.bgDefault, fontSize: 12, color: C.textPrimary,
                            outline: "none",
                          }}
                        />
                        <span style={{ fontSize: 12, color: C.textSecondary }}>to</span>
                        <input
                          type="number"
                          inputMode="decimal"
                          placeholder="Max %"
                          value={val.max}
                          onChange={(e) => updateVal({ max: e.target.value })}
                          style={{
                            flex: 1, height: 32, padding: "0 10px",
                            borderRadius: 6, border: `1px solid ${C.ui3}`,
                            background: C.bgDefault, fontSize: 12, color: C.textPrimary,
                            outline: "none",
                          }}
                        />
                      </div>
                    );
                  })()}
                </div>
              )}
              <div style={{ height: 1, background: C.ui2 }} />
            </div>
          );
        })}

        {/* Custom row */}
        <button
          type="button"
          onClick={() => setBucket("custom")}
          className="flex items-center w-full"
          style={{ padding: "10px 4px", gap: 12, background: "transparent", border: "none", cursor: "pointer" }}
        >
          <div style={{ flex: 1, textAlign: "left" }}>
            <div style={{ fontSize: 14, color: C.textPrimary, fontWeight: bucket === "custom" ? 600 : 500 }}>
              Custom
            </div>
            <div style={{ fontSize: 11, color: C.textSecondary, marginTop: 2 }}>
              {simpleCustom ? "Enter your own min–max range" : "Pick condition and compare to value or another parameter"}
            </div>
          </div>
          <span
            className="flex items-center justify-center shrink-0"
            style={{
              width: 20, height: 20, borderRadius: 10,
              border: `2px solid ${bucket === "custom" ? C.brandPurple : C.ui4}`,
            }}
          >
            {bucket === "custom" && <span style={{ width: 10, height: 10, borderRadius: 5, background: C.brandPurple }} />}
          </span>
        </button>

        {bucket === "custom" && simpleCustom && (
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="number"
              inputMode="decimal"
              placeholder={unit ? `Min ${unit}` : "Min"}
              value={customMin}
              onChange={(e) => setCustomMin(e.target.value)}
              style={{
                flex: 1, height: 32, padding: "0 10px",
                borderRadius: 6, border: `1px solid ${C.ui3}`,
                background: C.bgDefault, fontSize: 12, color: C.textPrimary,
                outline: "none",
              }}
            />
            <span style={{ fontSize: 12, color: C.textSecondary }}>to</span>
            <input
              type="number"
              inputMode="decimal"
              placeholder={unit ? `Max ${unit}` : "Max"}
              value={customMax}
              onChange={(e) => setCustomMax(e.target.value)}
              style={{
                flex: 1, height: 32, padding: "0 10px",
                borderRadius: 6, border: `1px solid ${C.ui3}`,
                background: C.bgDefault, fontSize: 12, color: C.textPrimary,
                outline: "none",
              }}
            />
          </div>
        )}

        {bucket === "custom" && !simpleCustom && (
          <div
            style={{
              marginTop: 8, padding: 12, borderRadius: 10,
              border: `1px solid ${C.ui3}`, background: C.bgMuted,
            }}
          >
            <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 4 }}>Condition</div>
            <SelectField
              value={customOp}
              onChange={(v) => setCustomOp(v as NumericOp)}
              options={NUMERIC_OPS.map((x) => ({ value: x, label: x }))}
            />

            <div style={{ height: 12 }} />
            <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 6 }}>Compare to</div>
            <div className="flex" style={{ gap: 8, marginBottom: 10 }}>
              {(["value", "param"] as const).map((m) => {
                const active = compareMode === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setCompareMode(m)}
                    style={{
                      flex: 1, height: 32, borderRadius: 16,
                      border: `1px solid ${active ? C.brandPurple : C.ui3}`,
                      background: active ? C.bgPlusChipBg : C.bgDefault,
                      color: active ? C.brandPurple : C.textPrimary,
                      fontSize: 13, fontWeight: active ? 600 : 500, cursor: "pointer",
                    }}
                  >
                    {m === "value" ? "Value" : "Another parameter"}
                  </button>
                );
              })}
            </div>

            {compareMode === "value" ? (
              customOp === "Between" ? (
                <div className="flex" style={{ gap: 10 }}>
                  <NumericField label="Min" unit={unit} value={customMin} onChange={setCustomMin} placeholder="e.g. 25" />
                  <NumericField label="Max" unit={unit} value={customMax} onChange={setCustomMax} placeholder="e.g. 75" />
                </div>
              ) : (
                <NumericField
                  label="Value"
                  unit={unit}
                  value={customVal}
                  onChange={setCustomVal}
                  placeholder={unit === "%" ? "e.g. 50" : "e.g. 10000"}
                />
              )
            ) : (
              <>
                <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 4 }}>Parameter</div>
                <SelectField
                  value={compareParam}
                  onChange={setCompareParam}
                  options={otherParams.map((p) => ({ value: p, label: p }))}
                />
              </>
            )}
          </div>
        )}

        {/* Preview */}
        <div
          style={{
            marginTop: 16, padding: "10px 12px", borderRadius: 10,
            background: C.bgMuted, fontSize: 13, color: C.textPrimary, lineHeight: 1.4,
          }}
        >
          <span style={{ fontWeight: 700 }}>{param}</span>
          <span style={{ color: C.textSecondary }}> {phrase.startsWith("is ") || phrase.startsWith("equals") ? "" : ""}</span>
          <span> </span>
          <span style={{ fontWeight: 500 }}>{phrase}</span>
        </div>
      </div>
    </BottomSheetShell>
  );
}

function NumericField({
  label, unit, value, onChange, placeholder,
}: {
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex-1" style={{ minWidth: 0 }}>
      <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 4 }}>{label}</div>
      <div
        className="flex items-center"
        style={{
          height: 44,
          border: `1px solid ${C.ui3}`,
          borderRadius: 8,
          padding: "0 12px",
          background: C.bgDefault,
          gap: 6,
        }}
      >
        <input
          type="number"
          inputMode="decimal"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            flex: 1, minWidth: 0, height: "100%", border: "none", outline: "none",
            fontSize: 14, color: C.textPrimary, background: "transparent",
          }}
        />
        {unit && (
          <span style={{ fontSize: 14, color: C.textSecondary, fontWeight: 500 }}>{unit}</span>
        )}
      </div>
    </div>
  );
}

function CandlestickConfigSheet({
  pattern, onClose, onAdd,
}: {
  pattern: string;
  onClose: () => void;
  onAdd: (f: Filter) => void;
}) {
  const [timeframe, setTimeframe] = useState<string>("1D");
  return (
    <BottomSheetShell
      title={pattern}
      onClose={onClose}
      actionLabel="Add filter"
      onAction={() => onAdd({ label: pattern, value: `detected on ${TIMEFRAME_LABELS[timeframe] ?? timeframe}` })}
    >
      <div style={{ padding: "4px 16px 16px" }}>
        <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 4 }}>Timeframe</div>
        <SelectField
          value={timeframe}
          onChange={setTimeframe}
          options={TIMEFRAME_OPTIONS.map((tf) => ({ value: tf, label: TIMEFRAME_LABELS[tf] ?? tf }))}
        />
        <div
          style={{
            marginTop: 16, padding: "10px 12px", borderRadius: 10,
            background: C.bgMuted, fontSize: 13, color: C.textPrimary, lineHeight: 1.4,
          }}
        >
          <span style={{ fontWeight: 700 }}>{pattern}</span>
          <span style={{ color: C.textSecondary }}> detected on </span>
          <span style={{ fontWeight: 700 }}>{TIMEFRAME_LABELS[timeframe] ?? timeframe}</span>
        </div>
      </div>
    </BottomSheetShell>
  );
}

// ───── Indicator config bottom sheet (EMA / SMA) ─────
const LENGTH_OPTIONS = [3, 5, 9, 14, 20, 21, 50, 100, 200];
const TIMEFRAME_OPTIONS = ["1m", "5m", "15m", "30m", "1D"];
const CONDITIONS = ["Above", "Below", "Crosses above", "Crosses below", "Between"] as const;
type Condition = (typeof CONDITIONS)[number];
type CompareType = "Price" | "MA" | "Indicator" | "Value" | "Range";
export const _COMPARE_INDICATORS = [
  "Bollinger Band (Upper)",
  "Bollinger Band (Lower)",
  "Donchian (Upper)",
  "Donchian (Lower)",
  "Pivot (P)",
  "Pivot (R1)",
  "Pivot (S1)",
  "VWAP",
];

// MA preset rows (for EMA/SMA config sheet)
type MAPresetKey = "above_price" | "above_ema" | "below_price" | "below_ema" | "crossed_above" | "crossed_below";

const MA_PRESETS: { key: MAPresetKey; label: string; sub: string }[] = [
  { key: "above_price",   label: "Above Price",          sub: "Close trades above the average" },
  { key: "above_ema",     label: "Above EMA",            sub: "Compare against another EMA" },
  { key: "below_price",   label: "Below Price",          sub: "Close trades below the average" },
  { key: "below_ema",     label: "Below EMA",            sub: "Compare against another EMA" },
  { key: "crossed_above", label: "Crossed above EMA",    sub: "Bullish crossover event" },
  { key: "crossed_below", label: "Crossed below EMA",    sub: "Bearish crossover event" },
];

const ABOVE_PRICE_DELTAS: { value: string; label: string }[] = [
  { value: "any",     label: "Any amount" },
  { value: "0_10",    label: "0%–10%" },
  { value: "10_25",   label: "10%–25%" },
  { value: "25_50",   label: "25%–50%" },
  { value: "50_plus", label: "50% or more" },
  { value: "custom",  label: "Custom" },
];

const MA_CUSTOM_CONDITIONS = [
  "Above", "Below", "Above or equal", "Above or below",
  "Crossed above", "Crossed below", "Above by %", "Below by %", "Between",
] as const;
type MACustomCondition = (typeof MA_CUSTOM_CONDITIONS)[number];

function IndicatorConfigSheet({
  indicator,
  onClose,
  onAdd,
}: {
  indicator: "SMA" | "EMA";
  onClose: () => void;
  onAdd: (f: Filter) => void;
}) {
  const [length, setLength] = useState<number>(50);
  const [timeframe, setTimeframe] = useState<string>("1D");
  const [bucket, setBucket] = useState<MAPresetKey | "custom" | null>(null);

  // Above Price delta selection
  const [aboveDelta, setAboveDelta] = useState<string>("any");
  const [aboveCustomMin, setAboveCustomMin] = useState<string>("");
  const [aboveCustomMax, setAboveCustomMax] = useState<string>("");

  // Another EMA (for Above EMA / Below EMA / Crossed above/below EMA)
  const [otherLen, setOtherLen] = useState<number>(200);
  const [otherTf, setOtherTf] = useState<string>("1D");

  // Custom
  const [customCond, setCustomCond] = useState<MACustomCondition>("Above");
  const [customMin, setCustomMin] = useState<string>("");
  const [customMax, setCustomMax] = useState<string>("");
  const [customInd, setCustomInd] = useState<string | null>(null);
  const [customIndLen, setCustomIndLen] = useState<number>(20);
  const [customIndTf, setCustomIndTf] = useState<string>("1D");
  const [moreOpen, setMoreOpen] = useState<boolean>(false);

  const customIndNeedsLength = customInd ? LENGTH_TIMEFRAME_INDICATORS.has(customInd) : false;
  const customIndIsBollinger = customInd ? customInd.startsWith("Bollinger") : false;
  const customIndSuffix = customInd && customIndNeedsLength
    ? customIndIsBollinger ? ` (${customIndLen}, 2)` : ` (${customIndLen})`
    : "";

  function computePhrase(): string {
    if (bucket === null) return "";
    if (bucket === "above_price") {
      if (aboveDelta === "any") return "is above Price";
      if (aboveDelta === "custom") {
        return `is above Price by ${aboveCustomMin || "min"}%–${aboveCustomMax || "max"}%`;
      }
      const d = ABOVE_PRICE_DELTAS.find((x) => x.value === aboveDelta);
      return `is above Price by ${d?.label ?? ""}`;
    }
    if (bucket === "below_price") return "is below Price";
    if (bucket === "above_ema")     return `is above EMA(${otherLen}, ${otherTf})`;
    if (bucket === "below_ema")     return `is below EMA(${otherLen}, ${otherTf})`;
    if (bucket === "crossed_above") return `crosses above EMA(${otherLen}, ${otherTf})`;
    if (bucket === "crossed_below") return `crosses below EMA(${otherLen}, ${otherTf})`;
    // custom
    if (customCond === "Between") {
      return `is between ${customMin || "min"} and ${customMax || "max"}`;
    }
    const rhs = !customInd
      ? "Other indicator"
      : customInd === "Value"
        ? (customMin || "Value")
        : `${customInd}${customIndSuffix}`;
    const pctSuffix = customCond === "Above by %" || customCond === "Below by %" ? ` by ${customMin || "x"}%` : "";
    const condLower = customCond.replace(" by %", "").toLowerCase();
    const verb =
      condLower === "above" ? "is above" :
      condLower === "below" ? "is below" :
      condLower === "above or equal" ? "is ≥" :
      condLower === "above or below" ? "is above or below" :
      condLower === "crossed above" ? "crosses above" :
      condLower === "crossed below" ? "crosses below" :
      condLower;
    return `${verb} ${rhs}${pctSuffix}`;
  }

  const phrase = computePhrase();

  return (
    <div
      className="absolute inset-0 flex flex-col"
      style={{ zIndex: 50, background: "rgba(0,0,0,0.4)" }}
      onClick={onClose}
    >
      <div className="flex-1" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col"
        style={{
          background: C.bgDefault,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          maxHeight: "85%",
          overflowY: "auto",
        }}
      >
        {/* Drag handle */}
        <div className="flex items-center justify-center" style={{ paddingTop: 8, paddingBottom: 4 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: C.ui3 }} />
        </div>

        {/* Title */}
        <div className="flex items-center" style={{ padding: "8px 16px 4px", gap: 8 }}>
          <div className="flex flex-col flex-1">
            <span
              style={{
                fontFamily: "'Messina Sans', 'Inter', sans-serif",
                fontWeight: 700, fontSize: 18, color: C.textPrimary,
              }}
            >
              {indicator === "SMA" ? "Simple Moving Average" : "Exponential Moving Average"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center"
            style={{ width: 32, height: 32, borderRadius: 16 }}
          >
            <X size={18} color={C.textSecondary} />
          </button>
        </div>

        {/* Length + Timeframe for the MA being tested */}
        <div style={{ padding: "4px 16px 0" }}>
          <div className="flex" style={{ gap: 10 }}>
            <div className="flex-1" style={{ minWidth: 0 }}>
              <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 4 }}>Length</div>
              <SelectField
                value={String(length)}
                onChange={(v) => setLength(Number(v))}
                options={LENGTH_OPTIONS.map((n) => ({ value: String(n), label: String(n) }))}
              />
            </div>
            <div className="flex-1" style={{ minWidth: 0 }}>
              <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 4 }}>Timeframe</div>
              <SelectField
                value={timeframe}
                onChange={setTimeframe}
                options={TIMEFRAME_OPTIONS.map((tf) => ({ value: tf, label: TIMEFRAME_LABELS[tf] ?? tf }))}
              />
            </div>
          </div>
        </div>

        {/* Preset rows */}
        <div style={{ padding: "8px 16px 0" }}>
          {MA_PRESETS.map((p) => {
            const active = bucket === p.key;
            return (
              <div key={p.key}>
                <button
                  type="button"
                  onClick={() => setBucket(p.key)}
                  className="flex items-center w-full"
                  style={{ padding: "10px 4px", gap: 12, background: "transparent", border: "none", cursor: "pointer" }}
                >
                  <div style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
                    <div style={{ fontSize: 14, color: C.textPrimary, fontWeight: active ? 600 : 500 }}>
                      {p.label}
                    </div>
                    <div style={{ fontSize: 11, color: C.textSecondary, marginTop: 2 }}>{p.sub}</div>
                  </div>
                  <span
                    className="flex items-center justify-center shrink-0"
                    style={{ width: 20, height: 20, borderRadius: 10, border: `2px solid ${active ? C.brandPurple : C.ui4}` }}
                  >
                    {active && <span style={{ width: 10, height: 10, borderRadius: 5, background: C.brandPurple }} />}
                  </span>
                </button>

                {/* Above Price: delta chips */}
                {active && p.key === "above_price" && (
                  <div style={{ padding: "4px 4px 12px" }}>
                    <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 8 }}>By how much?</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {ABOVE_PRICE_DELTAS.map((d) => {
                      const dActive = aboveDelta === d.value;
                      return (
                        <button
                          key={d.value}
                          type="button"
                          onClick={() => setAboveDelta(d.value)}
                          style={{
                            height: 28, padding: "0 10px", borderRadius: 14,
                            border: `1px solid ${dActive ? C.brandPurple : C.ui3}`,
                            background: dActive ? C.bgPlusChipBg : C.bgDefault,
                            color: dActive ? C.brandPurple : C.textPrimary,
                            fontSize: 12, fontWeight: dActive ? 600 : 500, cursor: "pointer",
                          }}
                        >
                          {d.label}
                        </button>
                      );
                    })}
                    {aboveDelta === "custom" && (
                      <div style={{ width: "100%", marginTop: 4, display: "flex", alignItems: "center", gap: 8 }}>
                        <input
                          type="number" inputMode="decimal" placeholder="Min %"
                          value={aboveCustomMin}
                          onChange={(e) => setAboveCustomMin(e.target.value)}
                          style={{
                            flex: 1, height: 32, padding: "0 10px", borderRadius: 6,
                            border: `1px solid ${C.ui3}`, background: C.bgDefault,
                            fontSize: 12, color: C.textPrimary, outline: "none",
                          }}
                        />
                        <span style={{ fontSize: 12, color: C.textSecondary }}>to</span>
                        <input
                          type="number" inputMode="decimal" placeholder="Max %"
                          value={aboveCustomMax}
                          onChange={(e) => setAboveCustomMax(e.target.value)}
                          style={{
                            flex: 1, height: 32, padding: "0 10px", borderRadius: 6,
                            border: `1px solid ${C.ui3}`, background: C.bgDefault,
                            fontSize: 12, color: C.textPrimary, outline: "none",
                          }}
                        />
                      </div>
                    )}
                    </div>
                  </div>
                )}

                {/* EMA-based presets: length + timeframe */}
                {active && (p.key === "above_ema" || p.key === "below_ema" || p.key === "crossed_above" || p.key === "crossed_below") && (
                  <div style={{ padding: "4px 4px 12px" }}>
                    <div className="flex" style={{ gap: 10 }}>
                      <div className="flex-1" style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 4 }}>Length</div>
                        <SelectField
                          value={String(otherLen)}
                          onChange={(v) => setOtherLen(Number(v))}
                          options={LENGTH_OPTIONS.map((n) => ({ value: String(n), label: String(n) }))}
                        />
                      </div>
                      <div className="flex-1" style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 4 }}>Timeframe</div>
                        <SelectField
                          value={otherTf}
                          onChange={setOtherTf}
                          options={TIMEFRAME_OPTIONS.map((tf) => ({ value: tf, label: TIMEFRAME_LABELS[tf] ?? tf }))}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ height: 1, background: C.ui2 }} />
              </div>
            );
          })}

          {/* Custom row */}
          <button
            type="button"
            onClick={() => setBucket("custom")}
            className="flex items-center w-full"
            style={{ padding: "10px 4px", gap: 12, background: "transparent", border: "none", cursor: "pointer" }}
          >
            <div style={{ flex: 1, textAlign: "left" }}>
              <div style={{ fontSize: 14, color: C.textPrimary, fontWeight: bucket === "custom" ? 600 : 500 }}>
                Custom
              </div>
              <div style={{ fontSize: 11, color: C.textSecondary, marginTop: 2 }}>
                Pick condition and compare to another indicator or range
              </div>
            </div>
            <span
              className="flex items-center justify-center shrink-0"
              style={{ width: 20, height: 20, borderRadius: 10, border: `2px solid ${bucket === "custom" ? C.brandPurple : C.ui4}` }}
            >
              {bucket === "custom" && <span style={{ width: 10, height: 10, borderRadius: 5, background: C.brandPurple }} />}
            </span>
          </button>

          {bucket === "custom" && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 4 }}>Condition</div>
              <SelectField
                value={customCond}
                onChange={(v) => setCustomCond(v as MACustomCondition)}
                options={MA_CUSTOM_CONDITIONS.map((x) => ({ value: x, label: x }))}
              />

              <div style={{ height: 12 }} />

              {customCond === "Between" ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
                  <input
                    type="number" inputMode="decimal" placeholder="Min"
                    value={customMin}
                    onChange={(e) => setCustomMin(e.target.value)}
                    style={{
                      flex: 1, minWidth: 0, width: "100%",
                      height: 32, padding: "0 10px", borderRadius: 6,
                      border: `1px solid ${C.ui3}`, background: C.bgDefault,
                      fontSize: 12, color: C.textPrimary, outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  <span style={{ fontSize: 12, color: C.textSecondary, flexShrink: 0 }}>to</span>
                  <input
                    type="number" inputMode="decimal" placeholder="Max"
                    value={customMax}
                    onChange={(e) => setCustomMax(e.target.value)}
                    style={{
                      flex: 1, minWidth: 0, width: "100%",
                      height: 32, padding: "0 10px", borderRadius: 6,
                      border: `1px solid ${C.ui3}`, background: C.bgDefault,
                      fontSize: 12, color: C.textPrimary, outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 6 }}>Compare to</div>
                  {!customInd ? (
                    <button
                      type="button"
                      onClick={() => setMoreOpen(true)}
                      className="flex items-center justify-center w-full"
                      style={{
                        height: 40, borderRadius: 8,
                        border: `1px solid ${C.ui3}`, background: C.bgDefault,
                        fontSize: 13, fontWeight: 600, color: C.brandPurple, cursor: "pointer",
                      }}
                    >
                      Choose indicator →
                    </button>
                  ) : (
                    <>
                      <div className="flex items-center" style={{ gap: 10 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: C.textPrimary, flex: 1, minWidth: 0 }}>
                          {customInd}{customIndSuffix}
                        </span>
                        <button
                          type="button"
                          onClick={() => setMoreOpen(true)}
                          style={{ fontSize: 12, color: C.brandPurple, fontWeight: 600, background: "transparent", border: "none", cursor: "pointer" }}
                        >
                          Change
                        </button>
                      </div>
                      {customInd === "Value" ? (
                        <div style={{ marginTop: 10 }}>
                          <input
                            type="number" inputMode="decimal" placeholder="Enter value"
                            value={customMin}
                            onChange={(e) => setCustomMin(e.target.value)}
                            className="w-full"
                            style={{
                              height: 40, padding: "0 12px", borderRadius: 8,
                              border: `1px solid ${C.ui3}`, background: C.bgDefault,
                              fontSize: 14, color: C.textPrimary, outline: "none",
                            }}
                          />
                        </div>
                      ) : customIndNeedsLength ? (
                        <div className="flex" style={{ gap: 10, marginTop: 10 }}>
                          <div className="flex-1" style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 4 }}>Length</div>
                            <SelectField
                              value={String(customIndLen)}
                              onChange={(v) => setCustomIndLen(Number(v))}
                              options={LENGTH_OPTIONS.map((n) => ({ value: String(n), label: String(n) }))}
                            />
                          </div>
                          <div className="flex-1" style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 4 }}>Timeframe</div>
                            <SelectField
                              value={customIndTf}
                              onChange={setCustomIndTf}
                              options={TIMEFRAME_OPTIONS.map((tf) => ({ value: tf, label: TIMEFRAME_LABELS[tf] ?? tf }))}
                            />
                          </div>
                        </div>
                      ) : null}
                    </>
                  )}
                  {(customCond === "Above by %" || customCond === "Below by %") && (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 4 }}>By how much (%)</div>
                      <input
                        type="number" inputMode="decimal" placeholder="e.g. 5"
                        value={customMin}
                        onChange={(e) => setCustomMin(e.target.value)}
                        className="w-full"
                        style={{
                          height: 40, padding: "0 12px", borderRadius: 8,
                          border: `1px solid ${C.ui3}`, background: C.bgDefault,
                          fontSize: 14, color: C.textPrimary, outline: "none",
                        }}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Live preview */}
          {bucket !== null && (
            <div
              style={{
                marginTop: 16, padding: "10px 12px", borderRadius: 10,
                background: C.bgMuted, fontSize: 13, color: C.textPrimary, lineHeight: 1.4,
              }}
            >
              <span style={{ fontWeight: 700 }}>{indicator}({length}, {timeframe})</span>
              <span> </span>
              <span>{phrase}</span>
            </div>
          )}
        </div>

        {/* Footer — Add filter */}
        <div
          className="flex items-center"
          style={{ padding: 16, gap: 12, borderTop: `1px solid ${C.ui2}`, background: C.bgDefault }}
        >
          <button
            disabled={bucket === null}
            onClick={() => {
              if (bucket === null) return;
              onAdd({
                label: `${indicator} (${length}, ${timeframe})`,
                value: phrase,
              });
            }}
            className="flex items-center justify-center w-full"
            style={{
              height: 48, borderRadius: 24, background: bucket === null ? C.ui3 : C.brandPurple,
              fontFamily: "'Messina Sans', 'Inter', sans-serif",
              fontWeight: 700, fontSize: 15, color: "#FFFFFF",
              cursor: bucket === null ? "not-allowed" : "pointer",
              border: "none",
            }}
          >
            Add filter
          </button>
        </div>

        {moreOpen && (
          <MoreIndicatorsSheet
            onClose={() => setMoreOpen(false)}
            onPick={(name) => { setCustomInd(name); setMoreOpen(false); }}
          />
        )}
      </div>
    </div>
  );
}

// ───── Oscillator / indicator sheet (all technical indicators) ─────

type OscPreset = { key: string; label: string; sub: string; phrase: string };
type BoundedOscConfig = {
  defaultLength: number;
  hasStdDev?: boolean;
  defaultStdDev?: number;
  stdDevLabel?: string;
  stdDevOptions?: number[];
  hideLength?: boolean;
  labelFormat?: (length: number, timeframe: string, stdDev?: number) => string;
  valuePlaceholder?: string;
  customMinMax?: { min: number; max: number };
  relatedIndicators: string[];
  presets: OscPreset[];
  customOnly?: boolean;
};

// Presets for "filter is a line/level compared to Price" — subject is the line/level.
// "is below Price" ⇒ Price is above the line (bullish / breakout above)
function priceBreakPresets(levelName: string): OscPreset[] {
  return [
    { key: "price_above_cross", label: `Price crossed above ${levelName}`, sub: "Bullish break of level", phrase: "crosses below Close" },
    { key: "price_below_cross", label: `Price crossed below ${levelName}`, sub: "Bearish break of level", phrase: "crosses above Close" },
    { key: "price_above",       label: `Price above ${levelName}`,         sub: "Trading above level",    phrase: "is below Close" },
    { key: "price_below",       label: `Price below ${levelName}`,         sub: "Trading below level",    phrase: "is above Close" },
  ];
}

const PIVOT_STD_PEERS = ["Pivot Point", "Pivot R1", "Pivot R2", "Pivot R3", "Pivot S1", "Pivot S2", "Pivot S3", "Close"];
const CAMARILLA_PEERS = ["Camarilla R1", "Camarilla R2", "Camarilla R3", "Camarilla R4", "Camarilla S1", "Camarilla S2", "Camarilla S3", "Camarilla S4", "Close"];
const CPR_PEERS = ["CPR Upper", "CPR Lower", "Close"];

const BOUNDED_OSC_CONFIG: Record<string, BoundedOscConfig> = {
  // ─────────── Family #1: bounded oscillators ───────────
  "RSI": {
    defaultLength: 14,
    valuePlaceholder: "e.g. 50",
    customMinMax: { min: 0, max: 100 },
    relatedIndicators: ["RSI"],
    presets: [
      { key: "overbought", label: "Overbought", sub: "Above 70", phrase: "is above 70" },
      { key: "oversold",   label: "Oversold",   sub: "Below 30", phrase: "is below 30" },
      { key: "bullish",    label: "Bullish zone", sub: "Between 50 and 70", phrase: "is between 50 and 70" },
      { key: "bearish",    label: "Bearish zone", sub: "Between 30 and 50", phrase: "is between 30 and 50" },
      { key: "crossed_above_70", label: "Crossed above 70", sub: "Entering overbought territory", phrase: "crosses above 70" },
      { key: "crossed_below_30", label: "Crossed below 30", sub: "Entering oversold territory", phrase: "crosses below 30" },
    ],
  },
  "Stochastic %K": {
    defaultLength: 14,
    valuePlaceholder: "e.g. 50",
    customMinMax: { min: 0, max: 100 },
    relatedIndicators: ["Stochastic %K", "Stochastic %D"],
    presets: [
      { key: "overbought", label: "Overbought", sub: "Above 80", phrase: "is above 80" },
      { key: "oversold",   label: "Oversold",   sub: "Below 20", phrase: "is below 20" },
      { key: "bullish",    label: "Bullish zone", sub: "Between 50 and 80", phrase: "is between 50 and 80" },
      { key: "bearish",    label: "Bearish zone", sub: "Between 20 and 50", phrase: "is between 20 and 50" },
      { key: "crossed_above_80", label: "Crossed above 80", sub: "Entering overbought territory", phrase: "crosses above 80" },
      { key: "crossed_below_20", label: "Crossed below 20", sub: "Entering oversold territory", phrase: "crosses below 20" },
      { key: "crossed_above_d",  label: "Crossed above %D", sub: "Bullish stochastic crossover", phrase: "crosses above Stochastic %D" },
      { key: "crossed_below_d",  label: "Crossed below %D", sub: "Bearish stochastic crossover", phrase: "crosses below Stochastic %D" },
    ],
  },
  "Stochastic %D": {
    defaultLength: 3,
    valuePlaceholder: "e.g. 50",
    customMinMax: { min: 0, max: 100 },
    relatedIndicators: ["Stochastic %K", "Stochastic %D"],
    presets: [
      { key: "overbought", label: "Overbought", sub: "Above 80", phrase: "is above 80" },
      { key: "oversold",   label: "Oversold",   sub: "Below 20", phrase: "is below 20" },
      { key: "bullish",    label: "Bullish zone", sub: "Between 50 and 80", phrase: "is between 50 and 80" },
      { key: "bearish",    label: "Bearish zone", sub: "Between 20 and 50", phrase: "is between 20 and 50" },
    ],
  },
  "StochRSI %K": {
    defaultLength: 14,
    valuePlaceholder: "e.g. 50",
    customMinMax: { min: 0, max: 100 },
    relatedIndicators: ["StochRSI %K", "StochRSI %D"],
    presets: [
      { key: "overbought", label: "Overbought", sub: "Above 80", phrase: "is above 80" },
      { key: "oversold",   label: "Oversold",   sub: "Below 20", phrase: "is below 20" },
      { key: "bullish",    label: "Bullish zone", sub: "Between 50 and 80", phrase: "is between 50 and 80" },
      { key: "bearish",    label: "Bearish zone", sub: "Between 20 and 50", phrase: "is between 20 and 50" },
      { key: "crossed_above_d",  label: "Crossed above %D", sub: "Bullish StochRSI crossover", phrase: "crosses above StochRSI %D" },
      { key: "crossed_below_d",  label: "Crossed below %D", sub: "Bearish StochRSI crossover", phrase: "crosses below StochRSI %D" },
    ],
  },
  "StochRSI %D": {
    defaultLength: 3,
    valuePlaceholder: "e.g. 50",
    customMinMax: { min: 0, max: 100 },
    relatedIndicators: ["StochRSI %K", "StochRSI %D"],
    presets: [
      { key: "overbought", label: "Overbought", sub: "Above 80", phrase: "is above 80" },
      { key: "oversold",   label: "Oversold",   sub: "Below 20", phrase: "is below 20" },
      { key: "bullish",    label: "Bullish zone", sub: "Between 50 and 80", phrase: "is between 50 and 80" },
      { key: "bearish",    label: "Bearish zone", sub: "Between 20 and 50", phrase: "is between 20 and 50" },
    ],
  },
  "MFI": {
    defaultLength: 14,
    valuePlaceholder: "e.g. 50",
    customMinMax: { min: 0, max: 100 },
    relatedIndicators: ["MFI"],
    presets: [
      { key: "overbought", label: "Overbought", sub: "Above 80", phrase: "is above 80" },
      { key: "oversold",   label: "Oversold",   sub: "Below 20", phrase: "is below 20" },
      { key: "bullish",    label: "Bullish zone", sub: "Between 50 and 80", phrase: "is between 50 and 80" },
      { key: "bearish",    label: "Bearish zone", sub: "Between 20 and 50", phrase: "is between 20 and 50" },
      { key: "crossed_above_80", label: "Crossed above 80", sub: "Entering overbought territory", phrase: "crosses above 80" },
      { key: "crossed_below_20", label: "Crossed below 20", sub: "Entering oversold territory", phrase: "crosses below 20" },
    ],
  },
  "Williams %R": {
    defaultLength: 14,
    valuePlaceholder: "e.g. -50",
    customMinMax: { min: -100, max: 0 },
    relatedIndicators: ["Williams %R"],
    presets: [
      { key: "overbought", label: "Overbought", sub: "Above -20", phrase: "is above -20" },
      { key: "oversold",   label: "Oversold",   sub: "Below -80", phrase: "is below -80" },
      { key: "bullish",    label: "Bullish zone", sub: "Between -50 and -20", phrase: "is between -50 and -20" },
      { key: "bearish",    label: "Bearish zone", sub: "Between -80 and -50", phrase: "is between -80 and -50" },
      { key: "crossed_above_-20", label: "Crossed above -20", sub: "Entering overbought territory", phrase: "crosses above -20" },
      { key: "crossed_below_-80", label: "Crossed below -80", sub: "Entering oversold territory", phrase: "crosses below -80" },
    ],
  },
  "Aroon Up": {
    defaultLength: 14,
    valuePlaceholder: "e.g. 70",
    customMinMax: { min: 0, max: 100 },
    relatedIndicators: ["Aroon Up", "Aroon Down"],
    presets: [
      { key: "strong",   label: "Strong uptrend",   sub: "Above 70", phrase: "is above 70" },
      { key: "weak",     label: "Weak / no trend",  sub: "Below 30", phrase: "is below 30" },
      { key: "extreme",  label: "Extreme strength", sub: "Above 90", phrase: "is above 90" },
      { key: "above_down", label: "Above Aroon Down", sub: "Bullish trend bias", phrase: "is above Aroon Down" },
      { key: "crossed_above_down", label: "Crossed above Aroon Down", sub: "Bullish trend crossover", phrase: "crosses above Aroon Down" },
    ],
  },
  "Aroon Down": {
    defaultLength: 14,
    valuePlaceholder: "e.g. 70",
    customMinMax: { min: 0, max: 100 },
    relatedIndicators: ["Aroon Up", "Aroon Down"],
    presets: [
      { key: "strong",   label: "Strong downtrend", sub: "Above 70", phrase: "is above 70" },
      { key: "weak",     label: "Weak / no trend",  sub: "Below 30", phrase: "is below 30" },
      { key: "extreme",  label: "Extreme weakness", sub: "Above 90", phrase: "is above 90" },
      { key: "above_up", label: "Above Aroon Up",   sub: "Bearish trend bias", phrase: "is above Aroon Up" },
      { key: "crossed_above_up", label: "Crossed above Aroon Up", sub: "Bearish trend crossover", phrase: "crosses above Aroon Up" },
    ],
  },
  "Bollinger %B": {
    defaultLength: 20,
    hasStdDev: true,
    defaultStdDev: 2,
    valuePlaceholder: "e.g. 0.5",
    customMinMax: { min: -0.5, max: 1.5 },
    relatedIndicators: ["Bollinger %B"],
    presets: [
      { key: "above_upper", label: "Above upper band",  sub: "%B > 1 — extended above band", phrase: "is above 1" },
      { key: "below_lower", label: "Below lower band",  sub: "%B < 0 — extended below band", phrase: "is below 0" },
      { key: "upper_half",  label: "Upper half",        sub: "%B between 0.5 and 1",          phrase: "is between 0.5 and 1" },
      { key: "lower_half",  label: "Lower half",        sub: "%B between 0 and 0.5",          phrase: "is between 0 and 0.5" },
      { key: "at_middle",   label: "Near middle band",  sub: "%B between 0.4 and 0.6",        phrase: "is between 0.4 and 0.6" },
    ],
  },

  // ─────────── Family #2: unbounded oscillators ───────────
  "MACD Line": {
    defaultLength: 12,
    hideLength: true,
    labelFormat: (_l, tf) => `MACD Line (12, 26, 9, ${tf})`,
    valuePlaceholder: "e.g. 0",
    relatedIndicators: ["MACD Line", "MACD Signal"],
    presets: [
      { key: "crossed_above_signal", label: "Crossed above Signal", sub: "Bullish MACD crossover", phrase: "crosses above MACD Signal" },
      { key: "crossed_below_signal", label: "Crossed below Signal", sub: "Bearish MACD crossover", phrase: "crosses below MACD Signal" },
      { key: "above_signal", label: "Above Signal", sub: "Bullish bias", phrase: "is above MACD Signal" },
      { key: "below_signal", label: "Below Signal", sub: "Bearish bias", phrase: "is below MACD Signal" },
      { key: "crossed_above_zero", label: "Crossed above zero", sub: "Momentum flip up", phrase: "crosses above 0" },
      { key: "crossed_below_zero", label: "Crossed below zero", sub: "Momentum flip down", phrase: "crosses below 0" },
      { key: "above_zero", label: "Above zero", sub: "Uptrend territory", phrase: "is above 0" },
      { key: "below_zero", label: "Below zero", sub: "Downtrend territory", phrase: "is below 0" },
    ],
  },
  "MACD Signal": {
    defaultLength: 9,
    hideLength: true,
    labelFormat: (_l, tf) => `MACD Signal (12, 26, 9, ${tf})`,
    valuePlaceholder: "e.g. 0",
    relatedIndicators: ["MACD Line", "MACD Signal"],
    presets: [
      { key: "below_line", label: "Below MACD Line", sub: "Bullish bias", phrase: "is below MACD Line" },
      { key: "above_line", label: "Above MACD Line", sub: "Bearish bias", phrase: "is above MACD Line" },
      { key: "above_zero", label: "Above zero", sub: "Uptrend territory", phrase: "is above 0" },
      { key: "below_zero", label: "Below zero", sub: "Downtrend territory", phrase: "is below 0" },
    ],
  },
  "MACD Histogram": {
    defaultLength: 0,
    hideLength: true,
    labelFormat: (_l, tf) => `MACD Histogram (12, 26, 9, ${tf})`,
    valuePlaceholder: "e.g. 0",
    relatedIndicators: ["MACD Histogram"],
    presets: [
      { key: "crossed_above_zero", label: "Crossed above zero", sub: "Bullish momentum flip", phrase: "crosses above 0" },
      { key: "crossed_below_zero", label: "Crossed below zero", sub: "Bearish momentum flip", phrase: "crosses below 0" },
      { key: "above_zero", label: "Above zero", sub: "Bullish momentum", phrase: "is above 0" },
      { key: "below_zero", label: "Below zero", sub: "Bearish momentum", phrase: "is below 0" },
    ],
  },
  "ADX": {
    defaultLength: 14,
    valuePlaceholder: "e.g. 25",
    customMinMax: { min: 0, max: 100 },
    relatedIndicators: ["ADX"],
    presets: [
      { key: "strong_trend", label: "Strong trend", sub: "Above 25", phrase: "is above 25" },
      { key: "very_strong_trend", label: "Very strong trend", sub: "Above 40", phrase: "is above 40" },
      { key: "weak_no_trend", label: "Weak / no trend", sub: "Below 20", phrase: "is below 20" },
      { key: "crossed_above_25", label: "Crossed above 25", sub: "Trend strengthening", phrase: "crosses above 25" },
      { key: "crossed_below_20", label: "Crossed below 20", sub: "Trend fading", phrase: "crosses below 20" },
    ],
  },
  "+DI": {
    defaultLength: 14,
    valuePlaceholder: "e.g. 25",
    customMinMax: { min: 0, max: 100 },
    relatedIndicators: ["+DI", "-DI"],
    presets: [
      { key: "crossed_above_minus_di", label: "Crossed above -DI", sub: "Bullish DMI crossover", phrase: "crosses above -DI" },
      { key: "above_minus_di", label: "Above -DI", sub: "Bullish DMI", phrase: "is above -DI" },
      { key: "below_minus_di", label: "Below -DI", sub: "Bearish DMI", phrase: "is below -DI" },
    ],
  },
  "-DI": {
    defaultLength: 14,
    valuePlaceholder: "e.g. 25",
    customMinMax: { min: 0, max: 100 },
    relatedIndicators: ["+DI", "-DI"],
    presets: [
      { key: "crossed_above_plus_di", label: "Crossed above +DI", sub: "Bearish DMI crossover", phrase: "crosses above +DI" },
      { key: "above_plus_di", label: "Above +DI", sub: "Bearish DMI", phrase: "is above +DI" },
      { key: "below_plus_di", label: "Below +DI", sub: "Bullish DMI", phrase: "is below +DI" },
    ],
  },
  "CCI": {
    defaultLength: 20,
    valuePlaceholder: "e.g. 0",
    customMinMax: { min: -400, max: 400 },
    relatedIndicators: ["CCI"],
    presets: [
      { key: "overbought", label: "Overbought", sub: "Above +100", phrase: "is above 100" },
      { key: "oversold", label: "Oversold", sub: "Below -100", phrase: "is below -100" },
      { key: "extreme_overbought", label: "Extreme overbought", sub: "Above +200", phrase: "is above 200" },
      { key: "extreme_oversold", label: "Extreme oversold", sub: "Below -200", phrase: "is below -200" },
      { key: "bullish_zone", label: "Bullish zone", sub: "Between 0 and +100", phrase: "is between 0 and 100" },
      { key: "bearish_zone", label: "Bearish zone", sub: "Between -100 and 0", phrase: "is between -100 and 0" },
      { key: "crossed_above_100", label: "Crossed above +100", sub: "Entering overbought", phrase: "crosses above 100" },
      { key: "crossed_below_neg100", label: "Crossed below -100", sub: "Entering oversold", phrase: "crosses below -100" },
      { key: "crossed_above_0", label: "Crossed above 0", sub: "Momentum flip up", phrase: "crosses above 0" },
      { key: "crossed_below_0", label: "Crossed below 0", sub: "Momentum flip down", phrase: "crosses below 0" },
    ],
  },
  "ROC": {
    defaultLength: 12,
    valuePlaceholder: "e.g. 0",
    customMinMax: { min: -100, max: 100 },
    relatedIndicators: ["ROC"],
    presets: [
      { key: "positive", label: "Positive momentum", sub: "Above 0", phrase: "is above 0" },
      { key: "negative", label: "Negative momentum", sub: "Below 0", phrase: "is below 0" },
      { key: "strong_positive", label: "Strong positive", sub: "Above +10%", phrase: "is above 10" },
      { key: "strong_negative", label: "Strong negative", sub: "Below -10%", phrase: "is below -10" },
      { key: "crossed_above_0", label: "Crossed above 0", sub: "Momentum flip up", phrase: "crosses above 0" },
      { key: "crossed_below_0", label: "Crossed below 0", sub: "Momentum flip down", phrase: "crosses below 0" },
    ],
  },

  // ─────────── Family #3: price-overlay lines ───────────
  "Supertrend": {
    defaultLength: 7,
    hideLength: true,
    labelFormat: (_l, tf) => `Supertrend (7, 3, ${tf})`,
    valuePlaceholder: "e.g. 100",
    relatedIndicators: ["Supertrend", "Close"],
    presets: [
      { key: "turned_bullish", label: "Turned bullish", sub: "Supertrend flipped below Price", phrase: "crosses below Close" },
      { key: "turned_bearish", label: "Turned bearish", sub: "Supertrend flipped above Price", phrase: "crosses above Close" },
      { key: "bullish", label: "Bullish trend", sub: "Price trading above Supertrend", phrase: "is below Close" },
      { key: "bearish", label: "Bearish trend", sub: "Price trading below Supertrend", phrase: "is above Close" },
    ],
  },
  "Parabolic SAR": {
    defaultLength: 0,
    hideLength: true,
    labelFormat: (_l, tf) => `Parabolic SAR (0.02, 0.2, ${tf})`,
    valuePlaceholder: "e.g. 100",
    relatedIndicators: ["Parabolic SAR", "Close"],
    presets: [
      { key: "flipped_bullish", label: "Just flipped bullish", sub: "SAR dots moved below Price", phrase: "crosses below Close" },
      { key: "flipped_bearish", label: "Just flipped bearish", sub: "SAR dots moved above Price", phrase: "crosses above Close" },
      { key: "bullish", label: "Bullish (dots below Price)", sub: "Uptrend signal", phrase: "is below Close" },
      { key: "bearish", label: "Bearish (dots above Price)", sub: "Downtrend signal", phrase: "is above Close" },
    ],
  },
  "Ichimoku Tenkan": {
    defaultLength: 9,
    valuePlaceholder: "e.g. 100",
    relatedIndicators: ["Ichimoku Tenkan", "Ichimoku Kijun", "Close"],
    presets: [
      { key: "crossed_above_kijun", label: "Crossed above Kijun", sub: "Bullish TK cross", phrase: "crosses above Ichimoku Kijun" },
      { key: "crossed_below_kijun", label: "Crossed below Kijun", sub: "Bearish TK cross", phrase: "crosses below Ichimoku Kijun" },
      { key: "above_kijun", label: "Above Kijun", sub: "Bullish bias", phrase: "is above Ichimoku Kijun" },
      { key: "below_kijun", label: "Below Kijun", sub: "Bearish bias", phrase: "is below Ichimoku Kijun" },
      { key: "price_above", label: "Price above Tenkan", sub: "Short-term uptrend", phrase: "is below Close" },
      { key: "price_below", label: "Price below Tenkan", sub: "Short-term downtrend", phrase: "is above Close" },
    ],
  },
  "Ichimoku Kijun": {
    defaultLength: 26,
    valuePlaceholder: "e.g. 100",
    relatedIndicators: ["Ichimoku Tenkan", "Ichimoku Kijun", "Close"],
    presets: [
      { key: "price_above", label: "Price above Kijun", sub: "Mid-term uptrend", phrase: "is below Close" },
      { key: "price_below", label: "Price below Kijun", sub: "Mid-term downtrend", phrase: "is above Close" },
      { key: "below_tenkan", label: "Below Tenkan", sub: "Bullish bias", phrase: "is below Ichimoku Tenkan" },
      { key: "above_tenkan", label: "Above Tenkan", sub: "Bearish bias", phrase: "is above Ichimoku Tenkan" },
    ],
  },
  "Ichimoku Senkou A": {
    defaultLength: 0,
    hideLength: true,
    labelFormat: (_l, tf) => `Ichimoku Senkou A (9, 26, ${tf})`,
    valuePlaceholder: "e.g. 100",
    relatedIndicators: ["Ichimoku Senkou A", "Ichimoku Senkou B", "Close"],
    presets: [
      { key: "crossed_above_b", label: "Crossed above Senkou B", sub: "Cloud flipped bullish", phrase: "crosses above Ichimoku Senkou B" },
      { key: "crossed_below_b", label: "Crossed below Senkou B", sub: "Cloud flipped bearish", phrase: "crosses below Ichimoku Senkou B" },
      { key: "above_b", label: "Above Senkou B", sub: "Bullish (green) cloud", phrase: "is above Ichimoku Senkou B" },
      { key: "below_b", label: "Below Senkou B", sub: "Bearish (red) cloud", phrase: "is below Ichimoku Senkou B" },
    ],
  },
  "Ichimoku Senkou B": {
    defaultLength: 0,
    hideLength: true,
    labelFormat: (_l, tf) => `Ichimoku Senkou B (26, 52, ${tf})`,
    valuePlaceholder: "e.g. 100",
    relatedIndicators: ["Ichimoku Senkou A", "Ichimoku Senkou B", "Close"],
    presets: [
      { key: "below_a", label: "Below Senkou A", sub: "Bullish (green) cloud", phrase: "is below Ichimoku Senkou A" },
      { key: "above_a", label: "Above Senkou A", sub: "Bearish (red) cloud", phrase: "is above Ichimoku Senkou A" },
    ],
  },

  // ─────────── Family #4: price bands ───────────
  "Bollinger Upper": {
    defaultLength: 20,
    hasStdDev: true,
    defaultStdDev: 2,
    valuePlaceholder: "e.g. 100",
    relatedIndicators: ["Bollinger Upper", "Bollinger Middle", "Bollinger Lower", "Close"],
    presets: [
      { key: "price_breakout",  label: "Price broke above (breakout)",    sub: "Close crossed above upper band", phrase: "crosses below Close" },
      { key: "price_reentry",   label: "Price broke back below",           sub: "Close crossed below upper band", phrase: "crosses above Close" },
      { key: "price_above",     label: "Price above upper band",           sub: "Extended above band",           phrase: "is below Close" },
      { key: "price_below",     label: "Price below upper band",           sub: "Inside bands",                  phrase: "is above Close" },
    ],
  },
  "Bollinger Middle": {
    defaultLength: 20,
    hasStdDev: true,
    defaultStdDev: 2,
    valuePlaceholder: "e.g. 100",
    relatedIndicators: ["Bollinger Upper", "Bollinger Middle", "Bollinger Lower", "Close"],
    presets: [
      { key: "price_crossed_above", label: "Price crossed above middle", sub: "Bullish mid-band cross", phrase: "crosses below Close" },
      { key: "price_crossed_below", label: "Price crossed below middle", sub: "Bearish mid-band cross", phrase: "crosses above Close" },
      { key: "price_above", label: "Price above middle",        sub: "Upper half of bands", phrase: "is below Close" },
      { key: "price_below", label: "Price below middle",        sub: "Lower half of bands", phrase: "is above Close" },
    ],
  },
  "Bollinger Lower": {
    defaultLength: 20,
    hasStdDev: true,
    defaultStdDev: 2,
    valuePlaceholder: "e.g. 100",
    relatedIndicators: ["Bollinger Upper", "Bollinger Middle", "Bollinger Lower", "Close"],
    presets: [
      { key: "price_breakdown", label: "Price broke below (breakdown)", sub: "Close crossed below lower band", phrase: "crosses above Close" },
      { key: "price_reentry",   label: "Price broke back above",         sub: "Close crossed above lower band", phrase: "crosses below Close" },
      { key: "price_below",     label: "Price below lower band",         sub: "Extended below band",           phrase: "is above Close" },
      { key: "price_above",     label: "Price above lower band",         sub: "Inside bands",                  phrase: "is below Close" },
    ],
  },
  "Keltner Upper": {
    defaultLength: 20,
    hasStdDev: true,
    defaultStdDev: 1.5,
    stdDevLabel: "Multiplier",
    stdDevOptions: [1, 1.5, 2, 2.5, 3],
    valuePlaceholder: "e.g. 100",
    relatedIndicators: ["Keltner Upper", "Keltner Lower", "Bollinger Upper", "Close"],
    presets: [
      { key: "price_breakout", label: "Price broke above (breakout)", sub: "Close crossed above upper channel", phrase: "crosses below Close" },
      { key: "price_reentry",  label: "Price broke back below",        sub: "Close crossed below upper channel", phrase: "crosses above Close" },
      { key: "price_above",    label: "Price above upper channel",     sub: "Extended above",                    phrase: "is below Close" },
      { key: "price_below",    label: "Price below upper channel",     sub: "Inside channel",                    phrase: "is above Close" },
      { key: "inside_bollinger", label: "Inside Bollinger (squeeze)",  sub: "Keltner outside Bollinger = squeeze",phrase: "is above Bollinger Upper" },
    ],
  },
  "Keltner Lower": {
    defaultLength: 20,
    hasStdDev: true,
    defaultStdDev: 1.5,
    stdDevLabel: "Multiplier",
    stdDevOptions: [1, 1.5, 2, 2.5, 3],
    valuePlaceholder: "e.g. 100",
    relatedIndicators: ["Keltner Upper", "Keltner Lower", "Bollinger Lower", "Close"],
    presets: [
      { key: "price_breakdown", label: "Price broke below (breakdown)", sub: "Close crossed below lower channel", phrase: "crosses above Close" },
      { key: "price_reentry",   label: "Price broke back above",         sub: "Close crossed above lower channel", phrase: "crosses below Close" },
      { key: "price_below",     label: "Price below lower channel",      sub: "Extended below",                    phrase: "is above Close" },
      { key: "price_above",     label: "Price above lower channel",      sub: "Inside channel",                    phrase: "is below Close" },
      { key: "inside_bollinger", label: "Inside Bollinger (squeeze)",    sub: "Keltner outside Bollinger = squeeze", phrase: "is below Bollinger Lower" },
    ],
  },
  "Donchian Upper": {
    defaultLength: 20,
    valuePlaceholder: "e.g. 100",
    relatedIndicators: ["Donchian Upper", "Donchian Lower", "Close"],
    presets: [
      { key: "price_breakout", label: "N-period high breakout", sub: "Close made a new high", phrase: "crosses below Close" },
      { key: "price_reentry",  label: "Price fell back below",   sub: "Close crossed below prior high", phrase: "crosses above Close" },
      { key: "price_above",    label: "Price above Donchian high", sub: "At or above N-high", phrase: "is below Close" },
      { key: "price_below",    label: "Price below Donchian high", sub: "Inside channel",    phrase: "is above Close" },
    ],
  },
  "Donchian Lower": {
    defaultLength: 20,
    valuePlaceholder: "e.g. 100",
    relatedIndicators: ["Donchian Upper", "Donchian Lower", "Close"],
    presets: [
      { key: "price_breakdown", label: "N-period low breakdown", sub: "Close made a new low", phrase: "crosses above Close" },
      { key: "price_reentry",   label: "Price rose back above",    sub: "Close crossed above prior low", phrase: "crosses below Close" },
      { key: "price_below",     label: "Price below Donchian low", sub: "At or below N-low",  phrase: "is above Close" },
      { key: "price_above",     label: "Price above Donchian low", sub: "Inside channel",     phrase: "is below Close" },
    ],
  },

  // ─────────── Family #5: volatility values ───────────
  "ATR": {
    defaultLength: 14,
    customOnly: true,
    valuePlaceholder: "e.g. 5",
    relatedIndicators: ["ATR"],
    presets: [],
  },
  "ATR %": {
    defaultLength: 14,
    valuePlaceholder: "e.g. 3",
    customMinMax: { min: 0, max: 100 },
    relatedIndicators: ["ATR %"],
    presets: [
      { key: "very_high", label: "Very high volatility", sub: "Above 5%", phrase: "is above 5" },
      { key: "high",      label: "High volatility",      sub: "Between 3% and 5%", phrase: "is between 3 and 5" },
      { key: "normal",    label: "Normal volatility",    sub: "Between 1% and 3%", phrase: "is between 1 and 3" },
      { key: "low",       label: "Low volatility",       sub: "Below 1%", phrase: "is below 1" },
    ],
  },
  "Bollinger Bandwidth": {
    defaultLength: 20,
    hasStdDev: true,
    defaultStdDev: 2,
    valuePlaceholder: "e.g. 0.1",
    customMinMax: { min: 0, max: 2 },
    relatedIndicators: ["Bollinger Bandwidth"],
    presets: [
      { key: "squeeze",  label: "Squeeze",        sub: "Bandwidth below 0.05 — coil",      phrase: "is below 0.05" },
      { key: "narrow",   label: "Narrow",         sub: "Between 0.05 and 0.1",             phrase: "is between 0.05 and 0.1" },
      { key: "expanding", label: "Expanding",     sub: "Between 0.1 and 0.2",              phrase: "is between 0.1 and 0.2" },
      { key: "wide",     label: "Wide / blown out", sub: "Above 0.2",                      phrase: "is above 0.2" },
    ],
  },
  "Historical Volatility": {
    defaultLength: 30,
    valuePlaceholder: "e.g. 40",
    customMinMax: { min: 0, max: 400 },
    relatedIndicators: ["Historical Volatility"],
    presets: [
      { key: "extreme",  label: "Extreme",  sub: "Above 80",         phrase: "is above 80" },
      { key: "high",     label: "High",     sub: "Between 40 and 80",phrase: "is between 40 and 80" },
      { key: "moderate", label: "Moderate", sub: "Between 20 and 40",phrase: "is between 20 and 40" },
      { key: "low",      label: "Low",      sub: "Below 20",         phrase: "is below 20" },
    ],
  },

  // ─────────── Family #6: pivot / CPR levels ───────────
  "Pivot Point":    { defaultLength: 0, hideLength: true, labelFormat: (_l, tf) => `Pivot Point (${tf})`,    valuePlaceholder: "e.g. 100", relatedIndicators: PIVOT_STD_PEERS, presets: priceBreakPresets("Pivot") },
  "Pivot R1":       { defaultLength: 0, hideLength: true, labelFormat: (_l, tf) => `Pivot R1 (${tf})`,       valuePlaceholder: "e.g. 100", relatedIndicators: PIVOT_STD_PEERS, presets: priceBreakPresets("R1") },
  "Pivot R2":       { defaultLength: 0, hideLength: true, labelFormat: (_l, tf) => `Pivot R2 (${tf})`,       valuePlaceholder: "e.g. 100", relatedIndicators: PIVOT_STD_PEERS, presets: priceBreakPresets("R2") },
  "Pivot R3":       { defaultLength: 0, hideLength: true, labelFormat: (_l, tf) => `Pivot R3 (${tf})`,       valuePlaceholder: "e.g. 100", relatedIndicators: PIVOT_STD_PEERS, presets: priceBreakPresets("R3") },
  "Pivot S1":       { defaultLength: 0, hideLength: true, labelFormat: (_l, tf) => `Pivot S1 (${tf})`,       valuePlaceholder: "e.g. 100", relatedIndicators: PIVOT_STD_PEERS, presets: priceBreakPresets("S1") },
  "Pivot S2":       { defaultLength: 0, hideLength: true, labelFormat: (_l, tf) => `Pivot S2 (${tf})`,       valuePlaceholder: "e.g. 100", relatedIndicators: PIVOT_STD_PEERS, presets: priceBreakPresets("S2") },
  "Pivot S3":       { defaultLength: 0, hideLength: true, labelFormat: (_l, tf) => `Pivot S3 (${tf})`,       valuePlaceholder: "e.g. 100", relatedIndicators: PIVOT_STD_PEERS, presets: priceBreakPresets("S3") },
  "Camarilla R1":   { defaultLength: 0, hideLength: true, labelFormat: (_l, tf) => `Camarilla R1 (${tf})`,   valuePlaceholder: "e.g. 100", relatedIndicators: CAMARILLA_PEERS, presets: priceBreakPresets("Cam R1") },
  "Camarilla R2":   { defaultLength: 0, hideLength: true, labelFormat: (_l, tf) => `Camarilla R2 (${tf})`,   valuePlaceholder: "e.g. 100", relatedIndicators: CAMARILLA_PEERS, presets: priceBreakPresets("Cam R2") },
  "Camarilla R3":   { defaultLength: 0, hideLength: true, labelFormat: (_l, tf) => `Camarilla R3 (${tf})`,   valuePlaceholder: "e.g. 100", relatedIndicators: CAMARILLA_PEERS, presets: priceBreakPresets("Cam R3") },
  "Camarilla R4":   { defaultLength: 0, hideLength: true, labelFormat: (_l, tf) => `Camarilla R4 (${tf})`,   valuePlaceholder: "e.g. 100", relatedIndicators: CAMARILLA_PEERS, presets: priceBreakPresets("Cam R4") },
  "Camarilla S1":   { defaultLength: 0, hideLength: true, labelFormat: (_l, tf) => `Camarilla S1 (${tf})`,   valuePlaceholder: "e.g. 100", relatedIndicators: CAMARILLA_PEERS, presets: priceBreakPresets("Cam S1") },
  "Camarilla S2":   { defaultLength: 0, hideLength: true, labelFormat: (_l, tf) => `Camarilla S2 (${tf})`,   valuePlaceholder: "e.g. 100", relatedIndicators: CAMARILLA_PEERS, presets: priceBreakPresets("Cam S2") },
  "Camarilla S3":   { defaultLength: 0, hideLength: true, labelFormat: (_l, tf) => `Camarilla S3 (${tf})`,   valuePlaceholder: "e.g. 100", relatedIndicators: CAMARILLA_PEERS, presets: priceBreakPresets("Cam S3") },
  "Camarilla S4":   { defaultLength: 0, hideLength: true, labelFormat: (_l, tf) => `Camarilla S4 (${tf})`,   valuePlaceholder: "e.g. 100", relatedIndicators: CAMARILLA_PEERS, presets: priceBreakPresets("Cam S4") },
  "CPR Upper":      { defaultLength: 0, hideLength: true, labelFormat: (_l, tf) => `CPR Upper (${tf})`,      valuePlaceholder: "e.g. 100", relatedIndicators: CPR_PEERS, presets: priceBreakPresets("CPR Upper") },
  "CPR Lower":      { defaultLength: 0, hideLength: true, labelFormat: (_l, tf) => `CPR Lower (${tf})`,      valuePlaceholder: "e.g. 100", relatedIndicators: CPR_PEERS, presets: priceBreakPresets("CPR Lower") },
  "CPR Width %": {
    defaultLength: 0, hideLength: true,
    labelFormat: (_l, tf) => `CPR Width % (${tf})`,
    valuePlaceholder: "e.g. 0.5",
    customMinMax: { min: 0, max: 10 },
    relatedIndicators: ["CPR Width %"],
    presets: [
      { key: "narrow", label: "Narrow CPR",  sub: "Below 0.3% — trend day setup",  phrase: "is below 0.3" },
      { key: "normal", label: "Normal CPR",  sub: "Between 0.3% and 0.7%",         phrase: "is between 0.3 and 0.7" },
      { key: "wide",   label: "Wide CPR",    sub: "Above 0.7% — sideways bias",    phrase: "is above 0.7" },
    ],
  },
};

// Re-use MA_CUSTOM_CONDITIONS for all indicator sheets so the Custom section UX
// is identical between EMA and oscillator / overlay / band / pivot sheets.
type BoundedOscCondition = MACustomCondition;

function BoundedOscSheet({
  indicator, onClose, onAdd,
}: {
  indicator: string;
  onClose: () => void;
  onAdd: (f: Filter) => void;
}) {
  const cfg = BOUNDED_OSC_CONFIG[indicator];
  const [length, setLength] = useState<number>(cfg.defaultLength);
  const [stdDev, setStdDev] = useState<number>(cfg.defaultStdDev ?? 2);
  const [timeframe, setTimeframe] = useState<string>("1D");
  const [bucket, setBucket] = useState<string | "custom" | null>(() => cfg.customOnly ? "custom" : null);

  const [customCond, setCustomCond] = useState<BoundedOscCondition>("Above");
  const [customMin, setCustomMin] = useState<string>("");
  const [customMax, setCustomMax] = useState<string>("");
  const [customInd, setCustomInd] = useState<string | null>(null);
  const [customIndLen, setCustomIndLen] = useState<number>(20);
  const [customIndTf, setCustomIndTf] = useState<string>("1D");
  const [moreOpen, setMoreOpen] = useState<boolean>(false);

  const peerIndicators = cfg.relatedIndicators.filter((n) => n !== indicator);
  const hasPeers = peerIndicators.length > 0;
  // Always allow "Value" as a compare target so users can enter a plain number
  // via the same picker sheet used for peer indicators (matches EMA pattern).
  const compareAllowed = hasPeers ? [...peerIndicators, "Value"] : ["Value"];
  const customIndNeedsLength = customInd ? LENGTH_TIMEFRAME_INDICATORS.has(customInd) : false;
  const customIndIsBollinger = customInd ? customInd.startsWith("Bollinger") : false;
  const customIndSuffix = customInd && customIndNeedsLength
    ? customIndIsBollinger ? ` (${customIndLen}, 2)` : ` (${customIndLen})`
    : "";

  const paramsLabel = cfg.labelFormat
    ? cfg.labelFormat(length, timeframe, cfg.hasStdDev ? stdDev : undefined)
    : cfg.hasStdDev
      ? `${indicator} (${length}, ${stdDev}, ${timeframe})`
      : cfg.hideLength
        ? `${indicator} (${timeframe})`
        : `${indicator} (${length}, ${timeframe})`;

  function computePhrase(): string {
    if (bucket === null) return "";
    if (bucket !== "custom") {
      return cfg.presets.find((p) => p.key === bucket)?.phrase ?? "";
    }
    if (!hasPeers) {
      return `is between ${customMin || "min"} and ${customMax || "max"}`;
    }
    if (customCond === "Between") {
      return `is between ${customMin || "min"} and ${customMax || "max"}`;
    }
    const rhs = !customInd
      ? "Other indicator"
      : customInd === "Value"
        ? (customMin || "Value")
        : `${customInd}${customIndSuffix}`;
    const pctSuffix = customCond === "Above by %" || customCond === "Below by %" ? ` by ${customMin || "x"}%` : "";
    const condLower = customCond.replace(" by %", "").toLowerCase();
    const verb =
      condLower === "above" ? "is above" :
      condLower === "below" ? "is below" :
      condLower === "above or equal" ? "is ≥" :
      condLower === "above or below" ? "is above or below" :
      condLower === "crossed above" ? "crosses above" :
      condLower === "crossed below" ? "crosses below" :
      condLower;
    return `${verb} ${rhs}${pctSuffix}`;
  }
  const phrase = computePhrase();

  return (
    <div
      className="absolute inset-0 flex flex-col"
      style={{ zIndex: 50, background: "rgba(0,0,0,0.4)" }}
      onClick={onClose}
    >
      <div className="flex-1" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col"
        style={{
          background: C.bgDefault,
          borderTopLeftRadius: 20, borderTopRightRadius: 20,
          maxHeight: "85%", minHeight: 0,
        }}
      >
        <div className="flex items-center justify-center shrink-0" style={{ paddingTop: 8, paddingBottom: 4 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: C.ui3 }} />
        </div>
        <div className="flex items-center shrink-0" style={{ padding: "8px 16px 12px", gap: 8 }}>
          <span style={{
            fontFamily: "'Messina Sans', 'Inter', sans-serif",
            fontWeight: 700, fontSize: 18, color: C.textPrimary, flex: 1,
          }}>
            {indicator}
          </span>
          <button
            onClick={onClose}
            className="flex items-center justify-center"
            style={{ width: 32, height: 32, borderRadius: 16, background: "transparent", border: "none", cursor: "pointer" }}
          >
            <X size={18} color={C.textSecondary} />
          </button>
        </div>

        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "0 16px 16px" }}>
          {/* Length / StdDev / Timeframe */}
          <div className="flex" style={{ gap: 10 }}>
            {!cfg.hideLength && (
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 4 }}>Length</div>
                <SelectField
                  value={String(length)}
                  onChange={(v) => setLength(Number(v))}
                  options={LENGTH_OPTIONS.map((n) => ({ value: String(n), label: String(n) }))}
                />
              </div>
            )}
            {cfg.hasStdDev && (
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 4 }}>{cfg.stdDevLabel ?? "Std Dev"}</div>
                <SelectField
                  value={String(stdDev)}
                  onChange={(v) => setStdDev(Number(v))}
                  options={(cfg.stdDevOptions ?? [1, 1.5, 2, 2.5, 3]).map((n) => ({ value: String(n), label: String(n) }))}
                />
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 4 }}>Timeframe</div>
              <SelectField
                value={timeframe}
                onChange={setTimeframe}
                options={TIMEFRAME_OPTIONS.map((tf) => ({ value: tf, label: TIMEFRAME_LABELS[tf] ?? tf }))}
              />
            </div>
          </div>

          {/* Preset rows */}
          <div style={{ marginTop: 12 }}>
            {!cfg.customOnly && cfg.presets.map((p) => {
              const active = bucket === p.key;
              return (
                <div key={p.key}>
                  <button
                    type="button"
                    onClick={() => setBucket(p.key)}
                    className="flex items-center w-full"
                    style={{ padding: "10px 4px", gap: 12, background: "transparent", border: "none", cursor: "pointer" }}
                  >
                    <div style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
                      <div style={{ fontSize: 14, color: C.textPrimary, fontWeight: active ? 600 : 500 }}>
                        {p.label}
                      </div>
                      <div style={{ fontSize: 11, color: C.textSecondary, marginTop: 2 }}>{p.sub}</div>
                    </div>
                    <span
                      className="flex items-center justify-center shrink-0"
                      style={{ width: 20, height: 20, borderRadius: 10, border: `2px solid ${active ? C.brandPurple : C.ui4}` }}
                    >
                      {active && <span style={{ width: 10, height: 10, borderRadius: 5, background: C.brandPurple }} />}
                    </span>
                  </button>
                  <div style={{ height: 1, background: C.ui2 }} />
                </div>
              );
            })}

            {/* Custom — hidden when customOnly (sheet is already in custom mode) */}
            {!cfg.customOnly && (
              <button
                type="button"
                onClick={() => setBucket("custom")}
                className="flex items-center w-full"
                style={{ padding: "10px 4px", gap: 12, background: "transparent", border: "none", cursor: "pointer" }}
              >
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div style={{ fontSize: 14, color: C.textPrimary, fontWeight: bucket === "custom" ? 600 : 500 }}>
                    Custom
                  </div>
                  <div style={{ fontSize: 11, color: C.textSecondary, marginTop: 2 }}>
                    {hasPeers ? "Pick condition and compare to value or indicator" : "Enter a min / max range"}
                  </div>
                </div>
                <span
                  className="flex items-center justify-center shrink-0"
                  style={{ width: 20, height: 20, borderRadius: 10, border: `2px solid ${bucket === "custom" ? C.brandPurple : C.ui4}` }}
                >
                  {bucket === "custom" && <span style={{ width: 10, height: 10, borderRadius: 5, background: C.brandPurple }} />}
                </span>
              </button>
            )}

            {bucket === "custom" && (
              <div style={{ marginTop: 10 }}>
                {!hasPeers ? (
                  <>
                    <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 4 }}>Range</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
                      <input
                        type="number" inputMode="decimal" placeholder="Min"
                        value={customMin}
                        onChange={(e) => setCustomMin(e.target.value)}
                        style={{
                          flex: 1, minWidth: 0, width: "100%",
                          height: 40, padding: "0 12px", borderRadius: 8,
                          border: `1px solid ${C.ui3}`, background: C.bgDefault,
                          fontSize: 14, color: C.textPrimary, outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                      <span style={{ fontSize: 12, color: C.textSecondary, flexShrink: 0 }}>to</span>
                      <input
                        type="number" inputMode="decimal" placeholder="Max"
                        value={customMax}
                        onChange={(e) => setCustomMax(e.target.value)}
                        style={{
                          flex: 1, minWidth: 0, width: "100%",
                          height: 40, padding: "0 12px", borderRadius: 8,
                          border: `1px solid ${C.ui3}`, background: C.bgDefault,
                          fontSize: 14, color: C.textPrimary, outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  </>
                ) : (
                <>
                <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 4 }}>Condition</div>
                <SelectField
                  value={customCond}
                  onChange={(v) => setCustomCond(v as BoundedOscCondition)}
                  options={MA_CUSTOM_CONDITIONS.map((x) => ({ value: x, label: x }))}
                />

                <div style={{ height: 12 }} />

                {customCond === "Between" ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
                    <input
                      type="number" inputMode="decimal" placeholder="Min"
                      value={customMin}
                      onChange={(e) => setCustomMin(e.target.value)}
                      style={{
                        flex: 1, minWidth: 0, width: "100%",
                        height: 32, padding: "0 10px", borderRadius: 6,
                        border: `1px solid ${C.ui3}`, background: C.bgDefault,
                        fontSize: 12, color: C.textPrimary, outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                    <span style={{ fontSize: 12, color: C.textSecondary, flexShrink: 0 }}>to</span>
                    <input
                      type="number" inputMode="decimal" placeholder="Max"
                      value={customMax}
                      onChange={(e) => setCustomMax(e.target.value)}
                      style={{
                        flex: 1, minWidth: 0, width: "100%",
                        height: 32, padding: "0 10px", borderRadius: 6,
                        border: `1px solid ${C.ui3}`, background: C.bgDefault,
                        fontSize: 12, color: C.textPrimary, outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 6 }}>Compare to</div>
                    {!customInd ? (
                      <button
                        type="button"
                        onClick={() => setMoreOpen(true)}
                        className="flex items-center justify-center w-full"
                        style={{
                          height: 40, borderRadius: 8,
                          border: `1px solid ${C.ui3}`, background: C.bgDefault,
                          fontSize: 13, fontWeight: 600, color: C.brandPurple, cursor: "pointer",
                        }}
                      >
                        Choose indicator →
                      </button>
                    ) : (
                      <>
                        <div className="flex items-center" style={{ gap: 10 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: C.textPrimary, flex: 1, minWidth: 0 }}>
                            {customInd}{customIndSuffix}
                          </span>
                          <button
                            type="button"
                            onClick={() => setMoreOpen(true)}
                            style={{ fontSize: 12, color: C.brandPurple, fontWeight: 600, background: "transparent", border: "none", cursor: "pointer" }}
                          >
                            Change
                          </button>
                        </div>
                        {customInd === "Value" ? (
                          <div style={{ marginTop: 10 }}>
                            <input
                              type="number" inputMode="decimal" placeholder="Enter value"
                              value={customMin}
                              onChange={(e) => setCustomMin(e.target.value)}
                              className="w-full"
                              style={{
                                height: 40, padding: "0 12px", borderRadius: 8,
                                border: `1px solid ${C.ui3}`, background: C.bgDefault,
                                fontSize: 14, color: C.textPrimary, outline: "none",
                              }}
                            />
                          </div>
                        ) : customIndNeedsLength ? (
                          <div className="flex" style={{ gap: 10, marginTop: 10 }}>
                            <div className="flex-1" style={{ minWidth: 0 }}>
                              <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 4 }}>Length</div>
                              <SelectField
                                value={String(customIndLen)}
                                onChange={(v) => setCustomIndLen(Number(v))}
                                options={LENGTH_OPTIONS.map((n) => ({ value: String(n), label: String(n) }))}
                              />
                            </div>
                            <div className="flex-1" style={{ minWidth: 0 }}>
                              <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 4 }}>Timeframe</div>
                              <SelectField
                                value={customIndTf}
                                onChange={setCustomIndTf}
                                options={TIMEFRAME_OPTIONS.map((tf) => ({ value: tf, label: TIMEFRAME_LABELS[tf] ?? tf }))}
                              />
                            </div>
                          </div>
                        ) : null}
                      </>
                    )}
                    {(customCond === "Above by %" || customCond === "Below by %") && (
                      <div style={{ marginTop: 10 }}>
                        <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 4 }}>By how much (%)</div>
                        <input
                          type="number" inputMode="decimal" placeholder="e.g. 5"
                          value={customMin}
                          onChange={(e) => setCustomMin(e.target.value)}
                          className="w-full"
                          style={{
                            height: 40, padding: "0 12px", borderRadius: 8,
                            border: `1px solid ${C.ui3}`, background: C.bgDefault,
                            fontSize: 14, color: C.textPrimary, outline: "none",
                          }}
                        />
                      </div>
                    )}
                  </>
                )}
                </>
                )}
              </div>
            )}
          </div>

          {/* Live preview */}
          {bucket !== null && (
            <div
              style={{
                marginTop: 16, padding: "10px 12px", borderRadius: 10,
                background: C.bgMuted, fontSize: 13, color: C.textPrimary, lineHeight: 1.4,
              }}
            >
              <span style={{ fontWeight: 700 }}>{paramsLabel}</span>
              <span> </span>
              <span>{phrase}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center shrink-0"
          style={{ padding: 16, gap: 12, borderTop: `1px solid ${C.ui2}`, background: C.bgDefault }}
        >
          <button
            disabled={bucket === null}
            onClick={() => {
              if (bucket === null) return;
              onAdd({ label: paramsLabel, value: phrase });
            }}
            className="flex items-center justify-center w-full"
            style={{
              height: 48, borderRadius: 24,
              background: bucket === null ? C.ui3 : C.brandPurple,
              fontFamily: "'Messina Sans', 'Inter', sans-serif",
              fontWeight: 700, fontSize: 15, color: "#FFFFFF",
              cursor: bucket === null ? "not-allowed" : "pointer",
              border: "none",
            }}
          >
            Add filter
          </button>
        </div>

        {moreOpen && (
          <MoreIndicatorsSheet
            allowed={compareAllowed}
            onClose={() => setMoreOpen(false)}
            onPick={(name) => { setCustomInd(name); setMoreOpen(false); }}
          />
        )}
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "'Messina Sans', 'Inter', sans-serif",
        fontWeight: 700,
        fontSize: 13,
        color: C.textPrimary,
        marginBottom: 10,
      }}
    >
      {children}
    </div>
  );
}

type RadioState = {
  selected: string; setSelected: (v: string) => void;
  pctBucket: string; setPctBucket: (v: string) => void;
  emaN: number; setEmaN: (n: number) => void;
  emaTf: string; setEmaTf: (v: string) => void;
  customValue: string; setCustomValue: (v: string) => void;
  moreIndicator: string | null; setMoreIndicator: (v: string | null) => void;
  moreLength: number; setMoreLength: (n: number) => void;
  moreTf: string; setMoreTf: (v: string) => void;
};

type VariantProps = {
  indicator: "SMA" | "EMA";
  length: number; setLength: (n: number) => void;
  timeframe: string; setTimeframe: (v: string) => void;
  condition: Condition; setCondition: (c: Condition) => void;
  compareType: CompareType; setCompareType: (c: CompareType) => void;
  priceField: string; setPriceField: (v: string) => void;
  compareMaType: "SMA" | "EMA"; setCompareMaType: (v: "SMA" | "EMA") => void;
  compareMaLength: number; setCompareMaLength: (n: number) => void;
  compareIndicator: string; setCompareIndicator: (v: string) => void;
  compareValue: string; setCompareValue: (v: string) => void;
  rangeLow: string; setRangeLow: (v: string) => void;
  rangeHigh: string; setRangeHigh: (v: string) => void;
  radio: RadioState;
};

const TIMEFRAME_LABELS: Record<string, string> = {
  "1m": "1 minute",
  "5m": "5 minutes",
  "15m": "15 minutes",
  "30m": "30 minutes",
  "1D": "1 day",
};

function SelectField({
  value, onChange, options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none"
        style={{
          height: 40,
          padding: "0 34px 0 12px",
          borderRadius: 8,
          border: `1px solid ${C.ui3}`,
          background: C.bgDefault,
          fontSize: 14,
          color: C.textPrimary,
          outline: "none",
          cursor: "pointer",
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute"
        style={{ right: 12, top: "50%", transform: "translateY(-50%)" }}
        width="14" height="14" viewBox="0 0 20 20" fill="none"
      >
        <path d="M5 7l5 6 5-6" stroke={C.textSecondary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function operatorPhrase(c: Condition): string {
  if (c === "Above") return "is above";
  if (c === "Below") return "is below";
  if (c === "Crosses above") return "crosses above";
  if (c === "Crosses below") return "crosses below";
  return "is between";
}

function previewRightSide(r: RadioState): string {
  if (r.selected === "above") return "Price";
  if (r.selected === "pct") {
    const b = PCT_BUCKETS.find((x) => x.value === r.pctBucket);
    return `Price by ${b?.label ?? ""}`;
  }
  if (r.selected === "ema_n") return `EMA(${r.emaN}, ${r.emaTf})`;
  if (r.selected === "other") {
    if (!r.moreIndicator) return "Other indicator";
    if (r.moreIndicator === "Value") return r.customValue ? r.customValue : "Value";
    const needsLength = LENGTH_TIMEFRAME_INDICATORS.has(r.moreIndicator);
    const isBollinger = r.moreIndicator.startsWith("Bollinger");
    const suffix = needsLength ? (isBollinger ? ` (${r.moreLength}, 2)` : ` (${r.moreLength})`) : "";
    return `${r.moreIndicator}${suffix}`;
  }
  return "";
}

export function _VariantChips(p: VariantProps) {
  const isBetween = p.condition === "Between";
  const rightSide = isBetween
    ? `${p.rangeLow || "min"} and ${p.rangeHigh || "max"}`
    : previewRightSide(p.radio);
  return (
    <div style={{ padding: "4px 16px 8px" }}>
      <div className="flex" style={{ gap: 10 }}>
        <div className="flex-1" style={{ minWidth: 0 }}>
          <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 4 }}>Length</div>
          <SelectField
            value={String(p.length)}
            onChange={(v) => p.setLength(Number(v))}
            options={LENGTH_OPTIONS.map((n) => ({ value: String(n), label: String(n) }))}
          />
        </div>
        <div className="flex-1" style={{ minWidth: 0 }}>
          <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 4 }}>Timeframe</div>
          <SelectField
            value={p.timeframe}
            onChange={p.setTimeframe}
            options={TIMEFRAME_OPTIONS.map((tf) => ({ value: tf, label: TIMEFRAME_LABELS[tf] ?? tf }))}
          />
        </div>
      </div>

      <div style={{ height: 20 }} />
      <SectionLabel>Condition</SectionLabel>
      <SelectField
        value={p.condition}
        onChange={(v) => p.setCondition(v as Condition)}
        options={(CONDITIONS as unknown as string[]).map((c) => ({ value: c, label: c }))}
      />
      <div style={{ height: 20 }} />
      {isBetween ? (
        <div className="flex" style={{ gap: 10 }}>
          <div className="flex-1" style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 4 }}>Min</div>
            <input
              type="number"
              inputMode="decimal"
              placeholder="e.g. 100"
              value={p.rangeLow}
              onChange={(e) => p.setRangeLow(e.target.value)}
              style={{
                width: "100%", height: 44, padding: "0 12px",
                border: `1px solid ${C.ui3}`, borderRadius: 8,
                fontSize: 14, color: C.textPrimary, background: C.bgDefault,
                outline: "none",
              }}
            />
          </div>
          <div className="flex-1" style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 4 }}>Max</div>
            <input
              type="number"
              inputMode="decimal"
              placeholder="e.g. 200"
              value={p.rangeHigh}
              onChange={(e) => p.setRangeHigh(e.target.value)}
              style={{
                width: "100%", height: 44, padding: "0 12px",
                border: `1px solid ${C.ui3}`, borderRadius: 8,
                fontSize: 14, color: C.textPrimary, background: C.bgDefault,
                outline: "none",
              }}
            />
          </div>
        </div>
      ) : (
        <ConditionRadioList r={p.radio} />
      )}

      {/* Live preview — bottom */}
      <div
        style={{
          padding: "10px 12px",
          marginTop: 20,
          borderRadius: 10,
          background: C.bgMuted,
          fontSize: 13,
          color: C.textPrimary,
          lineHeight: 1.4,
        }}
      >
        <span style={{ fontWeight: 700 }}>
          {p.indicator}({p.length}, {p.timeframe})
        </span>
        <span style={{ color: C.textSecondary }}> {operatorPhrase(p.condition)} </span>
        <span style={{ fontWeight: 700 }}>{rightSide}</span>
      </div>
    </div>
  );
}

type AboveOption = { value: string; label: string; sub: string; inline?: "pct" | "ema" | "value" | "other" };

const ABOVE_OPTIONS: AboveOption[] = [
  { value: "above",   label: "Price",             sub: "Close is above the average" },
  { value: "pct",     label: "Price by x%",       sub: "Close is above the average by a margin", inline: "pct" },
  { value: "ema_n",   label: "EMA(n)",            sub: "Compare against another EMA",            inline: "ema" },
  { value: "other",   label: "Other indicators",  sub: "Compare against another indicator",      inline: "other" },
];

const PCT_BUCKETS: { value: string; label: string }[] = [
  { value: "0_10",    label: "0%–10%" },
  { value: "10_plus", label: "10% or more" },
  { value: "20_plus", label: "20% or more" },
];

const MORE_INDICATOR_GROUPS: { heading: string; items: string[] }[] = [
  { heading: "", items: ["Value"] },
  { heading: "Price", items: ["Open", "High", "Low", "Close", "Price"] },
  { heading: "Moving averages", items: ["Exponential Moving Average", "Simple Moving Average"] },
  { heading: "Oscillators", items: ["RSI", "Stochastic %K", "Stochastic %D", "StochRSI %K", "StochRSI %D", "MFI", "Williams %R", "CCI", "ROC"] },
  { heading: "Trend", items: ["ADX", "+DI", "-DI", "Aroon Up", "Aroon Down", "Supertrend"] },
  { heading: "MACD", items: ["MACD Line", "MACD Signal", "MACD Histogram"] },
  { heading: "Bollinger Bands", items: ["Bollinger Upper", "Bollinger Middle", "Bollinger Lower", "Bollinger %B", "Bollinger Bandwidth"] },
  { heading: "VWAP & Channels", items: ["VWAP", "Donchian Upper", "Donchian Lower", "Keltner Upper", "Keltner Lower", "Parabolic SAR"] },
  { heading: "Ichimoku", items: ["Ichimoku Senkou A", "Ichimoku Senkou B", "Ichimoku Kijun", "Ichimoku Tenkan"] },
  { heading: "Volatility", items: ["ATR", "ATR %", "Historical Volatility"] },
  { heading: "Pivots (Standard)", items: ["Pivot Point", "Pivot R1", "Pivot R2", "Pivot R3", "Pivot S1", "Pivot S2", "Pivot S3"] },
  { heading: "Pivots (Camarilla)", items: ["Camarilla R1", "Camarilla R2", "Camarilla R3", "Camarilla R4", "Camarilla S1", "Camarilla S2", "Camarilla S3", "Camarilla S4"] },
  { heading: "CPR", items: ["CPR Upper", "CPR Lower", "CPR Width %"] },
];

const LENGTH_TIMEFRAME_INDICATORS = new Set([
  "Bollinger Upper", "Bollinger Middle", "Bollinger Lower",
  "Exponential Moving Average", "Simple Moving Average",
  "Donchian Upper", "Donchian Lower",
  "Keltner Upper", "Keltner Lower",
  "Ichimoku Senkou A", "Ichimoku Senkou B", "Ichimoku Kijun", "Ichimoku Tenkan",
]);

function ConditionRadioList({ r }: { r: RadioState }) {
  const { selected, setSelected, pctBucket, setPctBucket, emaN, setEmaN, emaTf, setEmaTf,
    customValue, setCustomValue, moreIndicator, setMoreIndicator, moreLength, setMoreLength,
    moreTf, setMoreTf } = r;
  const [moreOpen, setMoreOpen] = useState<boolean>(false);

  const needsLength = moreIndicator ? LENGTH_TIMEFRAME_INDICATORS.has(moreIndicator) : false;
  const isBollinger = moreIndicator ? moreIndicator.startsWith("Bollinger") : false;
  const paramSuffix = moreIndicator && needsLength
    ? isBollinger ? ` (${moreLength}, 2)` : ` (${moreLength})`
    : "";

  return (
    <>
      <div className="flex flex-col" style={{ gap: 14 }}>
        {ABOVE_OPTIONS.map((opt) => {
          const active = opt.value === selected;
          return (
            <div key={opt.value}>
              <button
                type="button"
                onClick={() => {
                  setSelected(opt.value);
                  if (opt.value === "other" && !moreIndicator) setMoreOpen(true);
                }}
                className="flex items-start w-full text-left"
                style={{ gap: 12, padding: 0, background: "transparent", border: "none", cursor: "pointer" }}
              >
                <span className="flex-1" style={{ minWidth: 0, fontSize: 14, color: C.textPrimary, fontWeight: 500 }}>
                  {opt.label}
                </span>
                <span
                  className="flex items-center justify-center shrink-0"
                  style={{
                    width: 20, height: 20, borderRadius: 10,
                    border: `2px solid ${active ? C.brandPurple : C.ui4}`,
                    marginTop: 4,
                  }}
                >
                  {active && (
                    <span style={{ width: 10, height: 10, borderRadius: 5, background: C.brandPurple }} />
                  )}
                </span>
              </button>
              {active && opt.inline === "pct" && (
                <div className="flex items-center" style={{ gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                  {PCT_BUCKETS.map((b) => {
                    const bActive = b.value === pctBucket;
                    return (
                      <button
                        key={b.value}
                        type="button"
                        onClick={() => setPctBucket(b.value)}
                        style={{
                          height: 34, padding: "0 14px", borderRadius: 17,
                          border: `1px solid ${bActive ? C.brandPurple : C.ui3}`,
                          background: bActive ? "#F5EFFB" : C.bgDefault,
                          color: bActive ? C.brandPurple : C.textPrimary,
                          fontSize: 13, fontWeight: bActive ? 700 : 500,
                          whiteSpace: "nowrap", cursor: "pointer",
                        }}
                      >
                        {b.label}
                      </button>
                    );
                  })}
                </div>
              )}
              {active && opt.inline === "ema" && (
                <div className="flex" style={{ gap: 10, marginTop: 10 }}>
                  <div className="flex-1" style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 4 }}>Length</div>
                    <SelectField
                      value={String(emaN)}
                      onChange={(v) => setEmaN(Number(v))}
                      options={LENGTH_OPTIONS.map((n) => ({ value: String(n), label: String(n) }))}
                    />
                  </div>
                  <div className="flex-1" style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 4 }}>Timeframe</div>
                    <SelectField
                      value={emaTf}
                      onChange={setEmaTf}
                      options={TIMEFRAME_OPTIONS.map((tf) => ({ value: tf, label: TIMEFRAME_LABELS[tf] ?? tf }))}
                    />
                  </div>
                </div>
              )}
              {active && opt.inline === "value" && (
                <div style={{ marginTop: 10 }}>
                  <input
                    type="number" inputMode="decimal"
                    value={customValue}
                    onChange={(e) => setCustomValue(e.target.value)}
                    placeholder="Enter value"
                    className="w-full"
                    style={{
                      height: 40, padding: "0 12px", borderRadius: 8,
                      border: `1px solid ${C.ui3}`, background: C.bgDefault,
                      fontSize: 14, color: C.textPrimary, outline: "none",
                    }}
                  />
                </div>
              )}
              {active && opt.inline === "other" && (
                <div style={{ marginTop: 10 }}>
                  {!moreIndicator ? (
                    <button
                      type="button"
                      onClick={() => setMoreOpen(true)}
                      className="flex items-center justify-center w-full"
                      style={{
                        height: 40, borderRadius: 8,
                        border: `1px solid ${C.ui3}`, background: C.bgDefault,
                        fontSize: 13, fontWeight: 600, color: C.brandPurple, cursor: "pointer",
                      }}
                    >
                      Choose indicator →
                    </button>
                  ) : (
                    <>
                      <div className="flex items-center" style={{ gap: 10 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: C.textPrimary, flex: 1, minWidth: 0 }}>
                          {moreIndicator}{paramSuffix}
                        </span>
                        <button
                          type="button"
                          onClick={() => setMoreOpen(true)}
                          style={{
                            fontSize: 12, color: C.brandPurple, fontWeight: 600,
                            background: "transparent", border: "none", cursor: "pointer",
                          }}
                        >
                          Change
                        </button>
                      </div>
                      <div style={{ height: 10 }} />
                      {moreIndicator === "Value" ? (
                        <input
                          type="number" inputMode="decimal"
                          value={customValue}
                          onChange={(e) => setCustomValue(e.target.value)}
                          placeholder="Enter value"
                          className="w-full"
                          style={{
                            height: 40, padding: "0 12px", borderRadius: 8,
                            border: `1px solid ${C.ui3}`, background: C.bgDefault,
                            fontSize: 14, color: C.textPrimary, outline: "none",
                          }}
                        />
                      ) : needsLength ? (
                        <div className="flex" style={{ gap: 10 }}>
                          <div className="flex-1" style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 4 }}>Length</div>
                            <SelectField
                              value={String(moreLength)}
                              onChange={(v) => setMoreLength(Number(v))}
                              options={LENGTH_OPTIONS.map((n) => ({ value: String(n), label: String(n) }))}
                            />
                          </div>
                          <div className="flex-1" style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 4 }}>Timeframe</div>
                            <SelectField
                              value={moreTf}
                              onChange={setMoreTf}
                              options={TIMEFRAME_OPTIONS.map((tf) => ({ value: tf, label: TIMEFRAME_LABELS[tf] ?? tf }))}
                            />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 4 }}>Timeframe</div>
                          <SelectField
                            value={moreTf}
                            onChange={setMoreTf}
                            options={TIMEFRAME_OPTIONS.map((tf) => ({ value: tf, label: TIMEFRAME_LABELS[tf] ?? tf }))}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {moreOpen && (
        <MoreIndicatorsSheet
          onClose={() => setMoreOpen(false)}
          onPick={(name) => { setMoreIndicator(name); setSelected("other"); setMoreOpen(false); }}
        />
      )}
    </>
  );
}

function MoreIndicatorsSheet({ onClose, onPick, allowed }: { onClose: () => void; onPick: (name: string) => void; allowed?: string[] }) {
  const allowSet = allowed ? new Set(allowed) : null;
  return (
    <div
      className="absolute inset-0 flex flex-col"
      style={{ zIndex: 60, background: "rgba(0,0,0,0.4)" }}
      onClick={onClose}
    >
      <div className="flex-1" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col"
        style={{
          background: C.bgDefault,
          borderTopLeftRadius: 20, borderTopRightRadius: 20,
          maxHeight: "85%", overflowY: "auto",
        }}
      >
        <div className="flex items-center justify-center" style={{ paddingTop: 8, paddingBottom: 4 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: C.ui3 }} />
        </div>
        <div className="flex items-center" style={{ padding: "8px 16px 12px", gap: 8 }}>
          <span
            style={{
              fontFamily: "'Messina Sans', 'Inter', sans-serif",
              fontWeight: 700, fontSize: 18, color: C.textPrimary, flex: 1,
            }}
          >
            More indicators
          </span>
          <button
            onClick={onClose}
            className="flex items-center justify-center"
            style={{ width: 32, height: 32, borderRadius: 16 }}
          >
            <X size={18} color={C.textSecondary} />
          </button>
        </div>
        <div style={{ padding: "0 16px 20px" }}>
          {MORE_INDICATOR_GROUPS.map((g, idx) => {
            const items = allowSet ? g.items.filter((it) => allowSet.has(it)) : g.items;
            if (items.length === 0) return null;
            return (
            <div key={g.heading || `g-${idx}`} style={{ marginBottom: 14 }}>
              {g.heading && (
                <div
                  style={{
                    fontSize: 11, color: C.textSecondary, fontWeight: 600,
                    textTransform: "uppercase", letterSpacing: 0.5,
                    marginBottom: 4, marginTop: 4,
                  }}
                >
                  {g.heading}
                </div>
              )}
              {items.map((it) => (
                <div
                  key={it}
                  onClick={() => onPick(it)}
                  className="flex items-center"
                  style={{
                    height: 44, padding: "0 4px",
                    borderBottom: `1px solid ${C.ui2}`,
                    fontSize: 14, color: C.textPrimary, cursor: "pointer",
                  }}
                >
                  {it}
                </div>
              ))}
            </div>
          );
          })}
        </div>
      </div>
    </div>
  );
}

// ───── Scan Universe / Sector sheets ─────

function SaveScreenerSheet({
  initialName, initialDescription = "", initialVisibility = "Private", onClose, onSave,
}: {
  initialName: string;
  initialDescription?: string;
  initialVisibility?: "Private" | "Public";
  onClose: () => void;
  onSave: (name: string, description: string, visibility: "Private" | "Public") => void;
}) {
  const [name, setName] = useState<string>(initialName);
  const [description, setDescription] = useState<string>(initialDescription);
  const [visibility, setVisibility] = useState<"Private" | "Public">(initialVisibility);
  const trimmed = name.trim();
  const canSave = trimmed.length > 0;

  const labelStyle = {
    display: "block",
    fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: 12,
    lineHeight: "16px",
    fontWeight: 500,
    color: C.textSecondary,
    marginBottom: 6,
  } as const;

  const fieldBase = {
    width: "100%",
    padding: "10px 12px",
    border: `1px solid ${C.ui3}`,
    borderRadius: 6,
    fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: 14,
    lineHeight: "20px",
    color: C.textPrimary,
    background: "#FFFFFF",
    outline: "none",
  } as const;

  return (
    <BottomSheetShell
      title="Save screener"
      onClose={onClose}
      actionLabel="Save"
      onAction={() => { if (canSave) onSave(trimmed, description.trim(), visibility); }}
    >
      <div style={{ padding: "0 16px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Name */}
        <div>
          <label htmlFor="save-screener-name" style={labelStyle}>Screener name</label>
          <input
            id="save-screener-name"
            type="text"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Momentum breakouts"
            style={{ ...fieldBase, height: 44 }}
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="save-screener-desc" style={labelStyle}>Description (optional)</label>
          <textarea
            id="save-screener-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does this screener find? e.g. Large-cap breakouts above 52-week high with rising volume."
            rows={3}
            style={{ ...fieldBase, minHeight: 72, resize: "vertical" }}
          />
        </div>

        {/* Visibility */}
        <div>
          <div style={labelStyle}>Visibility</div>
          <div style={{ display: "flex", gap: 8 }}>
            {(["Private", "Public"] as const).map((v) => {
              const active = visibility === v;
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVisibility(v)}
                  style={{
                    flex: 1,
                    height: 40,
                    padding: "0 12px",
                    borderRadius: 6,
                    border: `1px solid ${active ? C.brandPurple : C.ui3}`,
                    background: active ? "#FBF8FD" : "#FFFFFF",
                    color: active ? C.brandPurple : C.textPrimary,
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontSize: 14,
                    lineHeight: "20px",
                    fontWeight: active ? 600 : 500,
                    cursor: "pointer",
                  }}
                >
                  {v}
                </button>
              );
            })}
          </div>
          <div
            style={{
              marginTop: 8,
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 12,
              lineHeight: "16px",
              color: C.textSecondary,
            }}
          >
            {visibility === "Private"
              ? "Only you can see this screener. It won't appear in the marketplace."
              : "Discoverable in the marketplace — other users can view, run, and follow it. You'll be credited as the creator."}
          </div>
        </div>
      </div>
    </BottomSheetShell>
  );
}

function ScanUniverseSheet({
  value, onClose, onPick,
}: {
  value: string; onClose: () => void; onPick: (v: string) => void;
}) {
  return (
    <BottomSheetShell title="Scan Universe" onClose={onClose}>
      <div style={{ padding: "0 16px 20px" }}>
        {SCAN_UNIVERSE_OPTIONS.map((opt) => {
          const active = opt === value;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onPick(opt)}
              className="flex items-center w-full"
              style={{
                height: 48, padding: "0 4px", gap: 12,
                borderBottom: `1px solid ${C.ui2}`,
                background: "transparent", border: "none", cursor: "pointer",
              }}
            >
              <span style={{ flex: 1, textAlign: "left", fontSize: 14, color: C.textPrimary, fontWeight: active ? 700 : 400 }}>
                {opt}
              </span>
              <span
                className="flex items-center justify-center shrink-0"
                style={{
                  width: 20, height: 20, borderRadius: 10,
                  border: `2px solid ${active ? C.brandPurple : C.ui4}`,
                }}
              >
                {active && <span style={{ width: 10, height: 10, borderRadius: 5, background: C.brandPurple }} />}
              </span>
            </button>
          );
        })}
      </div>
    </BottomSheetShell>
  );
}

function MultiSelectSheet({
  title, options, value, onClose, onApply,
}: {
  title: string;
  options: string[];
  value: string[];
  onClose: () => void;
  onApply: (v: string[]) => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set(value));
  const toggle = (s: string) => {
    const next = new Set(selected);
    if (next.has(s)) next.delete(s); else next.add(s);
    setSelected(next);
  };
  const allOn = selected.size === options.length;
  return (
    <BottomSheetShell
      title={title}
      onClose={onClose}
      actionLabel={`Apply${selected.size > 0 ? ` (${selected.size})` : ""}`}
      onAction={() => onApply([...selected])}
      headerRight={
        <button
          type="button"
          onClick={() => setSelected(allOn ? new Set() : new Set(options))}
          style={{
            fontSize: 12, color: C.brandPurple, fontWeight: 600,
            background: "transparent", border: "none", cursor: "pointer",
          }}
        >
          {allOn ? "Clear all" : "Select all"}
        </button>
      }
    >
      <div style={{ padding: "0 16px 20px" }}>
        {options.map((opt) => {
          const active = selected.has(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className="flex items-center w-full"
              style={{
                height: 44, padding: "0 4px", gap: 12,
                borderBottom: `1px solid ${C.ui2}`,
                background: "transparent", border: "none", cursor: "pointer",
              }}
            >
              <span
                className="flex items-center justify-center shrink-0"
                style={{
                  width: 18, height: 18, borderRadius: 4,
                  border: `2px solid ${active ? C.brandPurple : C.ui4}`,
                  background: active ? C.brandPurple : "transparent",
                }}
              >
                {active && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5.5l2 2 4-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span style={{ flex: 1, textAlign: "left", fontSize: 14, color: C.textPrimary, fontWeight: active ? 600 : 400 }}>
                {opt}
              </span>
            </button>
          );
        })}
      </div>
    </BottomSheetShell>
  );
}

function BottomSheetShell({
  title, onClose, children, actionLabel, onAction, headerRight,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  headerRight?: React.ReactNode;
}) {
  const isDesktop = useIsDesktop();
  const overlayPositionClass = isDesktop ? "fixed inset-0" : "absolute inset-0";
  const panelRadiusStyle: React.CSSProperties = isDesktop
    ? { borderRadius: 12, width: "min(520px, 92vw)", maxHeight: "85vh" }
    : { borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "85%" };
  return (
    <div
      className={`${overlayPositionClass} flex flex-col`}
      style={{
        zIndex: 50,
        background: "rgba(0,0,0,0.4)",
        alignItems: isDesktop ? "center" : undefined,
        justifyContent: isDesktop ? "center" : undefined,
      }}
      onClick={onClose}
    >
      {!isDesktop && <div className="flex-1" />}
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col"
        style={{
          background: C.bgDefault,
          ...panelRadiusStyle,
          minHeight: 0,
        }}
      >
        {!isDesktop && (
          <div className="flex items-center justify-center shrink-0" style={{ paddingTop: 8, paddingBottom: 4 }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: C.ui3 }} />
          </div>
        )}
        <div className="flex items-center shrink-0" style={{ padding: "8px 16px 12px", gap: 8 }}>
          <span style={{
            fontFamily: "'Messina Sans', 'Inter', sans-serif",
            fontWeight: 700, fontSize: 18, color: C.textPrimary, flex: 1,
          }}>
            {title}
          </span>
          {headerRight}
          <button
            onClick={onClose}
            className="flex items-center justify-center"
            style={{ width: 32, height: 32, borderRadius: 16 }}
          >
            <X size={18} color={C.textSecondary} />
          </button>
        </div>
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
          {children}
        </div>
        {actionLabel && onAction && (
          <div
            className="flex items-center shrink-0"
            style={{ padding: 16, gap: 12, borderTop: `1px solid ${C.ui2}`, background: C.bgDefault }}
          >
            <button
              onClick={onAction}
              className="flex items-center justify-center w-full"
              style={{
                height: 48, borderRadius: 24, background: C.brandPurple,
                fontFamily: "'Messina Sans', 'Inter', sans-serif",
                fontWeight: 700, fontSize: 15, color: "#FFFFFF",
              }}
            >
              {actionLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ───── Create Custom Scanner (placeholder builder screen) ─────
type BuilderTab = "Filters" | "Scrips" | "Details";
type ScreenerMeta = { name: string; description: string; visibility: "Private" | "Public"; savedAt: number };

function CreateScannerScreen({
  onBack,
  onAddFilter,
  filters,
  scanUniverse,
  setScanUniverse,
  industries,
  setIndustries,
  sectors,
  setSectors,
  extraFilters,
  setExtraFilters,
}: {
  onBack: () => void;
  onAddFilter: () => void;
  filters: Filter[];
  scanUniverse: string;
  setScanUniverse: (v: string) => void;
  industries: string[];
  setIndustries: (v: string[]) => void;
  sectors: string[];
  setSectors: (v: string[]) => void;
  extraFilters: Filter[];
  setExtraFilters: (v: Filter[]) => void;
}) {
  const [tab, setTab] = useState<BuilderTab>("Filters");
  const [screenerName, setScreenerName] = useState<string>("");
  const [savedMeta, setSavedMeta] = useState<ScreenerMeta | null>(null);
  const [saveOpen, setSaveOpen] = useState<boolean>(false);
  const [openSheet, setOpenSheet] = useState<null | "universe" | "industries" | "sectors">(null);
  const [editIndicator, setEditIndicator] = useState<{ indicator: "SMA" | "EMA"; extraIdx: number } | null>(null);
  const [editBoundedOsc, setEditBoundedOsc] = useState<{ name: string; extraIdx: number } | null>(null);
  const [editCandle, setEditCandle] = useState<{ pattern: string; extraIdx: number } | null>(null);
  const [editNumeric, setEditNumeric] = useState<{ name: string; unit: string; related: string[]; extraIdx: number; simpleCustom?: boolean } | null>(null);

  const replaceExtra = (extraIdx: number, f: Filter) => {
    const next = extraFilters.slice();
    next[extraIdx] = f;
    setExtraFilters(next);
  };

  return (
    <div className="flex flex-col flex-1" style={{ background: C.bgDefault, minHeight: 0 }}>
      {/* Header — design system: 56px height, 16px padding, Inter 14/20 medium */}
      <div
        className="flex items-center justify-between"
        style={{
          height: 56,
          padding: 16,
          background: "#FFFFFF",
        }}
      >
        <div className="flex items-center" style={{ gap: 16 }}>
          <button
            aria-label="Back"
            onClick={onBack}
            className="flex items-center justify-center shrink-0"
            style={{ width: 24, height: 24, borderRadius: 4 }}
          >
            <ArrowLeft size={24} color="#262626" />
          </button>
          <div className="flex flex-col" style={{ minWidth: 0 }}>
            <span
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontWeight: 600,
                fontSize: 14,
                lineHeight: "20px",
                color: "#262626",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {savedMeta ? savedMeta.name : "Create New Screener"}
            </span>
            {savedMeta && (
              <span
                style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontWeight: 400,
                  fontSize: 11,
                  lineHeight: "14px",
                  color: C.textSecondary,
                }}
              >
                Saved {formatRelativeTime(savedMeta.savedAt)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Builder tabs */}
      <BuilderTabs
        activeTab={tab}
        onChange={setTab}
        scripCount={SAMPLE_SCRIPS.length}
        filterCount={filters.length}
        showDetails={savedMeta != null}
      />

      {/* Body */}
      {tab === "Details" && savedMeta ? (
        <DetailsTabBody
          meta={savedMeta}
          onEdit={() => setSaveOpen(true)}
          onVisibilityChange={(v) => setSavedMeta({ ...savedMeta, visibility: v })}
          onDelete={() => {
            setSavedMeta(null);
            setScreenerName("");
            setTab("Filters");
          }}
        />
      ) : tab === "Filters" ? (
        <FiltersTabBody
          onAddFilter={onAddFilter}
          filters={filters}
          onSave={() => setSaveOpen(true)}
          scripMatchCount={SAMPLE_SCRIPS.length}
          onViewScrips={() => setTab("Scrips")}
          onEdit={(label, idx) => {
            if (label === "Scan Universe") { setOpenSheet("universe"); return; }
            if (label === "Industry") { setOpenSheet("industries"); return; }
            if (label === "Sector") { setOpenSheet("sectors"); return; }
            // First 3 rows are defaults; extraFilters start at idx 3.
            const extraIdx = idx - 3;
            if (extraIdx < 0 || extraIdx >= extraFilters.length) return;
            const indName = label.split(" (")[0].trim();
            if (indName === "SMA" || indName === "EMA") {
              setEditIndicator({ indicator: indName as "SMA" | "EMA", extraIdx });
            } else if (BOUNDED_OSC_CONFIG[indName]) {
              setEditBoundedOsc({ name: indName, extraIdx });
            } else if (CANDLESTICK_PATTERNS_LIST.includes(label)) {
              setEditCandle({ pattern: label, extraIdx });
            } else if (SHAREHOLDING_PARAMS.includes(label)) {
              setEditNumeric({ name: label, unit: paramUnit(label), related: SHAREHOLDING_PARAMS, extraIdx, simpleCustom: true });
            } else if (VALUATION_PARAMS.includes(label)) {
              setEditNumeric({ name: label, unit: paramUnit(label), related: VALUATION_PARAMS, extraIdx, simpleCustom: true });
            } else if (PROFITABILITY_PARAMS.includes(label)) {
              setEditNumeric({ name: label, unit: paramUnit(label), related: PROFITABILITY_PARAMS, extraIdx });
            } else if (BALANCE_SHEET_PARAMS.includes(label)) {
              setEditNumeric({ name: label, unit: paramUnit(label), related: BALANCE_SHEET_PARAMS, extraIdx });
            } else if (INCOME_GROWTH_PARAMS.includes(label)) {
              setEditNumeric({ name: label, unit: paramUnit(label), related: INCOME_GROWTH_PARAMS, extraIdx });
            } else if (QUALITY_SCORE_PARAMS.includes(label)) {
              setEditNumeric({ name: label, unit: paramUnit(label), related: QUALITY_SCORE_PARAMS, extraIdx });
            } else if (FUTURES_OPTIONS_PARAMS.includes(label)) {
              setEditNumeric({ name: label, unit: paramUnit(label), related: FUTURES_OPTIONS_PARAMS, extraIdx, simpleCustom: PRESETS_BY_PARAM[label] == null });
            }
          }}
        />
      ) : (
        <ScripsTabBody />
      )}

      {saveOpen && (
        <SaveScreenerSheet
          initialName={savedMeta?.name ?? screenerName}
          initialDescription={savedMeta?.description ?? ""}
          initialVisibility={savedMeta?.visibility ?? "Private"}
          onClose={() => setSaveOpen(false)}
          onSave={(name, description, visibility) => {
            setScreenerName(name);
            setSavedMeta({ name, description, visibility, savedAt: Date.now() });
            setSaveOpen(false);
            setTab("Details");
          }}
        />
      )}
      {openSheet === "universe" && (
        <ScanUniverseSheet
          value={scanUniverse}
          onClose={() => setOpenSheet(null)}
          onPick={(v) => { setScanUniverse(v); setOpenSheet(null); }}
        />
      )}
      {openSheet === "industries" && (
        <MultiSelectSheet
          title="Industry"
          options={INDUSTRY_OPTIONS}
          value={industries}
          onClose={() => setOpenSheet(null)}
          onApply={(v) => { setIndustries(v); setOpenSheet(null); }}
        />
      )}
      {openSheet === "sectors" && (
        <MultiSelectSheet
          title="Sector"
          options={SECTOR_OPTIONS}
          value={sectors}
          onClose={() => setOpenSheet(null)}
          onApply={(v) => { setSectors(v); setOpenSheet(null); }}
        />
      )}
      {editIndicator && (
        <IndicatorConfigSheet
          indicator={editIndicator.indicator}
          onClose={() => setEditIndicator(null)}
          onAdd={(f) => {
            replaceExtra(editIndicator.extraIdx, f);
            setEditIndicator(null);
          }}
        />
      )}
      {editBoundedOsc && (
        <BoundedOscSheet
          indicator={editBoundedOsc.name}
          onClose={() => setEditBoundedOsc(null)}
          onAdd={(f) => {
            replaceExtra(editBoundedOsc.extraIdx, f);
            setEditBoundedOsc(null);
          }}
        />
      )}
      {editCandle && (
        <CandlestickConfigSheet
          pattern={editCandle.pattern}
          onClose={() => setEditCandle(null)}
          onAdd={(f) => {
            replaceExtra(editCandle.extraIdx, f);
            setEditCandle(null);
          }}
        />
      )}
      {editNumeric && (
        <NumericConfigSheet
          param={editNumeric.name}
          unit={editNumeric.unit}
          relatedParams={editNumeric.related}
          simpleCustom={editNumeric.simpleCustom}
          onClose={() => setEditNumeric(null)}
          onAdd={(f) => {
            replaceExtra(editNumeric.extraIdx, f);
            setEditNumeric(null);
          }}
        />
      )}
    </div>
  );
}

function BuilderTabs({
  activeTab,
  onChange,
  scripCount,
  filterCount,
  showDetails = false,
}: {
  activeTab: BuilderTab;
  onChange: (tab: BuilderTab) => void;
  scripCount: number;
  filterCount: number;
  showDetails?: boolean;
}) {
  const tabs: Array<{ key: BuilderTab; label: string; count?: number }> = [
    { key: "Filters", label: "Filters", count: filterCount },
    { key: "Scrips", label: "Scrips", count: scripCount },
    ...(showDetails ? [{ key: "Details" as BuilderTab, label: "Details" }] : []),
  ];
  return (
    <div className="relative" style={{ height: 44 }}>
      <div
        className="absolute"
        style={{ left: 0, right: 0, bottom: 0, height: 1, background: C.ui2 }}
        aria-hidden
      />
      <div className="flex items-center h-full" style={{ padding: "0 16px", gap: 24 }}>
        {tabs.map((t) => {
          const active = activeTab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => onChange(t.key)}
              className="flex items-center justify-center"
              style={{
                height: 44,
                padding: "12px 0",
                gap: 6,
                borderBottom: active ? `2px solid ${C.textPrimary}` : "2px solid transparent",
                cursor: "pointer",
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  lineHeight: "20px",
                  fontWeight: 600,
                  color: active ? C.textPrimary : C.textTertiary,
                }}
              >
                {t.label}
              </span>
              {typeof t.count === "number" && (
                <span
                  className="flex items-center justify-center"
                  style={{
                    minWidth: 20,
                    height: 18,
                    padding: "0 6px",
                    borderRadius: 9,
                    background: active ? C.bgPlusChipBg : C.ui2,
                    fontSize: 11,
                    fontWeight: 700,
                    color: active ? C.brandPurple : C.textTertiary,
                  }}
                >
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FiltersTabBody({
  onAddFilter,
  filters,
  onEdit,
  onSave,
  scripMatchCount,
  onViewScrips,
}: {
  onAddFilter: () => void;
  filters: Filter[];
  onEdit?: (label: string, idx: number) => void;
  onSave?: () => void;
  scripMatchCount: number;
  onViewScrips: () => void;
}) {
  return (
    <div className="flex flex-col flex-1" style={{ background: C.bgDefault }}>
      <div className="flex flex-col" style={{ padding: "0 16px" }}>
        {filters.map((f, idx) => (
          <div key={`${f.label}-${idx}`} className="flex flex-col">
            <FilterRow label={f.label} value={f.value} onEdit={onEdit ? () => onEdit(f.label, idx) : undefined} />
            {idx < filters.length - 1 && <HorizontalDivider />}
          </div>
        ))}

        <button
          onClick={onAddFilter}
          className="flex items-center justify-center w-full"
          style={{ ...mobileButton.secondary, marginTop: 16 }}
        >
          <Plus size={14} color={mobileButton.secondary.color} />
          Add filters
        </button>

        <div
          className="flex items-center justify-between"
          style={{
            marginTop: 12,
            padding: "10px 12px",
            background: C.bgMuted,
            border: `1px solid ${C.ui2}`,
            borderRadius: 6,
          }}
        >
          <span
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 13,
              lineHeight: "18px",
              fontWeight: 500,
              color: C.textPrimary,
            }}
          >
            {scripMatchCount} scrips matched.
          </span>
          <button
            type="button"
            onClick={onViewScrips}
            style={{
              background: "transparent",
              border: "none",
              padding: 0,
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 13,
              lineHeight: "18px",
              fontWeight: 600,
              color: C.brandPurple,
              cursor: "pointer",
            }}
          >
            View
          </button>
        </div>
      </div>

      <div style={{ padding: 16, marginTop: "auto" }}>
        <button
          onClick={onSave}
          className="flex items-center justify-center w-full"
          style={mobileButton.primary}
        >
          Save Screener
        </button>
      </div>
    </div>
  );
}

function formatRelativeTime(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 5) return "just now";
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function DetailsTabBody({
  meta,
  onEdit,
  onVisibilityChange,
  onDelete,
}: {
  meta: ScreenerMeta;
  onEdit: () => void;
  onVisibilityChange: (v: "Private" | "Public") => void;
  onDelete: () => void;
}) {
  const isPublic = meta.visibility === "Public";
  const [confirmDelete, setConfirmDelete] = useState(false);

  const sectionLabel = {
    fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: 11,
    lineHeight: "14px",
    fontWeight: 600,
    color: C.textSecondary,
    textTransform: "uppercase" as const,
    letterSpacing: 0.4,
    marginBottom: 8,
  } as const;

  const card = {
    background: C.bgDefault,
    border: `1px solid ${C.ui2}`,
    borderRadius: 8,
    padding: 14,
  } as const;

  const fieldLabel = {
    fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: 11,
    lineHeight: "14px",
    fontWeight: 500,
    color: C.textSecondary,
    marginBottom: 2,
  } as const;

  const fieldValue = {
    fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: 14,
    lineHeight: "20px",
    color: C.textPrimary,
  } as const;

  const segBtn = (active: boolean) => ({
    flex: 1,
    height: 36,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    background: active ? C.bgDefault : "transparent",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontFamily: "'Inter', system-ui, sans-serif",
    fontWeight: 600,
    fontSize: 13,
    color: active ? (isPublic ? C.brandPurple : C.textPrimary) : C.textSecondary,
    boxShadow: active ? "0 1px 2px rgba(0,0,0,0.06)" : undefined,
    transition: "all 0.15s",
  });

  const actionRow = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "12px 14px",
    background: C.bgDefault,
    border: `1px solid ${C.ui2}`,
    borderRadius: 8,
    cursor: "pointer",
  } as const;

  return (
    <div
      className="flex flex-col flex-1"
      style={{ background: C.bgMuted, overflowY: "auto", minHeight: 0 }}
    >
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
        {/* About card — Name + Description bundled with one Edit */}
        <div>
          <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
            <div style={sectionLabel}>About</div>
            <button
              aria-label="Edit details"
              onClick={onEdit}
              className="flex items-center"
              style={{
                gap: 4,
                padding: "4px 8px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: C.brandPurple,
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              <Pencil size={12} strokeWidth={2} /> Edit
            </button>
          </div>
          <div style={card}>
            <div style={fieldLabel}>Name</div>
            <div style={{ ...fieldValue, fontWeight: 600, marginBottom: 12 }}>{meta.name}</div>
            <div style={fieldLabel}>Description</div>
            <div style={{ ...fieldValue, color: meta.description ? C.textPrimary : C.textTertiary }}>
              {meta.description || "No description yet"}
            </div>
          </div>
        </div>

        {/* Visibility — segmented toggle (inline change) */}
        <div>
          <div style={sectionLabel}>Visibility</div>
          <div
            className="flex items-center"
            style={{ background: C.ui1, padding: 3, borderRadius: 8, gap: 2 }}
          >
            <button
              onClick={() => onVisibilityChange("Private")}
              style={segBtn(!isPublic)}
            >
              <Lock size={14} strokeWidth={2} /> Private
            </button>
            <button
              onClick={() => onVisibilityChange("Public")}
              style={segBtn(isPublic)}
            >
              <Globe size={14} strokeWidth={2} /> Public
            </button>
          </div>
          <div
            style={{
              marginTop: 8,
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 12,
              lineHeight: "16px",
              color: C.textSecondary,
            }}
          >
            {isPublic
              ? "Discoverable in the marketplace. Others can view, run, and follow it."
              : "Only you can see this screener."}
          </div>
        </div>

        {/* Community — only when Public */}
        {isPublic && (
          <div>
            <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
              <div style={sectionLabel}>Community</div>
              <span
                title="Stats update once a day. Followers get alerts when matches change."
                style={{ display: "inline-flex", color: C.textTertiary, cursor: "help" }}
              >
                <Info size={13} strokeWidth={2} />
              </span>
            </div>
            <div style={{ ...card, padding: 0 }}>
              <CommunityRow
                icon={<Users size={18} color={C.brandPurple} strokeWidth={2} />}
                value="1,284"
                sentence="people follow your screener"
                delta="+12 this week"
              />
              <div style={{ height: 1, background: C.ui2 }} />
              <CommunityRow
                icon={<Heart size={18} color={C.brandPurple} strokeWidth={2} />}
                value="342"
                sentence="users liked your screener"
              />
              <div style={{ height: 1, background: C.ui2 }} />
              <CommunityRow
                icon={<Eye size={18} color={C.brandPurple} strokeWidth={2} />}
                value="12.4K"
                sentence="views in the last 30 days"
              />
            </div>
          </div>
        )}

        {/* Activity — timestamps */}
        <div>
          <div style={sectionLabel}>Activity</div>
          <div style={{ ...card, padding: 0 }}>
            <ActivityRow label="Created" value={formatRelativeTime(meta.savedAt)} />
            <div style={{ height: 1, background: C.ui2 }} />
            <ActivityRow label="Last edited" value={formatRelativeTime(meta.savedAt)} />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={actionRow} onClick={() => {}}>
            <div className="flex items-center" style={{ gap: 10 }}>
              <Share2 size={16} color={C.textPrimary} strokeWidth={2} />
              <span style={{ ...fieldValue, fontWeight: 500 }}>Share screener</span>
            </div>
            <span style={{ fontSize: 12, color: C.textTertiary }}>Copy link</span>
          </div>
        </div>

        {/* Danger zone */}
        <div style={{ marginTop: 8 }}>
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center justify-center"
              style={{
                width: "100%",
                gap: 8,
                height: 44,
                background: C.bgDefault,
                border: `1px solid ${C.negText}`,
                borderRadius: 6,
                color: C.negText,
                cursor: "pointer",
                fontFamily: "'Inter', system-ui, sans-serif",
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              <Trash2 size={16} strokeWidth={2} /> Delete screener
            </button>
          ) : (
            <div
              style={{
                padding: 14,
                background: C.negBg,
                border: `1px solid ${C.negText}`,
                borderRadius: 8,
              }}
            >
              <div
                style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 13,
                  lineHeight: "18px",
                  color: C.textPrimary,
                  marginBottom: 10,
                }}
              >
                Delete "{meta.name}"? This can't be undone.
                {isPublic && " Followers will lose access."}
              </div>
              <div className="flex items-center" style={{ gap: 8 }}>
                <button
                  onClick={() => setConfirmDelete(false)}
                  style={{
                    flex: 1,
                    height: 36,
                    background: C.bgDefault,
                    border: `1px solid ${C.ui4}`,
                    borderRadius: 6,
                    color: C.textPrimary,
                    cursor: "pointer",
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontWeight: 600,
                    fontSize: 13,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={onDelete}
                  style={{
                    flex: 1,
                    height: 36,
                    background: C.negText,
                    border: "none",
                    borderRadius: 6,
                    color: "#FFFFFF",
                    cursor: "pointer",
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontWeight: 600,
                    fontSize: 13,
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ActivityRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex items-center justify-between"
      style={{ padding: "12px 14px" }}
    >
      <span
        style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 13,
          color: C.textSecondary,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 13,
          fontWeight: 500,
          color: C.textPrimary,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function CommunityRow({
  icon,
  value,
  sentence,
  delta,
}: {
  icon: React.ReactNode;
  value: string;
  sentence: string;
  delta?: string;
}) {
  return (
    <div
      className="flex items-center"
      style={{ padding: "14px", gap: 12 }}
    >
      <div
        className="flex items-center justify-center shrink-0"
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          background: C.bgPlusChipBg,
        }}
      >
        {icon}
      </div>
      <div className="flex flex-col" style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <div
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 14,
            lineHeight: "20px",
            color: C.textPrimary,
          }}
        >
          <span style={{ fontWeight: 700 }}>{value}</span>
          <span style={{ color: C.textSecondary }}> {sentence}</span>
        </div>
        {delta && (
          <span
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 11,
              lineHeight: "14px",
              fontWeight: 600,
              color: C.posText,
            }}
          >
            {delta}
          </span>
        )}
      </div>
    </div>
  );
}

export function _StatCard({
  icon,
  value,
  label,
  delta,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  delta?: string;
}) {
  return (
    <div
      className="flex flex-col items-start"
      style={{
        flex: 1,
        padding: "12px",
        gap: 4,
        background: C.bgPlusChipBg,
        border: `1px solid ${C.ui2}`,
        borderRadius: 8,
      }}
    >
      {icon}
      <span
        style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 16,
          lineHeight: "20px",
          fontWeight: 700,
          color: C.textPrimary,
          marginTop: 2,
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 11,
          lineHeight: "14px",
          color: C.textSecondary,
        }}
      >
        {label}
      </span>
      {delta && (
        <span
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 10,
            lineHeight: "12px",
            fontWeight: 600,
            color: C.posText,
            marginTop: 2,
          }}
        >
          {delta}
        </span>
      )}
    </div>
  );
}

function FilterRow({ label, value, onEdit }: { label: string; value: string; onEdit?: () => void }) {
  return (
    <div
      className="flex items-center w-full"
      style={{ padding: "10px 0", gap: 12, cursor: onEdit ? "pointer" : undefined }}
      onClick={onEdit}
    >
      <div className="flex flex-col flex-1 min-w-0" style={{ gap: 2 }}>
        <span
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontWeight: 500,
            fontSize: 14,
            lineHeight: "20px",
            color: C.textPrimary,
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 12,
            lineHeight: "16px",
            fontWeight: 400,
            color: C.textSecondary,
          }}
        >
          {value}
        </span>
      </div>
      <button
        aria-label={`Edit ${label}`}
        onClick={onEdit}
        className="flex items-center justify-center shrink-0"
        style={{ width: 32, height: 32, borderRadius: 6 }}
      >
        <Pencil size={18} color={C.textPrimary} strokeWidth={2} />
      </button>
    </div>
  );
}

const SAMPLE_SCRIPS: ListItem[] = [
  { symbol: "TATAMOTORS", exchange: "NSE", segment: "EQ", ltp: "978.20", change: "+18.45(1.92%)", dir: "pos",
    chgPct: "+1.92%", chgAbs: "+18.45", volume: "14.2M", open: "962.00", high: "981.40", low: "959.85",
    prevClose: "959.75", wk52High: "1,178.00", wk52Low: "610.20", mktCap: "3.24L Cr", pe: "12.8" },
  { symbol: "ADANIENT", exchange: "NSE", segment: "EQ", ltp: "2,441.10", change: "+62.30(2.62%)", dir: "pos",
    chgPct: "+2.62%", chgAbs: "+62.30", volume: "6.8M", open: "2,388.00", high: "2,452.00", low: "2,380.25",
    prevClose: "2,378.80", wk52High: "3,441.00", wk52Low: "1,782.45", mktCap: "2.78L Cr", pe: "68.2" },
  { symbol: "HINDALCO", exchange: "NSE", segment: "EQ", ltp: "672.55", change: "+11.05(1.67%)", dir: "pos",
    chgPct: "+1.67%", chgAbs: "+11.05", volume: "9.1M", open: "663.00", high: "675.90", low: "661.40",
    prevClose: "661.50", wk52High: "778.00", wk52Low: "452.30", mktCap: "1.51L Cr", pe: "14.6" },
  { symbol: "JSWSTEEL", exchange: "NSE", segment: "EQ", ltp: "924.80", change: "+14.20(1.56%)", dir: "pos",
    chgPct: "+1.56%", chgAbs: "+14.20", volume: "5.4M", open: "912.00", high: "928.00", low: "910.10",
    prevClose: "910.60", wk52High: "1,074.00", wk52Low: "711.25", mktCap: "2.26L Cr", pe: "22.1" },
  { symbol: "BAJFINANCE", exchange: "NSE", segment: "EQ", ltp: "7,215.00", change: "+85.00(1.19%)", dir: "pos",
    chgPct: "+1.19%", chgAbs: "+85.00", volume: "1.2M", open: "7,145.00", high: "7,232.00", low: "7,138.00",
    prevClose: "7,130.00", wk52High: "8,190.00", wk52Low: "6,188.00", mktCap: "4.48L Cr", pe: "30.9" },
  { symbol: "MARUTI", exchange: "NSE", segment: "EQ", ltp: "12,648.45", change: "+102.10(0.81%)", dir: "pos",
    chgPct: "+0.81%", chgAbs: "+102.10", volume: "0.4M", open: "12,556.00", high: "12,680.00", low: "12,548.00",
    prevClose: "12,546.35", wk52High: "13,680.00", wk52Low: "9,737.00", mktCap: "3.98L Cr", pe: "28.4" },
];

type ScripColumn = {
  key: string;
  label: string;
  accessor: (it: ListItem) => string | undefined;
  align?: "left" | "right";
  minWidth?: number;
  colored?: boolean; // tint with pos/neg color based on item.dir
};

const SCRIP_COLUMNS: ScripColumn[] = [
  { key: "ltp", label: "LTP", accessor: (it) => it.ltp, align: "right", minWidth: 88, colored: true },
  { key: "chgPct", label: "Chg %", accessor: (it) => it.chgPct, align: "right", minWidth: 72, colored: true },
  { key: "chgAbs", label: "Chg", accessor: (it) => it.chgAbs, align: "right", minWidth: 72, colored: true },
  { key: "volume", label: "Volume", accessor: (it) => it.volume, align: "right", minWidth: 84 },
  { key: "open", label: "Open", accessor: (it) => it.open, align: "right", minWidth: 88 },
  { key: "high", label: "High", accessor: (it) => it.high, align: "right", minWidth: 88 },
  { key: "low", label: "Low", accessor: (it) => it.low, align: "right", minWidth: 88 },
  { key: "prevClose", label: "Prev close", accessor: (it) => it.prevClose, align: "right", minWidth: 96 },
  { key: "wk52High", label: "52W High", accessor: (it) => it.wk52High, align: "right", minWidth: 96 },
  { key: "wk52Low", label: "52W Low", accessor: (it) => it.wk52Low, align: "right", minWidth: 96 },
  { key: "mktCap", label: "Mkt Cap", accessor: (it) => it.mktCap, align: "right", minWidth: 92 },
  { key: "pe", label: "P/E", accessor: (it) => it.pe, align: "right", minWidth: 64 },
];
const DEFAULT_SCRIP_COLUMNS = ["ltp", "chgPct", "volume"];

function ScripsTabBody() {
  const [selectedKeys, setSelectedKeys] = useState<string[]>(DEFAULT_SCRIP_COLUMNS);
  const [pickerOpen, setPickerOpen] = useState<boolean>(false);
  const selectedCols = selectedKeys
    .map((k) => SCRIP_COLUMNS.find((c) => c.key === k))
    .filter((c): c is ScripColumn => !!c);

  const SYMBOL_COL_W = 132;
  const headerStyle = {
    fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: 11,
    lineHeight: "14px",
    fontWeight: 600,
    color: C.textSecondary,
    textTransform: "uppercase" as const,
    letterSpacing: "0.04em",
  };
  const cellStyle = {
    fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: 13,
    lineHeight: "18px",
    color: C.textPrimary,
  };

  return (
    <div className="flex flex-col flex-1" style={{ background: C.bgDefault }}>
      {/* Columns toolbar */}
      <div
        className="flex items-center justify-end"
        style={{
          padding: "8px 16px",
          background: C.bgDefault,
          borderBottom: `1px solid ${C.ui2}`,
        }}
      >
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="flex items-center"
          style={{
            gap: 6,
            height: 28,
            padding: "0 10px",
            border: `1px solid ${C.ui3}`,
            borderRadius: 6,
            background: "#FFFFFF",
            color: C.textPrimary,
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <Plus size={12} color={C.textPrimary} strokeWidth={2} />
          Columns · {selectedCols.length}
        </button>
      </div>

      {/* Scrollable table */}
      <div style={{ overflowX: "auto" }}>
        <div style={{ minWidth: "100%", display: "inline-block" }}>
          {/* Header row */}
          <div className="flex items-center" style={{ borderBottom: `1px solid ${C.ui2}`, background: C.bgMuted }}>
            <div
              style={{
                ...headerStyle,
                width: SYMBOL_COL_W,
                flexShrink: 0,
                padding: "10px 16px",
                position: "sticky",
                left: 0,
                background: C.bgMuted,
                zIndex: 1,
              }}
            >
              Symbol
            </div>
            {selectedCols.map((col) => (
              <div
                key={col.key}
                style={{
                  ...headerStyle,
                  minWidth: col.minWidth ?? 88,
                  padding: "10px 12px",
                  textAlign: col.align ?? "right",
                  flexShrink: 0,
                }}
              >
                {col.label}
              </div>
            ))}
          </div>

          {/* Body rows */}
          {SAMPLE_SCRIPS.map((item, idx) => (
            <div
              key={item.symbol}
              className="flex items-center"
              style={{
                borderBottom: idx < SAMPLE_SCRIPS.length - 1 ? `1px solid ${C.ui2}` : "none",
                background: C.bgDefault,
              }}
            >
              {/* Symbol cell (frozen) */}
              <div
                className="flex flex-col"
                style={{
                  width: SYMBOL_COL_W,
                  flexShrink: 0,
                  padding: "10px 16px",
                  position: "sticky",
                  left: 0,
                  background: C.bgDefault,
                  zIndex: 1,
                  borderRight: `1px solid ${C.ui2}`,
                  gap: 2,
                }}
              >
                <span style={{ ...cellStyle, fontWeight: 600 }}>{item.symbol}</span>
                <span style={{ fontSize: 10, color: C.textTertiary }}>
                  {item.exchange}{item.segment ? ` · ${item.segment}` : ""}
                </span>
              </div>
              {/* Metric cells */}
              {selectedCols.map((col) => {
                const v = col.accessor(item);
                const color = col.colored ? (item.dir === "pos" ? C.posText : C.negText) : C.textPrimary;
                return (
                  <div
                    key={col.key}
                    style={{
                      minWidth: col.minWidth ?? 88,
                      padding: "10px 12px",
                      textAlign: col.align ?? "right",
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ ...cellStyle, color, fontWeight: col.colored ? 600 : 500 }}>
                      {v ?? "—"}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {pickerOpen && (
        <ColumnPickerSheet
          value={selectedKeys}
          onClose={() => setPickerOpen(false)}
          onApply={(v) => { setSelectedKeys(v); setPickerOpen(false); }}
        />
      )}
    </div>
  );
}

function ColumnPickerSheet({
  value, onClose, onApply,
}: {
  value: string[];
  onClose: () => void;
  onApply: (v: string[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>(value);
  const toggle = (k: string) => {
    setSelected((prev) => prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]);
  };
  const move = (from: number, to: number) => {
    if (to < 0 || to >= selected.length) return;
    const next = selected.slice();
    const [x] = next.splice(from, 1);
    next.splice(to, 0, x);
    setSelected(next);
  };
  return (
    <BottomSheetShell
      title="Columns"
      onClose={onClose}
      actionLabel={`Apply (${selected.length})`}
      onAction={() => onApply(selected)}
    >
      <div style={{ padding: "0 16px 20px" }}>
        <div
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 12,
            lineHeight: "16px",
            color: C.textSecondary,
            marginBottom: 8,
          }}
        >
          Symbol is always shown. Pick the metrics you want to track.
        </div>
        {SCRIP_COLUMNS.map((col) => {
          const active = selected.includes(col.key);
          const order = active ? selected.indexOf(col.key) : -1;
          return (
            <div
              key={col.key}
              className="flex items-center w-full"
              style={{
                height: 44, padding: "0 4px", gap: 12,
                borderBottom: `1px solid ${C.ui2}`,
              }}
            >
              <button
                type="button"
                onClick={() => toggle(col.key)}
                className="flex items-center"
                style={{
                  flex: 1, gap: 10, background: "transparent", border: "none",
                  cursor: "pointer", textAlign: "left", padding: 0,
                }}
              >
                <span
                  className="flex items-center justify-center shrink-0"
                  style={{
                    width: 20, height: 20, borderRadius: 4,
                    border: `2px solid ${active ? C.brandPurple : C.ui4}`,
                    background: active ? C.brandPurple : "#FFFFFF",
                    color: "#FFFFFF",
                    fontSize: 12, fontWeight: 700, lineHeight: "16px",
                  }}
                >
                  {active ? "✓" : ""}
                </span>
                <span style={{ fontSize: 14, color: C.textPrimary, fontWeight: active ? 600 : 400 }}>
                  {col.label}
                </span>
              </button>
              {active && (
                <div className="flex items-center" style={{ gap: 4 }}>
                  <button
                    type="button"
                    onClick={() => move(order, order - 1)}
                    aria-label="Move up"
                    disabled={order === 0}
                    style={{
                      width: 28, height: 28, borderRadius: 4, border: `1px solid ${C.ui3}`,
                      background: "#FFFFFF", cursor: order === 0 ? "not-allowed" : "pointer",
                      opacity: order === 0 ? 0.4 : 1, fontSize: 12, color: C.textPrimary,
                    }}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(order, order + 1)}
                    aria-label="Move down"
                    disabled={order === selected.length - 1}
                    style={{
                      width: 28, height: 28, borderRadius: 4, border: `1px solid ${C.ui3}`,
                      background: "#FFFFFF",
                      cursor: order === selected.length - 1 ? "not-allowed" : "pointer",
                      opacity: order === selected.length - 1 ? 0.4 : 1,
                      fontSize: 12, color: C.textPrimary,
                    }}
                  >
                    ↓
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </BottomSheetShell>
  );
}

export function _Section({
  label,
  trailing,
  children,
}: {
  label: string;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col" style={{ gap: 8 }}>
      <div className="flex items-center justify-between">
        <span
          style={{
            fontFamily: "'Messina Sans', 'Inter', sans-serif",
            fontWeight: 700,
            fontSize: 12,
            lineHeight: "16px",
            color: C.textSecondary,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
        {trailing}
      </div>
      {children}
    </section>
  );
}

export function _AddRuleButton() {
  return (
    <button
      className="flex items-center"
      style={{
        gap: 4,
        fontSize: 12,
        fontWeight: 600,
        color: C.brandPurple,
      }}
    >
      <Plus size={14} color={C.brandPurple} />
      Add rule
    </button>
  );
}

export function _UniverseChip({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <button
      className="flex items-center justify-center"
      style={{
        height: 32,
        padding: "0 12px",
        borderRadius: 16,
        background: active ? C.bgPlusChipBg : C.bgDefault,
        border: `1px solid ${active ? C.brandPurple : C.ui3}`,
        fontSize: 12,
        fontWeight: 600,
        color: active ? C.brandPurple : C.textPrimary,
      }}
    >
      {label}
    </button>
  );
}

export function _RuleCard({
  index,
  indicator,
  operator,
  value,
}: {
  index: number;
  indicator: string;
  operator: string;
  value: string;
}) {
  return (
    <div
      className="flex items-center"
      style={{
        padding: 12,
        gap: 10,
        borderRadius: 10,
        background: C.bgDefault,
        border: `1px solid ${C.ui3}`,
      }}
    >
      <div
        className="flex items-center justify-center shrink-0"
        style={{
          width: 22,
          height: 22,
          borderRadius: 11,
          background: C.bgPlusChipBg,
          fontSize: 11,
          fontWeight: 700,
          color: C.brandPurple,
        }}
      >
        {index}
      </div>
      <div className="flex flex-col flex-1 min-w-0" style={{ gap: 2 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>
          {indicator}
        </span>
        <span style={{ fontSize: 12, color: C.textSecondary }}>
          <span style={{ color: C.brandPurple, fontWeight: 600 }}>{operator}</span>{" "}
          {value}
        </span>
      </div>
      <button
        aria-label="Remove rule"
        className="flex items-center justify-center shrink-0"
        style={{ width: 28, height: 28, borderRadius: 6 }}
      >
        <Trash2 size={14} color={C.textTertiary} />
      </button>
    </div>
  );
}

export function _LogicOperator() {
  return (
    <div className="flex items-center" style={{ gap: 8, padding: "0 4px" }}>
      <div style={{ flex: 1, height: 1, background: C.ui3 }} />
      <div
        className="flex items-center"
        style={{
          height: 22,
          padding: "0 10px",
          borderRadius: 11,
          background: C.bgDefault,
          border: `1px solid ${C.ui3}`,
          fontSize: 11,
          fontWeight: 700,
          color: C.textSecondary,
          letterSpacing: "0.04em",
        }}
      >
        AND
      </div>
      <div style={{ flex: 1, height: 1, background: C.ui3 }} />
    </div>
  );
}

function ScreenersEmptyState({ onCreate, onDiscover }: { onCreate: () => void; onDiscover?: () => void }) {
  return (
    <div
      className="flex flex-col"
      style={{ minHeight: 560, background: C.bgDefault, padding: "32px 16px", gap: 12 }}
    >
      <div className="flex flex-col" style={{ gap: 4, marginBottom: 8 }}>
        <span
          style={{
            fontFamily: "'Messina Sans', 'Inter', sans-serif",
            fontWeight: 700,
            fontSize: 18,
            lineHeight: "24px",
            color: C.textPrimary,
          }}
        >
          Find your next trade
        </span>
        <span
          style={{
            fontSize: 13,
            lineHeight: "18px",
            fontWeight: 400,
            color: C.textSecondary,
          }}
        >
          Use curated scanners or build your own from scratch.
        </span>
      </div>
      <ScreenerOptionCard
        icon={<Compass size={20} color={C.brandPurple} />}
        title="Discover Ready-Made Scanners"
        subtitle="Browse 100+ expert-built scanners across trading styles."
        onClick={onDiscover}
      />
      <ScreenerOptionCard
        icon={<Wand2 size={20} color={C.brandPurple} />}
        title="Create Custom Scanner"
        subtitle="Build your own rules with 100+ indicators and filters."
        onClick={onCreate}
      />
    </div>
  );
}

function ScreenerOptionCard({
  icon,
  title,
  subtitle,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center w-full text-left"
      style={{
        padding: 16,
        gap: 12,
        background: C.bgDefault,
        border: `1px solid ${C.ui3}`,
        borderRadius: 12,
      }}
    >
      <div
        className="flex items-center justify-center shrink-0"
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: C.bgPlusChipBg,
        }}
      >
        {icon}
      </div>
      <div className="flex flex-col flex-1 min-w-0" style={{ gap: 2 }}>
        <span
          style={{
            fontFamily: "'Messina Sans', 'Inter', sans-serif",
            fontWeight: 700,
            fontSize: 14,
            lineHeight: "20px",
            color: C.textPrimary,
          }}
        >
          {title}
        </span>
        <span
          style={{
            fontSize: 12,
            lineHeight: "16px",
            fontWeight: 400,
            color: C.textSecondary,
          }}
        >
          {subtitle}
        </span>
      </div>
      <ChevronRight size={18} color={C.textTertiary} />
    </button>
  );
}

// ───── Top gradient container: status bar + quick-action index tiles ─────
function TopGradientContainer() {
  return (
    <div
      className="flex flex-col"
      style={{
        background: `linear-gradient(180deg, ${C.bgDefault} 0%, ${C.bgPurpleGradientEnd} 100%)`,
      }}
    >
      <StatusBar />
      <QuickActionBar />
    </div>
  );
}

function StatusBar() {
  return (
    <div className="flex items-center justify-between" style={{ height: 48, padding: "12px 16px" }}>
      <span
        style={{
          fontSize: 12,
          lineHeight: "16px",
          fontWeight: 400,
          color: C.textPrimary,
          fontFeatureSettings: "'case' on, 'ordn' on, 'ss07' on",
        }}
      >
        12:34
      </span>
      <div className="flex items-center" style={{ gap: 4 }}>
        <Wifi size={16} color={C.textPrimary} strokeWidth={2} />
        <Signal size={16} color={C.textPrimary} strokeWidth={2} />
        <BatteryFull size={16} color={C.textPrimary} strokeWidth={2} />
      </div>
    </div>
  );
}

function QuickActionBar() {
  // Scrolls horizontally — the spec lists 4 index tiles + settings button.
  return (
    <div
      className="flex items-center overflow-x-auto scrollbar-none"
      style={{ height: 36, padding: "4px 16px 8px", gap: 12 }}
    >
      <IndexTile label="NIFTY50" ltp="24,891.41" delta="+9.41%" deltaColor="pos" />
      <VerticalDivider />
      <IndexTile label="NIFTYBANK" ltp="43,141.41" delta="-1.21%" deltaColor="neg" />
      <VerticalDivider />
      <IndexTile label="SENSEX" ltp="81,204.10" delta="-0.42%" deltaColor="neg" />
      <VerticalDivider />
      <IndexTile label="Add more" ltp="indices" link />
      <VerticalDivider />
      <button
        aria-label="Watchlist settings"
        className="flex items-center justify-center shrink-0"
        style={{ width: 16, height: 16, borderRadius: 6 }}
      >
        <Settings size={16} color={C.textPrimary} />
      </button>
    </div>
  );
}

function IndexTile({
  label,
  ltp,
  delta,
  deltaColor,
  link = false,
}: {
  label: string;
  ltp: string;
  delta?: string;
  deltaColor?: "pos" | "neg";
  link?: boolean;
}) {
  return (
    <div className="flex items-center shrink-0" style={{ gap: 8, height: 24, padding: "4px 0" }}>
      <span
        style={{
          fontSize: 12,
          lineHeight: "16px",
          fontWeight: 600,
          color: C.textPrimary,
        }}
      >
        {label}
      </span>
      <div className="flex items-center" style={{ gap: 4 }}>
        <span
          style={{
            fontSize: 12,
            lineHeight: "16px",
            fontWeight: 500,
            color: link ? C.brandPurple : C.textPrimary,
            fontFeatureSettings: "'tnum' on, 'lnum' on",
            textDecoration: link ? "underline" : "none",
          }}
        >
          {ltp}
        </span>
        {delta && deltaColor && (
          <span
            className="flex items-center"
            style={{
              height: 16,
              padding: "0 4px",
              borderRadius: 4,
              fontSize: 10,
              lineHeight: "16px",
              fontWeight: 500,
              background: deltaColor === "pos" ? C.posBg : C.negBg,
              color: deltaColor === "pos" ? C.posText : C.negText,
            }}
          >
            {delta}
          </span>
        )}
      </div>
    </div>
  );
}

function VerticalDivider() {
  return (
    <span
      className="shrink-0"
      style={{ width: 1, height: 16, background: C.ui5 }}
      aria-hidden
    />
  );
}

// ───── Topbar: logo + search + icons ─────
function Topbar() {
  return (
    <div
      className="flex items-center"
      style={{
        height: 56,
        padding: 16,
        gap: 8,
        background: C.bgDefault,
        borderRadius: "12px 12px 0 0",
      }}
    >
      {/* Upstox logo badge */}
      <div className="relative shrink-0" style={{ width: 32, height: 32 }}>
        <div
          className="flex items-center justify-center"
          style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            background: C.brandPurpleLogo,
            color: "#FFFFFF",
            fontFamily: "'Messina Sans', 'Inter', sans-serif",
            fontWeight: 700,
            fontSize: 14,
            letterSpacing: "-0.02em",
          }}
        >
          up
        </div>
        <div
          className="absolute flex items-center justify-center"
          style={{
            width: 12,
            height: 12,
            right: -4,
            bottom: -4,
            background: C.plusPurpleChip,
            border: `1px solid ${C.bgDefault}`,
            borderRadius: 9999,
          }}
        >
          <ChevronDown size={10} color={C.textPrimary} strokeWidth={2.5} />
        </div>
      </div>

      {/* Search field */}
      <div
        className="flex items-center flex-1"
        style={{
          height: 32,
          padding: "6px 10px 6px 6px",
          gap: 4,
          background: C.bgMuted,
          borderRadius: 6,
        }}
      >
        <Search size={20} color={C.textPrimary} strokeWidth={2} />
        <span
          className="flex-1"
          style={{
            fontSize: 14,
            lineHeight: "20px",
            fontWeight: 400,
            color: C.textPrimary,
          }}
        >
          Search & add stocks
        </span>
      </div>

      {/* Icon actions */}
      <IconButton icon={<Bell size={20} color={C.textPrimary} strokeWidth={2} />} />
      <IconButton icon={<Wallet size={20} color={C.textPrimary} strokeWidth={2} />} />
    </div>
  );
}

function IconButton({ icon }: { icon: React.ReactNode }) {
  return (
    <button
      className="flex items-center justify-center shrink-0"
      style={{
        width: 32,
        height: 32,
        padding: 4,
        background: C.bgDefault,
        border: `1px solid ${C.ui2}`,
        borderRadius: 6,
      }}
    >
      {icon}
    </button>
  );
}

// ───── Plus banner ─────
export function _PlusBanner() {
  return (
    <div
      className="flex items-center justify-between"
      style={{
        height: 32,
        padding: "8px 16px",
        gap: 8,
        background: `radial-gradient(43% 159% at 49.85% 50.91%, rgba(0,0,0,0.8) 16%, rgba(83,37,130,0.8) 82%, rgba(130,94,217,0.8) 100%), ${C.bgPlusBannerStart}`,
      }}
    >
      <div className="flex items-center mx-auto" style={{ gap: 8 }}>
        <span
          style={{
            fontFamily: "'Messina Sans', 'Inter', sans-serif",
            fontWeight: 700,
            fontSize: 12,
            lineHeight: "16px",
            color: "#FFFFFF",
          }}
        >
          Track{" "}
          <span style={{ textDecoration: "line-through", color: "rgba(255,255,255,0.55)" }}>
            100
          </span>{" "}
          200 scrips with
        </span>
        <PlusWordmark />
      </div>
      <ChevronRight size={16} color="#FFFFFF" strokeWidth={2.5} />
      <button aria-label="Dismiss" className="flex items-center justify-center">
        <X size={16} color="#6A6A6A" strokeWidth={2} />
      </button>
    </div>
  );
}

function PlusWordmark() {
  return (
    <span
      className="flex items-center justify-center"
      style={{
        width: 29,
        height: 16,
        background: "#FFFFFF",
        borderRadius: 2,
        fontFamily: "'Messina Sans', 'Inter', sans-serif",
        fontWeight: 700,
        fontSize: 10,
        lineHeight: "10px",
        color: C.brandPurpleLogo,
        letterSpacing: "0.02em",
      }}
    >
      Plus
    </span>
  );
}

// ───── Tabs (Watchlist / Options / Screeners) ─────
function Tabs({
  activeTab,
  onChange,
}: {
  activeTab: TabKey;
  onChange: (tab: TabKey) => void;
}) {
  const tabs: TabKey[] = ["Watchlist", "Options", "Screeners"];
  return (
    <div className="relative" style={{ height: 44 }}>
      <div
        className="absolute"
        style={{ left: 0, right: 0, bottom: 0, height: 1, background: C.ui2 }}
        aria-hidden
      />
      <div className="flex items-center h-full" style={{ padding: "0 16px", gap: 24 }}>
        {tabs.map((label) => (
          <TabItem
            key={label}
            label={label}
            active={activeTab === label}
            onClick={() => onChange(label)}
          />
        ))}
      </div>
    </div>
  );
}

function TabItem({
  label,
  active = false,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center justify-center bg-transparent"
      style={{
        height: 44,
        padding: "12px 0",
        borderBottom: active ? `2px solid ${C.textPrimary}` : "2px solid transparent",
        cursor: "pointer",
      }}
    >
      <span
        style={{
          fontSize: 14,
          lineHeight: "20px",
          fontWeight: 600,
          color: active ? C.textPrimary : C.textTertiary,
          textAlign: "center",
        }}
      >
        {label}
      </span>
    </button>
  );
}

// ───── Filter chip row (Trending / Nifty50) ─────
function ChipFilterRow() {
  return (
    <div className="flex items-center" style={{ height: 48, padding: "12px 16px 8px", gap: 8 }}>
      <Chip label="Trending" active />
      <Chip label="Nifty50" />
    </div>
  );
}

function Chip({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <button
      className="flex items-center justify-center"
      style={{
        height: 28,
        padding: "6px 12px",
        background: active ? C.bgPlusChipBg : C.bgDefault,
        border: `1px solid ${active ? C.brandPurple : C.ui3}`,
        borderRadius: 6,
        fontSize: 12,
        lineHeight: "16px",
        fontWeight: 600,
        color: active ? C.brandPurple : C.textPrimary,
      }}
    >
      {label}
    </button>
  );
}

// ───── Watchlist list rows ─────
type ListItem = {
  symbol: string;
  exchange: string;
  segment?: string;
  ltp: string;
  change: string;
  dir: "pos" | "neg";
  // Optional metrics for screener scrip table
  chgPct?: string;     // e.g. "+1.92%"
  chgAbs?: string;     // e.g. "+18.45"
  volume?: string;     // e.g. "12.4M"
  open?: string;
  high?: string;
  low?: string;
  prevClose?: string;
  wk52High?: string;
  wk52Low?: string;
  mktCap?: string;     // e.g. "3.24L Cr"
  pe?: string;         // e.g. "28.4"
};

const GROUP_ONE: ListItem[] = [
  { symbol: "INFOSYS", exchange: "BSE", ltp: "349.50", change: "-132.00(27.71%)", dir: "neg" },
  {
    symbol: "ICICIBANK",
    exchange: "NSE",
    segment: "EQ",
    ltp: "400.90",
    change: "+41.15(27.71%)",
    dir: "pos",
  },
  { symbol: "BHARTIARTL", exchange: "BSE", ltp: "275.45", change: "-132.00(27.71%)", dir: "neg" },
  { symbol: "SBI", exchange: "BSE", ltp: "31.20", change: "+41.15(27.71%)", dir: "pos" },
];

const GROUP_TWO: ListItem[] = [
  { symbol: "RELIANCE", exchange: "BSE", ltp: "4.20", change: "-132.00(27.71%)", dir: "neg" },
  { symbol: "TCS", exchange: "NSE", segment: "EQ", ltp: "10.97", change: "+41.15(27.71%)", dir: "pos" },
  { symbol: "HDFCBANK", exchange: "BSE", ltp: "324.80", change: "-132.00(27.71%)", dir: "neg" },
];

function WatchlistGroupOne() {
  return <ListGroup items={GROUP_ONE} />;
}

function WatchlistGroupTwo() {
  return <ListGroup items={GROUP_TWO} />;
}

function ListGroup({ items }: { items: ListItem[] }) {
  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{ padding: "0 16px", background: C.bgDefault }}
    >
      {items.map((item, idx) => (
        <div key={item.symbol} className="flex flex-col w-full">
          <ListRow item={item} />
          {idx < items.length - 1 && <HorizontalDivider />}
        </div>
      ))}
    </div>
  );
}

function ListRow({ item }: { item: ListItem }) {
  const ltpColor = item.dir === "pos" ? C.posText : C.negText;
  return (
    <div className="flex items-center w-full" style={{ height: 52, padding: "8px 0", gap: 2 }}>
      {/* left: symbol + exchange */}
      <div className="flex-1 flex flex-col justify-center" style={{ height: 36 }}>
        <span
          style={{
            fontSize: 14,
            lineHeight: "20px",
            fontWeight: 500,
            color: C.textPrimary,
          }}
        >
          {item.symbol}
        </span>
        <span
          style={{
            fontSize: 12,
            lineHeight: "16px",
            fontWeight: 400,
            color: C.textTertiary,
          }}
        >
          {item.exchange}
          {item.segment && (
            <>
              {" "}
              <span style={{ color: C.ui5 }}>•</span> {item.segment}
            </>
          )}
        </span>
      </div>

      {/* right: LTP + change */}
      <div className="flex flex-col items-end justify-center" style={{ height: 36, width: 100 }}>
        <span
          style={{
            fontSize: 14,
            lineHeight: "20px",
            fontWeight: 500,
            color: ltpColor,
            textAlign: "right",
            fontFeatureSettings: "'tnum' on, 'lnum' on",
          }}
        >
          {item.ltp}
        </span>
        <span
          style={{
            fontSize: 12,
            lineHeight: "16px",
            fontWeight: 400,
            color: C.textTertiary,
            textAlign: "right",
            fontFeatureSettings: "'tnum' on, 'lnum' on",
          }}
        >
          {item.change}
        </span>
      </div>
    </div>
  );
}

function HorizontalDivider() {
  return <div style={{ width: "100%", height: 1, background: C.ui2 }} aria-hidden />;
}

// ───── F&O activation card ─────
function ActivationCard() {
  return (
    <div style={{ padding: 16, background: C.bgDefault }}>
      <div
        className="flex items-center justify-between"
        style={{
          width: "100%",
          padding: "0 0 0 16px",
          background: C.bgTan,
          border: `1px solid ${C.ui3}`,
          borderRadius: 8,
          minHeight: 104,
        }}
      >
        <div className="flex flex-col justify-between" style={{ gap: 8, padding: "16px 0" }}>
          <div className="flex">
            <span
              style={{
                fontFamily: "'Messina Sans', 'Inter', sans-serif",
                fontWeight: 400,
                fontSize: 14,
                lineHeight: "20px",
                color: C.textPrimary,
                maxWidth: 200,
              }}
            >
              Unlock more trading opportunities
            </span>
          </div>
          <div className="flex items-center" style={{ gap: 4 }}>
            <span
              style={{
                fontFamily: "'Messina Sans', 'Inter', sans-serif",
                fontWeight: 700,
                fontSize: 12,
                lineHeight: "24px",
                color: C.brandPurpleLogo,
              }}
            >
              Activate F&amp;O segment now
            </span>
            <ChevronRight size={14} color={C.brandPurpleLogo} strokeWidth={3} />
          </div>
        </div>
        <div
          className="flex items-center justify-center shrink-0"
          style={{ width: 120, height: 104 }}
          aria-hidden
        >
          <PurpleTreasureChestIllustration />
        </div>
      </div>
    </div>
  );
}

// Simplified "treasure chest" illustration that echoes the purple/bolt glyph
function PurpleTreasureChestIllustration() {
  return (
    <svg width={108} height={96} viewBox="0 0 108 96" fill="none" aria-hidden>
      <defs>
        <linearGradient id="chestGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#A64DFF" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#A64DFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* glow */}
      <ellipse cx="54" cy="30" rx="44" ry="24" fill="url(#chestGrad)" />
      {/* chest body */}
      <rect x="22" y="44" width="64" height="36" rx="4" fill="#5A298B" />
      <rect x="22" y="44" width="64" height="8" fill="#280B45" />
      <rect x="50" y="44" width="8" height="36" fill="#7A26CE" opacity="0.5" />
      {/* chest lid */}
      <path
        d="M26 44 L82 44 L86 34 Q86 26 78 26 L30 26 Q22 26 22 34 Z"
        fill="#7A26CE"
      />
      {/* keyhole */}
      <circle cx="54" cy="40" r="3" fill="#280B45" />
      {/* bolt / sparkle */}
      <path
        d="M54 10 L58 22 L70 22 L60 30 L64 42 L54 34 L44 42 L48 30 L38 22 L50 22 Z"
        fill="#BA75FF"
      />
      {/* small stars */}
      <circle cx="16" cy="20" r="1.5" fill="#AF91D1" />
      <circle cx="92" cy="16" r="1.5" fill="#AF91D1" />
      <circle cx="100" cy="44" r="1.2" fill="#AF91D1" />
    </svg>
  );
}

// ───── Newsfeed ─────
function Newsfeed() {
  const items = [
    {
      headline:
        "Infosys Q4 revenue guidance disappoints street; stock slips 3% intraday on margin concerns",
      attribution: "Moneycontrol",
      time: "2h ago",
      scrip: "#INFOSYS",
    },
    {
      headline:
        "ICICI Bank posts 18% YoY rise in net profit; asset quality stays strong in Q4 results",
      attribution: "ET Markets",
      time: "4h ago",
      scrip: "#ICICIBANK",
    },
    {
      headline:
        "Bharti Airtel unveils next-gen 5G plans; analysts mixed on subscriber economics for FY27",
      attribution: "Reuters",
      time: "5h ago",
      scrip: "#BHARTIARTL",
    },
    {
      headline:
        "RBI keeps repo rate unchanged at 5.25%; flags risks from global rate volatility",
      attribution: "CNBC-TV18",
      time: "7h ago",
      scrip: "#SBI",
    },
  ];
  return (
    <section
      style={{ background: C.bgDefault, borderBottom: `1px solid ${C.ui3}` }}
    >
      {/* Title */}
      <div className="flex items-center" style={{ height: 40, background: C.bgDefault }}>
        <div className="flex-1 flex items-center" style={{ padding: "8px 0 8px 16px", gap: 12 }}>
          <span
            className="flex items-center"
            style={{
              gap: 4,
              fontFamily: "'Messina Sans', 'Inter', sans-serif",
              fontWeight: 700,
              fontSize: 12,
              lineHeight: "16px",
              color: C.textGold,
              letterSpacing: "0.08em",
            }}
          >
            <Sparkles size={12} color={C.textGold} /> TOP STORIES
          </span>
        </div>
        <div className="flex items-center justify-end" style={{ padding: "4px 16px 4px 0" }}>
          <ChevronDown size={20} color={C.textSecondary} />
        </div>
      </div>

      {/* News items */}
      <ul className="flex flex-col">
        {items.map((item, idx) => (
          <li key={idx}>
            <div
              className="flex flex-col"
              style={{ padding: "12px 16px", gap: 8, background: C.bgDefault }}
            >
              <p
                style={{
                  fontFamily: "'Messina Sans', 'Inter', sans-serif",
                  fontWeight: 400,
                  fontSize: 14,
                  lineHeight: "24px",
                  color: C.textPrimary,
                  margin: 0,
                }}
              >
                {item.headline}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center" style={{ gap: 4 }}>
                  <span style={metaStyle}>{item.attribution}</span>
                  <span style={metaStyle}>•</span>
                  <span style={metaStyle}>{item.time}</span>
                </div>
                <span
                  style={{
                    fontFamily: "'Messina Sans', 'Inter', sans-serif",
                    fontWeight: 400,
                    fontSize: 10,
                    lineHeight: "16px",
                    color: C.textAlt,
                  }}
                >
                  {item.scrip}
                </span>
              </div>
            </div>
            {idx < items.length - 1 && (
              <div style={{ padding: "0 16px" }}>
                <HorizontalDivider />
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

const metaStyle: React.CSSProperties = {
  fontFamily: "'Messina Sans', 'Inter', sans-serif",
  fontWeight: 400,
  fontSize: 12,
  lineHeight: "16px",
  color: C.textSecondary,
};

function LoadMoreButton() {
  return (
    <div style={{ padding: 16, background: C.bgDefault }}>
      <button
        className="w-full flex items-center justify-center"
        style={{
          height: 48,
          background: C.bgDefault,
          border: `1px solid ${C.ui4}`,
          borderRadius: 24,
          fontFamily: "'Messina Sans', 'Inter', sans-serif",
          fontWeight: 700,
          fontSize: 16,
          lineHeight: "24px",
          color: C.textPrimary,
        }}
      >
        Show more stories
      </button>
    </div>
  );
}

// ───── Floating FAB bar (Sort / Add list / More) ─────
function BottomFABs() {
  return (
    <div
      className="flex items-center justify-center"
      style={{ padding: 16, gap: 12, background: C.bgDefault }}
    >
      <FABIcon ariaLabel="Sort">
        <ArrowUpDown size={20} color={C.brandPurple} />
      </FABIcon>
      <FABPill>
        <Plus size={20} color={C.brandPurple} />
        <span
          style={{
            fontSize: 14,
            lineHeight: "20px",
            fontWeight: 500,
            color: C.brandPurple,
          }}
        >
          Add list
        </span>
      </FABPill>
      <FABIcon ariaLabel="More options">
        <MoreVertical size={20} color={C.brandPurple} />
      </FABIcon>
    </div>
  );
}

function FABIcon({ children, ariaLabel }: { children: React.ReactNode; ariaLabel: string }) {
  return (
    <button
      aria-label={ariaLabel}
      className="flex items-center justify-center shrink-0"
      style={{
        width: 36,
        height: 36,
        background: C.bgDefault,
        border: `1px solid ${C.ui3}`,
        borderRadius: 12,
        boxShadow: "0 2px 4px rgba(12,12,12,0.16)",
      }}
    >
      {children}
    </button>
  );
}

function FABPill({ children }: { children: React.ReactNode }) {
  return (
    <button
      className="flex items-center justify-center shrink-0"
      style={{
        height: 36,
        padding: "8px 12px 8px 8px",
        gap: 4,
        background: C.bgDefault,
        border: `1px solid ${C.ui3}`,
        borderRadius: 12,
        boxShadow: "0 2px 4px rgba(12,12,12,0.16)",
      }}
    >
      {children}
    </button>
  );
}

// ───── Bottom navigation ─────
function BottomNav() {
  return (
    <nav
      className="flex flex-col"
      style={{ width: "100%", background: C.bgDefault }}
    >
      <div style={{ height: 1, background: C.ui2 }} aria-hidden />
      <div className="flex items-center" style={{ height: 56 }}>
        <NavTab icon={<Home size={20} color={C.iconMuted} />} label="Home" />
        <NavTab
          icon={<ListChecks size={20} color={C.textPrimary} />}
          label="My Lists"
          active
        />
        <NavTab icon={<ShoppingCart size={20} color={C.iconMuted} />} label="Orders" />
        <NavTab icon={<ArrowLeftRight size={20} color={C.iconMuted} />} label="Positions" />
        <NavTab icon={<Briefcase size={20} color={C.iconMuted} />} label="Holdings" />
      </div>
    </nav>
  );
}

function NavTab({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      className="flex flex-col items-center justify-center"
      style={{ flex: 1, height: 56, padding: "8px 0", gap: 4 }}
    >
      {icon}
      <span
        style={{
          fontSize: 12,
          lineHeight: "16px",
          fontWeight: active ? 600 : 400,
          color: active ? C.textPrimary : C.textTertiary,
          textAlign: "center",
        }}
      >
        {label}
      </span>
    </button>
  );
}

// ───────────────────────────────────────────────
// Discover Screeners — L2 Preset Screeners Listing
// ───────────────────────────────────────────────
type PresetCard = {
  title: string;
  subtitle: string;
  logos: string[]; // initials
  views: string;
  plus?: boolean;
  tag?: string;
};

export const _STOCK_PRESETS: PresetCard[] = [
  { title: "52-week breakouts", subtitle: "Stocks crossing their 1-year high today.", logos: ["H", "F", "I"], views: "12.4k views" },
  { title: "Volume shockers", subtitle: "Today's volume is 3× the 20-day average.", logos: ["T", "R", "S"], views: "9.8k views" },
  { title: "Bullish RSI reversal", subtitle: "RSI crossed above 30 in the last 3 days.", logos: ["B", "K", "L"], views: "7.1k views" },
];

type StockMetric = {
  label: string;
  ltp: string;
  ltpPos: boolean;
  tag: string;
  segment: string;
  subHeading: string;
  slots: { over: string; label: string }[];
};

const STOCK_METRIC_CARDS: StockMetric[] = [
  {
    label: "RELIANCE",
    ltp: "+2.34%",
    ltpPos: true,
    tag: "Bullish",
    segment: "EQ · NSE",
    subHeading: "₹2,945.20",
    slots: [
      { over: "Open", label: "₹2,910" },
      { over: "High", label: "₹2,962" },
      { over: "Vol", label: "12.4M" },
    ],
  },
  {
    label: "HDFCBANK",
    ltp: "+1.18%",
    ltpPos: true,
    tag: "Breakout",
    segment: "EQ · NSE",
    subHeading: "₹1,742.50",
    slots: [
      { over: "Open", label: "₹1,725" },
      { over: "High", label: "₹1,749" },
      { over: "Vol", label: "8.2M" },
    ],
  },
];

const ETF_PRESETS: PresetCard[] = [
  { title: "Top gaining ETFs", subtitle: "ETFs with the largest 1-day gain.", logos: ["N", "G", "B"], views: "4.5k views" },
  { title: "Sector rotation leaders", subtitle: "ETFs with strongest 1-month relative strength.", logos: ["I", "P", "F"], views: "3.2k views" },
];

const HEALTH_PRESETS: PresetCard[] = [
  { title: "Debt vs equity health", subtitle: "Companies with low debt and rising profits.", logos: ["A", "T", "R"], views: "6.7k views", plus: true, tag: "Fundamentals" },
  { title: "Earnings momentum", subtitle: "EPS growing faster than revenue for 3 quarters.", logos: ["I", "B", "H"], views: "5.2k views", plus: true, tag: "Quality" },
];

const FUTURES_PRESETS: PresetCard[] = [
  { title: "Open interest spikes", subtitle: "Futures with unusual OI buildup today.", logos: ["N", "R", "T"], views: "8.4k views", plus: true, tag: "Derivatives" },
  { title: "Long buildup", subtitle: "Price up + OI up — strong long signals.", logos: ["B", "I", "S"], views: "4.9k views", plus: true, tag: "Derivatives" },
];

const STOCK_TABLE: {
  sym: string;
  sub: string;
  ltp: string;
  pct: string;
  up: boolean;
  brand: string;
  mark: string;
}[] = [
  { sym: "HDFC Bank", sub: "HDFCBANK · BANK", ltp: "1,742.50", pct: "+1.24%", up: true, brand: "#004C8F", mark: "H" },
  { sym: "Federal Bank", sub: "FEDERALBNK · BANK", ltp: "192.30", pct: "+2.15%", up: true, brand: "#00488E", mark: "F" },
  { sym: "IDFC First Bank", sub: "IDFCFIRSTB · BANK", ltp: "78.85", pct: "-0.62%", up: false, brand: "#9B1C25", mark: "I" },
  { sym: "Kotak Bank", sub: "KOTAKBANK · BANK", ltp: "1,815.40", pct: "+0.48%", up: true, brand: "#ED1C24", mark: "K" },
  { sym: "ICICI Bank", sub: "ICICIBANK · BANK", ltp: "1,234.10", pct: "-0.31%", up: false, brand: "#FF6600", mark: "I" },
];

function DiscoverScreenersScreen({ onBack }: { onBack: () => void }) {
  const [activeChip, setActiveChip] = useState(0);
  const chips = ["All", "Trending", "Intraday", "Swing", "Long term", "F&O"];

  return (
    <div style={{ flex: 1, overflowY: "auto", background: C.bgDefault }}>
      {/* Top bar with back */}
      <div
        className="flex items-center"
        style={{ height: 48, padding: "0 12px", gap: 8, background: C.bgDefault, borderBottom: `1px solid ${C.ui2}` }}
      >
        <button onClick={onBack} className="flex items-center justify-center" style={{ width: 32, height: 32 }}>
          <ChevronLeft size={20} color={C.textPrimary} />
        </button>
        <span style={{ fontFamily: "'Messina Sans', 'Inter', sans-serif", fontWeight: 700, fontSize: 16, color: C.textPrimary }}>
          Discover Screeners
        </span>
      </div>

      {/* Hero */}
      <div
        className="flex flex-col"
        style={{
          padding: "24px 16px 20px",
          gap: 16,
          background: "radial-gradient(120% 80% at 50% 0%, #EAF1FA 0%, #FFFFFF 100%)",
        }}
      >
        <div className="flex flex-col" style={{ gap: 6 }}>
          <span style={{ fontFamily: "'Messina Sans', 'Inter', sans-serif", fontWeight: 700, fontSize: 22, lineHeight: "28px", color: C.textPrimary }}>
            Find your next trade in seconds
          </span>
          <span style={{ fontSize: 13, lineHeight: "18px", color: C.textSecondary }}>
            Expert-built scanners across trading styles, sectors, and timeframes.
          </span>
        </div>
        <div className="flex items-center" style={{ gap: 8, flexWrap: "wrap" }}>
          {[
            { icon: <Maximize2 size={12} color={C.brandPurple} />, label: "Fullscreen" },
            { icon: <AlarmClock size={12} color={C.brandPurple} />, label: "Alerts" },
            { icon: <TrendingUp size={12} color={C.brandPurple} />, label: "Trends" },
            { icon: <Zap size={12} color={C.brandPurple} />, label: "Real-time" },
          ].map((p) => (
            <div
              key={p.label}
              className="flex items-center"
              style={{
                gap: 4,
                padding: "4px 8px",
                borderRadius: 9999,
                background: "linear-gradient(90deg, rgba(43,127,255,0.10) 0%, rgba(173,70,255,0.10) 100%)",
                border: "0.5px solid rgba(43,127,255,0.20)",
              }}
            >
              {p.icon}
              <span
                style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 10,
                  fontWeight: 500,
                  lineHeight: "14px",
                  color: C.brandPurple,
                }}
              >
                {p.label}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center" style={{ gap: 8 }}>
          <button
            className="flex items-center justify-center"
            style={{
              width: 172,
              height: 32,
              padding: "0 12px",
              gap: 4,
              background: C.brandPurple,
              color: "#FFFFFF",
              border: "none",
              borderRadius: 6,
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 12,
              fontWeight: 600,
              lineHeight: "16px",
            }}
          >
            <span>Browse all</span>
            <ArrowRight size={16} color="#FFFFFF" />
          </button>
          <button
            className="flex items-center justify-center"
            style={{
              width: 172,
              height: 32,
              padding: "0 12px",
              gap: 4,
              background: C.bgDefault,
              color: C.brandPurple,
              border: `1px solid ${C.brandPurple}`,
              borderRadius: 6,
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 12,
              fontWeight: 600,
              lineHeight: "16px",
            }}
          >
            <span>Custom</span>
            <Plus size={16} color={C.brandPurple} />
          </button>
        </div>
      </div>

      {/* Filter chips */}
      <div
        className="flex items-center"
        style={{ gap: 8, padding: "12px 16px", overflowX: "auto", borderBottom: `1px solid ${C.ui2}` }}
      >
        {chips.map((c, i) => {
          const active = activeChip === i;
          return (
            <button
              key={c}
              onClick={() => setActiveChip(i)}
              style={{
                padding: "6px 12px",
                borderRadius: 9999,
                background: active ? C.bgPlusChipBg : C.bgDefault,
                border: `1px solid ${active ? C.brandPurple : C.ui3}`,
                color: active ? C.brandPurple : C.textPrimary,
                fontSize: 12,
                fontWeight: 500,
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {c}
            </button>
          );
        })}
      </div>

      <DiscoverStocksMetricSection />
      <DiscoverSection title="Trending ETFs" subtitle="What's moving across themes today." cards={ETF_PRESETS} bg="#EAF1FA" icon={<ETFGradientIcon />} />
      <DiscoverSection title="Health Checks" subtitle="Quality and fundamental filters." cards={HEALTH_PRESETS} framed icon={<HealthGradientIcon />} />
      <DiscoverSection title="Futures" subtitle="Derivatives flow and OI insight." cards={FUTURES_PRESETS} framed icon={<FuturesGradientIcon />} />

      <DiscoverStocksTable />

      <DiscoverFooter />
    </div>
  );
}

function ETFGradientIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="etfIconGrad" x1="16" y1="2" x2="16" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0.0662" stopColor="#A8D1FF" />
          <stop offset="0.9495" stopColor="#2B7FFF" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="12" stroke="url(#etfIconGrad)" strokeWidth="2" fill="none" />
      <path d="M16 4 V16 L24 20" stroke="url(#etfIconGrad)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="16" cy="16" r="3" fill="url(#etfIconGrad)" />
    </svg>
  );
}

function HealthGradientIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="healthIconGrad" x1="16" y1="2" x2="16" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0.0662" stopColor="#FFC9B8" />
          <stop offset="0.9495" stopColor="#D53627" />
        </linearGradient>
      </defs>
      <path d="M16 28s-11-6.5-11-15a6 6 0 0 1 11-3.3A6 6 0 0 1 27 13c0 8.5-11 15-11 15Z" fill="url(#healthIconGrad)" />
      <path d="M10 16h3l2-4 2 8 2-4h3" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function FuturesGradientIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="futIconGrad" x1="16" y1="2" x2="16" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0.0662" stopColor="#F7D98B" />
          <stop offset="0.9495" stopColor="#A07A1F" />
        </linearGradient>
      </defs>
      <rect x="4" y="8" width="10" height="16" rx="2" fill="url(#futIconGrad)" />
      <rect x="18" y="4" width="10" height="24" rx="2" fill="url(#futIconGrad)" />
      <path d="M9 6v4M23 2v4M9 22v4M23 26v4" stroke="#A07A1F" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function StocksGradientIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="stocksIconGrad" x1="16" y1="2" x2="16" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0.0662" stopColor="#CFADF1" />
          <stop offset="0.9495" stopColor="#5A298B" />
        </linearGradient>
      </defs>
      <rect x="4" y="18" width="5" height="10" rx="1" fill="url(#stocksIconGrad)" />
      <rect x="11" y="12" width="5" height="16" rx="1" fill="url(#stocksIconGrad)" />
      <rect x="18" y="6" width="5" height="22" rx="1" fill="url(#stocksIconGrad)" />
      <path d="M5 14L12 9L18 12L27 4" stroke="#5A298B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M23 4H27V8" stroke="#5A298B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StockMetricCardView({ card }: { card: StockMetric }) {
  return (
    <div
      className="flex flex-col"
      style={{
        background: C.bgDefault,
        border: `1px solid ${C.ui2}`,
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      {/* card-callout */}
      <div className="flex items-center justify-between" style={{ padding: "8px 12px" }}>
        <span
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 10,
            fontWeight: 600,
            lineHeight: "14px",
            color: C.posText,
            background: C.posBg,
            padding: "2px 6px",
            borderRadius: 4,
          }}
        >
          {card.tag}
        </span>
        <TrendingUp size={14} color={C.posText} />
      </div>
      <div style={{ height: 1, background: C.ui2 }} />
      {/* card-header: label + LTP */}
      <div className="flex items-center justify-between" style={{ padding: "10px 12px" }}>
        <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 14, fontWeight: 600, color: C.textPrimary }}>
          {card.label}
        </span>
        <span
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 12,
            fontWeight: 600,
            color: card.ltpPos ? C.posText : C.negText,
          }}
        >
          {card.ltp}
        </span>
      </div>
      {/* slot-group */}
      <div className="flex" style={{ padding: "0 12px 10px" }}>
        {card.slots.map((s, i) => (
          <div key={i} className="flex flex-col" style={{ flex: 1, gap: 2 }}>
            <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 10, fontWeight: 400, color: C.textTertiary }}>
              {s.over}
            </span>
            <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 12, fontWeight: 600, color: C.textPrimary }}>
              {s.label}
            </span>
          </div>
        ))}
      </div>
      <div style={{ height: 1, background: C.ui2 }} />
      {/* card-footer */}
      <div className="flex items-center justify-between" style={{ padding: "10px 12px", gap: 8 }}>
        <div className="flex flex-col" style={{ gap: 2, minWidth: 0 }}>
          <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 10, fontWeight: 400, color: C.textTertiary }}>
            {card.segment}
          </span>
          <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 14, fontWeight: 600, color: C.textPrimary }}>
            {card.subHeading}
          </span>
        </div>
        <div className="flex items-center" style={{ gap: 6 }}>
          <button
            style={{
              width: 38,
              height: 24,
              background: C.negText,
              color: "#FFFFFF",
              border: "none",
              borderRadius: 4,
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            Buy
          </button>
          <button
            style={{
              width: 39,
              height: 24,
              background: "#005E3B",
              color: "#FFFFFF",
              border: "none",
              borderRadius: 4,
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            Sell
          </button>
        </div>
      </div>
    </div>
  );
}

function DiscoverStocksMetricSection() {
  return (
    <div className="flex flex-col" style={{ padding: "20px 16px", gap: 12, background: C.bgDefault }}>
      <div className="flex items-start" style={{ gap: 12 }}>
        <div className="shrink-0">
          <StocksGradientIcon />
        </div>
        <div className="flex flex-col" style={{ gap: 2, flex: 1 }}>
          <span style={{ fontFamily: "'Messina Sans', 'Inter', sans-serif", fontWeight: 700, fontSize: 16, color: C.textPrimary }}>
            Stocks
          </span>
          <span style={{ fontSize: 12, color: C.textSecondary, lineHeight: "16px" }}>
            Curated equity setups across timeframes.
          </span>
        </div>
      </div>
      <div className="flex flex-col" style={{ gap: 10 }}>
        {STOCK_METRIC_CARDS.map((c) => (
          <StockMetricCardView key={c.label} card={c} />
        ))}
      </div>
      <button
        className="flex items-center"
        style={{ gap: 4, padding: "4px 0", color: C.brandPurple, fontSize: 13, fontWeight: 600 }}
      >
        View all
        <ArrowRight size={14} color={C.brandPurple} />
      </button>
    </div>
  );
}

function DiscoverSection({
  title,
  subtitle,
  cards,
  bg,
  framed,
  icon,
}: {
  title: string;
  subtitle: string;
  cards: PresetCard[];
  bg?: string;
  framed?: boolean;
  icon?: React.ReactNode;
}) {
  const headerRow = (
    <div className="flex items-start" style={{ gap: 12 }}>
      <div className="shrink-0" style={{ width: 32, height: 32 }}>
        {icon ?? (
          <div
            className="flex items-center justify-center"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "linear-gradient(180deg, #CFADF1 6.62%, #5A298B 94.95%)",
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            {title.charAt(0)}
          </div>
        )}
      </div>
      <div className="flex flex-col" style={{ gap: 2, flex: 1 }}>
        <span style={{ fontFamily: "'Messina Sans', 'Inter', sans-serif", fontWeight: 700, fontSize: 16, color: C.textPrimary }}>
          {title}
        </span>
        <span style={{ fontSize: 12, color: C.textSecondary, lineHeight: "16px" }}>{subtitle}</span>
      </div>
      <button
        className="flex items-center shrink-0"
        style={{ gap: 2, color: C.brandPurple, fontSize: 12, fontWeight: 600 }}
      >
        View all
        <ArrowRight size={12} color={C.brandPurple} />
      </button>
    </div>
  );

  if (framed) {
    return (
      <div className="flex flex-col" style={{ padding: "20px 16px", background: bg ?? C.bgDefault }}>
        <div
          className="flex flex-col"
          style={{
            padding: 12,
            background: C.bgMuted,
            borderRadius: 16,
            gap: 12,
          }}
        >
          {headerRow}
          <div style={{ height: 1, background: C.ui2 }} />
          <div className="flex flex-col" style={{ gap: 8 }}>
            {cards.map((card) => (
              <PresetMediaCard key={card.title} card={card} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ padding: "20px 16px", gap: 12, background: bg ?? C.bgDefault }}>
      {headerRow}
      <div className="flex flex-col" style={{ gap: 8 }}>
        {cards.map((card) => (
          <PresetMediaCard key={card.title} card={card} />
        ))}
      </div>
    </div>
  );
}

function PresetMediaCard({ card }: { card: PresetCard }) {
  return (
    <button
      className="flex flex-col w-full text-left"
      style={{
        padding: 12,
        background: C.bgDefault,
        border: `1px solid ${C.ui2}`,
        borderRadius: 12,
        gap: 10,
      }}
    >
      <div className="flex items-start justify-between" style={{ gap: 8 }}>
        <div className="flex flex-col" style={{ gap: 2, flex: 1, minWidth: 0 }}>
          <div className="flex items-center" style={{ gap: 6 }}>
            {card.plus && (
              <span
                className="flex items-center justify-center"
                style={{
                  width: 35,
                  height: 16,
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  color: "#FFFFFF",
                  background: "#0C0C0C",
                  borderRadius: 3,
                }}
              >
                PLUS
              </span>
            )}
            <span style={{ fontFamily: "'Messina Sans', 'Inter', sans-serif", fontWeight: 700, fontSize: 14, color: C.textPrimary }}>
              {card.title}
            </span>
          </div>
          <span style={{ fontSize: 12, color: C.textSecondary, lineHeight: "16px" }}>{card.subtitle}</span>
        </div>
        <ChevronRight size={16} color={C.textTertiary} />
      </div>
      <div className="flex items-center justify-between" style={{ gap: 8 }}>
        <div className="flex items-center" style={{ gap: -4 }}>
          {card.logos.map((l, i) => (
            <div
              key={i}
              className="flex items-center justify-center"
              style={{
                width: 22,
                height: 22,
                borderRadius: 9999,
                background: i % 2 === 0 ? C.brandPurple : "#2DD4BF",
                color: "#FFFFFF",
                fontSize: 10,
                fontWeight: 700,
                marginLeft: i === 0 ? 0 : -6,
                border: `1.5px solid ${C.bgDefault}`,
              }}
            >
              {l}
            </div>
          ))}
        </div>
        <div className="flex items-center" style={{ gap: 8 }}>
          {card.tag && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: C.brandPurple,
                background: C.plusPurpleChip,
                padding: "2px 6px",
                borderRadius: 4,
              }}
            >
              {card.tag}
            </span>
          )}
          <span style={{ fontSize: 11, color: C.textTertiary }}>{card.views}</span>
        </div>
      </div>
    </button>
  );
}

function DiscoverStocksTable() {
  const tabs = ["Top gainers", "Top losers", "Most active"];
  const [tab, setTab] = useState(0);
  return (
    <div className="flex flex-col" style={{ padding: "20px 16px", gap: 12, borderTop: `1px solid ${C.ui2}` }}>
      <div className="flex items-center justify-between">
        <span style={{ fontFamily: "'Messina Sans', 'Inter', sans-serif", fontWeight: 700, fontSize: 16, color: C.textPrimary }}>
          Stocks
        </span>
        <div
          className="flex items-center"
          style={{
            gap: 4,
            padding: "4px 8px",
            border: `1px solid ${C.ui3}`,
            borderRadius: 6,
            fontSize: 12,
            color: C.textPrimary,
          }}
        >
          1D
          <ChevronDown size={12} color={C.textPrimary} />
        </div>
      </div>
      <div className="flex items-center" style={{ gap: 16, borderBottom: `1px solid ${C.ui2}` }}>
        {tabs.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            style={{
              padding: "8px 0",
              fontSize: 13,
              fontWeight: tab === i ? 600 : 500,
              color: tab === i ? C.brandPurple : C.textSecondary,
              borderBottom: tab === i ? `2px solid ${C.brandPurple}` : "2px solid transparent",
            }}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="flex flex-col">
        {STOCK_TABLE.map((row) => (
          <div
            key={row.sym}
            className="flex items-center justify-between"
            style={{ padding: "10px 0", borderBottom: `1px solid ${C.ui1}`, gap: 8 }}
          >
            <div className="flex items-center" style={{ gap: 10, flex: 1, minWidth: 0 }}>
              <div
                className="flex items-center justify-center shrink-0"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9999,
                  background: row.brand,
                  color: "#FFFFFF",
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                {row.mark}
              </div>
              <div className="flex flex-col" style={{ minWidth: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>{row.sym}</span>
                <span style={{ fontSize: 11, color: C.textTertiary }}>{row.sub}</span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>₹{row.ltp}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: row.up ? C.posText : C.negText }}>{row.pct}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FooterLinkGroup({ title, links }: { title: string; links: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col" style={{ borderBottom: "1px solid #4B1F73" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between"
        style={{ padding: "12px 0", width: "100%" }}
      >
        <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 14, fontWeight: 600, color: "#FFFFFF" }}>
          {title}
        </span>
        <ChevronDown
          size={16}
          color="#AF91D1"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 120ms" }}
        />
      </button>
      {open && (
        <div className="flex flex-col" style={{ gap: 8, padding: "0 0 12px" }}>
          {links.map((l) => (
            <span
              key={l}
              style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13, color: "#D7BDF0", lineHeight: "20px" }}
            >
              {l}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function SocialIcon({ label }: { label: string }) {
  return (
    <div
      className="flex items-center justify-center"
      style={{
        width: 32,
        height: 32,
        borderRadius: 9999,
        background: "rgba(255,255,255,0.08)",
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: 12,
        fontWeight: 700,
        color: "#FFFFFF",
      }}
    >
      {label}
    </div>
  );
}

function DiscoverFooter() {
  const linkGroups = [
    { title: "Products", links: ["Stocks", "Mutual Funds", "F&O", "IPO", "Commodities", "Currencies", "Upstox Pro Web", "Upstox Pro Mobile"] },
    { title: "About", links: ["About us", "Media & Press", "Careers", "Contact us"] },
    { title: "Partner", links: ["Become a partner", "Refer & earn", "Affiliate program"] },
    { title: "Support", links: ["Help & support", "How to open an account", "Fund transfer", "Margin calculator"] },
    { title: "Resources", links: ["Trading view", "Market news", "Learning center", "Blog", "Glossary"] },
  ];
  const stocksCloud = Array.from({ length: 28 }, (_, i) => `Links ${i + 1}`);

  return (
    <div className="flex flex-col" style={{ background: "#37135B", padding: "32px 16px", gap: 24, color: "#FFFFFF" }}>
      {/* Wordmark + description */}
      <div className="flex flex-col" style={{ gap: 12 }}>
        <div className="flex items-center" style={{ gap: 8 }}>
          <div
            className="flex items-center justify-center"
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: C.brandPurpleLogo,
              fontFamily: "'Messina Sans', 'Inter', sans-serif",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            U
          </div>
          <span style={{ fontFamily: "'Messina Sans', 'Inter', sans-serif", fontWeight: 700, fontSize: 18, letterSpacing: 0.2 }}>
            upstox
          </span>
        </div>
        <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 12, lineHeight: "18px", color: "#D7BDF0" }}>
          Upstox is one of India's leading discount brokers, offering investing and trading across stocks,
          F&O, mutual funds, IPOs, and more — all on a fast, no-frills platform.
        </span>
        <div className="flex items-center" style={{ gap: 8 }}>
          <span
            className="flex items-center"
            style={{
              gap: 4,
              padding: "4px 8px",
              borderRadius: 9999,
              border: "1px solid rgba(255,255,255,0.2)",
              fontSize: 11,
              color: "#FFFFFF",
            }}
          >
            🇮🇳 India
          </span>
          <span
            className="flex items-center"
            style={{
              padding: "4px 8px",
              borderRadius: 9999,
              border: "1px solid rgba(255,255,255,0.2)",
              fontSize: 11,
              color: "#FFFFFF",
            }}
          >
            INR ₹
          </span>
        </div>
      </div>

      {/* Download-app card */}
      <div
        className="flex items-center justify-between"
        style={{ padding: 12, background: C.brandPurple, borderRadius: 12, gap: 12 }}
      >
        <div className="flex flex-col" style={{ gap: 4, flex: 1 }}>
          <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13, fontWeight: 600 }}>
            Download the mobile application today
          </span>
          <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 11, color: "#E8E7FF" }}>
            Trade anywhere, anytime.
          </span>
        </div>
        <div className="flex items-center" style={{ gap: 6 }}>
          <div
            className="flex items-center justify-center"
            style={{ width: 36, height: 36, borderRadius: 8, background: "#FFFFFF", fontSize: 16 }}
          >
            ▶
          </div>
          <div
            className="flex items-center justify-center"
            style={{ width: 36, height: 36, borderRadius: 8, background: "#FFFFFF", fontSize: 16 }}
          >

          </div>
        </div>
      </div>

      {/* Collapsible link groups */}
      <div className="flex flex-col">
        {linkGroups.map((g) => (
          <FooterLinkGroup key={g.title} title={g.title} links={g.links} />
        ))}
      </div>

      {/* Stocks link cloud */}
      <div className="flex flex-col" style={{ gap: 10 }}>
        <span
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 12,
            fontWeight: 700,
            color: "#AF91D1",
            letterSpacing: 0.5,
            textTransform: "uppercase",
          }}
        >
          Stocks
        </span>
        <div className="flex flex-wrap" style={{ gap: "6px 0" }}>
          {stocksCloud.map((s, i) => (
            <div key={s} className="flex items-center">
              <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 11, color: "#D7BDF0", padding: "2px 6px" }}>
                {s}
              </span>
              {i < stocksCloud.length - 1 && (
                <span
                  aria-hidden
                  style={{
                    display: "inline-block",
                    width: 1,
                    height: 10,
                    background: "#FFFFFF",
                    opacity: 0.56,
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Attention-Investors / Disclaimer */}
      <div
        className="flex flex-col"
        style={{ padding: 12, background: "#1A092A", borderRadius: 12, gap: 10 }}
      >
        <div className="flex items-center justify-between">
          <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 12, fontWeight: 700, color: "#FFFFFF" }}>
            Attention Investors
          </span>
          <ChevronDown size={16} color="#AF91D1" />
        </div>
        <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 11, lineHeight: "16px", color: "#AF91D1" }}>
          Investments in securities market are subject to market risks. Read all the related documents
          carefully before investing. Brokerage will not exceed SEBI prescribed limit. Registration granted
          by SEBI and certification from NISM in no way guarantee performance of the intermediary.
        </span>
      </div>

      {/* Social icons */}
      <div className="flex items-center" style={{ gap: 10 }}>
        {["f", "X", "in", "IG", "YT", "TG"].map((s) => (
          <SocialIcon key={s} label={s} />
        ))}
      </div>

      {/* Legal row */}
      <div className="flex flex-wrap items-center" style={{ gap: "6px 0", paddingTop: 12, borderTop: "1px solid #4B1F73" }}>
        {["About us", "Privacy Policy", "Terms & Conditions", "Investor Charter", "Contact us"].map((l, i, arr) => (
          <span key={l} className="flex items-center">
            <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 11, color: "#AF91D1", padding: "0 8px" }}>
              {l}
            </span>
            {i < arr.length - 1 && (
              <span aria-hidden style={{ width: 1, height: 10, background: "#4B1F73" }} />
            )}
          </span>
        ))}
      </div>

      <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 11, color: "#8B6BAE" }}>
        © 2026 Upstox. All rights reserved.
      </span>
    </div>
  );
}

// ───── System bottom bar (home indicator) ─────
function SystemBar() {
  return (
    <div
      className="flex items-center justify-center"
      style={{ height: 15, background: "#0C0C0C", padding: "6.5px 0" }}
    >
      <span style={{ width: 64, height: 2, background: "#FFFFFF", borderRadius: 100 }} aria-hidden />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ░░░ DESKTOP SHELL — rendered when viewport ≥ 1024 px. Mobile path above
// ░░░ is completely untouched. All layout tokens pulled from mobileColors (C).
// ════════════════════════════════════════════════════════════════════════════

type DesktopShellProps = {
  scanUniverse: string;
  setScanUniverse: (v: string) => void;
  industries: string[];
  setIndustries: (v: string[]) => void;
  sectors: string[];
  setSectors: (v: string[]) => void;
  extraFilters: Filter[];
  setExtraFilters: (v: Filter[]) => void;
  filters: Filter[];
};

function DesktopShell(props: DesktopShellProps) {
  const {
    scanUniverse, setScanUniverse,
    industries, setIndustries,
    sectors, setSectors,
    extraFilters, setExtraFilters,
    filters,
  } = props;

  const [scannerName, setScannerName] = useState<string>("ORB Breakout Stocks");
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [titleDraft, setTitleDraft] = useState<string>(scannerName);

  const [addFilterOpen, setAddFilterOpen] = useState<boolean>(false);
  const [openSheet, setOpenSheet] = useState<null | "universe" | "industries" | "sectors">(null);
  const [expandedFilterIdx, setExpandedFilterIdx] = useState<number | null>(null);

  // Results table: share the same column picker model used by mobile
  const [selectedKeys, setSelectedKeys] = useState<string[]>(DEFAULT_SCRIP_COLUMNS);
  const [pickerOpen, setPickerOpen] = useState<boolean>(false);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const selectedCols = selectedKeys
    .map((k) => SCRIP_COLUMNS.find((c) => c.key === k))
    .filter((c): c is ScripColumn => !!c);

  const parsePct = (s?: string): number => {
    if (!s) return 0;
    const n = parseFloat(s.replace("%", "").replace(/,/g, ""));
    return Number.isFinite(n) ? n : 0;
  };
  const sortedScrips = [...SAMPLE_SCRIPS].sort((a, b) => {
    const av = parsePct(a.chgPct);
    const bv = parsePct(b.chgPct);
    return sortDir === "desc" ? bv - av : av - bv;
  });

  const commitTitle = () => {
    const trimmed = titleDraft.trim();
    setScannerName(trimmed.length > 0 ? trimmed : scannerName);
    setIsEditingTitle(false);
  };
  const cancelTitle = () => {
    setTitleDraft(scannerName);
    setIsEditingTitle(false);
  };

  const deleteFilterAt = (idx: number) => {
    if (idx < 3) return; // first 3 are defaults; leave them
    const extraIdx = idx - 3;
    const next = extraFilters.slice();
    next.splice(extraIdx, 1);
    setExtraFilters(next);
    if (expandedFilterIdx === idx) setExpandedFilterIdx(null);
  };

  const clearAllExtra = () => {
    setExtraFilters([]);
    setExpandedFilterIdx(null);
  };

  const toggleExpand = (idx: number) => {
    setExpandedFilterIdx((cur) => (cur === idx ? null : idx));
  };

  const openFilterSheet = (label: string) => {
    if (label === "Scan Universe") setOpenSheet("universe");
    else if (label === "Industry") setOpenSheet("industries");
    else if (label === "Sector") setOpenSheet("sectors");
  };

  return (
    <div
      className="flex flex-col"
      style={{
        minHeight: "100vh",
        background: C.bgMuted,
        fontFamily: "'Inter', system-ui, sans-serif",
        color: C.textPrimary,
      }}
    >
      {/* ──────── Top toolbar strip ──────── */}
      <div
        className="flex items-center"
        style={{
          height: 60,
          padding: "0 20px",
          background: C.bgDefault,
          borderBottom: `1px solid ${C.ui3}`,
          gap: 16,
        }}
      >
        <div className="flex items-center" style={{ gap: 8, flex: 1, minWidth: 0 }}>
          {isEditingTitle ? (
            <input
              autoFocus
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitTitle();
                else if (e.key === "Escape") cancelTitle();
              }}
              style={{
                height: 32,
                padding: "0 8px",
                border: `1px solid ${C.ui3}`,
                borderRadius: 6,
                fontSize: 16,
                fontWeight: 600,
                color: C.textPrimary,
                background: C.bgDefault,
                outline: "none",
                minWidth: 280,
              }}
            />
          ) : (
            <>
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: C.textPrimary,
                  maxWidth: 520,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {scannerName || "Untitled screener"}
              </span>
              <button
                aria-label="Rename screener"
                onClick={() => { setTitleDraft(scannerName); setIsEditingTitle(true); }}
                className="flex items-center justify-center"
                style={{
                  width: 28, height: 28, borderRadius: 6,
                  background: "transparent", border: "none", cursor: "pointer",
                }}
              >
                <Pencil size={14} color={C.textSecondary} />
              </button>
            </>
          )}
        </div>

        <div className="flex items-center" style={{ gap: 8 }}>
          <button
            aria-label="Share"
            onClick={() => window.alert("Share coming soon")}
            className="flex items-center justify-center"
            style={{
              width: 36, height: 36, borderRadius: 8,
              border: `1px solid ${C.ui3}`, background: C.bgDefault, cursor: "pointer",
            }}
          >
            <Share2 size={16} color={C.textPrimary} />
          </button>
          <button
            aria-label="Alerts"
            onClick={() => window.alert("Alert coming soon")}
            className="flex items-center justify-center"
            style={{
              width: 36, height: 36, borderRadius: 8,
              border: `1px solid ${C.ui3}`, background: C.bgDefault, cursor: "pointer",
            }}
          >
            <Bell size={16} color={C.textPrimary} />
          </button>
          <button
            onClick={() => window.alert("Saved")}
            className="flex items-center justify-center"
            style={{
              height: 36, padding: "0 18px", borderRadius: 8,
              background: C.brandPurple, color: "#FFFFFF",
              fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer",
            }}
          >
            Save
          </button>
        </div>
      </div>

      {/* ──────── Two-column workspace ──────── */}
      <div className="flex" style={{ flex: 1, minHeight: 0, height: "calc(100vh - 60px)" }}>
        {/* Sidebar */}
        <aside
          className="flex flex-col"
          style={{
            width: 260,
            flexShrink: 0,
            background: C.bgDefault,
            borderRight: `1px solid ${C.ui3}`,
          }}
        >
          <div
            className="flex items-center justify-between"
            style={{
              padding: "16px 16px 12px",
              borderBottom: `1px solid ${C.ui2}`,
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 700, color: C.textPrimary }}>Filters</span>
            <button
              onClick={clearAllExtra}
              style={{
                background: "transparent", border: "none", cursor: "pointer",
                fontSize: 12, fontWeight: 600, color: C.brandPurple,
              }}
            >
              Clear all
            </button>
          </div>

          <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "4px 0" }}>
            {filters.map((f, idx) => {
              const expanded = expandedFilterIdx === idx;
              const canDelete = idx >= 3;
              return (
                <div key={`${f.label}-${idx}`}>
                  <div
                    className="flex items-center"
                    style={{
                      padding: "10px 16px",
                      gap: 8,
                      cursor: "pointer",
                    }}
                    onClick={() => idx < 3 ? openFilterSheet(f.label) : toggleExpand(idx)}
                  >
                    <span
                      aria-hidden
                      style={{
                        width: 6, height: 6, borderRadius: 3,
                        background: C.brandPurple, flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        flex: 1,
                        fontSize: 13,
                        fontWeight: 500,
                        color: C.textPrimary,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {f.label}
                    </span>
                    {canDelete && (
                      <button
                        aria-label="Delete filter"
                        onClick={(e) => { e.stopPropagation(); deleteFilterAt(idx); }}
                        className="flex items-center justify-center"
                        style={{
                          width: 24, height: 24, borderRadius: 4,
                          background: "transparent", border: "none", cursor: "pointer",
                        }}
                      >
                        <Trash2 size={14} color={C.textSecondary} />
                      </button>
                    )}
                    <button
                      aria-label="Toggle summary"
                      onClick={(e) => { e.stopPropagation(); toggleExpand(idx); }}
                      className="flex items-center justify-center"
                      style={{
                        width: 24, height: 24, borderRadius: 4,
                        background: "transparent", border: "none", cursor: "pointer",
                      }}
                    >
                      <ChevronDown
                        size={14}
                        color={C.textSecondary}
                        style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}
                      />
                    </button>
                  </div>
                  {expanded && (
                    <div
                      style={{
                        padding: "0 16px 10px 30px",
                        fontSize: 12,
                        color: C.textSecondary,
                        lineHeight: "18px",
                      }}
                    >
                      {f.value}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ padding: 12, borderTop: `1px solid ${C.ui2}` }}>
            <button
              onClick={() => setAddFilterOpen(true)}
              className="flex items-center justify-center w-full"
              style={{
                height: 36,
                borderRadius: 6,
                border: `1px solid ${C.brandPurple}`,
                background: C.bgDefault,
                color: C.brandPurple,
                fontSize: 13,
                fontWeight: 600,
                gap: 6,
                cursor: "pointer",
              }}
            >
              <Plus size={14} color={C.brandPurple} />
              Add condition
            </button>
          </div>
        </aside>

        {/* Main pane: results table */}
        <main className="flex flex-col" style={{ flex: 1, minWidth: 0, background: C.bgMuted }}>
          <div
            className="flex items-center justify-between"
            style={{
              padding: "12px 20px",
              background: C.bgDefault,
              borderBottom: `1px solid ${C.ui2}`,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>
              {SAMPLE_SCRIPS.length} scrips matched
            </span>
            <button
              onClick={() => setPickerOpen(true)}
              className="flex items-center"
              style={{
                gap: 6,
                height: 30,
                padding: "0 12px",
                border: `1px solid ${C.ui3}`,
                borderRadius: 6,
                background: C.bgDefault,
                color: C.textPrimary,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <Plus size={12} color={C.textPrimary} strokeWidth={2} />
              Columns · {selectedCols.length}
            </button>
          </div>

          <div style={{ flex: 1, minHeight: 0, overflow: "auto", background: C.bgDefault }}>
            <DesktopResultsTable
              rows={sortedScrips}
              extraCols={selectedCols}
              sortDir={sortDir}
              onToggleSort={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))}
            />
          </div>
        </main>
      </div>

      {/* ──────── Modal: Add filters ──────── */}
      {addFilterOpen && (
        <DesktopAddFiltersDialog
          onClose={() => setAddFilterOpen(false)}
          onPick={(f) => {
            if (f) setExtraFilters([...extraFilters, f]);
            setAddFilterOpen(false);
          }}
        />
      )}

      {/* ──────── Sheets for core filters — auto-centered on desktop ──────── */}
      {openSheet === "universe" && (
        <ScanUniverseSheet
          value={scanUniverse}
          onClose={() => setOpenSheet(null)}
          onPick={(v) => { setScanUniverse(v); setOpenSheet(null); }}
        />
      )}
      {openSheet === "industries" && (
        <MultiSelectSheet
          title="Industry"
          options={INDUSTRY_OPTIONS}
          value={industries}
          onClose={() => setOpenSheet(null)}
          onApply={(v) => { setIndustries(v); setOpenSheet(null); }}
        />
      )}
      {openSheet === "sectors" && (
        <MultiSelectSheet
          title="Sector"
          options={SECTOR_OPTIONS}
          value={sectors}
          onClose={() => setOpenSheet(null)}
          onApply={(v) => { setSectors(v); setOpenSheet(null); }}
        />
      )}
      {pickerOpen && (
        <ColumnPickerSheet
          value={selectedKeys}
          onClose={() => setPickerOpen(false)}
          onApply={(v) => { setSelectedKeys(v); setPickerOpen(false); }}
        />
      )}
    </div>
  );
}

function DesktopResultsTable({
  rows,
  extraCols,
  sortDir,
  onToggleSort,
}: {
  rows: ListItem[];
  extraCols: ScripColumn[];
  sortDir: "asc" | "desc";
  onToggleSort: () => void;
}) {
  const headerCell: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    color: C.textSecondary,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    padding: "10px 12px",
    background: C.bgMuted,
    borderBottom: `1px solid ${C.ui2}`,
    whiteSpace: "nowrap",
  };
  const bodyCell: React.CSSProperties = {
    fontSize: 13,
    color: C.textPrimary,
    padding: "12px",
    borderBottom: `1px solid ${C.ui2}`,
    whiteSpace: "nowrap",
  };

  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={{ ...headerCell, textAlign: "left", width: 44 }}>#</th>
          <th style={{ ...headerCell, textAlign: "left", minWidth: 180 }}>Symbol</th>
          <th style={{ ...headerCell, textAlign: "right" }}>Price</th>
          <th
            style={{ ...headerCell, textAlign: "right", cursor: "pointer" }}
            onClick={onToggleSort}
          >
            1D Chg% {sortDir === "desc" ? "↓" : "↑"}
          </th>
          <th style={{ ...headerCell, textAlign: "right" }}>Volume</th>
          {extraCols.map((col) => (
            <th
              key={col.key}
              style={{
                ...headerCell,
                textAlign: col.align ?? "right",
                minWidth: col.minWidth ?? 96,
              }}
            >
              {col.label}
            </th>
          ))}
          <th
            style={{
              ...headerCell,
              textAlign: "center",
              position: "sticky",
              right: 0,
              background: C.bgMuted,
              width: 72,
            }}
          >
            Watch
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((item, idx) => (
          <tr
            key={item.symbol}
            style={{ background: C.bgDefault }}
            onMouseEnter={(e) => (e.currentTarget.style.background = C.bgMuted)}
            onMouseLeave={(e) => (e.currentTarget.style.background = C.bgDefault)}
          >
            <td style={{ ...bodyCell, color: C.textSecondary }}>{idx + 1}</td>
            <td style={bodyCell}>
              <div className="flex flex-col" style={{ gap: 2 }}>
                <span style={{ fontWeight: 600 }}>{item.symbol}</span>
                <span style={{ fontSize: 11, color: C.textTertiary }}>
                  {item.exchange}{item.segment ? ` · ${item.segment}` : ""}
                </span>
              </div>
            </td>
            <td style={{ ...bodyCell, textAlign: "right", fontWeight: 500 }}>₹ {item.ltp}</td>
            <td
              style={{
                ...bodyCell,
                textAlign: "right",
                fontWeight: 600,
                color: item.dir === "pos" ? C.posText : C.negText,
              }}
            >
              {item.chgPct ?? "—"}
            </td>
            <td style={{ ...bodyCell, textAlign: "right" }}>{item.volume ?? "—"}</td>
            {extraCols.map((col) => {
              const v = col.accessor(item);
              const color = col.colored ? (item.dir === "pos" ? C.posText : C.negText) : C.textPrimary;
              return (
                <td
                  key={col.key}
                  style={{
                    ...bodyCell,
                    textAlign: col.align ?? "right",
                    color,
                    fontWeight: col.colored ? 600 : 500,
                  }}
                >
                  {v ?? "—"}
                </td>
              );
            })}
            <td
              style={{
                ...bodyCell,
                textAlign: "center",
                position: "sticky",
                right: 0,
                background: "inherit",
              }}
            >
              <button
                aria-label="Add to watchlist"
                className="flex items-center justify-center"
                style={{
                  width: 28, height: 28, borderRadius: 4,
                  border: `1px solid ${C.ui3}`, background: C.bgDefault,
                  cursor: "pointer", margin: "0 auto",
                }}
              >
                <Plus size={14} color={C.brandPurple} />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function DesktopAddFiltersDialog({
  onClose,
  onPick,
}: {
  onClose: () => void;
  onPick: (f?: Filter) => void;
}) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 60, background: "rgba(0,0,0,0.4)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col"
        style={{
          width: "min(900px, 94vw)",
          height: "min(640px, 86vh)",
          background: C.bgDefault,
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
        }}
      >
        <div
          className="flex items-center"
          style={{
            height: 56,
            padding: "0 20px",
            gap: 12,
            borderBottom: `1px solid ${C.ui2}`,
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 700, color: C.textPrimary }}>Add filters</span>
          <div className="flex-1" />
          <button
            aria-label="Close"
            onClick={onClose}
            className="flex items-center justify-center"
            style={{
              width: 32, height: 32, borderRadius: 6,
              background: "transparent", border: "none", cursor: "pointer",
            }}
          >
            <X size={18} color={C.textSecondary} />
          </button>
        </div>

        <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
          <AddFilterScreen
            onBack={onClose}
            onDone={(f) => onPick(f)}
          />
        </div>
      </div>
    </div>
  );
}
