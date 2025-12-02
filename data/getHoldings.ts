"server-only";

import { db } from "@/db";
import { holdingsTable, portfoliosTable } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";

export default async function getHoldings(portfolioId?: number) {
  const { userId } = await auth();

  if (!userId) {
    return [];
  }

  const whereConditions = [eq(portfoliosTable.userId, userId)];
  
  if (portfolioId) {
    whereConditions.push(eq(holdingsTable.portfolioId, portfolioId));
  }

  const holdings = await db
    .select({
      id: holdingsTable.id,
      portfolioId: holdingsTable.portfolioId,
      assetType: holdingsTable.assetType,
      symbol: holdingsTable.symbol,
      name: holdingsTable.name,
      image: holdingsTable.image,
      quantity: holdingsTable.quantity,
      avgPrice: holdingsTable.avgPrice,
      currentPrice: holdingsTable.currentPrice,
      coinGeckoId: holdingsTable.coinGeckoId,
      portfolioName: portfoliosTable.name,
      portfolioCurrency: portfoliosTable.currency,
    })
    .from(holdingsTable)
    .innerJoin(
      portfoliosTable,
      eq(holdingsTable.portfolioId, portfoliosTable.id),
    )
    .where(and(...whereConditions));

  return holdings;
}

