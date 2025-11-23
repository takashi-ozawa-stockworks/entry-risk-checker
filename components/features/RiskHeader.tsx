import Link from 'next/link';
import { Settings, Wallet, PieChart, TrendingUp } from 'lucide-react';
import { RiskSettings } from '@/lib/types';

export default function RiskHeader({ settings }: { settings: RiskSettings | null }) {
  const formatYen = (v: number) => `¥${v.toLocaleString()}`;

  return (
    <header className="w-full mb-6">
      {/* 上段：タイトルと設定ボタン */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Entry Risk Checker</h1>
          <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">資金管理 & エントリ判定ツール</p>
        </div>

        <Link 
          href="/settings" 
          className="p-2.5 rounded-full bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition border border-gray-200 shadow-sm active:scale-95" 
          aria-label="設定"
        >
          <Settings size={20} strokeWidth={2} />
        </Link>
      </div>

      {/* 下段：設定値サマリー（チップ表示） */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {settings ? (
          <>
            {/* 口座残高 */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-800 rounded-lg border border-blue-100 shadow-sm shrink-0">
              <Wallet size={14} className="text-blue-500" />
              <div className="text-xs font-medium">
                <span className="text-blue-400 text-[10px] mr-1">残高</span>
                <span className="font-mono font-bold text-sm">{formatYen(settings.accountBalance)}</span>
              </div>
            </div>

            {/* 許容リスク */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-800 rounded-lg border border-purple-100 shadow-sm shrink-0">
              <PieChart size={14} className="text-purple-500" />
              <div className="text-xs font-medium">
                <span className="text-purple-400 text-[10px] mr-1">許容</span>
                <span className="font-mono font-bold text-sm">{settings.riskPercentage}%</span>
              </div>
            </div>

            {/* 最低RR */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 text-orange-800 rounded-lg border border-orange-100 shadow-sm shrink-0">
              <TrendingUp size={14} className="text-orange-500" />
              <div className="text-xs font-medium">
                <span className="text-orange-400 text-[10px] mr-1">RR</span>
                <span className="font-mono font-bold text-sm">1:{settings.minRiskRewardRatio}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full px-3 py-2 bg-red-50 text-red-600 rounded-lg border border-red-100 text-xs font-bold flex items-center gap-2">
            <Settings size={14} />
            <span>初期設定が完了していません</span>
          </div>
        )}
      </div>
    </header>
  );
}