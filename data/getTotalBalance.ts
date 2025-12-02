"server-only";

import { db } from "@/db";
import { categoriesTable, transactionsTable } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq, sql } from "drizzle-orm";

export async function getTotalBalance(): Promise<number> {
  const { userId } = await auth();

  if (!userId) {
    return 0;
  }

  // Get all transactions with their categories, only including transactions with wallets
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
        eq(transactionsTable.userId, userId),
        sql`${transactionsTable.walletId} IS NOT NULL`,
      ),
    );

  if (result.length === 0) {
    return 0;
  }

  const totalBalance = Number(result[0].income) - Number(result[0].expense);
  return totalBalance;
}

