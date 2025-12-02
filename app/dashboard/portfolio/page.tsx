import { Button } from "@/components/ui/button";
import { getCryptoHoldings } from "@/data/getCryptoAsset";
import { HoldingRow } from "@/types/HoldingRow";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { columns } from "./columns";
import { DataTable } from "./data-table";

export default async function PortfolioPage() {
  const cryptos = await getCryptoHoldings();

  return (
    <div className="mx-auto max-w-7xl px-1 py-10">
      <Button asChild variant="default">
        <Link href="/dashboard/portfolio/new">
          <PlusIcon />
          Trades
        </Link>
      </Button>
      <DataTable columns={columns} data={cryptos as unknown as HoldingRow[]} />
    </div>
  );
}
