"server-only";

import { db } from "@/db";
import { portfoliosTable } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { asc, eq } from "drizzle-orm";
import { getPortfolioStats } from "./getPortfolioStats";

export default async function getPortfolios() {
  const { userId } = await auth();

  if (!userId) return [];

  const portfolios = await db
    .select()
    .from(portfoliosTable)
    .where(eq(portfoliosTable.userId, userId))
    .orderBy(asc(portfoliosTable.name));

  // For each portfolio, compute its own stats (value, daily P&L, etc.)
  const portfoliosWithStats = await Promise.all(
    portfolios.map(async (p) => {
      const stats = await getPortfolioStats(p.id);

      return {
        id: p.id.toString(),
        name: p.name,
        currency: p.currency,
        value: stats.totalValue,
        dailyPL: stats.dailyPL,
        dailyPLPercent: stats.dailyPLPercent,
      };
    }),
  );

  return portfoliosWithStats;
}

