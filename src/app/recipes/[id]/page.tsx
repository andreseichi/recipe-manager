import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { AuthenticatedRecipesShell } from "@/components/authenticated-recipes-shell";
import { DeleteRecipeButton } from "@/components/delete-recipe-button";
import { RecipeDetailContent } from "@/components/recipe-detail-content";
import { ShareRecipeButton } from "@/components/share-recipe-button";
import { Button } from "@/components/ui/button";
import { getRecipeById } from "@/data/recipes";
import { getPublicRecipePath } from "@/lib/recipe-sharing";

type RecipePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: RecipePageProps): Promise<Metadata> {
  const { id } = await params;
  const recipe = await getRecipeById(id);

  return {
    title: recipe?.title ?? "Receita não encontrada",
  };
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { id } = await params;
  const recipe = await getRecipeById(id);

  if (!recipe) {
    notFound();
  }

  return (
    <AuthenticatedRecipesShell>
      <RecipeDetailContent
        recipe={recipe}
        backLink={
          <Link
            href="/recipes"
            prefetch={false}
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition hover:text-primary"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Todas as receitas
          </Link>
        }
        actions={
          <>
            <ShareRecipeButton
              recipeId={recipe.id}
              initialPublicPath={
                recipe.shareToken ? getPublicRecipePath(recipe.shareToken) : null
              }
            />
            <Button asChild variant="outline" size="sm">
              <Link href={`/recipes/${recipe.id}/edit`} prefetch={false}>
                <Pencil className="size-4" aria-hidden="true" />
                Editar
              </Link>
            </Button>
            <DeleteRecipeButton
              recipeId={recipe.id}
              recipeTitle={recipe.title}
            />
          </>
        }
      />
    </AuthenticatedRecipesShell>
  );
}
