/** Labels and ID helpers for DIY sidebar “mock:” indicators (not in INDICATORS catalog). */

/** Semantic bucket for fundamental-vs-fundamental RHS filtering (not evaluator units). */
export type FundamentalRhsKind =
  | "valuation_multiple"
  | "financial_ratio"
  | "profitability_amount"
  | "profitability_percent"
  | "cash_balance_or_flow_amount"
  | "growth_or_stat"
  | "fno";

export interface DiyMockMeta {
  namespace:
    | "valuation"
    | "financial"
    | "profitability"
    | "cashflow"
    | "incomegrowth"
    | "balancesheet"
    | "shareholding"
    | "fno";
  label: string;
  rhsKind: FundamentalRhsKind;
}

/** Namespaces whose mock ids are treated as fundamentals (compare-with + `getIndicator` category). */
export const DIY_MOCK_FUNDAMENTAL_NAMESPACES = new Set([
  "valuation",
  "financial",
  "profitability",
  "cashflow",
  "incomegrowth",
  "balancesheet",
  "shareholding",
  "fno",
]);

export function mockIndicatorId(namespace: string, label: string): string {
  const slug = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `mock:${namespace}:${slug}`;
}

const VALUATION_LABELS = [
  "PE Ratio",
  "Forward PE Ratio",
  "PE Premium vs Sector",
  "PE Premium vs Sub-sector",
  "TTM PE Ratio",
  "PB Ratio",
  "PB Premium vs Sector",
  "PB Premium vs Sub-sector",
  "PS Ratio",
  "Forward PS Ratio",
  "PS Premium vs Sector",
  "PS Premium vs Sub-sector",
  "Dividend Yield",
  "Dividend Yield vs Sector",
  "Dividend Yield vs Sub-sector",
  "EV/EBITDA Ratio",
  "Enterprise Value",
  "EV / EBIT Ratio",
  "EV / Revenue Ratio",
  "EV / Invested Capital",
  "EV / Free Cash Flow",
  "Price / Free Cash Flow",
  "Price / CFO",
  "Price / Sales",
  "Sector PE",
  "Sector PB",
  "Sector Dividend Yield",
] as const;

const VALUATION_NOTIONAL: Record<string, FundamentalRhsKind> = {
  "Enterprise Value": "profitability_amount",
};

const FINANCIAL_LABELS = [
  "Market Cap",
  "ROE",
  "ROA",
  "ROCE",
  "Debt to Equity",
  "Current Ratio",
  "Quick Ratio",
  "Interest Coverage",
  "Book Value per Share",
] as const;

const PROFITABILITY_PERCENT_LABELS = new Set([
  "OPM",
  "NPM",
  "OPM last year",
  "NPM last year",
  "OPM preceding year",
  "NPM preceding year",
]);

function profitabilityRhsKind(label: string): FundamentalRhsKind {
  if (
    /\bgrowth\b/i.test(label) ||
    /\bmedian\b/i.test(label) ||
    /^\s*(Sales|Profit|EBIDT|EPS|Net [Pp]rofit)\s+growth\b/i.test(label) ||
    /growth\s+\d+[Yy]ears?/i.test(label) ||
    /Change in promoter holding 3Years/i.test(label)
  ) {
    return "growth_or_stat";
  }
  if (label === "Return on capital employed") return "financial_ratio";
  if (PROFITABILITY_PERCENT_LABELS.has(label)) return "profitability_percent";
  return "profitability_amount";
}

