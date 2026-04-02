import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft, Heart, Share2, Bell, Shield,
  Zap, Filter, Download,
  Edit3, Plus, FileJson, FileSpreadsheet, FileText,
  X, Eye, Smartphone, Mail, BellRing,
} from "lucide-react";
import {
  MARKETPLACE_SCREENERS, MOCK_SCAN_RESULTS,
  formatCount, formatVolume,
} from "@/data/mockData";
import { cn } from "@/lib/utils";

export function MarketplaceDetailPage() {
  const { id } = useParams();
  const screener = MARKETPLACE_SCREENERS.find((s) => s.id === id);
  const [liked, setLiked] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showAlertPopup, setShowAlertPopup] = useState(false);
  const [alertChannels, setAlertChannels] = useState({ inApp: true, email: false, push: false });
  const [filterText, setFilterText] = useState("");

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

  const allResults = MOCK_SCAN_RESULTS;
  const results = filterText
    ? allResults.filter(
        (r) =>
          r.symbol.toLowerCase().includes(filterText.toLowerCase()) ||
          r.company.toLowerCase().includes(filterText.toLowerCase())
      )
    : allResults;

  const alertIsSet = alertChannels.inApp || alertChannels.email || alertChannels.push;

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Link to="/marketplace" className="hover:text-primary flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />Marketplace
        </Link>
        <span>/</span>
        <span className="text-foreground line-clamp-1">{screener.name}</span>
      </div>

      {/* ── Header bar: all meta info in one row like scanx ── */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h1 className="text-xl font-bold text-foreground">{screener.name}</h1>
            <span className="text-xs text-muted-foreground">
              by{" "}
              <Link to={`/profile/${screener.creator.handle}`} className="text-primary hover:underline">
                @{screener.creator.handle}
              </Link>
              {screener.creator.verified && <Shield className="w-3 h-3 text-primary inline ml-0.5 -mt-0.5" />}
            </span>
          </div>
          {screener.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{screener.description}</p>
          )}
        </div>

        {/* Right: stats + actions inline */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Eye className="w-3.5 h-3.5" />{formatCount(screener.views)}
          </div>
          <button
            onClick={() => setLiked(!liked)}
            className={cn(
              "flex items-center gap-1 text-xs transition-colors",
              liked ? "text-red-500" : "text-muted-foreground hover:text-red-500"
            )}
          >
            <Heart className={cn("w-3.5 h-3.5", liked && "fill-current")} />
            {formatCount(screener.likes + (liked ? 1 : 0))}
          </button>
          <Button size="sm" variant="outline" className="text-xs h-8">
            <Share2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            asChild
            size="sm"
            variant="outline"
            className="text-xs h-8 gap-1 border-primary/30 text-primary hover:bg-primary/5"
          >
            <Link to="/diy">
              <Edit3 className="w-3.5 h-3.5" />Modify
            </Link>
          </Button>
        </div>
      </div>

      {/* Conditions inline (collapsed) */}
      <div className="mb-4 rounded-lg border border-border bg-muted/20 p-3">
        <code className="text-xs text-foreground leading-relaxed whitespace-pre-wrap font-mono">
          {screener.conditions.split(" AND ").map((cond, i, arr) => (
            <span key={i}>
              <span className="text-primary font-medium">{cond.trim()}</span>
              {i < arr.length - 1 && <span className="text-muted-foreground"> AND </span>}
            </span>
          ))}
        </code>
      </div>

      {/* Action bar: filter + export + alert */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {/* Filter */}
        <div className="relative flex-1 max-w-xs">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filter stocks..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full h-8 pl-9 pr-3 text-sm rounded-md border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        {/* Export */}
        <div className="relative">
          <Button size="sm" variant="outline" className="text-xs h-8 gap-1.5" onClick={() => setShowExportMenu(!showExportMenu)}>
            <Download className="w-3.5 h-3.5" />Export
          </Button>
          {showExportMenu && (
            <div className="absolute top-full mt-1 right-0 z-10 bg-white border border-border rounded-lg shadow-lg py-1 min-w-[140px]">
              <button className="w-full text-left px-3 py-2 text-xs hover:bg-muted flex items-center gap-2" onClick={() => setShowExportMenu(false)}>
                <FileSpreadsheet className="w-3.5 h-3.5 text-green-600" />Export as Excel
              </button>
              <button className="w-full text-left px-3 py-2 text-xs hover:bg-muted flex items-center gap-2" onClick={() => setShowExportMenu(false)}>
                <FileJson className="w-3.5 h-3.5 text-blue-600" />Export as JSON
              </button>
              <button className="w-full text-left px-3 py-2 text-xs hover:bg-muted flex items-center gap-2" onClick={() => setShowExportMenu(false)}>
                <FileText className="w-3.5 h-3.5 text-orange-600" />Export as XML
              </button>
              <button className="w-full text-left px-3 py-2 text-xs hover:bg-muted flex items-center gap-2" onClick={() => setShowExportMenu(false)}>
                <FileText className="w-3.5 h-3.5 text-muted-foreground" />Export as CSV
              </button>
            </div>
          )}
        </div>

        {/* Alert with popup */}
        <div className="relative">
          <Button
            size="sm"
            variant={alertIsSet ? "default" : "outline"}
            className="text-xs h-8 gap-1.5"
            onClick={() => setShowAlertPopup(!showAlertPopup)}
          >
            <Bell className="w-3.5 h-3.5" />
            {alertIsSet ? "Alert Set" : "Set Alert"}
          </Button>
          {showAlertPopup && (
            <div className="absolute top-full mt-1 right-0 z-20 bg-white border border-border rounded-lg shadow-lg w-[280px]">
              <div className="p-3 border-b border-border">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-foreground">Alert Channels</span>
                  <button onClick={() => setShowAlertPopup(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">Tell me when new stocks match</p>
              </div>
              <div className="divide-y divide-border">
                <label className="flex items-center justify-between px-3 py-3 cursor-pointer hover:bg-muted/30">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">In-app</p>
                      <p className="text-[11px] text-muted-foreground">Inside Upstox Scanners</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={alertChannels.inApp}
                    onChange={(e) => setAlertChannels((p) => ({ ...p, inApp: e.target.checked }))}
                    className="rounded border-border text-primary focus:ring-primary w-4 h-4"
                  />
                </label>
                <label className="flex items-center justify-between px-3 py-3 cursor-pointer hover:bg-muted/30">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Email</p>
                      <p className="text-[11px] text-muted-foreground">Send to your registered email</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={alertChannels.email}
                    onChange={(e) => setAlertChannels((p) => ({ ...p, email: e.target.checked }))}
                    className="rounded border-border text-primary focus:ring-primary w-4 h-4"
                  />
                </label>
                <label className="flex items-center justify-between px-3 py-3 cursor-pointer hover:bg-muted/30">
                  <div className="flex items-center gap-3">
                    <BellRing className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Push</p>
                      <p className="text-[11px] text-muted-foreground">Mobile push when available</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={alertChannels.push}
                    onChange={(e) => setAlertChannels((p) => ({ ...p, push: e.target.checked }))}
                    className="rounded border-border text-primary focus:ring-primary w-4 h-4"
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        <Button size="sm" variant="outline" className="text-xs h-8 gap-1.5">
          <Zap className="w-3.5 h-3.5" />Run Now
        </Button>

        <span className="ml-auto text-xs text-muted-foreground">
          {results.length} stocks matched · Nifty 500 · Updated live
        </span>
      </div>

      {/* ── Full-width results table ── */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground w-8">#</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Name</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground">Price</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground">Day Price Change</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground">Change %</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground">Volume</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Signal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {results.map((row) => {
                const dayChange = row.price * (row.change1d / 100);
                return (
                  <tr key={row.symbol} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-4 py-3">
                      <input type="checkbox" className="rounded border-border w-3.5 h-3.5" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary" title="Add to watchlist">
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-sm">{row.symbol}</span>
                            <span className="text-[10px] text-muted-foreground">NSE</span>
                          </div>
                          {/* B | S hover buttons */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-0.5">
                            <button className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-medium hover:bg-green-200">B</button>
                            <button className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-medium hover:bg-red-200">S</button>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-sm">
                      {row.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={cn("text-sm font-medium", row.change1d >= 0 ? "text-green-600" : "text-red-600")}>
                        {row.change1d >= 0 ? "+" : ""}{dayChange.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={cn("text-sm font-medium", row.change1d >= 0 ? "text-green-600" : "text-red-600")}>
                        {row.change1d >= 0 ? "+" : ""}{row.change1d.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-foreground">
                      {formatVolume(row.volume)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground">{row.signalReason}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="p-3 border-t border-border bg-muted/20 text-xs text-muted-foreground flex items-center justify-between">
          <span>Showing {results.length} of {allResults.length} results</span>
          <div className="flex items-center gap-3">
            <button className="hover:text-primary"><Download className="w-3.5 h-3.5 inline mr-1" />Download</button>
            <span className="text-[10px]">For educational purposes only. Not investment advice.</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
