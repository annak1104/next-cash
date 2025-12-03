"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { TradeRow } from "@/data/getTrades";

export const tradeColumns: ColumnDef<TradeRow>[] = [
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ getValue }) => {
      const type = getValue() as TradeRow["type"];
      const isBuy = type === "buy";
      const isSell = type === "sell";
      const color =
        type === "revaluation"
          ? "bg-slate-200 text-slate-900"
          : isBuy
          ? "bg-emerald-100 text-emerald-800"
          : "bg-red-100 text-red-800";
      return (
        <Badge className={color}>
          {type}
        </Badge>
      );
    },
  },
  {
    accessorKey: "tradeDate",
    header: "Date",
    cell: ({ getValue }) => {
      const date = getValue() as Date | string;
      return format(new Date(date), "dd-MM-yyyy");
    },
  },
  {
    accessorKey: "symbol",
    header: "Asset",
    cell: ({ row }) => {
      const symbol = row.original.symbol;
      const name = row.original.name;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{symbol}</span>
          <span className="text-xs text-muted-foreground">{name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "quantity",
    header: "Amount",
    cell: ({ getValue }) => Number(getValue()).toFixed(5),
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ getValue }) => {
      const price = Number(getValue());
      if (!Number.isFinite(price)) return "-";
      if (price >= 1000) return `$${(price / 1000).toFixed(2)}K`;
      return `$${price.toFixed(2)}`;
    },
  },
  {
    accessorKey: "fee",
    header: "Fee",
    cell: ({ getValue }) => `$${Number(getValue() ?? 0).toFixed(2)}`,
  },
  {
    accessorKey: "totalValue",
    header: "Total",
    cell: ({ getValue }) => `$${Number(getValue()).toFixed(2)}`,
  },
];


