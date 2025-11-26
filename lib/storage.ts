import { STORAGE_KEY, TRADE_HISTORY_KEY } from "./constants";
import { RiskSettings, TradeNote } from "./types";

const isBrowser = typeof window !== "undefined";

const keys: (keyof RiskSettings)[] = [
  "accountBalance",
  "riskPercentage",
  "pipsValuePerLot",
  "minLot",
  "lotStep",
  "minRiskRewardRatio",
];

const isRiskSettings = (data: unknown): data is RiskSettings => {
  if (!data || typeof data !== "object") {
    return false;
  }

  const record = data as Record<string, unknown>;

  return keys.every((key) => {
    const value = record[key];
    return typeof value === "number" && Number.isFinite(value);
  });
};

const parseRiskSettings = (data: unknown): RiskSettings | null =>
  isRiskSettings(data) ? { ...data } : null;

export const getStoredRiskSettings = (): RiskSettings | null => {
  if (!isBrowser) {
    return null;
  }

  let raw: string | null = null;

  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to read risk settings", error);
    return null;
  }

  if (!raw) {
    return null;
  }

  try {
    const parsed = parseRiskSettings(JSON.parse(raw));

    if (!parsed) {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.error("Failed to clear invalid risk settings", error);
      }
    }

    return parsed;
  } catch (error) {
    console.error("Failed to parse risk settings", error);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (removeError) {
      console.error("Failed to clear invalid risk settings", removeError);
    }
    return null;
  }
};

export const saveRiskSettings = (settings: RiskSettings): void => {
  if (!isBrowser) {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Failed to save risk settings", error);
  }
};

export const clearRiskSettings = (): void => {
  if (!isBrowser) {
    return;
  }

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear risk settings", error);
  }
};

export const getTradeHistory = (): TradeNote[] => {
  if (!isBrowser) return [];

  try {
    const raw = window.localStorage.getItem(TRADE_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error("Failed to read trade history", error);
    return [];
  }
};

export const saveTradeNote = (note: TradeNote): void => {
  if (!isBrowser) return;

  try {
    const history = getTradeHistory();
    const newHistory = [note, ...history].slice(0, 100); // 最新100件まで保存
    window.localStorage.setItem(TRADE_HISTORY_KEY, JSON.stringify(newHistory));
  } catch (error) {
    console.error("Failed to save trade note", error);
  }
};

export const deleteTradeNote = (id: string): void => {
  if (!isBrowser) return;

  try {
    const history = getTradeHistory();
    const newHistory = history.filter((note) => note.id !== id);
    window.localStorage.setItem(TRADE_HISTORY_KEY, JSON.stringify(newHistory));
  } catch (error) {
    console.error("Failed to delete trade note", error);
  }
};
