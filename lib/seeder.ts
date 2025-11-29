import { CURRENCY_PAIRS } from "./constants";
import { TradeNote, TradeType } from "./types";
import { getTradeHistory } from "./storage";

const BASE_PRICES: Record<string, number> = {
  "USD/JPY": 150.0,
  "EUR/JPY": 163.0,
  "GBP/JPY": 190.0,
  "AUD/JPY": 97.0,
  "EUR/USD": 1.08,
  "GBP/USD": 1.26,
  "AUD/USD": 0.65,
};

const SCENARIOS = [
  "トレンドフォロー",
  "レンジブレイク",
  "逆張り",
  "押し目買い",
  "戻り売り",
];
const BASES = [
  "MA反発",
  "水平線",
  "トレンドライン",
  "チャートパターン",
  "オシレーター",
];

const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min: number, max: number) =>
  Math.random() * (max - min) + min;
const randomItem = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

export const generateDummyData = () => {
  const newHistory: TradeNote[] = [];
  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;

  CURRENCY_PAIRS.forEach((pair) => {
    const basePrice = BASE_PRICES[pair.code] || 100;
    const isJpy = pair.isJpyQuote;
    const pipsScale = isJpy ? 0.01 : 0.0001;

    for (let i = 0; i < 30; i++) {
      const tradeType: TradeType = Math.random() > 0.5 ? "LONG" : "SHORT";
      const result = Math.random() > 0.55 ? "WIN" : "LOSS"; // 45% Win Rate (0.45 = 1 - 0.55)

      // Random timestamp within last 90 days
      const timestamp =
        now - randomInt(0, 90) * ONE_DAY - randomInt(0, 23) * 60 * 60 * 1000;

      // Entry Price with some fluctuation
      const entryPrice = basePrice + randomFloat(-2, 2) * (isJpy ? 1 : 0.01);

      // SL/TP Pips (10-50 pips)
      const stopPips = randomInt(10, 30);
      const takePips = randomInt(15, 60); // Slightly higher for better RR

      // Calculate Prices
      let stopLossPrice, takeProfitPrice;
      if (tradeType === "LONG") {
        stopLossPrice = entryPrice - stopPips * pipsScale;
        takeProfitPrice = entryPrice + takePips * pipsScale;
      } else {
        stopLossPrice = entryPrice + stopPips * pipsScale;
        takeProfitPrice = entryPrice - takePips * pipsScale;
      }

      // Financials (Assuming 1 Lot roughly)
      // For simplicity, using fixed pips value approximation
      const pipsValue = isJpy ? 1000 : 1000; // Simplified
      const actualLoss = stopPips * pipsValue * -1;
      const potentialProfit = takePips * pipsValue;

      const note: TradeNote = {
        id: crypto.randomUUID(),
        timestamp,
        currencyPair: pair.code,
        tradeType,
        entryPrice: Number(entryPrice.toFixed(isJpy ? 3 : 5)),
        stopLossPrice: Number(stopLossPrice.toFixed(isJpy ? 3 : 5)),
        takeProfitPrice: Number(takeProfitPrice.toFixed(isJpy ? 3 : 5)),
        stopPips,
        takePips,
        actualLoss,
        potentialProfit,
        riskRewardRatio: Number((takePips / stopPips).toFixed(2)),
        scenario: randomItem(SCENARIOS),
        entryBasis: randomItem(BASES),
        tradeResult: result,
        note: "ダミーデータ",
      };

      newHistory.push(note);
    }
  });

  // Merge with existing history or overwrite?
  // User said "Create dummy data", usually implies adding or replacing.
  // I'll append to existing for safety, but maybe user wants a clean slate.
  // Let's just append.
  const currentHistory = getTradeHistory();
  const updatedHistory = [...currentHistory, ...newHistory];

  // Sort by timestamp desc
  updatedHistory.sort((a, b) => b.timestamp - a.timestamp);

  if (typeof window !== "undefined") {
    window.localStorage.setItem(
      "entry_risk_checker_history",
      JSON.stringify(updatedHistory)
    );
  }
  return updatedHistory.length;
};
