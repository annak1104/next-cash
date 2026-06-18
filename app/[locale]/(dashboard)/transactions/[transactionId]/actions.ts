"use server";

import { db } from "@/db";
import { categoriesTable, transactionsTable } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

// Update schema without walletId requirement (walletId is optional in DB)
const updateTransactionSchema = z.object({
  id: z.number(),
  amount: z.number().positive("Amount must be greater than 0"),
  description: z
    .string()
    .min(3, "Description must contain at least 3 characters")
    .max(300, "Description must contain a maximum of 300 characters"),
  categoryId: z.number().positive("Category ID is invalid"),
  transactionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
});

export async function updateTransaction(data: {
  id: number;
  transactionDate: string;
  description: string;
  amount: number;
  categoryId: number;
}) {
  const { userId } = await auth();

  if (!userId) {
    return {
      error: true,
      message: "Unauthorized",
    };
  }

  const validation = updateTransactionSchema.safeParse(data);

  if (!validation.success) {
    return {
      error: true,
      message: validation.error.issues[0].message,
    };
  }

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

  const [existingTransaction] = await db
    .select({ transactionType: transactionsTable.transactionType })
    .from(transactionsTable)
    .where(
      and(
        eq(transactionsTable.id, data.id),
        eq(transactionsTable.userId, userId),
      ),
    )
    .limit(1);

  const nextTransactionType =
    existingTransaction?.transactionType === "transfer" ||
    existingTransaction?.transactionType === "adjustment"
      ? existingTransaction.transactionType
      : category.type;

  await db
    .update(transactionsTable)
    .set({
      description: data.description,
      amount: data.amount.toString(),
      transactionDate: data.transactionDate,
      categoryId: data.categoryId,
      transactionType: nextTransactionType,
    })
    .where(
      and(
        eq(transactionsTable.id, data.id),
        eq(transactionsTable.userId, userId),
      ),
    );
}

export async function deleteTransaction(transactionId: number) {
  const { userId } = await auth();

  if (!userId) {
    return {
      error: true,
      message: "Unauthorized",
    };
  }

  await db
    .delete(transactionsTable)
    .where(
      and(
        eq(transactionsTable.id, transactionId),
        eq(transactionsTable.userId, userId),
      ),
    );
}
