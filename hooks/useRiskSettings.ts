'use client';

import { useCallback, useState, useEffect } from "react";

import { DEFAULT_SETTINGS } from "@/lib/constants";
import {
  clearRiskSettings,
  getStoredRiskSettings,
  saveRiskSettings,
} from "@/lib/storage";
import { RiskSettings } from "@/lib/types";

// 型定義：呼び出し元に合わせて isLoaded を追加
interface UseRiskSettingsResult {
  settings: RiskSettings | null;
  isLoaded: boolean;
  hasSavedSettings: boolean;
  save: (next: RiskSettings) => void;
  reset: () => void;
}

export const useRiskSettings = (): UseRiskSettingsResult => {
  // 初期値はサーバーとの不一致を防ぐため、一旦 DEFAULT_SETTINGS (または null) に固定
  const [settings, setSettings] = useState<RiskSettings | null>(DEFAULT_SETTINGS);
  
  // ロード完了フラグ
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasSavedSettings, setHasSavedSettings] = useState(false);

  // マウント後に localStorage から読み込む（これで安全！）
  useEffect(() => {
    try {
      const stored = getStoredRiskSettings();
      if (stored) {
        setSettings(stored);
        setHasSavedSettings(true);
      }
    } catch (e) {
      console.error("Failed to load settings:", e);
    } finally {
      // 読み込みが終わったら（成功失敗に関わらず）ロード完了とする
      setIsLoaded(true);
    }
  }, []);

  const save = useCallback((next: RiskSettings) => {
    setSettings(next);
    try {
      saveRiskSettings(next);
      setHasSavedSettings(true);
    } catch (e) {
      console.error("saveRiskSettings failed", e);
    }
  }, []);

  const reset = useCallback(() => {
    try {
      clearRiskSettings();
    } catch (e) {
      console.error("clearRiskSettings failed", e);
    }
    setSettings(DEFAULT_SETTINGS);
    setHasSavedSettings(false);
  }, []);

  // isLoading ではなく isLoaded を返す
  return { settings, isLoaded, hasSavedSettings, save, reset };
};