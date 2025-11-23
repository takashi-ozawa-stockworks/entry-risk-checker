'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, ChevronLeft, Save } from 'lucide-react';
import { useRiskSettings } from '@/hooks/useRiskSettings';
import { RiskSettings } from '@/lib/types';

// 入力フィールド用のコンポーネント
const FieldRow = ({
  label,
  hint,
  unit,
  children,
  error,
}: {
  label: string;
  hint?: string;
  unit?: string;
  children: React.ReactNode;
  error?: string | null;
}) => (
  <div className="space-y-1.5">
    <div className="flex items-baseline justify-between">
      <label className="text-sm font-bold text-gray-700">{label}</label>
    </div>
    
    <div className="relative">
      {children}
      {unit && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 pointer-events-none">
          {unit}
        </div>
      )}
    </div>

    <div className="flex justify-between items-start gap-2">
      {hint && <p className="text-[11px] text-gray-400 leading-tight">{hint}</p>}
      {error && <p className="text-xs font-bold text-red-500 text-right shrink-0">{error}</p>}
    </div>
  </div>
);

// フォーム用の型定義（入力中は空文字を許容するため）
type SettingsFormState = {
  [K in keyof RiskSettings]: number | '';
};

export default function SettingsPage() {
  const router = useRouter();
  const { settings, save } = useRiskSettings();

  // 初期値
  const [form, setForm] = useState<SettingsFormState>({
    accountBalance: '',
    riskPercentage: '',
    pipsValuePerLot: '',
    minLot: '',
    lotStep: '',
    minRiskRewardRatio: '',
  });

  const [errors, setErrors] = useState<Record<string, string | null>>({});

  // 設定読み込み時にフォームに反映
  useEffect(() => {
    if (settings) {
      setForm({ ...settings });
    }
  }, [settings]);

  // 入力ハンドラ（空文字を許容し、0になるのを防ぐ）
  const handleChange = <K extends keyof SettingsFormState>(key: K, value: string) => {
    // エラーをリセット
    setErrors((e) => ({ ...e, [key]: null }));

    if (value === '') {
      setForm((s) => ({ ...s, [key]: '' }));
      return;
    }

    const num = parseFloat(value);
    // 0以上のみ許可
    if (!isNaN(num) && num >= 0) {
      setForm((s) => ({ ...s, [key]: num }));
    }
  };

  // マイナスキー自体の入力を無効化
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === '-' || e.key === 'e' || e.key === 'E') {
      e.preventDefault();
    }
  };

  const validate = (): boolean => {
    const next: Record<string, string | null> = {};
    
    // 値が空文字、または0以下の場合にエラー
    if (form.accountBalance === '' || form.accountBalance <= 0) next.accountBalance = '正の値を入力してください';
    if (form.riskPercentage === '' || form.riskPercentage <= 0 || form.riskPercentage > 100) next.riskPercentage = '0〜100の間で入力してください';
    if (form.pipsValuePerLot === '' || form.pipsValuePerLot <= 0) next.pipsValuePerLot = '正の値を入力してください';
    if (form.minLot === '' || form.minLot <= 0) next.minLot = '正の値を入力してください';
    if (form.lotStep === '' || form.lotStep <= 0) next.lotStep = '正の値を入力してください';
    if (form.minRiskRewardRatio === '' || form.minRiskRewardRatio <= 0) next.minRiskRewardRatio = '正の値を入力してください';

    setErrors(next);
    return !Object.values(next).some(Boolean);
  };

  const handleSave = () => {
    if (!validate()) return;
    try {
      // 保存時は number 型にキャスト（バリデーション済みなので安全）
      save(form as RiskSettings);
      router.back();
    } catch (e) {
      console.error(e);
      alert('保存に失敗しました。');
    }
  };

  // 共通Inputスタイル（スマホ対策：text-gray-900, opacity-100 を明示）
  const inputClass = "w-full border border-gray-200 bg-gray-50/50 rounded-xl px-4 py-3 text-lg font-mono shadow-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-gray-900 opacity-100 placeholder:text-gray-300";

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center justify-between mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-600 transition"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-base font-bold text-gray-900">リスク設定</h1>
        <div className="w-10" />
      </header>

      <div className="max-w-lg mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-8">
          
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-indigo-600 border-b border-indigo-100 pb-2 mb-4">
              <Settings size={18} />
              <span className="text-xs font-bold uppercase tracking-wider">基本設定</span>
            </div>

            <FieldRow label="口座残高" hint="現在の有効証拠金を入力" unit="JPY" error={errors.accountBalance}>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                className={inputClass}
                value={form.accountBalance}
                onChange={(e) => handleChange('accountBalance', e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="100000"
              />
            </FieldRow>

            <FieldRow label="許容リスク" hint="1トレードあたりの最大損失率" unit="%" error={errors.riskPercentage}>
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                min="0"
                className={inputClass}
                value={form.riskPercentage}
                onChange={(e) => handleChange('riskPercentage', e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="2.0"
              />
            </FieldRow>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-2 text-gray-400 border-b border-gray-100 pb-2 mb-4 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider">詳細パラメータ</span>
            </div>

            <FieldRow label="1pips損益 (1Lot)" hint="USD/JPY等のクロス円は通常1000" unit="円" error={errors.pipsValuePerLot}>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                className={inputClass}
                value={form.pipsValuePerLot}
                onChange={(e) => handleChange('pipsValuePerLot', e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="1000"
              />
            </FieldRow>

            <div className="grid grid-cols-2 gap-4">
              <FieldRow label="最小ロット" unit="Lot" error={errors.minLot}>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  className={inputClass}
                  value={form.minLot}
                  onChange={(e) => handleChange('minLot', e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="0.01"
                />
              </FieldRow>

              <FieldRow label="ロット刻み" unit="Lot" error={errors.lotStep}>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  className={inputClass}
                  value={form.lotStep}
                  onChange={(e) => handleChange('lotStep', e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="0.01"
                />
              </FieldRow>
            </div>

            <FieldRow label="最低リスクリワード" hint="これ未満のエントリーは警告が出ます" unit="RR" error={errors.minRiskRewardRatio}>
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                min="0"
                className={inputClass}
                value={form.minRiskRewardRatio}
                onChange={(e) => handleChange('minRiskRewardRatio', e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="1.5"
              />
            </FieldRow>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur border-t border-gray-200 safe-area-bottom">
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleSave}
            className="w-full py-4 rounded-xl text-white bg-gray-900 shadow-lg font-bold text-lg flex items-center justify-center gap-2 hover:bg-gray-800 active:scale-[0.98] transition"
          >
            <Save size={20} />
            設定を保存する
          </button>
        </div>
      </div>
    </div>
  );
}