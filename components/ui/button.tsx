import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "liquid-button inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold tracking-[-0.01em] shadow-sm outline-none transition-all disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 focus-visible:ring-[3px] focus-visible:ring-ring/40 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
  {
    variants: {
      variant: {
        default:
          "border border-white/35 bg-[linear-gradient(135deg,color-mix(in_oklch,var(--primary)_94%,white),color-mix(in_oklch,var(--primary)_82%,black))] text-primary-foreground shadow-[0_12px_30px_color-mix(in_srgb,var(--primary)_30%,transparent),inset_0_1px_0_rgba(255,255,255,0.42)] hover:shadow-[0_16px_38px_color-mix(in_srgb,var(--primary)_36%,transparent),inset_0_1px_0_rgba(255,255,255,0.5)]",
        destructive:
          "border border-red-300/30 bg-destructive/90 text-white shadow-[0_12px_30px_rgba(239,68,68,0.24),inset_0_1px_0_rgba(255,255,255,0.22)] hover:bg-destructive focus-visible:ring-destructive/25 dark:bg-destructive/70 dark:focus-visible:ring-destructive/40",
        outline:
          "glass-control text-foreground hover:text-accent-foreground focus-visible:border-ring",
        secondary:
          "glass-control text-secondary-foreground hover:text-foreground",
        ghost:
          "text-foreground/80 shadow-none hover:bg-glass-strong hover:text-foreground hover:shadow-[inset_0_1px_0_var(--glass-highlight),0_8px_22px_rgba(31,41,55,0.08)] dark:hover:bg-white/10",
        link: "rounded-md px-1 text-primary shadow-none hover:scale-100 hover:text-accent-color hover:underline hover:underline-offset-4",
      },
      size: {
        default: "h-10 px-5 py-2 has-[>svg]:px-4",
        sm: "h-8 gap-1.5 px-3.5 has-[>svg]:px-3",
        lg: "h-12 px-7 text-base has-[>svg]:px-5",
        icon: "glass-control size-10 rounded-full p-0",
        "icon-sm": "glass-control size-8 rounded-full p-0",
        "icon-lg": "glass-control size-12 rounded-full p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
