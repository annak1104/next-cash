import { db } from "@/db";
import { categoriesTable, transactionsTable } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
import "server-only";

export async function getRecentTransactions() {
  const { userId } = await auth();

  if (!userId) {
    return [];
  }

  const transactions = await db
    .select({
      id: transactionsTable.id,
      description: transactionsTable.description,
      amount: transactionsTable.amount,
      transactionDate: transactionsTable.transactionDate,
      category: categoriesTable.name,
      transactionType: transactionsTable.transactionType,
      transferId: transactionsTable.transferId,
      fromWalletId: transactionsTable.fromWalletId,
      walletId: transactionsTable.walletId,
    })
    .from(transactionsTable)
    .where(eq(transactionsTable.userId, userId))
    .orderBy(desc(transactionsTable.transactionDate))
    .leftJoin(
      categoriesTable,
      eq(transactionsTable.categoryId, categoriesTable.id),
    );

  // Filter out duplicate transfer transactions
  // For transfers, show only the "from" wallet transaction (the outgoing one)
  const seenTransferIds = new Set<number>();
  const filteredTransactions = transactions.filter((tx) => {
    // If it's a transfer transaction
    if (tx.transferId) {
      // If we've already seen this transfer, skip it
      if (seenTransferIds.has(tx.transferId)) {
        return false;
      }
      // For transfers, only show the "from" wallet transaction
      // (the one where walletId matches fromWalletId)
      if (tx.walletId === tx.fromWalletId) {
        seenTransferIds.add(tx.transferId);
        return true;
      }
      return false;
    }
    // For non-transfer transactions, include them
    return true;
  });

  return filteredTransactions.slice(0, 5);
}
