"server-only";

import { db } from "@/db";
import { portfoliosTable } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { asc, eq } from "drizzle-orm";

export default async function getPortfolios() {
  const { userId } = await auth();

  if (!userId) return [];

  const portfolios = await db
    .select()
    .from(portfoliosTable)
    .where(eq(portfoliosTable.userId, userId))
    .orderBy(asc(portfoliosTable.name));

  // Преобразуємо у тип Portfolio
  return portfolios.map((p) => ({
    id: p.id.toString(),
    name: p.name,
    currency: p.currency,
    value: 0, // тимчасово 0
    dailyPL: 0, // тимчасово 0
    dailyPLPercent: 0, // тимчасово 0
  }));
}
