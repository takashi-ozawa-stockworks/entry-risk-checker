"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, History, Edit2, Trash2 } from "lucide-react";
import { getTradeHistory, deleteTradeNote } from "@/lib/storage";
import { TradeNote } from "@/lib/types";

export default function HistoryPage() {
  const [history, setHistory] = useState<TradeNote[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setHistory(getTradeHistory());
  }, []);

  const handleDelete = (id: string) => {
    if (confirm("この履歴を削除してもよろしいですか？")) {
      deleteTradeNote(id);
      setHistory(getTradeHistory());
    }
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

      <div className="max-w-4xl mx-auto px-4">
        {history.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <History size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-sm">保存された履歴はありません</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">日時</th>
                  <th className="px-4 py-3 text-center">タイプ</th>
                  <th className="px-4 py-3 text-center">結果</th>
                  <th className="px-4 py-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.map((note) => (
                  <tr key={note.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-gray-700 font-mono">
                      {new Date(note.timestamp).toLocaleString("ja-JP", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                          note.tradeType === "LONG"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {note.tradeType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {note.tradeResult ? (
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
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
                    <td className="px-4 py-3 text-right">
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
        )}
      </div>
    </main>
  );
}
