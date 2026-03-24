import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight, TrendingUp, Zap, Bell, Users, Shield,
  ChevronRight, BarChart2, Star, Clock, BookOpen,
} from "lucide-react";
import {
  PRE_BUILT_SCANNERS, MARKETPLACE_SCREENERS, MOCK_SCAN_RESULTS,
  PERSONA_COLORS, PERSONA_LABELS, formatCount, type ScannerPersona,
} from "@/data/mockData";

const TRENDING_SCANNERS = PRE_BUILT_SCANNERS.filter(s => s.plan === "free").slice(0, 6);
const TOP_MARKETPLACE = MARKETPLACE_SCREENERS.filter(s => s.isEditorChoice || s.isFeatured).slice(0, 3);

const PERSONA_META: { key: ScannerPersona; label: string; icon: string; desc: string; color: string }[] = [
  { key: "intraday", label: "Intraday", icon: "⚡", desc: "Gap-ups, ORB, VWAP, Volume shockers", color: "border-orange-200 bg-orange-50 hover:bg-orange-100" },
  { key: "btst", label: "BTST", icon: "🌙", desc: "Closing range, 3:25 PM momentum, NR7", color: "border-blue-200 bg-blue-50 hover:bg-blue-100" },
  { key: "swing", label: "Swing", icon: "📈", desc: "52W breakout, BB squeeze, EMA bounce", color: "border-green-200 bg-green-50 hover:bg-green-100" },
  { key: "positional", label: "Positional", icon: "🏦", desc: "FII buying, sector leaders, RS screens", color: "border-purple-200 bg-purple-50 hover:bg-purple-100" },
  { key: "longterm", label: "Long-Term", icon: "💎", desc: "Value, dividends, quality compounders", color: "border-teal-200 bg-teal-50 hover:bg-teal-100" },
];

const STATS = [
  { value: "50+", label: "Pre-built Scanners" },
  { value: "100+", label: "Technical Indicators" },
  { value: "4000+", label: "Stocks Covered" },
  { value: "Live", label: "Real-time Data" },
];

