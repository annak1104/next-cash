import { HoldingRow } from "@/types/HoldingRow";
import "server-only";

const COINGECKO_API = "https://api.coingecko.com/api/v3";

let cached: HoldingRow[] | null = null;
let lastFetchTime = 0;
const CACHE_LIFETIME = 1000 * 60 * 10;

export async function getCryptoHoldings(): Promise<HoldingRow[]> {
  const now = Date.now();

  if (cached && now - lastFetchTime < CACHE_LIFETIME) {
    return cached;
  }

  const res = await fetch(
    `${COINGECKO_API}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false`,
    { next: { revalidate: 600 } }
  );

  if (!res.ok) {
    console.error("CoinGecko API error:", res.status);
    return [];
  }

  const data = await res.json();

  // Мапимо одразу у формат HoldingRow
  const holdings: HoldingRow[] = data.map((coin: any) => ({
    id: coin.id,
    name: coin.name,
    symbol: coin.symbol.toUpperCase(),
    image: coin.image,
    quantity: 0, // можна підставити реальні дані, якщо є
    currentPrice: coin.current_price,
    change24h: coin.price_change_percentage_24h ?? 0,
    dailyPL: 1,
    totalValue: 0,
  }));

  cached = holdings;
  lastFetchTime = now;

  return holdings;
}
