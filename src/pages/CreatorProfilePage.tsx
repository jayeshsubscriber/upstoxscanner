import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Shield, Heart, BarChart3, Copy, Eye,
  UserPlus, Share2, TrendingUp, Trophy,
  CalendarDays,
} from "lucide-react";
import {
  MARKETPLACE_SCREENERS,
  formatCount,
} from "@/data/mockData";
import { cn } from "@/lib/utils";

const PROFILE_DATA: Record<string, {
  displayName: string;
  bio: string;
  verified: boolean;
  followers: number;
  following: number;
  joinedDate: string;
  badge?: string;
}> = {
  trader_vikram: {
    displayName: "Vikram Mehta",
    bio: "Intraday & BTST trader. 7 years in markets. Sharing what actually works.",
    verified: true, followers: 2840, following: 124, joinedDate: "Aug 2025",
    badge: "Top Creator — Feb 2026",
  },
  quant_priya: {
    displayName: "Priya Sharma",
    bio: "Quant trader. Python + TradingView. Swing setups with edge.",
    verified: true, followers: 5120, following: 89, joinedDate: "Sep 2025",
    badge: "Top Creator — Mar 2026",
  },
  invest_ananya: {
    displayName: "Ananya Krishnan",
    bio: "Value investor. Long-term compounder hunter.",
    verified: true, followers: 3240, following: 56, joinedDate: "May 2025",
  },
  sectorpro: {
    displayName: "Deepak Iyer",
    bio: "Sector rotation expert | Positional trader.",
    verified: true, followers: 1680, following: 42, joinedDate: "Aug 2025",
  },
  btst_king: {
    displayName: "Rahul Trades",
    bio: "BTST specialist | Closing bell scanner.",
    verified: false, followers: 890, following: 67, joinedDate: "Sep 2025",
  },
  rsi_master: {
    displayName: "Arjun Patel",
    bio: "RSI divergence hunter | Swing trader.",
    verified: false, followers: 420, following: 34, joinedDate: "Nov 2025",
  },
  newtrader99: {
    displayName: "Sneha Gupta",
    bio: "Learning to build scanners!",
    verified: false, followers: 45, following: 12, joinedDate: "Mar 2026",
  },
  momentum_raj: {
    displayName: "Raj Kapoor",
    bio: "Momentum breakout trader | 15+ yrs experience.",
    verified: true, followers: 4200, following: 78, joinedDate: "Apr 2025",
    badge: "Top Creator — Jan 2026",
  },
  option_queen: {
    displayName: "Meera Nair",
    bio: "Options strategist | Volatility plays.",
    verified: true, followers: 6100, following: 45, joinedDate: "Mar 2025",
    badge: "Top Creator — Mar 2026",
  },
  chart_guru: {
    displayName: "Suresh Babu",
    bio: "Price action trader | Pattern recognition.",
    verified: false, followers: 1120, following: 92, joinedDate: "Oct 2025",
  },
  aarav_trades: {
    displayName: "Aarav Shah",
    bio: "Swing + positional trader. RSI divergence + breakout setups.",
    verified: false, followers: 312, following: 78, joinedDate: "Jan 2026",
  },
};

// Mock additional screeners for publishers who don't have marketplace entries
const MOCK_EXTRA_SCREENERS = [
  { id: "mock-1", name: "Nifty Midcap Momentum", description: "Momentum plays in midcap space with volume confirmation", likes: 342, views: 4500, uses: 1200, copies: 89, createdAt: "2026-03-28" },
  { id: "mock-2", name: "Bank Nifty Breakout Alert", description: "Tracking breakouts in banking stocks above R1 pivot", likes: 189, views: 2800, uses: 780, copies: 45, createdAt: "2026-03-20" },
  { id: "mock-3", name: "IT Sector Strength Scanner", description: "Finding strongest IT stocks by relative strength vs Nifty IT", likes: 267, views: 3200, uses: 920, copies: 67, createdAt: "2026-03-15" },
  { id: "mock-4", name: "Options High IV Scanner", description: "Spotting options with implied volatility above 50th percentile", likes: 456, views: 6100, uses: 1800, copies: 134, createdAt: "2026-03-10" },
  { id: "mock-5", name: "Dividend Yield Screener", description: "High dividend yield stocks with consistent payout history", likes: 178, views: 2100, uses: 560, copies: 34, createdAt: "2026-02-28" },
];

const LEADERBOARD = [
  { rank: 1, handle: "option_queen", name: "Meera Nair", uses: 28400, likes: 5200, badge: "🥇" },
  { rank: 2, handle: "quant_priya", name: "Priya Sharma", uses: 22100, likes: 4280, badge: "🥈" },
  { rank: 3, handle: "momentum_raj", name: "Raj Kapoor", uses: 15600, likes: 3800, badge: "🥉" },
  { rank: 4, handle: "trader_vikram", name: "Vikram Mehta", uses: 8940, likes: 2190, badge: "" },
  { rank: 5, handle: "invest_ananya", name: "Ananya Krishnan", uses: 6200, likes: 2640, badge: "" },
];

