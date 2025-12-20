import { getMonthlyNetWorth } from "@/data/getMonthlyNetWorth";
import { getPortfolioStats } from "@/data/getPortfolioStats";
import { getTotalBalance } from "@/data/getTotalBalance";
import { getWalletBalances } from "@/data/getWalletBalance";
import getWallets from "@/data/getWallets";
import { getAnnualCashflow } from "@/data/getAnualCashflow";
import { getPortfolioHistory } from "@/data/getPortfolioHistory";
import SummaryCards from "./summary-cards";
import MonthlyNetWorthChart from "./monthly-net-worth-chart";
import WalletsList from "./wallets-list";

export default async function DashboardPage() {
  const today = new Date();
  const currentYear = today.getFullYear();

  // Fetch all data in parallel
  const [
    monthlyNetWorth,
    portfolioStats,
    totalBalance,
    wallets,
    balances,
    annualCashflow,
    portfolioHistory,
  ] = await Promise.all([
    getMonthlyNetWorth(12),
    getPortfolioStats(),
    getTotalBalance(),
    getWallets(),
    getWalletBalances(),
    getAnnualCashflow(currentYear),
    getPortfolioHistory(undefined, 30), // Last 30 days for mini charts
  ]);

  // Calculate totals for annual cashflow
  const totalIncome = annualCashflow.reduce(
    (sum, month) => sum + month.income,
    0,
  );
  const totalExpenses = annualCashflow.reduce(
    (sum, month) => sum + month.expenses,
    0,
  );
  const totalInvestmentsAmount = annualCashflow.reduce(
    (sum, month) => sum + month.investments,
    0,
  );

  // Calculate total net worth
  const totalNetWorth = totalBalance + portfolioStats.totalValue;

  // Calculate daily P&L for total net worth (portfolio daily PL only, cash doesn't change daily)
  const totalNetWorthDailyPL = portfolioStats.dailyPL;
  const totalNetWorthDailyPLPercent =
    totalNetWorth > 0 ? (totalNetWorthDailyPL / totalNetWorth) * 100 : 0;

  // Calculate unrealized P&L for total net worth
  const totalNetWorthUnrealizedPL = portfolioStats.unrealizedPL;
  const totalNetWorthUnrealizedPLPercent =
    totalNetWorth > 0
      ? (totalNetWorthUnrealizedPL / totalNetWorth) * 100
      : 0;

  // Get wallets with balances
  const walletsWithBalances = wallets.map((wallet) => ({
    ...wallet,
    balance: balances[wallet.id] ?? 0,
  }));

  // Use first wallet's currency or default to USD
  const currency = wallets[0]?.currency ?? "USD";

  // Format portfolio history for mini charts
  const chartData = portfolioHistory.map((point) => ({
    date: point.date,
    value: point.value,
  }));

  return (
    <div className="mx-auto max-w-7xl px-1 py-10 space-y-6">
      {/* Summary Cards */}
      <SummaryCards
        totalNetWorth={totalNetWorth}
        totalNetWorthDailyPL={totalNetWorthDailyPL}
        totalNetWorthDailyPLPercent={totalNetWorthDailyPLPercent}
        totalNetWorthUnrealizedPL={totalNetWorthUnrealizedPL}
        totalNetWorthUnrealizedPLPercent={totalNetWorthUnrealizedPLPercent}
        investments={portfolioStats.totalValue}
        investmentsDailyPL={portfolioStats.dailyPL}
        investmentsDailyPLPercent={portfolioStats.dailyPLPercent}
        investmentsUnrealizedPL={portfolioStats.unrealizedPL}
        investmentsUnrealizedPLPercent={portfolioStats.unrealizedPLPercent}
        budgetCash={totalBalance}
        income={totalIncome}
        expenses={totalExpenses}
        investmentsAmount={totalInvestmentsAmount}
        currency={currency}
        chartData={chartData}
      />

      {/* Chart and Wallets Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Monthly Net Worth Chart */}
        <div className="lg:col-span-2">
          <MonthlyNetWorthChart
            data={monthlyNetWorth}
            currency={currency}
          />
        </div>

        {/* Wallets List */}
        <div className="lg:col-span-1">
          <WalletsList wallets={walletsWithBalances} />
        </div>
      </div>
    </div>
  );
}
