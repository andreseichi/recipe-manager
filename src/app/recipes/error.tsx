"use client";

import { useEffect } from "react";
import { CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function RecipesError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-2xl items-center px-4 py-12">
      <Card className="w-full p-8 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-destructive/10 text-destructive">
          <CircleAlert className="size-6" aria-hidden="true" />
        </span>
        <h1 className="mt-5 font-display text-3xl font-bold">
          Algo saiu errado
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
          Não conseguimos carregar suas receitas agora. Tente novamente em
          alguns instantes.
        </p>
        <Button className="mt-6" onClick={() => unstable_retry()}>
          Tentar novamente
        </Button>
      </Card>
    </main>
  );
}
