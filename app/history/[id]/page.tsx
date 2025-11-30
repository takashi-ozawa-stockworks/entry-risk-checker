"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Check } from "lucide-react";
import { TradeNote } from "@/lib/types";
import { getTradeNoteById, updateTradeNote } from "@/lib/storage";

import Accordion from "@/components/ui/Accordion";

export default function HistoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [note, setNote] = useState<TradeNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  // Form states

  const [tradeResult, setTradeResult] = useState<"WIN" | "LOSS" | undefined>(
    undefined
  );
  const [reflection, setReflection] = useState("");
  const [exitTimestamp, setExitTimestamp] = useState<number | undefined>();
  const [exitType, setExitType] = useState<TradeNote["exitType"]>();
  const [actualLot, setActualLot] = useState<number | undefined>();
  const [actualProfit, setActualProfit] = useState<number | undefined>();
  const [actualLoss, setActualLoss] = useState<number | undefined>();

  // New Fields State

  const [ruleCompliance, setRuleCompliance] =
    useState<TradeNote["ruleCompliance"]>();
  const [violatedRules, setViolatedRules] = useState<string[]>([]);
  const [allRules, setAllRules] = useState<string[]>([]);

  useEffect(() => {
    if (params.id) {
      const foundNote = getTradeNoteById(params.id as string);
      if (foundNote) {
        setNote(foundNote);

        setTradeResult(foundNote.tradeResult);
        setReflection(foundNote.note || "");
        setExitTimestamp(foundNote.exitTimestamp);
        setExitType(foundNote.exitType);
        setActualLot(foundNote.actualLot);
        setActualProfit(foundNote.actualProfit);
        setActualLoss(foundNote.actualLoss);

        // Load new fields

        setRuleCompliance(foundNote.ruleCompliance);
        setViolatedRules(foundNote.violatedRules || []);

        // Load all rules from settings
        import("@/lib/rule-settings-storage").then(({ getRuleSettings }) => {
          const ruleSettings = getRuleSettings();
          setAllRules(ruleSettings.myRules || []);
        });
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
      tradeResult,
      note: reflection,

      exitTimestamp,
      exitType,
      actualLot,
      // WIN時はactualProfitのみ、LOSS時はactualLossのみ保存
      actualProfit: tradeResult === "WIN" ? actualProfit : undefined,
      actualLoss: tradeResult === "LOSS" ? actualLoss : undefined,

      ruleCompliance,
      violatedRules,
    };

    // Debug log
    console.log("=== History Detail Save Debug ===");
    console.log("Updated Note:", updatedNote);
    console.log("===============================");

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
    <main className="min-h-screen bg-gray-50 pb-32">
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
        <div className="w-10" />
      </header>

      <div className="max-w-xl mx-auto space-y-6 px-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          {/* Basic Info (Read Only) */}
          <section className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
            <div className="flex justify-between items-center text-sm border-b border-gray-200 pb-2">
              <span className="text-gray-500">エントリー日時</span>
              <span className="font-mono font-bold text-gray-700">
                {new Date(note.entryTimestamp).toLocaleString("ja-JP", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  weekday: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm border-b border-gray-200 pb-2">
              <span className="text-gray-500">通貨ペア</span>
              <span className="font-bold px-2 py-0.5 rounded text-sm text-gray-900 bg-white border border-gray-200">
                {note.currencyPair || "USD/JPY"}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">タイプ</span>
              <span
                className={`px-3 py-1 rounded-lg font-bold text-sm ${
                  note.tradeType === "LONG"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {note.tradeType}
              </span>
            </div>

            <div className="pt-2 border-t border-gray-200 space-y-3">
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">Entry</div>
                <div className="font-mono text-2xl font-bold text-gray-900">
                  {note.entryPrice.toFixed(
                    !note.currencyPair || note.currencyPair.endsWith("JPY")
                      ? 3
                      : 5
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center border-r border-gray-200">
                  <div className="text-xs text-gray-500 mb-1">SL</div>
                  <div className="font-mono font-bold text-gray-900">
                    {note.stopLossPrice.toFixed(
                      !note.currencyPair || note.currencyPair.endsWith("JPY")
                        ? 3
                        : 5
                    )}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-1">TP</div>
                  <div className="font-mono font-bold text-gray-900">
                    {note.takeProfitPrice.toFixed(
                      !note.currencyPair || note.currencyPair.endsWith("JPY")
                        ? 3
                        : 5
                    )}
                  </div>
                </div>
              </div>
            </div>
            {note.stopPips !== undefined && note.takePips !== undefined && (
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200">
                <div className="text-center border-r border-gray-200">
                  <div className="text-xs text-gray-500 mb-1">SL幅</div>
                  <div className="font-mono font-bold text-gray-900">
                    {note.stopPips}
                    <span className="text-xs font-normal text-gray-500 ml-1">
                      pips
                    </span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-1">TP幅</div>
                  <div className="font-mono font-bold text-gray-900">
                    {note.takePips}
                    <span className="text-xs font-normal text-gray-500 ml-1">
                      pips
                    </span>
                  </div>
                </div>
              </div>
            )}
            {/* ロット数 */}
            {note.recommendedLot !== undefined && (
              <div className="text-center pt-2 border-t border-gray-200">
                <div className="text-xs text-gray-500 mb-1">ロット数</div>
                <div className="font-mono font-bold text-gray-900">
                  {note.recommendedLot.toFixed(2)}
                  <span className="text-xs font-normal text-gray-500 ml-1">
                    Lot
                  </span>
                </div>
              </div>
            )}
            {/* リスクリワード比 */}
            <div className="text-center pt-2 border-t border-gray-200">
              <div className="text-xs text-gray-500 mb-1">リスクリワード比</div>
              <div className="font-mono font-bold text-gray-900">
                1：{note.riskRewardRatio.toFixed(2)}
              </div>
            </div>
          </section>

          {/* Accordion Sections */}
          <div className="space-y-4">
            {/* Section 4: トレード実行・結果 */}
            <Accordion title="トレード実行・結果" defaultOpen={true}>
              <div className="space-y-4">
                {/* Rule Compliance */}
                {/* Rule Compliance */}
                {!loading &&
                  (ruleCompliance === "FULL" ||
                    ruleCompliance === "VIOLATED") && (
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700">
                        ルール遵守
                      </label>
                      <div className="flex gap-2">
                        {[
                          { value: "FULL", label: "完全遵守" },
                          { value: "VIOLATED", label: "違反" },
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => {
                              setRuleCompliance(
                                opt.value as TradeNote["ruleCompliance"]
                              );
                              // Reset violated rules when switching to FULL
                              if (opt.value === "FULL") {
                                setViolatedRules([]);
                              }
                            }}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold border transition ${
                              ruleCompliance === opt.value
                                ? "bg-indigo-100 border-indigo-500 text-indigo-700"
                                : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>

                      {/* Violated Rules Checklist */}
                      {ruleCompliance === "VIOLATED" && allRules.length > 0 && (
                        <div className="mt-3 text-left bg-red-50 p-3 rounded-lg border border-red-200">
                          <p className="text-xs font-bold text-red-700 mb-2">
                            違反ルールを選択:
                          </p>
                          <div className="space-y-2">
                            {allRules.map((rule) => {
                              const isViolated = violatedRules.includes(rule);
                              return (
                                <label
                                  key={rule}
                                  className="flex items-start gap-2 cursor-pointer group hover:bg-red-100 p-2 rounded transition"
                                >
                                  <input
                                    type="checkbox"
                                    className="mt-0.5 h-4 w-4 rounded border-red-300 text-red-600 focus:ring-red-500 cursor-pointer"
                                    checked={isViolated}
                                    onChange={(e) => {
                                      const isChecked = e.target.checked;
                                      let newViolatedRules: string[];

                                      if (isChecked) {
                                        // Add to violated rules
                                        newViolatedRules = [
                                          ...violatedRules,
                                          rule,
                                        ];
                                      } else {
                                        // Remove from violated rules
                                        newViolatedRules = violatedRules.filter(
                                          (r) => r !== rule
                                        );
                                      }

                                      setViolatedRules(newViolatedRules);
                                    }}
                                  />
                                  <span
                                    className={`text-sm transition ${
                                      isViolated
                                        ? "text-red-700 font-medium"
                                        : "text-gray-600"
                                    }`}
                                  >
                                    {rule}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                {/* Exit Type */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    決済種別
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "TP_HIT", label: "TPヒット" },
                      { value: "SL_HIT", label: "SLヒット" },
                      { value: "MANUAL", label: "手動決済" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() =>
                          setExitType(opt.value as TradeNote["exitType"])
                        }
                        className={`py-2 rounded-lg text-sm font-bold border transition ${
                          exitType === opt.value
                            ? "bg-indigo-100 border-indigo-500 text-indigo-700"
                            : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Result (Existing) */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    結果
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        setTradeResult("WIN");
                        // Set initial values if not already set
                        if (actualLot === undefined && note)
                          setActualLot(note.recommendedLot);
                        if (actualProfit === undefined && note)
                          setActualProfit(note.expectedProfit);
                      }}
                      className={`py-3 rounded-lg font-bold border transition ${
                        tradeResult === "WIN"
                          ? "bg-green-100 border-green-500 text-green-700 ring-1 ring-green-500"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      WIN
                    </button>
                    <button
                      onClick={() => {
                        setTradeResult("LOSS");
                        // Set initial values if not already set
                        if (actualLot === undefined && note)
                          setActualLot(note.recommendedLot);
                        if (actualLoss === undefined && note)
                          setActualLoss(note.expectedLoss);
                      }}
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

                {/* Actual Lot */}
                {tradeResult && (
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">
                      実ロット数
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={actualLot ?? ""}
                        onChange={(e) =>
                          setActualLot(
                            e.target.value
                              ? parseFloat(e.target.value)
                              : undefined
                          )
                        }
                        placeholder={note?.recommendedLot.toFixed(2)}
                        className="w-full p-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                        Lot
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      推奨: {note?.recommendedLot.toFixed(2)} Lot
                    </p>
                  </div>
                )}

                {/* Actual Profit (WIN) */}
                {tradeResult === "WIN" && (
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">
                      実利益
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="100"
                        value={actualProfit ?? ""}
                        onChange={(e) =>
                          setActualProfit(
                            e.target.value
                              ? parseFloat(e.target.value)
                              : undefined
                          )
                        }
                        placeholder={note?.expectedProfit.toLocaleString()}
                        className="w-full p-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                        円
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      想定: +{note?.expectedProfit.toLocaleString()} 円
                    </p>
                  </div>
                )}

                {/* Actual Loss (LOSS) */}
                {tradeResult === "LOSS" && (
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">
                      実損失
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="100"
                        value={actualLoss ?? ""}
                        onChange={(e) =>
                          setActualLoss(
                            e.target.value
                              ? parseFloat(e.target.value)
                              : undefined
                          )
                        }
                        placeholder={note?.expectedLoss.toLocaleString()}
                        className="w-full p-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                        円
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      想定: -{note?.expectedLoss.toLocaleString()} 円
                    </p>
                  </div>
                )}

                {/* Exit Timestamp */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    決済日時
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="datetime-local"
                      value={
                        exitTimestamp
                          ? new Date(
                              exitTimestamp -
                                new Date().getTimezoneOffset() * 60000
                            )
                              .toISOString()
                              .slice(0, 16)
                          : ""
                      }
                      onChange={(e) => {
                        if (e.target.value) {
                          setExitTimestamp(new Date(e.target.value).getTime());
                        } else {
                          setExitTimestamp(undefined);
                        }
                      }}
                      max={new Date().toISOString().slice(0, 16)}
                      className="flex-1 p-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    />
                    <button
                      onClick={() => setExitTimestamp(Date.now())}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition"
                    >
                      NOW
                    </button>
                  </div>
                  {exitTimestamp &&
                    note &&
                    exitTimestamp >= note.entryTimestamp && (
                      <div className="text-xs text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-2 flex items-center gap-2">
                        <span className="font-bold">💡 保有時間:</span>
                        <span>
                          {(() => {
                            const diffMs = exitTimestamp - note.entryTimestamp;
                            const diffMinutes = Math.floor(diffMs / 60000);
                            const diffHours = Math.floor(diffMinutes / 60);
                            const diffDays = Math.floor(diffHours / 24);

                            if (diffDays > 0) {
                              const remainingHours = diffHours % 24;
                              return `${diffDays}日${
                                remainingHours > 0
                                  ? `と${remainingHours}時間`
                                  : ""
                              }`;
                            } else if (diffHours > 0) {
                              const remainingMinutes = diffMinutes % 60;
                              return `${diffHours}時間${
                                remainingMinutes > 0
                                  ? `${remainingMinutes}分`
                                  : ""
                              }`;
                            } else {
                              return `${diffMinutes}分`;
                            }
                          })()}
                        </span>
                      </div>
                    )}
                  {exitTimestamp &&
                    note &&
                    exitTimestamp < note.entryTimestamp && (
                      <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
                        ⚠️ 決済日時がエントリー日時より前になっています
                      </div>
                    )}
                </div>

                {/* Memo */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    メモ
                  </label>
                  <textarea
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    placeholder="トレードの振り返り、気づき、メモなど..."
                    className="w-full p-3 bg-white border border-gray-300 rounded-lg outline-none min-h-[300px] text-sm text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  />
                </div>
              </div>
            </Accordion>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur border-t border-gray-200 safe-area-bottom z-50">
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleSave}
            className={`w-full py-4 rounded-xl text-white shadow-lg font-bold text-lg flex items-center justify-center gap-2 active:scale-[0.98] transition ${
              saved
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-900 hover:bg-gray-800"
            }`}
          >
            {saved ? <Check size={20} /> : <Save size={20} />}
            {saved ? "Saved" : "Save"}
          </button>
        </div>
      </div>
    </main>
  );
}
