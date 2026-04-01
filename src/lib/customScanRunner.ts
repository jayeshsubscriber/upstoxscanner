/**
 * Custom scan runner: reads cached OHLCV from Supabase,
 * runs condition evaluator for each stock, returns matches.
 */
import { supabase } from "@/lib/supabase";
import type { OhlcvRow, QueryState, ScanResultRow, ScanProgress, IndicatorColumn } from "@/types/screener";
import { evaluateQuery } from "@/lib/conditionEvaluator";
import { computeIndicator } from "@/lib/indicators";
import { getIndicator } from "@/data/indicators";
import { getInstrumentList, type Instrument } from "@/lib/scannerDataPipeline";

/** Map of timeframe UI values → which Supabase table to query */
const TIMEFRAME_TABLE: Record<string, "stock_candles_1d" | "stock_candles_15m" | "stock_candles_1m"> = {
  "1d": "stock_candles_1d",
  "15m": "stock_candles_15m",
  "1M": "stock_candles_1m",
};

type CandleTable = "stock_candles_1d" | "stock_candles_15m" | "stock_candles_1m";

/** Load all OHLCV rows for a given symbol from the correct table.
 *  Uses .limit(5000) to override Supabase's default 1000-row cap. */
async function loadOhlcv(
  symbol: string,
  table: CandleTable
): Promise<OhlcvRow[]> {
  if (!supabase) return [];

  if (table === "stock_candles_1d") {
    const { data, error } = await supabase
      .from(table)
      .select("date, open, high, low, close, volume")
      .eq("symbol", symbol)
      .order("date", { ascending: true })
      .limit(5000);
    if (error || !data) return [];
    return data.map((r) => ({
      date: r.date as string,
      open: Number(r.open),
      high: Number(r.high),
      low: Number(r.low),
      close: Number(r.close),
      volume: Number(r.volume),
    }));
  }

  if (table === "stock_candles_1m") {
    const { data, error } = await supabase
      .from(table)
      .select("month, open, high, low, close, volume")
      .eq("symbol", symbol)
      .order("month", { ascending: true })
      .limit(500);
    if (error || !data) return [];
    return data.map((r) => ({
      date: (r.month as string).slice(0, 10),
      open: Number(r.open),
      high: Number(r.high),
      low: Number(r.low),
      close: Number(r.close),
      volume: Number(r.volume),
    }));
  }

  // 15m table — can have 1500+ rows per stock, must exceed default 1000 limit
  const { data, error } = await supabase
    .from(table)
    .select("ts, open, high, low, close, volume")
    .eq("symbol", symbol)
    .order("ts", { ascending: true })
    .limit(5000);
  if (error || !data) return [];
  return data.map((r) => ({
    date: r.ts as string,
    open: Number(r.open),
    high: Number(r.high),
    low: Number(r.low),
    close: Number(r.close),
    volume: Number(r.volume),
  }));
}

/** Determine which unique timeframes are used across all groups. */
function getRequiredTimeframes(query: QueryState): string[] {
  const tfs = new Set<string>();
  for (const g of query.groups) {
    tfs.add(g.timeframe || "1d");
  }
  return Array.from(tfs);
}

/** Build a unique key for an indicator + params combination. */
function indicatorKey(id: string, params: Record<string, number | string>): string {
  const ind = getIndicator(id);
  if (!ind) return id;
  const paramParts = ind.params
    .filter((p) => p.type === "number")
    .map((p) => String(params[p.key] ?? p.defaultValue));
  return paramParts.length > 0 ? `${id}_${paramParts.join("_")}` : id;
}

function indicatorLabel(id: string, params: Record<string, number | string>): string {
  const ind = getIndicator(id);
  if (!ind) return id;
  const numParams = ind.params.filter((p) => p.type === "number");
  if (numParams.length === 0) return ind.name;
  const vals = numParams.map((p) => params[p.key] ?? p.defaultValue).join(",");
  return `${ind.name}(${vals})`;
}

