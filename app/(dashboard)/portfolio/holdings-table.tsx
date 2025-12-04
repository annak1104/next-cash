"use client";

import { useState } from "react";
import { HoldingRow } from "@/types/HoldingRow";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import HoldingsFilters from "./holdings-filters";

type HoldingFilter = "all" | "crypto" | "stock";

function getAssetCategory(holding: HoldingRow): "crypto" | "stock" {
  const name = holding.name.toLowerCase();
  const symbol = holding.symbol.toLowerCase();

  // Heuristics for tokenized / synthetic stocks coming from crypto APIs
  // Examples from the UI: "NVIDIA (Ondo Tokenized Stock)", "Apple xStock"
  if (
    name.includes("stock") ||
    name.includes("xstock") ||
    name.includes("tokenized") ||
    symbol.endsWith("x") // many synthetic stock tokens use X suffix
  ) {
    return "stock";
  }

  // Next, prefer explicit assetType when available
  if (holding.assetType === "crypto" || holding.assetType === "stock") {
    return holding.assetType;
  }

  // Default: treat as crypto
  return "crypto";
}

type Props = {
  holdings: HoldingRow[];
};

export default function HoldingsTable({ holdings }: Props) {
  const [filter, setFilter] = useState<HoldingFilter>("all");

  const filteredHoldings =
    filter === "all"
      ? holdings
      : holdings.filter((holding) => {
          const category = getAssetCategory(holding);
          return category === filter;
        });

  return (
    <div className="space-y-4">
      <HoldingsFilters selectedFilter={filter} onFilterChange={setFilter} />
      <DataTable columns={columns} data={filteredHoldings} />
    </div>
  );
}

