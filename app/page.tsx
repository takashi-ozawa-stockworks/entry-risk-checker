'use client';

import { useState, useEffect } from 'react';
import { useRiskSettings } from '@/hooks/useRiskSettings';
import { calculateRisk } from '@/lib/calculator';
import { TradeInput, CalculationResult } from '@/lib/types';
import RiskHeader from '@/components/features/RiskHeader';
import TradeForm from '@/components/features/TradeForm';
import ResultCard from '@/components/features/ResultCard';
import Link from 'next/link';
import { Settings } from 'lucide-react';

export default function Page() {
  // isLoaded も取得して、設定読み込み完了を検知できるようにする
  const { settings, isLoaded } = useRiskSettings();
  const [result, setResult] = useState<CalculationResult | null>(null);
  
  // Hydration Error対策用のフラグ
  const [mounted, setMounted] = useState(false);

  // マウント（ブラウザ表示）完了後にフラグを立てる
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCalculate = (input: TradeInput) => {
    if (!settings) return;
    const r = calculateRisk(input, settings);
    setResult(r);
    // 計算したら上までスクロールして結果を見せる
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 1. マウント前、または設定読み込み中は真っ白な画面を表示（これでエラー回避）
  if (!mounted || !isLoaded) {
    return <div className="min-h-screen bg-gray-50" />;
  }

  return (
    // 背景色を bg-white から bg-gray-50 に変更して、設定画面と統一感を出す
    <main className="min-h-screen bg-gray-50 p-4 pb-28">
      
      {/* settingsがnullの場合はnullを渡してRiskHeader側でエラー表示させる */}
      <RiskHeader settings={settings} />

      <div className="max-w-xl mx-auto space-y-6">
        {/* 設定がない場合のガード表示 */}
        {!settings && (
          <div className="bg-white p-8 rounded-2xl shadow-sm text-center border border-gray-100">
            <div className="mx-auto w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
              <Settings size={24} />
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">設定が必要です</h2>
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
              <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                <ResultCard result={result} />
              </div>
            )}

            {/* フォームエリア: 白いカードに乗せる形にする */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <TradeForm
                defaultTradeType="LONG"
                onCalculate={handleCalculate}
                onReset={() => setResult(null)}
              />
            </div>
          </>
        )}
      </div>
    </main>
  );
}