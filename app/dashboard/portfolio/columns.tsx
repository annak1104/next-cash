"use client";

import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";

import { HoldingRow } from "@/types/HoldingRow";

export const columns: ColumnDef<HoldingRow>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const { image, symbol, name } = row.original;
      return (
        <div className="flex items-center gap-2">
          {image ? (
            <Image
              src={image}
              alt={name}
              width={28}
              height={28}
              className="rounded-full"
            />
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted">
              <span className="text-xs font-medium">
                {symbol.substring(0, 2)}
              </span>
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-medium">{symbol}</span>
            <span className="text-xs text-muted-foreground">{name}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "quantity",
    header: "Position",
    cell: ({ getValue }) => Number(getValue()).toFixed(5),
  },
  {
    accessorKey: "currentPrice",
    header: "Price",
    cell: ({ getValue }) => {
      const price = Number(getValue());
      if (price >= 1000) {
        return `$${(price / 1000).toFixed(2)}K`;
      }
      return `$${price.toFixed(2)}`;
    },
  },
  {
    accessorKey: "change24h",
    header: "% Change",
    cell: ({ getValue }) => {
      const val = Number(getValue());
      return (
        <span className={val >= 0 ? "text-green-500" : "text-red-500"}>
          {val >= 0 ? "+" : ""}
          {val.toFixed(2)}%
        </span>
      );
    },
  },
  {
    accessorKey: "dailyPL",
    header: "Daily P&L",
    cell: ({ getValue }) => {
      const val = Number(getValue());
      return (
        <span className={val >= 0 ? "text-green-500" : "text-red-500"}>
          {val >= 0 ? "+" : ""}${Math.abs(val).toFixed(2)}
        </span>
      );
    },
  },
  {
    accessorKey: "avgPrice",
    header: "Avg. price",
    cell: ({ getValue }) => {
      const price = Number(getValue());
      if (price >= 1000) {
        return `$${(price / 1000).toFixed(2)}K`;
      }
      return `$${price.toFixed(2)}`;
    },
  },
  {
    accessorKey: "invested",
    header: "Cost basis",
    cell: ({ getValue }) => `$${Number(getValue()).toFixed(2)}`,
  },
  {
    accessorKey: "marketValue",
    header: "Market value",
    cell: ({ getValue }) => `$${Number(getValue()).toFixed(2)}`,
  },
  {
    accessorKey: "unrealizedPL",
    header: "Unrealized P&L",
    cell: ({ getValue }) => {
      const val = Number(getValue());
      return (
        <span className={val >= 0 ? "text-green-500" : "text-red-500"}>
          {val >= 0 ? "+" : ""}${Math.abs(val).toFixed(2)}
        </span>
      );
    },
  },
  {
    id: "unrealizedPLPercent",
    header: "% Unrealized P&L",
    cell: ({ row }) => {
      const invested = Number(row.original.invested);
      const unrealizedPL = Number(row.original.unrealizedPL);
      const percent =
        invested > 0 ? (unrealizedPL / invested) * 100 : 0;
      return (
        <span className={percent >= 0 ? "text-green-500" : "text-red-500"}>
          {percent >= 0 ? "+" : ""}
          {percent.toFixed(2)}%
        </span>
      );
    },
  },
  {
    accessorKey: "allocation",
    header: "Allocation",
    cell: ({ getValue }) => `${Number(getValue()).toFixed(2)}%`,
  },
];
