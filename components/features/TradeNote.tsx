"use client";

import { useRouter } from "next/navigation";
import { Save, FileText } from "lucide-react";
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
  const router = useRouter();

  // 価格の計算 (PIPSモードの場合に対応)
  const getPrice = (
    mode: "PRICE" | "PIPS",
    price: number | undefined,
    pips: number | undefined,
    type: "SL" | "TP"
  ) => {
    if (mode === "PRICE" && price) return price;
    if (mode === "PIPS" && pips) {
      // 通貨ペアに応じて倍率を変更
      let multiplier = JPY_PIPS_MULTIPLIER; // 100
      if (input.currencyPair && !input.currencyPair.endsWith("JPY")) {
        multiplier = 10000;
      }

      const diff = pips / multiplier;
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
    const id = crypto.randomUUID();
    const newNote: TradeNoteType = {
      id,
      timestamp: Date.now(),
      tradeType: input.tradeType,
      entryPrice: input.entryPrice,
      stopLossPrice: slPrice,
      takeProfitPrice: tpPrice,
      actualLoss: result.actualLoss,
      potentialProfit: result.potentialProfit,
      stopPips: result.stopPips,
      takePips: result.takePips,
      riskRewardRatio: result.riskRewardRatio,
      currencyPair: input.currencyPair, // 保存時に追加
      note: "", // ノート機能は削除されたため空文字
    };
    saveTradeNote(newNote);

    router.push(`/history/${id}`);
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
            <span className="text-gray-500 text-sm">日時</span>
            <span className="font-mono text-md font-medium text-gray-700">
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
            <div className="flex justify-between items-center text-sm border-b border-gray-200 pb-2">
              <span className="text-gray-500">通貨ペア</span>
              <span className="font-bold px-2 py-0.5 rounded text-sm text-gray-900 bg-white border border-gray-200">
                {input.currencyPair}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">タイプ</span>
              <span
                className={`font-bold px-2 py-0.5 rounded text-xs ${
                  input.tradeType === "LONG"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {input.tradeType}
              </span>
            </div>
            <div className="pt-2 border-t border-gray-200 space-y-3">
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-1">Entry</div>
                <div className="font-mono text-2xl font-bold text-gray-900">
                  {input.entryPrice.toFixed(
                    input.currencyPair?.endsWith("JPY") ? 3 : 5
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center border-r border-gray-200">
                  <div className="text-sm text-gray-500 mb-1">SL</div>
                  <div className="font-mono text-lg font-bold text-gray-900">
                    {slPrice.toFixed(
                      input.currencyPair?.endsWith("JPY") ? 3 : 5
                    )}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-1">TP</div>
                  <div className="font-mono text-lg font-bold text-gray-900">
                    {tpPrice.toFixed(
                      input.currencyPair?.endsWith("JPY") ? 3 : 5
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 損切幅 : 利確幅 */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200">
              <div className="text-center border-r border-gray-200">
                <div className="text-sm text-gray-500 mb-1">SL幅</div>
                <div className="font-mono text-lg font-bold text-gray-900">
                  {result.stopPips}
                  <span className="text-xs font-normal text-gray-500 ml-1">
                    pips
                  </span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-1">TP幅</div>
                <div className="font-mono text-lg font-bold text-gray-900">
                  {result.takePips}
                  <span className="text-xs font-normal text-gray-500 ml-1">
                    pips
                  </span>
                </div>
              </div>
            </div>

            {/* Risk Reward */}
            <div className="text-center pt-2 border-t border-gray-200">
              <div className="text-sm text-gray-500 mb-1">リスクリワード比</div>
              <div className="font-mono text-lg font-bold text-gray-900">
                1：{result.riskRewardRatio.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="pt-2">
          <button
            onClick={handleSave}
            className="w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800"
          >
            <Save size={20} />
            Save Note
          </button>
        </div>
      </div>
    </section>
  );
}
