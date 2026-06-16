import Link from "next/link";
import { BookX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function RecipeNotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-2xl items-center px-4 py-12">
      <Card className="w-full p-8 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-secondary text-primary">
          <BookX className="size-6" aria-hidden="true" />
        </span>
        <h1 className="mt-5 font-display text-3xl font-bold">
          Receita não encontrada
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
          Ela pode ter sido removida ou pertencer a outra conta.
        </p>
        <Button asChild className="mt-6">
          <Link href="/recipes">Voltar para minhas receitas</Link>
        </Button>
      </Card>
    </main>
  );
}
