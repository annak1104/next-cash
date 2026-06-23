"server-only";

import { db } from "@/db";
import {
  categoriesTable,
  holdingsTable,
  portfoliosTable,
  tradesTable,
  transactionsTable,
  walletsTable,
} from "@/db/schema";
import { convertCurrencyFromRates } from "@/lib/currency-converter";
import { getUsdExchangeRates } from "@/lib/exchange-rates-server";
import { auth } from "@clerk/nextjs/server";
import { eachMonthOfInterval, endOfMonth, format, subMonths } from "date-fns";
import { and, asc, eq, lte, sql } from "drizzle-orm";
import { getCryptoPrices } from "./getCryptoPrices";

export type MonthlyNetWorthData = {
  month: number;
  year: number;
  cash: number;
  stocks: number;
  crypto: number;
  total: number;
};

type AssetClass = "crypto" | "stock";

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
  const rates = await getUsdExchangeRates().catch((error) => {
    console.error(
      "Failed to load exchange rates for monthly net worth:",
      error,
    );
    return { USD: 1 };
  });

  const normalizeAssetType = (
    assetType: string | null | undefined,
  ): AssetClass => {
    return assetType?.toLowerCase() === "crypto" ? "crypto" : "stock";
  };
  const getAssetKey = (
    portfolioId: number,
    symbol: string,
    assetType: string | null | undefined,
  ) => `${portfolioId}-${symbol}-${normalizeAssetType(assetType)}`;

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

  // Build current prices map for all assets in current holdings.
  const currentPrices = new Map<string, number>();
  for (const holding of currentHoldings) {
    const key = getAssetKey(
      holding.portfolioId,
      holding.symbol,
      holding.assetType,
    );
    let price = Number(holding.currentPrice) || Number(holding.avgPrice) || 0;

    if (holding.assetType === "crypto" && holding.coinGeckoId) {
      const priceData = cryptoPrices[holding.coinGeckoId];
      if (priceData) {
        price = priceData.price;
      }
    }
    currentPrices.set(key, price);
  }

  const tradedAssetKeys = new Set(
    allTrades.map((trade) =>
      getAssetKey(trade.portfolioId, trade.symbol, trade.assetType),
    ),
  );

  const getCurrentHoldingPrice = (
    holding: (typeof currentHoldings)[number],
  ) => {
    const key = getAssetKey(
      holding.portfolioId,
      holding.symbol,
      holding.assetType,
    );

    return (
      currentPrices.get(key) ||
      Number(holding.currentPrice) ||
      Number(holding.avgPrice) ||
      0
    );
  };

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
          walletId: transactionsTable.walletId,
          walletCurrency: walletsTable.currency,
          income: sql<number>`COALESCE(SUM(CASE
            WHEN (${transactionsTable.transactionType} = 'transfer' OR ${transactionsTable.transferId} IS NOT NULL)
              AND ${transactionsTable.toWalletId} = ${transactionsTable.walletId}
            THEN ${transactionsTable.amount}::numeric
            WHEN (${transactionsTable.transactionType} IS NULL OR ${transactionsTable.transactionType} != 'transfer')
              AND ${transactionsTable.transferId} IS NULL
              AND ${categoriesTable.type} = 'income'
            THEN ${transactionsTable.amount}::numeric
            ELSE 0
          END), 0)`,
          expense: sql<number>`COALESCE(SUM(CASE
            WHEN (${transactionsTable.transactionType} = 'transfer' OR ${transactionsTable.transferId} IS NOT NULL)
              AND ${transactionsTable.fromWalletId} = ${transactionsTable.walletId}
            THEN ${transactionsTable.amount}::numeric
            WHEN (${transactionsTable.transactionType} IS NULL OR ${transactionsTable.transactionType} != 'transfer')
              AND ${transactionsTable.transferId} IS NULL
              AND ${categoriesTable.type} = 'expense'
            THEN ${transactionsTable.amount}::numeric
            ELSE 0
          END), 0)`,
        })
        .from(transactionsTable)
        .leftJoin(
          categoriesTable,
          eq(transactionsTable.categoryId, categoriesTable.id),
        )
        .leftJoin(walletsTable, eq(transactionsTable.walletId, walletsTable.id))
        .where(
          and(
            eq(transactionsTable.userId, userId),
            sql`${transactionsTable.walletId} IS NOT NULL`,
            lte(transactionsTable.transactionDate, monthEndStr),
          ),
        )
        .groupBy(transactionsTable.walletId, walletsTable.currency);

      for (const walletCash of cashResult) {
        const walletBalance =
          Number(walletCash.income) - Number(walletCash.expense);
        cash += convertCurrencyFromRates(
          walletBalance,
          walletCash.walletCurrency ?? "USD",
          "USD",
          rates,
        );
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

        const key = getAssetKey(
          trade.portfolioId,
          trade.symbol,
          trade.assetType,
        );
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
          const totalCost =
            holding.quantity * holding.avgPrice + quantity * price;
          const totalQuantity = holding.quantity + quantity;
          holding.avgPrice =
            totalQuantity > 0 ? totalCost / totalQuantity : price;
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

        let price = holding.lastPrice;
        const currentPrice = currentPrices.get(key);
        if (currentPrice && currentPrice > 0) {
          price = currentPrice;
        }

        // If still no price, try to get from current holdings directly.
        if (price <= 0) {
          for (const ch of currentHoldings) {
            if (
              getAssetKey(ch.portfolioId, ch.symbol, ch.assetType) === key &&
              ch.portfolioId === holding.portfolioId &&
              ch.symbol === holding.symbol
            ) {
              price = getCurrentHoldingPrice(ch);
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

      // Include current holdings that have no trade rows. This covers imported
      // or previously created positions where the holding table is the only
      // available source of truth for the asset value.
      for (const holding of currentHoldings) {
        const key = getAssetKey(
          holding.portfolioId,
          holding.symbol,
          holding.assetType,
        );
        if (tradedAssetKeys.has(key)) continue;

        const assetType = normalizeAssetType(holding.assetType);
        const quantity = Number(holding.quantity);
        const price = getCurrentHoldingPrice(holding);
        const value = quantity * price;

        if (assetType === "stock") {
          stocks += value;
        } else {
          crypto += value;
        }
      }
    } else if (currentHoldings.length > 0) {
      // No trades, use current holdings directly
      for (const holding of currentHoldings) {
        const assetType = normalizeAssetType(holding.assetType);
        const quantity = Number(holding.quantity);
        const price = getCurrentHoldingPrice(holding);

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
