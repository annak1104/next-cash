"use server";

import { db } from "@/db";
import { categoriesTable, transactionsTable } from "@/db/schema";
import { transactionSchema } from "@/validation/transactionSchema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

const legacyTransactionSchema = transactionSchema.omit({ walletId: true });

export const createTransaction = async (data: {
  amount: number;
  transactionDate: string;
  description: string;
  categoryId: number;
}) => {
  const { userId } = await auth();

  if (!userId) {
    return {
      error: true,
      message: "Unauthorizet",
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

  const validation = legacyTransactionSchema.safeParse({
    ...data,
    transactionDate: new Date(data.transactionDate),
  });
  if (!validation.success) {
    return {
      error: true,
      message: validation.error.issues[0].message,
    };
  }
  const [transaction] = await db
    .insert(transactionsTable)
    .values({
      userId,
      amount: data.amount.toString(),
      description: data.description,
      categoryId: data.categoryId,
      transactionDate: data.transactionDate,
      transactionType: category.type,
    })
    .returning();
  return {
    id: transaction.id,
  };
};
