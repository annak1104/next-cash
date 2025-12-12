"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import CreateWalletDialog from "./create-wallet-dialog";

export default function CreateWalletButton() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setDialogOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Create new account
      </Button>
      <CreateWalletDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}

