import "server-only";

import { ExchangeRates } from "@/lib/currency-converter";

const API_URL =
  "https://v6.exchangerate-api.com/v6/9412553d4434d073ddd7f4eb/latest/USD";

export async function getUsdExchangeRates(): Promise<ExchangeRates> {
  const response = await fetch(API_URL, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`Exchange rates request failed: ${response.status}`);
  }

  const data = await response.json();
  const rates = data?.conversion_rates;

  if (!rates || typeof rates !== "object") {
    throw new Error("Invalid exchange rate response");
  }

  return rates as ExchangeRates;
}
