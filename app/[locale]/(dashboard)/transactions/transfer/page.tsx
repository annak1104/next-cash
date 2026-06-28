import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import getWallets from "@/data/getWallets";
import Link from "next/link";
import { getCashTransferCategoryId } from "./actions";
import TransferTransactionForm from "./transfer-transaction-form";

export default async function TransferTransactionPage() {
  const cashTransferCategoryId = await getCashTransferCategoryId();
  const wallets = await getWallets();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/net-worth/budget">Budget</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Add transfer</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Card className="mt-4 max-w-3xl">
        <CardContent className="pt-6">
          <TransferTransactionForm
            cashTransferCategoryId={cashTransferCategoryId}
            wallets={wallets}
          />
        </CardContent>
      </Card>
    </div>
  );
}
