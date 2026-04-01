import type { OperatorId } from "@/data/indicators";

export interface OhlcvRow {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ConditionState {
  id: string;
  leftIndicatorId: string;
  leftParams: Record<string, number | string>;
  operator: OperatorId | "";
  rightType: "value" | "indicator";
  rightValue: string;
  rightIndicatorId: string;
  rightParams: Record<string, number | string>;
  rightMultiplier: number;
  /** For `greater_than` / `less_than`: require left vs right by this % margin (0 = off). */
  comparisonMarginPercent: number;
  rightValue2: string;
  hasTimeModifier: boolean;
  timeModifierMode: "within_last" | "exactly_ago" | "all_of_last";
  timeModifierBars: number;
}

export interface GroupState {
  id: string;
  logic: "AND" | "OR";
  timeframe: string;
  connector: "AND" | "OR";
  conditions: ConditionState[];
}

/** When the screener should run automatically (server-side scheduling can use this later). */
export type ScreenerRunSchedule =
  | "manual"
  | "daily_after_close"
  | "daily_pre_market"
  | "weekly_sunday";

export interface ScreenerPreferences {
  runSchedule: ScreenerRunSchedule;
  notifyEmail: boolean;
  notifyPush: boolean;
  notifyInApp: boolean;
  visibility: "private" | "public";
}

export const DEFAULT_SCREENER_PREFERENCES: ScreenerPreferences = {
  runSchedule: "manual",
  notifyEmail: false,
  notifyPush: false,
  notifyInApp: true,
  visibility: "private",
};

export interface QueryState {
  name: string;
  universe: string;
  groups: GroupState[];
  description?: string;
  /** Saved with the screener; ignored by the scan engine. */
  preferences?: ScreenerPreferences;
}

export interface IndicatorColumn {
  key: string;
  label: string;
  indicatorId: string;
  params: Record<string, number | string>;
}

export interface ScanResultRow {
  symbol: string;
  name: string;
  close: number;
  change1d: number;
  volume: number;
  marketCap?: number;
  matchedGroups: number;
  indicatorValues: Record<string, number>;
}

export interface ScanProgress {
  phase: "loading_data" | "computing" | "done" | "error";
  message: string;
  matched?: number;
  total?: number;
}
