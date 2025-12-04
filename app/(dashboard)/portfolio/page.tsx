import { Button } from "@/components/ui/button";
import { getPortfolioHoldings } from "@/data/getPortfolioHoldings";
import getPortfolios from "@/data/getPortfolios";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import CreatePortfolioButton from "./create-portfolio-button";
import PortfolioHoldingsSection from "./portfolio-holdings-section";

export default async function PortfolioPage() {
  const portfolios = await getPortfolios();
  const initialHoldings = await getPortfolioHoldings();

  return (
    <div className="mx-auto max-w-7xl px-1 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Holdings</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="portfolio/new">
              <PlusIcon className="mr-2 h-4 w-4" />
              Trades
            </Link>
          </Button>
          <CreatePortfolioButton />
        </div>
      </div>

      <PortfolioHoldingsSection
        portfolios={portfolios}
        initialHoldings={initialHoldings}
      />
    </div>
  );
}
