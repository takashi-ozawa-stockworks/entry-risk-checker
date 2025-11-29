"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { get, set, del } from "idb-keyval";

const PASSCODE_KEY = "app_passcode";

interface PasscodeContextType {
  isLocked: boolean;
  hasPasscode: boolean;
  isLoading: boolean;
  unlock: (input: string) => Promise<boolean>;
  setPasscode: (input: string) => Promise<void>;
  removePasscode: () => Promise<void>;
  lock: () => void;
}

const PasscodeContext = createContext<PasscodeContextType | undefined>(
  undefined
);

export function PasscodeProvider({ children }: { children: React.ReactNode }) {
  const [isLocked, setIsLocked] = useState(true);
  const [hasPasscode, setHasPasscode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [storedPasscode, setStoredPasscode] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const code = await get<string>(PASSCODE_KEY);
        if (code) {
          setHasPasscode(true);
          setStoredPasscode(code);
          setIsLocked(true); // Default to locked if passcode exists
        } else {
          setHasPasscode(false);
          setIsLocked(false);
        }
      } catch (e) {
        console.error("Failed to load passcode", e);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const unlock = async (input: string): Promise<boolean> => {
    if (!storedPasscode) return true;
    if (input === storedPasscode) {
      setIsLocked(false);
      return true;
    }
    return false;
  };

  const setPasscode = async (input: string) => {
    await set(PASSCODE_KEY, input);
    setStoredPasscode(input);
    setHasPasscode(true);
    setIsLocked(false); // Setting a new passcode doesn't immediately lock
  };

  const removePasscode = async () => {
    await del(PASSCODE_KEY);
    setStoredPasscode(null);
    setHasPasscode(false);
    setIsLocked(false);
  };

  const lock = () => {
    if (hasPasscode) {
      setIsLocked(true);
    }
  };

  return (
    <PasscodeContext.Provider
      value={{
        isLocked,
        hasPasscode,
        isLoading,
        unlock,
        setPasscode,
        removePasscode,
        lock,
      }}
    >
      {children}
    </PasscodeContext.Provider>
  );
}

export function usePasscode() {
  const context = useContext(PasscodeContext);
  if (context === undefined) {
    throw new Error("usePasscode must be used within a PasscodeProvider");
  }
  return context;
}
