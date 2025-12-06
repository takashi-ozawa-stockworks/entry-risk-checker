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
  CheckCircle2,
  Clock,
  Target,
  Zap,
  Lock,
} from "lucide-react";
import { getTradeHistory } from "@/lib/storage";
import {
  calculateSummary,
  calculateByCurrency,
  calculateByDayOfWeek,
  calculateByTimeOfDay,
  calculateByRuleCompliance,
  calculateTopViolatedRules,
  calculateByRiskReward,
  calculateByHoldingTime,
  calculateByExitType,
  calculateStreaks,
  AnalyticsSummary,
  GroupedStats,
  StreakStats,
} from "@/lib/analytics";

const StatCard = ({
  label,
  value,
  subValue,
  color = "text-gray-900",
  hint,
}: {
  label: string;
  value: string | number;
  subValue?: string | string[];
  color?: string;
  hint?: string;
}) => (
  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
    <div className="text-xs font-bold text-gray-500 mb-1">{label}</div>
    <div className={`text-2xl font-black font-mono text-center ${color}`}>
      {value}
    </div>
    {subValue && (
      <div className="text-sm text-gray-400 mt-1 space-y-0.5 text-center">
        {Array.isArray(subValue) ? (
          subValue.map((line, i) => <div key={i}>{line}</div>)
        ) : (
          <div>{subValue}</div>
        )}
      </div>
    )}
    {hint && (
      <div className="mt-auto pt-3 text-[10px] text-gray-400 text-center border-t border-gray-50 leading-tight">
        {hint}
      </div>
    )}
  </div>
);

const StatsTable = ({
  title,
  icon: Icon,
  data,
  isPro = false,
}: {
  title: string;
  icon: LucideIcon;
  data: GroupedStats[];
  isPro?: boolean;
}) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
    {isPro && (
      <div className="absolute top-2 right-2 z-10">
        <span className="bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
          <Lock size={10} /> Pro
        </span>
      </div>
    )}
    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2 font-bold text-gray-700">
      <Icon size={18} className={isPro ? "text-indigo-600" : ""} />
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
                <span
                  className={`font-bold ${
                    row.winRate >= 50
                      ? "text-green-600"
                      : row.winRate >= 40
                      ? "text-gray-700"
                      : "text-red-600"
                  }`}
                >
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

const StreakCard = ({ streaks }: { streaks: StreakStats }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
    <div className="absolute top-2 right-2 z-10">
      <span className="bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
        <Lock size={10} /> Pro
      </span>
    </div>
    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2 font-bold text-gray-700">
      <Zap size={18} className="text-indigo-600" />
      <span>連勝・連敗分析</span>
    </div>
    <div className="p-4 grid grid-cols-2 gap-4">
      <div className="space-y-1 text-center">
        <div className="text-xs text-gray-500 font-bold">最大連勝</div>
        <div className="text-2xl font-black text-green-600 font-mono">
          {streaks.maxWinStreak}
        </div>
        <div className="text-[10px] text-gray-400">
          平均: {streaks.averageWinStreak.toFixed(1)}連勝
        </div>
      </div>
      <div className="space-y-1 text-center">
        <div className="text-xs text-gray-500 font-bold">最大連敗</div>
        <div className="text-2xl font-black text-red-600 font-mono">
          {streaks.maxLossStreak}
        </div>
        <div className="text-[10px] text-gray-400">
          平均: {streaks.averageLossStreak.toFixed(1)}連敗
        </div>
      </div>
      <div className="col-span-2 pt-2 border-t border-gray-100 text-center">
        <div className="text-xs text-gray-500 mb-1">現在の状態</div>
        <div
          className={`font-bold text-lg ${
            streaks.currentStreak > 0
              ? "text-green-600"
              : streaks.currentStreak < 0
              ? "text-red-600"
              : "text-gray-400"
          }`}
        >
          {streaks.currentStreak > 0
            ? `${streaks.currentStreak}連勝中 🔥`
            : streaks.currentStreak < 0
            ? `${Math.abs(streaks.currentStreak)}連敗中 ☔️`
            : "なし"}
        </div>
      </div>
    </div>
  </div>
);

