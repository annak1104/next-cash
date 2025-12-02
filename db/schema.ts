import { date, integer, numeric, pgTable, text } from "drizzle-orm/pg-core";

export const categoriesTable = pgTable("categories", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull(),
  type: text({ enum: ["income", "expense"] }).notNull(),
});

// MUST be before transactionsTable
export const walletsTable = pgTable("wallets", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: text("user_id").notNull(),
  name: text().notNull(),
  currency: text().notNull(),
});

export const transfersTable = pgTable("transfers", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: text("user_id").notNull(),
  fromWalletId: integer("from_wallet_id")
    .references(() => walletsTable.id)
    .notNull(),
  toWalletId: integer("to_wallet_id")
    .references(() => walletsTable.id)
    .notNull(),
  amount: numeric().notNull(),
  fee: numeric("fee"),
  transactionDate: date("transaction_date").notNull(),
  description: text(),
  categoryId: integer("category_id").references(() => categoriesTable.id),
});

export const transactionsTable = pgTable("transactions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: text("user_id").notNull(),
  description: text().notNull(),
  amount: numeric().notNull(),
  transactionDate: date("transaction_date").notNull(),
  categoryId: integer("category_id")
    .references(() => categoriesTable.id)
    .notNull(),
  walletId: integer("wallet_id").references(() => walletsTable.id),
  transactionType: text({
    enum: ["income", "expense", "transfer", "adjustment"],
  }),
  // For transfers: fromWalletId and toWalletId
  fromWalletId: integer("from_wallet_id").references(() => walletsTable.id),
  toWalletId: integer("to_wallet_id").references(() => walletsTable.id),
  fee: numeric("fee"),
  // For linking transfer transactions together
  transferId: integer("transfer_id").references(() => transfersTable.id),
});
