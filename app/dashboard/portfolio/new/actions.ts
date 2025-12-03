"use server";

import { db } from "@/db";
import {
  categoriesTable,
  holdingsTable,
  portfoliosTable,
  transactionsTable,
  walletsTable,
} from "@/db/schema";
import { tradeSchema } from "@/validation/tradeSchema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";

export async function createAssetTrade(rawData: any) {
  const { userId } = await auth();

  if (!userId) {
    return {
      error: true,
      message: "Unauthorized",
    };
  }

  const parseResult = tradeSchema.safeParse(rawData);
  if (!parseResult.success) {
    return {
      error: true,
      message: parseResult.error.issues[0].message,
    };
  }

  const data = parseResult.data;

  // Ensure portfolio belongs to user
  const [portfolio] = await db
    .select()
    .from(portfoliosTable)
    .where(
      and(
        eq(portfoliosTable.id, data.portfolioId),
        eq(portfoliosTable.userId, userId),
      ),
    )
    .limit(1);

  if (!portfolio) {
    return {
      error: true,
      message: "Portfolio not found",
    };
  }

  // Upsert holding
  const [existingHolding] = await db
    .select()
    .from(holdingsTable)
    .where(
      and(
        eq(holdingsTable.portfolioId, data.portfolioId),
        eq(holdingsTable.symbol, data.ticker),
        eq(holdingsTable.assetType, data.assetType),
      ),
    )
    .limit(1);

  const quantityDelta = data.type === "sell" ? -data.amount : data.amount;
  const tradeValue = data.amount * data.price + (data.fee ?? 0);

  if (data.type === "revaluation") {
    // Only update prices, do not change quantity
    if (existingHolding) {
      await db
        .update(holdingsTable)
        .set({
          avgPrice: data.price.toString(),
          currentPrice: data.price.toString(),
        })
        .where(eq(holdingsTable.id, existingHolding.id));
    } else {
      // If no holding yet, create with given price and zero quantity
      await db.insert(holdingsTable).values({
        portfolioId: data.portfolioId,
        assetType: data.assetType,
        symbol: data.ticker,
        name: data.tickerName ?? data.ticker,
        image: data.tickerImage ?? null,
        quantity: "0",
        avgPrice: data.price.toString(),
        currentPrice: data.price.toString(),
        coinGeckoId: data.tickerId ?? null,
      });
    }
  } else if (existingHolding) {
    const existingQty = Number(existingHolding.quantity);

    if (data.type === "sell" && data.amount > existingQty) {
      return {
        error: true,
        message: "Insufficient holdings to sell",
      };
    }

    const newQty = existingQty + quantityDelta;

    if (data.type === "buy") {
      const existingAvg = Number(existingHolding.avgPrice);
      const existingCost = existingQty * existingAvg;
      const newCost = tradeValue;
      const totalQty = existingQty + data.amount;
      const newAvg =
        totalQty > 0 ? (existingCost + newCost) / totalQty : data.price;

      await db
        .update(holdingsTable)
        .set({
          quantity: totalQty.toString(),
          avgPrice: newAvg.toString(),
          currentPrice: data.price.toString(),
        })
        .where(eq(holdingsTable.id, existingHolding.id));
    } else {
      // sell
      if (newQty === 0) {
        await db
          .delete(holdingsTable)
          .where(eq(holdingsTable.id, existingHolding.id));
      } else {
        await db
          .update(holdingsTable)
          .set({
            quantity: newQty.toString(),
            currentPrice: data.price.toString(),
          })
          .where(eq(holdingsTable.id, existingHolding.id));
      }
    }
  } else {
    // No existing holding
    if (data.type === "sell") {
      return {
        error: true,
        message: "Cannot sell asset that is not in portfolio",
      };
    }

    await db.insert(holdingsTable).values({
      portfolioId: data.portfolioId,
      assetType: data.assetType,
      symbol: data.ticker,
      name: data.tickerName ?? data.ticker,
      image: data.tickerImage ?? null,
      quantity: data.amount.toString(),
      avgPrice: data.price.toString(),
      currentPrice: data.price.toString(),
      coinGeckoId: data.tickerId ?? null,
    });
  }

  // Optionally create cash transaction
  if (data.updateCash && data.walletId) {
    // Ensure wallet belongs to user
    const [wallet] = await db
      .select()
      .from(walletsTable)
      .where(
        and(
          eq(walletsTable.id, data.walletId),
          eq(walletsTable.userId, userId),
        ),
      )
      .limit(1);

    if (!wallet) {
      return {
        error: true,
        message: "Wallet not found",
      };
    }

    const cashChangeBase = tradeValue * data.exchangeRate;
    const isBuy = data.type === "buy";
    const amount = cashChangeBase;

    // Pick a default expense or income category
    const [category] = await db
      .select()
      .from(categoriesTable)
      .where(
        eq(
          categoriesTable.type,
          isBuy ? ("expense" as const) : ("income" as const),
        ),
      )
      .limit(1);

    if (!category) {
      return {
        error: true,
        message: "No suitable category found for cash transaction",
      };
    }

    await db.insert(transactionsTable).values({
      userId,
      amount: amount.toString(),
      transactionDate: data.transactionDate.toISOString().slice(0, 10),
      categoryId: category.id,
      walletId: data.walletId,
      description: `${data.type === "buy" ? "Buy" : "Sell"} ${
        data.ticker
      } in portfolio ${portfolio.name}`,
      transactionType: isBuy ? "expense" : "income",
    });
  }

  return {
    error: false,
  };
}


