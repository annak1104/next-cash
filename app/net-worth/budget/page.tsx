import Cashflow from "@/app/net-worth/budget/cashflow/cashflow";
import RecentTransactions from "@/app/net-worth/budget/recent-transactions";

export default async function BudgetPage({
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
      <Cashflow year={cfYear} />
      <RecentTransactions />
    </div>
  );
}
