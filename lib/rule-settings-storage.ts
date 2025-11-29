import { RULE_SETTINGS_KEY } from "./constants";

const isBrowser = typeof window !== "undefined";

export interface ScenarioPreset {
  id: string;
  title: string;
  description: string;
}

export interface RuleSettings {
  scenarioPresets: ScenarioPreset[];
  entryBasisPresets: string[];
  myRules: string[];
}

const DEFAULT_SCENARIO_PRESETS: ScenarioPreset[] = [
  {
    id: "default-1",
    title: "上昇トレンドの押し目買い",
    description: "長期足が上昇トレンド中、短期足で調整が入ったところを狙う。",
  },
  {
    id: "default-2",
    title: "下降トレンドの戻り売り",
    description: "長期足が下降トレンド中、短期足で反発したところを狙う。",
  },
  {
    id: "default-3",
    title: "レンジブレイク",
    description: "明確なレンジ相場を形成後、ブレイクした方向にエントリー。",
  },
  {
    id: "default-4",
    title: "レンジ下限からの反発",
    description: "レンジ下限付近でのプライスアクションを確認してロング。",
  },
  {
    id: "default-5",
    title: "レンジ上限からの反落",
    description: "レンジ上限付近でのプライスアクションを確認してショート。",
  },
];

const DEFAULT_ENTRY_BASIS_PRESETS = [
  "ゴールデンクロス",
  "デッドクロス",
  "サポートライン反発",
  "レジスタンスライン反落",
  "ダブルボトム",
  "ダブルトップ",
  "RSIダイバージェンス",
];

const DEFAULT_MY_RULES_PRESETS = [
  "飛び乗りエントリーをしない",
  "損切りラインを動かさない",
  "指標発表前後はエントリーしない",
  "感情的になったらチャートを閉じる",
  "リスクリワード1:1.5以上を確保する",
];

export const getRuleSettings = (): RuleSettings => {
  if (!isBrowser) {
    return { scenarioPresets: [], entryBasisPresets: [], myRules: [] };
  }

  try {
    const raw = window.localStorage.getItem(RULE_SETTINGS_KEY);
    if (!raw) {
      const defaults = {
        scenarioPresets: DEFAULT_SCENARIO_PRESETS,
        entryBasisPresets: DEFAULT_ENTRY_BASIS_PRESETS,
        myRules: DEFAULT_MY_RULES_PRESETS,
      };
      saveRuleSettings(defaults);
      return defaults;
    }

    const parsed = JSON.parse(raw);

    // Migration: Convert string[] to ScenarioPreset[]
    if (
      Array.isArray(parsed.scenarioPresets) &&
      parsed.scenarioPresets.length > 0 &&
      typeof parsed.scenarioPresets[0] === "string"
    ) {
      parsed.scenarioPresets = (
        parsed.scenarioPresets as unknown as string[]
      ).map((title) => ({
        id: crypto.randomUUID(),
        title,
        description: "",
      }));
      // Save migrated data immediately
      saveRuleSettings(parsed);
    }

    // Migration: Ensure myRules exists
    if (!parsed.myRules) {
      parsed.myRules = DEFAULT_MY_RULES_PRESETS;
      saveRuleSettings(parsed);
    }

    return parsed;
  } catch (error) {
    console.error("Failed to read rule settings", error);
    return {
      scenarioPresets: DEFAULT_SCENARIO_PRESETS,
      entryBasisPresets: DEFAULT_ENTRY_BASIS_PRESETS,
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

export const getScenarioPresetById = (
  id: string
): ScenarioPreset | undefined => {
  const settings = getRuleSettings();
  return settings.scenarioPresets.find((p) => p.id === id);
};
