// Cache for exchange rates to minimize API calls
const rateCache: Record<string, { rate: number; timestamp: number }> = {};
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

export const fetchExchangeRate = async (
  base: string,
  quote: string
): Promise<number | null> => {
  // Same currency
  if (base === quote) return 1;

  const cacheKey = `${base}_${quote}`;
  const now = Date.now();

  // Check cache
  if (
    rateCache[cacheKey] &&
    now - rateCache[cacheKey].timestamp < CACHE_DURATION
  ) {
    return rateCache[cacheKey].rate;
  }

  try {
    const response = await fetch(
      `https://api.frankfurter.app/latest?from=${base}&to=${quote}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch exchange rate");
    }
    const data = await response.json();
    const rate = data.rates[quote];

    if (typeof rate === "number") {
      // Update cache
      rateCache[cacheKey] = { rate, timestamp: now };
      return rate;
    }
    return null;
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
    return null;
  }
};
