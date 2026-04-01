import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Search, Shield, Heart, Eye, Plus, ChevronRight,
  Compass, Radio, Box, Rss, FolderOpen,
  Clock, Flame, TrendingUp, Users, Filter,
  Download, Save, Bell,
  ExternalLink, Activity, Zap, BarChart2, Star,
  Layers, ShoppingCart, List, Rocket, Move,
  BookOpen, CalendarDays, ArrowUpDown,
} from "lucide-react";
import {
  MARKETPLACE_SCREENERS, PERSONA_COLORS, PERSONA_LABELS,
  PUBLISHERS, LIVE_MARKET_PICKS, UPSTOX_SCANNER_CATEGORIES,
  FEED_ALERTS, FEED_PUBLISHER_ACTIVITY, USER_SCANNERS,
  formatCount, formatVolume,
  type ScannerPersona, type Publisher,
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

// ─── Category filter pills ─────────────────────────────────────────────────

const CATEGORY_FILTERS: { key: "all" | ScannerPersona; label: string }[] = [
  { key: "all", label: "All Categories" },
  { key: "intraday", label: "Intraday" },
  { key: "btst", label: "BTST" },
  { key: "swing", label: "Swing" },
  { key: "positional", label: "Positional" },
  { key: "longterm", label: "Long-Term" },
];

// ─── Live Market filter pills ───────────────────────────────────────────────

const LIVE_SIGNAL_FILTERS = [
  { key: "all", label: "All Signals" },
  { key: "bullish", label: "Bullish Signal" },
  { key: "bearish", label: "Bearish Signal" },
  { key: "nearing-high", label: "Nearing High" },
  { key: "nearing-low", label: "Nearing Low" },
  { key: "volume", label: "Volume Signal" },
];

// ─── Publisher Sort ─────────────────────────────────────────────────────────

const PUBLISHER_SORT_OPTIONS = [
  { key: "followers", label: "Followers" },
  { key: "likes", label: "Likes" },
  { key: "publications", label: "Publications" },
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
  const [category, setCategory] = useState<"all" | ScannerPersona>("all");
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  const toggleLike = (id: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
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
          {/* Global Filter: Search + Category */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search screeners, tags, creators..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
              <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              {CATEGORY_FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setCategory(f.key)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border",
                    category === f.key
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-muted-foreground border-border hover:border-primary/30"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Screener Grid */}
          <ScreenerGrid
            tab={exploreTab}
            search={search}
            category={category}
            likedIds={likedIds}
            onToggleLike={toggleLike}
          />
        </>
      )}
    </div>
  );
}

// ─── Screener Grid ──────────────────────────────────────────────────────────

function ScreenerGrid({
  tab,
  search,
  category,
  likedIds,
  onToggleLike,
}: {
  tab: ExploreTab;
  search: string;
  category: "all" | ScannerPersona;
  likedIds: Set<string>;
  onToggleLike: (id: string) => void;
}) {
  let screeners = [...MARKETPLACE_SCREENERS];

  // Filter by search
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

  // Filter by category
  if (category !== "all") {
    screeners = screeners.filter((s) => s.persona === category);
  }

  // Sort by tab
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
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-muted-foreground">{screeners.length} screeners</span>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {screeners.map((s) => (
          <ScreenerCard
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

// ─── Screener Card ──────────────────────────────────────────────────────────

function ScreenerCard({
  screener,
  liked,
  onLike,
}: {
  screener: typeof MARKETPLACE_SCREENERS[0];
  liked: boolean;
  onLike: () => void;
}) {
  // mock "last triggered" time
  const triggeredAgo = ["2 min", "14 min", "1 hr", "3 hrs", "6 hrs", "1 day"][
    Math.abs(screener.id.charCodeAt(3)) % 6
  ];

  return (
    <Card className="h-full hover:shadow-md hover:border-primary/30 transition-all group">
      <CardContent className="p-4">
        {/* Top row: persona badge */}
        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
          <Badge className={`text-[10px] px-1.5 h-4 border-0 ${PERSONA_COLORS[screener.persona]}`}>
            {PERSONA_LABELS[screener.persona]}
          </Badge>
          {screener.isEditorChoice && (
            <Badge className="text-[10px] px-1.5 h-4 bg-amber-100 text-amber-700 border-0">
              <Star className="w-2.5 h-2.5 mr-0.5 fill-current" />Editor's Choice
            </Badge>
          )}
        </div>

        {/* Title */}
        <Link to={`/marketplace/${screener.id}`}>
          <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors mb-1 line-clamp-1">
            {screener.name}
          </h3>
        </Link>

        {/* Caption / Description */}
        {screener.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{screener.description}</p>
        )}

        {/* Date published */}
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <CalendarDays className="w-3 h-3" />
            {new Date(screener.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </span>
          <span className="text-border">|</span>
          <span className="flex items-center gap-1 text-green-600">
            <Activity className="w-3 h-3" />
            Last triggered {triggeredAgo} ago
          </span>
        </div>

        {/* Footer: publisher + likes */}
        <div className="flex items-center justify-between pt-2 border-t border-border/60">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[9px] font-bold text-primary">
              {screener.creator.displayName[0]}
            </div>
            <span className="text-xs text-muted-foreground">@{screener.creator.handle}</span>
            {screener.creator.verified && <Shield className="w-3 h-3 text-primary" />}
          </div>
          <button
            onClick={(e) => { e.preventDefault(); onLike(); }}
            className={cn(
              "flex items-center gap-1 text-xs transition-colors",
              liked ? "text-red-500" : "text-muted-foreground hover:text-red-500"
            )}
          >
            <Heart className={cn("w-3.5 h-3.5", liked && "fill-current")} />
            {formatCount(screener.likes + (liked ? 1 : 0))}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Top Publishers Section (within Explore tab)
// ═══════════════════════════════════════════════════════════════════════════

function TopPublishersSection() {
  const [sortBy, setSortBy] = useState<"followers" | "likes" | "publications">("followers");

  const sortedPublishers = [...PUBLISHERS].sort((a, b) => {
    if (sortBy === "followers") return b.followers - a.followers;
    if (sortBy === "likes") return b.totalLikes - a.totalLikes;
    return b.totalPublications - a.totalPublications;
  });

  // Top 3 by likes this week
  const topLikedThisWeek = [...PUBLISHERS].sort((a, b) => b.totalLikes - a.totalLikes).slice(0, 3);
  // Top 3 by followers this week
  const topFollowedThisWeek = [...PUBLISHERS].sort((a, b) => b.followers - a.followers).slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Most Likes This Week */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Heart className="w-4 h-4 text-red-500" />
          Most Likes This Week
        </h3>
        <div className="grid sm:grid-cols-3 gap-3">
          {topLikedThisWeek.map((p, i) => (
            <PublisherHighlightCard key={p.handle} publisher={p} rank={i + 1} metric="likes" />
          ))}
        </div>
      </div>

      {/* Most Followed This Week */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          Most Followed This Week
        </h3>
        <div className="grid sm:grid-cols-3 gap-3">
          {topFollowedThisWeek.map((p, i) => (
            <PublisherHighlightCard key={p.handle} publisher={p} rank={i + 1} metric="followers" />
          ))}
        </div>
      </div>

      {/* All Publishers with Sort */}
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
                  sortBy === opt.key
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground"
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

function PublisherHighlightCard({
  publisher,
  rank,
  metric,
}: {
  publisher: Publisher;
  rank: number;
  metric: "likes" | "followers";
}) {
  return (
    <Link to={`/profile/${publisher.handle}`}>
      <Card className="hover:shadow-md hover:border-primary/30 transition-all">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                {publisher.avatar}
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                {rank}
              </div>
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
              {metric === "likes"
                ? `${formatCount(publisher.totalLikes)} likes`
                : `${formatCount(publisher.followers)} followers`}
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
        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
          {publisher.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-sm">{publisher.displayName}</span>
            {publisher.verified && <Shield className="w-3 h-3 text-primary" />}
          </div>
          <p className="text-xs text-muted-foreground truncate">{publisher.bio}</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
          <span className="flex items-center gap-1">
            <Heart className="w-3 h-3" />{formatCount(publisher.totalLikes)}
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="w-3 h-3" />{publisher.totalPublications}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />{formatCount(publisher.followers)}
          </span>
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
  const [activeSignal, setActiveSignal] = useState("all");
  const [liveTabs, setLiveTabs] = useState([{ id: "tab-1", name: "New Tab" }]);
  const [activeTabId, setActiveTabId] = useState("tab-1");

  const addTab = () => {
    const newId = `tab-${Date.now()}`;
    setLiveTabs((prev) => [...prev, { id: newId, name: "New Tab" }]);
    setActiveTabId(newId);
  };

  const closeTab = (id: string) => {
    if (liveTabs.length === 1) return;
    const remaining = liveTabs.filter((t) => t.id !== id);
    setLiveTabs(remaining);
    if (activeTabId === id) setActiveTabId(remaining[0].id);
  };

  return (
    <div>
      {/* NIFTY Header Bar */}
      <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3 mb-4">
        <div className="flex items-center gap-3">
          <Activity className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Live Market Scanner</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">NIFTY</span>
          <span className="text-sm font-bold text-foreground">22,031.40</span>
          <span className="text-xs text-red-500 font-medium">-488.29 (-2.16%)</span>
        </div>
      </div>

      {/* Signal filter pills */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto scrollbar-none">
        {LIVE_SIGNAL_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveSignal(f.key)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border",
              activeSignal === f.key
                ? "bg-primary text-white border-primary"
                : "bg-white text-muted-foreground border-border hover:border-primary/30"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Tab bar (Chrome-like) */}
      <div className="flex items-center gap-1 border-b border-border mb-4">
        {liveTabs.map((tab) => (
          <div
            key={tab.id}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-t-md cursor-pointer border border-b-0 transition-colors",
              activeTabId === tab.id
                ? "bg-white border-border text-foreground"
                : "bg-muted/50 border-transparent text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setActiveTabId(tab.id)}
          >
            <Radio className="w-3 h-3" />
            {tab.name}
            {liveTabs.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
                className="ml-1 hover:text-destructive"
              >
                &times;
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addTab}
          className="px-2 py-1.5 text-muted-foreground hover:text-primary transition-colors"
          title="New scanner tab"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Button size="sm" variant="outline" className="text-xs h-8 gap-1.5">
          <Download className="w-3.5 h-3.5" />Export
        </Button>
        <Button size="sm" variant="outline" className="text-xs h-8 gap-1.5">
          <Save className="w-3.5 h-3.5" />Save
        </Button>
        <Button size="sm" variant="outline" className="text-xs h-8 gap-1.5">
          <Bell className="w-3.5 h-3.5" />Notify Me
        </Button>
        <Button size="sm" variant="ghost" className="text-xs h-8 gap-1.5 text-muted-foreground">
          Clear
        </Button>
        <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1.5">
          <select className="border border-border rounded px-2 py-1 text-xs bg-white">
            <option>Nifty 500</option>
            <option>Nifty 200</option>
            <option>Nifty 50</option>
            <option>All NSE</option>
          </select>
        </span>
      </div>

      {/* Results Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Name</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Breakout for</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground">LTP</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground">Volume</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {LIVE_MARKET_PICKS.map((pick) => (
                <tr key={pick.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <div>
                        <span className="font-semibold text-sm">{pick.symbol}</span>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-0.5">
                          <button className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-medium hover:bg-green-200">B</button>
                          <button className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-medium hover:bg-red-200">S</button>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <span className={cn(
                      "flex items-center gap-1",
                      pick.signal === "bearish" ? "text-red-600" : "text-green-600"
                    )}>
                      {pick.signal === "bearish" ? "▼" : "▲"} {pick.breakoutType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-sm">
                    ₹{pick.ltp.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-right text-sm">{formatVolume(pick.volume)}</td>
                  <td className="px-4 py-3 text-right text-xs text-muted-foreground">{pick.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-3 border-t border-border bg-muted/20 text-xs text-muted-foreground flex items-center justify-between">
          <span>Showing {LIVE_MARKET_PICKS.length} results</span>
          <span className="text-[10px]">Data refreshes every 30 seconds</span>
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Upstox Scanners Tab
// ═══════════════════════════════════════════════════════════════════════════

function UpstoxScannersContent() {
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground mb-1">Upstox Scanners & Smartlists</h2>
        <p className="text-sm text-muted-foreground">Pre-built screeners and curated lists by Upstox</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {UPSTOX_SCANNER_CATEGORIES.map((cat) => {
          const Icon = ICON_MAP[cat.icon] || BarChart2;
          return (
            <Card key={cat.id} className="hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", cat.color)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors mb-1">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{cat.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[11px] text-muted-foreground">{cat.scannerCount} screeners</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1 group-hover:text-primary transition-colors" />
                </div>
              </CardContent>
            </Card>
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
      {/* Feed Sub-tabs */}
      <div className="flex items-center gap-1 mb-5">
        <button
          onClick={() => setFeedTab("alerts")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
            feedTab === "alerts"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          <Bell className="w-3.5 h-3.5" />Alerts
        </button>
        <button
          onClick={() => setFeedTab("publishers")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
            feedTab === "publishers"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          <Users className="w-3.5 h-3.5" />Publishers
        </button>
      </div>

      {feedTab === "alerts" ? <FeedAlertsSection /> : <FeedPublishersSection />}
    </div>
  );
}

function FeedAlertsSection() {
  // Group alerts by date
  const grouped: Record<string, typeof FEED_ALERTS> = {};
  FEED_ALERTS.forEach((a) => {
    if (!grouped[a.date]) grouped[a.date] = [];
    grouped[a.date].push(a);
  });

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
                    <Link
                      to={`/marketplace/${alert.screenerId}`}
                      className="text-primary hover:underline font-medium truncate"
                    >
                      {alert.screenerName}
                    </Link>
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

function FeedPublishersSection() {
  return (
    <div className="space-y-2">
      {FEED_PUBLISHER_ACTIVITY.map((item) => (
        <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg border border-border hover:border-primary/30 transition-all">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
            {item.publisherName[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-sm">
              <Link to={`/profile/${item.publisherHandle}`} className="font-semibold text-foreground hover:text-primary">
                {item.publisherName}
              </Link>
              <span className="text-muted-foreground">published</span>
              <Link to={`/marketplace/${item.screenerId}`} className="text-primary hover:underline font-medium truncate">
                {item.screenerName}
              </Link>
            </div>
          </div>
          <div className="text-xs text-muted-foreground shrink-0 text-right">
            <div>{new Date(item.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</div>
            <div>{item.time}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// My Scanners Tab
// ═══════════════════════════════════════════════════════════════════════════

function MyScannersContent() {
  const [scannerTab, setScannerTab] = useState<"published" | "saved">("published");

  const published = USER_SCANNERS.filter((s) => s.status === "published");
  const saved = USER_SCANNERS.filter((s) => s.status === "saved");
  const items = scannerTab === "published" ? published : saved;

  return (
    <div>
      {/* Sub-tabs */}
      <div className="flex items-center gap-1 mb-5">
        <button
          onClick={() => setScannerTab("published")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
            scannerTab === "published"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          <ExternalLink className="w-3.5 h-3.5" />Published ({published.length})
        </button>
        <button
          onClick={() => setScannerTab("saved")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
            scannerTab === "saved"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
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
        <Button asChild size="sm">
          <Link to="/diy">
            <Plus className="w-3.5 h-3.5 mr-1" />Create
          </Link>
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="font-medium">No {scannerTab} scanners yet</p>
          <p className="text-sm mt-1">
            {scannerTab === "published"
              ? "Publish a screener to share it with the community"
              : "Save screeners from the marketplace to customize later"}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {items.map((scanner) => (
            <Card key={scanner.id} className="hover:shadow-md hover:border-primary/30 transition-all">
              <CardContent className="p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <Badge className={`text-[10px] px-1.5 h-4 border-0 ${PERSONA_COLORS[scanner.persona]}`}>
                    {PERSONA_LABELS[scanner.persona]}
                  </Badge>
                  <Badge
                    className={cn(
                      "text-[10px] px-1.5 h-4 border-0",
                      scanner.status === "published"
                        ? "bg-green-100 text-green-700"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {scanner.status === "published" ? "Published" : "Draft"}
                  </Badge>
                </div>
                <h3 className="font-semibold text-sm text-foreground mb-1">{scanner.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{scanner.description}</p>
                <code className="text-[11px] text-muted-foreground bg-muted p-2 rounded block line-clamp-2 mb-3">
                  {scanner.conditions}
                </code>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Updated {new Date(scanner.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                  {scanner.status === "published" && (
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{scanner.likes}</span>
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{scanner.views}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
