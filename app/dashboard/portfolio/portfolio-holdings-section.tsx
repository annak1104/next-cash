"use client";

import { useEffect, useState } from "react";

import HoldingsTable from "./holdings-table";
import PortfolioCards from "./portfolio-cards";
import PortfolioSummary from "./portfolio-summary";

import { HoldingRow } from "@/types/HoldingRow";

type Portfolio = {
  id: string;
  name: string;
  value: number;
  dailyPL: number;
  dailyPLPercent: number;
  currency: string;
};

type PortfolioStats = {
  totalValue: number;
  dailyPL: number;
  dailyPLPercent: number;
  unrealizedPL: number;
  unrealizedPLPercent: number;
  cash: number;
  currency: string;
};

type Props = {
  portfolios: Portfolio[];
  initialHoldings: HoldingRow[];
};

function calculateStats(holdings: HoldingRow[]): PortfolioStats {
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
  const totalUnrealizedPL = holdings.reduce(
    (sum, h) => sum + h.unrealizedPL,
    0,
  );

  const dailyPLPercent = totalValue > 0 ? (totalDailyPL / totalValue) * 100 : 0;
  const unrealizedPLPercent =
    totalInvested > 0 ? (totalUnrealizedPL / totalInvested) * 100 : 0;

  return {
    totalValue,
    dailyPL: totalDailyPL,
    dailyPLPercent,
    unrealizedPL: totalUnrealizedPL,
    unrealizedPLPercent,
    cash: 0,
    currency: "USD",
  };
}

export default function PortfolioHoldingsSection({
  portfolios,
  initialHoldings,
}: Props) {
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<
    string | "all"
  >("all");
  const [holdings, setHoldings] = useState<HoldingRow[]>(initialHoldings);
  const [stats, setStats] = useState<PortfolioStats>(
    calculateStats(initialHoldings),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setStats(calculateStats(holdings));
  }, [holdings]);

  const handleSelectPortfolio = async (portfolioId: string | "all") => {
    setSelectedPortfolioId(portfolioId);
    setIsLoading(true);
    setError(null);

    try {
      const params =
        portfolioId === "all" ? "" : `?portfolioId=${encodeURIComponent(portfolioId)}`;
      const response = await fetch(`/api/portfolio/holdings${params}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load holdings");
      }

      const data: HoldingRow[] = await response.json();
      setHoldings(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load holdings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PortfolioCards
        stats={stats}
        portfolios={portfolios}
        selectedPortfolioId={selectedPortfolioId}
        onSelectPortfolio={handleSelectPortfolio}
      />

      <PortfolioSummary stats={stats} />

      {error && (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      )}

      {isLoading && (
        <p className="text-muted-foreground text-sm">Loading holdings...</p>
      )}

      <HoldingsTable holdings={holdings} />
    </div>
  );
}


