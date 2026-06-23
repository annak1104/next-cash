"use client";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useCurrency } from "@/contexts/currency-context";
import { formatCurrency } from "@/lib/currency-utils";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import numeral from "numeral";
import { Bar, BarChart, CartesianGrid, Legend, XAxis, YAxis } from "recharts";

export function CashflowContent({
  annualCashflow,
}: {
  annualCashflow: {
    month: number;
    income: number;
    expenses: number;
    investments: number;
  }[];
}) {
  const { convertAmount, selectedCurrency } = useCurrency();
  const baseCurrency = "USD";
  const today = new Date();
  const totalAnnualIncome = annualCashflow.reduce(
    (prevValue: number, month) => {
      return prevValue + month.income;
    },
    0,
  );
  const totalAnnualExpenses = annualCashflow.reduce(
    (prevValue: number, month) => {
      return prevValue + month.expenses;
    },
    0,
  );
  const totalAnnualInvestments = annualCashflow.reduce(
    (prevValue: number, month) => {
      return prevValue + month.investments;
    },
    0,
  );
  const balance = totalAnnualIncome - totalAnnualExpenses - totalAnnualInvestments;
  const maxMonthlyValue = Math.max(
    0,
    ...annualCashflow.flatMap((month) => [
      convertAmount(month.income, baseCurrency),
      convertAmount(month.expenses, baseCurrency),
      convertAmount(month.investments, baseCurrency),
    ]),
  );
  const yDomain: [number, number] = [
    0,
    maxMonthlyValue > 0 ? maxMonthlyValue * 1.12 : 1,
  ];

  return (
    <div className="flex flex-col gap-6 sm:flex-row">
      <ScrollArea className="w-full whitespace-nowrap">
        <ChartContainer
          config={{
            month: {
              label: "Month",
            },
            income: {
              label: "Income",
              color: "#84cc16",
            },
            expenses: {
              label: "Expenses",
              color: "#f97316",
            },
            investments: {
              label: "Investments",
              color: "#06b6d4",
            },
          }}
          className="h-[320px] min-w-[640px] sm:min-w-0"
        >
          <BarChart
            data={annualCashflow.map((month) => ({
              ...month,
              income: convertAmount(month.income, baseCurrency),
              expenses: convertAmount(month.expenses, baseCurrency),
              investments: convertAmount(month.investments, baseCurrency),
            }))}
            barCategoryGap="18%"
            margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
          >
            <CartesianGrid vertical={false} />
            <YAxis
              domain={yDomain}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={64}
              tickFormatter={(value) =>
                `${selectedCurrency} ${numeral(value).format("0.[0]a")}`
              }
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                return format(new Date(today.getFullYear(), value - 1, 1), "MMM");
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(_, payload) => {
                    const month = payload[0]?.payload?.month;
                    return (
                      <div>
                        {format(
                          new Date(today.getFullYear(), month - 1, 1),
                          "MMM",
                        )}
                      </div>
                    );
                  }}
                  formatter={(value, name) => [
                    formatCurrency(Number(value), selectedCurrency),
                    String(name),
                  ]}
                />
              }
            />
            <Legend
              verticalAlign="top"
              align="right"
              height={30}
              iconType="circle"
              formatter={(value) => {
                return <span className="text-primary capitalize">{value}</span>;
              }}
            />
            <Bar dataKey="income" radius={4} fill="var(--color-income)" />
            <Bar dataKey="expenses" radius={4} fill="var(--color-expenses)" />
            <Bar dataKey="investments" radius={4} fill="var(--color-investments)" />
          </BarChart>
        </ChartContainer>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <div className="flex flex-col justify-center gap-4 border-t pt-4 sm:border-l sm:border-t-0 sm:px-4 sm:pt-0">
        <div>
          <span className="text-muted-foreground text-sm font-bold">
            Income
          </span>
          <h2 className="text-3xl">
            {formatCurrency(
              convertAmount(totalAnnualIncome, baseCurrency),
              selectedCurrency,
            )}
          </h2>
        </div>
        <div className="border-t" />
        <div>
          <span className="text-muted-foreground text-sm font-bold">
            Expenses
          </span>
          <h2 className="text-3xl">
            {formatCurrency(
              convertAmount(totalAnnualExpenses, baseCurrency),
              selectedCurrency,
            )}
          </h2>
        </div>
        <div className="border-t" />
        <div>
          <span className="text-muted-foreground text-sm font-bold">
            Investments
          </span>
          <h2 className="text-3xl">
            {formatCurrency(
              convertAmount(totalAnnualInvestments, baseCurrency),
              selectedCurrency,
            )}
          </h2>
        </div>
        <div className="border-t" />
        <div>
          <span className="text-muted-foreground text-sm font-bold">
            Balance
          </span>
          <h2
            className={cn(
              "text-3xl font-bold",
              balance >= 0 ? "text-lime-500" : "text-orange-500",
            )}
          >
            {formatCurrency(convertAmount(balance, baseCurrency), selectedCurrency)}
          </h2>
        </div>
      </div>
    </div>
  );
}
