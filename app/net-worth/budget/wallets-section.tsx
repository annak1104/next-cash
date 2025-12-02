import { Button } from "@/components/ui/button";
import { getTotalBalance } from "@/data/getTotalBalance";
import { getWalletBalances } from "@/data/getWalletBalance";
import getWallets from "@/data/getWallets";
import { ArrowDown, ArrowsUpFromLine, ArrowUp, Calculator } from "lucide-react";
import Link from "next/link";
import TotalBalance from "./total-balance";
import WalletsList from "./wallets-list";

export default async function WalletsSection() {
  const wallets = await getWallets();
  const balances = await getWalletBalances();
  const totalBalance = await getTotalBalance();

  const walletsWithBalances = wallets.map((wallet) => ({
    ...wallet,
    balance: balances[wallet.id] ?? 0,
  }));

  return (
    <div className="space-y-4">
      <TotalBalance totalBalance={totalBalance} />
      <div className="flex gap-1">
        <Button asChild>
          <Link href="/dashboard/transactions/income">
            <ArrowDown />
            Income
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard/transactions/expense">
            <ArrowUp />
            Expense
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard/transactions/transfer">
            <ArrowsUpFromLine />
            Transfers
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard/transactions/adjustment">
            <Calculator />
            Adjustment
          </Link>
        </Button>
      </div>

      <WalletsList wallets={walletsWithBalances} />
    </div>
  );
}
