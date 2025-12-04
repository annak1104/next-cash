import { db } from "@/db";
import {
  categoriesTable,
  transactionsTable,
  walletsTable,
} from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { format } from "date-fns";
import { and, desc, eq, gte, inArray, lte } from "drizzle-orm";
import "server-only";

export async function getTransactionsByMonth({
  month,
  year,
}: {
  month: number;
  year: number;
}) {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }
  const earliestDate = new Date(year, month - 1, 1);
  const latestDate = new Date(year, month, 0);

  const transactions = await db
    .select({
      id: transactionsTable.id,
      description: transactionsTable.description,
      amount: transactionsTable.amount,
      transactionDate: transactionsTable.transactionDate,
      category: categoriesTable.name,
      transactionType: transactionsTable.transactionType,
      fee: transactionsTable.fee,
      walletId: transactionsTable.walletId,
      walletName: walletsTable.name,
      walletCurrency: walletsTable.currency,
      fromWalletId: transactionsTable.fromWalletId,
      toWalletId: transactionsTable.toWalletId,
    })
    .from(transactionsTable)
    .where(
      and(
        eq(transactionsTable.userId, userId),
        gte(
          transactionsTable.transactionDate,
          format(earliestDate, "yyyy-MM-dd"),
        ),
        lte(
          transactionsTable.transactionDate,
          format(latestDate, "yyyy-MM-dd"),
        ),
      ),
    )
    .orderBy(desc(transactionsTable.transactionDate))
    .leftJoin(
      categoriesTable,
      eq(transactionsTable.categoryId, categoriesTable.id),
    )
    .leftJoin(
      walletsTable,
      eq(transactionsTable.walletId, walletsTable.id),
    );

  // Get unique wallet IDs for from/to wallets
  const walletIds = new Set<number>();
  transactions.forEach((tx) => {
    if (tx.fromWalletId) walletIds.add(tx.fromWalletId);
    if (tx.toWalletId) walletIds.add(tx.toWalletId);
  });

  // Fetch wallet names in a single query
  const walletMap = new Map<number, string>();
  if (walletIds.size > 0) {
    const wallets = await db
      .select({
        id: walletsTable.id,
        name: walletsTable.name,
      })
      .from(walletsTable)
      .where(inArray(walletsTable.id, Array.from(walletIds)));

    wallets.forEach((wallet) => {
      walletMap.set(wallet.id, wallet.name);
    });
  }

  // Add wallet names to transactions
  return transactions.map((tx) => ({
    ...tx,
    fromWalletName: tx.fromWalletId ? walletMap.get(tx.fromWalletId) || null : null,
    toWalletName: tx.toWalletId ? walletMap.get(tx.toWalletId) || null : null,
  }));
}
