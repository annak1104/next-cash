import PortfolioPage from "../portfolio/page";

export default async function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-1 py-5">
      {/* <h1 className="pb-5 text-4xl font-semibold">Dashboard</h1> */}
      <PortfolioPage />
    </div>
  );
}
