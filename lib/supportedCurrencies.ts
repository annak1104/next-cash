export const SUPPORTED_CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "UAH",
  "JPY",
  "CNY",
  "CAD",
  "AUD",
  "CHF",
  "PLN",
] as const;

export type SupportedCurrencyCode = (typeof SUPPORTED_CURRENCIES)[number];

export const SUPPORTED_CURRENCY_OPTIONS: Array<{
  value: SupportedCurrencyCode;
  label: string;
}> = [
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "UAH", label: "UAH - Ukrainian Hryvnia" },
  { value: "JPY", label: "JPY - Japanese Yen" },
  { value: "CNY", label: "CNY - Chinese Yuan" },
  { value: "CAD", label: "CAD - Canadian Dollar" },
  { value: "AUD", label: "AUD - Australian Dollar" },
  { value: "CHF", label: "CHF - Swiss Franc" },
  { value: "PLN", label: "PLN - Polish Zloty" },
];

export function isSupportedCurrency(
  currency: string,
): currency is SupportedCurrencyCode {
  return SUPPORTED_CURRENCIES.includes(currency as SupportedCurrencyCode);
}
