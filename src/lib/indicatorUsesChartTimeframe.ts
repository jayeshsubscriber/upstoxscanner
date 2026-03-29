import { DIY_MOCK_FUNDAMENTAL_NAMESPACES } from "@/data/diyMockCatalog";
import type { ConditionState, GroupState } from "@/types/screener";

/**
 * True when the indicator is evaluated on OHLCV bar series and a chart timeframe is meaningful.
 * Mock DIY fundamentals / F&O catalog items use `mock:` ids under known namespaces — no bar picker.
 */
export function indicatorUsesChartTimeframe(indicatorId: string | null | undefined): boolean {
  if (!indicatorId) return false;
  if (indicatorId.startsWith("mock:")) {
    const ns = indicatorId.split(":")[1]?.toLowerCase() ?? "";
    return !DIY_MOCK_FUNDAMENTAL_NAMESPACES.has(ns);
  }
  return true;
}

export function conditionUsesChartTimeframe(c: ConditionState): boolean {
  if (indicatorUsesChartTimeframe(c.leftIndicatorId)) return true;
  if (c.rightType === "indicator" && c.rightIndicatorId && indicatorUsesChartTimeframe(c.rightIndicatorId)) {
    return true;
  }
  return false;
}

export function groupUsesChartTimeframe(group: GroupState): boolean {
  return group.conditions.some(conditionUsesChartTimeframe);
}
