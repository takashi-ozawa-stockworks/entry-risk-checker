import { RULE_SETTINGS_KEY } from "./constants";

const isBrowser = typeof window !== "undefined";

export interface RuleSettings {
  myRules: string[];
}

const DEFAULT_MY_RULES_PRESETS = [
  "飛び乗りエントリーをしない",
  "損切りラインを動かさない",
  "指標発表前後はエントリーしない",
  "感情的になったらチャートを閉じる",
  "リスクリワード1:1.5以上を確保する",
];

export const getRuleSettings = (): RuleSettings => {
  if (!isBrowser) {
    return { myRules: [] };
  }

  try {
    const raw = window.localStorage.getItem(RULE_SETTINGS_KEY);
    if (!raw) {
      const defaults = {
        myRules: DEFAULT_MY_RULES_PRESETS,
      };
      saveRuleSettings(defaults);
      return defaults;
    }

    const parsed = JSON.parse(raw);

    // Migration: Ensure myRules exists
    if (!parsed.myRules) {
      parsed.myRules = DEFAULT_MY_RULES_PRESETS;
      saveRuleSettings(parsed);
    }

    return parsed;
  } catch (error) {
    console.error("Failed to read rule settings", error);
    return {
      myRules: DEFAULT_MY_RULES_PRESETS,
    };
  }
};

export const saveRuleSettings = (settings: RuleSettings): void => {
  if (!isBrowser) return;

  try {
    window.localStorage.setItem(RULE_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Failed to save rule settings", error);
  }
};
