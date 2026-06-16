import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl items-center px-4 py-12">
      <Card className="w-full p-8 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-secondary text-primary">
          <Compass className="size-6" aria-hidden="true" />
        </span>
        <p className="mt-5 text-sm font-bold uppercase tracking-[0.18em] text-primary">
          Erro 404
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold">
          Esta página não existe
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
          O endereço pode estar incorreto ou a página pode ter sido movida.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Voltar ao início</Link>
        </Button>
      </Card>
    </main>
  );
}
