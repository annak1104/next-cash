"use client";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency-utils";
import { format } from "date-fns";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import numeral from "numeral";
import { MonthlyNetWorthData } from "@/data/getMonthlyNetWorth";

type MonthlyNetWorthChartProps = {
  data: MonthlyNetWorthData[];
  currency: string;
};

export default function MonthlyNetWorthChart({
  data,
  currency,
}: MonthlyNetWorthChartProps) {
  // Format data for chart
  const chartData = data.map((item) => ({
    month: item.month,
    year: item.year,
    monthLabel: format(new Date(item.year, item.month - 1, 1), "MMM"),
    cash: item.cash,
    stocks: item.stocks,
    crypto: item.crypto,
    total: item.total,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly net worth</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            cash: {
              label: "Cash",
              color: "hsl(210, 100%, 70%)",
            },
            stocks: {
              label: "Stocks",
              color: "hsl(210, 100%, 50%)",
            },
            crypto: {
              label: "Cryptocurrency",
              color: "hsl(210, 100%, 30%)",
            },
          }}
          className="h-[300px] w-full"
        >
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="monthLabel"
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
                  labelFormatter={(value, payload) => {
                    if (!payload || payload.length === 0) return "";
                    const data = payload[0]?.payload as typeof chartData[0];
                    if (!data) return "";
                    return `${format(
                      new Date(data.year, data.month - 1, 1),
                      "MMM yyyy",
                    )}`;
                  }}
                  formatter={(value, name, props) => {
                    const data = props.payload as typeof chartData[0];
                    const numValue = Number(value);
                    const percent =
                      data.total > 0 ? (numValue / data.total) * 100 : 0;
                    return [
                      `${formatCurrency(numValue, currency)} (${percent.toFixed(
                        2,
                      )}%)`,
                      name === "cash"
                        ? "Cash"
                        : name === "stocks"
                          ? "Stocks"
                          : "Cryptocurrency",
                    ];
                  }}
                  footerFormatter={(payload) => {
                    if (!payload || payload.length === 0) return "";
                    const data = payload[0]?.payload as typeof chartData[0];
                    return `Total net worth: ${formatCurrency(
                      data.total,
                      currency,
                    )} (100%)`;
                  }}
                />
              }
            />
            <Bar
              dataKey="cash"
              stackId="networth"
              fill="hsl(210, 100%, 70%)"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="stocks"
              stackId="networth"
              fill="hsl(210, 100%, 50%)"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="crypto"
              stackId="networth"
              fill="hsl(210, 100%, 30%)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

