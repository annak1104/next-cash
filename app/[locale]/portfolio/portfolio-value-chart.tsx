"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useCurrency } from "@/contexts/currency-context";
import { formatCurrency } from "@/lib/currency-utils";
import { cn } from "@/lib/utils";
import { format, isAfter, parseISO, startOfYear, subDays } from "date-fns";
import numeral from "numeral";
import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";

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

const TIME_RANGES: { label: TimeRange; days?: number }[] = [
  { label: "1D", days: 1 },
  { label: "1W", days: 7 },
  { label: "1M", days: 30 },
  { label: "6M", days: 180 },
  { label: "YTD" },
  { label: "1Y", days: 365 },
];

function getRangeStart(range: TimeRange) {
  const today = new Date();

  if (range === "YTD") {
    return startOfYear(today);
  }

  const days = TIME_RANGES.find((item) => item.label === range)?.days ?? 7;
  return subDays(today, days);
}

function getValueDomain(values: number[]): [number, number] {
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

  const padding = Math.max((max - min) * 0.12, Math.abs(max) * 0.01, 0.01);
  return [Math.max(0, min - padding), max + padding];
}

export default function PortfolioValueChart({
  data,
  currentValue,
  dailyPL,
  dailyPLPercent,
  unrealizedPL,
  unrealizedPLPercent,
  currency,
}: Props) {
  const { convertAmount, selectedCurrency } = useCurrency();
  const [selectedRange, setSelectedRange] = useState<TimeRange>("1W");

  const rangeStart = getRangeStart(selectedRange);
  const filteredData = data.filter((point) => {
    const pointDate = parseISO(point.date);
    return (
      isAfter(pointDate, rangeStart) ||
      pointDate.toDateString() === rangeStart.toDateString()
    );
  });
  const visibleData =
    filteredData.length > 0
      ? filteredData
      : currentValue > 0
        ? [
            {
              date: format(subDays(new Date(), 1), "yyyy-MM-dd"),
              value: currentValue,
            },
            { date: format(new Date(), "yyyy-MM-dd"), value: currentValue },
          ]
        : [];

  // Calculate baseline (first value in range)
  const baselineValue =
    visibleData.length > 0 ? visibleData[0].value : currentValue;
  const baselineDisplayValue = convertAmount(baselineValue, currency);

  // Format data for chart
  const chartData = visibleData.map((point) => ({
    date: point.date,
    value: point.value,
    displayValue: convertAmount(point.value, currency),
    formattedDate: format(parseISO(point.date), "MMM dd"),
    tooltipDate: format(parseISO(point.date), "MMM dd, yyyy"),
  }));
  const valueDomain = getValueDomain(
    chartData.map((point) => point.displayValue),
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 space-y-1">
              <CardTitle className="text-3xl font-bold break-words sm:text-4xl">
                {formatCurrency(
                  convertAmount(currentValue, currency),
                  selectedCurrency,
                )}
              </CardTitle>
              <div className="text-muted-foreground flex flex-col gap-2 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                <div className="flex items-center gap-1">
                  <span
                    className={cn(
                      "font-medium",
                      dailyPL >= 0 ? "text-green-500" : "text-red-500",
                    )}
                  >
                    {dailyPL >= 0 ? "+" : ""}
                    {formatCurrency(
                      convertAmount(dailyPL, currency),
                      selectedCurrency,
                    )}{" "}
                    ({dailyPLPercent >= 0 ? "+" : ""}
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
                    {formatCurrency(
                      convertAmount(unrealizedPL, currency),
                      selectedCurrency,
                    )}{" "}
                    ({unrealizedPLPercent >= 0 ? "+" : ""}
                    {unrealizedPLPercent.toFixed(2)}%)
                  </span>
                  <span>Unrealized P&L</span>
                </div>
              </div>
            </div>
            <div className="glass-control flex w-full items-center gap-1 overflow-x-auto rounded-full p-1 sm:w-fit">
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
        {chartData.length === 0 ? (
          <div className="glass-surface text-muted-foreground flex h-[300px] items-center justify-center rounded-[1.5rem] border-dashed text-sm">
            No portfolio history yet
          </div>
        ) : (
          <ChartContainer
            config={{
              displayValue: {
                label: "Portfolio Value",
                color: "rgb(99, 102, 241)",
              },
            }}
            className="h-[320px] w-full"
          >
            <AreaChart
              data={chartData}
              margin={{ top: 12, right: 8, bottom: 0, left: 0 }}
            >
              <defs>
                <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="rgb(99, 102, 241)"
                    stopOpacity={0.34}
                  />
                  <stop
                    offset="95%"
                    stopColor="rgb(99, 102, 241)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                stroke="rgba(148, 163, 184, 0.18)"
                strokeDasharray="3 5"
              />
              <XAxis
                dataKey="formattedDate"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={28}
                interval="preserveStartEnd"
                className="text-xs"
              />
              <YAxis
                domain={valueDomain}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={56}
                className="text-xs"
                tickFormatter={(value) =>
                  `${selectedCurrency} ${numeral(value).format("0.[0]a")}`
                }
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(_, payload) =>
                      payload?.[0]?.payload?.tooltipDate ?? ""
                    }
                    formatter={(value) =>
                      formatCurrency(Number(value), selectedCurrency)
                    }
                  />
                }
              />
              <ReferenceLine
                y={baselineDisplayValue}
                stroke="rgb(107, 114, 128)"
                strokeDasharray="3 3"
                strokeOpacity={0.55}
              />
              <Area
                type="monotone"
                dataKey="displayValue"
                stroke="rgb(90, 92, 255)"
                strokeWidth={2.5}
                fill="url(#valueGradient)"
                style={{
                  filter: "drop-shadow(0 0 10px rgba(99, 102, 241, 0.32))",
                }}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
