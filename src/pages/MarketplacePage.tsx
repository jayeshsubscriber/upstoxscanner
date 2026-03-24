import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Search, Shield, Star, TrendingUp, Copy, Heart,
  Eye, Plus, BarChart2, ChevronRight, Flame,
  Trophy, Sparkles,
} from "lucide-react";
import {
  MARKETPLACE_SCREENERS, PERSONA_COLORS, PERSONA_LABELS,
  formatCount, type ScannerPersona,
} from "@/data/mockData";
import { cn } from "@/lib/utils";

const FILTER_TABS = [
  { key: "all", label: "All", icon: BarChart2 },
  { key: "trending", label: "Trending", icon: Flame },
  { key: "editor", label: "Editor's Choice", icon: Star },
  { key: "top", label: "Most Used", icon: Trophy },
  { key: "new", label: "New", icon: Sparkles },
];

const PERSONA_FILTERS: { key: "all" | ScannerPersona; label: string }[] = [
  { key: "all", label: "All Styles" },
  { key: "intraday", label: "Intraday" },
  { key: "btst", label: "BTST" },
  { key: "swing", label: "Swing" },
  { key: "positional", label: "Positional" },
  { key: "longterm", label: "Long-Term" },
];

export function MarketplacePage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [activePersona, setActivePersona] = useState<"all" | ScannerPersona>("all");
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  const filtered = MARKETPLACE_SCREENERS.filter((s) => {
    const matchSearch = !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase()) ||
      s.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchPersona = activePersona === "all" || s.persona === activePersona;
    const matchFilter =
      activeFilter === "all" ||
      (activeFilter === "editor" && s.isEditorChoice) ||
      (activeFilter === "trending" && s.views > 10000) ||
      (activeFilter === "top" && s.uses > 5000) ||
      (activeFilter === "new" && new Date(s.createdAt) > new Date("2026-01-01"));
    return matchSearch && matchPersona && matchFilter;
  });

  const toggleLike = (id: string) => {
    setLikedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const editorPicks = MARKETPLACE_SCREENERS.filter(s => s.isEditorChoice);
  const featuredThisWeek = MARKETPLACE_SCREENERS.find(s => s.isFeatured);

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Screener Marketplace</h1>
          <p className="text-muted-foreground">
            Discover screeners built and shared by {formatCount(8400)}+ traders
          </p>
        </div>
        <Button asChild className="shrink-0">
          <Link to="/diy">
            <Plus className="w-4 h-4 mr-1.5" />Create Screener
          </Link>
        </Button>
      </div>

      {/* Screener of the Week */}
      {featuredThisWeek && (
        <Link to={`/marketplace/${featuredThisWeek.id}`}>
          <div className="mb-8 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 p-5 hover:border-primary/40 transition-colors cursor-pointer">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Badge className="mb-2 bg-primary text-white border-0 text-xs">
                  ⭐ Screener of the Week
                </Badge>
                <h3 className="font-bold text-lg text-foreground mb-1">{featuredThisWeek.name}</h3>
                <p className="text-sm text-muted-foreground max-w-xl mb-3">{featuredThisWeek.description}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-[9px] font-bold text-primary">
                      {featuredThisWeek.creator.displayName[0]}
                    </div>
                    @{featuredThisWeek.creator.handle}
                    {featuredThisWeek.creator.verified && <Shield className="w-3 h-3 text-primary" />}
                  </span>
                  <span>❤️ {formatCount(featuredThisWeek.likes)}</span>
                  <span>{formatCount(featuredThisWeek.uses)} uses</span>
                  <span className="font-semibold text-green-600">
                    {featuredThisWeek.performance.hitRate}% accuracy
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 mt-1" />
            </div>
          </div>
        </Link>
      )}

      {/* Editor's Choice Row */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            Editor's Choice
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {editorPicks.map((s) => (
            <ScreenerCard key={s.id} screener={s} liked={likedIds.has(s.id)} onLike={() => toggleLike(s.id)} compact />
          ))}
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search screeners, tags, creators..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          {PERSONA_FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setActivePersona(f.key)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border",
                activePersona === f.key
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-muted-foreground border-border hover:border-primary/30"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        {FILTER_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
              activeFilter === tab.key
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-muted-foreground">{filtered.length} screeners</span>
      </div>

      {/* All Screener Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((s) => (
          <ScreenerCard key={s.id} screener={s} liked={likedIds.has(s.id)} onLike={() => toggleLike(s.id)} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="font-medium">No screeners found</p>
          <p className="text-sm mt-1">Try a different search or filter</p>
        </div>
      )}

      {/* Community CTA */}
      <div className="mt-12 rounded-xl border border-border bg-muted/30 p-6 text-center">
        <TrendingUp className="w-8 h-8 text-primary mx-auto mb-3" />
        <h3 className="font-bold text-lg text-foreground mb-2">Share your strategy with the community</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
          Build a screener in the DIY builder and publish it. Earn likes, followers, and the coveted Editor's Choice badge.
        </p>
        <Button asChild>
          <Link to="/diy"><Plus className="w-4 h-4 mr-1.5" />Create Your Screener</Link>
        </Button>
      </div>
    </div>
  );
}

function ScreenerCard({
  screener, liked, onLike, compact,
}: {
  screener: typeof MARKETPLACE_SCREENERS[0];
  liked: boolean;
  onLike: () => void;
  compact?: boolean;
}) {
  const hitRateColor =
    screener.performance.badge === "high" ? "text-green-600 bg-green-50" :
    screener.performance.badge === "moderate" ? "text-yellow-600 bg-yellow-50" :
    "text-muted-foreground bg-muted";

  return (
    <Card className="h-full hover:shadow-md hover:border-primary/30 transition-all group">
      <CardContent className={cn("p-4", compact && "p-3")}>
        {/* Badges row */}
        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
          {screener.isEditorChoice && (
            <Badge className="text-[10px] px-1.5 h-4 bg-amber-100 text-amber-700 border-0">
              <Star className="w-2.5 h-2.5 mr-0.5 fill-current" />Editor's Choice
            </Badge>
          )}
          <Badge className={`text-[10px] px-1.5 h-4 border-0 ${PERSONA_COLORS[screener.persona]}`}>
            {PERSONA_LABELS[screener.persona]}
          </Badge>
          {screener.performance.hitRate > 0 && (
            <span className={`text-[10px] px-1.5 h-4 rounded-full flex items-center font-medium ${hitRateColor}`}>
              {screener.performance.hitRate}% accuracy
            </span>
          )}
        </div>

        {/* Title */}
        <Link to={`/marketplace/${screener.id}`}>
          <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors mb-1 line-clamp-1">
            {screener.name}
          </h3>
        </Link>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{screener.description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {screener.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-muted rounded text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border/60">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[9px] font-bold text-primary">
              {screener.creator.displayName[0]}
            </div>
            <span className="text-xs text-muted-foreground">@{screener.creator.handle}</span>
            {screener.creator.verified && <Shield className="w-3 h-3 text-primary" />}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.preventDefault(); onLike(); }}
              className={cn("flex items-center gap-1 text-xs transition-colors", liked ? "text-red-500" : "text-muted-foreground hover:text-red-500")}
            >
              <Heart className={cn("w-3.5 h-3.5", liked && "fill-current")} />
              {formatCount(screener.likes + (liked ? 1 : 0))}
            </button>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Eye className="w-3.5 h-3.5" />{formatCount(screener.views)}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Copy className="w-3.5 h-3.5" />{formatCount(screener.copies)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
