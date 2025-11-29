// README.md 4. データ構造 に基づく型定義

// 4.1 設定データ
export interface RiskSettings {
  accountBalance: number; // 口座残高 (例: 100000)
  riskPercentage: number; // 許容リスク% (例: 2.0)
  pipsValuePerLot: number; // 1Lotあたりの1pips損益 (例: 1000)
  minLot: number; // 最小ロット (例: 0.01)
  lotStep: number; // ロット刻み (例: 0.01)
  minRiskRewardRatio: number; // 最低RR比 (例: 1.5)
}

// 4.2 トレード入力データ
export type TradeType = "LONG" | "SHORT";
export type InputMode = "PRICE" | "PIPS";

export interface TradeInput {
  currencyPair: string; // 通貨ペアコード (例: "USD/JPY")
  currentJpyRate?: number; // 現在の対円レート (決済通貨がJPYでない場合に使用)
  tradeType: TradeType;
  entryPrice: number; // エントリー価格
  stopLossMode: InputMode;
  stopLossPrice?: number; // 損切り価格 (モードがPRICEの時)
  stopLossPips?: number; // 損切りpips (モードがPIPSの時)
  takeProfitMode: InputMode;
  takeProfitPrice?: number; // 利確価格 (モードがPRICEの時)
  takeProfitPips?: number; // 利確pips (モードがPIPSの時)
}

// 4.3 計算結果データ
export type RiskStatus = "ENTRY_OK" | "CONDITIONS_NG" | "ENTRY_FORBIDDEN";

export interface CalculationResult {
  status: RiskStatus;
  recommendedLot: number; // 推奨ロット
  stopPips: number; // 損切り幅(pips)
  takePips: number; // 利確幅(pips)
  actualLoss: number; // 想定損失額(円)
  actualRiskPercent: number; // 想定リスク(%)
  potentialProfit: number; // 想定利益額(円)
  riskRewardRatio: number; // RR比
  messages: string[]; // 判定理由/警告文
}

// 4.4 トレードノート (履歴保存用)
export interface TradeNote {
  id: string; // UUID
  timestamp: number; // 作成日時 (Unix timestamp)
  currencyPair?: string; // 通貨ペア (後方互換性のためオプショナル)
  tradeType: TradeType;
  entryPrice: number;
  stopLossPrice: number;
  takeProfitPrice: number;
  actualLoss: number; // 負け金額
  potentialProfit: number; // 勝ち金額
  stopPips?: number; // 損切り幅(pips) - オプショナルにして既存データとの互換性を保つ
  takePips?: number; // 利確幅(pips) - オプショナルにして既存データとの互換性を保つ
  riskRewardRatio: number;
  scenario?: string; // シナリオ
  entryBasis?: string; // エントリー根拠
  tradeResult?: "WIN" | "LOSS"; // 結果
  note: string; // 反省・気づき
  imageIds?: string[]; // チャート画像ID (IndexedDBのキー)

  // Phase 1: Market Environment & Mental State
  marketTrend?: "UPTREND" | "DOWNTREND" | "RANGE";
  volatility?: "HIGH" | "MEDIUM" | "LOW";
  timeframe?: "M15" | "M30" | "H1" | "H4" | "D1";
  entryConfidence?: "HIGH" | "MEDIUM" | "LOW";
  mentalState?: "CALM" | "NEUTRAL" | "ANXIOUS" | "FOMO";

  // Phase 2: Trade Execution
  ruleCompliance?: "FULL" | "PARTIAL" | "VIOLATED";
  violatedRules?: string[];
  complianceNotes?: string;

  // Phase 3: Structured Reflection
  whatWorked?: string;
  whatToImprove?: string;
  emotionalReaction?: string;
}
