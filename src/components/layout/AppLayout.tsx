import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ScanLine, BarChart2, Store, Bell, User, ChevronDown,
  LogIn, Menu, X, TrendingUp, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Scanners", href: "/scanners", icon: ScanLine },
  { label: "DIY Screener", href: "/diy", icon: BarChart2 },
  { label: "Marketplace", href: "/marketplace", icon: Store },
  { label: "Alerts", href: "/alerts", icon: Bell },
];

const MOCK_USER = { name: "Aarav Shah", handle: "aarav_trades", plan: "plus" as const };

export function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggedIn] = useState(true); // mock: always logged in

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Nav */}
      <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-foreground text-base tracking-tight">
              Upstox <span className="text-primary">Scanners</span>
            </span>
            <Badge className="text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-0 font-semibold">
              BETA
            </Badge>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1">
            {NAV_ITEMS.map((item) => {
              const active = location.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 ml-auto">
            {isLoggedIn ? (
              <>
                {MOCK_USER.plan === "plus" ? (
                  <Badge className="hidden sm:flex bg-gradient-to-r from-[#542087] to-[#7c3abf] text-white border-0 text-[10px] px-2">
                    <Zap className="w-2.5 h-2.5 mr-1" />PLUS
                  </Badge>
                ) : (
                  <Button variant="outline" size="sm" className="hidden sm:flex h-7 text-xs border-primary text-primary hover:bg-primary/5">
                    Upgrade to Plus
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-1.5 h-8">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                        {MOCK_USER.name[0]}
                      </div>
                      <span className="hidden sm:inline text-sm">{MOCK_USER.name.split(" ")[0]}</span>
                      <ChevronDown className="w-3 h-3 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{MOCK_USER.name}</p>
                      <p className="text-xs text-muted-foreground">@{MOCK_USER.handle}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile/aarav_trades" className="flex items-center gap-2">
                        <User className="w-4 h-4" /> My Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/alerts" className="flex items-center gap-2">
                        <Bell className="w-4 h-4" /> Alerts
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-muted-foreground">Sign Out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button size="sm" className="gap-1.5">
                <LogIn className="w-4 h-4" /> Login
              </Button>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-1.5 rounded-md hover:bg-muted"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-white px-4 pb-4 pt-2">
            {NAV_ITEMS.map((item) => {
              const active = location.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    active ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer — hidden on DIY screener for full-height builder */}
      {!location.pathname.startsWith("/diy") && !location.pathname.startsWith("/app/") && (
        <footer className="border-t border-border bg-muted/30 py-8 mt-auto">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-semibold text-sm text-foreground">Upstox Scanners</span>
              </div>
              <p className="text-xs text-muted-foreground">
                For educational purposes only. Not investment advice. © 2026 Upstox
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