const PROFITABILITY_LABELS = [
  "Sales",
  "OPM",
  "Profit after tax",
  "Return on capital employed",
  "EPS",
  "Change in promoter holding",
  "Sales last year",
  "Operating profit last year",
  "Other income last year",
  "EBIDT last year",
  "Depreciation last year",
  "EBIT last year",
  "Interest last year",
  "Profit before tax last year",
  "Tax last year",
  "Profit after tax last year",
  "Extraordinary items last year",
  "Net Profit last year",
  "Dividend last year",
  "Material cost last year",
  "Employee cost last year",
  "OPM last year",
  "NPM last year",
  "Operating profit",
  "Interest",
  "Depreciation",
  "EPS last year",
  "EBIT",
  "Net profit",
  "Current Tax",
  "Tax",
  "Other income",
  "TTM Result Date",
  "Last annual result date",
  "Sales preceding year",
  "Operating profit preceding year",
  "Other income preceding year",
  "EBIDT preceding year",
  "Depreciation preceding year",
  "EBIT preceding year",
  "Interest preceding year",
  "Profit before tax preceding year",
  "Tax preceding year",
  "Profit after tax preceding year",
  "Extraordinary items preceding year",
  "Net Profit preceding year",
  "Dividend preceding year",
  "OPM preceding year",
  "NPM preceding year",
  "EPS preceding year",
  "Sales preceding 12months",
  "Net profit preceding 12months",
  "Sales growth 3Years",
  "Sales growth 5Years",
  "Profit growth 3Years",
  "Profit growth 5Years",
  "Sales growth 10years median",
  "Sales growth 5years median",
  "Sales growth 7Years",
  "Sales growth 10Years",
  "EBIDT growth 3Years",
  "EBIDT growth 5Years",
  "EBIDT growth 7Years",
  "EBIDT growth 10Years",
  "EPS growth 3Years",
  "EPS growth 5Years",
  "EPS growth 7Years",
  "EPS growth 10Years",
  "Profit growth 7Years",
  "Profit growth 10Years",
  "Change in promoter holding 3Years",
  "Average Earnings 5Year",
  "Average Earnings 10Year",
  "Average EBIT 5Year",
  "Average EBIT 10Year",
] as const;

const CASH_FLOW_LABELS = [
  "Cash from operations last year",
  "Free cash flow last year",
  "Cash from investing last year",
  "Cash from financing last year",
  "Net cash flow last year",
  "Cash beginning of last year",
  "Cash end of last year",
  "Free cash flow preceding year",
  "Cash from operations preceding year",
  "Cash from investing preceding year",
  "Cash from financing preceding year",
  "Net cash flow preceding year",
  "Cash beginning of preceding year",
  "Cash end of preceding year",
  "Free cash flow 3years",
  "Free cash flow 5years",
  "Free cash flow 7years",
  "Free cash flow 10years",
  "Operating cash flow 3years",
  "Operating cash flow 5years",
  "Operating cash flow 7years",
  "Operating cash flow 10years",
  "Investing cash flow 10years",
  "Investing cash flow 7years",
  "Investing cash flow 5years",
  "Investing cash flow 3years",
  "Cash 3Years back",
  "Cash 5Years back",
  "Cash 7Years back",
] as const;

const INCOME_GROWTH_LABELS = [
  "Revenue (TTM)",
  "Profit After Tax (TTM)",
  "EPS (TTM)",
  "Revenue (Latest Quarter)",
  "Profit After Tax (Latest Quarter)",
  "EPS (Latest Quarter)",
  "Revenue Growth (TTM)",
  "Profit Growth (TTM)",
  "EPS Growth (TTM)",
  "Revenue Growth (3Y CAGR)",
  "Profit Growth (3Y CAGR)",
  "EPS Growth (3Y CAGR)",
  "Revenue Growth (5Y CAGR)",
  "Profit Growth (5Y CAGR)",
  "EPS Growth (5Y CAGR)",
  "Quarterly sales growth (YoY)",
  "Quarterly profit growth (YoY)",
  "Change in promoter holding",
] as const;

const BALANCE_SHEET_LABELS = [
  "Debt",
  "Working capital",
  "Total Assets",
  "Current assets",
  "Current liabilities",
  "Cash Equivalents",
  "Inventory",
  "Trade receivables",
  "Trade Payables",
  "Net block",
  "Investments",
  "Contingent liabilities",
] as const;

const SHAREHOLDING_LABELS = [
  "Promoter holding",
  "FII holding",
  "DII holding",
  "Public holding",
  "Change in FII holding",
  "Change in DII holding",
  "Change in Promoter Holding",
  "Unpledged promoter holding",
  "Pledged percentage",
  "Number of Shareholders",
  "Number of Shareholders preceding quarter",
  "Number of Shareholders 1year back",
  "Change in FII holding 3Years",
  "Change in DII holding 3Years",
] as const;

