"use client";

import { useState, useEffect, useCallback } from "react";
import { usePasscode } from "@/contexts/PasscodeContext";
import { Lock, Delete } from "lucide-react";

export default function PasscodeLock() {
  const { isLocked, hasPasscode, isLoading, unlock } = usePasscode();
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleUnlock = useCallback(
    async (code: string) => {
      const success = await unlock(code);
      if (success) {
        setInput("");
        setError(false);
      } else {
        setError(true);
        setShake(true);
        setTimeout(() => {
          setShake(false);
          setInput("");
        }, 500);
      }
    },
    [unlock]
  );

  useEffect(() => {
    if (input.length === 4) {
      handleUnlock(input);
    }
  }, [input, handleUnlock]);

  const handleNumberClick = (num: number) => {
    if (input.length < 4) {
      setInput((prev) => prev + num);
      setError(false);
    }
  };

  const handleDelete = () => {
    setInput((prev) => prev.slice(0, -1));
    setError(false);
  };

  if (isLoading || !hasPasscode || !isLocked) return null;

  return (
    <div className="fixed inset-0 z-9999 bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xs space-y-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto text-white">
            <Lock size={32} />
          </div>
          <h2 className="text-xl font-bold text-white">パスコードロック</h2>
          <p className="text-gray-400 text-sm">パスコードを入力してください</p>
        </div>

        {/* Dots Display */}
        <div
          className={`flex justify-center gap-4 py-4 ${
            shake ? "animate-shake" : ""
          }`}
        >
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full transition-all duration-200 ${
                i < input.length
                  ? error
                    ? "bg-red-500 scale-110"
                    : "bg-white scale-110"
                  : "bg-gray-700"
              }`}
            />
          ))}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-4 px-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num)}
              className="aspect-square rounded-full bg-gray-800 text-white text-2xl font-medium hover:bg-gray-700 active:bg-gray-600 transition flex items-center justify-center"
            >
              {num}
            </button>
          ))}
          <div /> {/* Empty slot */}
          <button
            onClick={() => handleNumberClick(0)}
            className="aspect-square rounded-full bg-gray-800 text-white text-2xl font-medium hover:bg-gray-700 active:bg-gray-600 transition flex items-center justify-center"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="aspect-square rounded-full text-gray-400 hover:text-white hover:bg-gray-800/50 active:bg-gray-800 transition flex items-center justify-center"
          >
            <Delete size={24} />
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-8px);
          }
          75% {
            transform: translateX(8px);
          }
        }
        .animate-shake {
          animation: shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }
      `}</style>
    </div>
  );
}
