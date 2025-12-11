"use server";

import { db } from "@/db";
import { categoriesTable, transactionsTable } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq, sql } from "drizzle-orm";
import getWalletBalance from "@/data/getWalletBalance";

export const createAdjustmentTransaction = async (data: {
  transactionDate: string;
  description: string;
  walletId: number;
  newBalance: number;
}) => {
  const { userId } = await auth();

  if (!userId) {
    return {
      error: true,
      message: "Unauthorized",
    };
  }

  // Get current balance
  const currentBalance = await getWalletBalance(data.walletId);
  const adjustmentAmount = data.newBalance - currentBalance;

  // If no adjustment needed, return success
  if (Math.abs(adjustmentAmount) < 0.01) {
    return {
      id: 0,
      message: "No adjustment needed",
    };
  }

  // Get income or expense category (use first available)
  const [incomeCategory] = await db
    .select()
    .from(categoriesTable)
    .where(eq(categoriesTable.type, "income"))
    .limit(1);

  const [expenseCategory] = await db
    .select()
    .from(categoriesTable)
    .where(eq(categoriesTable.type, "expense"))
    .limit(1);

  if (!incomeCategory || !expenseCategory) {
    return {
      error: true,
      message: "Categories not found. Please create income and expense categories first.",
    };
  }

  // Create adjustment transaction
  const [transaction] = await db
    .insert(transactionsTable)
    .values({
      userId,
      amount: Math.abs(adjustmentAmount).toString(),
      description: data.description || `Balance adjustment: ${adjustmentAmount > 0 ? "Increase" : "Decrease"}`,
      categoryId: adjustmentAmount > 0 ? incomeCategory.id : expenseCategory.id,
      walletId: data.walletId,
      transactionDate: data.transactionDate,
      transactionType: "adjustment",
    })
    .returning();

  return {
    id: transaction.id,
    adjustmentAmount,
  };
};

