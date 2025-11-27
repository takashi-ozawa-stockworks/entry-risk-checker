"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Check } from "lucide-react";
import { TradeNote } from "@/lib/types";
import { getTradeNoteById, updateTradeNote } from "@/lib/storage";

export default function HistoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [note, setNote] = useState<TradeNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  // Form states
  const [scenario, setScenario] = useState("");
  const [entryBasis, setEntryBasis] = useState("");
  const [tradeResult, setTradeResult] = useState<"WIN" | "LOSS" | undefined>(
    undefined
  );
  const [reflection, setReflection] = useState("");

  useEffect(() => {
    if (params.id) {
      const foundNote = getTradeNoteById(params.id as string);
      if (foundNote) {
        setNote(foundNote);
        setScenario(foundNote.scenario || "");
        setEntryBasis(foundNote.entryBasis || "");
        setTradeResult(foundNote.tradeResult);
        setReflection(foundNote.note || "");
      } else {
        // Not found, redirect to history
        router.push("/history");
      }
      setLoading(false);
    }
  }, [params.id, router]);

  const handleSave = () => {
    if (!note) return;

    const updatedNote: TradeNote = {
      ...note,
      scenario,
      entryBasis,
      tradeResult,
      note: reflection,
    };

    updateTradeNote(updatedNote);
    setNote(updatedNote);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading...</div>;
  }

  if (!note) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-28">
      {/* Header */}
      <header className="w-full mb-6 flex items-center justify-between max-w-4xl mx-auto sticky top-0 z-50 bg-gray-50/80 backdrop-blur-md border-b border-gray-200/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href="/history"
            className="p-2 rounded-full bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition border border-gray-200 shadow-sm"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            Trade Details
          </h1>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition shadow-sm ${
            saved
              ? "bg-green-100 text-green-700"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
          }`}
        >
          {saved ? <Check size={18} /> : <Save size={18} />}
          {saved ? "Saved" : "Save"}
        </button>
      </header>

      <div className="max-w-xl mx-auto space-y-6 px-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          {/* Basic Info (Read Only) */}
          <section className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">日時</span>
              <span className="font-mono font-bold text-gray-700">
                {new Date(note.timestamp).toLocaleString("ja-JP", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  weekday: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">タイプ</span>
              <span
                className={`font-bold px-2 py-0.5 rounded text-xs ${
                  note.tradeType === "LONG"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-red-100 text-red-600"
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
                <div className="font-mono font-bold text-gray-900">
                  {note.stopPips} : {note.takePips}{" "}
                  <span className="text-xs font-normal text-gray-500">
                    (pips)
                  </span>
                </div>
              </div>
            )}
            {/* リスクリワード比 */}
            <div className="text-center pt-2 border-t border-gray-200">
              <div className="text-xs text-gray-500 mb-1">リスクリワード比</div>
              <div className="font-mono font-bold text-gray-900">
                1 : {note.riskRewardRatio.toFixed(2)}
              </div>
            </div>
          </section>

          {/* Editable Fields */}
          <div className="space-y-6">
            {/* Scenario */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">
                シナリオ
              </label>
              <textarea
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                placeholder="どのようなシナリオを描いていたか..."
                className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition min-h-[100px] text-sm text-gray-700"
              />
            </div>

            {/* Entry Basis */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">
                エントリー根拠
              </label>
              <textarea
                value={entryBasis}
                onChange={(e) => setEntryBasis(e.target.value)}
                placeholder="エントリーの決め手となった根拠..."
                className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition min-h-[100px] text-sm text-gray-700"
              />
            </div>

            {/* Result */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">
                結果
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setTradeResult("WIN")}
                  className={`py-3 rounded-lg font-bold border transition ${
                    tradeResult === "WIN"
                      ? "bg-green-100 border-green-500 text-green-700 ring-1 ring-green-500"
                      : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  WIN
                </button>
                <button
                  onClick={() => setTradeResult("LOSS")}
                  className={`py-3 rounded-lg font-bold border transition ${
                    tradeResult === "LOSS"
                      ? "bg-gray-100 border-gray-500 text-gray-700 ring-1 ring-gray-500"
                      : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  LOSS
                </button>
              </div>
            </div>

            {/* Reflection / Note */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">
                反省・気づき
              </label>
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="トレード後の振り返り..."
                className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition min-h-[100px] text-sm text-gray-700"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
