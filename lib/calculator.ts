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
  const scaled = Math.floor(value * factor + 1e-12) / factor;

  return Number(scaled.toFixed(decimals));
};

const toPips = (
  mode: InputMode,
  entryPrice: number,
  price?: number,
  pips?: number,
  multiplier: number = JPY_PIPS_MULTIPLIER
): number => {
  if (mode === "PIPS") {
    return pips && pips > 0 ? pips : 0;
  }

  if (typeof price !== "number") {
    return 0;
  }

  // 計算結果を小数1桁に丸め
  const raw = Math.abs(entryPrice - price) * multiplier;
  return Number(raw.toFixed(1));
};

const baseResult = (
  status: RiskStatus,
  message: string
): CalculationResult => ({
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
  settings: RiskSettings
): CalculationResult => {
  const {
    currencyPair,
    currentJpyRate,
    entryPrice,
    stopLossMode,
    stopLossPrice,
    stopLossPips,
    takeProfitMode,
    takeProfitPrice,
    takeProfitPips,
  } = input;
  const {
    accountBalance,
    riskPercentage,
    pipsValuePerLot,
    minLot,
    lotStep,
    minRiskRewardRatio,
  } = settings;

  // Step 1: 許容損失額
  const maxLoss = accountBalance * (riskPercentage / 100);

  // Step 2: Pips算出
  // 通貨ペアによってPipsの倍率を変える必要がある
  // JPYペア(クロス円)は通常 0.01円 = 1pips (multiplier=100)
  // USDペア(ドルスト)などは通常 0.0001ドル = 1pips (multiplier=10000)
  // 簡易判定: entryPriceが小さい(例えば200以下)ならクロス円、それ以外はドルスト...というのは危険
  // currencyPairから判定するのが確実だが、ここでは簡易的に「現在価格の桁数」や「入力されたペア情報」を使うべき
  // 今回は CURRENCY_PAIRS の定義を使いたいが、calculator.ts は純粋な関数にしたいので、
  // 呼び出し元から multiplier を渡すか、あるいはここで簡易判定するか。
  // 一旦、クロス円以外（ドルスト）は multiplier=10000 と仮定するロジックを入れる。
  // ただし、currencyPair文字列があればそれで判定可能。

  let pipsMultiplier = JPY_PIPS_MULTIPLIER; // Default 100
  if (currencyPair && !currencyPair.endsWith("JPY")) {
    pipsMultiplier = 10000;
  }

  const stopPips = toPips(
    stopLossMode,
    entryPrice,
    stopLossPrice,
    stopLossPips,
    pipsMultiplier
  );
  const takePips = toPips(
    takeProfitMode,
    entryPrice,
    takeProfitPrice,
    takeProfitPips,
    pipsMultiplier
  );

  if (stopPips <= 0) {
    return baseResult("ENTRY_FORBIDDEN", "損切り幅を正しく入力してください。");
  }

  if (takePips <= 0) {
    return baseResult("ENTRY_FORBIDDEN", "利確幅を正しく入力してください。");
  }

  // Step 3: 理論ロット算出
  // 1Lotあたりの1pipsの価値(円)を計算
  // クロス円: pipsValuePerLot (例: 1000円)
  // ドルスト: pipsValuePerLot * currentJpyRate (例: 1000円 * 150 = 1500円? いや、pipsValuePerLotは「1万通貨の1pips」=100円相当か1000円相当か設定次第。
  // デフォルト設定(1000)は「1万通貨で1pips=100円」ではなく「1000円」?
  // 国内口座(1万通貨単位)の場合:
  // USD/JPY: 1pips(0.01円) * 1万 = 100円
  // EUR/USD: 1pips(0.0001ドル) * 1万 = 1ドル = 150円 (レート次第)
  // ユーザー設定の pipsValuePerLot は「クロス円における1Lot 1pipsの価値」と解釈する。
  // なので、ドルストの場合はそれにレートを掛ける。
  // ただし、pipsValuePerLotのデフォルト1000は「10万通貨単位」の計算か？
  // 多くの国内業者は1万通貨単位で、1pips=100円。
  // 海外業者は10万通貨単位で、1pips=1000円。
  // ユーザー設定値に依存するが、比率は変わらない。

  let actualPipsValue = pipsValuePerLot;
  if (currencyPair && !currencyPair.endsWith("JPY") && currentJpyRate) {
    // 決済通貨がJPY以外の場合、レートを掛ける
    // 例: EUR/USD (決済USD) -> USD/JPYレートを掛ける
    actualPipsValue = pipsValuePerLot * (currentJpyRate / 100); // JPYレートは例えば150。100で割る必要あるか？
    // pipsValuePerLot(クロス円) = 1万通貨 * 0.01円 = 100円
    // ドルスト = 1万通貨 * 0.0001ドル = 1ドル
    // 1ドル = 150円
    // つまり クロス円(100円) に対して ドルスト(150円) は 1.5倍。
    // currentJpyRate (150) / 100 = 1.5
    // なので (currentJpyRate / 100) を掛けるのが正解。
    actualPipsValue = pipsValuePerLot * (currentJpyRate / 100);
  }

  const lossPerLot = stopPips * actualPipsValue;
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
  const potentialProfit = formattedLot * takePips * actualPipsValue;
  const riskRewardRatio = actualLoss > 0 ? potentialProfit / actualLoss : 0;

  let status: RiskStatus = "ENTRY_OK";
  const messages: string[] = [];

  if (recommendedLot < minLot || recommendedLot === 0) {
    status = "ENTRY_FORBIDDEN";
    messages.push("推奨ロットが最小ロットを下回っています。");
  }

  if (
    status !== "ENTRY_FORBIDDEN" &&
    actualRiskPercent > riskPercentage + 1e-6
  ) {
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
