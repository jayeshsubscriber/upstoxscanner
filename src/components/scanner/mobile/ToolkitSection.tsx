import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ChevronRight,
  ArrowRight,
  Play,
  Bookmark,
  Search,
  TrendingUp,
  Users,
  Lock,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PRE_BUILT_SCANNERS,
  PERSONA_LABELS,
  PERSONA_COLORS,
  DIFFICULTY_COLORS,
  formatCount,
  type ScannerPersona,
  type PreBuiltScanner,
} from "@/data/mockData";
import { PLAYLISTS, type Playlist } from "@/data/opportunityFeed";

interface Props {
  persona: "all" | ScannerPersona;
  savedScannerIds: Set<string>;
}

export function ToolkitSection({ persona, savedScannerIds }: Props) {
  const [open, setOpen] = useState(false);

  const filteredPlaylists = useMemo(
    () =>
      persona === "all"
        ? PLAYLISTS
        : PLAYLISTS.filter((p) => p.persona === persona),
    [persona]
  );

  const savedScanners = useMemo(
    () => PRE_BUILT_SCANNERS.filter((s) => savedScannerIds.has(s.id)),
    [savedScannerIds]
  );

  const allGrouped = useMemo(() => {
    const base =
      persona === "all"
        ? PRE_BUILT_SCANNERS
        : PRE_BUILT_SCANNERS.filter((s) => s.persona === persona);
    return base.reduce<Record<string, PreBuiltScanner[]>>((acc, s) => {
      const key = s.subCategory;
      if (!acc[key]) acc[key] = [];
      acc[key].push(s);
      return acc;
    }, {});
  }, [persona]);

  const totalScanners = Object.values(allGrouped).flat().length;

  return (
    <section className="mb-6">
      {/* Toggle header */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3"
      >
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-bold text-foreground">Your Toolkit</h2>
          <Badge variant="secondary" className="text-[9px]">
            {totalScanners} scanners
          </Badge>
        </div>
        <ChevronRight
          className={cn(
            "w-4 h-4 text-muted-foreground transition-transform",
            open && "rotate-90"
          )}
        />
      </button>

      {open && (
        <Tabs defaultValue="routines" className="mt-1">
          <TabsList className="w-full bg-muted/50 h-9">
            <TabsTrigger value="routines" className="text-[11px] flex-1">
              <Play className="w-3 h-3 mr-1" />
              Routines
            </TabsTrigger>
            <TabsTrigger value="saved" className="text-[11px] flex-1">
              <Bookmark className="w-3 h-3 mr-1" />
              Saved
            </TabsTrigger>
            <TabsTrigger value="all" className="text-[11px] flex-1">
              <Search className="w-3 h-3 mr-1" />
              All
            </TabsTrigger>
          </TabsList>

          {/* Routines */}
          <TabsContent value="routines" className="mt-3 space-y-2.5">
            {filteredPlaylists.map((pl) => (
              <PlaylistCard key={pl.id} playlist={pl} />
            ))}
            {filteredPlaylists.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">
                No routines for this style yet.
              </p>
            )}
          </TabsContent>

          {/* Saved */}
          <TabsContent value="saved" className="mt-3">
            {savedScanners.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {savedScanners.map((s) => (
                  <Link
                    key={s.id}
                    to={`/scanners/${s.id}`}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-primary/15 bg-primary/[0.03] text-xs font-medium text-foreground hover:border-primary/30 transition-colors"
                  >
                    <TrendingUp className="w-3 h-3 text-green-600" />
                    {s.name}
                    <Badge className="text-[8px] px-1 py-0 h-3.5 bg-green-50 text-green-700 border-0 ml-1">
                      {s.resultCount}
                    </Badge>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Bookmark className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">
                  No saved scanners yet. Tap the bookmark on any scanner to save it.
                </p>
              </div>
            )}
            <Link
              to="/diy"
              className="flex items-center justify-center gap-1.5 mt-3 py-2.5 rounded-lg border border-primary/20 text-xs font-semibold text-primary hover:bg-primary/5 transition-colors"
            >
              Build your own scanner
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </TabsContent>

          {/* All Scanners */}
          <TabsContent value="all" className="mt-3">
            <Accordion
              type="multiple"
              defaultValue={Object.keys(allGrouped).slice(0, 1)}
              className="space-y-1.5"
            >
              {Object.entries(allGrouped).map(([category, scanners]) => (
                <AccordionItem
                  key={category}
                  value={category}
                  className="border border-border/60 rounded-lg px-2.5 bg-white"
                >
                  <AccordionTrigger className="text-[11px] font-bold hover:no-underline py-2.5">
                    <span className="flex items-center gap-1.5">
                      {category}
                      <Badge variant="secondary" className="text-[8px] font-normal">
                        {scanners.length}
                      </Badge>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-2 pt-0">
                    <div className="space-y-0.5">
                      {scanners.map((scanner) => (
                        <ScannerRow key={scanner.id} scanner={scanner} />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>
        </Tabs>
      )}
    </section>
  );
}

function PlaylistCard({ playlist }: { playlist: Playlist }) {
  return (
    <div className={cn("rounded-xl border border-border/60 bg-gradient-to-r p-3", playlist.gradient)}>
      <div className="flex items-center gap-2.5">
        <span className="text-xl">{playlist.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-foreground">{playlist.title}</p>
          <p className="text-[10px] text-muted-foreground">{playlist.subtitle}</p>
        </div>
        <Badge className={cn("text-[8px] border-0 shrink-0", DIFFICULTY_COLORS[playlist.difficulty])}>
          {playlist.difficulty}
        </Badge>
      </div>
      <div className="flex items-center gap-2 mt-2.5 ml-8">
        {playlist.steps.map((step, i) => (
          <Link
            key={step.scannerId}
            to={`/scanners/${step.scannerId}`}
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/80 border border-border/40 text-[9px] font-medium text-foreground hover:border-primary/30 transition-colors"
          >
            <span className="text-[8px] text-muted-foreground">{i + 1}.</span>
            {step.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function ScannerRow({ scanner }: { scanner: PreBuiltScanner }) {
  return (
    <Link
      to={`/scanners/${scanner.id}`}
      className="flex items-center gap-2.5 p-2 rounded-md hover:bg-muted/30 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 flex-wrap mb-0.5">
          <Badge
            className={cn("text-[7px] px-1 py-0 h-3 border-0", PERSONA_COLORS[scanner.persona])}
          >
            {PERSONA_LABELS[scanner.persona]}
          </Badge>
          {scanner.plan === "plus" && (
            <Badge className="text-[7px] px-1 py-0 h-3 bg-gradient-to-r from-[#542087] to-[#7c3abf] text-white border-0">
              <Lock className="w-1.5 h-1.5 mr-0.5" />
              Plus
            </Badge>
          )}
        </div>
        <p className="text-[11px] font-semibold text-foreground truncate">
          {scanner.name}
        </p>
        <div className="flex items-center gap-2 text-[9px] text-muted-foreground mt-0.5">
          <span className="text-green-600 font-semibold">{scanner.resultCount} matched</span>
          <span>·</span>
          <span className="flex items-center gap-0.5">
            <Users className="w-2.5 h-2.5" />
            {formatCount(scanner.runCount)}
          </span>
        </div>
      </div>
      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
    </Link>
  );
}
