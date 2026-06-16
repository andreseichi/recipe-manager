import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({
  className,
  type,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-xl border border-border bg-card px-3.5 py-2 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-3 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
