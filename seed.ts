import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import { categoriesTable } from "./db/schema";

dotenv.config({
  path: ".env.local",
});

const db = drizzle(process.env.DATABASE_URL!);

const categoriesSeedData: (typeof categoriesTable.$inferInsert)[] = [
  // Income categories
  {
    name: "Salary / Employment Income",
    type: "income",
  },
  {
    name: "Investment income / Dividends / Capital gains",
    type: "income",
  },
  {
    name: "Side income / Freelance",
    type: "income",
  },
  {
    name: "Cashback / Refunds",
    type: "income",
  },
  {
    name: "Gifts received",
    type: "income",
  },
  {
    name: "Sale of assets",
    type: "income",
  },
  {
    name: "Other income",
    type: "income",
  },
  // Expense categories
  {
    name: "Groceries",
    type: "expense",
  },
  {
    name: "Investments",
    type: "expense",
  },
  {
    name: "Food & Dining",
    type: "expense",
  },
  {
    name: "Transport & Taxi",
    type: "expense",
  },
  {
    name: "Auto & Fuel",
    type: "expense",
  },
  {
    name: "Utilities / Bills",
    type: "expense",
  },
  {
    name: "Health & Medical",
    type: "expense",
  },
  {
    name: "Clothing & Shoes",
    type: "expense",
  },
  {
    name: "Entertainment & Leisure",
    type: "expense",
  },
  {
    name: "Movies / Cinema",
    type: "expense",
  },
  {
    name: "Gifts & Holidays",
    type: "expense",
  },
  {
    name: "Home & Furniture",
    type: "expense",
  },
  {
    name: "Education",
    type: "expense",
  },
  {
    name: "Travel",
    type: "expense",
  },
  {
    name: "Internet & Telecom / Mobile bills",
    type: "expense",
  },
  {
    name: "Other",
    type: "expense",
  },
];

async function main() {
  await db.insert(categoriesTable).values(categoriesSeedData);
}

main();
