"use server";

import { db } from "@/db";
import { categoriesTable, transfersTable, transactionsTable } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

export const createTransferTransaction = async (data: {
  amount: number;
  transactionDate: string;
  description: string;
  categoryId?: number;
  fromWalletId: number;
  toWalletId: number;
  fee?: number;
}) => {
  const { userId } = await auth();

  if (!userId) {
    return {
      error: true,
      message: "Unauthorized",
    };
  }

  if (data.fromWalletId === data.toWalletId) {
    return {
      error: true,
      message: "Source and destination accounts must be different",
    };
  }

  // Verify category if provided
  if (data.categoryId) {
    const [category] = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, data.categoryId))
      .limit(1);

    if (!category) {
      return {
        error: true,
        message: "Invalid category",
      };
    }
  }

  // Create transfer record
  const [transfer] = await db
    .insert(transfersTable)
    .values({
      userId,
      fromWalletId: data.fromWalletId,
      toWalletId: data.toWalletId,
      amount: data.amount.toString(),
      fee: data.fee ? data.fee.toString() : null,
      transactionDate: data.transactionDate,
      description: data.description,
      categoryId: data.categoryId || null,
    })
    .returning();

  // Get default expense category if categoryId not provided
  let expenseCategoryId = data.categoryId;
  if (!expenseCategoryId) {
    const [expenseCategory] = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.type, "expense"))
      .limit(1);
    if (expenseCategory) {
      expenseCategoryId = expenseCategory.id;
    }
  }

  // Get default income category if categoryId not provided
  let incomeCategoryId = data.categoryId;
  if (!incomeCategoryId) {
    const [incomeCategory] = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.type, "income"))
      .limit(1);
    if (incomeCategory) {
      incomeCategoryId = incomeCategory.id;
    }
  }

  if (!expenseCategoryId || !incomeCategoryId) {
    return {
      error: true,
      message: "Categories not found. Please create income and expense categories first.",
    };
  }

  // Create expense transaction for "from" wallet
  const [expenseTransaction] = await db
    .insert(transactionsTable)
    .values({
      userId,
      amount: data.amount.toString(),
      description: `Transfer to: ${data.description}`,
      categoryId: expenseCategoryId,
      walletId: data.fromWalletId,
      transactionDate: data.transactionDate,
      transactionType: "transfer",
      fromWalletId: data.fromWalletId,
      toWalletId: data.toWalletId,
      transferId: transfer.id,
    })
    .returning();

  // Create income transaction for "to" wallet
  const [incomeTransaction] = await db
    .insert(transactionsTable)
    .values({
      userId,
      amount: data.amount.toString(),
      description: `Transfer from: ${data.description}`,
      categoryId: incomeCategoryId,
      walletId: data.toWalletId,
      transactionDate: data.transactionDate,
      transactionType: "transfer",
      fromWalletId: data.fromWalletId,
      toWalletId: data.toWalletId,
      transferId: transfer.id,
    })
    .returning();

  // Create fee transaction if fee exists
  if (data.fee && data.fee > 0) {
    await db.insert(transactionsTable).values({
      userId,
      amount: data.fee.toString(),
      description: `Transfer fee: ${data.description}`,
      categoryId: expenseCategoryId,
      walletId: data.fromWalletId, // Fee deducted from source wallet
      transactionDate: data.transactionDate,
      transactionType: "transfer",
      fromWalletId: data.fromWalletId,
      toWalletId: data.toWalletId,
      fee: data.fee.toString(),
      transferId: transfer.id,
    });
  }

  return {
    id: transfer.id,
    expenseTransactionId: expenseTransaction.id,
    incomeTransactionId: incomeTransaction.id,
  };
};