/** Extract unique indicator columns from the query (both left and right operands). */
export function extractIndicatorColumns(query: QueryState): IndicatorColumn[] {
  const seen = new Set<string>();
  const cols: IndicatorColumn[] = [];

  for (const group of query.groups) {
    for (const cond of group.conditions) {
      if (cond.leftIndicatorId) {
        const ind = getIndicator(cond.leftIndicatorId);
        if (ind && ind.outputType === "numeric") {
          const key = indicatorKey(cond.leftIndicatorId, cond.leftParams);
          if (!seen.has(key)) {
            seen.add(key);
            cols.push({
              key,
              label: indicatorLabel(cond.leftIndicatorId, cond.leftParams),
              indicatorId: cond.leftIndicatorId,
              params: cond.leftParams,
            });
          }
        }
      }
      if (cond.rightType === "indicator" && cond.rightIndicatorId) {
        const ind = getIndicator(cond.rightIndicatorId);
        if (ind && ind.outputType === "numeric") {
          const key = indicatorKey(cond.rightIndicatorId, cond.rightParams);
          if (!seen.has(key)) {
            seen.add(key);
            cols.push({
              key,
              label: indicatorLabel(cond.rightIndicatorId, cond.rightParams),
              indicatorId: cond.rightIndicatorId,
              params: cond.rightParams,
            });
          }
        }
      }
    }
  }
  return cols;
}

/** Compute latest indicator values for a stock given its OHLCV data. */
function computeIndicatorValues(
  columns: IndicatorColumn[],
  ohlcvByTimeframe: Record<string, OhlcvRow[]>,
  defaultTf: string
): Record<string, number> {
  const values: Record<string, number> = {};
  const data = ohlcvByTimeframe[defaultTf] ?? Object.values(ohlcvByTimeframe)[0] ?? [];
  if (data.length === 0) return values;

  for (const col of columns) {
    const series = computeIndicator(col.indicatorId, col.params, data);
    const lastVal = series[series.length - 1];
    values[col.key] = Number.isNaN(lastVal) ? 0 : lastVal;
  }
  return values;
}

export async function runCustomScan(
  query: QueryState,
  onProgress?: (p: ScanProgress) => void
): Promise<ScanResultRow[]> {
  if (!supabase) {
    return runDummyScan(query, onProgress);
  }

  onProgress?.({ phase: "loading_data", message: "Loading instruments...", total: 0, matched: 0 });

  const instruments = await getInstrumentList(query.universe);
  const requiredTfs = getRequiredTimeframes(query);

  // Validate that we only use supported timeframes
  for (const tf of requiredTfs) {
    if (!TIMEFRAME_TABLE[tf]) {
      throw new Error(
        `Timeframe "${tf}" not yet supported. Only Daily (1d), 15-minute (15m), and Monthly (1M) are available.`
      );
    }
  }

  const indicatorCols = extractIndicatorColumns(query);
  const results: ScanResultRow[] = [];
  const total = instruments.length;

  onProgress?.({ phase: "computing", message: `Evaluating ${total} stocks...`, total, matched: 0 });

  const batchSize = 5;
  for (let i = 0; i < instruments.length; i += batchSize) {
    const batch = instruments.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(
      batch.map(async (inst) => {
        return evaluateStock(inst, query, requiredTfs, indicatorCols);
      })
    );

    for (const r of batchResults) {
      if (r.status === "fulfilled" && r.value) results.push(r.value);
    }

    onProgress?.({
      phase: "computing",
      message: `Evaluated ${Math.min(i + batchSize, total)} / ${total}`,
      total,
      matched: results.length,
    });
  }

  onProgress?.({
    phase: "done",
    message: `Found ${results.length} matches out of ${total} stocks`,
    total,
    matched: results.length,
  });

  return results;
}

