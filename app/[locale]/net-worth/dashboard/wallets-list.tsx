"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { getCurrencyFlag, formatCurrency } from "@/lib/currency-utils";

type Wallet = {
  id: number;
  name: string;
  currency: string;
  balance: number;
};

type WalletsListProps = {
  wallets: Wallet[];
};

export default function WalletsList({ wallets }: WalletsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cash accounts</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full">
          <div className="space-y-3">
            {wallets.map((wallet) => {
              const flag = getCurrencyFlag(wallet.currency);
              return (
                <div
                  key={wallet.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-xl">
                      {flag}
                    </div>
                    <div>
                      <p className="font-medium">{wallet.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      {formatCurrency(wallet.balance, wallet.currency)}
                    </p>
                  </div>
                </div>
              );
            })}
            {wallets.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No wallets found
              </div>
            )}
          </div>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

