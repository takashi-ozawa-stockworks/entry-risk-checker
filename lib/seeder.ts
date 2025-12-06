import { CURRENCY_PAIRS } from "./constants";
import { TradeNote, TradeType } from "./types";
import { getTradeHistory, getStoredRiskSettings } from "./storage";
import { getRuleSettings } from "./rule-settings-storage";

const BASE_PRICES: Record<string, number> = {
  "USD/JPY": 150.0,
  "EUR/JPY": 163.0,
  "GBP/JPY": 190.0,
  "AUD/JPY": 97.0,
  "EUR/USD": 1.08,
  "GBP/USD": 1.26,
  "AUD/USD": 0.65,
};

const SAMPLE_NOTES = {
  WIN: [
    "計画通りにエントリーできた。利確も想定通り。",
    "トレンドに乗れて良い結果に。次も同じパターンを狙いたい。",
    "エントリータイミングが良かった。損切りラインも適切だった。",
    "予想通りの動き。リスクリワードも良好。",
  ],
  LOSS: [
    "損切りは適切だったが、エントリーが早すぎた。",
    "トレンド転換を見誤った。次はもっと慎重に。",
    "ルール通りに損切り。仕方ない負けトレード。",
    "エントリー根拠が弱かった。反省。",
  ],
};

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
  const ONE_HOUR = 60 * 60 * 1000;
  const ONE_MINUTE = 60 * 1000;

  // Load user's rules and settings
  const myRules = getRuleSettings().myRules || [];
  const settings = getStoredRiskSettings();

  // Use user settings or fallback to defaults
  const accountBalance = settings?.accountBalance || 100000;
  const riskPercentage = settings?.riskPercentage || 2.0;
  const pipsValuePerLot = settings?.pipsValuePerLot || 1000;
  const minLot = settings?.minLot || 0.01;
  const lotStep = settings?.lotStep || 0.01;

  CURRENCY_PAIRS.forEach((pair) => {
    const basePrice = BASE_PRICES[pair.code] || 100;
    const isJpy = pair.isJpyQuote;
    const pipsScale = isJpy ? 0.01 : 0.0001;

    // Currency pair characteristics (cross-yen slightly better win rate)
    const pairWinRateBonus = isJpy ? 0.05 : 0;

    for (let i = 0; i < 30; i++) {
      const tradeType: TradeType = Math.random() > 0.5 ? "LONG" : "SHORT";

      // Entry Price with some fluctuation
      const entryPrice = basePrice + randomFloat(-2, 2) * (isJpy ? 1 : 0.01);

      // SL/TP Pips (10-50 pips)
      const stopPips = randomInt(10, 30);
      const takePips = randomInt(15, 60);
      const riskRewardRatio = Number((takePips / stopPips).toFixed(2));

      // Calculate Prices
      let stopLossPrice, takeProfitPrice;
      if (tradeType === "LONG") {
        stopLossPrice = entryPrice - stopPips * pipsScale;
        takeProfitPrice = entryPrice + takePips * pipsScale;
      } else {
        stopLossPrice = entryPrice + stopPips * pipsScale;
        takeProfitPrice = entryPrice - takePips * pipsScale;
      }

      // Calculate lot size based on user's risk settings
      const riskAmount = accountBalance * (riskPercentage / 100);
      const calculatedLot = riskAmount / (stopPips * pipsValuePerLot);
      const recommendedLot = Math.max(
        minLot,
        Math.round(calculatedLot / lotStep) * lotStep
      );

      // Planned values using user's pips value (for recommended lot size)
      const expectedLoss = -1 * stopPips * pipsValuePerLot * recommendedLot; // Negative value
      const expectedProfit = takePips * pipsValuePerLot * recommendedLot;

      // Rule compliance (80% FULL, 20% VIOLATED)
      const ruleCompliance = Math.random() > 0.2 ? "FULL" : "VIOLATED";
      let violatedRules: string[] | undefined;
      let numViolations = 0;

      if (ruleCompliance === "VIOLATED" && myRules.length > 0) {
        // Select 1-3 random rules from user's rules
        numViolations = randomInt(1, Math.min(3, myRules.length));
        const shuffled = [...myRules].sort(() => Math.random() - 0.5);
        violatedRules = shuffled.slice(0, numViolations);
      }

      // Win rate based on rule compliance and RR
      let baseWinRate = 0.5;

      // Rule compliance impact
      if (ruleCompliance === "FULL") {
        baseWinRate = 0.7; // 70% win rate for full compliance
      } else if (numViolations >= 3) {
        baseWinRate = 0.2; // 20% win rate for 3+ violations
      } else {
        baseWinRate = 0.4; // 40% win rate for 1-2 violations
      }

      // RR impact (higher RR = lower win rate)
      if (riskRewardRatio >= 2.0) {
        baseWinRate -= 0.1;
      } else if (riskRewardRatio < 1.5) {
        baseWinRate += 0.1;
      }

      // Currency pair bonus
      baseWinRate += pairWinRateBonus;

      // Clamp between 0.1 and 0.9
      baseWinRate = Math.max(0.1, Math.min(0.9, baseWinRate));

      const result = Math.random() < baseWinRate ? "WIN" : "LOSS";

      // Holding time distribution
      let holdingTime: number;
      const holdingTypeRoll = Math.random();
      if (holdingTypeRoll < 0.05) {
        // Scalping (5%)
        holdingTime = randomInt(1, 4) * ONE_MINUTE;
      } else if (holdingTypeRoll < 0.85) {
        // Day trade (80%)
        holdingTime = randomInt(5, 23) * ONE_HOUR;
      } else {
        // Swing (15%)
        holdingTime = randomInt(24, 72) * ONE_HOUR;
      }

      // Random entry timestamp within last 90 days
      const entryTimestamp =
        now - randomInt(0, 90) * ONE_DAY - randomInt(0, 23) * ONE_HOUR;
      const exitTimestamp = entryTimestamp + holdingTime;

      // Exit type based on result and rule compliance
      let exitType: TradeNote["exitType"];
      if (result === "WIN") {
        exitType = Math.random() > 0.3 ? "TP_HIT" : "MANUAL";
      } else {
        // More violations = more likely to hit SL
        const slProbability =
          ruleCompliance === "VIOLATED" && numViolations >= 3 ? 0.8 : 0.6;
        exitType = Math.random() < slProbability ? "SL_HIT" : "MANUAL";
      }

      // Actual values based on exit type
      const actualLot = recommendedLot * randomFloat(0.95, 1.05);
      let actualProfit: number | undefined;
      let actualLoss: number | undefined;

      if (result === "WIN") {
        if (exitType === "TP_HIT") {
          // TP hit = almost exactly as planned
          actualProfit = expectedProfit * randomFloat(0.98, 1.02);
        } else {
          // Manual exit = variation from plan
          actualProfit = expectedProfit * randomFloat(0.6, 0.95);
        }
      } else {
        if (exitType === "SL_HIT") {
          // SL hit = almost exactly as planned (negative value)
          actualLoss = expectedLoss * randomFloat(0.98, 1.02);
        } else {
          // Manual exit = could be better or worse (negative value)
          actualLoss = expectedLoss * randomFloat(0.8, 1.3);
        }
      }

      // Note
      const noteText = randomItem(SAMPLE_NOTES[result]);

      const note: TradeNote = {
        id: crypto.randomUUID(),
        entryTimestamp,
        currencyPair: pair.code,
        tradeType,
        entryPrice: Number(entryPrice.toFixed(isJpy ? 3 : 5)),
        stopLossPrice: Number(stopLossPrice.toFixed(isJpy ? 3 : 5)),
        takeProfitPrice: Number(takeProfitPrice.toFixed(isJpy ? 3 : 5)),
        recommendedLot: Number(recommendedLot.toFixed(2)),
        expectedLoss,
        expectedProfit,
        stopPips,
        takePips,
        riskRewardRatio,
        tradeResult: result,
        actualLot: Number(actualLot.toFixed(2)),
        actualProfit: actualProfit
          ? Number(actualProfit.toFixed(0))
          : undefined,
        actualLoss: actualLoss ? Number(actualLoss.toFixed(0)) : undefined,
        note: noteText,
        exitTimestamp,
        exitType,
        ruleCompliance,
        violatedRules,
      };

      newHistory.push(note);
    }
  });

  const currentHistory = getTradeHistory();
  const updatedHistory = [...currentHistory, ...newHistory];

  // Sort by timestamp desc
  updatedHistory.sort((a, b) => b.entryTimestamp - a.entryTimestamp);

  if (typeof window !== "undefined") {
    window.localStorage.setItem(
      "entry_risk_checker_history",
      JSON.stringify(updatedHistory)
    );
  }
  return updatedHistory.length;
};
