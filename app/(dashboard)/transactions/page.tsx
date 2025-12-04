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
                  <TableHead>Type</TableHead>
                  <TableHead className="cursor-pointer">Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>From/To</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => {
                  const transactionType =
                    transaction.transactionType ||
                    (transaction.category === "income" ? "income" : "expense");
                  const isTransfer = transactionType === "transfer";
                  const isAdjustment = transactionType === "adjustment";
                  const isIncome = transactionType === "income";
                  const isExpense = transactionType === "expense";

                  // Badge color logic
                  let badgeColor = "bg-orange-500"; // default expense
                  if (isIncome) {
                    badgeColor = "bg-lime-500";
                  } else if (isTransfer || isAdjustment) {
                    badgeColor = "bg-sky-500";
                  }

                  // Format amount with currency
                  const currency = transaction.walletCurrency || "USD";
                  const currencySymbol =
                    currency === "USD"
                      ? "$"
                      : currency === "UAH"
                        ? "₴"
                        : currency === "EUR"
                          ? "€"
                          : currency === "GBP"
                            ? "£"
                            : "$";
                  const amount = Number(transaction.amount);
                  const formattedAmount = `${currencySymbol}${numeral(amount).format("0,0[.]00")}`;

                  // Format fee
                  const fee = transaction.fee ? Number(transaction.fee) : null;
                  const formattedFee = fee
                    ? `${currencySymbol}${numeral(fee).format("0,0[.]00")}`
                    : "--";

                  return (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <Badge className={badgeColor}>
                          {transactionType || "expense"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(
                          new Date(transaction.transactionDate),
                          "dd-MM-yyyy",
                        )}
                      </TableCell>
                      <TableCell>{transaction.category || "--"}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {transaction.description || "--"}
                      </TableCell>
                      <TableCell>
                        {isTransfer ? (
                          <div className="flex flex-col gap-1 text-sm">
                            {transaction.fromWalletName && (
                              <span className="text-muted-foreground">
                                from {transaction.fromWalletName}
                              </span>
                            )}
                            {transaction.toWalletName && (
                              <span>to {transaction.toWalletName}</span>
                            )}
                            {!transaction.fromWalletName &&
                              !transaction.toWalletName && (
                                <span className="text-muted-foreground">
                                  --
                                </span>
                              )}
                          </div>
                        ) : transaction.walletName ? (
                          <span>{transaction.walletName}</span>
                        ) : (
                          <span className="text-muted-foreground">--</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formattedAmount}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formattedFee}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          asChild
                          size="icon"
                          aria-label="edit transaction"
                          className="h-8 w-8"
                        >
                          <Link href={`transactions/${transaction.id}`}>
                            <Edit2Icon className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
