import * as React from "react";
import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "flex min-h-28 w-full resize-y rounded-xl border border-border bg-card px-3.5 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-3 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
