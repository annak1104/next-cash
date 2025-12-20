"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency-utils";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

type SummaryCardsProps = {
  totalNetWorth: number;
  totalNetWorthDailyPL: number;
  totalNetWorthDailyPLPercent: number;
  totalNetWorthUnrealizedPL: number;
  totalNetWorthUnrealizedPLPercent: number;
  investments: number;
  investmentsDailyPL: number;
  investmentsDailyPLPercent: number;
  investmentsUnrealizedPL: number;
  investmentsUnrealizedPLPercent: number;
  budgetCash: number;
  income: number;
  expenses: number;
  investmentsAmount: number;
  currency: string;
  chartData: Array<{ date: string; value: number }>;
};

export default function SummaryCards({
  totalNetWorth,
  totalNetWorthDailyPL,
  totalNetWorthDailyPLPercent,
  totalNetWorthUnrealizedPL,
  totalNetWorthUnrealizedPLPercent,
  investments,
  investmentsDailyPL,
  investmentsDailyPLPercent,
  investmentsUnrealizedPL,
  investmentsUnrealizedPLPercent,
  budgetCash,
  income,
  expenses,
  investmentsAmount,
  currency,
  chartData,
}: SummaryCardsProps) {
  // Prepare mini chart data (last 7 days or available data)
  const miniChartData = chartData.slice(-7).map((point) => ({
    value: point.value,
  }));

  // For total net worth chart, add current cash to portfolio values
  const totalNetWorthChartData = chartData.slice(-7).map((point) => ({
    value: point.value + (totalNetWorth - investments),
  }));

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Total Net Worth Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <h3 className="text-sm font-medium text-muted-foreground">
                Total Net Worth
              </h3>
              <p className="text-3xl font-bold">
                {formatCurrency(totalNetWorth, currency)}
              </p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <span
                    className={cn(
                      "font-medium",
                      totalNetWorthDailyPL >= 0
                        ? "text-green-500"
                        : "text-red-500",
                    )}
                  >
                    {totalNetWorthDailyPL >= 0 ? "+" : ""}
                    {formatCurrency(totalNetWorthDailyPL, currency)} (
                    {totalNetWorthDailyPLPercent >= 0 ? "+" : ""}
                    {totalNetWorthDailyPLPercent.toFixed(2)}%)
                  </span>
                  <span className="text-muted-foreground">Daily</span>
                </div>
                <div className="flex items-center gap-1">
                  <span
                    className={cn(
                      "font-medium",
                      totalNetWorthUnrealizedPL >= 0
                        ? "text-green-500"
                        : "text-red-500",
                    )}
                  >
                    {totalNetWorthUnrealizedPL >= 0 ? "+" : ""}
                    {formatCurrency(totalNetWorthUnrealizedPL, currency)} (
                    {totalNetWorthUnrealizedPLPercent >= 0 ? "+" : ""}
                    {totalNetWorthUnrealizedPLPercent.toFixed(2)}%)
                  </span>
                  <span className="text-muted-foreground">Total</span>
                </div>
              </div>
            </div>
            <div className="w-24 h-16 ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={totalNetWorthChartData}>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={
                      totalNetWorthDailyPL >= 0
                        ? "rgb(34, 197, 94)"
                        : "rgb(239, 68, 68)"
                    }
                    fill={
                      totalNetWorthDailyPL >= 0
                        ? "rgba(34, 197, 94, 0.1)"
                        : "rgba(239, 68, 68, 0.1)"
                    }
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Investments Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <h3 className="text-sm font-medium text-muted-foreground">
                Investments
              </h3>
              <p className="text-3xl font-bold">
                {formatCurrency(investments, currency)}
              </p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <span
                    className={cn(
                      "font-medium",
                      investmentsDailyPL >= 0 ? "text-green-500" : "text-red-500",
                    )}
                  >
                    {investmentsDailyPL >= 0 ? "+" : ""}
                    {formatCurrency(investmentsDailyPL, currency)} (
                    {investmentsDailyPLPercent >= 0 ? "+" : ""}
                    {investmentsDailyPLPercent.toFixed(2)}%)
                  </span>
                  <span className="text-muted-foreground">Daily</span>
                </div>
                <div className="flex items-center gap-1">
                  <span
                    className={cn(
                      "font-medium",
                      investmentsUnrealizedPL >= 0
                        ? "text-green-500"
                        : "text-red-500",
                    )}
                  >
                    {investmentsUnrealizedPL >= 0 ? "+" : ""}
                    {formatCurrency(investmentsUnrealizedPL, currency)} (
                    {investmentsUnrealizedPLPercent >= 0 ? "+" : ""}
                    {investmentsUnrealizedPLPercent.toFixed(2)}%)
                  </span>
                  <span className="text-muted-foreground">Total</span>
                </div>
              </div>
            </div>
            <div className="w-24 h-16 ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={miniChartData}>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={
                      investmentsDailyPL >= 0
                        ? "rgb(34, 197, 94)"
                        : "rgb(239, 68, 68)"
                    }
                    fill={
                      investmentsDailyPL >= 0
                        ? "rgba(34, 197, 94, 0.1)"
                        : "rgba(239, 68, 68, 0.1)"
                    }
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Cash Card */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Budget Cash
            </h3>
            <p className="text-3xl font-bold">
              {formatCurrency(budgetCash, currency)}
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-blue-500" />
                  <span className="text-muted-foreground">Income</span>
                </div>
                <span className="font-medium">
                  {formatCurrency(income, currency)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                  <span className="text-muted-foreground">Expenses</span>
                </div>
                <span className="font-medium">
                  {formatCurrency(expenses, currency)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-cyan-500" />
                  <span className="text-muted-foreground">Investments</span>
                </div>
                <span className="font-medium">
                  {formatCurrency(investmentsAmount, currency)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

