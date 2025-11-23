import { RiskSettings } from './types';

// 初期設定のデフォルト値
export const DEFAULT_SETTINGS: RiskSettings = {
  accountBalance: 100000,
  riskPercentage: 2.0,
  pipsValuePerLot: 1000, // 一般的な国内業者のUSD/JPY 1万通貨単位なら1000円/pips、1000通貨単位なら100円/pips
  minLot: 0.01,
  lotStep: 0.01,
  minRiskRewardRatio: 1.5,
};

// LocalStorageのキー
export const STORAGE_KEY = 'entry_risk_checker_settings';

// USD/JPYにおけるpips計算用係数 (1pips = 0.01円)
export const JPY_PIPS_MULTIPLIER = 100;