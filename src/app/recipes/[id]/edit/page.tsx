import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { updateRecipe } from "@/app/actions/recipes";
import { RecipeForm } from "@/components/recipe-form";
import { getRecipeById } from "@/data/recipes";
import { requireCurrentUser } from "@/lib/session";

type EditRecipePageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Editar receita",
};

export default async function EditRecipePage({
  params,
}: EditRecipePageProps) {
  const { id } = await params;
  const [user, recipe] = await Promise.all([
    requireCurrentUser(),
    getRecipeById(id),
  ]);

  if (!recipe) {
    notFound();
  }

  const updateAction = updateRecipe.bind(null, recipe.id);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">
          Ajuste os detalhes
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Editar receita
        </h1>
        <p className="mt-3 text-muted-foreground">
          Atualize ingredientes, preparo, tags ou a foto da receita.
        </p>
      </div>
      <RecipeForm
        action={updateAction}
        userId={user.id}
        defaultValues={recipe}
        submitLabel="Salvar alterações"
        cancelHref={`/recipes/${recipe.id}`}
      />
    </main>
  );
}
