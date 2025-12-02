import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import getWallets from "@/data/getWallets";
import { getWalletBalances } from "@/data/getWalletBalance";
import Link from "next/link";
import AdjustmentTransactionForm from "./adjustment-transaction-form";

export default async function AdjustmentTransactionPage() {
  const wallets = await getWallets();
  const balances = await getWalletBalances();

  const walletsWithBalances = wallets.map((wallet) => ({
    ...wallet,
    balance: balances[wallet.id] ?? 0,
  }));

  return (
    <div className="mx-auto max-w-7xl px-1 py-10">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard/transactions">Transactions</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Add adjustment</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Card className="mt-4 max-w-3xl">
        <CardContent className="pt-6">
          <AdjustmentTransactionForm wallets={walletsWithBalances} />
        </CardContent>
      </Card>
    </div>
  );
}

