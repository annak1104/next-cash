"use server";

import { db } from "@/db";
import { walletsTable } from "@/db/schema";
import { walletSchema } from "@/validation/walletSchema";
import { auth } from "@clerk/nextjs/server";

export const createWallet = async (data: {
  name: string;
  currency: string;
}) => {
  const { userId } = await auth();

  if (!userId) {
    return {
      error: true,
      message: "Unauthorized",
    };
  }

  const validation = walletSchema.safeParse(data);
  if (!validation.success) {
    return {
      error: true,
      message: validation.error.issues[0].message,
    };
  }

  const [wallet] = await db
    .insert(walletsTable)
    .values({
      userId,
      name: data.name,
      currency: data.currency,
    })
    .returning();

  return {
    id: wallet.id,
  };
};

