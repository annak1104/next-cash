"server-only";

import { db } from "@/db";
import {
  categoriesTable,
  transactionsTable,
  holdingsTable,
  portfoliosTable,
  tradesTable,
} from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq, sql, lte, asc } from "drizzle-orm";
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from "date-fns";
import { getCryptoPrices } from "./getCryptoPrices";

export type MonthlyNetWorthData = {
  month: number;
  year: number;
  cash: number;
  stocks: number;
  crypto: number;
  total: number;
};

export async function getMonthlyNetWorth(
  months: number = 12,
): Promise<MonthlyNetWorthData[]> {
  const { userId } = await auth();

  if (!userId) {
    return [];
  }

  const endDate = new Date();
  const startDate = subMonths(endDate, months - 1);
  const monthsList = eachMonthOfInterval({ start: startDate, end: endDate });

  const results: MonthlyNetWorthData[] = [];

  const normalizeAssetType = (assetType: string | null | undefined) => {
    return assetType?.toLowerCase() === "crypto" ? "crypto" : "stock";
  };

  // Get all wallets
  const wallets = await db
    .select({
      id: transactionsTable.walletId,
    })
    .from(transactionsTable)
    .where(
      and(
        eq(transactionsTable.userId, userId),
        sql`${transactionsTable.walletId} IS NOT NULL`,
      ),
    )
    .groupBy(transactionsTable.walletId);

  const walletIds = wallets
    .map((w) => w.id)
    .filter((id): id is number => id !== null && id !== undefined);

  // Get all portfolios
  const portfolios = await db
    .select({
      id: portfoliosTable.id,
    })
    .from(portfoliosTable)
    .where(eq(portfoliosTable.userId, userId));

  const portfolioIds = portfolios.map((p) => p.id);

  // Get all trades for portfolio calculations
  const allTrades =
    portfolioIds.length > 0
      ? await db
          .select({
            tradeDate: tradesTable.tradeDate,
            symbol: tradesTable.symbol,
            assetType: tradesTable.assetType,
            quantity: tradesTable.quantity,
            price: tradesTable.price,
            coinGeckoId: tradesTable.coinGeckoId,
            portfolioId: tradesTable.portfolioId,
            type: tradesTable.type,
          })
          .from(tradesTable)
          .where(
            and(
              eq(tradesTable.userId, userId),
              lte(tradesTable.tradeDate, format(endDate, "yyyy-MM-dd")),
            ),
          )
          .orderBy(asc(tradesTable.tradeDate), asc(tradesTable.id))
      : [];

  // Get current holdings for price reference
  const currentHoldings =
    portfolioIds.length > 0
      ? await db
          .select({
            portfolioId: holdingsTable.portfolioId,
            symbol: holdingsTable.symbol,
            assetType: holdingsTable.assetType,
            quantity: holdingsTable.quantity,
            avgPrice: holdingsTable.avgPrice,
            currentPrice: holdingsTable.currentPrice,
            coinGeckoId: holdingsTable.coinGeckoId,
          })
          .from(holdingsTable)
          .innerJoin(
            portfoliosTable,
            eq(holdingsTable.portfolioId, portfoliosTable.id),
          )
          .where(eq(portfoliosTable.userId, userId))
      : [];

  // Get crypto prices for current holdings
  const cryptoIds = [
    ...new Set(
      currentHoldings
        .filter((h) => h.assetType === "crypto" && h.coinGeckoId)
        .map((h) => h.coinGeckoId!),
    ),
  ];

  const cryptoPrices = await getCryptoPrices(cryptoIds);

  // Build current prices map - use actual assetType from DB, not normalized
  const currentPrices = new Map<string, number>();
  for (const holding of currentHoldings) {
    // Use actual assetType from database for the key to match trades
    const key = `${holding.portfolioId}-${holding.symbol}-${holding.assetType}`;
    let price = Number(holding.currentPrice) || Number(holding.avgPrice) || 0;

    if (holding.assetType === "crypto" && holding.coinGeckoId) {
      const priceData = cryptoPrices[holding.coinGeckoId];
      if (priceData) {
        price = priceData.price;
      }
    }
    // For stocks, price is already set from currentPrice or avgPrice above

    currentPrices.set(key, price);
  }

  // Process each month
  for (const monthDate of monthsList) {
    const monthEnd = endOfMonth(monthDate);
    const monthEndStr = format(monthEnd, "yyyy-MM-dd");
    const month = monthDate.getMonth() + 1;
    const year = monthDate.getFullYear();

    // Calculate cash balance at end of month
    let cash = 0;
    if (walletIds.length > 0) {
      const cashResult = await db
        .select({
          income: sql<number>`COALESCE(SUM(CASE WHEN ${categoriesTable.type} = 'income' THEN ${transactionsTable.amount}::numeric ELSE 0 END), 0)`,
          expense: sql<number>`COALESCE(SUM(CASE WHEN ${categoriesTable.type} = 'expense' THEN ${transactionsTable.amount}::numeric ELSE 0 END), 0)`,
        })
        .from(transactionsTable)
        .leftJoin(
          categoriesTable,
          eq(transactionsTable.categoryId, categoriesTable.id),
        )
        .where(
          and(
            eq(transactionsTable.userId, userId),
            sql`${transactionsTable.walletId} IS NOT NULL`,
            lte(transactionsTable.transactionDate, monthEndStr),
          ),
        );

      if (cashResult.length > 0) {
        cash = Number(cashResult[0].income) - Number(cashResult[0].expense);
      }
    }

    // Calculate portfolio value at end of month
    let stocks = 0;
    let crypto = 0;

    if (allTrades.length > 0) {
      // Reconstruct holdings state up to month end
      const holdingsState = new Map<
        string,
        {
          portfolioId: number;
          symbol: string;
          assetType: string;
          quantity: number;
          avgPrice: number;
          coinGeckoId: string | null;
          lastPrice: number;
        }
      >();

      // Apply all trades up to month end
      for (const trade of allTrades) {
        const tradeDateStr = format(new Date(trade.tradeDate), "yyyy-MM-dd");
        if (tradeDateStr > monthEndStr) {
          break;
        }

        // Use actual assetType from database, not normalized
        const key = `${trade.portfolioId}-${trade.symbol}-${trade.assetType}`;
        const quantity = Number(trade.quantity);
        const price = Number(trade.price);
        const normalizedType = normalizeAssetType(trade.assetType);

        if (!holdingsState.has(key)) {
          holdingsState.set(key, {
            portfolioId: trade.portfolioId,
            symbol: trade.symbol,
            assetType: normalizedType, // Store normalized for categorization
            quantity: 0,
            avgPrice: 0,
            coinGeckoId: trade.coinGeckoId,
            lastPrice: price,
          });
        }

        const holding = holdingsState.get(key)!;

        if (trade.type === "buy") {
          const totalCost = holding.quantity * holding.avgPrice + quantity * price;
          const totalQuantity = holding.quantity + quantity;
          holding.avgPrice = totalQuantity > 0 ? totalCost / totalQuantity : price;
          holding.quantity = totalQuantity;
          holding.lastPrice = price;
        } else if (trade.type === "sell") {
          holding.quantity = Math.max(0, holding.quantity - quantity);
          holding.lastPrice = price;
        } else if (trade.type === "revaluation") {
          holding.lastPrice = price;
        }
      }

      // Calculate portfolio value
      for (const [key, holding] of holdingsState.entries()) {
        if (holding.quantity <= 0) continue;

        // Use last trade price or current price as fallback
        let price = holding.lastPrice;
        const currentPrice = currentPrices.get(key);
        if (currentPrice && currentPrice > 0) {
          price = currentPrice;
        }

        // If still no price, try to get from current holdings directly
        if (price <= 0) {
          // Extract assetType from key (it's the last part after the last dash)
          const keyParts = key.split("-");
          const assetTypeFromKey = keyParts[keyParts.length - 1];
          
          for (const ch of currentHoldings) {
            if (
              ch.portfolioId === holding.portfolioId &&
              ch.symbol === holding.symbol &&
              ch.assetType === assetTypeFromKey
            ) {
              price = Number(ch.currentPrice) || Number(ch.avgPrice) || 0;
              break;
            }
          }
        }

        const value = holding.quantity * price;

        if (holding.assetType === "stock") {
          stocks += value;
        } else if (holding.assetType === "crypto") {
          crypto += value;
        }
      }
    } else if (currentHoldings.length > 0) {
      // No trades, use current holdings directly
      for (const holding of currentHoldings) {
        const assetType = normalizeAssetType(holding.assetType);
        const quantity = Number(holding.quantity);
        let price = Number(holding.currentPrice) || Number(holding.avgPrice) || 0;

        // For crypto, try to get latest price from API
        if (assetType === "crypto" && holding.coinGeckoId) {
          const priceData = cryptoPrices[holding.coinGeckoId];
          if (priceData) {
            price = priceData.price;
          }
        }
        // For stocks, use currentPrice or avgPrice (already set above)

        const value = quantity * price;

        if (assetType === "stock") {
          stocks += value;
        } else if (assetType === "crypto") {
          crypto += value;
        }
      }
    }

    const total = cash + stocks + crypto;

    results.push({
      month,
      year,
      cash,
      stocks,
      crypto,
      total,
    });
  }

  return results;
}

