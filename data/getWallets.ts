"server-only";

import { db } from "@/db";
import { walletsTable } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { asc, eq } from "drizzle-orm";

export default async function getWallets() {
  const { userId } = await auth();

  if (!userId) {
    return [];
  }

  const wallets = await db
    .select()
    .from(walletsTable)
    .where(eq(walletsTable.userId, userId))
    .orderBy(asc(walletsTable.name));

  return wallets;
}

