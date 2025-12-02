"use client";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useState } from "react";
import WalletCard from "./wallet-card";
import CreateWalletDialog from "./create-wallet-dialog";
import { Plus } from "lucide-react";

type Wallet = {
  id: number;
  name: string;
  currency: string;
};

export default function WalletsList({ wallets }: { wallets: Wallet[] }) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-4">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-4 pb-4">
          {wallets.map((wallet) => (
            <WalletCard
              key={wallet.id}
              wallet={{
                ...wallet,
                balance: 0, // TODO: Calculate actual balance from transactions
              }}
            />
          ))}
          {/* Create new account card */}
          <div className="flex min-w-[180px] flex-col items-center justify-center rounded-lg border border-dashed bg-muted/50 p-4">
            <button
              onClick={() => setDialogOpen(true)}
              className="flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background border-2 border-dashed">
                <Plus className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium">Create new account</span>
            </button>
          </div>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <CreateWalletDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}

