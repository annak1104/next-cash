"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrency } from "@/contexts/currency-context";
import { getCurrencyFlag } from "@/lib/currency-utils";
import {
  SUPPORTED_CURRENCIES,
  SupportedCurrencyCode,
} from "@/lib/supportedCurrencies";

export default function CurrencySelector() {
  const { selectedCurrency, setSelectedCurrency, isLoadingRates } =
    useCurrency();

  return (
    <Select
      value={selectedCurrency}
      onValueChange={(value) =>
        setSelectedCurrency(value as SupportedCurrencyCode)
      }
      disabled={isLoadingRates}
    >
      <SelectTrigger className="w-[110px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SUPPORTED_CURRENCIES.map((currency) => (
          <SelectItem key={currency} value={currency}>
            <div className="flex items-center gap-2">
              <span className="text-xl">{getCurrencyFlag(currency)}</span>
              <span className="text-foreground">{currency}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
