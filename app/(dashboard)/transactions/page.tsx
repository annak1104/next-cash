import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getTransactionsByMonth } from "@/data/getTransactionsByMonth";
import { getTransactionYearsRange } from "@/data/getTransactionYearRange";
import { format } from "date-fns";
import { Edit2Icon } from "lucide-react";
import Link from "next/link";
import numeral from "numeral";
import z from "zod";
import Filters from "./filters";

const today = new Date();

const searchSchema = z.object({
  year: z.coerce
    .number()
    .min(today.getFullYear() - 100)
    .max(today.getFullYear() + 1)
    .catch(today.getFullYear()),
  month: z.coerce
    .number()
    .min(1)
    .max(12)
    .catch(today.getMonth() + 1),
});

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const searchParamsValues = await searchParams;
  const { month, year } = searchSchema.parse(searchParamsValues);
  const selectedDate = new Date(year, month - 1, 1);
  const transactions = await getTransactionsByMonth({ month, year });
  const yearsRange = await getTransactionYearsRange();

  return (
    <div className="mx-auto max-w-7xl px-1 py-10">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/net-worth/budget">Budget</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Transactions</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex flex-col justify-between gap-4 sm:flex-row">
            <span>{format(selectedDate, "MMM yyyy")} Transactions</span>
            <div>
              <Filters month={month} year={year} yearsRange={yearsRange} />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* <Button asChild>
            <Link href="/transactions/new">New transaction</Link>
          </Button> */}
          {!transactions?.length && (
            <p className="text-muted-foreground py-10 text-center text-lg">
              There are no transactions this month
            </p>
          )}
          {!!transactions?.length && (
            <Table className="mt-4">
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {format(transaction.transactionDate, "do MMM yyyy")}
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell className="capitalize">
                      <Badge
                        className={
                          transaction.transactionType === "income"
                            ? "bg-lime-500"
                            : "bg-orange-500"
                        }
                      >
                        {transaction.transactionType}
                      </Badge>
                    </TableCell>
                    <TableCell>{transaction.category}</TableCell>
                    <TableCell>
                      ${numeral(transaction.amount).format("0,0[.]00")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        asChild
                        size="icon"
                        aria-label="edit transaction"
                      >
                        <Link href={`transactions/${transaction.id}`}>
                          <Edit2Icon />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
