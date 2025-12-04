"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import CreatePortfolioDialog from "./create-portfolio-dialog";

export default function CreatePortfolioButton() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setDialogOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Create portfolio
      </Button>
      <CreatePortfolioDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
