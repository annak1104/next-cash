import { addDays } from "date-fns";
import z from "zod";

export const tradeSchema = z.object({
  type: z.enum(["buy", "sell", "revaluation"]),
  portfolioId: z.number().positive("Please select a portfolio"),
  ticker: z.string().min(1, "Ticker is required"),
  tickerId: z.string().optional(), // CoinGecko ID for crypto
  tickerName: z.string().optional(), // Full name
  tickerImage: z.string().optional(), // Image URL
  assetType: z.enum(["crypto", "stock"]).default("crypto"),
  transactionDate: z.coerce
    .date()
    .max(addDays(new Date(), 1), "Transaction date cannot be in the future"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  price: z.coerce.number().positive("Price must be greater than 0"),
  fee: z
    .coerce.number()
    .min(0, "Fee cannot be negative")
    .optional()
    .nullable()
    .transform((v) => (v === null ? undefined : v)),
  entryType: z.enum(["single", "multiple"]).default("single"),
  // Cash update
  updateCash: z.boolean().default(true),
  walletId: z
    .number()
    .positive("Please select a cash account")
    .optional(),
  exchangeRate: z
    .coerce.number()
    .positive("Exchange rate must be greater than 0")
    .default(1),
});



