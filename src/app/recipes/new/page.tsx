import type { Metadata } from "next";
import { createRecipe } from "@/app/actions/recipes";
import { RecipeForm } from "@/components/recipe-form";
import { requireCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Nova receita",
};

export default async function NewRecipePage() {
  const user = await requireCurrentUser();

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">
          Uma nova receita
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Adicionar receita
        </h1>
        <p className="mt-3 text-muted-foreground">
          Registre os detalhes agora para encontrar tudo quando for cozinhar.
        </p>
      </div>
      <RecipeForm
        action={createRecipe}
        userId={user.id}
        submitLabel="Salvar receita"
        cancelHref="/recipes"
      />
    </main>
  );
}
