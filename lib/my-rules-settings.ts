import { ENABLE_MY_RULES_CHECK_KEY } from "./constants";

const isBrowser = typeof window !== "undefined";

export const getEnableMyRulesCheck = (): boolean => {
  if (!isBrowser) return true; // Default to enabled

  try {
    const value = window.localStorage.getItem(ENABLE_MY_RULES_CHECK_KEY);
    if (value === null) {
      return true; // Default to enabled
    }
    return value === "true";
  } catch (error) {
    console.error("Failed to read My Rules check setting", error);
    return true;
  }
};

export const setEnableMyRulesCheck = (enabled: boolean): void => {
  if (!isBrowser) return;

  try {
    window.localStorage.setItem(ENABLE_MY_RULES_CHECK_KEY, String(enabled));
  } catch (error) {
    console.error("Failed to save My Rules check setting", error);
  }
};
