import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Search, Shield, Heart, Eye, Plus, ChevronRight, ChevronDown, X,
  Compass, Radio, Box, Rss, FolderOpen,
  Clock, Flame, TrendingUp, Users, Filter,
  Download, Save, Bell,
  ExternalLink, Activity, Zap, BarChart2, Star,
  Layers, ShoppingCart, List, Rocket, Move,
  BookOpen, ArrowUpDown, MessageCircle,
  ThumbsUp, Share2, Bookmark,
} from "lucide-react";
import {
  MARKETPLACE_SCREENERS,
  PUBLISHERS, LIVE_MARKET_PICKS, UPSTOX_SCANNER_CATEGORIES,
  FEED_ALERTS, FEED_PUBLISHER_ACTIVITY, USER_SCANNERS,
  formatCount, formatVolume,
  type Publisher,
} from "@/data/mockData";
import { cn } from "@/lib/utils";

// ─── Main Tabs ──────────────────────────────────────────────────────────────

const MAIN_TABS = [
  { key: "explore", label: "Explore", icon: Compass },
  { key: "live", label: "Live Market Picks", icon: Radio },
  { key: "upstox", label: "Upstox Scanners", icon: Box },
  { key: "feed", label: "My Feed", icon: Rss },
  { key: "scanners", label: "My Scanners", icon: FolderOpen },
] as const;

type MainTab = typeof MAIN_TABS[number]["key"];

// ─── Explore Sub-tabs ───────────────────────────────────────────────────────

const EXPLORE_TABS = [
  { key: "all", label: "All", icon: BarChart2 },
  { key: "latest", label: "Latest", icon: Clock },
  { key: "trending", label: "Trending", icon: Flame },
  { key: "publishers", label: "Top Publishers", icon: Users },
] as const;

type ExploreTab = typeof EXPLORE_TABS[number]["key"];

// ─── Filter dropdown options ────────────────────────────────────────────────

const CATEGORY_OPTIONS: { key: string; label: string }[] = [
  { key: "price", label: "Price" },
  { key: "technicals", label: "Technicals" },
  { key: "volume-delivery", label: "Volume & Delivery" },
  { key: "candlesticks", label: "Candlesticks" },
  { key: "financial-ratios", label: "Financial Ratios" },
  { key: "profitability", label: "Profitability" },
  { key: "income-growth", label: "Income & Growth" },
  { key: "balance-sheet", label: "Balance Sheet" },
  { key: "cash-flow", label: "Cash Flow" },
  { key: "shareholding", label: "Shareholding" },
  { key: "valuation", label: "Valuation" },
  { key: "futures-options", label: "Futures & Options" },
];

const PUBLISHER_SORT_OPTIONS = [
  { key: "followers", label: "Followers" },
  { key: "likes", label: "Likes" },
  { key: "publications", label: "Publications" },
];

// ─── Live market signal dropdown options ────────────────────────────────────

const BULLISH_SIGNALS = [
  { key: "bullish-all", label: "All Bullish Signals" },
  { key: "breakout-high", label: "Breakout High" },
  { key: "golden-cross", label: "Golden Crossover" },
  { key: "rsi-oversold-bounce", label: "RSI Oversold Bounce" },
  { key: "volume-surge-up", label: "Volume Surge (Up)" },
];

const BEARISH_SIGNALS = [
  { key: "bearish-all", label: "All Bearish Signals" },
  { key: "nearing-52w-low", label: "Nearing 52W Low" },
  { key: "death-cross", label: "Death Cross" },
  { key: "rsi-overbought", label: "RSI Overbought" },
  { key: "volume-surge-down", label: "Volume Surge (Down)" },
];

const NEARING_HIGH_OPTIONS = [
  { key: "5pct-52w-high", label: "5% near 52W High" },
  { key: "7pct-52w-high", label: "7.5% near 52W High" },
  { key: "10pct-52w-high", label: "10% near 52W High" },
];

const NEARING_LOW_OPTIONS = [
  { key: "5pct-52w-low", label: "5% near 52W Low" },
  { key: "7pct-52w-low", label: "7.5% near 52W Low" },
  { key: "10pct-52w-low", label: "10% near 52W Low" },
];

