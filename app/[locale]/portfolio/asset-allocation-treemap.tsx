"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency-utils";
import { cn } from "@/lib/utils";
import { Grid2x2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Treemap, ResponsiveContainer } from "recharts";
import { HoldingRow } from "@/types/HoldingRow";

type Props = {
  holdings: HoldingRow[];
  currency: string;
};

type TreemapData = {
  name: string;
  value: number;
  allocation: number;
  change24h: number;
  fill: string;
};

// Generate color based on performance
function getColorForChange(change24h: number): string {
  if (change24h > 0) {
    // Positive: shades of blue/green
    const intensity = Math.min(Math.abs(change24h) / 5, 1);
    return `rgb(${Math.round(59 + intensity * 40)}, ${Math.round(130 + intensity * 50)}, ${Math.round(246)})`;
  } else {
    // Negative: shades of red
    const intensity = Math.min(Math.abs(change24h) / 5, 1);
    return `rgb(${Math.round(220 - intensity * 30)}, ${Math.round(38 + intensity * 20)}, ${Math.round(38 + intensity * 20)})`;
  }
}

// Custom content renderer for treemap cells
const CustomCell = (props: any) => {
  const { x, y, width, height, payload } = props;
  if (!payload || !x || !y || !width || !height) return null;

  const fontSize = Math.min(width / 6, height / 3, 14);
  const isLargeEnough = width > 80 && height > 40;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={payload.fill}
        stroke="#fff"
        strokeWidth={2}
        rx={4}
      />
      {isLargeEnough && (
        <>
          <text
            x={x + width / 2}
            y={y + height / 2 - fontSize / 2}
            textAnchor="middle"
            fill="#fff"
            fontSize={fontSize}
            fontWeight="bold"
            className="pointer-events-none"
          >
            {payload.name}
          </text>
          <text
            x={x + width / 2}
            y={y + height / 2 + fontSize / 2}
            textAnchor="middle"
            fill="#fff"
            fontSize={fontSize * 0.8}
            className="pointer-events-none"
          >
            {payload.change24h >= 0 ? "+" : ""}
            {payload.change24h.toFixed(2)}%
          </text>
        </>
      )}
    </g>
  );
};

export default function AssetAllocationTreemap({
  holdings,
  currency,
}: Props) {
  // Prepare treemap data
  const treemapData: TreemapData[] = holdings
    .filter((h) => h.marketValue > 0)
    .map((holding) => ({
      name: holding.symbol,
      value: holding.marketValue,
      allocation: holding.allocation,
      change24h: holding.change24h,
      fill: getColorForChange(holding.change24h),
    }))
    .sort((a, b) => b.value - a.value);

  if (treemapData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Asset Allocation Map</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-10">
            No assets to display
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Asset Allocation Map</CardTitle>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Grid2x2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={treemapData}
              dataKey="value"
              stroke="#fff"
              fill="#8884d8"
              content={<CustomCell />}
            />
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
