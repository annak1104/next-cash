// Currency code to country code mapping for flag emojis
const currencyToCountry: Record<string, string> = {
  USD: "US", // United States
  EUR: "EU", // European Union (special case)
  GBP: "GB", // United Kingdom
  UAH: "UA", // Ukraine
  JPY: "JP", // Japan
  CNY: "CN", // China
  CAD: "CA", // Canada
  AUD: "AU", // Australia
  CHF: "CH", // Switzerland
  PLN: "PL", // Poland
};

// Get flag emoji from currency code
export function getCurrencyFlag(currency: string): string {
  const countryCode = currencyToCountry[currency.toUpperCase()];
  
  if (!countryCode) {
    return "🏳️"; // Default flag
  }

  // Special case for EUR (European Union)
  if (countryCode === "EU") {
    return "🇪🇺";
  }

  // Convert country code to flag emoji
  // Each country code is 2 letters, convert to regional indicator symbols
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));

  return String.fromCodePoint(...codePoints);
}

// Format currency amount
export function formatCurrency(amount: number, currency: string): string {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatter.format(amount);
}