export function CreatorProfilePage() {
  const { username } = useParams();
  const [following, setFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<"screeners" | "leaderboard">("screeners");

  const profile = PROFILE_DATA[username ?? ""] ?? {
    displayName: username ?? "Unknown",
    bio: "Trader on Upstox Scanners",
    verified: false, followers: 0, following: 0, joinedDate: "2026",
  };

  const myScreeners = MARKETPLACE_SCREENERS.filter(
    (s) => s.creator.handle === username
  );

  // Pad with mock extra screeners if too few
  const extraScreeners = myScreeners.length < 3
    ? MOCK_EXTRA_SCREENERS.slice(0, 3 - myScreeners.length)
    : [];

  const totalLikes = myScreeners.reduce((sum, s) => sum + s.likes, 0) + extraScreeners.reduce((s, e) => s + e.likes, 0);
  const totalUses = myScreeners.reduce((sum, s) => sum + s.uses, 0) + extraScreeners.reduce((s, e) => s + e.uses, 0);
  const totalViews = myScreeners.reduce((sum, s) => sum + s.views, 0) + extraScreeners.reduce((s, e) => s + e.views, 0);

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
      <div className="grid lg:grid-cols-4 gap-8">
        {/* Left: Profile info */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardContent className="p-5 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-[#7c3abf] flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
                {profile.displayName[0]}
              </div>
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <h2 className="font-bold text-lg text-foreground">{profile.displayName}</h2>
                {profile.verified && <Shield className="w-4 h-4 text-primary fill-primary/20" />}
              </div>
              <p className="text-sm text-muted-foreground mb-1">@{username}</p>
              <p className="text-xs text-muted-foreground mb-3">Joined {profile.joinedDate}</p>

              {profile.badge && (
                <Badge className="mb-3 bg-amber-100 text-amber-700 border-0 text-xs">
                  <Trophy className="w-3 h-3 mr-1" />{profile.badge}
                </Badge>
              )}

              <p className="text-sm text-muted-foreground mb-4 text-left">{profile.bio}</p>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-muted/50 rounded-lg p-2.5 text-center">
                  <div className="text-xl font-bold text-foreground">{formatCount(profile.followers + (following ? 1 : 0))}</div>
                  <div className="text-[10px] text-muted-foreground">Followers</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-2.5 text-center">
                  <div className="text-xl font-bold text-foreground">{myScreeners.length + extraScreeners.length}</div>
                  <div className="text-[10px] text-muted-foreground">Screeners</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={following ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setFollowing(!following)}
                >
                  <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                  {following ? "Following ✓" : "Follow"}
                </Button>
                <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Creator Impact</p>
              {[
                { icon: Heart, label: "Total Likes", value: formatCount(totalLikes), color: "text-red-500" },
                { icon: BarChart3, label: "Total Uses", value: formatCount(totalUses), color: "text-blue-500" },
                { icon: Eye, label: "Total Views", value: formatCount(totalViews), color: "text-purple-500" },
                { icon: Copy, label: "Total Copies", value: formatCount(myScreeners.reduce((s, sc) => s + sc.copies, 0)), color: "text-green-500" },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center justify-between py-1.5 border-b border-border/40 last:border-0">
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />{stat.label}
                  </span>
                  <span className="text-sm font-semibold text-foreground">{stat.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right: Screeners + Leaderboard */}
        <div className="lg:col-span-3">
          <div className="flex gap-1 mb-6 bg-muted/50 p-1 rounded-lg w-fit">
            {(["screeners", "leaderboard"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-colors",
                  activeTab === tab ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab === "screeners" ? <BarChart3 className="w-3.5 h-3.5" /> : <Trophy className="w-3.5 h-3.5" />}
                {tab === "screeners" ? "Published Screeners" : "Monthly Leaderboard"}
              </button>
            ))}
          </div>

          {activeTab === "screeners" ? (
            (myScreeners.length === 0 && extraScreeners.length === 0) ? (
              <div className="text-center py-16 text-muted-foreground">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="font-medium">No published screeners yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Real marketplace screeners */}
                {myScreeners.map((s) => (
                  <Link key={s.id} to={`/marketplace/${s.id}`}>
                    <div className="flex items-start gap-4 p-4 rounded-lg border border-border hover:border-primary/30 hover:shadow-sm transition-all group">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                        {s.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                          {s.name}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{s.description}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CalendarDays className="w-3 h-3" />
                            {new Date(s.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
                        <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{formatCount(s.likes)}</span>
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{formatCount(s.views)}</span>
                        <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" />{formatCount(s.uses)} uses</span>
                      </div>
                    </div>
                  </Link>
                ))}

                {/* Mock extra screeners for publishers with few entries */}
                {extraScreeners.map((s) => (
                  <div key={s.id} className="flex items-start gap-4 p-4 rounded-lg border border-border hover:border-primary/30 hover:shadow-sm transition-all group cursor-pointer">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                      {s.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                        {s.name}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{s.description}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="w-3 h-3" />
                          {new Date(s.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
                      <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{formatCount(s.likes)}</span>
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{formatCount(s.views)}</span>
                      <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" />{formatCount(s.uses)} uses</span>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <Card>
              <div className="p-4 border-b border-border">
                <h2 className="font-semibold text-base flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" />Top Creators — March 2026
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">Ranked by total screener uses this month</p>
              </div>
              <div className="divide-y divide-border/60">
                {LEADERBOARD.map((entry) => (
                  <Link key={entry.rank} to={`/profile/${entry.handle}`} className="flex items-center gap-4 px-4 py-3.5 hover:bg-muted/30 transition-colors">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0",
                      entry.rank <= 3 ? "bg-amber-100 text-amber-700" : "bg-muted text-muted-foreground"
                    )}>
                      {entry.badge || `#${entry.rank}`}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                      {entry.name[0]}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-foreground">{entry.name}</p>
                      <p className="text-xs text-muted-foreground">@{entry.handle}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">{formatCount(entry.uses)}</p>
                      <p className="text-xs text-muted-foreground">uses</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground flex items-center gap-1">
                        <Heart className="w-3 h-3 text-red-400" />{formatCount(entry.likes)}
                      </p>
                      <p className="text-xs text-muted-foreground">likes</p>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="p-3 text-center border-t border-border/60">
                <p className="text-xs text-muted-foreground">Leaderboard resets on April 1st</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
