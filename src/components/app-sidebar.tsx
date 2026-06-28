"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Home, LayoutGrid, LogOut, ShoppingBag } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

type AppSidebarProps = {
  user: {
    name: string;
    email: string;
  };
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

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const initials = getInitials(user.name) || "EU";

  async function signOut() {
    setPending(true);
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  const navItems = [
    {
      label: "Início",
      href: "/",
      icon: Home,
      active: pathname === "/",
    },
    {
      label: "Todas as receitas",
      href: "/recipes",
      icon: LayoutGrid,
      active: pathname.startsWith("/recipes"),
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/recipes"
            prefetch={false}
            className="inline-flex items-center gap-2 font-display text-lg font-bold"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <ShoppingBag className="size-4" aria-hidden="true" />
            </span>
            Baú de Receitas
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={signOut}
              disabled={pending}
              className="grid size-10 place-items-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground disabled:opacity-60"
              aria-label={pending ? "Saindo da conta" : "Sair da conta"}
            >
              {initials}
            </button>
          </div>
        </div>
      </header>

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-card/95 lg:flex">
        <div className="flex min-h-0 flex-1 flex-col px-4 py-8">
          <Link
            href="/recipes"
            prefetch={false}
            className="mb-8 inline-flex items-center gap-3 px-1 font-display text-2xl font-bold"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <ShoppingBag className="size-5" aria-hidden="true" />
            </span>
            Baú de Receitas
          </Link>

          <nav className="space-y-2" aria-label="Navegação principal">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  prefetch={false}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-muted-foreground transition hover:bg-secondary/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35",
                    item.active &&
                      "bg-secondary font-bold text-primary hover:bg-secondary hover:text-primary",
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex-1" aria-hidden="true" />

          <div className="mt-6 border-t border-border pt-4">
            <div className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground">
                {initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {user.email}
                </p>
              </div>
              <button
                type="button"
                onClick={signOut}
                disabled={pending}
                className="grid size-9 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-destructive disabled:opacity-60"
                aria-label={pending ? "Saindo da conta" : "Sair da conta"}
              >
                <LogOut className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
