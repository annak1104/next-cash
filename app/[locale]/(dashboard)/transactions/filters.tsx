"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import Link from "next/link";
import { useState } from "react";

type Props = {
  month: number;
  year: number;
  yearsRange: number[];
};

export default function Filters({ month, year, yearsRange }: Props) {
  const [selectedMonth, setSelectedMonth] = useState(month);
  const [selectedYear, setSelectedYear] = useState(year);
  return (
    <div className="flex gap-1">
      <Select
        value={selectedMonth.toString()}
        onValueChange={(newValue) => setSelectedMonth(Number(newValue))}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 12 }).map((_, i) => (
            <SelectItem key={i} value={`${i + 1}`}>
              {format(new Date(selectedYear, i, 1), "MMM")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={selectedYear.toString()}
        onValueChange={(newValue) => setSelectedYear(Number(newValue))}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {yearsRange.map((year) => (
            <SelectItem key={year} value={`${year}`}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button asChild>
        <Link href={`transactions?year=${selectedYear}&month=${selectedMonth}`}>
          Go
        </Link>
      </Button>
    </div>
  );
}