const FNO_LABELS = [
  "Fair Value",
  "Future Close Price",
  "Lot Size",
  "Future Open Interest",
  "1D Change in Future OI",
  "1W Change in Future OI",
  "Future Volume",
  "1D Change in Future Volume",
  "1W Change in Future Volume",
  "Basis",
  "Fair Value Spread",
  "Cash & Carry Profit",
  "Rollover Cost",
  "Percentage Rollover",
  "Calendar Spread",
  "Call Open Interest",
  "Put Open Interest",
  "1D Change in Call OI",
  "1D Change in Put OI",
  "1W Change in Call OI",
  "1W Change in Put OI",
  "Highest Call OI Strike",
  "Highest Put OI Strike",
  "Highest 1D OI Change CE Strike",
  "Highest 1D OI Change PE Strike",
  "Highest 1W OI Change CE Strike",
  "Highest 1W OI Change PE Strike",
  "Put Call Ratio",
  "1D Change in Put Call Ratio",
] as const;

const VALUATION_META: DiyMockMeta[] = VALUATION_LABELS.map((label) => ({
  namespace: "valuation",
  label,
  rhsKind: VALUATION_NOTIONAL[label] ?? "valuation_multiple",
}));

const FINANCIAL_META: DiyMockMeta[] = FINANCIAL_LABELS.map((label) => ({
  namespace: "financial",
  label,
  rhsKind: label === "Market Cap" ? "profitability_amount" : "financial_ratio",
}));

const PROFITABILITY_META: DiyMockMeta[] = PROFITABILITY_LABELS.map((label) => ({
  namespace: "profitability",
  label,
  rhsKind: profitabilityRhsKind(label),
}));

const CASH_FLOW_META: DiyMockMeta[] = CASH_FLOW_LABELS.map((label) => ({
  namespace: "cashflow",
  label,
  rhsKind: "cash_balance_or_flow_amount" as const,
}));

const INCOME_GROWTH_META: DiyMockMeta[] = INCOME_GROWTH_LABELS.map((label) => ({
  namespace: "incomegrowth",
  label,
  rhsKind: /\b(growth|cagr|yoy)\b/i.test(label) ? "growth_or_stat" : "profitability_amount",
}));

const BALANCE_SHEET_META: DiyMockMeta[] = BALANCE_SHEET_LABELS.map((label) => ({
  namespace: "balancesheet",
  label,
  rhsKind: "cash_balance_or_flow_amount" as const,
}));

const SHAREHOLDING_META: DiyMockMeta[] = SHAREHOLDING_LABELS.map((label) => ({
  namespace: "shareholding",
  label,
  rhsKind: "growth_or_stat" as const,
}));

const FNO_META: DiyMockMeta[] = FNO_LABELS.map((label) => ({
  namespace: "fno",
  label,
  rhsKind: "fno" as const,
}));

/** Full DIY mock catalog with RHS semantics (single source of truth). */
export const DIY_MOCK_META: readonly DiyMockMeta[] = [
  ...VALUATION_META,
  ...FINANCIAL_META,
  ...PROFITABILITY_META,
  ...CASH_FLOW_META,
  ...INCOME_GROWTH_META,
  ...BALANCE_SHEET_META,
  ...SHAREHOLDING_META,
  ...FNO_META,
];

export const VALUATION_ITEMS = VALUATION_META.map((m) => m.label);
export const FINANCIAL_RATIOS_ITEMS = FINANCIAL_META.map((m) => m.label);
export const PROFITABILITY_ITEMS = PROFITABILITY_META.map((m) => m.label);
export const CASH_FLOW_ITEMS = CASH_FLOW_META.map((m) => m.label);
export const INCOME_GROWTH_ITEMS = INCOME_GROWTH_META.map((m) => m.label);
export const BALANCE_SHEET_ITEMS = BALANCE_SHEET_META.map((m) => m.label);
export const SHAREHOLDING_ITEMS = SHAREHOLDING_META.map((m) => m.label);
export const FUTURES_OPTIONS_ITEMS = FNO_META.map((m) => m.label);