const RISE_FALL_OPTIONS = [
  { key: "rise-5", label: "Rise > 5%" },
  { key: "rise-3", label: "Rise > 3%" },
  { key: "fall-3", label: "Fall > 3%" },
  { key: "fall-5", label: "Fall > 5%" },
];

const VOLUME_SIGNAL_OPTIONS = [
  { key: "vol-2x", label: "Volume > 2x Avg" },
  { key: "vol-5x", label: "Volume > 5x Avg" },
  { key: "vol-10x", label: "Volume > 10x Avg" },
];

// ─── Icon Map for Upstox Categories ─────────────────────────────────────────

const ICON_MAP: Record<string, React.ElementType> = {
  flame: Flame,
  "trending-up": TrendingUp,
  "bar-chart": BarChart2,
  zap: Zap,
  activity: Activity,
  layers: Layers,
  list: List,
  rocket: Rocket,
  move: Move,
  star: Star,
  "shopping-cart": ShoppingCart,
};

// ─── Reusable Dropdown with Checkboxes ──────────────────────────────────────

function FilterDropdown({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: { key: string; label: string }[];
  selected: Set<string>;
  onToggle: (key: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const count = options.filter((o) => selected.has(o.key)).length;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors",
          count > 0
            ? "bg-primary/10 text-primary border-primary/30"
            : "bg-white text-muted-foreground border-border hover:border-primary/30"
        )}
      >
        {label}
        {count > 0 && (
          <span className="bg-primary text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
            {count}
          </span>
        )}
        <ChevronDown className={cn("w-3 h-3 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute top-full mt-1 left-0 z-20 bg-white border border-border rounded-lg shadow-lg py-1 min-w-[200px] max-h-[280px] overflow-y-auto">
          {options.map((opt) => (
            <label
              key={opt.key}
              className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selected.has(opt.key)}
                onChange={() => onToggle(opt.key)}
                className="rounded border-border text-primary focus:ring-primary w-3.5 h-3.5"
              />
              {opt.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MarketplacePage
// ═══════════════════════════════════════════════════════════════════════════

export function MarketplacePage() {
  const [mainTab, setMainTab] = useState<MainTab>("explore");

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Marketplace</h1>
          <p className="text-sm text-muted-foreground">
            Discover, share, and trade with {formatCount(8400)}+ community screeners
          </p>
        </div>
        <Button asChild className="shrink-0">
          <Link to="/diy">
            <Plus className="w-4 h-4 mr-1.5" />Create Screener
          </Link>
        </Button>
      </div>

      {/* Main Tab Bar */}
      <div className="flex items-center gap-1 border-b border-border mb-6 overflow-x-auto scrollbar-none">
        {MAIN_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setMainTab(tab.key)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors -mb-px",
              mainTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {mainTab === "explore" && <ExploreTabContent />}
      {mainTab === "live" && <LiveMarketPicksContent />}
      {mainTab === "upstox" && <UpstoxScannersContent />}
      {mainTab === "feed" && <MyFeedContent />}
      {mainTab === "scanners" && <MyScannersContent />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Explore Tab
// ═══════════════════════════════════════════════════════════════════════════

function ExploreTabContent() {
  const [exploreTab, setExploreTab] = useState<ExploreTab>("all");
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [followingOnly, setFollowingOnly] = useState(false);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  const toggleCategory = (key: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const toggleLike = (id: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Collect active filter chips
  const activeChips: { key: string; label: string }[] = [];
  selectedCategories.forEach((key) => {
    const opt = CATEGORY_OPTIONS.find((o) => o.key === key);
    if (opt) activeChips.push({ key, label: opt.label });
  });
  if (followingOnly) activeChips.push({ key: "__following", label: "Publishers I Follow" });

  const removeChip = (key: string) => {
    if (key === "__following") {
      setFollowingOnly(false);
    } else {
      setSelectedCategories((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  return (
    <div>
      {/* Explore Sub-tabs */}
      <div className="flex items-center gap-1 mb-5 overflow-x-auto scrollbar-none">
        {EXPLORE_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setExploreTab(tab.key)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
              exploreTab === tab.key
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Top Publishers sub-tab */}
      {exploreTab === "publishers" ? (
        <TopPublishersSection />
      ) : (
        <>
          {/* Filter Row: Search + Dropdowns */}
          <div className="flex flex-col gap-3 mb-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search screeners, tags, creators..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>

              <FilterDropdown
                label="Categories"
                options={CATEGORY_OPTIONS}
                selected={selectedCategories}
                onToggle={toggleCategory}
              />

              <button
                onClick={() => setFollowingOnly(!followingOnly)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors",
                  followingOnly
                    ? "bg-primary/10 text-primary border-primary/30"
                    : "bg-white text-muted-foreground border-border hover:border-primary/30"
                )}
              >
                <Users className="w-3 h-3" />
                Publishers I Follow
              </button>
            </div>

            {/* Active filter chips */}
            {activeChips.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <Filter className="w-3 h-3 text-muted-foreground" />
                {activeChips.map((chip) => (
                  <span
                    key={chip.key}
                    className="flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full"
                  >
                    {chip.label}
                    <button onClick={() => removeChip(chip.key)} className="hover:text-primary/70">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <button
                  onClick={() => { setSelectedCategories(new Set()); setFollowingOnly(false); }}
                  className="text-xs text-muted-foreground hover:text-foreground ml-1"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Screener List */}
          <ScreenerList
            tab={exploreTab}
            search={search}
            likedIds={likedIds}
            onToggleLike={toggleLike}
          />
        </>
      )}
    </div>
  );
}

// ─── Screener List (Horizontal cards) ───────────────────────────────────────

function ScreenerList({
  tab,
  search,
  likedIds,
  onToggleLike,
}: {
  tab: ExploreTab;
  search: string;
  likedIds: Set<string>;
  onToggleLike: (id: string) => void;
}) {
  let screeners = [...MARKETPLACE_SCREENERS];

  if (search) {
    const q = search.toLowerCase();
    screeners = screeners.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q)) ||
        s.creator.handle.toLowerCase().includes(q) ||
        s.creator.displayName.toLowerCase().includes(q)
    );
  }

  if (tab === "latest") {
    screeners.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else if (tab === "trending") {
    screeners.sort((a, b) => b.views - a.views);
  }

  if (screeners.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
        <p className="font-medium">No screeners found</p>
        <p className="text-sm mt-1">Try a different search or filter</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground">{screeners.length} screeners</span>
      </div>
      <div className="space-y-3">
        {screeners.map((s) => (
          <ScreenerRowCard
            key={s.id}
            screener={s}
            liked={likedIds.has(s.id)}
            onLike={() => onToggleLike(s.id)}
          />
        ))}
      </div>
    </>
  );
}

// ─── Horizontal Screener Card ───────────────────────────────────────────────

function ScreenerRowCard({
  screener,
  liked,
  onLike,
}: {
  screener: typeof MARKETPLACE_SCREENERS[0];
  liked: boolean;
  onLike: () => void;
}) {
  const triggeredAgo = ["2 min", "14 min", "1 hr", "3 hrs", "6 hrs", "1 day"][
    Math.abs(screener.id.charCodeAt(3)) % 6
  ];

  return (
    <div className="flex items-start gap-4 p-4 rounded-lg border border-border hover:border-primary/30 hover:shadow-sm transition-all group">
      {/* Icon / Avatar */}
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
        {screener.name[0]}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <Link to={`/marketplace/${screener.id}`}>
          <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {screener.name}
          </h3>
        </Link>
        {screener.description && (
          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{screener.description}</p>
        )}
        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
          <Link
            to={`/profile/${screener.creator.handle}`}
            className="flex items-center gap-1 hover:text-primary transition-colors"
          >
            <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-[8px] font-bold text-primary">
              {screener.creator.displayName[0]}
            </div>
            @{screener.creator.handle}
            {screener.creator.verified && <Shield className="w-2.5 h-2.5 text-primary" />}
          </Link>
          <span>·</span>
          <span>
            {new Date(screener.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </span>
        </div>
      </div>

      {/* Right side: likes + view count */}
      <div className="flex items-center gap-4 shrink-0 text-xs text-muted-foreground">
        <span className="flex items-center gap-1 text-green-600">
          <Activity className="w-3 h-3" />
          {triggeredAgo} ago
        </span>
        <button
          onClick={(e) => { e.preventDefault(); onLike(); }}
          className={cn(
            "flex items-center gap-1 transition-colors",
            liked ? "text-red-500" : "hover:text-red-500"
          )}
        >
          <Heart className={cn("w-3.5 h-3.5", liked && "fill-current")} />
          {formatCount(screener.likes + (liked ? 1 : 0))}
        </button>
        <span className="flex items-center gap-1">
          <Eye className="w-3.5 h-3.5" />{formatCount(screener.views)}
        </span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Top Publishers Section
// ═══════════════════════════════════════════════════════════════════════════

function TopPublishersSection() {
  const [sortBy, setSortBy] = useState<"followers" | "likes" | "publications">("followers");

  const sortedPublishers = [...PUBLISHERS].sort((a, b) => {
    if (sortBy === "followers") return b.followers - a.followers;
    if (sortBy === "likes") return b.totalLikes - a.totalLikes;
    return b.totalPublications - a.totalPublications;
  });

  const topLikedThisWeek = [...PUBLISHERS].sort((a, b) => b.totalLikes - a.totalLikes).slice(0, 3);
  const topFollowedThisWeek = [...PUBLISHERS].sort((a, b) => b.followers - a.followers).slice(0, 3);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Heart className="w-4 h-4 text-red-500" />Most Likes This Week
        </h3>
        <div className="grid sm:grid-cols-3 gap-3">
          {topLikedThisWeek.map((p, i) => (
            <PublisherHighlightCard key={p.handle} publisher={p} rank={i + 1} metric="likes" />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />Most Followed This Week
        </h3>
        <div className="grid sm:grid-cols-3 gap-3">
          {topFollowedThisWeek.map((p, i) => (
            <PublisherHighlightCard key={p.handle} publisher={p} rank={i + 1} metric="followers" />
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">All Publishers</h3>
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
            {PUBLISHER_SORT_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setSortBy(opt.key as typeof sortBy)}
                className={cn(
                  "text-xs px-2 py-1 rounded transition-colors",
                  sortBy === opt.key ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          {sortedPublishers.map((p) => (
            <PublisherRow key={p.handle} publisher={p} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PublisherHighlightCard({ publisher, rank, metric }: { publisher: Publisher; rank: number; metric: "likes" | "followers" }) {
  return (
    <Link to={`/profile/${publisher.handle}`}>
      <Card className="hover:shadow-md hover:border-primary/30 transition-all">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">{publisher.avatar}</div>
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">{rank}</div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm truncate">{publisher.displayName}</span>
                {publisher.verified && <Shield className="w-3 h-3 text-primary shrink-0" />}
              </div>
              <p className="text-xs text-muted-foreground">@{publisher.handle}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
            <span className={cn("font-semibold", metric === "likes" ? "text-red-500" : "text-primary")}>
              {metric === "likes" ? `${formatCount(publisher.totalLikes)} likes` : `${formatCount(publisher.followers)} followers`}
            </span>
            <span>{publisher.totalPublications} screeners</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function PublisherRow({ publisher }: { publisher: Publisher }) {
  return (
    <Link to={`/profile/${publisher.handle}`}>
      <div className="flex items-center gap-4 p-3 rounded-lg border border-border hover:border-primary/30 hover:shadow-sm transition-all">
        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">{publisher.avatar}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-sm">{publisher.displayName}</span>
            {publisher.verified && <Shield className="w-3 h-3 text-primary" />}
          </div>
          <p className="text-xs text-muted-foreground truncate">{publisher.bio}</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
          <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{formatCount(publisher.totalLikes)}</span>
          <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{publisher.totalPublications}</span>
          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{formatCount(publisher.followers)}</span>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
      </div>
    </Link>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Live Market Picks Tab
// ═══════════════════════════════════════════════════════════════════════════

function LiveMarketPicksContent() {
  const [liveTabs, setLiveTabs] = useState([{ id: "tab-1", name: "Scanner 1" }]);
  const [activeTabId, setActiveTabId] = useState("tab-1");
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  // Per-tab filter state (simplified: shared for demo)
  const [bullishFilters, setBullishFilters] = useState<Set<string>>(new Set());
  const [bearishFilters, setBearishFilters] = useState<Set<string>>(new Set());
  const [nearingHighFilters, setNearingHighFilters] = useState<Set<string>>(new Set());
  const [nearingLowFilters, setNearingLowFilters] = useState<Set<string>>(new Set());
  const [riseFallFilters, setRiseFallFilters] = useState<Set<string>>(new Set());
  const [volumeFilters, setVolumeFilters] = useState<Set<string>>(new Set());

  const toggleSet = (setter: React.Dispatch<React.SetStateAction<Set<string>>>) => (key: string) => {
    setter((prev) => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
  };

  const addTab = () => {
    const newId = `tab-${Date.now()}`;
    const newName = `Scanner ${liveTabs.length + 1}`;
    setLiveTabs((prev) => [...prev, { id: newId, name: newName }]);
    setActiveTabId(newId);
  };

  const closeTab = (id: string) => {
    if (liveTabs.length === 1) return;
    const remaining = liveTabs.filter((t) => t.id !== id);
    setLiveTabs(remaining);
    if (activeTabId === id) setActiveTabId(remaining[0].id);
  };

  const startEditing = (id: string, name: string) => {
    setEditingTabId(id);
    setEditName(name);
  };

  const finishEditing = () => {
    if (editingTabId && editName.trim()) {
      setLiveTabs((prev) => prev.map((t) => t.id === editingTabId ? { ...t, name: editName.trim() } : t));
    }
    setEditingTabId(null);
  };

  return (
    <div>
      {/* NIFTY Header + Action buttons */}
      <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3 mb-4">
        <div className="flex items-center gap-3">
          <Activity className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Live Market Scanner</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="text-xs h-7 gap-1"><Download className="w-3 h-3" />Export</Button>
            <Button size="sm" variant="outline" className="text-xs h-7 gap-1"><Save className="w-3 h-3" />Save</Button>
            <Button size="sm" variant="outline" className="text-xs h-7 gap-1"><Bell className="w-3 h-3" />Notify Me</Button>
          </div>
          <div className="border-l border-border pl-3 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">NIFTY</span>
            <span className="text-sm font-bold text-foreground">22,031.40</span>
            <span className="text-xs text-red-500 font-medium">-488.29 (-2.16%)</span>
          </div>
        </div>
      </div>

      {/* Signal filter dropdowns */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto scrollbar-none flex-wrap">
        <FilterDropdown label="Bullish Signal" options={BULLISH_SIGNALS} selected={bullishFilters} onToggle={toggleSet(setBullishFilters)} />
        <FilterDropdown label="Bearish Signal" options={BEARISH_SIGNALS} selected={bearishFilters} onToggle={toggleSet(setBearishFilters)} />
        <FilterDropdown label="Nearing High" options={NEARING_HIGH_OPTIONS} selected={nearingHighFilters} onToggle={toggleSet(setNearingHighFilters)} />
        <FilterDropdown label="Nearing Low" options={NEARING_LOW_OPTIONS} selected={nearingLowFilters} onToggle={toggleSet(setNearingLowFilters)} />
        <FilterDropdown label="Rise & Fall" options={RISE_FALL_OPTIONS} selected={riseFallFilters} onToggle={toggleSet(setRiseFallFilters)} />
        <FilterDropdown label="Volume Signal" options={VOLUME_SIGNAL_OPTIONS} selected={volumeFilters} onToggle={toggleSet(setVolumeFilters)} />
        <select className="border border-border rounded px-2 py-1.5 text-xs bg-white ml-auto">
          <option>Nifty 500</option>
          <option>Nifty 200</option>
          <option>Nifty 50</option>
          <option>All NSE</option>
        </select>
      </div>

      {/* Vertical side-by-side panels */}
      <div className="flex gap-0 border border-border rounded-lg overflow-hidden">
        {liveTabs.map((tab) => (
          <div
            key={tab.id}
            className={cn(
              "flex-1 min-w-0 flex flex-col",
              liveTabs.length > 1 && "border-r border-border last:border-r-0"
            )}
          >
            {/* Tab header */}
            <div
              className={cn(
                "flex items-center justify-between px-3 py-2 border-b border-border cursor-pointer",
                activeTabId === tab.id ? "bg-primary/5" : "bg-muted/30"
              )}
              onClick={() => setActiveTabId(tab.id)}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <Radio className="w-3 h-3 text-primary shrink-0" />
                {editingTabId === tab.id ? (
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={finishEditing}
                    onKeyDown={(e) => e.key === "Enter" && finishEditing()}
                    className="text-xs font-medium bg-white border border-border rounded px-1.5 py-0.5 w-24"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span
                    className="text-xs font-medium truncate"
                    onDoubleClick={(e) => { e.stopPropagation(); startEditing(tab.id, tab.name); }}
                  >
                    {tab.name}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {liveTabs.length > 1 && (
                  <button onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }} className="text-muted-foreground hover:text-destructive">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Table content */}
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/40 border-b border-border">
                    <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">Name</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">Breakout for</th>
                    <th className="text-right px-3 py-2 text-xs font-semibold text-muted-foreground">LTP</th>
                    <th className="text-right px-3 py-2 text-xs font-semibold text-muted-foreground">Volume</th>
                    <th className="text-right px-3 py-2 text-xs font-semibold text-muted-foreground">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {LIVE_MARKET_PICKS.map((pick) => (
                    <tr key={pick.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <button className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary">
                            <Plus className="w-3 h-3" />
                          </button>
                          <span className="font-semibold text-xs">{pick.symbol}</span>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                            <button className="text-[9px] px-1 py-0 rounded bg-green-100 text-green-700 font-medium hover:bg-green-200">B</button>
                            <button className="text-[9px] px-1 py-0 rounded bg-red-100 text-red-700 font-medium hover:bg-red-200">S</button>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-[11px]">
                        <span className={cn("flex items-center gap-1", pick.signal === "bearish" ? "text-red-600" : "text-green-600")}>
                          {pick.signal === "bearish" ? "▼" : "▲"} {pick.breakoutType}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right font-medium text-xs">₹{pick.ltp.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                      <td className="px-3 py-2.5 text-right text-xs">{formatVolume(pick.volume)}</td>
                      <td className="px-3 py-2.5 text-right text-[11px] text-muted-foreground">{pick.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {/* Add new panel button */}
        <button
          onClick={addTab}
          className="w-10 shrink-0 flex items-center justify-center bg-muted/20 hover:bg-muted/40 border-l border-border transition-colors"
          title="Add new scanner panel"
        >
          <Plus className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="mt-2 text-[10px] text-muted-foreground text-right">
        Data refreshes every 30 seconds · Double-click tab name to rename
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Upstox Scanners Tab — Horizontal layout
// ═══════════════════════════════════════════════════════════════════════════

function UpstoxScannersContent() {
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground mb-1">Upstox Scanners & Smartlists</h2>
        <p className="text-sm text-muted-foreground">Pre-built screeners and curated lists by Upstox</p>
      </div>

      <div className="space-y-3">
        {UPSTOX_SCANNER_CATEGORIES.map((cat) => {
          const Icon = ICON_MAP[cat.icon] || BarChart2;
          return (
            <div key={cat.id} className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer group">
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", cat.color)}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">{cat.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-1">{cat.description}</p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">{cat.scannerCount} screeners</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// My Feed Tab
// ═══════════════════════════════════════════════════════════════════════════

function MyFeedContent() {
  const [feedTab, setFeedTab] = useState<"alerts" | "publishers">("alerts");

  return (
    <div>
      <div className="flex items-center gap-1 mb-5">
        <button
          onClick={() => setFeedTab("alerts")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
            feedTab === "alerts" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          <Bell className="w-3.5 h-3.5" />Alerts
        </button>
        <button
          onClick={() => setFeedTab("publishers")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
            feedTab === "publishers" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          <Users className="w-3.5 h-3.5" />Publishers
        </button>
      </div>

      {feedTab === "alerts" ? <FeedAlertsSection /> : <FeedPublishersSocialSection />}
    </div>
  );
}

function FeedAlertsSection() {
  const grouped: Record<string, typeof FEED_ALERTS> = {};
  FEED_ALERTS.forEach((a) => { if (!grouped[a.date]) grouped[a.date] = []; grouped[a.date].push(a); });
  const dates = Object.keys(grouped).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <div className="space-y-6">
      {dates.map((date) => (
        <div key={date}>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            {new Date(date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
          </h4>
          <div className="space-y-2">
            {grouped[date].map((alert) => (
              <div key={alert.id} className="flex items-center gap-4 p-3 rounded-lg border border-border hover:border-primary/30 transition-all">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bell className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold text-foreground">{alert.stock}</span>
                    <span className="text-muted-foreground">added to</span>
                    <Link to={`/marketplace/${alert.screenerId}`} className="text-primary hover:underline font-medium truncate">{alert.screenerName}</Link>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{alert.time}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Social-media style publisher feed
function FeedPublishersSocialSection() {
  return (
    <div className="space-y-4 max-w-2xl">
      {FEED_PUBLISHER_ACTIVITY.map((item) => (
        <Card key={item.id} className="overflow-hidden">
          <CardContent className="p-0">
            {/* Post header */}
            <div className="flex items-center gap-3 p-4 pb-3">
              <Link to={`/profile/${item.publisherHandle}`}>
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                  {item.publisherName[0]}
                </div>
              </Link>
              <div className="flex-1">
                <Link to={`/profile/${item.publisherHandle}`} className="font-semibold text-sm text-foreground hover:text-primary">
                  {item.publisherName}
                </Link>
                <p className="text-[11px] text-muted-foreground">
                  @{item.publisherHandle} · {new Date(item.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} at {item.time}
                </p>
              </div>
            </div>

            {/* Post body */}
            <div className="px-4 pb-3">
              <p className="text-sm text-foreground mb-2">
                Published a new screener:
              </p>
              <Link to={`/marketplace/${item.screenerId}`}>
                <div className="rounded-lg border border-border p-3 hover:border-primary/30 transition-colors bg-muted/20">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {item.screenerName[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-primary">{item.screenerName}</p>
                      <p className="text-[11px] text-muted-foreground">Click to view screener details and results</p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            {/* Post actions */}
            <div className="flex items-center gap-6 px-4 py-2.5 border-t border-border/60 bg-muted/10">
              <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-red-500 transition-colors">
                <ThumbsUp className="w-3.5 h-3.5" />Like
              </button>
              <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                <MessageCircle className="w-3.5 h-3.5" />Comment
              </button>
              <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                <Share2 className="w-3.5 h-3.5" />Share
              </button>
              <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors ml-auto">
                <Bookmark className="w-3.5 h-3.5" />Save
              </button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// My Scanners Tab — Horizontal layout
// ═══════════════════════════════════════════════════════════════════════════

function MyScannersContent() {
  const [scannerTab, setScannerTab] = useState<"published" | "saved">("published");
  const published = USER_SCANNERS.filter((s) => s.status === "published");
  const saved = USER_SCANNERS.filter((s) => s.status === "saved");
  const items = scannerTab === "published" ? published : saved;

  return (
    <div>
      <div className="flex items-center gap-1 mb-5">
        <button
          onClick={() => setScannerTab("published")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
            scannerTab === "published" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          <ExternalLink className="w-3.5 h-3.5" />Published ({published.length})
        </button>
        <button
          onClick={() => setScannerTab("saved")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
            scannerTab === "saved" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          <Save className="w-3.5 h-3.5" />Saved ({saved.length})
        </button>
      </div>

      {/* Create more nudge */}
      <div className="mb-5 rounded-lg bg-gradient-to-r from-primary/5 to-transparent border border-primary/20 p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">Create more screeners</p>
          <p className="text-xs text-muted-foreground mt-0.5">Build and publish your own screener strategy</p>
        </div>
        <Button asChild size="sm"><Link to="/diy"><Plus className="w-3.5 h-3.5 mr-1" />Create</Link></Button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="font-medium">No {scannerTab} scanners yet</p>
          <p className="text-sm mt-1">
            {scannerTab === "published" ? "Publish a screener to share it with the community" : "Save screeners from the marketplace to customize later"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((scanner) => (
            <div key={scanner.id} className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary/30 hover:shadow-sm transition-all">
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0 font-bold text-sm",
                scanner.status === "published" ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"
              )}>
                {scanner.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm text-foreground">{scanner.name}</h3>
                  <Badge className={cn("text-[10px] px-1.5 h-4 border-0",
                    scanner.status === "published" ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"
                  )}>
                    {scanner.status === "published" ? "Published" : "Draft"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{scanner.description}</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
                <span>Updated {new Date(scanner.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                {scanner.status === "published" && (
                  <>
                    <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{scanner.likes}</span>
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{scanner.views}</span>
                  </>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
