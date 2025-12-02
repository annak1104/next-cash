import z from "zod";

export const portfolioSchema = z.object({
  name: z
    .string()
    .min(1, "Portfolio name is required")
    .max(100, "Portfolio name must contain a maximum of 100 characters"),
  description: z
    .string()
    .max(500, "Description must contain a maximum of 500 characters")
    .optional(),
  currency: z.string().min(1, "Currency is required"),
});

