"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  TrendingUp,
  PieChart,
  Calendar,
  Tag,
  LucideIcon,
} from "lucide-react";
import { getTradeHistory } from "@/lib/storage";
import {
  calculateSummary,
  calculateByCurrency,
  calculateByEntryBasis,
  calculateByDayOfWeek,
  calculateByTimeOfDay,
  AnalyticsSummary,
  GroupedStats,
} from "@/lib/analytics";

const StatCard = ({
  label,
  value,
  subValue,
  color = "text-gray-900",
}: {
  label: string;
  value: string | number;
  subValue?: string | string[];
  color?: string;
}) => (
  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
    <div className="text-xs font-bold text-gray-500 mb-1">{label}</div>
    <div className={`text-2xl font-black font-mono text-center ${color}`}>
      {value}
    </div>
    {subValue && (
      <div className="text-sm text-gray-400 mt-1 space-y-0.5">
        {Array.isArray(subValue) ? (
          subValue.map((line, i) => <div key={i}>{line}</div>)
        ) : (
          <div>{subValue}</div>
        )}
      </div>
    )}
  </div>
);

const StatsTable = ({
  title,
  icon: Icon,
  data,
}: {
  title: string;
  icon: LucideIcon;
  data: GroupedStats[];
}) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2 font-bold text-gray-700">
      <Icon size={18} />
      <span>{title}</span>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
          <tr>
            <th className="px-4 py-2">項目</th>
            <th className="px-4 py-2 text-center">回数</th>
            <th className="px-4 py-2 text-center">勝率</th>
            <th className="px-4 py-2 text-right">損益</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((row) => (
            <tr key={row.key} className="hover:bg-gray-50">
              <td className="px-4 py-2 font-medium text-gray-700">{row.key}</td>
              <td className="px-4 py-2 text-center text-gray-600">
                {row.count}
              </td>
              <td className="px-4 py-2 text-center font-mono">
                <span className="font-bold text-gray-700">
                  {row.winRate.toFixed(1)}%
                </span>
              </td>
              <td
                className={`px-4 py-2 text-right font-mono font-bold ${
                  row.netProfit >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {row.netProfit > 0 ? "+" : ""}
                {row.netProfit.toLocaleString()}
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                データがありません
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default function AnalysisPage() {
  const [mounted, setMounted] = useState(false);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [byCurrency, setByCurrency] = useState<GroupedStats[]>([]);
  const [byBasis, setByBasis] = useState<GroupedStats[]>([]);
  const [byDay, setByDay] = useState<GroupedStats[]>([]);
  const [byTime, setByTime] = useState<GroupedStats[]>([]);

  useEffect(() => {
    setMounted(true);
    const history = getTradeHistory();
    setSummary(calculateSummary(history));
    setByCurrency(calculateByCurrency(history));
    setByBasis(calculateByEntryBasis(history));
    setByDay(calculateByDayOfWeek(history));
    setByTime(calculateByTimeOfDay(history));
  }, []);

  if (!mounted || !summary) return <div className="min-h-screen bg-gray-50" />;

  return (
    <main className="min-h-screen bg-gray-50 pb-28">
      <header className="w-full mb-6 flex items-center justify-between max-w-4xl mx-auto sticky top-0 z-50 bg-gray-50/80 backdrop-blur-md border-b border-gray-200/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-full bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition border border-gray-200 shadow-sm"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            Analytics
          </h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {/* Summary Cards */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="勝率"
            value={`${summary.winRate.toFixed(1)}%`}
            subValue={[
              `${summary.totalTrades} Trades`,
              `${summary.winCount || 0}勝 / ${summary.lossCount || 0}敗`,
            ]}
          />
          <StatCard
            label="合計損益"
            value={`¥${summary.netProfit.toLocaleString()}`}
            subValue={[
              `Max Win: ¥${(summary.maxWin || 0).toLocaleString()}`,
              `Max Loss: ¥${Math.abs(summary.maxLoss || 0).toLocaleString()}`,
            ]}
            color={summary.netProfit >= 0 ? "text-green-600" : "text-red-600"}
          />
          <StatCard
            label="平均RR比"
            value={`1 : ${summary.averageRR.toFixed(2)}`}
            subValue={[
              `Max: 1:${summary.maxRR.toFixed(2)}`,
              `Min: 1:${summary.minRR.toFixed(2)}`,
            ]}
            color={
              summary.averageRR >= 2.0
                ? "text-green-600"
                : summary.averageRR >= 1.5
                ? "text-green-600"
                : summary.averageRR >= 1.0
                ? "text-yellow-600"
                : "text-red-600"
            }
          />
          <StatCard
            label="プロフィットファクター"
            value={`${summary.profitFactor.toFixed(2)}${
              summary.profitFactor >= 2.0
                ? " (優秀)"
                : summary.profitFactor >= 1.5
                ? " (良好)"
                : summary.profitFactor >= 1.0
                ? " (黒字)"
                : " (要改善)"
            }`}
            subValue={[
              `Win: ¥${summary.totalProfit.toLocaleString()}`,
              `Loss: ¥${Math.abs(summary.totalLoss).toLocaleString()}`,
            ]}
            color={
              summary.profitFactor >= 1.5
                ? "text-green-600"
                : summary.profitFactor >= 1.0
                ? "text-yellow-600"
                : "text-red-600"
            }
          />
        </section>

        {/* Detailed Tables */}
        <div className="grid md:grid-cols-2 gap-6">
          <StatsTable title="通貨ペア別" icon={TrendingUp} data={byCurrency} />
          <StatsTable title="エントリー根拠別" icon={Tag} data={byBasis} />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <StatsTable title="曜日別傾向" icon={Calendar} data={byDay} />
          <StatsTable title="時間帯別傾向" icon={PieChart} data={byTime} />
        </div>
      </div>
    </main>
  );
}
