import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bell, BellOff, Plus, Clock, Trash2, Edit2, Zap,
  MessageCircle, Mail, Smartphone, Globe, CheckCircle2,
  AlertCircle, History, BarChart2,
} from "lucide-react";
import { MOCK_ALERTS } from "@/data/mockData";
import { cn } from "@/lib/utils";

const CHANNEL_META: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  whatsapp: { icon: MessageCircle, label: "WhatsApp", color: "text-green-600" },
  email: { icon: Mail, label: "Email", color: "text-blue-600" },
  push: { icon: Smartphone, label: "App Push", color: "text-orange-600" },
  browser: { icon: Globe, label: "Browser", color: "text-purple-600" },
};

const ALERT_HISTORY = [
  { id: 1, name: "Volume Shockers Alert", stock: "TATAMOTORS", time: "Today, 11:42 AM", price: "₹876.40", change: "+4.12%" },
  { id: 2, name: "Volume Shockers Alert", stock: "INFY", time: "Today, 10:18 AM", price: "₹1,548.75", change: "+3.42%" },
  { id: 3, name: "52W High Breakout", stock: "HDFCBANK", time: "Yesterday, 3:18 PM", price: "₹1,692.30", change: "+1.87%" },
  { id: 4, name: "Volume Shockers Alert", stock: "RELIANCE", time: "Yesterday, 9:47 AM", price: "₹2,847.50", change: "+2.14%" },
  { id: 5, name: "52W High Breakout", stock: "TITAN", time: "Mar 14, 2:55 PM", price: "₹3,456.80", change: "+1.92%" },
];

export function AlertsDashboardPage() {
  const [alerts, setAlerts] = useState(MOCK_ALERTS);
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const PLAN_LIMIT = 3;

  const toggleAlert = (id: string) => {
    setAlerts(prev => prev.map(a =>
      a.id === id ? { ...a, status: a.status === "active" ? "paused" as const : "active" as const } : a
    ));
  };

  const deleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const activeCount = alerts.filter(a => a.status === "active").length;

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Alerts</h1>
          <p className="text-muted-foreground">
            Get notified in real time when stocks match your conditions
          </p>
        </div>
        <Button asChild>
          <Link to="/scanners">
            <Plus className="w-4 h-4 mr-1.5" />New Alert
          </Link>
        </Button>
      </div>

      {/* Plan status */}
      <div className="mb-6 rounded-xl border border-border bg-muted/30 p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bell className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {activeCount} of {PLAN_LIMIT} alerts used
                <span className="ml-2 text-xs text-muted-foreground">(Basic Plan)</span>
              </p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex gap-1">
                  {Array.from({ length: PLAN_LIMIT }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-8 h-1.5 rounded-full",
                        i < activeCount ? "bg-primary" : "bg-border"
                      )}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">{PLAN_LIMIT - activeCount} remaining</span>
              </div>
            </div>
          </div>
          <Button size="sm" className="shrink-0 bg-gradient-to-r from-[#542087] to-[#7c3abf]">
            <Zap className="w-3.5 h-3.5 mr-1.5" />Unlimited with Plus
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-muted/50 p-1 rounded-lg w-fit">
        {(["active", "history"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-colors",
              activeTab === tab ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab === "active" ? <Bell className="w-3.5 h-3.5" /> : <History className="w-3.5 h-3.5" />}
            {tab === "active" ? "Active Alerts" : "Alert History"}
            {tab === "active" && (
              <span className={cn(
                "text-xs px-1.5 py-0 rounded-full",
                activeTab === "active" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              )}>
                {alerts.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === "active" ? (
        <div className="space-y-3">
          {alerts.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-medium">No alerts yet</p>
              <p className="text-sm mt-1 mb-4">Browse scanners and hit "Set Alert" to get started</p>
              <Button asChild variant="outline">
                <Link to="/scanners">Browse Scanners</Link>
              </Button>
            </div>
          )}

          {alerts.map((alert) => (
            <Card key={alert.id} className={cn(
              "transition-all",
              alert.status === "paused" && "opacity-60"
            )}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Status icon */}
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                    alert.status === "active" ? "bg-green-100" : "bg-muted"
                  )}>
                    {alert.status === "active"
                      ? <CheckCircle2 className="w-4 h-4 text-green-600" />
                      : <AlertCircle className="w-4 h-4 text-muted-foreground" />
                    }
                  </div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-sm text-foreground">{alert.name}</span>
                      <Badge
                        className={cn(
                          "text-[10px] px-1.5 h-4 border-0",
                          alert.status === "active" ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"
                        )}
                      >
                        {alert.status === "active" ? "Active" : "Paused"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Scanner: <Link to={`/scanners/${alert.scannerId}`} className="text-primary hover:underline">{alert.scannerName}</Link>
                    </p>

                    {/* Channels */}
                    <div className="flex items-center gap-3 mb-2">
                      {alert.channels.map(ch => {
                        const meta = CHANNEL_META[ch];
                        return meta ? (
                          <span key={ch} className={`flex items-center gap-1 text-xs ${meta.color}`}>
                            <meta.icon className="w-3 h-3" />{meta.label}
                          </span>
                        ) : null;
                      })}
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Last triggered: {alert.lastTriggered ?? "Never"}
                      </span>
                      <span className="flex items-center gap-1">
                        <BarChart2 className="w-3 h-3" />
                        {alert.triggersThisWeek} triggers this week
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => toggleAlert(alert.id)}
                      title={alert.status === "active" ? "Pause alert" : "Resume alert"}
                    >
                      {alert.status === "active"
                        ? <BellOff className="w-4 h-4 text-muted-foreground" />
                        : <Bell className="w-4 h-4 text-muted-foreground" />
                      }
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Edit2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:text-destructive"
                      onClick={() => deleteAlert(alert.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Channels guide */}
          <Card className="mt-6 border-dashed">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-semibold">Alert Channels Available</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {Object.entries(CHANNEL_META).map(([key, meta]) => (
                  <div key={key} className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                    <meta.icon className={`w-4 h-4 ${meta.color}`} />
                    <div>
                      <p className="text-xs font-medium">{meta.label}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {key === "whatsapp" ? "Instant" :
                         key === "email" ? "Near-instant" :
                         key === "push" ? "Upstox app" : "Any browser"}
                      </p>
                    </div>
                    {(key === "whatsapp" || key === "push") && (
                      <Badge className="ml-auto text-[9px] px-1 h-3.5 bg-gradient-to-r from-[#542087] to-[#7c3abf] text-white border-0">PLUS</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-sm font-semibold">Last 30 Alert Events</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/60">
              {ALERT_HISTORY.map((event) => (
                <div key={event.id} className="flex items-center gap-4 px-4 py-3 hover:bg-muted/30">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bell className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{event.stock}</p>
                    <p className="text-xs text-muted-foreground">{event.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{event.price}</p>
                    <p className="text-xs text-green-600 font-semibold">{event.change}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">{event.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
