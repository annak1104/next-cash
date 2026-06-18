export type TransactionType = "income" | "expense" | "transfer" | "adjustment";

type TransactionTypeInput = {
  transactionType?: string | null;
  categoryType?: string | null;
  transferId?: number | null;
};

export function getEffectiveTransactionType({
  transactionType,
  categoryType,
  transferId,
}: TransactionTypeInput): TransactionType {
  if (transactionType === "transfer" || transferId != null) {
    return "transfer";
  }

  if (transactionType === "adjustment") {
    return "adjustment";
  }

  if (transactionType === "income" || transactionType === "expense") {
    return transactionType;
  }

  if (categoryType === "income" || categoryType === "expense") {
    return categoryType;
  }

  return "expense";
}

export function isCashflowTransaction(type: TransactionType): boolean {
  return type === "income" || type === "expense";
}
