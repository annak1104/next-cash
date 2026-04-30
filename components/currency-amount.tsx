"use client";

import { useCurrency } from "@/contexts/currency-context";
import { formatCurrency } from "@/lib/currency-utils";

type Props = {
  amount: number;
  fromCurrency: string;
};

export default function CurrencyAmount({ amount, fromCurrency }: Props) {
  const { selectedCurrency, convertAmount } = useCurrency();
  const converted = convertAmount(amount, fromCurrency);

  return <>{formatCurrency(converted, selectedCurrency)}</>;
}
