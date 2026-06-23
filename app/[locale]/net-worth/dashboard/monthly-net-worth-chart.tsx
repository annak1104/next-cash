"use client";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrency } from "@/contexts/currency-context";
import { MonthlyNetWorthData } from "@/data/getMonthlyNetWorth";
import { formatCurrency } from "@/lib/currency-utils";
import { format } from "date-fns";
import numeral from "numeral";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

type MonthlyNetWorthChartProps = {
  data: MonthlyNetWorthData[];
  currency: string;
};

export default function MonthlyNetWorthChart({
  data,
  currency,
}: MonthlyNetWorthChartProps) {
  const { convertAmount, selectedCurrency } = useCurrency();
  // Format data for chart
  const chartData = data.map((item) => ({
    month: item.month,
    year: item.year,
    monthLabel: format(new Date(item.year, item.month - 1, 1), "MMM"),
    cash: convertAmount(item.cash, currency),
    stocks: convertAmount(item.stocks, currency),
    crypto: convertAmount(item.crypto, currency),
    total: convertAmount(item.total, currency),
  }));
  const maxTotal = Math.max(0, ...chartData.map((item) => item.total));
  const yDomain: [number, number] = [0, maxTotal > 0 ? maxTotal * 1.08 : 1];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly net worth</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 || maxTotal === 0 ? (
          <div className="flex h-[300px] items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
            No net worth history yet
          </div>
        ) : (
          <ChartContainer
            config={{
              cash: {
                label: "Cash",
                color: "hsl(204, 86%, 68%)",
              },
              stocks: {
                label: "Stocks",
                color: "hsl(221, 83%, 53%)",
              },
              crypto: {
                label: "Cryptocurrency",
                color: "hsl(173, 80%, 40%)",
              },
            }}
            className="h-[320px] w-full"
          >
            <BarChart
              data={chartData}
              barCategoryGap="24%"
              margin={{ top: 12, right: 8, bottom: 0, left: 0 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="monthLabel"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={18}
                interval="preserveStartEnd"
                className="text-xs"
              />
              <YAxis
                domain={yDomain}
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
                    labelFormatter={(_, payload) => {
                      if (!payload || payload.length === 0) return "";
                      const item = payload[0]?.payload as
                        | (typeof chartData)[number]
                        | undefined;
                      if (!item) return "";
                      return format(
                        new Date(item.year, item.month - 1, 1),
                        "MMM yyyy",
                      );
                    }}
                    formatter={(value, name, props) => {
                      const item = props.payload as (typeof chartData)[number];
                      const numValue = Number(value);
                      const percent =
                        item.total > 0 ? (numValue / item.total) * 100 : 0;
                      return [
                        `${formatCurrency(
                          numValue,
                          selectedCurrency,
                        )} (${percent.toFixed(1)}%)`,
                        name === "cash"
                          ? "Cash"
                          : name === "stocks"
                            ? "Stocks"
                            : "Cryptocurrency",
                      ];
                    }}
                  />
                }
              />
              <Bar
                dataKey="cash"
                stackId="networth"
                fill="var(--color-cash)"
                radius={[0, 0, 3, 3]}
              />
              <Bar
                dataKey="stocks"
                stackId="networth"
                fill="var(--color-stocks)"
              />
              <Bar
                dataKey="crypto"
                stackId="networth"
                fill="var(--color-crypto)"
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
