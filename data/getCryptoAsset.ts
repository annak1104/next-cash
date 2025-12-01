import "server-only";

const COINGECKO_API = "https://api.coingecko.com/api/v3";
console.log(COINGECKO_API);

export interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap_rank: number;
}

let cached: CryptoAsset[] | null = null;
let lastFetchTime = 0;
const CACHE_LIFETIME = 1000 * 60 * 10; // 10 хвилин

export async function getCryptoAssets(): Promise<CryptoAsset[]> {
  const now = Date.now();

  // Використовуємо кеш, щоб не робити багато запитів до API
  if (cached && now - lastFetchTime < CACHE_LIFETIME) {
    return cached;
  }

  const res = await fetch(
    `${COINGECKO_API}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false`,
    {
      next: { revalidate: 600 }, // ISR кешування Next.js
    },
  );

  if (!res.ok) {
    console.error("CoinGecko API error:", res.status);
    return [];
  }

  const data = await res.json();
  console.log(data);

  const assets: CryptoAsset[] = data.map((coin: any) => ({
    id: coin.id,
    symbol: coin.symbol.toUpperCase(),
    name: coin.name,
    image: coin.image,
    current_price: coin.current_price,
    market_cap_rank: coin.market_cap_rank,
  }));

  cached = assets;
  lastFetchTime = now;

  return assets;
}
