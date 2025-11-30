"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, History, Edit2, Trash2 } from "lucide-react";
import { getTradeHistory, deleteTradeNote } from "@/lib/storage";
import { TradeNote } from "@/lib/types";

export default function HistoryPage() {
  const [history, setHistory] = useState<TradeNote[]>([]);
  const [mounted, setMounted] = useState(false);
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filterCurrencyPair, setFilterCurrencyPair] = useState("");
  const [filterTradeType, setFilterTradeType] = useState("");
  const [filterResult, setFilterResult] = useState("");

  useEffect(() => {
    setMounted(true);
    setHistory(getTradeHistory());
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("この履歴を削除してもよろしいですか？")) {
      // Find the note to get image IDs
      // Find the note to get image IDs
      deleteTradeNote(id);
      setHistory(getTradeHistory());
    }
  };

  // Unique currency pairs for filter dropdown
  const currencyPairs = Array.from(
    new Set(history.map((h) => h.currencyPair || "USD/JPY"))
  ).sort();

  // Filter logic
  const filteredHistory = history.filter((note) => {
    const noteDate = new Date(note.entryTimestamp);
    const startDate = filterStartDate ? new Date(filterStartDate) : null;
    const endDate = filterEndDate ? new Date(filterEndDate) : null;

    // Date Range
    if (startDate) {
      startDate.setHours(0, 0, 0, 0);
      if (noteDate < startDate) return false;
    }
    if (endDate) {
      endDate.setHours(23, 59, 59, 999);
      if (noteDate > endDate) return false;
    }

    // Currency Pair
    if (filterCurrencyPair) {
      const notePair = note.currencyPair || "USD/JPY";
      if (notePair !== filterCurrencyPair) return false;
    }

    // Trade Type
    if (filterTradeType && note.tradeType !== filterTradeType) return false;

    // Result
    if (filterResult && note.tradeResult !== filterResult) return false;

    return true;
  });

  const resetFilters = () => {
    setFilterStartDate("");
    setFilterEndDate("");
    setFilterCurrencyPair("");
    setFilterTradeType("");
    setFilterResult("");
  };

  if (!mounted) {
    return <div className="min-h-screen bg-gray-50" />;
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-28">
      {/* Header */}
      <header className="w-full mb-6 flex items-center justify-between max-w-4xl mx-auto sticky top-0 z-50 bg-gray-50/80 backdrop-blur-md border-b border-gray-200/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-full bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition border border-gray-200 shadow-sm"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            Trade History
          </h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500">開始日</label>
              <input
                type="date"
                className="w-full text-sm text-gray-900 border border-gray-200 rounded-lg px-2 py-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500">終了日</label>
              <input
                type="date"
                className="w-full text-sm text-gray-900 border border-gray-200 rounded-lg px-2 py-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500">
                通貨ペア
              </label>
              <select
                className="w-full text-sm text-gray-900 border border-gray-200 rounded-lg px-2 py-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                value={filterCurrencyPair}
                onChange={(e) => setFilterCurrencyPair(e.target.value)}
              >
                <option value="">全て</option>
                {currencyPairs.map((pair) => (
                  <option key={pair} value={pair}>
                    {pair}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500">タイプ</label>
              <select
                className="w-full text-sm text-gray-900 border border-gray-200 rounded-lg px-2 py-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                value={filterTradeType}
                onChange={(e) => setFilterTradeType(e.target.value)}
              >
                <option value="">全て</option>
                <option value="LONG">LONG</option>
                <option value="SHORT">SHORT</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500">結果</label>
              <select
                className="w-full text-sm text-gray-900 border border-gray-200 rounded-lg px-2 py-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                value={filterResult}
                onChange={(e) => setFilterResult(e.target.value)}
              >
                <option value="">全て</option>
                <option value="WIN">WIN</option>
                <option value="LOSS">LOSS</option>
              </select>
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <button
              onClick={resetFilters}
              className="text-xs text-gray-500 hover:text-gray-800 font-medium flex items-center gap-1"
            >
              <Trash2 size={14} />
              条件をリセット
            </button>
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <History size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-sm">
              {history.length === 0
                ? "保存された履歴はありません"
                : "条件に一致する履歴はありません"}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left min-w-[600px]">
                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 whitespace-nowrap">エントリー日時</th>
                    <th className="px-4 py-3 text-center whitespace-nowrap">
                      結果
                    </th>
                    <th className="px-4 py-3 text-center whitespace-nowrap">
                      通貨ペア
                    </th>
                    <th className="px-4 py-3 text-center whitespace-nowrap">
                      タイプ
                    </th>
                    <th className="px-4 py-3 text-right whitespace-nowrap">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredHistory.map((note) => (
                    <tr key={note.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-gray-700 font-mono whitespace-nowrap">
                        {new Date(note.entryTimestamp).toLocaleString("ja-JP", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        {note.tradeResult ? (
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                              note.tradeResult === "WIN"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {note.tradeResult}
                          </span>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <span className="inline-block px-2 py-1 rounded text-xs font-bold bg-gray-100 text-gray-600 font-mono border border-gray-200">
                          {note.currencyPair || "USD/JPY"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                            note.tradeType === "LONG"
                              ? "bg-blue-100 text-blue-600"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {note.tradeType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/history/${note.id}`}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition"
                          >
                            <Edit2 size={16} />
                          </Link>
                          <button
                            onClick={() => handleDelete(note.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
