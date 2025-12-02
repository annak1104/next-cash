import { pgTable, integer, text, numeric, timestamp } from "drizzle-orm/pg-core";

export const cryptoTradesTable = pgTable("crypto_trades", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: text("user_id").notNull(),
  symbol: text().notNull(),         // BTC, ETH...
  amount: numeric().notNull(),      // кількість монет (0.5 BTC)
  price: numeric().notNull(),       // ціна за 1 монету
  totalValue: numeric().notNull(),  // amount * price (зручно для агрегації)
  tradeDate: timestamp("trade_date").defaultNow(),
  type: text({ enum: ["buy", "sell"] }).notNull(),
});
