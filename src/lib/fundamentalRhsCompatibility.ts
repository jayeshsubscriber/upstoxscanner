import {
  DIY_MOCK_FUNDAMENTAL_NAMESPACES,
  DIY_MOCK_META,
  type FundamentalRhsKind,
  mockIndicatorId,
} from "@/data/diyMockCatalog";

/**
 * Which RHS fundamental kinds are allowed when the left operand has this kind.
 * Keeps ratio/multiple metrics away from plain cash balances and F&O away from fundamentals.
 */
const ALLOWED_FUNDAMENTAL_RHS: Record<FundamentalRhsKind, Set<FundamentalRhsKind>> = {
  valuation_multiple: new Set(["valuation_multiple", "financial_ratio"]),
  financial_ratio: new Set(["valuation_multiple", "financial_ratio", "growth_or_stat"]),
  profitability_amount: new Set(["profitability_amount", "profitability_percent", "growth_or_stat"]),
  profitability_percent: new Set(["profitability_amount", "profitability_percent", "growth_or_stat"]),
  cash_balance_or_flow_amount: new Set(["cash_balance_or_flow_amount"]),
  growth_or_stat: new Set([
    "growth_or_stat",
    "financial_ratio",
    "profitability_percent",
    "profitability_amount",
  ]),
  fno: new Set(["fno"]),
};

const KIND_BY_MOCK_ID = new Map<string, FundamentalRhsKind>();

for (const row of DIY_MOCK_META) {
  KIND_BY_MOCK_ID.set(mockIndicatorId(row.namespace, row.label), row.rhsKind);
}
KIND_BY_MOCK_ID.set(mockIndicatorId("valuation", "Industry PE"), "valuation_multiple");

function inferKindFromMockId(indicatorId: string): FundamentalRhsKind | null {
  const parts = indicatorId.split(":");
  const ns = parts[1]?.toLowerCase() ?? "";
  if (!DIY_MOCK_FUNDAMENTAL_NAMESPACES.has(ns)) return null;
  if (ns === "cashflow") return "cash_balance_or_flow_amount";
  if (ns === "fno") return "fno";
  if (ns === "valuation") return "valuation_multiple";
  if (ns === "financial") return "financial_ratio";
  if (ns === "profitability") return "profitability_amount";
  return null;
}

export function getFundamentalRhsKind(indicatorId: string): FundamentalRhsKind | null {
  if (!indicatorId.startsWith("mock:")) return null;
  const ns = indicatorId.split(":")[1]?.toLowerCase() ?? "";
  if (!DIY_MOCK_FUNDAMENTAL_NAMESPACES.has(ns)) return null;
  return KIND_BY_MOCK_ID.get(indicatorId) ?? inferKindFromMockId(indicatorId);
}

export function isFundamentalRightAllowed(leftIndicatorId: string, rightIndicatorId: string): boolean {
  const lk = getFundamentalRhsKind(leftIndicatorId);
  const rk = getFundamentalRhsKind(rightIndicatorId);
  if (lk === null || rk === null) return true;
  return ALLOWED_FUNDAMENTAL_RHS[lk]?.has(rk) ?? false;
}
