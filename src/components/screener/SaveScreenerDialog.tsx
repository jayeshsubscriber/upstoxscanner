"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Loader2, Share2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ScreenerPreferences } from "@/types/screener";
import { DEFAULT_SCREENER_PREFERENCES } from "@/types/screener";

const RUN_DAY_OPTIONS = [
  { id: "all-market-days", label: "All market days", hint: "Runs on every trading session" },
  { id: "custom", label: "Specific weekdays", hint: "Choose exact days manually" },
] as const;

const RUN_TIMING_OPTIONS = [
  { id: "every-1m", label: "Every 1 min" },
  { id: "every-5m", label: "Every 5 mins" },
  { id: "every-15m", label: "Every 15 mins" },
  { id: "specific-time", label: "Specific time of day" },
] as const;

const WEEKDAY_OPTIONS = [
  { id: "mon", label: "Mon" },
  { id: "tue", label: "Tue" },
  { id: "wed", label: "Wed" },
  { id: "thu", label: "Thu" },
  { id: "fri", label: "Fri" },
  { id: "sat", label: "Sat" },
  { id: "sun", label: "Sun" },
] as const;

export interface SaveScreenerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** True until the user has completed this flow at least once (id persisted). */
  isFirstSave: boolean;
  initialName: string;
  initialDescription: string;
  initialPreferences: ScreenerPreferences;
  onSubmit: (payload: {
    name: string;
    description: string;
    preferences: ScreenerPreferences;
  }) => Promise<{ ok: true } | { ok: false; message: string }>;
  onShare: () => void;
}

