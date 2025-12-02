"use server";

import { db } from "@/db";
import { portfoliosTable } from "@/db/schema";
import { portfolioSchema } from "@/validation/portfolioSchema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";

export const createPortfolio = async (data: {
  name: string;
  description?: string;
  currency: string;
}) => {
  const { userId } = await auth();

  if (!userId) {
    return {
      error: true,
      message: "Unauthorized",
    };
  }

  const validation = portfolioSchema.safeParse(data);
  if (!validation.success) {
    return {
      error: true,
      message: validation.error.issues[0].message,
    };
  }

  const [portfolio] = await db
    .insert(portfoliosTable)
    .values({
      userId,
      name: data.name,
      description: data.description || null,
      currency: data.currency,
    })
    .returning();

  return {
    id: portfolio.id,
  };
};

export const deletePortfolio = async (portfolioId: number) => {
  const { userId } = await auth();

  if (!userId) {
    return {
      error: true,
      message: "Unauthorized",
    };
  }

  // TODO: Check if portfolio has holdings and handle deletion
  await db
    .delete(portfoliosTable)
    .where(
      and(
        eq(portfoliosTable.id, portfolioId),
        eq(portfoliosTable.userId, userId),
      ),
    );

  return { success: true };
};

