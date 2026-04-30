"use server";

import { db } from "@/db";
import {
  categoriesTable,
  transactionsTable,
  transfersTable,
  walletsTable,
} from "@/db/schema";
import { convertCurrency } from "@/lib/currency-converter";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";

// Helper function to get or create Cash Transfer category
async function getOrCreateCashTransferCategory() {
  // Try to find existing "Cash Transfer" category
  const [existingCategory] = await db
    .select()
    .from(categoriesTable)
    .where(eq(categoriesTable.name, "Cash Transfer"))
    .limit(1);

  if (existingCategory) {
    return existingCategory.id;
  }

  // Create "Cash Transfer" category as expense type (can be used for both)
  const [newCategory] = await db
    .insert(categoriesTable)
    .values({
      name: "Cash Transfer",
      type: "expense",
    })
    .returning();

  return newCategory.id;
}

export const createTransferTransaction = async (data: {
  amount: number;
  transactionDate: string;
  description: string;
  categoryId: number;
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

  if (!Number.isFinite(data.amount) || data.amount <= 0) {
    return {
      error: true,
      message: "Amount must be greater than 0",
    };
  }

  if (data.fee !== undefined && (!Number.isFinite(data.fee) || data.fee < 0)) {
    return {
      error: true,
      message: "Fee cannot be negative",
    };
  }

  // Verify category exists and is "Cash Transfer"
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

  // Ensure we're using Cash Transfer category
  const cashTransferCategoryId = await getOrCreateCashTransferCategory();

  const [fromWallet] = await db
    .select({ id: walletsTable.id, currency: walletsTable.currency })
    .from(walletsTable)
    .where(
      and(
        eq(walletsTable.id, data.fromWalletId),
        eq(walletsTable.userId, userId),
      ),
    )
    .limit(1);
  const [toWallet] = await db
    .select({ id: walletsTable.id, currency: walletsTable.currency })
    .from(walletsTable)
    .where(
      and(
        eq(walletsTable.id, data.toWalletId),
        eq(walletsTable.userId, userId),
      ),
    )
    .limit(1);

  if (!fromWallet || !toWallet) {
    return {
      error: true,
      message: "Wallet not found",
    };
  }

  let convertedTransferAmount: number;

  try {
    convertedTransferAmount = await convertCurrency(
      fromWallet.currency,
      toWallet.currency,
      data.amount,
    );
  } catch (error) {
    console.error("Failed to convert transfer amount:", error);
    return {
      error: true,
      message: "Failed to convert transfer amount",
    };
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
      categoryId: cashTransferCategoryId,
    })
    .returning();

  // Use the same Cash Transfer category for both transactions
  const transferCategoryId = cashTransferCategoryId;

  // Create expense transaction for "from" wallet
  const [expenseTransaction] = await db
    .insert(transactionsTable)
    .values({
      userId,
      amount: data.amount.toString(),
      description: `Transfer to: ${data.description}`,
      categoryId: transferCategoryId,
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
      amount: convertedTransferAmount.toString(),
      description: `Transfer from: ${data.description}`,
      categoryId: transferCategoryId,
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
      categoryId: transferCategoryId,
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

// Export function to get cash transfer category ID
export async function getCashTransferCategoryId() {
  return await getOrCreateCashTransferCategory();
}
