"use client";

import TransferForm, { transferFormSchema } from "@/components/transfer-form";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { createTransferTransaction } from "./actions";

type Wallet = {
  id: number;
  name: string;
  currency: string;
};

export default function TransferTransactionForm({
  cashTransferCategoryId,
  wallets,
}: {
  cashTransferCategoryId: number;
  wallets: Wallet[];
}) {
  const router = useRouter();

  const handleSubmit = async (data: z.infer<typeof transferFormSchema>) => {
    const result = await createTransferTransaction({
      amount: data.amount,
      transactionDate: format(data.transactionDate, "yyyy-MM-dd"),
      categoryId: data.categoryId,
      fromWalletId: data.fromWalletId,
      toWalletId: data.toWalletId,
      fee: data.fee,
      description:
        data.note ||
        `Transfer transaction - ${new Date().toLocaleDateString()}`,
    });

    if (result.error) {
      toast.error(result.message);
      return;
    }

    toast.success("Transfer transaction created");
    // router.push(
    //   `transactions?month=${data.transactionDate.getMonth() + 1}&year=${data.transactionDate.getFullYear()}`,
    // );
    router.push("/net-worth/budget");
  };

  const handleSaveAndAddMore = async (
    data: z.infer<typeof transferFormSchema>,
  ) => {
    const result = await createTransferTransaction({
      amount: data.amount,
      transactionDate: format(data.transactionDate, "yyyy-MM-dd"),
      categoryId: data.categoryId,
      fromWalletId: data.fromWalletId,
      toWalletId: data.toWalletId,
      fee: data.fee,
      description:
        data.note ||
        `Transfer transaction - ${new Date().toLocaleDateString()}`,
    });

    if (result.error) {
      toast.error(result.message);
      return;
    }

    toast.success("Transfer transaction created");
    // Reset form by reloading the page
    window.location.reload();
  };

  return (
    <TransferForm
      cashTransferCategoryId={cashTransferCategoryId}
      wallets={wallets}
      onSubmit={handleSubmit}
      onSaveAndAddMore={handleSaveAndAddMore}
    />
  );
}
