import type { Metadata } from "next";
import Link from "next/link";
import { BookOpenText, Plus, SlidersHorizontal } from "lucide-react";
import { getRecipeList, getUserTags } from "@/data/recipes";
import { Pagination } from "@/components/pagination";
import { RecipeCard } from "@/components/recipe-card";
import { RecipeFilters, RecipeSearch } from "@/components/recipe-filters";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Minhas receitas",
};

type RecipesPageProps = {
  searchParams: Promise<{
    q?: string;
    tag?: string;
    page?: string;
  }>;
};

export default async function RecipesPage({
  searchParams,
}: RecipesPageProps) {
  const params = await searchParams;
  const query = params.q?.trim().slice(0, 120);
  const tag = params.tag?.trim().slice(0, 40);
  const requestedPage = Number.parseInt(params.page ?? "1", 10);
  const page = Number.isFinite(requestedPage) ? Math.max(1, requestedPage) : 1;

  const [{ recipes, total, totalPages }, tags] = await Promise.all([
    getRecipeList({ query, tag, page }),
    getUserTags(),
  ]);

  const hasFilters = Boolean(query || tag);

  return (
    <main className="min-h-screen">
      <div className="border-b border-border bg-background/85 px-4 py-5 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <RecipeSearch query={query} selectedTag={tag} />
          <Button
            asChild
            size="default"
            className="px-6 shadow-lg shadow-primary/20"
          >
            <Link href="/recipes/new">
              <Plus className="size-4" aria-hidden="true" />
              Nova receita
            </Link>
          </Button>
        </div>
      </div>

      <div className="mx-auto px-4 py-8 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">
              Todas as receitas
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {total === 1
                ? "1 receita na sua cozinha"
                : `${total} receitas na sua cozinha`}
            </p>
          </div>
          <span className="inline-flex h-10 items-center gap-2 self-start rounded-xl border border-border bg-card px-4 text-sm font-medium text-muted-foreground shadow-sm md:self-auto">
            <SlidersHorizontal className="size-4" aria-hidden="true" />
            Recentes
          </span>
        </div>

        <div className="mt-6">
          <RecipeFilters query={query} selectedTag={tag} tags={tags} />
        </div>

        {recipes.length ? (
          <>
            <div className="mt-7 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
            <div className="mt-10">
              <Pagination
                page={page}
                totalPages={totalPages}
                query={query}
                tag={tag}
              />
            </div>
          </>
        ) : (
          <Card className="mt-7 flex flex-col items-center border-dashed bg-card px-6 py-16 text-center">
            <span className="grid size-16 place-items-center rounded-3xl bg-secondary text-primary">
              <BookOpenText className="size-7" aria-hidden="true" />
            </span>
            <h2 className="mt-5 font-display text-2xl font-bold">
              {hasFilters
                ? "Nenhuma receita combina com os filtros"
                : "Seu caderno ainda está vazio"}
            </h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              {hasFilters
                ? "Tente outro nome, escolha uma tag diferente ou limpe os filtros."
                : "Comece adicionando aquela receita que você sempre procura quando chega a hora de cozinhar."}
            </p>
            <Button asChild className="mt-6">
              <Link href={hasFilters ? "/recipes" : "/recipes/new"}>
                {hasFilters ? "Limpar filtros" : "Criar primeira receita"}
              </Link>
            </Button>
          </Card>
        )}
      </div>
    </main>
  );
}
