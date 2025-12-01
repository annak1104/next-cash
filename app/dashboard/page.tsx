import Cashflow from "./cashflow";
import RecentTransactions from "./recent-transactions";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ cfyear: string }>;
}) {
  const today = new Date();
  const searchParamsValues = await searchParams;
  let cfYear = Number(searchParamsValues.cfyear ?? today.getFullYear());

  if (isNaN(cfYear)) {
    cfYear = today.getFullYear();
  }

  return (
    <div className="mx-auto max-w-7xl px-1 py-5">
      <h1 className="pb-5 text-4xl font-semibold">Dashboard</h1>
      <Cashflow year={cfYear} />
      <RecentTransactions />
    </div>
  );
}
