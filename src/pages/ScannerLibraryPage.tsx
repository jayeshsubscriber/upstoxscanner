import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Search, Clock, Users, Zap, Lock, TrendingUp, Filter,
} from "lucide-react";
import {
  PRE_BUILT_SCANNERS, PERSONA_LABELS, PERSONA_COLORS,
  DIFFICULTY_COLORS, formatCount, type ScannerPersona,
} from "@/data/mockData";
import { cn } from "@/lib/utils";

const PERSONA_TABS: { key: "all" | ScannerPersona; label: string; emoji: string }[] = [
  { key: "all", label: "All", emoji: "🔍" },
  { key: "intraday", label: "Intraday", emoji: "⚡" },
  { key: "btst", label: "BTST", emoji: "🌙" },
  { key: "swing", label: "Swing", emoji: "📈" },
  { key: "positional", label: "Positional", emoji: "🏦" },
  { key: "longterm", label: "Long-Term", emoji: "💎" },
];

export function ScannerLibraryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const activePersona = (searchParams.get("persona") ?? "all") as "all" | ScannerPersona;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const filtered = PRE_BUILT_SCANNERS.filter((s) => {
    const matchPersona = activePersona === "all" || s.persona === activePersona;
    const matchSearch = !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase());
    return matchPersona && matchSearch;
  });

  // Group by sub-category
  const grouped = filtered.reduce<Record<string, typeof filtered>>((acc, s) => {
    const key = s.subCategory;
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Pre-Built Scanners</h1>
          <p className="text-muted-foreground">
            {PRE_BUILT_SCANNERS.length} scanners across 5 trading styles — updated live during market hours
          </p>
        </div>
        <Link
          to="/app/scanners"
          className="text-sm font-medium text-primary hover:underline shrink-0"
        >
          Mobile app layout →
        </Link>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search scanners..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="w-4 h-4" />
          <span>{filtered.length} scanners</span>
        </div>
      </div>

      {/* Persona Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
        {PERSONA_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSearchParams(tab.key === "all" ? {} : { persona: tab.key })}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border",
              activePersona === tab.key
                ? "bg-primary text-white border-primary"
                : "bg-white text-foreground border-border hover:border-primary/40 hover:text-primary"
            )}
          >
            <span>{tab.emoji}</span>
            {tab.label}
            <span className={cn(
              "text-xs rounded-full px-1.5",
              activePersona === tab.key ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
            )}>
              {tab.key === "all" ? PRE_BUILT_SCANNERS.length : PRE_BUILT_SCANNERS.filter(s => s.persona === tab.key).length}
            </span>
          </button>
        ))}
      </div>

      {/* Plus upgrade nudge (mock basic user scenario) */}
      <div className="mb-8 rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Unlock Advanced Scanner Packs</p>
            <p className="text-xs text-muted-foreground">Darvas Box, Divergence, Piotroski, and more — exclusive to Plus</p>
          </div>
        </div>
        <Button size="sm" className="shrink-0 bg-gradient-to-r from-[#542087] to-[#7c3abf]">
          <Zap className="w-3.5 h-3.5 mr-1.5" />Upgrade
        </Button>
      </div>

      {/* Grouped Scanner Cards */}
      {Object.entries(grouped).map(([category, scanners]) => (
        <div key={category} className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold text-foreground">{category}</h2>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {scanners.length}
            </span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {scanners.map((scanner) => (
              <ScannerCard key={scanner.id} scanner={scanner} />
            ))}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">No scanners found</p>
          <p className="text-sm">Try adjusting your search or filter</p>
        </div>
      )}
    </div>
  );
}

function ScannerCard({ scanner }: { scanner: typeof PRE_BUILT_SCANNERS[0] }) {
  const isPlus = scanner.plan === "plus";

  return (
    <Link to={`/scanners/${scanner.id}`}>
      <Card className={cn(
        "h-full transition-all cursor-pointer group",
        isPlus
          ? "border-primary/20 hover:border-primary/40 hover:shadow-sm"
          : "hover:border-primary/30 hover:shadow-md"
      )}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge className={`text-[10px] px-1.5 py-0 h-4 border-0 font-medium ${PERSONA_COLORS[scanner.persona]}`}>
                {PERSONA_LABELS[scanner.persona]}
              </Badge>
              <Badge className={`text-[10px] px-1.5 py-0 h-4 border-0 ${DIFFICULTY_COLORS[scanner.difficulty]}`}>
                {scanner.difficulty}
              </Badge>
              {isPlus && (
                <Badge className="text-[10px] px-1.5 py-0 h-4 bg-gradient-to-r from-[#542087] to-[#7c3abf] text-white border-0">
                  <Zap className="w-2 h-2 mr-0.5" />PLUS
                </Badge>
              )}
            </div>
            {scanner.activeWindow && (
              <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded whitespace-nowrap">
                {scanner.activeWindow.label}
              </span>
            )}
          </div>

          <div className="flex items-start gap-2">
            <div className="flex-1">
              <h3 className={cn(
                "font-semibold text-sm mb-1 group-hover:text-primary transition-colors",
                isPlus ? "text-primary" : "text-foreground"
              )}>
                {isPlus && <Lock className="w-3 h-3 inline mr-1 opacity-60" />}
                {scanner.name}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{scanner.description}</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border/60">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-xs">
                <TrendingUp className="w-3 h-3 text-green-600" />
                <span className="font-semibold text-foreground">{scanner.resultCount}</span>
                <span className="text-muted-foreground">matches</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {scanner.lastUpdated}
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="w-3 h-3" />
              {formatCount(scanner.runCount)}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
