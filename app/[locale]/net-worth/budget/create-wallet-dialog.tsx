"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import CreateWalletForm from "./create-wallet-form";
import { createWallet } from "./actions";
import { z } from "zod";
import { walletSchema } from "@/validation/walletSchema";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function CreateWalletDialog({ open, onOpenChange }: Props) {
  const router = useRouter();

  const handleSubmit = async (data: z.infer<typeof walletSchema>) => {
    const result = await createWallet({
      name: data.name,
      currency: data.currency,
    });

    if (result.error) {
      toast.error(result.message);
      return;
    }

    toast.success("Account created successfully");
    onOpenChange(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new account</DialogTitle>
        </DialogHeader>
        <CreateWalletForm
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

