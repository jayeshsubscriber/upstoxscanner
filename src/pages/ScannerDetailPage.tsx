import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Bell, ArrowLeft, ChevronDown, ChevronUp, TrendingUp, TrendingDown,
  Clock, Users, Zap, Lock, Info, BookOpen, Target, ShieldAlert,
  Timer, BarChart3, RefreshCw, Star, Share2, Download,
} from "lucide-react";
import {
  PRE_BUILT_SCANNERS, MOCK_SCAN_RESULTS, PERSONA_COLORS, PERSONA_LABELS,
  DIFFICULTY_COLORS, formatVolume, formatCount,
} from "@/data/mockData";
import { cn } from "@/lib/utils";

export function ScannerDetailPage() {
  const { id } = useParams();
  const scanner = PRE_BUILT_SCANNERS.find((s) => s.id === id);
  const [educationOpen, setEducationOpen] = useState(false);
  const [alertSet, setAlertSet] = useState(false);
  const [sortBy, setSortBy] = useState<"rank" | "change" | "volume">("rank");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

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

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Scanner info + education */}
        <div className="lg:col-span-1 space-y-4">
          {/* Scanner header card */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <Badge className={`text-xs px-2 h-5 border-0 ${PERSONA_COLORS[scanner.persona]}`}>
                  {PERSONA_LABELS[scanner.persona]}
                </Badge>
                <Badge className={`text-xs px-2 h-5 border-0 ${DIFFICULTY_COLORS[scanner.difficulty]}`}>
                  {scanner.difficulty}
                </Badge>
                {isPlus && (
                  <Badge className="text-xs px-2 h-5 bg-gradient-to-r from-[#542087] to-[#7c3abf] text-white border-0">
                    <Zap className="w-2.5 h-2.5 mr-1" />PLUS
                  </Badge>
                )}
              </div>
              <h1 className="text-xl font-bold text-foreground mb-2">{scanner.name}</h1>
              <p className="text-sm text-muted-foreground mb-4">{scanner.description}</p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-primary">{scanner.resultCount}</div>
                  <div className="text-xs text-muted-foreground">Matches today</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-foreground">{formatCount(scanner.runCount)}</div>
                  <div className="text-xs text-muted-foreground">Total runs</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                <Clock className="w-3.5 h-3.5" />
                Last updated: {scanner.lastUpdated}
                <span className="ml-auto flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {formatCount(scanner.viewCount)} views
                </span>
              </div>

              {scanner.activeWindow && (
                <div className="flex items-center gap-2 text-xs bg-orange-50 text-orange-700 rounded-lg p-2.5 mb-4">
                  <Timer className="w-3.5 h-3.5 shrink-0" />
                  <span>{scanner.activeWindow.label}</span>
                </div>
              )}

              <div className="flex gap-2">
                {isPlus ? (
                  <Button className="flex-1 bg-gradient-to-r from-[#542087] to-[#7c3abf]" size="sm">
                    <Lock className="w-3.5 h-3.5 mr-1.5" />Unlock with Plus
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={() => setAlertSet(!alertSet)}
                      variant={alertSet ? "default" : "outline"}
                      size="sm"
                      className={cn("flex-1", alertSet && "bg-primary")}
                    >
                      <Bell className="w-3.5 h-3.5 mr-1.5" />
                      {alertSet ? "Alert Set ✓" : "Set Alert"}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Education module */}
          <Card>
            <CardHeader className="p-4 pb-0">
              <button
                onClick={() => setEducationOpen(!educationOpen)}
                className="flex items-center justify-between w-full text-left"
              >
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  Learn This Strategy
                </CardTitle>
                {educationOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>
            </CardHeader>
            {educationOpen && (
              <CardContent className="p-4 pt-3 space-y-3">
                <EducationItem icon={Info} label="What is it?" text={scanner.education.what} />
                <EducationItem icon={BarChart3} label="Why it works" text={scanner.education.why} />
                <EducationItem icon={Target} label="Entry" text={scanner.education.entry} />
                <EducationItem icon={ShieldAlert} label="Stop-Loss" text={scanner.education.stopLoss} />
                <EducationItem icon={Timer} label="Hold Duration" text={scanner.education.holdDuration} />
                <EducationItem icon={Star} label="Risk:Reward" text={scanner.education.riskReward} />
                <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Was this helpful?</p>
                  <div className="flex gap-2">
                    <button className="text-xs px-2 py-1 rounded bg-green-50 text-green-700 hover:bg-green-100">👍 Yes</button>
                    <button className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground hover:bg-border">👎 No</button>
                  </div>
                </div>
              </CardContent>
            )}
            {!educationOpen && (
              <CardContent className="p-4 pt-2">
                <button onClick={() => setEducationOpen(true)} className="text-xs text-primary hover:underline flex items-center gap-1">
                  View strategy guide <ChevronDown className="w-3 h-3" />
                </button>
              </CardContent>
            )}
          </Card>

          {/* Indicators used */}
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Indicators Used</p>
              <div className="flex flex-wrap gap-1.5">
                {scanner.indicators.map((ind) => (
                  <Badge key={ind} variant="secondary" className="text-xs px-2 py-0.5">
                    {ind}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Timeframe: <span className="font-medium text-foreground">{scanner.timeframe}</span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right: Results table */}
        <div className="lg:col-span-2">
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
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
                      <Download className="w-3.5 h-3.5" />Export CSV
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
                      <RefreshCw className="w-3.5 h-3.5" />Refresh
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>

            {isPlus ? (
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Plus Plan Required</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                  This scanner is part of the Advanced Pack, exclusive to Upstox Plus subscribers.
                </p>
                <Button className="bg-gradient-to-r from-[#542087] to-[#7c3abf]">
                  <Zap className="w-4 h-4 mr-2" />Upgrade to Plus
                </Button>
                <p className="text-xs text-muted-foreground mt-3">
                  The education module above is free for all users
                </p>
              </CardContent>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
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
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground min-w-[180px]">Signal Reason</th>
                        <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {sorted.map((row) => (
                        <tr key={row.symbol} className="hover:bg-muted/30 transition-colors group">
                          <td className="px-4 py-3 text-xs text-muted-foreground">{row.rank}</td>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-sm text-foreground">{row.symbol}</div>
                            <div className="text-xs text-muted-foreground">{row.company}</div>
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
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                              <span className="text-xs text-muted-foreground">{row.signalReason}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center gap-1.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button size="sm" variant="outline" className="h-7 text-xs px-2">
                                + Watch
                              </Button>
                              <Button size="sm" className="h-7 text-xs px-3 bg-primary">
                                Trade
                              </Button>
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
