"use client";

import * as SwitchPrimitive from "@radix-ui/react-switch";
import * as React from "react";

import { cn } from "@/lib/utils";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "glass-control peer focus-visible:ring-ring/40 data-[state=checked]:bg-primary/85 data-[state=unchecked]:bg-input/80 dark:data-[state=unchecked]:bg-input/60 inline-flex h-6 w-11 shrink-0 items-center rounded-full border-transparent shadow-sm transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "dark:data-[state=checked]:bg-primary-foreground dark:data-[state=unchecked]:bg-foreground pointer-events-none block size-5 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.24)] ring-0 transition-transform duration-300 ease-out data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
