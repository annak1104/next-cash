"use client";

import { useCurrency } from "@/contexts/currency-context";
import { formatCurrency } from "@/lib/currency-utils";
import { useMemo } from "react";

type WalletBalance = {
  id: number;
  currency: string;
  balance: number;
};

type Props = {
  wallets: WalletBalance[];
};

export default function TotalBalance({ wallets }: Props) {
  const { convertAmount, selectedCurrency, isLoadingRates } = useCurrency();
  const totalBalance = useMemo(
    () =>
      wallets.reduce(
        (sum, wallet) => sum + convertAmount(wallet.balance, wallet.currency),
        0,
      ),
    [convertAmount, wallets],
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-muted-foreground text-sm">Total balance</h2>
        <p className="text-4xl font-bold">
          {formatCurrency(totalBalance, selectedCurrency)}
        </p>
        {isLoadingRates && (
          <p className="text-muted-foreground text-sm">
            Updating exchange rates...
          </p>
        )}
      </div>
    </div>
  );
}
