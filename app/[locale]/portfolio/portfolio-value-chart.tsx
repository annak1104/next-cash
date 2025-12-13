"use client";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency-utils";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { useState } from "react";
import { Area, AreaChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from "recharts";
import numeral from "numeral";

type PortfolioValuePoint = {
  date: string;
  value: number;
};

type Props = {
  data: PortfolioValuePoint[];
  currentValue: number;
  dailyPL: number;
  dailyPLPercent: number;
  unrealizedPL: number;
  unrealizedPLPercent: number;
  currency: string;
};

type TimeRange = "1D" | "1W" | "1M" | "6M" | "YTD" | "1Y";

const TIME_RANGES: { label: TimeRange; days: number }[] = [
  { label: "1D", days: 1 },
  { label: "1W", days: 7 },
  { label: "1M", days: 30 },
  { label: "6M", days: 180 },
  { label: "YTD", days: 365 }, // Approximate
  { label: "1Y", days: 365 },
];

export default function PortfolioValueChart({
  data,
  currentValue,
  dailyPL,
  dailyPLPercent,
  unrealizedPL,
  unrealizedPLPercent,
  currency,
}: Props) {
  const [selectedRange, setSelectedRange] = useState<TimeRange>("1W");

  const selectedRangeConfig = TIME_RANGES.find((r) => r.label === selectedRange);
  const filteredData = data.slice(-(selectedRangeConfig?.days || 7));

  // Calculate baseline (first value in range)
  const baselineValue =
    filteredData.length > 0 ? filteredData[0].value : currentValue;

  // Format data for chart
  const chartData = filteredData.map((point) => ({
    date: point.date,
    value: point.value,
    formattedDate: format(parseISO(point.date), "MMM dd"),
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-4xl font-bold">
                {formatCurrency(currentValue, currency)}
              </CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <span
                    className={cn(
                      "font-medium",
                      dailyPL >= 0 ? "text-green-500" : "text-red-500",
                    )}
                  >
                    {dailyPL >= 0 ? "+" : ""}
                    {formatCurrency(dailyPL, currency)} (
                    {dailyPLPercent >= 0 ? "+" : ""}
                    {dailyPLPercent.toFixed(2)}%)
                  </span>
                  <span>Daily P&L</span>
                </div>
                <div className="flex items-center gap-1">
                  <span
                    className={cn(
                      "font-medium",
                      unrealizedPL >= 0 ? "text-green-500" : "text-red-500",
                    )}
                  >
                    {unrealizedPL >= 0 ? "+" : ""}
                    {formatCurrency(unrealizedPL, currency)} (
                    {unrealizedPLPercent >= 0 ? "+" : ""}
                    {unrealizedPLPercent.toFixed(2)}%)
                  </span>
                  <span>Unrealized P&L</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 rounded-lg border p-1">
              {TIME_RANGES.map((range) => (
                <Button
                  key={range.label}
                  variant={selectedRange === range.label ? "default" : "ghost"}
                  size="sm"
                  className="h-8 px-3 text-xs"
                  onClick={() => setSelectedRange(range.label)}
                >
                  {range.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            value: {
              label: "Portfolio Value",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="h-[300px] w-full"
        >
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="rgb(99, 102, 241)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="rgb(99, 102, 241)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="formattedDate"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-xs"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-xs"
              tickFormatter={(value) => {
                return `$${numeral(value).format("0.0a")}`;
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => {
                    return formatCurrency(Number(value), currency);
                  }}
                />
              }
            />
            <ReferenceLine
              y={baselineValue}
              stroke="gray"
              strokeDasharray="3 3"
              strokeOpacity={0.5}
              label={{
                value: formatCurrency(baselineValue, currency),
                position: "right",
                fill: "gray",
                fontSize: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="rgb(99, 102, 241)"
              strokeWidth={2}
              fill="url(#valueGradient)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