export default function AnalysisPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"basic" | "pro">("basic");
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [byCurrency, setByCurrency] = useState<GroupedStats[]>([]);
  const [byDay, setByDay] = useState<GroupedStats[]>([]);
  const [byTime, setByTime] = useState<GroupedStats[]>([]);

  // Advanced Stats
  const [byCompliance, setByCompliance] = useState<GroupedStats[]>([]);
  const [topViolatedRules, setTopViolatedRules] = useState<GroupedStats[]>([]);
  const [byRR, setByRR] = useState<GroupedStats[]>([]);
  const [byHolding, setByHolding] = useState<GroupedStats[]>([]);
  const [byExit, setByExit] = useState<GroupedStats[]>([]);
  const [streaks, setStreaks] = useState<StreakStats | null>(null);

  useEffect(() => {
    setMounted(true);
    const history = getTradeHistory();
    setSummary(calculateSummary(history));
    setByCurrency(calculateByCurrency(history));
    setByDay(calculateByDayOfWeek(history));
    setByTime(calculateByTimeOfDay(history));

    // Calculate Advanced Stats
    setByCompliance(calculateByRuleCompliance(history));
    setTopViolatedRules(calculateTopViolatedRules(history));
    setByRR(calculateByRiskReward(history));
    setByHolding(calculateByHoldingTime(history));
    setByExit(calculateByExitType(history));
    setStreaks(calculateStreaks(history));
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

      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {/* Tab Navigation */}
        <div className="flex p-1 bg-gray-200/50 rounded-xl">
          <button
            onClick={() => setActiveTab("basic")}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${
              activeTab === "basic"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
            }`}
          >
            Basic
          </button>
          <button
            onClick={() => setActiveTab("pro")}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === "pro"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
            }`}
          >
            <Lock
              size={14}
              className={
                activeTab === "pro" ? "text-indigo-600" : "text-gray-400"
              }
            />
            Pro Analysis
          </button>
        </div>

        {/* Summary Cards (Always Visible) */}
        <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Row 1: Key Results */}
          <StatCard
            label="勝率"
            value={`${summary.winRate.toFixed(1)}%`}
            subValue={`${summary.winCount}勝 / ${summary.lossCount}敗`}
            hint="一般的に40〜60%あれば十分利益を出せます"
          />
          <StatCard
            label="プロフィットファクター"
            value={summary.profitFactor.toFixed(2)}
            subValue={[
              `総利益: ¥${summary.totalProfit.toLocaleString()}`,
              `総損失: ¥${Math.abs(summary.totalLoss).toLocaleString()}`,
            ]}
            color={
              summary.profitFactor >= 1.5
                ? "text-green-600"
                : summary.profitFactor >= 1.0
                ? "text-yellow-600"
                : "text-red-600"
            }
            hint="1.5以上なら優秀、1.0以上で黒字です"
          />
          <StatCard
            label="合計損益"
            value={`¥${summary.netProfit.toLocaleString()}`}
            subValue={`${summary.totalTrades}トレード`}
            color={summary.netProfit >= 0 ? "text-green-600" : "text-red-600"}
          />

          {/* Row 2: Analysis Metrics */}
          <StatCard
            label="期待値 (1トレード)"
            value={`¥${Math.round(summary.expectedValue).toLocaleString()}`}
            color={
              summary.expectedValue >= 0 ? "text-green-600" : "text-red-600"
            }
            hint="1回エントリーするたびに平均これくらい増えます"
          />
          <StatCard
            label="平均リスク (損失額)"
            value={`¥${Math.round(
              Math.abs(summary.averageLoss)
            ).toLocaleString()}`}
            hint="1回のトレードで平均これくらいのリスクを取っています"
          />
          <StatCard
            label="平均RR比"
            value={`1 : ${summary.averageRR.toFixed(2)}`}
            color={
              summary.averageRR >= 1.5
                ? "text-green-600"
                : summary.averageRR >= 1.0
                ? "text-yellow-600"
                : "text-red-600"
            }
            hint="1:1.5以上を目指すと、勝率が低くても利益が出やすくなります"
          />
        </section>

        {/* Basic Tab Content */}
        {activeTab === "basic" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="grid md:grid-cols-2 gap-6">
              <StatsTable
                title="通貨ペア別"
                icon={TrendingUp}
                data={byCurrency}
              />
              <StatsTable title="曜日別傾向" icon={Calendar} data={byDay} />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <StatsTable title="時間帯別傾向" icon={PieChart} data={byTime} />
            </div>
          </div>
        )}

        {/* Pro Tab Content */}
        {activeTab === "pro" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-start gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                <Zap size={20} />
              </div>
              <div>
                <h3 className="font-bold text-indigo-900">
                  Pro Analysis Features
                </h3>
                <p className="text-xs text-indigo-700 mt-1">
                  より深い分析で、トレードの改善点を見つけましょう。
                  ルール遵守率やリスクリワード比の最適化が可能です。
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <StatsTable
                title="ルール遵守分析"
                icon={CheckCircle2}
                data={byCompliance}
                isPro={true}
              />
              <StatsTable
                title="最も違反しやすいルール TOP3"
                icon={Zap}
                data={topViolatedRules}
                isPro={true}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <StatsTable
                title="リスクリワード別"
                icon={Target}
                data={byRR}
                isPro={true}
              />
              <StatsTable
                title="保有時間別"
                icon={Clock}
                data={byHolding}
                isPro={true}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <StatsTable
                title="決済タイプ別"
                icon={Tag}
                data={byExit}
                isPro={true}
              />
              {streaks && <StreakCard streaks={streaks} />}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
