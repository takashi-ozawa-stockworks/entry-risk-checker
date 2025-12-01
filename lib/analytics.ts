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

export interface StreakStats {
  currentStreak: number; // Positive for win streak, negative for loss streak
  maxWinStreak: number;
  maxLossStreak: number;
  averageWinStreak: number;
  averageLossStreak: number;
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
      // Use actual profit if available, otherwise expected
      const profit = n.actualProfit ?? n.expectedProfit;
      totalProfit += profit;
      if (profit > maxWin) {
        maxWin = profit;
      }
    } else if (n.tradeResult === "LOSS") {
      // Use actual loss if available, otherwise expected
      const loss = n.actualLoss ?? n.expectedLoss;
      totalLoss += loss;
      if (Math.abs(loss) > Math.abs(maxLoss)) {
        maxLoss = loss;
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
    (n) => days[new Date(n.entryTimestamp).getDay()]
  );

  // Sort by day order instead of profit
  return stats.sort((a, b) => days.indexOf(a.key) - days.indexOf(b.key));
};

export const calculateByTimeOfDay = (notes: TradeNote[]): GroupedStats[] => {
  const stats = createGroupedStats(notes, (n) => {
    const hour = new Date(n.entryTimestamp).getHours();
    return `${hour.toString().padStart(2, "0")}:00`;
  });

  // Sort by time
  return stats.sort((a, b) => a.key.localeCompare(b.key));
};

// New Analysis Functions

export const calculateByRuleCompliance = (
  notes: TradeNote[]
): GroupedStats[] => {
  const stats = createGroupedStats(notes, (n) => {
    if (!n.ruleCompliance) return "Unknown";
    if (n.ruleCompliance === "FULL") return "完全遵守";
    if (n.ruleCompliance === "VIOLATED") {
      const violationCount = n.violatedRules?.length || 0;
      if (violationCount === 0) return "違反 (詳細なし)";
      return `違反 (${violationCount}個)`;
    }
    return "Unknown";
  });

  // Sort: Full compliance first, then by violation count
  return stats.sort((a, b) => {
    if (a.key === "完全遵守") return -1;
    if (b.key === "完全遵守") return 1;
    return a.key.localeCompare(b.key);
  });
};

export const calculateByRiskReward = (notes: TradeNote[]): GroupedStats[] => {
  const stats = createGroupedStats(notes, (n) => {
    const rr = n.riskRewardRatio || 0;
    if (rr < 1.0) return "RR < 1.0";
    if (rr < 1.5) return "1.0 <= RR < 1.5";
    if (rr < 2.0) return "1.5 <= RR < 2.0";
    return "RR >= 2.0";
  });

  // Sort by RR range
  const order = ["RR < 1.0", "1.0 <= RR < 1.5", "1.5 <= RR < 2.0", "RR >= 2.0"];
  return stats.sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key));
};

export const calculateByHoldingTime = (notes: TradeNote[]): GroupedStats[] => {
  const stats = createGroupedStats(notes, (n) => {
    if (!n.exitTimestamp) return "未決済";
    const diffMs = n.exitTimestamp - n.entryTimestamp;
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 1) return "< 1h";
    if (diffHours < 4) return "1h - 4h";
    if (diffHours < 12) return "4h - 12h";
    if (diffHours < 24) return "12h - 24h";
    return "> 24h";
  });

  const order = ["< 1h", "1h - 4h", "4h - 12h", "12h - 24h", "> 24h"];
  return stats.sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key));
};

export const calculateTopViolatedRules = (
  notes: TradeNote[]
): GroupedStats[] => {
  const allViolations: string[] = [];
  notes.forEach((n) => {
    if (n.ruleCompliance === "VIOLATED" && n.violatedRules) {
      allViolations.push(...n.violatedRules);
    }
  });

  // Create stats manually since createGroupedStats expects TradeNote[]
  const counts: Record<string, number> = {};
  allViolations.forEach((rule) => {
    counts[rule] = (counts[rule] || 0) + 1;
  });

  const stats: GroupedStats[] = Object.entries(counts)
    .map(([rule, count]) => {
      // Calculate win rate and profit for trades violating this specific rule
      const violatingTrades = notes.filter(
        (n) =>
          n.ruleCompliance === "VIOLATED" && n.violatedRules?.includes(rule)
      );
      const summary = calculateSummary(violatingTrades);

      return {
        key: rule,
        count,
        winCount: summary.winCount,
        winRate: summary.winRate,
        netProfit: summary.netProfit,
      };
    })
    .sort((a, b) => b.count - a.count) // Sort by violation count desc
    .slice(0, 3); // Top 3

  return stats;
};

export const calculateByExitType = (notes: TradeNote[]): GroupedStats[] => {
  return createGroupedStats(notes, (n) => {
    switch (n.exitType) {
      case "TP_HIT":
        return "利確 (TP)";
      case "SL_HIT":
        return "損切 (SL)";
      case "MANUAL":
        return "手動決済";
      default:
        return "不明";
    }
  });
};

export const calculateStreaks = (notes: TradeNote[]): StreakStats => {
  // Sort by exit timestamp asc
  const sorted = [...notes]
    .filter((n) => n.tradeResult && n.exitTimestamp)
    .sort((a, b) => (a.exitTimestamp || 0) - (b.exitTimestamp || 0));

  let currentStreak = 0;
  let maxWinStreak = 0;
  let maxLossStreak = 0;
  const winStreaks: number[] = [];
  const lossStreaks: number[] = [];

  sorted.forEach((n) => {
    if (n.tradeResult === "WIN") {
      if (currentStreak > 0) {
        currentStreak++;
      } else {
        if (currentStreak < 0) lossStreaks.push(Math.abs(currentStreak));
        currentStreak = 1;
      }
      maxWinStreak = Math.max(maxWinStreak, currentStreak);
    } else if (n.tradeResult === "LOSS") {
      if (currentStreak < 0) {
        currentStreak--;
      } else {
        if (currentStreak > 0) winStreaks.push(currentStreak);
        currentStreak = -1;
      }
      maxLossStreak = Math.max(maxLossStreak, Math.abs(currentStreak));
    }
  });

  // Push final streak
  if (currentStreak > 0) winStreaks.push(currentStreak);
  if (currentStreak < 0) lossStreaks.push(Math.abs(currentStreak));

  const avgWin =
    winStreaks.length > 0
      ? winStreaks.reduce((a, b) => a + b, 0) / winStreaks.length
      : 0;
  const avgLoss =
    lossStreaks.length > 0
      ? lossStreaks.reduce((a, b) => a + b, 0) / lossStreaks.length
      : 0;

  return {
    currentStreak,
    maxWinStreak,
    maxLossStreak,
    averageWinStreak: avgWin,
    averageLossStreak: avgLoss,
  };
};
