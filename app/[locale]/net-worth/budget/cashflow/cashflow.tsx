import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAnnualCashflow } from "@/data/getAnualCashflow";
import { getTransactionYearsRange } from "@/data/getTransactionYearRange";
import { CashflowContent } from "./cashflow-content";
import CashflowFilters from "./cashflow-filters";

export default async function Cashflow({ year }: { year: number }) {
  const [cashflow, yearsRange] = await Promise.all([
    getAnnualCashflow(year),
    getTransactionYearsRange(),
  ]);

  return (
    <Card className="mb-5 overflow-hidden">
      <CardHeader>
        <CardTitle className="flex justify-between">
          <span>Cashflow</span>
          <CashflowFilters year={year} yearsRange={yearsRange} />
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-[1fr]">
        <CashflowContent annualCashflow={cashflow} />
      </CardContent>
    </Card>
  );
}
