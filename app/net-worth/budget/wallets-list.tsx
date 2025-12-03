"use client";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Plus } from "lucide-react";
import { useState } from "react";
import CreateWalletDialog from "./create-wallet-dialog";
import WalletCard from "./wallet-card";

type Wallet = {
  id: number;
  name: string;
  currency: string;
  balance: number;
};

export default function WalletsList({ wallets }: { wallets: Wallet[] }) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-4">
      <ScrollArea className="w-full">
        {/* Горизонтальний список */}
        <div className="flex gap-4 pb-4 whitespace-nowrap">
          {wallets.map((wallet) => (
            <WalletCard key={wallet.id} wallet={wallet} />
          ))}

          {/* Карточка створення акаунту */}
          <button
            onClick={() => setDialogOpen(true)}
            className="bg-muted/50 text-muted-foreground hover:text-foreground flex min-w-[180px] flex-col items-center justify-center rounded-lg border border-dashed p-4 transition-colors"
          >
            <div className="bg-background flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed">
              <Plus className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium">Create new account</span>
          </button>
        </div>

        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <CreateWalletDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
