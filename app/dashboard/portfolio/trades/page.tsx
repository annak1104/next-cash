import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

import getPortfolios from "@/data/getPortfolios";
import { getTrades } from "@/data/getTrades";
import TradesTable from "./trades-table";

export default async function TradesPage() {
  const portfolios = await getPortfolios();
  const trades = await getTrades();

  return (
    <div className="mx-auto max-w-7xl px-1 py-10">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard/portfolio">Portfolio</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Trades</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Portfolio trades</CardTitle>
        </CardHeader>
        <CardContent>
          <TradesTable
            portfolios={portfolios.map((p) => ({ id: p.id, name: p.name }))}
            initialTrades={trades}
          />
        </CardContent>
      </Card>
    </div>
  );
}
