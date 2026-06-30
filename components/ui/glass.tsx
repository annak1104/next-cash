import * as React from "react";

import { cn } from "@/lib/utils";

function GlassContainer({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="glass-container"
      className={cn("glass-surface rounded-3xl", className)}
      {...props}
    />
  );
}

function GlassCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="glass-card"
      className={cn("glass-card p-6", className)}
      {...props}
    />
  );
}

function GlassPanel({ className, ...props }: React.ComponentProps<"section">) {
  return (
    <section
      data-slot="glass-panel"
      className={cn("glass-card p-4 sm:p-6", className)}
      {...props}
    />
  );
}

export { GlassCard, GlassContainer, GlassPanel };
