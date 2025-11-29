"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Plus, Trash2, RotateCcw } from "lucide-react";
import {
  getRuleSettings,
  saveRuleSettings,
  RuleSettings,
} from "@/lib/rule-settings-storage";

export default function RuleSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<RuleSettings>({
    scenarioPresets: [],
    entryBasisPresets: [],
    myRules: [],
  });

  // New item input states
  const [newScenario, setNewScenario] = useState("");
  const [newEntryBasis, setNewEntryBasis] = useState("");
  const [newRule, setNewRule] = useState("");

  useEffect(() => {
    setSettings(getRuleSettings());
  }, []);

  const addScenario = () => {
    if (!newScenario.trim()) return;
    const newSettings = {
      ...settings,
      scenarioPresets: [
        ...settings.scenarioPresets,
        {
          id: crypto.randomUUID(),
          title: newScenario.trim(),
          description: "",
        },
      ],
    };
    setSettings(newSettings);
    saveRuleSettings(newSettings);
    setNewScenario("");
  };

  const removeScenario = (index: number) => {
    const newSettings = {
      ...settings,
      scenarioPresets: settings.scenarioPresets.filter((_, i) => i !== index),
    };
    setSettings(newSettings);
    saveRuleSettings(newSettings);
  };

  const addEntryBasis = () => {
    if (!newEntryBasis.trim()) return;
    const newSettings = {
      ...settings,
      entryBasisPresets: [...settings.entryBasisPresets, newEntryBasis.trim()],
    };
    setSettings(newSettings);
    saveRuleSettings(newSettings);
    setNewEntryBasis("");
  };

  const removeEntryBasis = (index: number) => {
    const newSettings = {
      ...settings,
      entryBasisPresets: settings.entryBasisPresets.filter(
        (_, i) => i !== index
      ),
    };
    setSettings(newSettings);
    saveRuleSettings(newSettings);
  };

  const handleResetScenarios = () => {
    if (confirm("シナリオ設定を初期値に戻しますか？")) {
      const newSettings = {
        ...settings,
        scenarioPresets: DEFAULT_RULE_SETTINGS.scenarioPresets,
      };
      setSettings(newSettings);
      saveRuleSettings(newSettings);
    }
  };

  const handleResetEntryBasis = () => {
    if (confirm("エントリー根拠設定を初期値に戻しますか？")) {
      const newSettings = {
        ...settings,
        entryBasisPresets: DEFAULT_RULE_SETTINGS.entryBasisPresets,
      };
      setSettings(newSettings);
      saveRuleSettings(newSettings);
    }
  };

  const addRule = () => {
    if (!newRule.trim()) return;
    const newSettings = {
      ...settings,
      myRules: [...(settings.myRules || []), newRule.trim()],
    };
    setSettings(newSettings);
    saveRuleSettings(newSettings);
    setNewRule("");
  };

  const removeRule = (index: number) => {
    const newSettings = {
      ...settings,
      myRules: (settings.myRules || []).filter((_, i) => i !== index),
    };
    setSettings(newSettings);
    saveRuleSettings(newSettings);
  };

  const handleResetRules = () => {
    if (confirm("マイルール設定を初期値に戻しますか？")) {
      const newSettings = {
        ...settings,
        myRules: DEFAULT_RULE_SETTINGS.myRules,
      };
      setSettings(newSettings);
      saveRuleSettings(newSettings);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center justify-between mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-600 transition"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-base font-bold text-gray-900">ルール設定</h1>
        <div className="w-10" />
      </header>

      <div className="max-w-lg mx-auto px-4 space-y-8">
        {/* Scenario Presets */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h2 className="text-lg font-bold text-gray-800">
              シナリオ プリセット
            </h2>
            <button
              onClick={handleResetScenarios}
              className="text-[10px] text-gray-400 hover:text-red-500 font-medium flex items-center gap-1 transition"
            >
              <RotateCcw size={12} />
              初期値に戻す
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={newScenario}
                onChange={(e) => setNewScenario(e.target.value)}
                placeholder="新しいシナリオを追加..."
                className="flex-1 border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-700 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                onKeyDown={(e) => e.key === "Enter" && addScenario()}
              />
              <button
                onClick={addScenario}
                disabled={!newScenario.trim()}
                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <Plus size={20} />
              </button>
            </div>
            <ul className="space-y-2">
              {settings.scenarioPresets.map((item, index) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 group"
                >
                  <span className="text-sm text-gray-700">{item.title}</span>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => removeScenario(index)}
                      className="text-gray-400 hover:text-red-500 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </li>
              ))}
              {settings.scenarioPresets.length === 0 && (
                <li className="text-center text-gray-400 text-sm py-4">
                  プリセットがありません
                </li>
              )}
            </ul>
          </div>
        </section>

        {/* Entry Basis Presets */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h2 className="text-lg font-bold text-gray-800">
              エントリー根拠 プリセット
            </h2>
            <button
              onClick={handleResetEntryBasis}
              className="text-[10px] text-gray-400 hover:text-red-500 font-medium flex items-center gap-1 transition"
            >
              <RotateCcw size={12} />
              初期値に戻す
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={newEntryBasis}
                onChange={(e) => setNewEntryBasis(e.target.value)}
                placeholder="新しい根拠を追加..."
                className="flex-1 border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-700 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                onKeyDown={(e) => e.key === "Enter" && addEntryBasis()}
              />
              <button
                onClick={addEntryBasis}
                disabled={!newEntryBasis.trim()}
                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <Plus size={20} />
              </button>
            </div>
            <ul className="space-y-2">
              {settings.entryBasisPresets.map((item, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 group"
                >
                  <span className="text-sm text-gray-700">{item}</span>
                  <button
                    onClick={() => removeEntryBasis(index)}
                    className="text-gray-400 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </li>
              ))}
              {settings.entryBasisPresets.length === 0 && (
                <li className="text-center text-gray-400 text-sm py-4">
                  プリセットがありません
                </li>
              )}
            </ul>
          </div>
        </section>

        {/* My Rules */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h2 className="text-lg font-bold text-gray-800">マイルール</h2>
            <button
              onClick={handleResetRules}
              className="text-[10px] text-gray-400 hover:text-red-500 font-medium flex items-center gap-1 transition"
            >
              <RotateCcw size={12} />
              初期値に戻す
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={newRule}
                onChange={(e) => setNewRule(e.target.value)}
                placeholder="新しいルールを追加..."
                className="flex-1 border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-700 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                onKeyDown={(e) => e.key === "Enter" && addRule()}
              />
              <button
                onClick={addRule}
                disabled={!newRule.trim()}
                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <Plus size={20} />
              </button>
            </div>
            <ul className="space-y-2">
              {(settings.myRules || []).map((item, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 group"
                >
                  <span className="text-sm text-gray-700">{item}</span>
                  <button
                    onClick={() => removeRule(index)}
                    className="text-gray-400 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </li>
              ))}
              {(!settings.myRules || settings.myRules.length === 0) && (
                <li className="text-center text-gray-400 text-sm py-4">
                  ルールがありません
                </li>
              )}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

const DEFAULT_RULE_SETTINGS: RuleSettings = {
  scenarioPresets: [
    {
      id: "1",
      title: "トレンドフォロー",
      description: "主要トレンド方向への順張り",
    },
    {
      id: "2",
      title: "レンジブレイク",
      description: "レンジ上限/下限のブレイク狙い",
    },
    {
      id: "3",
      title: "逆張り",
      description: "過熱感からの反転狙い",
    },
  ],
  entryBasisPresets: [
    "MA反発",
    "水平線",
    "トレンドライン",
    "チャートパターン",
    "オシレーター",
  ],
  myRules: [
    "飛び乗りエントリーをしない",
    "損切りラインを動かさない",
    "指標発表前後はエントリーしない",
    "感情的になったらチャートを閉じる",
    "リスクリワード1:1.5以上を確保する",
  ],
};
