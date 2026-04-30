import { SupportedCurrencyCode } from "@/lib/supportedCurrencies";

export type ExchangeRates = Partial<Record<SupportedCurrencyCode, number>> & {
  USD?: number;
};

type ConvertCurrencyResponse = {
  result?: number;
  success?: boolean;
  error?: unknown;
};

const CONVERT_API_URL = "https://api.exchangerate.host/convert";
const FALLBACK_RATES_API_URL =
  "https://v6.exchangerate-api.com/v6/9412553d4434d073ddd7f4eb/latest";

function roundToTwo(value: number): number {
  return Math.round(value * 100) / 100;
}

export async function convertCurrency(
  from: string,
  to: string,
  amount: number,
): Promise<number> {
  if (!Number.isFinite(amount) || amount <= 0) {
    return 0;
  }

  const fromCode = from.toUpperCase();
  const toCode = to.toUpperCase();

  if (fromCode === toCode) {
    return roundToTwo(amount);
  }

  const params = new URLSearchParams({
    from: fromCode,
    to: toCode,
    amount: amount.toString(),
  });
  const accessKey = process.env.EXCHANGERATE_HOST_ACCESS_KEY;

  if (accessKey) {
    params.set("access_key", accessKey);
  }

  const response = await fetch(`${CONVERT_API_URL}?${params.toString()}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    return convertCurrencyWithFallbackRates(fromCode, toCode, amount);
  }

  const data = (await response.json()) as ConvertCurrencyResponse;

  if (typeof data.result === "number" && Number.isFinite(data.result)) {
    return roundToTwo(data.result);
  }

  return convertCurrencyWithFallbackRates(fromCode, toCode, amount);
}

async function convertCurrencyWithFallbackRates(
  from: string,
  to: string,
  amount: number,
): Promise<number> {
  const response = await fetch(`${FALLBACK_RATES_API_URL}/${from}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Fallback rates request failed: ${response.status}`);
  }

  const data = (await response.json()) as {
    conversion_rates?: Record<string, number>;
  };
  const rate = data.conversion_rates?.[to];

  if (typeof rate !== "number" || !Number.isFinite(rate)) {
    throw new Error("Invalid fallback rates response");
  }

  return roundToTwo(amount * rate);
}

export function convertCurrencyFromRates(
  amount: number,
  from: string,
  to: string,
  rates: ExchangeRates,
): number {
  if (!Number.isFinite(amount) || amount === 0) {
    return 0;
  }

  const fromCode = from.toUpperCase();
  const toCode = to.toUpperCase();

  if (fromCode === toCode) {
    return roundToTwo(amount);
  }

  const toRate = rates[toCode as SupportedCurrencyCode];
  if (!toRate || !Number.isFinite(toRate)) {
    return roundToTwo(amount);
  }

  if (fromCode === "USD") {
    return roundToTwo(amount * toRate);
  }

  const fromRate = rates[fromCode as SupportedCurrencyCode];
  if (!fromRate || !Number.isFinite(fromRate)) {
    return roundToTwo(amount);
  }

  return roundToTwo((amount / fromRate) * toRate);
}
