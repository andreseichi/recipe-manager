import Link from "next/link";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";

export default function SharedRecipeNotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-muted/20 px-4 py-16">
      <div className="max-w-md text-center">
        <Brand className="justify-center" />
        <p className="mt-8 text-sm font-bold uppercase tracking-[0.18em] text-primary">
          Link indisponível
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold">
          Receita não encontrada
        </h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          O link pode ter sido desativado por quem compartilhou ou nunca ter
          existido.
        </p>
        <Button asChild className="mt-7">
          <Link href="/">Voltar ao início</Link>
        </Button>
      </div>
    </main>
  );
}
