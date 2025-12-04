"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import PortfolioForm from "@/components/portfolio-form";
import { createPortfolio } from "./actions";
import { z } from "zod";
import { portfolioSchema } from "@/validation/portfolioSchema";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function CreatePortfolioDialog({ open, onOpenChange }: Props) {
  const router = useRouter();

  const handleSubmit = async (data: z.infer<typeof portfolioSchema>) => {
    const result = await createPortfolio({
      name: data.name,
      description: data.description,
      currency: data.currency,
    });

    if (result.error) {
      toast.error(result.message);
      return;
    }

    toast.success("Portfolio created successfully");
    onOpenChange(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create new portfolio</DialogTitle>
        </DialogHeader>
        <PortfolioForm onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  );
}

