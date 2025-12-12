"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getCurrencyFlag, formatCurrency } from "@/lib/currency-utils";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

type Wallet = {
  id: number;
  name: string;
  currency: string;
  balance?: number;
};

type Props = {
  wallet: Wallet;
};

export default function WalletCard({ wallet }: Props) {
  const balance = wallet.balance ?? 0;
  const flag = getCurrencyFlag(wallet.currency);

  return (
    <div className="relative flex min-w-[180px] flex-col items-center rounded-lg border bg-card p-4 shadow-sm">
      {/* Flag icon */}
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-2xl">
        {flag}
      </div>

      {/* Wallet name and balance in one line */}
      <div className="flex flex-col w-full items-center justify-between gap-2">
        <span className="text-sm font-medium">{wallet.name}</span>
        <span className="text-lg font-bold">
          {formatCurrency(balance, wallet.currency)}
        </span>
      </div>

      {/* Three dots menu */}
      <div className="absolute right-2 top-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

