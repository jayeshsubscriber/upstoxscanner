import { useMemo, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Zap,
  Star,
  BookOpen,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import type { ScannerPersona } from "@/data/mockData";
import {
  MARKET_PULSE,
  getTimePhase,
  generateFeed,
  getHeroOpportunity,
  getActiveSignalCount,
} from "@/data/opportunityFeed";

// Components
import { MarketPulseBar } from "@/components/scanner/mobile/MarketPulseBar";
import { PersonaFilterChips } from "@/components/scanner/mobile/PersonaFilterChips";
import { HeroOpportunityCard } from "@/components/scanner/mobile/HeroOpportunityCard";
import { OpportunityFeed } from "@/components/scanner/mobile/OpportunityFeed";
import { ToolkitSection } from "@/components/scanner/mobile/ToolkitSection";
import { StickyActionPill } from "@/components/scanner/mobile/StickyActionPill";

// ─── MAIN PAGE ──────────────────────────────────────────────────────────────

export function MobileScannerPage() {
  const [persona, setPersona] = useState<"all" | ScannerPersona>("all");
  const [savedScanners] = useState<Set<string>>(
    () => new Set(["volume-shockers-live", "orb-15"])
  );
  const feedRef = useRef<HTMLDivElement>(null);

  const timePhase = useMemo(() => getTimePhase(), []);

  const hero = useMemo(
    () => getHeroOpportunity(persona, timePhase),
    [persona, timePhase]
  );

  const feedItems = useMemo(
    () => generateFeed(persona, timePhase),
    [persona, timePhase]
  );

  // Remove the hero item from the feed to avoid duplication
  const feedWithoutHero = useMemo(
    () => (hero ? feedItems.filter((item) => item.id !== hero.id) : feedItems),
    [feedItems, hero]
  );

  const signalCount = useMemo(
    () => getActiveSignalCount(persona),
    [persona]
  );

  const scrollToTop = useCallback(() => {
    feedRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Layer 0: Sticky Market Pulse + Filters */}
      <MarketPulseBar pulse={MARKET_PULSE} />

      <div className="max-w-lg mx-auto px-4">
        {/* Persona filter bar */}
        <div className="pt-4 pb-3">
          <PersonaFilterChips value={persona} onChange={setPersona} />
        </div>

        {/* Layer 1: Hero — The One Trade Right Now */}
        <section className="mb-5" aria-label="Top opportunity">
          <HeroOpportunityCard item={hero} phase={timePhase} />
        </section>

        {/* Feed header */}
        <div ref={feedRef} className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <h2 className="text-sm font-bold text-foreground">Live Opportunities</h2>
          </div>
          <span className="text-[10px] text-muted-foreground">
            {signalCount} signals · {timePhase.label}
          </span>
        </div>

        {/* Layer 2: The Opportunity Feed */}
        <section className="mb-6" aria-label="Opportunity feed">
          <OpportunityFeed items={feedWithoutHero} />
        </section>

        {/* Plus upgrade nudge — compact */}
        <div className="mb-5 rounded-xl border border-primary/15 bg-gradient-to-r from-primary/[0.06] to-transparent p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#542087] to-[#7c3abf] flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-foreground">Advanced Packs</p>
            <p className="text-[10px] text-muted-foreground">
              Darvas, divergence, Piotroski + priority signals
            </p>
          </div>
          <Button
            size="sm"
            className="shrink-0 h-8 text-[11px] bg-gradient-to-r from-[#542087] to-[#7c3abf]"
          >
            <Star className="w-3 h-3 mr-1" />
            Plus
          </Button>
        </div>

        {/* Layer 4: Toolkit — Routines, Saved, All Scanners */}
        <ToolkitSection persona={persona} savedScannerIds={savedScanners} />

        {/* Layer 5: Adaptive Footer — Beginner guidance */}
        <section className="mb-6" aria-label="Getting started">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">Getting Started</h2>
          </div>
          <div className="space-y-2">
            <HelpItem
              icon={<CheckCircle2 className="w-4 h-4 text-green-600" />}
              title="How does this page work?"
              body="Every card is a stock that just triggered a scanner signal. Tap any card to see the full trade thesis — entry, stop-loss, target — then trade directly. Scanners run automatically in the background."
            />
            <HelpItem
              icon={<AlertTriangle className="w-4 h-4 text-amber-600" />}
              title="Is this financial advice?"
              body="No. Scanners surface stocks matching technical/fundamental rules. Always do your own research, use stop-losses, and never risk more than 1-2% of capital on a single trade."
            />
            <HelpItem
              icon={<Star className="w-4 h-4 text-primary" />}
              title="Which style should I pick?"
              body="If you trade daily: Intraday. If you hold 1-2 days: BTST. A few weeks: Swing. Months: Positional. Years: Long-Term. Not sure? Start with 'For You' — we'll show the best signals for this time of day."
            />
          </div>
        </section>

        {/* DIY CTA */}
        <Link to="/diy" className="block mb-8">
          <div className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/[0.06] to-transparent p-4 flex items-center gap-3 hover:border-primary/35 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground">
                Build Your Own Scanner
              </p>
              <p className="text-[10px] text-muted-foreground">
                100+ indicators, your rules, your edge.
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-primary shrink-0" />
          </div>
        </Link>
      </div>

      {/* Layer 3: Sticky bottom pill */}
      <StickyActionPill signalCount={signalCount} onTap={scrollToTop} />
    </div>
  );
}

// ─── HELP ITEM ──────────────────────────────────────────────────────────────

function HelpItem({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className="w-full text-left rounded-xl border border-border/60 bg-white p-3 transition-colors hover:border-primary/20"
    >
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-[11px] font-bold text-foreground flex-1">{title}</span>
        <span className="text-[10px] text-muted-foreground">
          {open ? "−" : "+"}
        </span>
      </div>
      {open && (
        <p className="text-[10px] text-muted-foreground leading-relaxed mt-2 ml-6">
          {body}
        </p>
      )}
    </button>
  );
}
