import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RecipeDetailContent } from "@/components/recipe-detail-content";
import { getSharedRecipeByToken } from "@/data/recipes";

type SharedRecipePageProps = {
  params: Promise<{ token: string }>;
};

export async function generateMetadata({
  params,
}: SharedRecipePageProps): Promise<Metadata> {
  const { token } = await params;
  const recipe = await getSharedRecipeByToken(token);

  return {
    title: recipe?.title ?? "Receita não encontrada",
    description: recipe?.description ?? "Receita compartilhada.",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function SharedRecipePage({
  params,
}: SharedRecipePageProps) {
  const { token } = await params;
  const recipe = await getSharedRecipeByToken(token);

  if (!recipe) {
    notFound();
  }

  return (
    <RecipeDetailContent
      recipe={recipe}
      className="bg-background"
      emptyImageHint={null}
      showUpdatedAt={false}
    />
  );
}
