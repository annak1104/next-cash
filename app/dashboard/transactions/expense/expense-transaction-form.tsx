"use client";

import ExpenseForm, { expenseFormSchema } from "@/components/expense-form";
import { Category } from "@/types/Category";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { createExpenseTransaction } from "./actions";

type Wallet = {
  id: number;
  name: string;
  currency: string;
};

export default function ExpenseTransactionForm({
  categories,
  wallets,
}: {
  categories: Category[];
  wallets: Wallet[];
}) {
  const router = useRouter();

  const handleSubmit = async (data: z.infer<typeof expenseFormSchema>) => {
    const result = await createExpenseTransaction({
      amount: data.amount,
      transactionDate: format(data.transactionDate, "yyyy-MM-dd"),
      categoryId: data.categoryId,
      walletId: data.walletId,
      description:
        data.note || `Expense transaction - ${new Date().toLocaleDateString()}`,
    });

    if (result.error) {
      toast.error(result.message);
      return;
    }

    toast.success("Expense transaction created");
    // router.push(
    //   `/dashboard/transactions?month=${data.transactionDate.getMonth() + 1}&year=${data.transactionDate.getFullYear()}`,
    // );
    router.push("/net-worth/budget");
  };

  const handleSaveAndAddMore = async (
    data: z.infer<typeof expenseFormSchema>,
  ) => {
    const result = await createExpenseTransaction({
      amount: data.amount,
      transactionDate: format(data.transactionDate, "yyyy-MM-dd"),
      categoryId: data.categoryId,
      walletId: data.walletId,
      description:
        data.note || `Expense transaction - ${new Date().toLocaleDateString()}`,
    });

    if (result.error) {
      toast.error(result.message);
      return;
    }

    toast.success("Expense transaction created");
    // Reset form by reloading the page
    window.location.reload();
  };

  return (
    <ExpenseForm
      categories={categories}
      wallets={wallets}
      onSubmit={handleSubmit}
      onSaveAndAddMore={handleSaveAndAddMore}
    />
  );
}
