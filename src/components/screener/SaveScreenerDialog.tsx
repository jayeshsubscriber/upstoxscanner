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
import type { ScreenerPreferences, ScreenerRunSchedule } from "@/types/screener";
import { DEFAULT_SCREENER_PREFERENCES } from "@/types/screener";

const RUN_SCHEDULE_OPTIONS: { value: ScreenerRunSchedule; label: string; hint: string }[] = [
  { value: "manual", label: "Only when I open it", hint: "No automatic runs" },
  { value: "daily_after_close", label: "Daily after market close", hint: "Typical for end-of-day screeners" },
  { value: "daily_pre_market", label: "Daily before market open", hint: "See matches before the bell" },
  { value: "weekly_sunday", label: "Weekly (Sunday)", hint: "Lightweight, weekly digest style" },
];

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

  useEffect(() => {
    if (!open) return;
    setStep("form");
    setName(initialName);
    setDescription(initialDescription);
    setPrefs({ ...DEFAULT_SCREENER_PREFERENCES, ...initialPreferences });
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

  function toggleNotify(key: keyof Pick<ScreenerPreferences, "notifyEmail" | "notifyPush" | "notifyInApp">) {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
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
                  ? "Name it, choose how it runs, and turn on alerts. You can change this anytime."
                  : "Update name, schedule, notifications, and visibility."}
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

              <Field label="Run schedule" contentClassName="p-2">
                <div className="space-y-2">
                  {RUN_SCHEDULE_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={cn(
                        "flex items-start gap-3 rounded-lg border p-2.5 cursor-pointer transition-colors",
                        prefs.runSchedule === opt.value
                          ? "border-primary/50 bg-primary/5"
                          : "border-border/80 hover:bg-muted/40"
                      )}
                    >
                      <input
                        type="radio"
                        name="runSchedule"
                        checked={prefs.runSchedule === opt.value}
                        onChange={() => setPrefs((p) => ({ ...p, runSchedule: opt.value }))}
                        className="mt-1 accent-primary"
                      />
                      <span className="min-w-0">
                        <span className="text-sm font-medium text-foreground block">{opt.label}</span>
                        <span className="text-xs text-muted-foreground">{opt.hint}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </Field>

              <div className="space-y-2">
                <span className="text-xs font-medium text-muted-foreground">Tell me when new stocks match</span>
                <div className="rounded-lg border border-border/80 divide-y divide-border/60">
                  {(
                    [
                      ["notifyInApp", "In-app", "Inside Upstox Scanners"] as const,
                      ["notifyEmail", "Email", "Send to your registered email"] as const,
                      ["notifyPush", "Push", "Mobile push when available"] as const,
                    ] as const
                  ).map(([key, title, sub]) => (
                    <label
                      key={key}
                      className="flex items-center justify-between gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/30"
                    >
                      <span>
                        <span className="text-sm font-medium text-foreground block">{title}</span>
                        <span className="text-xs text-muted-foreground">{sub}</span>
                      </span>
                      <input
                        type="checkbox"
                        checked={prefs[key]}
                        onChange={() => toggleNotify(key)}
                        className="h-4 w-4 rounded border-input accent-primary"
                      />
                    </label>
                  ))}
                </div>
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
