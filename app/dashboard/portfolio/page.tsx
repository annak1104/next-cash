import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import PortfolioCards from "./portfolio-cards";
import PortfolioSummary from "./portfolio-summary";
import CreatePortfolioButton from "./create-portfolio-button";
import getPortfolios from "@/data/getPortfolios";

export default async function PortfolioPage() {
  const portfolios = await getPortfolios();

  // TODO: Calculate actual portfolio stats from holdings
  const stats = {
    totalValue: 0,
    dailyPL: 0,
    dailyPLPercent: 0,
    unrealizedPL: 0,
    unrealizedPLPercent: 0,
    cash: 0,
    currency: "USD",
  };

  return (
    <div className="mx-auto max-w-7xl px-1 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-4xl font-semibold">Holdings</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/portfolio/new">
              <PlusIcon className="mr-2 h-4 w-4" />
              Trades
            </Link>
          </Button>
          <CreatePortfolioButton />
        </div>
      </div>

      <div className="mb-6 space-y-4">
        <PortfolioCards stats={stats} portfolios={portfolios} />

        <PortfolioSummary stats={stats} />
      </div>

      {/* TODO: Add filters and holdings table */}
      <div className="text-muted-foreground text-center">
        Portfolios: {portfolios.length}
        {/* Holdings table will be added here */}
      </div>
    </div>
  );
}
