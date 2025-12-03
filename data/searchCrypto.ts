"server-only";

const COINGECKO_API = "https://api.coingecko.com/api/v3";

let searchCache: {
  data: Array<{ id: string; symbol: string; name: string; image: string }>;
  timestamp: number;
} | null = null;

const CACHE_LIFETIME = 1000 * 60 * 15; // 15 minutes

export async function searchCrypto(
  query: string,
): Promise<Array<{ id: string; symbol: string; name: string; image: string }>> {
  if (!query || query.length < 1) {
    return [];
  }

  const now = Date.now();

  // Use cache if available and query is short
  if (searchCache && now - searchCache.timestamp < CACHE_LIFETIME) {
    const lower = query.toLowerCase();
    return searchCache.data.filter(
      (coin) =>
        coin.symbol.toLowerCase().includes(lower) ||
        coin.name.toLowerCase().includes(lower),
    );
  }

  try {
    const res = await fetch(
      `${COINGECKO_API}/search?query=${encodeURIComponent(query)}`,
      { next: { revalidate: 900 } },
    );

    if (!res.ok) {
      console.error("CoinGecko search error:", res.status);
      return [];
    }

    const data = await res.json();
    const coins =
      data?.coins?.map((coin: any) => ({
        id: coin.id as string,
        symbol: (coin.symbol as string).toUpperCase(),
        name: coin.name as string,
        image: coin.thumb as string,
      })) ?? [];

    searchCache = { data: coins, timestamp: now };
    return coins;
  } catch (error) {
    console.error("CoinGecko search error:", error);
    return [];
  }
}


