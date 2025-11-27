import { Trash2, Edit2 } from "lucide-react";
import { TradeNote } from "@/lib/types";
import Link from "next/link";

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
        <div className="flex items-center gap-1">
          <Link
            href={`/history/${note.id}`}
            className="text-gray-400 hover:text-indigo-500 transition p-1"
            aria-label="編集"
          >
            <Edit2 size={16} />
          </Link>
          <button
            onClick={() => onDelete(note.id)}
            className="text-gray-400 hover:text-red-500 transition p-1"
            aria-label="削除"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 text-sm space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">タイプ</span>
          <span
            className={`font-bold px-2 py-0.5 rounded text-xs ${
              note.tradeType === "LONG"
                ? "bg-red-100 text-red-600"
                : "bg-blue-100 text-blue-600"
            }`}
          >
            {note.tradeType}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-200">
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">Entry</div>
            <div className="font-mono font-bold text-gray-900">
              {note.entryPrice.toFixed(3)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">SL</div>
            <div className="font-mono font-bold text-gray-900">
              {note.stopLossPrice.toFixed(3)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">TP</div>
            <div className="font-mono font-bold text-gray-900">
              {note.takeProfitPrice.toFixed(3)}
            </div>
          </div>
        </div>
        {note.stopPips !== undefined && note.takePips !== undefined && (
          <div className="text-center pt-2 border-t border-gray-200">
            <div className="text-xs text-gray-500 mb-1">SL幅 : TP幅</div>
            <div className="font-mono font-bold text-gray-700">
              {note.stopPips} : {note.takePips}{" "}
              <span className="text-xs font-normal text-gray-500">(pips)</span>
            </div>
          </div>
        )}
        {/* リスクリワード比 */}
        <div className="text-center pt-2 border-t border-gray-200">
          <div className="text-xs text-gray-500 mb-1">リスクリワード比</div>
          <div className="font-mono font-bold text-gray-700">
            1 : {note.riskRewardRatio}
          </div>
        </div>
      </div>
    </div>
  );
}
