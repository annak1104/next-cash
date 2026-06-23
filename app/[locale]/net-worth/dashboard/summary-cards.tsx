"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useCurrency } from "@/contexts/currency-context";
import { formatCurrency } from "@/lib/currency-utils";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";

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

function getSparklineDomain(values: number[]): [number, number] {
  const finiteValues = values.filter(Number.isFinite);

  if (finiteValues.length === 0) {
    return [0, 1];
  }

  const min = Math.min(...finiteValues);
  const max = Math.max(...finiteValues);

  if (min === max) {
    const padding = Math.max(Math.abs(max) * 0.08, max === 0 ? 1 : 0.01);
    return [Math.max(0, min - padding), max + padding];
  }

  const padding = Math.max((max - min) * 0.16, Math.abs(max) * 0.01, 0.01);
  return [Math.max(0, min - padding), max + padding];
}

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
  const { convertAmount, selectedCurrency } = useCurrency();
  // Prepare mini chart data (last 7 days or available data)
  const miniChartData = chartData.slice(-7).map((point) => ({
    value: point.value,
  }));

  // For total net worth chart, add current cash to portfolio values
  const totalNetWorthChartData = chartData.slice(-7).map((point) => ({
    value: point.value + (totalNetWorth - investments),
  }));
  const investmentsDomain = getSparklineDomain(
    miniChartData.map((point) => point.value),
  );
  const totalNetWorthDomain = getSparklineDomain(
    totalNetWorthChartData.map((point) => point.value),
  );

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
                {formatCurrency(convertAmount(totalNetWorth, currency), selectedCurrency)}
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
                    {formatCurrency(
                      convertAmount(totalNetWorthDailyPL, currency),
                      selectedCurrency,
                    )} (
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
                    {formatCurrency(
                      convertAmount(totalNetWorthUnrealizedPL, currency),
                      selectedCurrency,
                    )} (
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
                  <defs>
                    <linearGradient
                      id="totalNetWorthSparkline"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor={
                          totalNetWorthDailyPL >= 0
                            ? "rgb(34, 197, 94)"
                            : "rgb(239, 68, 68)"
                        }
                        stopOpacity={0.18}
                      />
                      <stop
                        offset="100%"
                        stopColor={
                          totalNetWorthDailyPL >= 0
                            ? "rgb(34, 197, 94)"
                            : "rgb(239, 68, 68)"
                        }
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <YAxis domain={totalNetWorthDomain} hide />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={
                      totalNetWorthDailyPL >= 0
                        ? "rgb(34, 197, 94)"
                        : "rgb(239, 68, 68)"
                    }
                    fill="url(#totalNetWorthSparkline)"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
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
                {formatCurrency(convertAmount(investments, currency), selectedCurrency)}
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
                    {formatCurrency(
                      convertAmount(investmentsDailyPL, currency),
                      selectedCurrency,
                    )} (
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
                    {formatCurrency(
                      convertAmount(investmentsUnrealizedPL, currency),
                      selectedCurrency,
                    )} (
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
                  <defs>
                    <linearGradient
                      id="investmentsSparkline"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor={
                          investmentsDailyPL >= 0
                            ? "rgb(34, 197, 94)"
                            : "rgb(239, 68, 68)"
                        }
                        stopOpacity={0.18}
                      />
                      <stop
                        offset="100%"
                        stopColor={
                          investmentsDailyPL >= 0
                            ? "rgb(34, 197, 94)"
                            : "rgb(239, 68, 68)"
                        }
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <YAxis domain={investmentsDomain} hide />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={
                      investmentsDailyPL >= 0
                        ? "rgb(34, 197, 94)"
                        : "rgb(239, 68, 68)"
                    }
                    fill="url(#investmentsSparkline)"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
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
              {formatCurrency(convertAmount(budgetCash, currency), selectedCurrency)}
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-blue-500" />
                  <span className="text-muted-foreground">Income</span>
                </div>
                <span className="font-medium">
                  {formatCurrency(convertAmount(income, currency), selectedCurrency)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                  <span className="text-muted-foreground">Expenses</span>
                </div>
                <span className="font-medium">
                  {formatCurrency(convertAmount(expenses, currency), selectedCurrency)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-cyan-500" />
                  <span className="text-muted-foreground">Investments</span>
                </div>
                <span className="font-medium">
                  {formatCurrency(
                    convertAmount(investmentsAmount, currency),
                    selectedCurrency,
                  )}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
