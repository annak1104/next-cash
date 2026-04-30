export const SUPPORTED_CURRENCIES = ["USD", "EUR", "UAH"] as const;

export type SupportedCurrencyCode =
  (typeof SUPPORTED_CURRENCIES)[number];

export function isSupportedCurrency(
  currency: string
): currency is SupportedCurrencyCode {
  return SUPPORTED_CURRENCIES.includes(
    currency as SupportedCurrencyCode
  );
}