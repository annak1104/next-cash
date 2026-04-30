"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency, getCurrencyFlag } from "@/lib/currency-utils";
import { MoreVertical, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteWallet } from "./actions";

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
  const router = useRouter();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const balance = wallet.balance ?? 0;
  const flag = getCurrencyFlag(wallet.currency);

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteWallet(wallet.id);

      if (result.error) {
        toast.error(result.message);
        return;
      }

      toast.success("Account deleted successfully");
      setIsDeleteOpen(false);
      router.refresh();
    });
  };

  return (
    <>
      <div className="bg-card relative flex min-w-[180px] flex-col items-center rounded-lg border p-4 shadow-sm">
        {/* Flag icon */}
        <div className="bg-muted mb-3 flex h-12 w-12 items-center justify-center rounded-full text-2xl">
          {flag}
        </div>

        {/* Wallet name and balance in one line */}
        <div className="flex w-full flex-col items-center justify-between gap-2">
          <span className="text-sm font-medium">{wallet.name}</span>
          <span className="text-lg font-bold">
            {formatCurrency(balance, wallet.currency)}
          </span>
        </div>

        {/* Three dots menu */}
        <div className="absolute top-2 right-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => setIsDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete account</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete {wallet.name} and its transactions. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                handleDelete();
              }}
              disabled={isPending}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {isPending ? "Deleting..." : "Delete account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