export function HomePage() {
  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
      {/* Hero */}
      <section className="py-16 sm:py-24 text-center">
        <Badge className="mb-6 bg-primary/10 text-primary border-0 px-4 py-1.5 text-sm font-medium">
          <Zap className="w-3.5 h-3.5 mr-1.5" />
          Real-time Stock Scanners for Indian Markets
        </Badge>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
          Find your next trade<br />
          <span className="text-primary">in seconds.</span>
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          50+ pre-built scanners for every trader. Build custom screeners with 100+ indicators.
          Get real-time alerts. Trade directly from results.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg" className="gap-2 h-12 px-8 text-base">
            <Link to="/scanners">
              <TrendingUp className="w-5 h-5" />
              Explore Scanners
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2 h-12 px-8 text-base border-primary/30 text-primary hover:bg-primary/5">
            <Link to="/diy">
              <BarChart2 className="w-4 h-4" />
              Build My Screener
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-bold text-primary">{s.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Live Market Ticker (Mock) */}
      <section className="mb-12">
        <div className="rounded-xl border border-border bg-muted/30 p-4 overflow-hidden">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Live Market Signals</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {MOCK_SCAN_RESULTS.slice(0, 4).map((r) => (
              <div key={r.symbol} className="bg-white rounded-lg p-3 border border-border">
                <div className="flex items-start justify-between gap-1">
                  <span className="font-bold text-sm text-foreground">{r.symbol}</span>
                  <span className={`text-xs font-semibold ${r.change1d >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {r.change1d >= 0 ? "+" : ""}{r.change1d.toFixed(2)}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{r.signalReason}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scanner Categories */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Scan by Trader Type</h2>
            <p className="text-muted-foreground text-sm mt-1">Pre-built scanners for every trading style</p>
          </div>
          <Button asChild variant="ghost" size="sm" className="gap-1 text-primary">
            <Link to="/scanners">View all <ChevronRight className="w-4 h-4" /></Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {PERSONA_META.map((p) => (
            <Link
              key={p.key}
              to={`/scanners?persona=${p.key}`}
              className={`rounded-xl border p-4 cursor-pointer transition-all hover:shadow-sm ${p.color}`}
            >
              <div className="text-2xl mb-2">{p.icon}</div>
              <div className="font-semibold text-sm text-foreground">{p.label}</div>
              <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.desc}</div>
              <div className="text-xs text-primary font-medium mt-2 flex items-center gap-1">
                {PRE_BUILT_SCANNERS.filter(s => s.persona === p.key).length} scanners
                <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending Scanners */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Trending Today</h2>
            <p className="text-muted-foreground text-sm mt-1">Most used scanners in the last 24 hours</p>
          </div>
          <Button asChild variant="ghost" size="sm" className="gap-1 text-primary">
            <Link to="/scanners">View all <ChevronRight className="w-4 h-4" /></Link>
          </Button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TRENDING_SCANNERS.map((scanner) => (
            <Link key={scanner.id} to={`/scanners/${scanner.id}`}>
              <Card className="h-full hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={`text-[10px] px-2 py-0 h-5 border-0 font-medium ${PERSONA_COLORS[scanner.persona]}`}>
                        {PERSONA_LABELS[scanner.persona]}
                      </Badge>
                      {scanner.plan === "plus" && (
                        <Badge className="text-[10px] px-2 py-0 h-5 bg-gradient-to-r from-[#542087] to-[#7c3abf] text-white border-0">
                          <Zap className="w-2.5 h-2.5 mr-0.5" />PLUS
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground text-xs shrink-0">
                      <Clock className="w-3 h-3" />
                      {scanner.lastUpdated}
                    </div>
                  </div>
                  <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors mb-1">
                    {scanner.name}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{scanner.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">{scanner.resultCount}</span> matches
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="w-3 h-3" />
                      {formatCount(scanner.runCount)} runs
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Marketplace Teaser */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Community Marketplace</h2>
            <p className="text-muted-foreground text-sm mt-1">Screeners built and shared by traders like you</p>
          </div>
          <Button asChild variant="ghost" size="sm" className="gap-1 text-primary">
            <Link to="/marketplace">Explore <ChevronRight className="w-4 h-4" /></Link>
          </Button>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {TOP_MARKETPLACE.map((s) => (
            <Link key={s.id} to={`/marketplace/${s.id}`}>
              <Card className="h-full hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    {s.isEditorChoice && (
                      <Badge className="text-[10px] px-2 py-0 h-5 bg-amber-100 text-amber-700 border-0">
                        <Star className="w-2.5 h-2.5 mr-0.5 fill-current" />Editor's Choice
                      </Badge>
                    )}
                    {s.isFeatured && (
                      <Badge className="text-[10px] px-2 py-0 h-5 bg-primary/10 text-primary border-0">
                        Featured
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors mb-1">
                    {s.name}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{s.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                        {s.creator.displayName[0]}
                      </div>
                      <span className="text-xs text-muted-foreground">@{s.creator.handle}</span>
                      {s.creator.verified && (
                        <Shield className="w-3 h-3 text-primary fill-primary/20" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>❤️ {formatCount(s.likes)}</span>
                      <span>{formatCount(s.uses)} uses</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="mb-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Bell, title: "Real-Time Alerts", desc: "Get notified on WhatsApp, email, or push when your conditions are met.", color: "text-orange-500" },
            { icon: BookOpen, title: "Learn While You Scan", desc: "Every scanner comes with a strategy guide — entry, stop-loss, hold duration.", color: "text-blue-500" },
            { icon: Users, title: "Community Marketplace", desc: "Discover and share screeners. Follow top traders and copy their setups.", color: "text-green-500" },
            { icon: Zap, title: "1-Click Trade", desc: "Found a stock? Trade it instantly on Upstox — no platform-hopping.", color: "text-purple-500" },
          ].map((f) => (
            <Card key={f.title} className="border-border">
              <CardContent className="p-5">
                <div className={`w-9 h-9 rounded-lg bg-muted flex items-center justify-center mb-3`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="font-semibold text-sm text-foreground mb-1">{f.title}</h3>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="mb-16">
        <div className="rounded-2xl bg-gradient-to-r from-primary to-[#7c3abf] p-8 sm:p-12 text-white text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Unlock the full platform</h2>
          <p className="text-white/80 mb-6 max-w-xl mx-auto">
            Upgrade to Upstox Plus for advanced indicators, unlimited alerts, All NSE universe scanning, and exclusive scanner packs.
          </p>
          <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold px-8">
            <Zap className="w-4 h-4 mr-2" />
            Upgrade to Plus
          </Button>
        </div>
      </section>
    </div>
  );
}
