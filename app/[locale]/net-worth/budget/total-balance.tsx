import { formatCurrency } from "@/lib/currency-utils";
import getWallets from "@/data/getWallets";

type Props = {
  totalBalance: number;
};

export default async function TotalBalance({ totalBalance }: Props) {
  const wallets = await getWallets();
  // Use the first wallet's currency, or default to USD
  const defaultCurrency = wallets[0]?.currency ?? "USD";

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm text-muted-foreground">Total balance</h2>
        <p className="text-4xl font-bold">{formatCurrency(totalBalance, defaultCurrency)}</p>
      </div>
    </div>
  );
}

