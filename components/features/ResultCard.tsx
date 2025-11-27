import { ArrowRight, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { CalculationResult } from "@/lib/types";

// ステータスごとのスタイル定義
const statusConfig = {
  ENTRY_OK: {
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-800",
    icon: CheckCircle,
    label: "ENTRY OK",
    lotColor: "text-green-700",
  },
  CONDITIONS_NG: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-800",
    icon: AlertTriangle,
    label: "CHECK CONDITIONS",
    lotColor: "text-yellow-700",
  },
  ENTRY_FORBIDDEN: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-800",
    icon: XCircle,
    label: "ENTRY FORBIDDEN",
    lotColor: "text-red-700",
  },
} as const;

export default function ResultCard({ result }: { result: CalculationResult }) {
  const config = statusConfig[result.status];
  const Icon = config.icon;
  const formatYen = (v: number) => `¥${v.toLocaleString()}`;

  // RRが基準を下回っている場合に強調表示するためのロジック
  const isRRLow =
    result.status === "CONDITIONS_NG" && result.riskRewardRatio < 1.5;

  return (
    <section
      className={`w-full border-2 rounded-xl overflow-hidden shadow-sm ${config.bg} ${config.border}`}
    >
      {/* 1. ヘッダー */}
      <div
        className={`px-4 py-2 flex items-center gap-2 font-bold text-sm border-b ${config.border} ${config.text} bg-white/40`}
      >
        <Icon size={18} />
        <span>{config.label}</span>
      </div>

      <div className="p-5">
        {/* 2. メイン: 推奨ロット (サイズを 6xl -> 5xl に調整) */}
        <div className="text-center mb-6">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
            Recommended Lot
          </div>
          <div
            className={`text-5xl font-black tracking-tighter ${config.lotColor}`}
          >
            {result.recommendedLot.toFixed(2)}
            <span className="text-xl font-medium ml-1 text-gray-500">
              L o t
            </span>
          </div>
        </div>

        {/* 3. 詳細: グリッドレイアウト */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* RR表示 */}
          <div className="bg-white/40 p-2 rounded text-center">
            <div className="text-sm text-gray-500 mb-1">リスクリワード比</div>
            <div
              className={`font-mono font-bold text-lg ${
                isRRLow ? "text-red-600" : "text-gray-700"
              }`}
            >
              1 : {result.riskRewardRatio.toFixed(2)}
            </div>
          </div>

          {/* 損切り幅 & 利確幅 */}
          <div className="bg-white/40 p-2 rounded text-center">
            <div className="text-sm text-gray-500 mb-1">SL幅 : TP幅</div>
            <div className="font-mono font-bold text-lg text-gray-700">
              {result.stopPips}{" : "}{result.takePips}
              <span className="text-xs font-normal">(pips)</span>
            </div>
          </div>

          {/* 損失リスク表示 */}
          <div className="bg-white/40 p-2 rounded text-center">
            <div className="text-sm text-gray-500 mb-1">想定損失</div>
            <div className="flex items-baseline justify-center gap-1">
              <div className="font-mono font-bold text-lg text-red-600">
                {formatYen(result.actualLoss)}
              </div>
              <div
                className={`text-xs font-bold ${
                  result.actualRiskPercent > 2.0
                    ? "text-red-600"
                    : "text-gray-500"
                }`}
              >
                ({result.actualRiskPercent}%)
              </div>
            </div>
          </div>

          {/* 想定利益 */}
          <div className="bg-white/40 p-2 rounded text-center">
            <div className="text-sm text-gray-500 mb-1">想定利益</div>
            <div className="flex items-baseline justify-center gap-1">
              <div className="font-mono text-lg font-bold text-green-600">
                {formatYen(result.potentialProfit)}
              </div>
            </div>
          </div>
        </div>

        {/* 4. メッセージ */}
        {result.messages.length > 0 && (
          <div className="bg-white/80 p-3 rounded-lg text-sm border border-black/5 shadow-sm">
            {result.messages.map((m, i) => (
              <div key={i} className="flex items-start gap-2 text-gray-700">
                <ArrowRight
                  size={16}
                  className="mt-0.5 text-gray-400 shrink-0"
                />
                <span className="font-medium">{m}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
