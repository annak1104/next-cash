"use client";

import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";

import { HoldingRow } from "@/types/HoldingRow";

export const columns: ColumnDef<HoldingRow>[] = [
  {
    accessorKey: "name",
    header: "Назва",
    cell: ({ row }) => {
      const { image, symbol, name } = row.original;
      return (
        <div className="flex items-center gap-2">
          <Image src={image} alt={name} width={28} height={28} className="rounded-full" />
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
    header: "Кількість",
    cell: ({ getValue }) => Number(getValue()).toFixed(4),
  },
  {
    accessorKey: "currentPrice",
    header: "Ціна",
    cell: ({ getValue }) => `$${Number(getValue()).toFixed(2)}`,
  },
  {
    accessorKey: "change24h",
    header: "% Зміна",
    cell: ({ getValue }) => {
      const val = Number(getValue());
      return (
        <span className={val >= 0 ? "text-green-500" : "text-red-500"}>
          {val.toFixed(2)}%
        </span>
      );
    },
  },
  {
    accessorKey: "dailyPL",
    header: "Денний P&L",
    cell: ({ getValue }) => {
      const val = Number(getValue());
      return (
        <span className={val >= 0 ? "text-green-500" : "text-red-500"}>
          {val >= 0 ? "+" : "-"}${Math.abs(val).toFixed(2)}
        </span>
      );
    },
  },
  {
    accessorKey: "avgPrice",
    header: "Сер. ціна",
    cell: ({ getValue }) => `$${Number(getValue()).toFixed(2)}`,
  },
  {
    accessorKey: "invested",
    header: "Інвестовано",
    cell: ({ getValue }) => `$${Number(getValue()).toFixed(2)}`,
  },
  {
    accessorKey: "marketValue",
    header: "Ринкова вартість",
    cell: ({ getValue }) => `$${Number(getValue()).toFixed(2)}`,
  },
  {
    accessorKey: "unrealizedPL",
    header: "Нереалізований P&L",
    cell: ({ getValue }) => {
      const val = Number(getValue());
      return (
        <span className={val >= 0 ? "text-green-500" : "text-red-500"}>
          {val >= 0 ? "+" : "-"}${Math.abs(val).toFixed(2)}
        </span>
      );
    },
  },
  {
    accessorKey: "allocation",
    header: "Алоцація",
    cell: ({ getValue }) => `${Number(getValue()).toFixed(2)}%`,
  },
];
