import { RiskSettings } from "./types";

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
export const STORAGE_KEY = "entry_risk_checker_settings";
export const TRADE_HISTORY_KEY = "entry_risk_checker_history";
export const RULE_SETTINGS_KEY = "entry_risk_checker_rules";
export const MY_RULES_KEY = RULE_SETTINGS_KEY;
export const ENABLE_MY_RULES_CHECK_KEY = "entry_risk_checker_enable_my_rules";

// USD/JPYにおけるpips計算用係数 (1pips = 0.01円)
export const JPY_PIPS_MULTIPLIER = 100;

export interface CurrencyPair {
  code: string;
  base: string;
  quote: string;
  isJpyQuote: boolean; // 決済通貨がJPYかどうか
}

export const CURRENCY_PAIRS: CurrencyPair[] = [
  { code: "USD/JPY", base: "USD", quote: "JPY", isJpyQuote: true },
  { code: "EUR/JPY", base: "EUR", quote: "JPY", isJpyQuote: true },
  { code: "GBP/JPY", base: "GBP", quote: "JPY", isJpyQuote: true },
  { code: "AUD/JPY", base: "AUD", quote: "JPY", isJpyQuote: true },
  { code: "EUR/USD", base: "EUR", quote: "USD", isJpyQuote: false },
  { code: "GBP/USD", base: "GBP", quote: "USD", isJpyQuote: false },
  { code: "AUD/USD", base: "AUD", quote: "USD", isJpyQuote: false },
];
