import z from "zod";

export const walletSchema = z.object({
  name: z
    .string()
    .min(1, "Account name is required")
    .max(100, "Account name must contain a maximum of 100 characters"),
  currency: z.string().min(1, "Currency is required"),
});

