import { DIY_MOCK_META, mockIndicatorId } from "@/data/diyMockCatalog";
import {
  CATEGORIES,
  INDICATORS,
  getIndicator,
  type IndicatorCategory,
  type IndicatorDef,
} from "@/data/indicators";
import { isFundamentalRightAllowed } from "@/lib/fundamentalRhsCompatibility";
import { getComparisonKind, isRightComparable } from "@/lib/indicatorComparisonKind";

const COMPARE_BASE: IndicatorCategory[] = [
  "price",
  "moving_averages",
  "volatility",
  "pivot",
  "trend",
  "macd",
  "volume",
];

function categorySortKey(cat: IndicatorCategory): number {
  const i = CATEGORIES.findIndex((c) => c.key === cat);
  return i === -1 ? 999 : i;
}

function buildFundamentalCompareIndicatorDefs(): IndicatorDef[] {
  const seen = new Set<string>();
  const out: IndicatorDef[] = [];
  const add = (namespace: string, label: string) => {
    const id = mockIndicatorId(namespace, label);
    if (seen.has(id)) return;
    seen.add(id);
    out.push({
      id,
      name: label,
      category: "fundamental",
      params: [],
      outputType: "numeric",
    });
  };
  for (const row of DIY_MOCK_META) {
    add(row.namespace, row.label);
  }
  add("valuation", "Industry PE");
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Indicators allowed as the right operand for comparisons, based on the selected left indicator.
 * Pattern left sides are not used with value/indicator comparisons.
 * “Value” in the UI is always available; this list only constrains indicator picks.
 */
export function getRelevantRightIndicators(leftIndicatorId: string | null): IndicatorDef[] {
  const left = leftIndicatorId ? getIndicator(leftIndicatorId) : null;
  if (!left || left.outputType === "pattern") return [];

  const leftKind = getComparisonKind(leftIndicatorId!);

  if (leftKind === "fundamental") {
    return buildFundamentalCompareIndicatorDefs().filter((def) =>
      isFundamentalRightAllowed(leftIndicatorId!, def.id)
    );
  }

  const pool = INDICATORS.filter(
    (ind) => ind.outputType === "numeric" && COMPARE_BASE.includes(ind.category)
  );

  const list = pool.filter((ind) =>
    isRightComparable(leftKind, getComparisonKind(ind.id))
  );

  return list.sort((a, b) => {
    const d = categorySortKey(a.category) - categorySortKey(b.category);
    if (d !== 0) return d;
    return a.name.localeCompare(b.name);
  });
}
