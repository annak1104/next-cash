import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ArrowRightLeft,
  BusFront,
  Calculator,
  CircleDollarSign,
  Landmark,
  Lightbulb,
  PiggyBank,
  ReceiptText,
  ShoppingCart,
  Sparkles,
  WalletCards,
} from "lucide-react";

type TransactionType = "income" | "expense" | "transfer" | "adjustment";

const typeStyles: Record<TransactionType, string> = {
  income:
    "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300",
  expense:
    "bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-950/50 dark:text-red-300",
  transfer:
    "bg-sky-100 text-sky-700 hover:bg-sky-100 dark:bg-sky-950/50 dark:text-sky-300",
  adjustment:
    "bg-sky-100 text-sky-700 hover:bg-sky-100 dark:bg-sky-950/50 dark:text-sky-300",
};

const iconClassName = "h-5 w-5 stroke-[2.4]";

function renderCategoryIcon(
  category: string | null | undefined,
  transactionType: string | null | undefined,
) {
  const normalizedCategory = category?.toLowerCase() ?? "";

  if (transactionType === "transfer") {
    return <ArrowRightLeft className={iconClassName} />;
  }
  if (transactionType === "adjustment") {
    return <Calculator className={iconClassName} />;
  }
  if (transactionType === "income") {
    if (
      normalizedCategory.includes("salary") ||
      normalizedCategory.includes("зарп")
    ) {
      return <WalletCards className={iconClassName} />;
    }
    return <CircleDollarSign className={iconClassName} />;
  }

  if (
    normalizedCategory.includes("product") ||
    normalizedCategory.includes("supermarket") ||
    normalizedCategory.includes("grocery") ||
    normalizedCategory.includes("продукт") ||
    normalizedCategory.includes("супермаркет")
  ) {
    return <ShoppingCart className={iconClassName} />;
  }

  if (
    normalizedCategory.includes("beauty") ||
    normalizedCategory.includes("health") ||
    normalizedCategory.includes("краса") ||
    normalizedCategory.includes("здоров")
  ) {
    return <Sparkles className={iconClassName} />;
  }

  if (
    normalizedCategory.includes("utility") ||
    normalizedCategory.includes("комун") ||
    normalizedCategory.includes("electric")
  ) {
    return <Lightbulb className={iconClassName} />;
  }

  if (
    normalizedCategory.includes("transport") ||
    normalizedCategory.includes("транспорт")
  ) {
    return <BusFront className={iconClassName} />;
  }

  if (
    normalizedCategory.includes("bank") ||
    normalizedCategory.includes("cash") ||
    normalizedCategory.includes("account")
  ) {
    return <Landmark className={iconClassName} />;
  }

  return transactionType === "expense" ? (
    <ReceiptText className={iconClassName} />
  ) : (
    <PiggyBank className={iconClassName} />
  );
}

export function TransactionTypeBadge({
  type,
}: {
  type: string | null | undefined;
}) {
  const normalizedType = (type ?? "expense") as TransactionType;
  const className =
    typeStyles[normalizedType] ?? "bg-muted text-muted-foreground";

  return (
    <Badge
      className={cn(
        "rounded-md px-2.5 py-1 text-sm font-semibold capitalize shadow-none",
        className,
      )}
    >
      {type ?? "--"}
    </Badge>
  );
}

export function TransactionCategoryLabel({
  category,
  type,
  className,
}: {
  category: string | null | undefined;
  type: string | null | undefined;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-[220px] items-center gap-3", className)}>
      <span className="text-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-transparent">
        {renderCategoryIcon(category, type)}
      </span>
      <span className="text-foreground text-base leading-snug font-medium whitespace-normal">
        {category || "--"}
      </span>
    </div>
  );
}
