"server-only";

import { db } from "@/db";
import { portfoliosTable, tradesTable } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, desc, eq, gte, lte } from "drizzle-orm";

export type TradeRow = {
  id: number;
  portfolioId: number;
  portfolioName: string;
  type: "buy" | "sell" | "revaluation";
  tradeDate: Date;
  symbol: string;
  name: string;
  quantity: number;
  price: number;
  fee: number;
  totalValue: number;
};

export async function getTrades(options?: {
  portfolioId?: number;
  startDate?: string; // yyyy-MM-dd
  endDate?: string; // yyyy-MM-dd
}) {
  const { userId } = await auth();

  if (!userId) return [];

  const whereClauses = [eq(tradesTable.userId, userId)];

  if (options?.portfolioId) {
    whereClauses.push(eq(tradesTable.portfolioId, options.portfolioId));
  }

  if (options?.startDate) {
    whereClauses.push(gte(tradesTable.tradeDate, options.startDate));
  }

  if (options?.endDate) {
    whereClauses.push(lte(tradesTable.tradeDate, options.endDate));
  }

  const rows = await db
    .select({
      id: tradesTable.id,
      portfolioId: tradesTable.portfolioId,
      portfolioName: portfoliosTable.name,
      type: tradesTable.type,
      tradeDate: tradesTable.tradeDate,
      symbol: tradesTable.symbol,
      name: tradesTable.name,
      quantity: tradesTable.quantity,
      price: tradesTable.price,
      fee: tradesTable.fee,
      totalValue: tradesTable.totalValue,
    })
    .from(tradesTable)
    .innerJoin(portfoliosTable, eq(tradesTable.portfolioId, portfoliosTable.id))
    .where(and(...whereClauses))
    .orderBy(desc(tradesTable.tradeDate), desc(tradesTable.id));

  return rows.map((row) => ({
    ...row,
    tradeDate: new Date(row.tradeDate), // <-- FIX HERE
    quantity: Number(row.quantity),
    price: Number(row.price),
    fee: Number(row.fee ?? 0),
    totalValue: Number(row.totalValue),
  })) as TradeRow[];
}




