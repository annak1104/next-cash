"use client";

import { ChevronDown, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/currency-utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

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
  stats: PortfolioStats;
};

export default function PortfolioSummary({ stats }: Props) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="space-y-2">
        <p className="text-3xl font-bold">
          {formatCurrency(stats.totalValue, stats.currency)}
        </p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Portfolio cash:</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-auto p-0">
                {formatCurrency(stats.cash, stats.currency)}
                <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem>View cash details</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {/* Daily P&L */}
        <div className="flex items-center gap-2">
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-full ${
              stats.dailyPL >= 0
                ? "bg-green-100 dark:bg-green-900"
                : "bg-red-100 dark:bg-red-900"
            }`}
          >
            {stats.dailyPL >= 0 ? (
              <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-600 dark:text-red-400" />
            )}
          </div>
          <span
            className={`text-sm ${
              stats.dailyPL >= 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            {stats.dailyPL >= 0 ? "+" : ""}
            {formatCurrency(stats.dailyPL, stats.currency)} (
            {stats.dailyPLPercent >= 0 ? "+" : ""}
            {stats.dailyPLPercent.toFixed(2)}%) Daily P&L
          </span>
        </div>

        {/* Unrealized P&L */}
        <div className="flex items-center gap-2">
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-full ${
              stats.unrealizedPL >= 0
                ? "bg-green-100 dark:bg-green-900"
                : "bg-red-100 dark:bg-red-900"
            }`}
          >
            {stats.unrealizedPL >= 0 ? (
              <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-600 dark:text-red-400" />
            )}
          </div>
          <span
            className={`text-sm ${
              stats.unrealizedPL >= 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            {stats.unrealizedPL >= 0 ? "+" : ""}
            {formatCurrency(stats.unrealizedPL, stats.currency)} (
            {stats.unrealizedPLPercent >= 0 ? "+" : ""}
            {stats.unrealizedPLPercent.toFixed(2)}%) Unrealized P&L
          </span>
        </div>
      </div>
    </div>
  );
}

