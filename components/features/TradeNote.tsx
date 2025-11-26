import { useState } from "react";
import { Save, Check, FileText } from "lucide-react";
import {
  TradeInput,
  CalculationResult,
  TradeNote as TradeNoteType,
} from "@/lib/types";
import { saveTradeNote } from "@/lib/storage";
import { JPY_PIPS_MULTIPLIER } from "@/lib/constants";

interface Props {
  input: TradeInput;
  result: CalculationResult;
}

export default function TradeNote({ input, result }: Props) {
  const [saved, setSaved] = useState(false);

  // 価格の計算 (PIPSモードの場合に対応)
  const getPrice = (
    mode: "PRICE" | "PIPS",
    price: number | undefined,
    pips: number | undefined,
    type: "SL" | "TP"
  ) => {
    if (mode === "PRICE" && price) return price;
    if (mode === "PIPS" && pips) {
      const diff = pips / JPY_PIPS_MULTIPLIER; // 100で割って円単位にする
      if (input.tradeType === "LONG") {
        return type === "TP"
          ? input.entryPrice + diff
          : input.entryPrice - diff;
      } else {
        return type === "TP"
          ? input.entryPrice - diff
          : input.entryPrice + diff;
      }
    }
    return 0;
  };

  const slPrice = getPrice(
    input.stopLossMode,
    input.stopLossPrice,
    input.stopLossPips,
    "SL"
  );
  const tpPrice = getPrice(
    input.takeProfitMode,
    input.takeProfitPrice,
    input.takeProfitPips,
    "TP"
  );

  const handleSave = () => {
    const newNote: TradeNoteType = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      tradeType: input.tradeType,
      entryPrice: input.entryPrice,
      stopLossPrice: slPrice,
      takeProfitPrice: tpPrice,
      actualLoss: result.actualLoss,
      potentialProfit: result.potentialProfit,
      riskRewardRatio: result.riskRewardRatio,
      note: "", // ノート機能は削除されたため空文字
    };
    saveTradeNote(newNote);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2 font-bold text-gray-700">
        <FileText size={18} />
        <span>Trade Note</span>
      </div>

      <div className="p-5 space-y-4">
        {/* プレビュー表示 (読み取り専用) */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm space-y-3">
          <div className="flex justify-between items-center border-b border-gray-200 pb-2">
            <span className="text-gray-500 text-xs font-bold">日時</span>
            <span className="font-mono font-medium text-gray-700">
              {new Date().toLocaleString("ja-JP", {
                year: "numeric",
                month: "long",
                day: "numeric",
                weekday: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          <div className="space-y-3">
            {/* Entry */}
            <div className="flex items-center justify-between">
              <span className="text-gray-500 font-medium">エントリー</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-lg text-gray-900">
                  {input.entryPrice.toFixed(3)}
                </span>
                <span
                  className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                    input.tradeType === "LONG"
                      ? "bg-red-100 text-red-600"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {input.tradeType}
                </span>
              </div>
            </div>

            {/* Stop Loss */}
            <div className="flex items-center justify-between">
              <span className="text-gray-500 font-medium">損切り</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-lg text-gray-900">
                  {slPrice.toFixed(3)}
                </span>
                <span className="text-xs text-gray-500">
                  (-{result.actualLoss.toLocaleString()}円)
                </span>
              </div>
            </div>

            {/* Take Profit */}
            <div className="flex items-center justify-between">
              <span className="text-gray-500 font-medium">利確</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-lg text-gray-900">
                  {tpPrice.toFixed(3)}
                </span>
                <span className="text-xs text-green-600 font-bold">
                  (+{result.potentialProfit.toLocaleString()}円)
                </span>
              </div>
            </div>

            {/* Risk Reward */}
            <div className="flex justify-between items-center pt-1">
              <span className="text-gray-500 font-medium">リスクリワード</span>
              <span className="font-mono font-bold text-lg text-gray-900">
                1 : {result.riskRewardRatio.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="pt-2">
          <button
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-bold text-sm shadow-sm"
          >
            {saved ? <Check size={18} /> : <Save size={18} />}
            {saved ? "Saved!" : "Save Note"}
          </button>
        </div>
      </div>
    </section>
  );
}
