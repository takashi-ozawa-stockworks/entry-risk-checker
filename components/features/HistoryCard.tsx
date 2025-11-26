import { Trash2 } from "lucide-react";
import { TradeNote } from "@/lib/types";

interface Props {
  note: TradeNote;
  onDelete: (id: string) => void;
}

export default function HistoryCard({ note, onDelete }: Props) {
  const date = new Date(note.timestamp);
  const dateStr = date.toLocaleString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <div className="text-xs font-bold text-gray-500">{dateStr}</div>
        <button
          onClick={() => onDelete(note.id)}
          className="text-gray-400 hover:text-red-500 transition p-1"
          aria-label="削除"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 text-sm space-y-3">
        {/* Entry */}
        <div className="flex items-center justify-between">
          <span className="text-gray-500 font-medium text-xs">エントリー</span>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-base text-gray-900">
              {note.entryPrice.toFixed(3)}
            </span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                note.tradeType === "LONG"
                  ? "bg-red-100 text-red-600"
                  : "bg-blue-100 text-blue-600"
              }`}
            >
              {note.tradeType}
            </span>
          </div>
        </div>

        {/* Stop Loss */}
        <div className="flex items-center justify-between">
          <span className="text-gray-500 font-medium text-xs">損切り</span>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-base text-gray-900">
              {note.stopLossPrice.toFixed(3)}
            </span>
            <span className="text-[10px] text-gray-500">
              (-{note.actualLoss.toLocaleString()}円)
            </span>
          </div>
        </div>

        {/* Take Profit */}
        <div className="flex items-center justify-between">
          <span className="text-gray-500 font-medium text-xs">利確</span>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-base text-gray-900">
              {note.takeProfitPrice.toFixed(3)}
            </span>
            <span className="text-[10px] text-green-600 font-bold">
              (+{note.potentialProfit.toLocaleString()}円)
            </span>
          </div>
        </div>

        {/* Risk Reward */}
        <div className="flex justify-between items-center pt-1 border-t border-gray-100 mt-2">
          <span className="text-gray-500 font-medium text-xs">
            リスクリワード
          </span>
          <span className="font-mono font-bold text-base text-gray-900">
            1 : {note.riskRewardRatio.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
