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

  // Strong indicators that this is a stock (tokenized/synthetic stocks)
  // Examples: "NVIDIA (Ondo Tokenized Stock)", "Apple xStock", "Nasdaq xStock"
  const hasStockKeywords =
    name.includes("stock") ||
    name.includes("xstock") ||
    name.includes("tokenized");

  // Symbols ending with X are stocks ONLY if combined with stock keywords in name
  // This prevents false positives like TRX (TRON cryptocurrency) from being classified as stock
  const isStockSymbol = symbol.endsWith("x") && hasStockKeywords;

  if (hasStockKeywords || isStockSymbol) {
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

