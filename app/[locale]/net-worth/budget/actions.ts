"use server";

import { db } from "@/db";
import { transactionsTable, transfersTable, walletsTable } from "@/db/schema";
import { walletSchema } from "@/validation/walletSchema";
import { auth } from "@clerk/nextjs/server";
import { and, eq, or } from "drizzle-orm";

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

export const deleteWallet = async (walletId: number) => {
  const { userId } = await auth();

  if (!userId) {
    return {
      error: true,
      message: "Unauthorized",
    };
  }

  if (!Number.isInteger(walletId) || walletId <= 0) {
    return {
      error: true,
      message: "Invalid account",
    };
  }

  const [wallet] = await db
    .select({ id: walletsTable.id })
    .from(walletsTable)
    .where(and(eq(walletsTable.id, walletId), eq(walletsTable.userId, userId)))
    .limit(1);

  if (!wallet) {
    return {
      error: true,
      message: "Account not found",
    };
  }

  try {
    await db
      .delete(transactionsTable)
      .where(
        and(
          eq(transactionsTable.userId, userId),
          or(
            eq(transactionsTable.walletId, walletId),
            eq(transactionsTable.fromWalletId, walletId),
            eq(transactionsTable.toWalletId, walletId),
          ),
        ),
      );

    await db
      .delete(transfersTable)
      .where(
        and(
          eq(transfersTable.userId, userId),
          or(
            eq(transfersTable.fromWalletId, walletId),
            eq(transfersTable.toWalletId, walletId),
          ),
        ),
      );

    await db
      .delete(walletsTable)
      .where(
        and(eq(walletsTable.id, walletId), eq(walletsTable.userId, userId)),
      );
  } catch (error) {
    console.error("Failed to delete wallet:", error);
    return {
      error: true,
      message: "Failed to delete account",
    };
  }

  return {
    error: false,
  };
};
