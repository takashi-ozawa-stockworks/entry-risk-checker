"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Check,
  Image as ImageIcon,
  X,
  ZoomIn,
  Trash2,
} from "lucide-react";
import { TradeNote } from "@/lib/types";
import { getTradeNoteById, updateTradeNote } from "@/lib/storage";
import { getRuleSettings, RuleSettings } from "@/lib/rule-settings-storage";
import { saveImage, getImage, deleteImage } from "@/lib/image-storage";

import Accordion from "@/components/ui/Accordion";

export default function HistoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [note, setNote] = useState<TradeNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [ruleSettings, setRuleSettings] = useState<RuleSettings>({
    scenarioPresets: [],

    entryBasisPresets: [],
    myRules: [],
  });

  // Form states
  const [scenario, setScenario] = useState("");
  const [selectedEntryBasis, setSelectedEntryBasis] = useState<string[]>([]); // Array for UI
  const [tradeResult, setTradeResult] = useState<"WIN" | "LOSS" | undefined>(
    undefined
  );
  const [reflection, setReflection] = useState("");
  const [imageIds, setImageIds] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<{ id: string; url: string }[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // New Fields State
  const [marketTrend, setMarketTrend] = useState<TradeNote["marketTrend"]>();
  const [volatility, setVolatility] = useState<TradeNote["volatility"]>();
  const [timeframe, setTimeframe] = useState<TradeNote["timeframe"]>();
  const [entryConfidence, setEntryConfidence] =
    useState<TradeNote["entryConfidence"]>();
  const [mentalState, setMentalState] = useState<TradeNote["mentalState"]>();

  const [ruleCompliance, setRuleCompliance] =
    useState<TradeNote["ruleCompliance"]>();
  const [violatedRules, setViolatedRules] = useState<string[]>([]);
  const [complianceNotes, setComplianceNotes] = useState("");
  const [whatWorked, setWhatWorked] = useState("");
  const [whatToImprove, setWhatToImprove] = useState("");
  const [emotionalReaction, setEmotionalReaction] = useState("");

  useEffect(() => {
    // Load settings
    setRuleSettings(getRuleSettings());

    if (params.id) {
      const foundNote = getTradeNoteById(params.id as string);
      if (foundNote) {
        setNote(foundNote);
        setScenario(foundNote.scenario || "");
        // Parse entry basis string to array for checkboxes
        if (foundNote.entryBasis) {
          setSelectedEntryBasis(
            foundNote.entryBasis.split(",").map((s) => s.trim())
          );
        }
        setTradeResult(foundNote.tradeResult);
        setReflection(foundNote.note || "");
        setImageIds(foundNote.imageIds || []);

        // Load new fields
        setMarketTrend(foundNote.marketTrend);
        setVolatility(foundNote.volatility);
        setTimeframe(foundNote.timeframe);
        setEntryConfidence(foundNote.entryConfidence);
        setMentalState(foundNote.mentalState);
        setRuleCompliance(foundNote.ruleCompliance);
        setViolatedRules(foundNote.violatedRules || []);
        setComplianceNotes(foundNote.complianceNotes || "");
        setWhatWorked(foundNote.whatWorked || "");
        setWhatToImprove(foundNote.whatToImprove || "");
        setEmotionalReaction(foundNote.emotionalReaction || "");
      } else {
        // Not found, redirect to history
        router.push("/history");
      }
      setLoading(false);
    }
  }, [params.id, router]);

  // Load images from IndexedDB
  useEffect(() => {
    let active = true;
    const loadImages = async () => {
      const urls: { id: string; url: string }[] = [];
      for (const id of imageIds) {
        const blob = await getImage(id);
        if (blob) {
          urls.push({ id, url: URL.createObjectURL(blob) });
        }
      }
      if (active) {
        setImageUrls(urls);
      } else {
        // If component unmounted or imageIds changed during load, revoke the newly created URLs
        urls.forEach((item) => URL.revokeObjectURL(item.url));
      }
    };
    loadImages();

    return () => {
      active = false;
    };
  }, [imageIds]);

  // Cleanup URLs when they change or component unmounts
  useEffect(() => {
    return () => {
      imageUrls.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [imageUrls]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const id = await saveImage(file);
      setImageIds((prev) => [...prev, id]);
    }
  };

  const handleDeleteImage = async (id: string) => {
    if (confirm("画像を削除しますか？")) {
      await deleteImage(id);
      setImageIds((prev) => prev.filter((imgId) => imgId !== id));
    }
  };

  const handleSave = () => {
    if (!note) return;

    // Join selected basis with commas
    const entryBasisString = selectedEntryBasis.join(",");

    const updatedNote: TradeNote = {
      ...note,
      scenario,
      entryBasis: entryBasisString,
      tradeResult,
      note: reflection,
      imageIds,
      marketTrend,
      volatility,
      timeframe,
      entryConfidence,
      mentalState,
      ruleCompliance,
      violatedRules,
      complianceNotes,
      whatWorked,
      whatToImprove,
      emotionalReaction,
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
            {/* Section 2: 市場環境・シナリオ */}
            <Accordion title="市場環境・シナリオ" defaultOpen={true}>
              <div className="space-y-4">
                {/* Market Trend */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    トレンド
                  </label>
                  <div className="flex gap-2">
                    {[
                      { value: "UPTREND", label: "上昇" },
                      { value: "DOWNTREND", label: "下降" },
                      { value: "RANGE", label: "レンジ" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() =>
                          setMarketTrend(opt.value as TradeNote["marketTrend"])
                        }
                        className={`flex-1 py-2 rounded-lg text-sm font-bold border transition ${
                          marketTrend === opt.value
                            ? "bg-indigo-100 border-indigo-500 text-indigo-700"
                            : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Volatility */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    ボラティリティ
                  </label>
                  <div className="flex gap-2">
                    {[
                      { value: "HIGH", label: "高" },
                      { value: "MEDIUM", label: "中" },
                      { value: "LOW", label: "低" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() =>
                          setVolatility(opt.value as TradeNote["volatility"])
                        }
                        className={`flex-1 py-2 rounded-lg text-sm font-bold border transition ${
                          volatility === opt.value
                            ? "bg-indigo-100 border-indigo-500 text-indigo-700"
                            : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Timeframe */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    分析時間軸
                  </label>
                  <select
                    value={timeframe || ""}
                    onChange={(e) =>
                      setTimeframe(e.target.value as TradeNote["timeframe"])
                    }
                    className="w-full p-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700"
                  >
                    <option value="">選択してください</option>
                    <option value="M15">15分足 (M15)</option>
                    <option value="M30">30分足 (M30)</option>
                    <option value="H1">1時間足 (H1)</option>
                    <option value="H4">4時間足 (H4)</option>
                    <option value="D1">日足 (D1)</option>
                  </select>
                </div>

                {/* Scenario Selection */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-bold text-gray-700">
                      シナリオ (選択)
                    </label>
                    <Link
                      href="/settings/rules"
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      編集
                    </Link>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
                    {(ruleSettings.scenarioPresets || []).map((preset) => (
                      <label
                        key={preset.id}
                        className="flex items-center gap-3 p-2 hover:bg-white rounded cursor-pointer transition border border-transparent hover:border-gray-200"
                      >
                        <div className="relative flex items-center">
                          <input
                            type="radio"
                            name="scenario"
                            className="peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-gray-300 shadow-sm transition-all checked:border-indigo-500 checked:bg-indigo-500 hover:shadow-md"
                            checked={scenario === preset.title}
                            onChange={() => setScenario(preset.title)}
                          />
                          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none">
                            <div className="w-2 h-2 bg-white rounded-full" />
                          </span>
                        </div>
                        <span className="text-sm text-gray-800">
                          {preset.title}
                        </span>
                      </label>
                    ))}
                    {(!ruleSettings.scenarioPresets ||
                      ruleSettings.scenarioPresets.length === 0) && (
                      <div className="text-center text-gray-400 text-sm py-2">
                        シナリオプリセットがありません。
                        <br />
                        <Link
                          href="/settings/rules"
                          className="text-indigo-600 underline"
                        >
                          設定画面
                        </Link>
                        から追加してください。
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Accordion>

            {/* Section 3: エントリー根拠 */}
            <Accordion title="エントリー根拠">
              <div className="space-y-4">
                {/* Entry Basis (Existing) */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-bold text-gray-700">
                      根拠一覧
                    </label>
                    <Link
                      href="/settings/rules"
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      編集
                    </Link>
                  </div>
                  <div className="bg-white border border-gray-300 rounded-lg p-3 space-y-2">
                    {ruleSettings.entryBasisPresets.map((preset) => (
                      <label
                        key={preset}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer transition"
                      >
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-gray-300 shadow-sm transition-all checked:border-indigo-500 checked:bg-indigo-500 hover:shadow-md"
                            checked={selectedEntryBasis.includes(preset)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedEntryBasis([
                                  ...selectedEntryBasis,
                                  preset,
                                ]);
                              } else {
                                setSelectedEntryBasis(
                                  selectedEntryBasis.filter(
                                    (item) => item !== preset
                                  )
                                );
                              }
                            }}
                          />
                          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none">
                            <Check size={14} strokeWidth={3} />
                          </span>
                        </div>
                        <span className="text-sm text-gray-700">{preset}</span>
                      </label>
                    ))}
                    {ruleSettings.entryBasisPresets.length === 0 && (
                      <div className="text-center text-gray-400 text-sm py-4">
                        プリセットがありません。設定から追加してください。
                      </div>
                    )}
                  </div>
                </div>

                {/* Entry Confidence */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    エントリー確信度
                  </label>
                  <div className="flex gap-2">
                    {[
                      { value: "HIGH", label: "高" },
                      { value: "MEDIUM", label: "中" },
                      { value: "LOW", label: "低" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() =>
                          setEntryConfidence(
                            opt.value as TradeNote["entryConfidence"]
                          )
                        }
                        className={`flex-1 py-2 rounded-lg text-sm font-bold border transition ${
                          entryConfidence === opt.value
                            ? "bg-indigo-100 border-indigo-500 text-indigo-700"
                            : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Entry Timing Note - REMOVED as per request */}
                {/* <div>...</div> */}
              </div>
            </Accordion>

            {/* Section 4: トレード実行 */}
            <Accordion title="トレード実行">
              <div className="space-y-4">
                {/* Mental State */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    メンタル状態
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: "CALM", label: "冷静" },
                      { value: "NEUTRAL", label: "普通" },
                      { value: "ANXIOUS", label: "焦り/不安" },
                      { value: "FOMO", label: "飛び乗り(FOMO)" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() =>
                          setMentalState(opt.value as TradeNote["mentalState"])
                        }
                        className={`py-2 rounded-lg text-sm font-bold border transition ${
                          mentalState === opt.value
                            ? "bg-indigo-100 border-indigo-500 text-indigo-700"
                            : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rule Compliance */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-bold text-gray-700">
                      ルール遵守
                    </label>
                    <Link
                      href="/settings/rules"
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      編集
                    </Link>
                  </div>
                  <div className="flex gap-2">
                    {[
                      { value: "FULL", label: "完全遵守" },
                      { value: "PARTIAL", label: "一部違反" },
                      { value: "VIOLATED", label: "違反" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() =>
                          setRuleCompliance(
                            opt.value as TradeNote["ruleCompliance"]
                          )
                        }
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
                </div>

                {/* Violated Rules Selection */}
                {(ruleCompliance === "PARTIAL" ||
                  ruleCompliance === "VIOLATED") && (
                  <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                    <label className="block text-sm font-bold text-red-600">
                      違反したルール (選択)
                    </label>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
                      {(ruleSettings.myRules || []).map((rule) => (
                        <label
                          key={rule}
                          className="flex items-center gap-3 p-2 hover:bg-red-100/50 rounded cursor-pointer transition"
                        >
                          <div className="relative flex items-center">
                            <input
                              type="checkbox"
                              className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-red-300 shadow-sm transition-all checked:border-red-500 checked:bg-red-500 hover:shadow-md"
                              checked={violatedRules.includes(rule)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setViolatedRules([...violatedRules, rule]);
                                } else {
                                  setViolatedRules(
                                    violatedRules.filter((r) => r !== rule)
                                  );
                                }
                              }}
                            />
                            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none">
                              <Check size={14} strokeWidth={3} />
                            </span>
                          </div>
                          <span className="text-sm text-gray-800">{rule}</span>
                        </label>
                      ))}
                      {(!ruleSettings.myRules ||
                        ruleSettings.myRules.length === 0) && (
                        <div className="text-center text-gray-400 text-sm py-2">
                          マイルールが設定されていません。
                          <br />
                          <Link
                            href="/settings/rules"
                            className="text-indigo-600 underline"
                          >
                            設定画面
                          </Link>
                          から追加してください。
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Compliance Notes */}
                {(ruleCompliance === "PARTIAL" ||
                  ruleCompliance === "VIOLATED") && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      違反内容・メモ
                    </label>
                    <textarea
                      value={complianceNotes}
                      onChange={(e) => setComplianceNotes(e.target.value)}
                      placeholder="具体的な違反内容や状況..."
                      className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition min-h-[80px] text-sm text-gray-700"
                    />
                  </div>
                )}
              </div>
            </Accordion>

            {/* Section 5: 結果・振り返り */}
            <Accordion title="結果・振り返り">
              <div className="space-y-4">
                {/* Result (Existing) */}
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

                {/* What Worked */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    良かった点
                  </label>
                  <textarea
                    value={whatWorked}
                    onChange={(e) => setWhatWorked(e.target.value)}
                    placeholder="トレードで上手くいったこと..."
                    className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition min-h-[80px] text-sm text-gray-700"
                  />
                </div>

                {/* What To Improve */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    改善点・反省
                  </label>
                  <textarea
                    value={whatToImprove}
                    onChange={(e) => setWhatToImprove(e.target.value)}
                    placeholder="次回改善すべきこと..."
                    className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition min-h-[80px] text-sm text-gray-700"
                  />
                </div>

                {/* Emotional Reaction */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    感情的な反応
                  </label>
                  <textarea
                    value={emotionalReaction}
                    onChange={(e) => setEmotionalReaction(e.target.value)}
                    placeholder="トレード中の感情の動き..."
                    className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition min-h-[80px] text-sm text-gray-700"
                  />
                </div>

                {/* Chart Images (Existing) */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    チャート画像
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {imageUrls.map((item) => (
                      <div
                        key={item.id}
                        className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200 group"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.url}
                          alt="Chart"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedImage(item.url)}
                            className="p-2 bg-white/20 text-white rounded-full hover:bg-white/40 transition"
                          >
                            <ZoomIn size={20} />
                          </button>
                          <button
                            onClick={() => handleDeleteImage(item.id)}
                            className="p-2 bg-red-500/80 text-white rounded-full hover:bg-red-600 transition"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    ))}
                    <label className="aspect-video bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 text-gray-400 hover:bg-gray-100 hover:border-gray-400 hover:text-gray-600 transition cursor-pointer">
                      <ImageIcon size={24} />
                      <span className="text-xs font-bold">画像を追加</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                </div>

                {/* Legacy Note (Hidden if empty, or shown as fallback) */}
                {reflection && !whatWorked && !whatToImprove && (
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">
                      旧メモ
                    </label>
                    <textarea
                      value={reflection}
                      onChange={(e) => setReflection(e.target.value)}
                      className="w-full p-3 bg-white border border-gray-300 rounded-lg outline-none min-h-[100px] text-sm text-gray-700"
                    />
                  </div>
                )}
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

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-100 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition"
          >
            <X size={32} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={selectedImage}
            alt="Full size"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </main>
  );
}
