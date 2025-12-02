"server-only";

import { db } from "@/db";
import { categoriesTable, transactionsTable } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq, sql } from "drizzle-orm";

export default async function getWalletBalance(walletId: number): Promise<number> {
  const { userId } = await auth();

  if (!userId) {
    return 0;
  }

  const result = await db
    .select({
      income: sql<number>`COALESCE(SUM(CASE WHEN ${categoriesTable.type} = 'income' THEN ${transactionsTable.amount}::numeric ELSE 0 END), 0)`,
      expense: sql<number>`COALESCE(SUM(CASE WHEN ${categoriesTable.type} = 'expense' THEN ${transactionsTable.amount}::numeric ELSE 0 END), 0)`,
    })
    .from(transactionsTable)
    .leftJoin(
      categoriesTable,
      eq(transactionsTable.categoryId, categoriesTable.id),
    )
    .where(
      and(
        eq(transactionsTable.walletId, walletId),
        eq(transactionsTable.userId, userId),
      ),
    );

  if (result.length === 0) {
    return 0;
  }

  const balance = Number(result[0].income) - Number(result[0].expense);
  return balance;
}

export async function getWalletBalances(): Promise<
  Record<number, number>
> {
  const { userId } = await auth();

  if (!userId) {
    return {};
  }

  const result = await db
    .select({
      walletId: transactionsTable.walletId,
      income: sql<number>`COALESCE(SUM(CASE WHEN ${categoriesTable.type} = 'income' THEN ${transactionsTable.amount}::numeric ELSE 0 END), 0)`,
      expense: sql<number>`COALESCE(SUM(CASE WHEN ${categoriesTable.type} = 'expense' THEN ${transactionsTable.amount}::numeric ELSE 0 END), 0)`,
    })
    .from(transactionsTable)
    .leftJoin(
      categoriesTable,
      eq(transactionsTable.categoryId, categoriesTable.id),
    )
    .where(
      and(
        eq(transactionsTable.userId, userId),
        sql`${transactionsTable.walletId} IS NOT NULL`,
      ),
    )
    .groupBy(transactionsTable.walletId);

  const balances: Record<number, number> = {};

  for (const row of result) {
    if (row.walletId !== null && row.walletId !== undefined) {
      balances[row.walletId] = Number(row.income) - Number(row.expense);
    }
  }

  return balances;
}

