"use client";

import { useState } from "react";
import { HoldingRow } from "@/types/HoldingRow";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import HoldingsFilters from "./holdings-filters";

type Props = {
  holdings: HoldingRow[];
};

export default function HoldingsTable({ holdings }: Props) {
  const [filter, setFilter] = useState<"all" | "crypto" | "stock">("all");

  const filteredHoldings =
    filter === "all"
      ? holdings
      : holdings.filter((holding) => {
          if (holding.assetType) {
            return (
              (filter === "crypto" && holding.assetType === "crypto") ||
              (filter === "stock" && holding.assetType === "stock")
            );
          }
          // Fallback: try to determine from symbol/image
          if (filter === "crypto") {
            return holding.image?.includes("coingecko") || 
                   holding.symbol.length <= 5;
          } else {
            return !holding.image?.includes("coingecko") && 
                   holding.symbol.length > 3;
          }
        });

  return (
    <div className="space-y-4">
      <HoldingsFilters selectedFilter={filter} onFilterChange={setFilter} />
      <DataTable columns={columns} data={filteredHoldings} />
    </div>
  );
}

