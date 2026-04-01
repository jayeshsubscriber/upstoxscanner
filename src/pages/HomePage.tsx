import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight, TrendingUp, Zap, Bell, Users, Shield,
  ChevronRight, BarChart2, Star, BookOpen,
} from "lucide-react";
import { MARKETPLACE_SCREENERS, formatCount } from "@/data/mockData";
import { AppScannersHubMarketSections } from "@/components/scanner/AppScannersHubMarketSections";

const TOP_MARKETPLACE = MARKETPLACE_SCREENERS.filter(s => s.isEditorChoice || s.isFeatured).slice(0, 3);

const STATS = [
  { value: "50+", label: "Pre-built Scanners" },
  { value: "100+", label: "Technical Indicators" },
  { value: "4000+", label: "Stocks Covered" },
  { value: "Live", label: "Real-time Data" },
];

export function HomePage() {
  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero */}
      <section className="py-10 sm:py-12 text-center">
        <Badge className="mb-4 bg-primary/10 text-primary border-0 px-3 py-1 text-xs sm:text-sm font-medium">
          <Zap className="w-3.5 h-3.5 mr-1.5" />
          Real-time Stock Scanners for Indian Markets
        </Badge>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-4">
          Find your next trade<br />
          <span className="text-primary">in seconds.</span>
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-3xl mx-auto mb-6">
          50+ ready scanners, 100+ indicators, real-time alerts, and instant trade execution.
        </p>
        <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
          <Button asChild size="lg" className="gap-2 h-11 px-7 text-sm sm:text-base">
            <Link to="/scanners">
              <TrendingUp className="w-5 h-5" />
              Explore Scanners
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2 h-11 px-7 text-sm sm:text-base border-primary/30 text-primary hover:bg-primary/5">
            <Link to="/diy">
              <BarChart2 className="w-4 h-4" />
              Build My Screener
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary">{s.value}</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="mb-10 w-full py-3 sm:py-5">
        <AppScannersHubMarketSections />
      </div>

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
