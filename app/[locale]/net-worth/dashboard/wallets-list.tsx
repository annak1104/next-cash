"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { formatCurrency, getCurrencyFlag } from "@/lib/currency-utils";

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
                  className="glass-surface hover:bg-glass flex items-center justify-between rounded-[1.4rem] p-4 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="glass-control flex h-10 w-10 items-center justify-center rounded-full text-xl">
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
              <div className="text-muted-foreground py-8 text-center">
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
