import Link from "next/link";
import { ChefHat } from "lucide-react";
import { cn } from "@/lib/utils";

export function Brand({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-2.5 font-display text-xl font-bold tracking-tight",
        className,
      )}
    >
      <span className="grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
        <ChefHat className="size-5" aria-hidden="true" />
      </span>
      Baú de Receitas
    </Link>
  );
}
