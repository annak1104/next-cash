"server-only";

import { getPortfolioHoldings } from "./getPortfolioHoldings";

export async function getPortfolioStats(portfolioId?: number) {
  const holdings = await getPortfolioHoldings(portfolioId);

  if (holdings.length === 0) {
    return {
      totalValue: 0,
      dailyPL: 0,
      dailyPLPercent: 0,
      unrealizedPL: 0,
      unrealizedPLPercent: 0,
      cash: 0,
      currency: "USD",
    };
  }

  const totalValue = holdings.reduce((sum, h) => sum + h.marketValue, 0);
  const totalInvested = holdings.reduce((sum, h) => sum + h.invested, 0);
  const totalDailyPL = holdings.reduce((sum, h) => sum + h.dailyPL, 0);
  const totalUnrealizedPL = holdings.reduce((sum, h) => sum + h.unrealizedPL, 0);

  const dailyPLPercent = totalValue > 0 ? (totalDailyPL / totalValue) * 100 : 0;
  const unrealizedPLPercent =
    totalInvested > 0 ? (totalUnrealizedPL / totalInvested) * 100 : 0;

  return {
    totalValue,
    dailyPL: totalDailyPL,
    dailyPLPercent,
    unrealizedPL: totalUnrealizedPL,
    unrealizedPLPercent,
    cash: 0, // TODO: Add cash tracking to portfolios
    currency: "USD", // TODO: Get from portfolio
  };
}

