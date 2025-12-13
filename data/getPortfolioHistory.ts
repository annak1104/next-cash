"server-only";

import { db } from "@/db";
import { holdingsTable, portfoliosTable, tradesTable } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, asc, eq, lte } from "drizzle-orm";
import { getCryptoPrices } from "./getCryptoPrices";
import { format, subDays } from "date-fns";

type PortfolioValuePoint = {
  date: string;
  value: number;
};

type HoldingState = {
  symbol: string;
  assetType: string;
  quantity: number;
  avgPrice: number;
  coinGeckoId: string | null;
  lastPrice: number; // Last known price from trades or current price
};

export async function getPortfolioHistory(
  portfolioId?: number,
  days: number = 7,
): Promise<PortfolioValuePoint[]> {
  const { userId } = await auth();

  if (!userId) {
    return [];
  }

  const endDate = new Date();
  const startDate = subDays(endDate, days);

  // Get all portfolios if portfolioId is not specified
  const portfolioWhereConditions = [eq(portfoliosTable.userId, userId)];
  if (portfolioId) {
    portfolioWhereConditions.push(eq(portfoliosTable.id, portfolioId));
  }

  const portfolios = await db
    .select({
      id: portfoliosTable.id,
    })
    .from(portfoliosTable)
    .where(and(...portfolioWhereConditions));

  if (portfolios.length === 0) {
    return [];
  }

  const portfolioIds = portfolios.map((p) => p.id);

  // Get ALL trades up to endDate to reconstruct state
  // We need trades from before startDate too to know initial holdings
  const allTrades = await db
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
        ...(portfolioId
          ? [eq(tradesTable.portfolioId, portfolioId)]
          : []),
      ),
    )
    .orderBy(asc(tradesTable.tradeDate), asc(tradesTable.id));

  // Get current holdings to get current prices and coinGeckoIds
  const currentHoldings = await db
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
    .where(
      and(
        eq(portfoliosTable.userId, userId),
        ...(portfolioId ? [eq(holdingsTable.portfolioId, portfolioId)] : []),
      ),
    );

  // Get crypto prices for current holdings
  const cryptoIds = [
    ...new Set(
      currentHoldings
        .filter((h) => h.assetType === "crypto" && h.coinGeckoId)
        .map((h) => h.coinGeckoId!),
    ),
  ];

  const cryptoPrices = await getCryptoPrices(cryptoIds);

  // Build a map of current prices and 24h changes for each asset
  const currentPrices = new Map<string, number>();
  const priceChanges24h = new Map<string, number>();
  
  for (const holding of currentHoldings) {
    const key = `${holding.portfolioId}-${holding.symbol}-${holding.assetType}`;
    let price = Number(holding.currentPrice) || Number(holding.avgPrice) || 0;
    let change24h = 0;

    if (holding.assetType === "crypto" && holding.coinGeckoId) {
      const priceData = cryptoPrices[holding.coinGeckoId];
      if (priceData) {
        price = priceData.price;
        change24h = priceData.change24h;
      }
    }

    currentPrices.set(key, price);
    priceChanges24h.set(key, change24h);
  }

  // Build a map of trade prices by date for each asset
  // This helps us use actual trade prices when available
  const tradePricesByDate = new Map<string, Map<string, number>>();
  // Also track the most recent trade price for each asset (for price estimation)
  const lastTradePrice = new Map<string, number>();
  
  for (const trade of allTrades) {
    const key = `${trade.portfolioId}-${trade.symbol}-${trade.assetType}`;
    const tradeDateStr = format(new Date(trade.tradeDate), "yyyy-MM-dd");
    const tradePrice = Number(trade.price);
    
    if (!tradePricesByDate.has(tradeDateStr)) {
      tradePricesByDate.set(tradeDateStr, new Map());
    }
    tradePricesByDate.get(tradeDateStr)!.set(key, tradePrice);
    
    // Update last known trade price (trades are ordered chronologically)
    lastTradePrice.set(key, tradePrice);
  }

  // Calculate portfolio value at different points in time
  const dataPoints: PortfolioValuePoint[] = [];
  const daysToCalculate = Math.min(days, 365); // Support up to 1 year

  // If no trades exist, we'll still show current value for all dates
  if (allTrades.length === 0) {
    // Calculate current portfolio value
    let currentValue = 0;
    for (const holding of currentHoldings) {
      const key = `${holding.portfolioId}-${holding.symbol}-${holding.assetType}`;
      const quantity = Number(holding.quantity);
      const price = currentPrices.get(key) || Number(holding.currentPrice) || Number(holding.avgPrice) || 0;
      currentValue += quantity * price;
    }

    // Return same value for all dates
    for (let i = 0; i <= daysToCalculate; i++) {
      const date = subDays(endDate, daysToCalculate - i);
      dataPoints.push({
        date: format(date, "yyyy-MM-dd"),
        value: currentValue,
      });
    }
    return dataPoints;
  }

  // Track holdings state as we go forward from startDate to endDate, applying trades chronologically
  for (let i = 0; i <= daysToCalculate; i++) {
    const date = subDays(endDate, daysToCalculate - i);
    const dateStr = format(date, "yyyy-MM-dd");

    // Reconstruct holdings state up to this date
    const holdingsState = new Map<string, HoldingState>();

    // Apply all trades up to this date
    for (const trade of allTrades) {
      const tradeDateStr = format(new Date(trade.tradeDate), "yyyy-MM-dd");
      if (tradeDateStr > dateStr) {
        break; // Skip trades after this date
      }

      const key = `${trade.portfolioId}-${trade.symbol}-${trade.assetType}`;
      const quantity = Number(trade.quantity);
      const price = Number(trade.price);

      if (!holdingsState.has(key)) {
        holdingsState.set(key, {
          symbol: trade.symbol,
          assetType: trade.assetType,
          quantity: 0,
          avgPrice: 0,
          coinGeckoId: trade.coinGeckoId,
          lastPrice: price,
        });
      }

      const holding = holdingsState.get(key)!;

      if (trade.type === "buy") {
        // Calculate new average price
        const totalCost = holding.quantity * holding.avgPrice + quantity * price;
        const totalQuantity = holding.quantity + quantity;
        holding.avgPrice = totalQuantity > 0 ? totalCost / totalQuantity : price;
        holding.quantity = totalQuantity;
        holding.lastPrice = price;
      } else if (trade.type === "sell") {
        // Reduce quantity, keep average price
        holding.quantity = Math.max(0, holding.quantity - quantity);
        holding.lastPrice = price;
      } else if (trade.type === "revaluation") {
        // Update price only
        holding.lastPrice = price;
      }
    }

    // Calculate portfolio value on this date
    let totalValue = 0;

    // Get days from end date to estimate price changes
    const daysFromEnd = daysToCalculate - i;

    for (const [key, holding] of holdingsState.entries()) {
      if (holding.quantity <= 0) continue;

      let price = holding.lastPrice;

      // Priority 1: Check if we have a trade price on this exact date
      const tradesOnDate = tradePricesByDate.get(dateStr);
      if (tradesOnDate && tradesOnDate.has(key)) {
        price = tradesOnDate.get(key)!;
      } else {
        // Priority 2: Use the most recent trade price for this asset (if available)
        const lastKnownPrice = lastTradePrice.get(key);
        
        // Priority 3: Try to estimate from current price and 24h change
        const currentPrice = currentPrices.get(key);
        const change24h = priceChanges24h.get(key) || 0;

        if (lastKnownPrice && lastKnownPrice > 0) {
          // Use last known trade price, adjusted by 24h change if available
          if (currentPrice && currentPrice > 0 && change24h !== 0 && daysFromEnd > 0) {
            // Estimate: if we know the current price and 24h change,
            // and we have a last trade price, interpolate
            const priceDiff = currentPrice - lastKnownPrice;
            const daysSinceLastTrade = daysFromEnd; // Approximation
            // Simple linear interpolation
            price = lastKnownPrice + (priceDiff * (daysFromEnd / (daysFromEnd + 1)));
          } else {
            price = lastKnownPrice;
          }
        } else if (currentPrice && currentPrice > 0) {
          // Estimate historical price by working backwards from current price
          if (change24h !== 0 && daysFromEnd > 0) {
            // Convert 24h change to daily change rate
            const dailyChangeRate = change24h / 100;
            // Estimate price N days ago using compound formula
            price = currentPrice / Math.pow(1 + dailyChangeRate, daysFromEnd);
          } else {
            price = currentPrice;
          }
        } else if (holding.lastPrice > 0) {
          // Use last price from holding state
          price = holding.lastPrice;
        } else {
          // Fallback: use average price as estimate
          price = holding.avgPrice > 0 ? holding.avgPrice : 0;
        }
      }

      totalValue += holding.quantity * price;
    }

    dataPoints.push({
      date: dateStr,
      value: totalValue,
    });
  }

  return dataPoints;
}
