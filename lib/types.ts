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
  entryTimestamp: number; // エントリー日時 (Unix timestamp)
  currencyPair?: string; // 通貨ペア (後方互換性のためオプショナル)
  tradeType: TradeType;
  entryPrice: number;
  stopLossPrice: number;
  takeProfitPrice: number;

  // 計画値（エントリー時の計算結果）
  recommendedLot: number; // 推奨ロット
  expectedLoss: number; // 想定損失
  expectedProfit: number; // 想定利益
  stopPips?: number; // 損切り幅(pips) - オプショナルにして既存データとの互換性を保つ
  takePips?: number; // 利確幅(pips) - オプショナルにして既存データとの互換性を保つ
  riskRewardRatio: number;

  tradeResult?: "WIN" | "LOSS"; // 結果

  // 実績値（決済後の実際の値）
  actualLot?: number; // 実ロット数
  actualProfit?: number; // 実利益（WIN時）
  actualLoss?: number; // 実損失（LOSS時）
  note: string; // 反省・気づき
  exitTimestamp?: number; // 決済日時 (Unix timestamp)
  exitType?: "TP_HIT" | "SL_HIT" | "MANUAL"; // 決済種別

  // Phase 2: Trade Execution
  ruleCompliance?: "FULL" | "VIOLATED";
  violatedRules?: string[]; // 違反したルール（内部保存用、UIには表示しない）

  // Phase 3: Structured Reflection
  // whatWorked, whatToImprove, emotionalReaction removed in favor of single note field
}
