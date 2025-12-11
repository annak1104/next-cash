"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";

import { tradeColumns } from "./columns";
import { DataTable } from "../data-table";
import { TradeRow } from "@/data/getTrades";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type PortfolioOption = {
  id: string;
  name: string;
};

type Props = {
  portfolios: PortfolioOption[];
  initialTrades: TradeRow[];
};

export default function TradesTable({ portfolios, initialTrades }: Props) {
  const [portfolioFilter, setPortfolioFilter] = useState<string>("all");
  const [tickerFilter, setTickerFilter] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const filteredTrades = useMemo(() => {
    return initialTrades.filter((trade) => {
      if (portfolioFilter !== "all" && String(trade.portfolioId) !== portfolioFilter) {
        return false;
      }
      if (
        tickerFilter &&
        !trade.symbol.toLowerCase().includes(tickerFilter.toLowerCase())
      ) {
        return false;
      }
      if (startDate) {
        const d = new Date(trade.tradeDate);
        if (d < new Date(startDate)) return false;
      }
      if (endDate) {
        const d = new Date(trade.tradeDate);
        if (d > new Date(endDate)) return false;
      }
      return true;
    });
  }, [initialTrades, portfolioFilter, tickerFilter, startDate, endDate]);

  return (
    <div className="space-y-4">
      {/* Filters toolbar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-3">
          <Select
            value={portfolioFilter}
            onValueChange={setPortfolioFilter}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Portfolio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {portfolios.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Ticker"
            className="w-40"
            value={tickerFilter}
            onChange={(e) => setTickerFilter(e.target.value)}
          />

          <Input
            type="date"
            className="w-40"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            type="date"
            className="w-40"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setPortfolioFilter("all");
            setTickerFilter("");
            setStartDate("");
            setEndDate("");
          }}
        >
          Reset filters
        </Button>
      </div>

      <DataTable columns={tradeColumns} data={filteredTrades} />
    </div>
  );
}


