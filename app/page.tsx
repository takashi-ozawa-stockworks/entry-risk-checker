"use client";

import { useState, useEffect } from "react";
import { useRiskSettings } from "@/hooks/useRiskSettings";
import { calculateRisk } from "@/lib/calculator";
import { TradeInput, CalculationResult } from "@/lib/types";
import RiskHeader from "@/components/features/RiskHeader";
import TradeForm from "@/components/features/TradeForm";
import ResultCard from "@/components/features/ResultCard";
import TradeNote from "@/components/features/TradeNote";
import Link from "next/link";
import { Settings } from "lucide-react";

export default function Page() {
  // isLoaded も取得して、設定読み込み完了を検知できるようにする
  const { settings, isLoaded } = useRiskSettings();
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [lastInput, setLastInput] = useState<TradeInput | null>(null);
  const [checkedRules, setCheckedRules] = useState<Set<string>>(new Set());
  const [myRules, setMyRules] = useState<string[]>([]);
  const [enableMyRulesCheck, setEnableMyRulesCheck] = useState(true);

  // Hydration Error対策用のフラグ
  const [mounted, setMounted] = useState(false);

  // マウント（ブラウザ表示）完了後にフラグを立てる
  useEffect(() => {
    setMounted(true);

    // Load My Rules settings
    import("@/lib/rule-settings-storage").then(({ getRuleSettings }) => {
      const ruleSettings = getRuleSettings();
      setMyRules(ruleSettings.myRules || []);
    });

    import("@/lib/my-rules-settings").then(({ getEnableMyRulesCheck }) => {
      setEnableMyRulesCheck(getEnableMyRulesCheck());
    });
  }, []);

  const handleCalculate = (input: TradeInput) => {
    if (!settings) return;
    const r = calculateRisk(input, settings);
    setResult(r);
    setLastInput(input);
    // Reset checked rules when calculating new trade
    setCheckedRules(new Set());
    // 計算したら上までスクロールして結果を見せる
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 1. マウント前、または設定読み込み中は真っ白な画面を表示（これでエラー回避）
  if (!mounted || !isLoaded) {
    return <div className="min-h-screen bg-gray-50" />;
  }

  return (
    // 背景色を bg-white から bg-gray-50 に変更して、設定画面と統一感を出す
    // 背景色を bg-white から bg-gray-50 に変更して、設定画面と統一感を出す
    <main className="min-h-screen bg-gray-50 pb-28">
      {/* settingsがnullの場合はnullを渡してRiskHeader側でエラー表示させる */}
      <RiskHeader settings={settings} />

      <div className="max-w-xl mx-auto space-y-6 px-4">
        {/* 設定がない場合のガード表示 */}
        {!settings && (
          <div className="bg-white p-8 rounded-2xl shadow-sm text-center border border-gray-100">
            <div className="mx-auto w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
              <Settings size={24} />
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">
              設定が必要です
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              資金管理計算を行うために、まずは口座残高や許容リスクを設定してください。
            </p>
            <Link
              href="/settings"
              className="inline-block px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition"
            >
              設定画面へ移動
            </Link>
          </div>
        )}

        {settings && (
          <>
            {/* 結果カード */}
            {result && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300 space-y-6">
                <ResultCard result={result} />

                {/* My Rules Checklist */}
                {enableMyRulesCheck && myRules.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-4 py-3 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-indigo-900">
                        <span>📋</span>
                        <span>マイルール確認</span>
                      </div>
                      <div className="text-xs font-bold text-indigo-600">
                        ✅ {checkedRules.size}/{myRules.length} ルール確認済み
                      </div>
                    </div>
                    <div className="p-4 space-y-2">
                      {myRules.map((rule) => (
                        <label
                          key={rule}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition group"
                        >
                          <input
                            type="checkbox"
                            checked={checkedRules.has(rule)}
                            onChange={(e) => {
                              const newChecked = new Set(checkedRules);
                              if (e.target.checked) {
                                newChecked.add(rule);
                              } else {
                                newChecked.delete(rule);
                              }
                              setCheckedRules(newChecked);
                            }}
                            className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                          <span className="text-sm text-gray-700 group-hover:text-gray-900 transition">
                            {rule}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* エントリー禁止以外の場合にトレードノートを表示 */}
                {lastInput &&
                  result.status !== "ENTRY_FORBIDDEN" &&
                  (() => {
                    const ruleCompliance =
                      !enableMyRulesCheck || myRules.length === 0
                        ? undefined
                        : checkedRules.size === myRules.length
                        ? "FULL"
                        : "VIOLATED";

                    const violatedRules =
                      !enableMyRulesCheck || myRules.length === 0
                        ? undefined
                        : myRules.filter((rule) => !checkedRules.has(rule));

                    return (
                      <TradeNote
                        input={lastInput}
                        result={result}
                        ruleCompliance={ruleCompliance}
                        violatedRules={violatedRules}
                      />
                    );
                  })()}
              </div>
            )}

            {/* フォームエリア: 白いカードに乗せる形にする */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <TradeForm
                defaultTradeType="LONG"
                onCalculate={handleCalculate}
                onReset={() => {
                  setResult(null);
                  setLastInput(null);
                }}
              />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
