"server-only";

const COINGECKO_API = "https://api.coingecko.com/api/v3";

export async function searchCrypto(
  query: string,
): Promise<Array<{ id: string; symbol: string; name: string; image: string }>> {
  if (!query || query.length < 1) {
    return [];
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

    return coins;
  } catch (error) {
    console.error("CoinGecko search error:", error);
    return [];
  }
}