export function SaveScreenerDialog({
  open,
  onOpenChange,
  isFirstSave,
  initialName,
  initialDescription,
  initialPreferences,
  onSubmit,
  onShare,
}: SaveScreenerDialogProps) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [prefs, setPrefs] = useState<ScreenerPreferences>(initialPreferences);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [runDaysMode, setRunDaysMode] = useState<(typeof RUN_DAY_OPTIONS)[number]["id"]>("all-market-days");
  const [runTimingMode, setRunTimingMode] = useState<(typeof RUN_TIMING_OPTIONS)[number]["id"]>("every-5m");
  const [specificTime, setSpecificTime] = useState("09:20");
  const [customDays, setCustomDays] = useState<string[]>(["mon", "tue", "wed", "thu", "fri"]);

  useEffect(() => {
    if (!open) return;
    setStep("form");
    setName(initialName);
    setDescription(initialDescription);
    setPrefs({ ...DEFAULT_SCREENER_PREFERENCES, ...initialPreferences });
    setRunDaysMode("all-market-days");
    setRunTimingMode("every-5m");
    setSpecificTime("09:20");
    setCustomDays(["mon", "tue", "wed", "thu", "fri"]);
    setError(null);
    setSubmitting(false);
  }, [open, initialName, initialDescription, initialPreferences]);

  async function handleSave() {
    setError(null);
    const n = name.trim() || "Untitled screener";
    if (isFirstSave && !description.trim()) {
      setError("Add a short description so others can understand this screener when you share it.");
      return;
    }
    setSubmitting(true);
    const result = await onSubmit({
      name: n,
      description: description.trim(),
      preferences: prefs,
    });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setStep("success");
  }

  function toggleCustomDay(dayId: string) {
    setCustomDays((prev) =>
      prev.includes(dayId) ? prev.filter((id) => id !== dayId) : [...prev, dayId]
    );
  }

  function alertsScheduleSummary() {
    const runDaysLabel =
      runDaysMode === "all-market-days"
        ? "All market days"
        : customDays.length > 0
          ? WEEKDAY_OPTIONS.filter((d) => customDays.includes(d.id))
              .map((d) => d.label)
              .join(", ")
          : "No weekdays selected";

    const timingLabel =
      runTimingMode === "every-1m"
        ? "Every 1 min"
        : runTimingMode === "every-5m"
          ? "Every 5 mins"
          : runTimingMode === "every-15m"
            ? "Every 15 mins"
            : `At ${specificTime}`;

    return `${runDaysLabel} • ${timingLabel}`;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[min(90vh,640px)] overflow-y-auto gap-0 p-0">
        {step === "form" ? (
          <>
            <DialogHeader className="p-6 pb-4 space-y-1.5 text-left">
              <DialogTitle className="text-lg">
                {isFirstSave ? "Save your screener" : "Screener settings"}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
                {isFirstSave
                  ? "Name it and set a scan run schedule. You can change this anytime."
                  : "Update name, run schedule, and visibility."}
              </DialogDescription>
            </DialogHeader>

            <div className="px-6 pb-4 space-y-4 border-b border-border/60">
              <Field label="Screener name" contentClassName="px-2 py-1">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Momentum breakouts — Nifty 500"
                  className="h-9 border-0 shadow-none focus-visible:ring-0"
                />
              </Field>

              <div className="space-y-1">
                <Field label="Description" contentClassName="px-2 py-1">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What does this screener find? Who is it for?"
                    rows={3}
                    className="w-full text-sm bg-transparent px-1 py-1.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none resize-none leading-relaxed"
                  />
                </Field>
                {isFirstSave && (
                  <p className="text-[11px] text-muted-foreground px-0.5">
                    Shown on Marketplace if you set visibility to public.
                  </p>
                )}
              </div>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Scan Run Schedule</h3>
                <p className="text-xs text-muted-foreground">Days on which this scanner should run</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {RUN_DAY_OPTIONS.map((option) => (
                    <label
                      key={option.id}
                      className={cn(
                        "flex items-start gap-2 rounded-lg border p-2.5 cursor-pointer transition-colors min-h-[98px]",
                        runDaysMode === option.id ? "border-primary/50 bg-primary/5" : "border-border/80 hover:bg-muted/40"
                      )}
                    >
                      <input
                        type="radio"
                        name="run-days"
                        checked={runDaysMode === option.id}
                        onChange={() => setRunDaysMode(option.id)}
                        className="mt-1 accent-primary"
                      />
                      <span className="min-w-0">
                        <span className="text-sm font-medium text-foreground block leading-5">{option.label}</span>
                        <span className="text-xs text-muted-foreground leading-4">{option.hint}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </section>

              {runDaysMode === "custom" && (
                <section className="space-y-2">
                  <p className="text-xs text-muted-foreground">Select weekdays</p>
                  <div className="flex flex-wrap gap-2">
                    {WEEKDAY_OPTIONS.map((day) => {
                      const selected = customDays.includes(day.id);
                      return (
                        <button
                          key={day.id}
                          type="button"
                          onClick={() => toggleCustomDay(day.id)}
                          className={cn(
                            "h-8 rounded-full border px-3 text-xs font-semibold transition-colors",
                            selected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-white text-foreground hover:border-primary/40"
                          )}
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}

              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Timings</h3>
                <p className="text-xs text-muted-foreground">How often this scanner should run</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
                  {RUN_TIMING_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setRunTimingMode(option.id)}
                      className={cn(
                        "rounded-lg border px-3 py-2 text-left text-sm transition-colors min-h-[44px]",
                        runTimingMode === option.id
                          ? "border-primary/50 bg-primary/5 text-foreground font-medium"
                          : "border-border/80 text-muted-foreground hover:bg-muted/40"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </section>

              {runTimingMode === "specific-time" && (
                <section className="space-y-2">
                  <p className="text-xs text-muted-foreground">Run once daily at</p>
                  <Input
                    type="time"
                    step={60}
                    value={specificTime}
                    onChange={(e) => setSpecificTime(e.target.value)}
                    className="w-full sm:w-[220px]"
                  />
                </section>
              )}

              <div className="rounded-md border border-primary/20 bg-primary/5 px-3 py-2">
                <p className="text-[11px] font-medium text-primary">Pricing for this schedule</p>
                <p className="text-xs text-primary/90 mt-0.5">Rs 10/day</p>
                <p className="text-[11px] text-primary/80 mt-1">{alertsScheduleSummary()}</p>
              </div>

              <Field label="Visibility" contentClassName="p-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPrefs((p) => ({ ...p, visibility: "private" }))}
                    className={cn(
                      "rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                      prefs.visibility === "private"
                        ? "border-primary/50 bg-primary/5 font-medium text-foreground"
                        : "border-border/80 text-muted-foreground hover:bg-muted/40"
                    )}
                  >
                    Private
                    <span className="block text-xs font-normal text-muted-foreground mt-0.5">Only you</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrefs((p) => ({ ...p, visibility: "public" }))}
                    className={cn(
                      "rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                      prefs.visibility === "public"
                        ? "border-primary/50 bg-primary/5 font-medium text-foreground"
                        : "border-border/80 text-muted-foreground hover:bg-muted/40"
                    )}
                  >
                    Public
                    <span className="block text-xs font-normal text-muted-foreground mt-0.5">
                      Discoverable on Marketplace
                    </span>
                  </button>
                </div>
              </Field>

              {error && (
                <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>
              )}
            </div>

            <DialogFooter className="p-4 sm:p-6 flex-row gap-2 justify-end border-t border-border/40 bg-muted/20">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="button" onClick={() => void handleSave()} disabled={submitting} className="gap-1.5">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {isFirstSave ? "Save screener" : "Save changes"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader className="p-6 pb-2 space-y-1.5 text-left">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-1">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <DialogTitle className="text-lg">Your screener is saved</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
                Share it to grow your following — public screeners can show up on Marketplace and are easy for
                others to clone.
              </DialogDescription>
            </DialogHeader>
            <div className="px-6 pb-6 space-y-3">
              <Button
                type="button"
                className="w-full gap-2 h-11"
                onClick={() => {
                  onShare();
                  onOpenChange(false);
                }}
              >
                <Share2 className="h-4 w-4" />
                Share screener
              </Button>
              <Button type="button" variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
                Done
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
