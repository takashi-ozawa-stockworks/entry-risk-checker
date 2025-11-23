// README.md 4. データ構造 に基づく型定義

// 4.1 設定データ
export interface RiskSettings {
  accountBalance: number;      // 口座残高 (例: 100000)
  riskPercentage: number;      // 許容リスク% (例: 2.0)
  pipsValuePerLot: number;     // 1Lotあたりの1pips損益 (例: 1000)
  minLot: number;              // 最小ロット (例: 0.01)
  lotStep: number;             // ロット刻み (例: 0.01)
  minRiskRewardRatio: number;  // 最低RR比 (例: 1.5)
}

// 4.2 トレード入力データ
export type TradeType = 'LONG' | 'SHORT';
export type InputMode = 'PRICE' | 'PIPS';

export interface TradeInput {
  tradeType: TradeType;
  entryPrice: number;          // エントリー価格
  stopLossMode: InputMode;
  stopLossPrice?: number;      // 損切り価格 (モードがPRICEの時)
  stopLossPips?: number;       // 損切りpips (モードがPIPSの時)
  takeProfitMode: InputMode;
  takeProfitPrice?: number;    // 利確価格 (モードがPRICEの時)
  takeProfitPips?: number;     // 利確pips (モードがPIPSの時)
}

// 4.3 計算結果データ
export type RiskStatus = 'ENTRY_OK' | 'CONDITIONS_NG' | 'ENTRY_FORBIDDEN';

export interface CalculationResult {
  status: RiskStatus;
  recommendedLot: number;    // 推奨ロット
  stopPips: number;          // 損切り幅(pips)
  takePips: number;          // 利確幅(pips)
  actualLoss: number;        // 想定損失額(円)
  actualRiskPercent: number; // 想定リスク(%)
  potentialProfit: number;   // 想定利益額(円)
  riskRewardRatio: number;   // RR比
  messages: string[];        // 判定理由/警告文
}