function runDummyScan(
  query: QueryState,
  onProgress?: (p: ScanProgress) => void
): ScanResultRow[] {
  onProgress?.({ phase: "loading_data", message: "Loading sample stocks...", total: 12, matched: 0 });
  onProgress?.({ phase: "computing", message: "Running scan on sample data...", total: 12, matched: 0 });

  const indicatorCols = extractIndicatorColumns(query);
  const matchedGroups = Math.max(1, query.groups.length);

  const seedRows = [
    { symbol: "RELIANCE", name: "Reliance Industries", close: 2847.5, change1d: 2.14, volume: 4820000 },
    { symbol: "HDFCBANK", name: "HDFC Bank", close: 1692.3, change1d: 1.87, volume: 6120000 },
    { symbol: "INFY", name: "Infosys", close: 1548.75, change1d: 3.42, volume: 8940000 },
    { symbol: "ICICIBANK", name: "ICICI Bank", close: 1124.6, change1d: 1.64, volume: 9840000 },
    { symbol: "TCS", name: "Tata Consultancy Services", close: 4231.2, change1d: 0.92, volume: 2380000 },
    { symbol: "SBIN", name: "State Bank of India", close: 832.1, change1d: 2.28, volume: 11200000 },
    { symbol: "LT", name: "Larsen & Toubro", close: 3720.4, change1d: 1.35, volume: 1860000 },
    { symbol: "BHARTIARTL", name: "Bharti Airtel", close: 1459.95, change1d: 2.02, volume: 5140000 },
    { symbol: "AXISBANK", name: "Axis Bank", close: 1188.4, change1d: 1.28, volume: 4720000 },
    { symbol: "SUNPHARMA", name: "Sun Pharma", close: 1234.85, change1d: 1.28, volume: 2840000 },
    { symbol: "BAJFINANCE", name: "Bajaj Finance", close: 7842.3, change1d: 2.74, volume: 1890000 },
    { symbol: "TATAMOTORS", name: "Tata Motors", close: 876.4, change1d: 4.12, volume: 12000000 },
  ];

  const results: ScanResultRow[] = seedRows.slice(0, 10).map((row, index) => {
    const indicatorValues: Record<string, number> = {};
    for (const col of indicatorCols) {
      // Stable sample indicator values so table columns remain populated.
      indicatorValues[col.key] = Number((row.close * (0.94 + ((index % 5) + 1) * 0.01)).toFixed(2));
    }

    return {
      symbol: row.symbol,
      name: row.name,
      close: row.close,
      change1d: row.change1d,
      volume: row.volume,
      matchedGroups,
      indicatorValues,
    };
  });

  onProgress?.({
    phase: "done",
    message: `Showing ${results.length} sample matches`,
    total: seedRows.length,
    matched: results.length,
  });

  return results;
}

async function evaluateStock(
  inst: Instrument,
  query: QueryState,
  requiredTfs: string[],
  indicatorCols: IndicatorColumn[]
): Promise<ScanResultRow | null> {
  try {
    const ohlcvByTimeframe: Record<string, OhlcvRow[]> = {};
    for (const tf of requiredTfs) {
      const table = TIMEFRAME_TABLE[tf];
      if (table) {
        ohlcvByTimeframe[tf] = await loadOhlcv(inst.symbol, table);
      }
    }

    const hasData = Object.values(ohlcvByTimeframe).some((d) => d.length > 0);
    if (!hasData) return null;

    const evalResult = evaluateQuery(query, ohlcvByTimeframe);
    if (!evalResult.match) return null;

    const defaultTf = requiredTfs[0] || "1d";
    const dailyData = ohlcvByTimeframe["1d"] ?? ohlcvByTimeframe["15m"] ?? ohlcvByTimeframe["1M"] ?? [];
    const last = dailyData[dailyData.length - 1];
    const prev = dailyData.length >= 2 ? dailyData[dailyData.length - 2] : null;

    const indicatorValues = computeIndicatorValues(indicatorCols, ohlcvByTimeframe, defaultTf);

    return {
      symbol: inst.symbol,
      name: inst.name,
      close: last?.close ?? 0,
      change1d: prev && prev.close > 0 ? ((last!.close - prev.close) / prev.close) * 100 : 0,
      volume: last?.volume ?? 0,
      matchedGroups: evalResult.matchedGroups,
      indicatorValues,
    };
  } catch (e) {
    console.warn(`[scan] Error evaluating ${inst.symbol}:`, e);
    return null;
  }
}
