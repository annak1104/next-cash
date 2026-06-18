import { db } from "@/db";
import { categoriesTable, transactionsTable, walletsTable } from "@/db/schema";
import { getUsdExchangeRates } from "@/lib/exchange-rates-server";
import { convertCurrencyFromRates } from "@/lib/currency-converter";
import {
  getEffectiveTransactionType,
  isCashflowTransaction,
} from "@/lib/transaction-utils";
import { auth } from "@clerk/nextjs/server";
import { and, eq, sql } from "drizzle-orm";
import "server-only";

export async function getAnnualCashflow(year: number) {
  const { userId } = await auth();

  if (!userId) {
    return [];
  }

  const transactions = await db
    .select({
      month: sql<number>`EXTRACT(MONTH FROM ${transactionsTable.transactionDate})`,
      amount: transactionsTable.amount,
      transactionType: transactionsTable.transactionType,
      transferId: transactionsTable.transferId,
      categoryName: categoriesTable.name,
      categoryType: categoriesTable.type,
      walletCurrency: walletsTable.currency,
    })
    .from(transactionsTable)
    .leftJoin(
      categoriesTable,
      eq(transactionsTable.categoryId, categoriesTable.id),
    )
    .leftJoin(walletsTable, eq(transactionsTable.walletId, walletsTable.id))
    .where(
      and(
        eq(transactionsTable.userId, userId),
        sql`EXTRACT(YEAR FROM ${transactionsTable.transactionDate}) = ${year}`,
      ),
    );

  const rates = await getUsdExchangeRates().catch((error) => {
    console.error("Failed to load exchange rates for annual cashflow:", error);
    return { USD: 1 };
  });

  const annualCashflow: {
    month: number;
    income: number;
    expenses: number;
    investments: number;
  }[] = [];

  for (let i = 1; i <= 12; i++) {
    annualCashflow.push({
      month: i,
      income: 0,
      expenses: 0,
      investments: 0,
    });
  }

  for (const transaction of transactions) {
    const type = getEffectiveTransactionType({
      transactionType: transaction.transactionType,
      categoryType: transaction.categoryType,
      transferId: transaction.transferId,
    });

    if (!isCashflowTransaction(type)) {
      continue;
    }

    const monthIndex = Number(transaction.month) - 1;
    const amountUsd = convertCurrencyFromRates(
      Number(transaction.amount),
      transaction.walletCurrency ?? "USD",
      "USD",
      rates,
    );

    if (type === "income") {
      annualCashflow[monthIndex].income += amountUsd;
    } else if (transaction.categoryName === "Investments") {
      annualCashflow[monthIndex].investments += amountUsd;
    } else {
      annualCashflow[monthIndex].expenses += amountUsd;
    }
  }

  return annualCashflow;
}
