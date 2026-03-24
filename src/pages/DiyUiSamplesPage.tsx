import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  ChevronDown,
  Filter,
  SlidersHorizontal,
  Sparkles,
  Wand2,
} from "lucide-react";

type Operator = ">" | "<" | "between" | "crossed_above" | "increasing";
type CompareMode = "value" | "indicator";

const INDICATORS = [
  "Close",
  "Open",
  "High",
  "Low",
  "RSI (14)",
  "VWAP",
  "EMA (20)",
  "SMA (200)",
  "Volume",
  "Bollinger Bandwidth",
];

export function DiyUiSamplesPage() {
  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">DIY Screener UI — Options A–G</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visual mockups to approve the best condition-builder UX. These are UI samples only.
          </p>
        </div>
        <Badge className="bg-primary/10 text-primary border-0">Sandbox</Badge>
      </div>

      <Tabs defaultValue="recommended">
        <TabsList className="w-full justify-start flex-wrap h-auto">
          <TabsTrigger value="recommended">Recommended</TabsTrigger>
          <TabsTrigger value="a">Option A</TabsTrigger>
          <TabsTrigger value="b">Option B</TabsTrigger>
          <TabsTrigger value="c">Option C</TabsTrigger>
          <TabsTrigger value="d">Option D</TabsTrigger>
          <TabsTrigger value="e">Option E</TabsTrigger>
          <TabsTrigger value="f">Option F</TabsTrigger>
          <TabsTrigger value="g">Option G</TabsTrigger>
        </TabsList>

        <TabsContent value="recommended">
          <SectionTitle
            icon={<Sparkles className="w-4 h-4 text-primary" />}
            title="Recommended: Option A + Option E + Option B"
            subtitle="Default to Tickertape-style filters; auto-switch to range slider for “between”; keep advanced in a drawer."
          />
          <div className="grid lg:grid-cols-2 gap-4">
            <SampleFrame title="Collapsed list (A) + Between (E)">
              <RecommendedComposite />
            </SampleFrame>
            <SampleFrame title="Advanced drawer (B)">
              <AdvancedDrawerMock />
            </SampleFrame>
          </div>
        </TabsContent>

        <TabsContent value="a">
          <SectionTitle
            icon={<Filter className="w-4 h-4 text-primary" />}
            title="Option A — Tickertape Filters"
            subtitle="Accordion list; each condition is a filter row with a compact summary."
          />
          <SampleFrame title="Accordion filter list">
            <OptionA />
          </SampleFrame>
        </TabsContent>

        <TabsContent value="b">
          <SectionTitle
            icon={<SlidersHorizontal className="w-4 h-4 text-primary" />}
            title="Option B — Quick chips + Advanced drawer"
            subtitle="Keep the row minimal; push complexity into a drawer."
          />
          <div className="grid lg:grid-cols-2 gap-4">
            <SampleFrame title="Minimal row + chips">
              <OptionB />
            </SampleFrame>
            <SampleFrame title="Advanced drawer (mock)">
              <AdvancedDrawerMock />
            </SampleFrame>
          </div>
        </TabsContent>

        <TabsContent value="c">
          <SectionTitle
            icon={<Wand2 className="w-4 h-4 text-primary" />}
            title="Option C — Natural language builder"
            subtitle="Sentence-like rule editor with tap-to-edit tokens."
          />
          <SampleFrame title="Sentence rule">
            <OptionC />
          </SampleFrame>
        </TabsContent>

        <TabsContent value="d">
          <SectionTitle
            icon={<ArrowRight className="w-4 h-4 text-primary" />}
            title="Option D — A vs B compare layout"
            subtitle="Two-column indicator compare with an explicit operator in the middle."
          />
          <SampleFrame title="A vs B">
            <OptionD />
          </SampleFrame>
        </TabsContent>

        <TabsContent value="e">
          <SectionTitle
            icon={<SlidersHorizontal className="w-4 h-4 text-primary" />}
            title="Option E — Range slider first (Between)"
            subtitle="When operator is “between”, show slider + min/max inputs."
          />
          <SampleFrame title="Between UI">
            <OptionE />
          </SampleFrame>
        </TabsContent>

        <TabsContent value="f">
          <SectionTitle
            icon={<ChevronDown className="w-4 h-4 text-primary" />}
            title="Option F — Operator-first wizard"
            subtitle="Step-by-step selection to reduce cognitive load."
          />
          <SampleFrame title="Wizard flow">
            <OptionF />
          </SampleFrame>
        </TabsContent>

        <TabsContent value="g">
          <SectionTitle
            icon={<Filter className="w-4 h-4 text-primary" />}
            title="Option G — Compact dense row"
            subtitle="One-line conditions for power users; expand only when needed."
          />
          <SampleFrame title="Dense row list">
            <OptionG />
          </SampleFrame>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SectionTitle({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      </div>
      <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
    </div>
  );
}

function SampleFrame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="border-border">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
          <Badge variant="secondary" className="bg-muted text-muted-foreground border-0">Mock</Badge>
        </div>
        <div className="rounded-lg border border-border bg-background p-4">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Option A

function OptionA() {
  return (
    <Accordion type="multiple" className="w-full">
      <AccordionItem value="u">
        <div className="px-2">
          <AccordionTrigger>Stock Universe</AccordionTrigger>
          <AccordionContent>
            <RadioRow label="Nifty 50 Stocks" checked />
            <RadioRow label="Nifty 500 Stocks" />
          </AccordionContent>
        </div>
      </AccordionItem>
      <AccordionItem value="c1">
        <div className="px-2">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <Badge className="bg-primary/10 text-primary border-0 text-[10px] px-2">AND</Badge>
              <span>Close • Daily • &gt; • 200</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <ConditionFormMock />
          </AccordionContent>
        </div>
      </AccordionItem>
      <AccordionItem value="c2">
        <div className="px-2">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <Badge className="bg-primary/10 text-primary border-0 text-[10px] px-2">OR</Badge>
              <span>RSI (14) • 15m • crossed above • 30</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <ConditionFormMock initial={{ indicator: "RSI (14)", timeframe: "15 min", operator: "crossed_above" }} />
          </AccordionContent>
        </div>
      </AccordionItem>
    </Accordion>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Option B

function OptionB() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-12 gap-2 items-center">
        <div className="col-span-4">
          <Token value="Daily" />
        </div>
        <div className="col-span-4">
          <Token value="Close" />
        </div>
        <div className="col-span-4">
          <Token value="is greater than" />
        </div>
      </div>
      <div className="grid grid-cols-12 gap-2 items-center">
        <div className="col-span-8">
          <Input placeholder="Value" defaultValue="200" className="h-9" />
        </div>
        <div className="col-span-4">
          <Button variant="outline" className="w-full h-9 text-sm">Advanced</Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Chip label="Time modifier: Off" />
        <Chip label="Compare: Value" />
        <Chip label="Multiplier: 1x" muted />
      </div>
    </div>
  );
}

function AdvancedDrawerMock() {
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-4">
      <p className="text-sm font-semibold text-foreground mb-2">Advanced</p>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Time modifier</p>
          <Token value="Within last N bars" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">N bars</p>
          <Input defaultValue="5" className="h-9" />
        </div>
        <div className="sm:col-span-2">
          <p className="text-xs text-muted-foreground mb-1">Operator help</p>
          <div className="text-xs text-muted-foreground leading-relaxed">
            “Crossed above” triggers when the indicator value moves from below to above the threshold within the selected window.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Option C

function OptionC() {
  return (
    <div className="space-y-3">
      <div className="text-sm text-foreground leading-relaxed">
        <Token value="Close" /> <Token value="[Daily]" /> <Token value="[is greater than]" /> <Token value="[200]" />
      </div>
      <p className="text-xs text-muted-foreground">
        What this means: Stocks where the latest daily close price is above 200.
      </p>
      <div className="flex gap-2">
        <Button size="sm" variant="outline">Edit tokens</Button>
        <Button size="sm">Add another clause</Button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Option D

function OptionD() {
  return (
    <div className="grid md:grid-cols-3 gap-3 items-start">
      <div className="rounded-lg border border-border p-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Indicator A</p>
        <Field label="Indicator"><Token value="Close" /></Field>
        <Field label="Timeframe"><Token value="Daily" /></Field>
      </div>
      <div className="rounded-lg border border-border p-3 flex items-center justify-center h-full">
        <Token value="crossed above" />
      </div>
      <div className="rounded-lg border border-border p-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Value / Indicator B</p>
        <Field label="Compare mode"><Token value="Value" /></Field>
        <Field label="Value"><Input defaultValue="200" className="h-9" /></Field>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Option E

function OptionE() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">1M Return (%)</p>
        <Button size="sm" variant="ghost" className="text-primary">Reset</Button>
      </div>
      <div className="h-2 rounded-full bg-muted relative">
        <div className="absolute left-[20%] right-[35%] top-0 bottom-0 bg-primary/30 rounded-full" />
        <div className="absolute left-[20%] top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-white border border-border shadow" />
        <div className="absolute right-[35%] top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-white border border-border shadow" />
      </div>
      <div className="grid grid-cols-3 gap-2 items-center">
        <Input defaultValue="-68.35" className="h-9" />
        <span className="text-sm text-muted-foreground text-center">to</span>
        <Input defaultValue="-15.17" className="h-9" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Option F

function OptionF() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Badge className="bg-muted text-muted-foreground border-0">Step {step} of 3</Badge>
        <div className="text-sm font-semibold text-foreground">Build a condition</div>
      </div>

      {step === 1 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Choose indicator</p>
          <div className="grid sm:grid-cols-2 gap-2">
            {INDICATORS.slice(0, 6).map((i) => (
              <button
                key={i}
                onClick={() => setStep(2)}
                className="h-9 rounded-md border border-border px-3 text-sm text-left hover:bg-muted"
              >
                {i}
              </button>
            ))}
          </div>
        </div>
      )}
      {step === 2 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Choose operator</p>
          <div className="grid sm:grid-cols-2 gap-2">
            {["is greater than", "is less than", "between", "crossed above"].map((o) => (
              <button
                key={o}
                onClick={() => setStep(3)}
                className="h-9 rounded-md border border-border px-3 text-sm text-left hover:bg-muted"
              >
                {o}
              </button>
            ))}
          </div>
        </div>
      )}
      {step === 3 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Enter value</p>
          <Input defaultValue="200" className="h-9" />
          <div className="flex gap-2 pt-1">
            <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
            <Button onClick={() => setStep(1)}>Add another</Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Option G

function OptionG() {
  return (
    <div className="space-y-2">
      {[
        { left: "Daily", mid: "Close", op: ">", right: "200" },
        { left: "15m", mid: "RSI(14)", op: "between", right: "30–60" },
        { left: "Daily", mid: "Volume", op: ">", right: "2x avg" },
      ].map((r, idx) => (
        <div
          key={idx}
          className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2"
        >
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">{r.left}</span>
            <span className="font-semibold">{r.mid}</span>
            <span className="text-muted-foreground">{r.op}</span>
            <span className="font-semibold">{r.right}</span>
          </div>
          <button className="text-xs text-primary hover:underline">Expand</button>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Recommended composite mock

function RecommendedComposite() {
  const [operator, setOperator] = useState<Operator>("between");
  const [compareMode, setCompareMode] = useState<CompareMode>("value");

  return (
    <Accordion type="multiple" className="w-full">
      <AccordionItem value="u">
        <div className="px-2">
          <AccordionTrigger>Stock Universe</AccordionTrigger>
          <AccordionContent>
            <RadioRow label="Nifty 50 Stocks" checked />
            <RadioRow label="Nifty 500 Stocks" />
          </AccordionContent>
        </div>
      </AccordionItem>
      <AccordionItem value="c">
        <div className="px-2">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <Badge className="bg-primary/10 text-primary border-0 text-[10px] px-2">AND</Badge>
              <span>RSI (14) • 15m • {operator === "between" ? "between" : ">"}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Field label="Operator">
                  <select
                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm appearance-none"
                    value={operator}
                    onChange={(e) => setOperator(e.target.value as Operator)}
                  >
                    <option value=">">is greater than</option>
                    <option value="<">is less than</option>
                    <option value="between">between</option>
                    <option value="crossed_above">crossed above</option>
                    <option value="increasing">is increasing</option>
                  </select>
                </Field>
                <Field label="Compare">
                  <select
                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm appearance-none"
                    value={compareMode}
                    onChange={(e) => setCompareMode(e.target.value as CompareMode)}
                  >
                    <option value="value">Value</option>
                    <option value="indicator">Indicator</option>
                  </select>
                </Field>
              </div>

              {operator === "between" ? (
                <OptionE />
              ) : compareMode === "value" ? (
                <Field label="Value">
                  <Input defaultValue="30" className="h-9" />
                </Field>
              ) : (
                <div className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-8">
                    <Field label="Indicator B">
                      <Token value="SMA (200)" />
                    </Field>
                  </div>
                  <div className="col-span-4">
                    <Field label="Multiplier">
                      <Input defaultValue="1" className="h-9" />
                    </Field>
                  </div>
                </div>
              )}

              <Button variant="outline" className="w-full">
                Advanced (drawer)
              </Button>
            </div>
          </AccordionContent>
        </div>
      </AccordionItem>
    </Accordion>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Small building blocks

function ConditionFormMock({
  initial,
}: {
  initial?: { indicator?: string; timeframe?: string; operator?: Operator };
}) {
  const [indicator, setIndicator] = useState(initial?.indicator ?? "Close");
  const [timeframe, setTimeframe] = useState(initial?.timeframe ?? "Daily");
  const [operator, setOperator] = useState<Operator>(initial?.operator ?? ">");
  const [compareMode, setCompareMode] = useState<CompareMode>("value");

  const operators = useMemo(
    () => [
      { id: ">", label: "is greater than" },
      { id: "<", label: "is less than" },
      { id: "between", label: "is between" },
      { id: "crossed_above", label: "crossed above" },
      { id: "increasing", label: "is increasing" },
    ],
    []
  );

  return (
    <div className="space-y-4">
      <Field label="Timeframe">
        <select
          className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm appearance-none"
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
        >
          {["Daily", "15 min", "Monthly"].map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Indicator">
        <select
          className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm appearance-none"
          value={indicator}
          onChange={(e) => setIndicator(e.target.value)}
        >
          {INDICATORS.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Condition">
        <select
          className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm appearance-none"
          value={operator}
          onChange={(e) => setOperator(e.target.value as Operator)}
        >
          {operators.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground font-medium">Compare with</p>
        <button
          className="text-xs text-primary hover:underline font-medium"
          type="button"
          onClick={() => setCompareMode(compareMode === "value" ? "indicator" : "value")}
        >
          {compareMode === "value" ? "Use indicator instead" : "Use value instead"}
        </button>
      </div>
      {compareMode === "value" ? (
        <div className="grid grid-cols-12 gap-2 items-end">
          <div className="col-span-8">
            <Field label="Value">
              <Input defaultValue="200" className="h-9" />
            </Field>
          </div>
          <div className="col-span-4">
            <Field label="Unit">
              <Token value="₹" />
            </Field>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-2 items-end">
          <div className="col-span-8">
            <Field label="Indicator 2">
              <Token value="Select indicator..." muted />
            </Field>
          </div>
          <div className="col-span-4">
            <Field label="Multiplier">
              <Input defaultValue="1" className="h-9" />
            </Field>
          </div>
        </div>
      )}
      <Button variant="outline" className="w-full">Advanced</Button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
      {children}
    </div>
  );
}

function Chip({ label, muted }: { label: string; muted?: boolean }) {
  return (
    <span className={cn(
      "text-xs px-2 py-1 rounded-full border",
      muted ? "border-border text-muted-foreground bg-muted/30" : "border-primary/20 text-primary bg-primary/5"
    )}>
      {label}
    </span>
  );
}

function Token({ value, muted }: { value: string; muted?: boolean }) {
  return (
    <span className={cn(
      "inline-flex items-center justify-between gap-2 h-9 px-3 rounded-md border text-sm w-full",
      muted ? "border-border text-muted-foreground bg-muted/30" : "border-border text-foreground bg-background"
    )}>
      {value}
      <ChevronDown className="w-4 h-4 text-muted-foreground" />
    </span>
  );
}

function RadioRow({ label, checked }: { label: string; checked?: boolean }) {
  return (
    <label className="flex items-center gap-3 py-1.5 text-sm cursor-pointer select-none">
      <input type="radio" checked={!!checked} readOnly className="h-4 w-4 accent-primary" />
      <span className="text-muted-foreground">{label}</span>
    </label>
  );
}

