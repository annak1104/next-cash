"server-only";

import getHoldings from "./getHoldings";
import { getCryptoPrices } from "./getCryptoPrices";
import { HoldingRow } from "@/types/HoldingRow";

export async function getPortfolioHoldings(
  portfolioId?: number,
): Promise<HoldingRow[]> {
  const holdings = await getHoldings(portfolioId);

  if (holdings.length === 0) {
    return [];
  }

  // Get all crypto coin IDs
  const cryptoIds = holdings
    .filter((h) => h.assetType === "crypto" && h.coinGeckoId)
    .map((h) => h.coinGeckoId!);

  // Fetch current prices from CoinGecko
  const prices = await getCryptoPrices(cryptoIds);

  // Calculate total portfolio value for allocation
  let totalPortfolioValue = 0;
  const holdingsWithValues = holdings.map((holding) => {
    const quantity = Number(holding.quantity);
    const avgPrice = Number(holding.avgPrice);
    const costBasis = quantity * avgPrice;

    // Get current price
    let currentPrice = Number(holding.currentPrice) || 0;
    let change24h = 0;

    if (holding.assetType === "crypto" && holding.coinGeckoId) {
      const priceData = prices[holding.coinGeckoId];
      if (priceData) {
        currentPrice = priceData.price;
        change24h = priceData.change24h;
      }
    } else if (holding.assetType === "stock") {
      // For stocks, use stored currentPrice or avgPrice as fallback
      currentPrice = Number(holding.currentPrice) || avgPrice;
      // Stocks don't have 24h change from CoinGecko, would need stock API
      change24h = 0;
    }

    const marketValue = quantity * currentPrice;
    const unrealizedPL = marketValue - costBasis;
    const unrealizedPLPercent = costBasis > 0 ? (unrealizedPL / costBasis) * 100 : 0;

    // Calculate daily P&L (approximation based on 24h change)
    const previousValue = marketValue / (1 + change24h / 100);
    const dailyPL = marketValue - previousValue;

    totalPortfolioValue += marketValue;

    return {
      id: holding.id.toString(),
      symbol: holding.symbol,
      name: holding.name,
      image: holding.image || undefined,
      quantity,
      currentPrice,
      change24h,
      dailyPL,
      avgPrice,
      invested: costBasis,
      marketValue,
      unrealizedPL,
      allocation: 0, // Will calculate after we have total
      assetType: holding.assetType,
    };
  });

  // Calculate allocation percentages
  return holdingsWithValues.map((holding) => ({
    ...holding,
    allocation:
      totalPortfolioValue > 0
        ? (holding.marketValue / totalPortfolioValue) * 100
        : 0,
  }));
}

