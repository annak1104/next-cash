"use client";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
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

  return (
    <div className="flex flex-col sm:flex-row">
      <ScrollArea className="w-89 whitespace-nowrap md:w-full">
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
          className="h-[300px] w-full"
        >
          <BarChart data={annualCashflow}>
            <CartesianGrid vertical={false} />
            <YAxis
              tickFormatter={(value) => {
                return `$${numeral(value).format("0,0")}`;
              }}
            />
            <XAxis
              tickFormatter={(value) => {
                return format(new Date(today.getFullYear(), value, 1), "MMM");
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(value, payload) => {
                    console.log({ value, payload });
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
      <div className="flex flex-col justify-center gap-4 border-l px-4">
        <div>
          <span className="text-muted-foreground text-sm font-bold">
            Income
          </span>
          <h2 className="text-3xl">
            ${numeral(totalAnnualIncome).format("0,0[.]00")}
          </h2>
        </div>
        <div className="border-t" />
        <div>
          <span className="text-muted-foreground text-sm font-bold">
            Expenses
          </span>
          <h2 className="text-3xl">
            ${numeral(totalAnnualExpenses).format("0,0[.]00")}
          </h2>
        </div>
        <div className="border-t" />
        <div>
          <span className="text-muted-foreground text-sm font-bold">
            Investments
          </span>
          <h2 className="text-3xl">
            ${numeral(totalAnnualInvestments).format("0,0[.]00")}
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
            ${numeral(balance).format("0,0[.]00")}
          </h2>
        </div>
      </div>
    </div>
  );
}
