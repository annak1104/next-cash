"server-only";

import { convertCurrencyFromRates } from "@/lib/currency-converter";
import { getUsdExchangeRates } from "@/lib/exchange-rates-server";
import { auth } from "@clerk/nextjs/server";
import { getWalletBalances } from "./getWalletBalance";
import getWallets from "./getWallets";

export async function getTotalBalance(): Promise<number> {
  const { userId } = await auth();

  if (!userId) {
    return 0;
  }

  const [wallets, balances] = await Promise.all([
    getWallets(),
    getWalletBalances(),
  ]);

  const rates = await getUsdExchangeRates().catch((error) => {
    console.error("Failed to load exchange rates for total balance:", error);
    return { USD: 1 };
  });

  return wallets.reduce((total, wallet) => {
    const balance = balances[wallet.id] ?? 0;
    return (
      total + convertCurrencyFromRates(balance, wallet.currency, "USD", rates)
    );
  }, 0);
}
