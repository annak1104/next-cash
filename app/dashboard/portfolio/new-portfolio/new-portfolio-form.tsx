"use client";

import PortfolioForm from "@/components/portfolio-form";
import { createPortfolio } from "../actions";
import { z } from "zod";
import { portfolioSchema } from "@/validation/portfolioSchema";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function NewPortfolioForm() {
  const router = useRouter();

  async function handleSubmit(data: z.infer<typeof portfolioSchema>) {
    const result = await createPortfolio(data);
    if (result.error) {
      toast.error(result.message);
      return;
    }
    toast.success("Portfolio created successfully");
    router.push("/dashboard/portfolio");
  }

  return <PortfolioForm onSubmit={handleSubmit} />;
}

