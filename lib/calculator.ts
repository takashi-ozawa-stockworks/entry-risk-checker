import { JPY_PIPS_MULTIPLIER } from "./constants";
import {
  CalculationResult,
  InputMode,
  RiskSettings,
  RiskStatus,
  TradeInput,
} from "./types";

const floorToStep = (value: number, step: number): number => {
  if (step <= 0) {
    return 0;
  }

  // 小数桁数を取得 (例: 0.01 -> 2)
  const stepStr = step.toString();
  const decimals = stepStr.split(".")[1]?.length ?? 0;

  // step の逆数を作って整数化してから floor 演算（浮動小数点誤差対策）
  const factor = Math.round(1 / step);
  const scaled = Math.floor((value * factor) + 1e-12) / factor;

  return Number(scaled.toFixed(decimals));
};

const toPips = (
  mode: InputMode,
  entryPrice: number,
  price?: number,
  pips?: number,
): number => {
  if (mode === "PIPS") {
    return pips && pips > 0 ? pips : 0;
  }

  if (typeof price !== "number") {
    return 0;
  }

  // 計算結果を小数1桁に丸め（JPY の pips は通常小数1桁扱い）
  const raw = Math.abs(entryPrice - price) * JPY_PIPS_MULTIPLIER;
  return Number(raw.toFixed(1));
};

const baseResult = (status: RiskStatus, message: string): CalculationResult => ({
  status,
  recommendedLot: 0,
  stopPips: 0,
  takePips: 0,
  actualLoss: 0,
  actualRiskPercent: 0,
  potentialProfit: 0,
  riskRewardRatio: 0,
  messages: [message],
});

export const calculateRisk = (
  input: TradeInput,
  settings: RiskSettings,
): CalculationResult => {
  const { entryPrice, stopLossMode, stopLossPrice, stopLossPips, takeProfitMode, takeProfitPrice, takeProfitPips } =
    input;
  const { accountBalance, riskPercentage, pipsValuePerLot, minLot, lotStep, minRiskRewardRatio } =
    settings;

  // Step 1: 許容損失額
  const maxLoss = accountBalance * (riskPercentage / 100);

  // Step 2: Pips算出
  const stopPips = toPips(stopLossMode, entryPrice, stopLossPrice, stopLossPips);
  const takePips = toPips(takeProfitMode, entryPrice, takeProfitPrice, takeProfitPips);

  if (stopPips <= 0) {
    return baseResult("ENTRY_FORBIDDEN", "損切り幅を正しく入力してください。");
  }

  if (takePips <= 0) {
    return baseResult("ENTRY_FORBIDDEN", "利確幅を正しく入力してください。");
  }

  // Step 3: 理論ロット算出
  const lossPerLot = stopPips * pipsValuePerLot;
  const rawLot = lossPerLot > 0 ? maxLoss / lossPerLot : 0;

  // Step 4: 推奨ロット算出 (丸め処理)
  const recommendedLot = floorToStep(rawLot, lotStep);

  // 表示用に lotStep の桁数に合わせて整形
  const lotDecimals = lotStep.toString().split(".")[1]?.length ?? 0;
  const formattedLot = Number(recommendedLot.toFixed(lotDecimals));

  // Step 5: 判定ロジック
  const actualLoss = formattedLot * lossPerLot;
  const actualRiskPercent =
    accountBalance > 0 ? (actualLoss / accountBalance) * 100 : 0;
  const potentialProfit = formattedLot * takePips * pipsValuePerLot;
  const riskRewardRatio =
    actualLoss > 0 ? potentialProfit / actualLoss : 0;

  let status: RiskStatus = "ENTRY_OK";
  const messages: string[] = [];

  if (recommendedLot < minLot || recommendedLot === 0) {
    status = "ENTRY_FORBIDDEN";
    messages.push("推奨ロットが最小ロットを下回っています。");
  }

  if (status !== "ENTRY_FORBIDDEN" && actualRiskPercent > riskPercentage + 1e-6) {
    status = "ENTRY_FORBIDDEN";
    messages.push("丸め後のリスクが許容%を超えています。");
  }

  if (status === "ENTRY_OK" && riskRewardRatio < minRiskRewardRatio - 1e-6) {
    status = "CONDITIONS_NG";
    messages.push("RR比が最低基準を下回っています。");
  }

  if (messages.length === 0) {
    messages.push("リスク許容範囲内です。");
  }

  return {
    status,
    recommendedLot: formattedLot,
    stopPips,
    takePips,
    actualLoss: Math.round(actualLoss), // 円表示を整数化
    actualRiskPercent: Number(actualRiskPercent.toFixed(2)),
    potentialProfit: Math.round(potentialProfit),
    riskRewardRatio: Number(riskRewardRatio.toFixed(2)),
    messages,
  };
};
