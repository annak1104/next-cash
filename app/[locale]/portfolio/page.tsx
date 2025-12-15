import { getPortfolioHistory } from "@/data/getPortfolioHistory";
import { getPortfolioHoldings } from "@/data/getPortfolioHoldings";
import { getPortfolioStats } from "@/data/getPortfolioStats";
import getPortfolios from "@/data/getPortfolios";
import CreatePortfolioButton from "./create-portfolio-button";
import PortfolioHoldingsSection from "./portfolio-holdings-section";
import PortfolioValueChart from "./portfolio-value-chart";

export default async function PortfolioPage() {
  const portfolios = await getPortfolios();
  const initialHoldings = await getPortfolioHoldings();
  const stats = await getPortfolioStats();
  const history = await getPortfolioHistory(undefined, 365);

  return (
    <div className="mx-auto max-w-7xl px-1 py-10">
      {/* Charts Section */}
      <div className="mb-6">
        <PortfolioValueChart
          data={history}
          currentValue={stats.totalValue}
          dailyPL={stats.dailyPL}
          dailyPLPercent={stats.dailyPLPercent}
          unrealizedPL={stats.unrealizedPL}
          unrealizedPLPercent={stats.unrealizedPLPercent}
          currency={stats.currency}
        />
        {/* <AssetAllocationTreemap
          holdings={initialHoldings}
          currency={stats.currency}
        /> */}
      </div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Portfolios</h1>
        <div className="flex gap-2">
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
