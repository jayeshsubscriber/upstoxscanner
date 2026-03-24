import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft, Heart, Copy, Share2, Bell, Shield,
  Users, Star, TrendingUp, TrendingDown, BarChart3,
  ChevronRight, Zap, UserPlus,
} from "lucide-react";
import {
  MARKETPLACE_SCREENERS, MOCK_SCAN_RESULTS, PERSONA_COLORS, PERSONA_LABELS,
  formatCount, formatVolume,
} from "@/data/mockData";
import { cn } from "@/lib/utils";

export function MarketplaceDetailPage() {
  const { id } = useParams();
  const screener = MARKETPLACE_SCREENERS.find(s => s.id === id);
  const [liked, setLiked] = useState(false);
  const [following, setFollowing] = useState(false);
  const [alertSet, setAlertSet] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  if (!screener) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Screener not found.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/marketplace"><ArrowLeft className="w-4 h-4 mr-2" />Back</Link>
        </Button>
      </div>
    );
  }

  const results = MOCK_SCAN_RESULTS.slice(0, 8);
  const otherByCreator = MARKETPLACE_SCREENERS.filter(s => s.creator.handle === screener.creator.handle && s.id !== id).slice(0, 2);

  const hitRateColor =
    screener.performance.badge === "high" ? "text-green-700 bg-green-50 border-green-200" :
    screener.performance.badge === "moderate" ? "text-yellow-700 bg-yellow-50 border-yellow-200" :
    "text-muted-foreground bg-muted border-border";

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link to="/marketplace" className="hover:text-primary flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />Marketplace
        </Link>
        <span>/</span>
        <span className="text-foreground line-clamp-1">{screener.name}</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardContent className="p-5">
              {/* Badges */}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                {screener.isEditorChoice && (
                  <Badge className="text-xs px-2 h-5 bg-amber-100 text-amber-700 border-0">
                    <Star className="w-3 h-3 mr-1 fill-current" />Editor's Choice
                  </Badge>
                )}
                <Badge className={`text-xs px-2 h-5 border-0 ${PERSONA_COLORS[screener.persona]}`}>
                  {PERSONA_LABELS[screener.persona]}
                </Badge>
              </div>

              <h1 className="text-xl font-bold text-foreground mb-2">{screener.name}</h1>
              <p className="text-sm text-muted-foreground mb-4">{screener.description}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {screener.tags.map(t => (
                  <span key={t} className="text-xs px-2 py-0.5 bg-muted rounded text-muted-foreground">{t}</span>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { label: "Likes", value: formatCount(screener.likes + (liked ? 1 : 0)), icon: Heart },
                  { label: "Uses", value: formatCount(screener.uses), icon: BarChart3 },
                  { label: "Copies", value: formatCount(screener.copies), icon: Copy },
                ].map(s => (
                  <div key={s.label} className="bg-muted/50 rounded-lg p-2 text-center">
                    <div className="text-lg font-bold text-foreground">{s.value}</div>
                    <div className="text-[10px] text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Performance badge */}
              <div className={`rounded-lg border p-3 mb-4 ${hitRateColor}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold">Historical Accuracy</span>
                  {screener.performance.badge === "high" && <TrendingUp className="w-4 h-4" />}
                </div>
                {screener.performance.badge === "new" ? (
                  <p className="text-xs">Not enough data yet ({screener.performance.sampleSize} matches)</p>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{screener.performance.hitRate}%</div>
                    <p className="text-xs mt-0.5">
                      of last {screener.performance.sampleSize} matches moved up 3%+ within 5 days
                    </p>
                    <p className="text-[10px] mt-1 opacity-70">Past performance ≠ future results</p>
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 mb-3">
                <Button
                  variant={liked ? "default" : "outline"}
                  size="sm"
                  className={cn("flex-1", liked && "bg-red-500 hover:bg-red-600 border-red-500")}
                  onClick={() => setLiked(!liked)}
                >
                  <Heart className={cn("w-3.5 h-3.5 mr-1.5", liked && "fill-white")} />
                  {liked ? "Liked" : "Like"}
                </Button>
                <Button
                  variant={alertSet ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => setAlertSet(!alertSet)}
                >
                  <Bell className="w-3.5 h-3.5 mr-1.5" />
                  {alertSet ? "Alert ✓" : "Alert"}
                </Button>
                <Button variant="ghost" size="sm">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
              <Button variant="outline" size="sm" className="w-full gap-1.5 border-primary/30 text-primary hover:bg-primary/5">
                <Copy className="w-3.5 h-3.5" />Copy & Customize in DIY Builder
              </Button>
            </CardContent>
          </Card>

          {/* Creator Card */}
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Creator</p>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                  {screener.creator.displayName[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-sm">{screener.creator.displayName}</span>
                    {screener.creator.verified && (
                      <Shield className="w-3.5 h-3.5 text-primary fill-primary/20" />
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                    <span>@{screener.creator.handle}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />{formatCount(screener.creator.followers)} followers
                    </span>
                  </div>
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
                <Button asChild size="sm" variant="ghost">
                  <Link to={`/profile/${screener.creator.handle}`}>
                    View Profile <ChevronRight className="w-3 h-3 ml-1" />
                  </Link>
                </Button>
              </div>

              {otherByCreator.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border/60">
                  <p className="text-xs text-muted-foreground mb-2">More by this creator</p>
                  {otherByCreator.map(s => (
                    <Link key={s.id} to={`/marketplace/${s.id}`} className="block text-xs text-primary hover:underline py-0.5">
                      {s.name}
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Conditions */}
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Conditions</p>
              <code className="text-xs text-foreground bg-muted p-3 rounded block leading-relaxed whitespace-pre-wrap">
                {screener.conditions}
              </code>
            </CardContent>
          </Card>
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-2">
          <Card>
            <div className="p-4 border-b border-border flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="font-semibold text-base">
                  {results.length} Stocks Matched
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Updated live · Nifty 500
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="text-xs h-8 gap-1.5">
                  <Zap className="w-3.5 h-3.5" />Run Now
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/40 border-b border-border">
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground w-8">#</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Stock</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground">Price (₹)</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground">1D Chg%</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground">Volume</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Signal</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {results.map((row) => (
                    <tr key={row.symbol} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-4 py-3 text-xs text-muted-foreground">{row.rank}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-sm">{row.symbol}</div>
                        <div className="text-xs text-muted-foreground">{row.company}</div>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-sm">
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
                        <div className="text-xs text-muted-foreground">{(row.volume / row.volumeAvg).toFixed(1)}x avg</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-muted-foreground">{row.signalReason}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center gap-1.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="sm" variant="outline" className="h-7 text-xs px-2">+ Watch</Button>
                          <Button size="sm" className="h-7 text-xs px-3 bg-primary">Trade</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-border bg-muted/20 text-xs text-muted-foreground flex items-center justify-between">
              <span>Showing {results.length} results · Community screener</span>
              <span className="text-[10px]">For educational purposes only. Not investment advice.</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
