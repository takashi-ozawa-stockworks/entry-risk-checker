import { useState, useEffect } from "react";
import { TradeInput, TradeType } from "@/lib/types";
import { AlertCircle, RefreshCw } from "lucide-react";
import { CURRENCY_PAIRS, CurrencyPair } from "@/lib/constants";
import { fetchExchangeRate } from "@/lib/currency-api";

type Props = {
  defaultTradeType?: TradeType;
  onCalculate: (input: TradeInput) => void;
  onReset?: () => void;
  disabled?: boolean;
};

export default function TradeForm({
  defaultTradeType = "LONG",
  onCalculate,
  onReset,
  disabled,
}: Props) {
  const [tradeType, setTradeType] = useState<TradeType>(defaultTradeType);
  const [selectedPairCode, setSelectedPairCode] = useState<string>("USD/JPY");
  const [currentJpyRate, setCurrentJpyRate] = useState<number | undefined>(
    undefined
  );
  const [isLoadingRate, setIsLoadingRate] = useState(false);

  const [entryPrice, setEntryPrice] = useState<number | "">("");
  const [stopPrice, setStopPrice] = useState<number | "">("");
  const [takePrice, setTakePrice] = useState<number | "">("");

  const [error, setError] = useState<string | null>(null);

  const selectedPair =
    CURRENCY_PAIRS.find((p) => p.code === selectedPairCode) ||
    CURRENCY_PAIRS[0];

  // Fetch rate when pair changes
  useEffect(() => {
    const fetchRate = async () => {
      if (selectedPair.isJpyQuote) {
        setCurrentJpyRate(undefined);
        return;
      }

      setIsLoadingRate(true);
      // Fetch Quote/JPY rate (e.g. for EUR/USD, we need USD/JPY)
      const rate = await fetchExchangeRate(selectedPair.quote, "JPY");
      if (rate) {
        setCurrentJpyRate(rate);
      }
      setIsLoadingRate(false);
    };

    fetchRate();
  }, [selectedPair]);

  const handleTypeChange = (type: TradeType) => {
    if (tradeType === type) return;

    setTradeType(type);
    setEntryPrice("");
    setStopPrice("");
    setTakePrice("");
    setError(null);
    onReset?.();
  };

  const handlePriceChange = (
    value: string,
    setter: (val: number | "") => void
  ) => {
    if (value === "") {
      setter("");
      setError(null);
      return;
    }
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0) {
      setter(num);
      setError(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "-" || e.key === "e" || e.key === "E") {
      e.preventDefault();
    }
  };

  const validate = (): boolean => {
    if (entryPrice === "" || entryPrice <= 0) {
      setError("エントリー価格には正の値を入力してください");
      return false;
    }
    if (stopPrice === "" || stopPrice <= 0) {
      setError("損切り価格(Stop Loss)には正の値を入力してください");
      return false;
    }
    if (takePrice === "" || takePrice <= 0) {
      setError("利確価格(Take Profit)には正の値を入力してください");
      return false;
    }

    if (tradeType === "LONG") {
      if (stopPrice >= entryPrice) {
        setError(
          "買い(BUY)の場合、損切りはエントリー価格より「安く」設定してください"
        );
        return false;
      }
      if (takePrice <= entryPrice) {
        setError(
          "買い(BUY)の場合、利確はエントリー価格より「高く」設定してください"
        );
        return false;
      }
    } else {
      if (stopPrice <= entryPrice) {
        setError(
          "売り(SELL)の場合、損切りはエントリー価格より「高く」設定してください"
        );
        return false;
      }
      if (takePrice >= entryPrice) {
        setError(
          "売り(SELL)の場合、利確はエントリー価格より「安く」設定してください"
        );
        return false;
      }
    }

    setError(null);
    return true;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const input: TradeInput = {
      currencyPair: selectedPairCode,
      currentJpyRate,
      tradeType,
      entryPrice: Number(entryPrice),
      stopLossMode: "PRICE",
      stopLossPrice: Number(stopPrice),
      takeProfitMode: "PRICE",
      takeProfitPrice: Number(takePrice),
      stopLossPips: undefined,
      takeProfitPips: undefined,
    };

    onCalculate(input);
  };

  // スマホ対策用の共通クラス: text-gray-900とopacity-100を追加
  const inputBaseClass =
    "w-full border border-gray-300 rounded-lg px-4 py-3 text-lg font-mono shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-gray-900 opacity-100 placeholder:text-gray-300";

  return (
    <section className="w-full space-y-6">
      {/* 0. Currency Pair Select */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
          Currency Pair
        </label>
        <div className="relative">
          <select
            value={selectedPairCode}
            onChange={(e) => setSelectedPairCode(e.target.value)}
            className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 text-lg font-bold text-gray-900 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
          >
            {CURRENCY_PAIRS.map((pair) => (
              <option key={pair.code} value={pair.code}>
                {pair.code}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
        {!selectedPair.isJpyQuote && (
          <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
            {isLoadingRate ? (
              <>
                <RefreshCw size={12} className="animate-spin" />
                <span>レート取得中...</span>
              </>
            ) : currentJpyRate ? (
              <span>
                参考レート: 1{selectedPair.quote} = {currentJpyRate}JPY
              </span>
            ) : (
              <span className="text-red-500">
                レート取得失敗 (デフォルト値で計算します)
              </span>
            )}
          </div>
        )}
      </div>

      {/* 1. BUY/SELL Toggle */}
      <div className="flex rounded-lg overflow-hidden border border-gray-200 shadow-sm">
        <button
          type="button"
          className={`flex-1 flex flex-col items-center justify-center py-3 transition-all ${
            tradeType === "LONG"
              ? "bg-blue-600 text-white font-bold shadow-inner"
              : "bg-white text-gray-500 hover:bg-gray-50"
          }`}
          onClick={() => handleTypeChange("LONG")}
        >
          <span className="text-lg tracking-wider">BUY</span>
          {tradeType === "LONG" && (
            <span className="text-[10px] font-normal opacity-80">
              ロング (買い)
            </span>
          )}
        </button>
        <button
          type="button"
          className={`flex-1 flex flex-col items-center justify-center py-3 transition-all ${
            tradeType === "SHORT"
              ? "bg-red-600 text-white font-bold shadow-inner"
              : "bg-white text-gray-500 hover:bg-gray-50"
          }`}
          onClick={() => handleTypeChange("SHORT")}
        >
          <span className="text-lg tracking-wider">SELL</span>
          {tradeType === "SHORT" && (
            <span className="text-[10px] font-normal opacity-80">
              ショート (売り)
            </span>
          )}
        </button>
      </div>

      {/* 2. Entry Price */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
          Entry Price
        </label>
        <div className="relative">
          <input
            type="number"
            inputMode="decimal"
            min="0"
            className={inputBaseClass}
            value={entryPrice}
            onChange={(e) => handlePriceChange(e.target.value, setEntryPrice)}
            onKeyDown={handleKeyDown}
            placeholder="0.00"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">
            {selectedPair.quote}
          </span>
        </div>
      </div>

      {/* 3. SL & TP Inputs */}
      <div className="grid grid-cols-2 gap-4">
        {/* Stop Loss */}
        <div>
          <label className="block text-xs font-bold text-red-600 uppercase mb-1">
            Stop Loss (価格)
          </label>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            className={`${inputBaseClass} border-red-200 bg-red-50/30 focus:ring-red-500 focus:border-red-500`}
            value={stopPrice}
            onChange={(e) => handlePriceChange(e.target.value, setStopPrice)}
            onKeyDown={handleKeyDown}
            placeholder="0.00"
          />
        </div>

        {/* Take Profit */}
        <div>
          <label className="block text-xs font-bold text-green-600 uppercase mb-1">
            Take Profit (価格)
          </label>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            className={`${inputBaseClass} border-green-200 bg-green-50/30 focus:ring-green-500 focus:border-green-500`}
            value={takePrice}
            onChange={(e) => handlePriceChange(e.target.value, setTakePrice)}
            onKeyDown={handleKeyDown}
            placeholder="0.00"
          />
        </div>
      </div>

      {/* エラー表示エリア */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2 text-red-600 animate-in fade-in slide-in-from-top-1">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <span className="text-sm font-bold">{error}</span>
        </div>
      )}

      {/* 4. Calculate Button */}
      <button
        type="button"
        disabled={disabled || isLoadingRate}
        onClick={handleSubmit}
        className="w-full py-4 rounded-xl text-white bg-gray-900 font-bold text-lg shadow-lg hover:bg-gray-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoadingRate ? (
          <>
            <RefreshCw size={20} className="animate-spin" />
            LOADING RATE...
          </>
        ) : (
          "CHECK ENTRY"
        )}
      </button>
    </section>
  );
}
