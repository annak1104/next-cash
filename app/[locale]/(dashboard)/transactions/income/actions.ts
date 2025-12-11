"use server";

import { db } from "@/db";
import { categoriesTable, transactionsTable } from "@/db/schema";
import { transactionSchema } from "@/validation/transactionSchema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

export const createIncomeTransaction = async (data: {
  amount: number;
  transactionDate: string;
  description: string;
  categoryId: number;
  walletId: number;
}) => {
  const { userId } = await auth();

  if (!userId) {
    return {
      error: true,
      message: "Unauthorized",
    };
  }

  // Verify category is income type
  const [category] = await db
    .select()
    .from(categoriesTable)
    .where(eq(categoriesTable.id, data.categoryId))
    .limit(1);

  if (!category || category.type !== "income") {
    return {
      error: true,
      message: "Invalid category type",
    };
  }

  const validation = transactionSchema.safeParse({
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
      walletId: data.walletId,
      transactionDate: data.transactionDate,
    })
    .returning();

  return {
    id: transaction.id,
  };
};

