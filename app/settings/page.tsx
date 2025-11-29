"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Settings,
  ChevronLeft,
  Save,
  RotateCcw,
  Lock,
  Unlock,
} from "lucide-react";
import { useRiskSettings } from "@/hooks/useRiskSettings";
import { RiskSettings } from "@/lib/types";
import { usePasscode } from "@/contexts/PasscodeContext";

const PasscodeSettings = () => {
  const { hasPasscode, setPasscode, removePasscode } = usePasscode();
  const [isEditing, setIsEditing] = useState(false);
  const [input, setInput] = useState("");

  const handleSetPasscode = async () => {
    if (input.length === 4) {
      await setPasscode(input);
      setIsEditing(false);
      setInput("");
      alert("パスコードを設定しました");
    }
  };

  const handleRemovePasscode = async () => {
    if (confirm("パスコードロックを解除しますか？")) {
      await removePasscode();
    }
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm space-y-3">
        <div className="text-sm font-bold text-gray-700">
          新しいパスコードを入力
        </div>
        <div className="flex items-center gap-2">
          <input
            type="tel"
            maxLength={4}
            className="flex-1 min-w-0 border border-gray-200 bg-gray-50 rounded-lg px-3 py-3 text-center text-xl font-mono tracking-[0.5em] focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-gray-900 placeholder:text-gray-300"
            value={input}
            onChange={(e) => setInput(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="0000"
          />
          <button
            onClick={handleSetPasscode}
            disabled={input.length !== 4}
            className="px-4 py-3 bg-indigo-600 text-white rounded-lg font-bold disabled:opacity-50 whitespace-nowrap shadow-sm hover:bg-indigo-700 transition"
          >
            設定
          </button>
          <button
            onClick={() => {
              setIsEditing(false);
              setInput("");
            }}
            className="px-3 py-3 text-gray-500 hover:bg-gray-100 rounded-lg whitespace-nowrap transition text-sm font-medium"
          >
            キャンセル
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-lg ${
            hasPasscode
              ? "bg-green-100 text-green-600"
              : "bg-gray-200 text-gray-500"
          }`}
        >
          {hasPasscode ? <Lock size={20} /> : <Unlock size={20} />}
        </div>
        <div>
          <div className="font-bold text-gray-900">パスコードロック</div>
          <div className="text-xs text-gray-500">
            {hasPasscode ? "設定済み" : "未設定"}
          </div>
        </div>
      </div>

      {hasPasscode ? (
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
          >
            変更
          </button>
          <button
            onClick={handleRemovePasscode}
            className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition"
          >
            解除
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          className="px-4 py-2 text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition"
        >
          設定する
        </button>
      )}
    </div>
  );
};

// フォーム用の型定義（入力中は空文字を許容するため）
type SettingsFormState = {
  [K in keyof RiskSettings]: number | "";
};
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
      {hint && (
        <p className="text-[11px] text-gray-400 leading-tight">{hint}</p>
      )}
      {error && (
        <p className="text-xs font-bold text-red-500 text-right shrink-0">
          {error}
        </p>
      )}
    </div>
  </div>
);

export default function SettingsPage() {
  const router = useRouter();
  const { settings, save } = useRiskSettings();

  // 初期値
  const [form, setForm] = useState<SettingsFormState>({
    accountBalance: "",
    riskPercentage: "",
    pipsValuePerLot: "",
    minLot: "",
    lotStep: "",
    minRiskRewardRatio: "",
  });

  const [errors, setErrors] = useState<Record<string, string | null>>({});

  // 設定読み込み時にフォームに反映
  useEffect(() => {
    if (settings) {
      setForm({ ...settings });
    }
  }, [settings]);

  // 入力ハンドラ（空文字を許容し、0になるのを防ぐ）
  const handleChange = <K extends keyof SettingsFormState>(
    key: K,
    value: string
  ) => {
    // エラーをリセット
    setErrors((e) => ({ ...e, [key]: null }));

    if (value === "") {
      setForm((s) => ({ ...s, [key]: "" }));
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
    if (e.key === "-" || e.key === "e" || e.key === "E") {
      e.preventDefault();
    }
  };

  const validate = (): boolean => {
    const next: Record<string, string | null> = {};

    // 値が空文字、または0以下の場合にエラー
    if (form.accountBalance === "" || form.accountBalance <= 0)
      next.accountBalance = "正の値を入力してください";
    if (
      form.riskPercentage === "" ||
      form.riskPercentage <= 0 ||
      form.riskPercentage > 100
    )
      next.riskPercentage = "0〜100の間で入力してください";
    if (form.pipsValuePerLot === "" || form.pipsValuePerLot <= 0)
      next.pipsValuePerLot = "正の値を入力してください";
    if (form.minLot === "" || form.minLot <= 0)
      next.minLot = "正の値を入力してください";
    if (form.lotStep === "" || form.lotStep <= 0)
      next.lotStep = "正の値を入力してください";
    if (form.minRiskRewardRatio === "" || form.minRiskRewardRatio <= 0)
      next.minRiskRewardRatio = "正の値を入力してください";

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
      alert("保存に失敗しました。");
    }
  };

  const handleReset = () => {
    if (confirm("設定を初期値に戻しますか？")) {
      setForm(DEFAULT_SETTINGS);
      save(DEFAULT_SETTINGS);
    }
  };

  // 共通Inputスタイル（スマホ対策：text-gray-900, opacity-100 を明示）
  const inputClass =
    "w-full border border-gray-200 bg-gray-50/50 rounded-xl px-4 py-3 text-lg font-mono shadow-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-gray-900 opacity-100 placeholder:text-gray-300";

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
            <div className="flex items-center justify-between border-b border-indigo-100 pb-2 mb-4">
              <div className="flex items-center gap-2 text-indigo-600">
                <Settings size={18} />
                <span className="text-xs font-bold uppercase tracking-wider">
                  基本設定
                </span>
              </div>
              <button
                onClick={handleReset}
                className="text-[10px] text-gray-400 hover:text-red-500 font-medium flex items-center gap-1 transition"
              >
                <RotateCcw size={12} />
                初期値に戻す
              </button>
            </div>

            <button
              onClick={() => router.push("/settings/rules")}
              className="w-full flex items-center justify-between p-4 bg-indigo-50 border border-indigo-100 rounded-xl mb-6 hover:bg-indigo-100 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg group-hover:bg-indigo-200 transition">
                  <Settings size={20} />
                </div>
                <div className="text-left">
                  <div className="font-bold text-indigo-900">ルール設定</div>
                  <div className="text-xs text-indigo-600">
                    シナリオ・根拠のプリセット編集
                  </div>
                </div>
              </div>
              <ChevronLeft size={20} className="rotate-180 text-indigo-400" />
            </button>

            <FieldRow
              label="口座残高"
              hint="現在の有効証拠金を入力"
              unit="JPY"
              error={errors.accountBalance}
            >
              <input
                type="number"
                inputMode="decimal"
                min="0"
                className={inputClass}
                value={form.accountBalance}
                onChange={(e) => handleChange("accountBalance", e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="100000"
              />
            </FieldRow>

            <FieldRow
              label="許容リスク"
              hint="1トレードあたりの最大損失率"
              unit="%"
              error={errors.riskPercentage}
            >
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                min="0"
                className={inputClass}
                value={form.riskPercentage}
                onChange={(e) => handleChange("riskPercentage", e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="2.0"
              />
            </FieldRow>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-2 text-gray-400 border-b border-gray-100 pb-2 mb-4 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider">
                詳細パラメータ
              </span>
            </div>

            <FieldRow
              label="1pips損益 (1Lot)"
              hint="クロス円(USD/JPY等)での価値。ドルスト等はレート換算されます"
              unit="円"
              error={errors.pipsValuePerLot}
            >
              <input
                type="number"
                inputMode="decimal"
                min="0"
                className={inputClass}
                value={form.pipsValuePerLot}
                onChange={(e) =>
                  handleChange("pipsValuePerLot", e.target.value)
                }
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
                  onChange={(e) => handleChange("minLot", e.target.value)}
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
                  onChange={(e) => handleChange("lotStep", e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="0.01"
                />
              </FieldRow>
            </div>

            <FieldRow
              label="最低リスクリワード"
              hint="これ未満のエントリーは警告が出ます"
              unit="RR"
              error={errors.minRiskRewardRatio}
            >
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                min="0"
                className={inputClass}
                value={form.minRiskRewardRatio}
                onChange={(e) =>
                  handleChange("minRiskRewardRatio", e.target.value)
                }
                onKeyDown={handleKeyDown}
                placeholder="1.5"
              />
            </FieldRow>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-2 text-gray-400 border-b border-gray-100 pb-2 mb-4 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider">
                セキュリティ
              </span>
            </div>

            <PasscodeSettings />
          </div>

          {/* Development Tools */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-gray-400 border-b border-gray-100 pb-2 mb-4 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider">
                開発用ツール
              </span>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => {
                  if (
                    confirm(
                      "ダミーデータを生成しますか？（既存のデータに追加されます）"
                    )
                  ) {
                    import("@/lib/seeder").then(({ generateDummyData }) => {
                      const count = generateDummyData();
                      alert(`${count}件のデータを生成しました`);
                      window.location.reload();
                    });
                  }
                }}
                className="w-full py-3 bg-white border border-gray-300 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition shadow-sm"
              >
                ダミーデータを生成 (各ペア30件)
              </button>
              <button
                onClick={() => {
                  if (
                    confirm(
                      "すべてのトレード記録を削除しますか？この操作は取り消せません。"
                    )
                  ) {
                    if (typeof window !== "undefined") {
                      window.localStorage.removeItem(
                        "entry_risk_checker_history"
                      );
                      alert("トレード記録をリセットしました");
                      window.location.reload();
                    }
                  }
                }}
                className="w-full py-3 bg-white border border-red-300 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition shadow-sm"
              >
                トレード記録をリセット
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur border-t border-gray-200 safe-area-bottom">
        <div className="max-w-lg mx-auto space-y-3">
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

const DEFAULT_SETTINGS: RiskSettings = {
  accountBalance: 100000,
  riskPercentage: 2.0,
  pipsValuePerLot: 1000,
  minLot: 0.01,
  lotStep: 0.01,
  minRiskRewardRatio: 1.5,
};
