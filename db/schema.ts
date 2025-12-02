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
});
