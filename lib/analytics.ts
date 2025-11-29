import { TradeNote } from "./types";

export interface AnalyticsSummary {
  totalTrades: number;
  winRate: number;
  totalProfit: number;
  totalLoss: number;
  netProfit: number;
  averageProfit: number;
  averageLoss: number;
  profitFactor: number;
  maxWin: number;
  maxLoss: number;
  winCount: number;
  lossCount: number;
  averageRR: number;
  maxRR: number;
  minRR: number;
}

export interface GroupedStats {
  key: string;
  count: number;
  winCount: number;
  winRate: number;
  netProfit: number;
}

export const calculateSummary = (notes: TradeNote[]): AnalyticsSummary => {
  const finishedTrades = notes.filter((n) => n.tradeResult);
  const totalTrades = finishedTrades.length;
  if (totalTrades === 0) {
    return {
      totalTrades: 0,
      winRate: 0,
      totalProfit: 0,
      totalLoss: 0,
      netProfit: 0,
      averageProfit: 0,
      averageLoss: 0,
      profitFactor: 0,
      maxWin: 0,
      maxLoss: 0,
      winCount: 0,
      lossCount: 0,
      averageRR: 0,
      maxRR: 0,
      minRR: 0,
    };
  }

  const winCount = finishedTrades.filter((n) => n.tradeResult === "WIN").length;
  const winRate = (winCount / totalTrades) * 100;

  let totalProfit = 0;
  let totalLoss = 0;
  let maxWin = 0;
  let maxLoss = 0;

  finishedTrades.forEach((n) => {
    if (n.tradeResult === "WIN") {
      totalProfit += n.potentialProfit;
      if (n.potentialProfit > maxWin) {
        maxWin = n.potentialProfit;
      }
    } else if (n.tradeResult === "LOSS") {
      totalLoss += n.actualLoss;
      if (Math.abs(n.actualLoss) > Math.abs(maxLoss)) {
        maxLoss = n.actualLoss;
      }
    }
  });

  const netProfit = totalProfit + totalLoss; // totalLoss is already negative
  const averageProfit = winCount > 0 ? totalProfit / winCount : 0;
  const lossCount = totalTrades - winCount;
  const averageLoss = lossCount > 0 ? Math.abs(totalLoss / lossCount) : 0; // Use absolute value
  const profitFactor =
    totalLoss !== 0
      ? totalProfit / Math.abs(totalLoss)
      : totalProfit > 0
      ? 999
      : 0;

  // Calculate average RR from riskRewardRatio field
  const rrValues = finishedTrades.map((n) => n.riskRewardRatio || 0);
  const totalRR = rrValues.reduce((sum, rr) => sum + rr, 0);
  const averageRR = totalTrades > 0 ? totalRR / totalTrades : 0;
  const maxRR = rrValues.length > 0 ? Math.max(...rrValues) : 0;
  const minRR = rrValues.length > 0 ? Math.min(...rrValues) : 0;

  return {
    totalTrades,
    winRate,
    totalProfit,
    totalLoss,
    netProfit,
    averageProfit,
    averageLoss,
    profitFactor,
    maxWin,
    maxLoss,
    winCount,
    lossCount,
    averageRR,
    maxRR,
    minRR,
  };
};

const createGroupedStats = (
  items: TradeNote[],
  keySelector: (n: TradeNote) => string | string[]
): GroupedStats[] => {
  const groups: Record<string, TradeNote[]> = {};

  items.forEach((n) => {
    if (!n.tradeResult) return;
    const keys = keySelector(n);
    const keyArray = Array.isArray(keys) ? keys : [keys];

    keyArray.forEach((k) => {
      if (!groups[k]) groups[k] = [];
      groups[k].push(n);
    });
  });

  return Object.entries(groups)
    .map(([key, notes]) => {
      const summary = calculateSummary(notes);
      return {
        key,
        count: summary.totalTrades,
        winCount: notes.filter((n) => n.tradeResult === "WIN").length,
        winRate: summary.winRate,
        netProfit: summary.netProfit,
      };
    })
    .sort((a, b) => b.netProfit - a.netProfit); // Default sort by profit
};

export const calculateByCurrency = (notes: TradeNote[]): GroupedStats[] => {
  return createGroupedStats(notes, (n) => n.currencyPair || "USD/JPY");
};

export const calculateByEntryBasis = (notes: TradeNote[]): GroupedStats[] => {
  return createGroupedStats(notes, (n) =>
    n.entryBasis
      ? n.entryBasis
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : ["Unlabeled"]
  );
};

export const calculateByDayOfWeek = (notes: TradeNote[]): GroupedStats[] => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const stats = createGroupedStats(
    notes,
    (n) => days[new Date(n.timestamp).getDay()]
  );

  // Sort by day order instead of profit
  return stats.sort((a, b) => days.indexOf(a.key) - days.indexOf(b.key));
};

export const calculateByTimeOfDay = (notes: TradeNote[]): GroupedStats[] => {
  const stats = createGroupedStats(notes, (n) => {
    const hour = new Date(n.timestamp).getHours();
    return `${hour.toString().padStart(2, "0")}:00`;
  });

  // Sort by time
  return stats.sort((a, b) => a.key.localeCompare(b.key));
};
