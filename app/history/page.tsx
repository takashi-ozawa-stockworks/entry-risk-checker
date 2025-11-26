"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, History } from "lucide-react";
import { getTradeHistory, deleteTradeNote } from "@/lib/storage";
import { TradeNote } from "@/lib/types";
import HistoryCard from "@/components/features/HistoryCard";

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
    <main className="min-h-screen bg-gray-50 p-4 pb-28">
      {/* Header */}
      <header className="w-full mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-full bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition border border-gray-200 shadow-sm"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <History size={24} className="text-gray-700" />
            Trade History
          </h1>
        </div>
      </header>

      <div className="max-w-xl mx-auto space-y-4">
        {history.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <History size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-sm">保存された履歴はありません</p>
          </div>
        ) : (
          history.map((note) => (
            <HistoryCard key={note.id} note={note} onDelete={handleDelete} />
          ))
        )}
      </div>
    </main>
  );
}
