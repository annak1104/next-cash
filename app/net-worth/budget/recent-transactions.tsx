import { Badge } from "@/components/ui/badge";
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
import { getRecentTransactions } from "@/data/getRecentTransaction";
import { format } from "date-fns";
import Link from "next/link";
import numeral from "numeral";

export default async function RecentTransactions() {
  const transactions = await getRecentTransactions();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex-col gap-2 sm:flex sm:flex-row sm:justify-between">
          <span>Recent transactions</span>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/transactions">View all</Link>
            </Button>
            {/* <Button asChild>
              <Link href="/transactions/new">Create new</Link>
            </Button> */}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!transactions?.length && (
          <p className="text-muted-foreground py-10 text-center text-lg">
            You have no transactions yet
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
