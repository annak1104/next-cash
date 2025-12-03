"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Zap, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/currency-utils";
import { cn } from "@/lib/utils";

type PortfolioStats = {
  totalValue: number;
  dailyPL: number;
  dailyPLPercent: number;
  unrealizedPL: number;
  unrealizedPLPercent: number;
  currency: string;
};

type Portfolio = {
  id: string;
  name: string;
  value: number;
  dailyPL: number;
  dailyPLPercent: number;
  currency: string;
};

type Props = {
  stats: PortfolioStats;
  portfolios: Portfolio[];
  selectedPortfolioId?: string | "all";
  onSelectPortfolio?: (portfolioId: string | "all") => void;
};

export default function PortfolioCards({
  stats,
  portfolios,
  selectedPortfolioId = "all",
  onSelectPortfolio,
}: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* All portfolios card */}
      <Card
        role={onSelectPortfolio ? "button" : undefined}
        tabIndex={onSelectPortfolio ? 0 : undefined}
        onClick={() => onSelectPortfolio?.("all")}
        className={cn(
          "cursor-pointer transition",
          selectedPortfolioId === "all" &&
            "border-primary ring-1 ring-primary/30",
        )}
      >
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                  <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-sm text-muted-foreground">
                  All portfolios
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold">
                  {formatCurrency(stats.totalValue, stats.currency)}
                </p>
                <p
                  className={`text-sm ${
                    stats.dailyPL >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {stats.dailyPL >= 0 ? "+" : ""}
                  {formatCurrency(stats.dailyPL, stats.currency)} (
                  {stats.dailyPLPercent >= 0 ? "+" : ""}
                  {stats.dailyPLPercent.toFixed(2)}%)
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Render each portfolio */}
      {portfolios.map((portfolio) => (
        <Card
          key={portfolio.id}
          role={onSelectPortfolio ? "button" : undefined}
          tabIndex={onSelectPortfolio ? 0 : undefined}
          onClick={() => onSelectPortfolio?.(portfolio.id)}
          className={cn(
            "cursor-pointer transition",
            selectedPortfolioId === portfolio.id &&
              "border-primary ring-1 ring-primary/30",
          )}
        >
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                  <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm text-muted-foreground">{portfolio.name}</span>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold">
                  {formatCurrency(portfolio.value, portfolio.currency)}
                </p>
                <p
                  className={`text-sm ${
                    portfolio.dailyPL >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {portfolio.dailyPL >= 0 ? "+" : ""}
                  {formatCurrency(portfolio.dailyPL, portfolio.currency)} (
                  {portfolio.dailyPLPercent >= 0 ? "+" : ""}
                  {portfolio.dailyPLPercent.toFixed(2)}%)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
