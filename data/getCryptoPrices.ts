"server-only";

const COINGECKO_API = "https://api.coingecko.com/api/v3";

let priceCache: Record<string, { price: number; change24h: number; timestamp: number }> = {};
const CACHE_LIFETIME = 1000 * 60 * 5; // 5 minutes

export async function getCryptoPrices(
  coinIds: string[],
): Promise<Record<string, { price: number; change24h: number }>> {
  if (coinIds.length === 0) {
    return {};
  }

  const now = Date.now();
  const uncachedIds: string[] = [];

  // Check cache
  const result: Record<string, { price: number; change24h: number }> = {};
  for (const id of coinIds) {
    const cached = priceCache[id];
    if (cached && now - cached.timestamp < CACHE_LIFETIME) {
      result[id] = { price: cached.price, change24h: cached.change24h };
    } else {
      uncachedIds.push(id);
    }
  }

  // Fetch uncached prices
  if (uncachedIds.length > 0) {
    try {
      const ids = uncachedIds.join(",");
      const res = await fetch(
        `${COINGECKO_API}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=250&page=1&sparkline=false&price_change_percentage=24h`,
        { next: { revalidate: 300 } },
      );

      if (res.ok) {
        const data = await res.json();
        for (const coin of data) {
          const price = coin.current_price || 0;
          const change24h = coin.price_change_percentage_24h || 0;
          result[coin.id] = { price, change24h };
          priceCache[coin.id] = {
            price,
            change24h,
            timestamp: now,
          };
        }
      }
    } catch (error) {
      console.error("CoinGecko API error:", error);
    }
  }

  return result;
}

