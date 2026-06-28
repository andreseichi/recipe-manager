"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, Plus, ShoppingBag } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

type AppTopbarProps = {
  user: {
    name: string;
    email: string;
  };
  centerContent?: React.ReactNode;
};

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function AppTopbar({ user, centerContent }: AppTopbarProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const initials = getInitials(user.name) || "EU";

  async function signOut() {
    setPending(true);
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 px-4 py-4 backdrop-blur sm:px-6 lg:px-7">
      <div className="grid w-full gap-4 lg:grid-cols-[minmax(12rem,1fr)_minmax(18rem,34rem)_minmax(12rem,1fr)] lg:items-center">
        <Link
          href="/recipes"
          prefetch={false}
          className="inline-flex items-center gap-3 font-display text-xl font-bold tracking-tight"
        >
          <span className="grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <ShoppingBag className="size-5" aria-hidden="true" />
          </span>
          Recipe Manager
        </Link>

        {centerContent ? (
          <div className="w-full lg:justify-self-center">{centerContent}</div>
        ) : (
          <div className="hidden lg:block" aria-hidden="true" />
        )}

        <div className="flex items-center gap-3 lg:justify-self-end">
          <Button asChild size="sm" className="px-4">
            <Link href="/recipes/new" prefetch={false}>
              <Plus className="size-4" aria-hidden="true" />
              Nova receita
            </Link>
          </Button>
          <div className="flex items-center gap-2 rounded-full border border-border box-content bg-card pr-2 shadow-sm">
            <span
              className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground"
              aria-hidden="true"
            >
              {initials}
            </span>
            <span className="hidden max-w-36 truncate text-xs font-semibold sm:inline">
              {user.name}
            </span>
            <button
              type="button"
              onClick={signOut}
              disabled={pending}
              className="grid size-8 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-destructive disabled:opacity-60"
              aria-label={pending ? "Saindo da conta" : "Sair da conta"}
            >
              <LogOut className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
