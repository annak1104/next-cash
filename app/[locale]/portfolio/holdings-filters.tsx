"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PlusIcon } from "lucide-react";
import Link from "next/link";

type FilterType = "all" | "crypto" | "stock";

type Props = {
  selectedFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
};

export default function HoldingsFilters({
  selectedFilter,
  onFilterChange,
}: Props) {
  const filters: { value: FilterType; label: string }[] = [
    { value: "all", label: "All" },
    { value: "crypto", label: "Cryptocurrency" },
    { value: "stock", label: "Stocks" },
  ];

  return (
    <div className="flex justify-between">
      <Button asChild variant="default">
        <Link href="portfolio/new">
          <PlusIcon className="mr-2 h-4 w-4" />
          Trades
        </Link>
      </Button>
      <div className="flex gap-2">
        {filters.map((filter) => (
          <Button
            key={filter.value}
            variant={selectedFilter === filter.value ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange(filter.value)}
            className={cn(
              selectedFilter === filter.value &&
                "bg-primary text-primary-foreground",
            )}
          >
            {filter.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
