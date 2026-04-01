import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LogIn, Menu, X, TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Create", href: "/diy" },
  { label: "Explore", href: "/marketplace" },
  { label: "My Screeners", href: "/scanners" },
];

function isNavItemActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggedIn] = useState(true); // mock: always logged in
  const hideGlobalHeader = location.pathname === "/diy" && Boolean((location.state as { quickFullScreen?: boolean } | null)?.quickFullScreen);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Nav */}
      {!hideGlobalHeader ? (
      <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="w-full px-4 sm:px-6 h-14 flex items-center gap-6">
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
              const active = isNavItemActive(location.pathname, item.href);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 ml-auto">
            {isLoggedIn ? (
              <>
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
              const active = isNavItemActive(location.pathname, item.href);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    active ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}
      </header>
      ) : null}

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
