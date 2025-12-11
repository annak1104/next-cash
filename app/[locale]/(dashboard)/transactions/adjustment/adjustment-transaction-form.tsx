"use client";

import AdjustmentForm, {
  adjustmentFormSchema,
} from "@/components/adjustment-form";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { createAdjustmentTransaction } from "./actions";

type Wallet = {
  id: number;
  name: string;
  currency: string;
  balance: number;
};

export default function AdjustmentTransactionForm({
  wallets,
}: {
  wallets: Wallet[];
}) {
  const router = useRouter();

  const handleSubmit = async (data: z.infer<typeof adjustmentFormSchema>) => {
    const result = await createAdjustmentTransaction({
      transactionDate: format(data.transactionDate, "yyyy-MM-dd"),
      walletId: data.walletId,
      newBalance: data.newBalance,
      description:
        data.note || `Balance adjustment - ${new Date().toLocaleDateString()}`,
    });

    if (result.error) {
      toast.error(result.message);
      return;
    }

    if (result.message === "No adjustment needed") {
      toast.info("No adjustment needed - balance is already correct");
      return;
    }

    toast.success("Adjustment transaction created");
    // router.push(
    //   `transactions?month=${data.transactionDate.getMonth() + 1}&year=${data.transactionDate.getFullYear()}`,
    // );
    router.push("/net-worth/budget");
  };

  const handleSaveAndAddMore = async (
    data: z.infer<typeof adjustmentFormSchema>,
  ) => {
    const result = await createAdjustmentTransaction({
      transactionDate: format(data.transactionDate, "yyyy-MM-dd"),
      walletId: data.walletId,
      newBalance: data.newBalance,
      description:
        data.note || `Balance adjustment - ${new Date().toLocaleDateString()}`,
    });

    if (result.error) {
      toast.error(result.message);
      return;
    }

    if (result.message === "No adjustment needed") {
      toast.info("No adjustment needed - balance is already correct");
      return;
    }

    toast.success("Adjustment transaction created");
    // Reset form by reloading the page
    window.location.reload();
  };

  return (
    <AdjustmentForm
      wallets={wallets}
      onSubmit={handleSubmit}
      onSaveAndAddMore={handleSaveAndAddMore}
    />
  );
}
