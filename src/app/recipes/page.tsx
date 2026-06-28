import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpenText,
  Grid2X2,
  List,
  SlidersHorizontal,
} from "lucide-react";
import { getRecipeList, getUserTags } from "@/data/recipes";
import { AuthenticatedRecipesShell } from "@/components/authenticated-recipes-shell";
import { Pagination } from "@/components/pagination";
import { RecipeCard, RecipeListItem } from "@/components/recipe-card";
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
    view?: string;
  }>;
};

type RecipeViewMode = "list" | "grid";

function getViewHref(
  nextView: RecipeViewMode,
  filters: {
    query?: string;
    tag?: string;
    page: number;
  },
) {
  const searchParams = new URLSearchParams();

  if (filters.query) searchParams.set("q", filters.query);
  if (filters.tag) searchParams.set("tag", filters.tag);
  if (filters.page > 1) searchParams.set("page", String(filters.page));
  searchParams.set("view", nextView);

  return `/recipes?${searchParams.toString()}`;
}

export default async function RecipesPage({
  searchParams,
}: RecipesPageProps) {
  const params = await searchParams;
  const query = params.q?.trim().slice(0, 120);
  const tag = params.tag?.trim().slice(0, 40);
  const view: RecipeViewMode = params.view === "list" ? "list" : "grid";
  const requestedPage = Number.parseInt(params.page ?? "1", 10);
  const page = Number.isFinite(requestedPage) ? Math.max(1, requestedPage) : 1;


  const [{ recipes, total, totalPages, page: currentPage }, tags] =
    await Promise.all([getRecipeList({ query, tag, page }), getUserTags()]);

  const hasFilters = Boolean(query || tag);
  const eagerImageRecipeId = recipes.find((recipe) => recipe.imageUrl)?.id;

  return (
    <AuthenticatedRecipesShell
      centerContent={
        <RecipeSearch query={query} selectedTag={tag} view={view} />
      }
    >
      <main className="bg-muted/20">
        <h1 className="sr-only">Todas as receitas</h1>
        <section className="bg-background">
          <div className="border-b border-border px-4 sm:px-7">
            <RecipeFilters
              query={query}
              selectedTag={tag}
              view={view}
              tags={tags}
            />
          </div>

          <div className="flex flex-col gap-4 border-b border-border px-4 py-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <p>{total === 1 ? "1 receita" : `${total} receitas`}</p>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2">
                <SlidersHorizontal className="size-4" aria-hidden="true" />
                Ordenar: criação recente
              </span>
              <div
                className="inline-flex rounded-full border border-border bg-card p-1"
                role="group"
                aria-label="Modo de visualização"
              >
                <Button
                  asChild
                  variant={view === "list" ? "default" : "ghost"}
                  size="sm"
                  className="h-8 px-3"
                >
                  <Link
                    href={getViewHref("list", { query, tag, page: currentPage })}
                    prefetch={false}
                    aria-label="Ver receitas em lista"
                    aria-current={view === "list" ? "page" : undefined}
                  >
                    <List className="size-4" aria-hidden="true" />
                    Lista
                  </Link>
                </Button>
                <Button
                  asChild
                  variant={view === "grid" ? "default" : "ghost"}
                  size="sm"
                  className="h-8 px-3"
                >
                  <Link
                    href={getViewHref("grid", { query, tag, page: currentPage })}
                    prefetch={false}
                    aria-label="Ver receitas em grid"
                    aria-current={view === "grid" ? "page" : undefined}
                  >
                    <Grid2X2 className="size-4" aria-hidden="true" />
                    Grid
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {recipes.length ? (
            <>
            {view === "list" ? (
              <div>
                {recipes.map((recipe) => (
                  <RecipeListItem
                    key={recipe.id}
                    recipe={recipe}
                    imageLoading={
                      recipe.id === eagerImageRecipeId ? "eager" : "lazy"
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="grid gap-6 p-4 sm:grid-cols-2 sm:p-7 xl:grid-cols-4">
                {recipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    imageLoading={
                      recipe.id === eagerImageRecipeId ? "eager" : "lazy"
                    }
                  />
                ))}
              </div>
            )}
            <div className="border-t border-border px-4 py-6 sm:px-7">
              <Pagination
                page={currentPage}
                totalPages={totalPages}
                query={query}
                tag={tag}
                view={view}
              />
            </div>
            </>
          ) : (
            <Card className="m-4 flex flex-col items-center border-dashed bg-card px-6 py-16 text-center sm:m-7">
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
              <Link
                href={hasFilters ? "/recipes" : "/recipes/new"}
                prefetch={false}
              >
                {hasFilters ? "Limpar filtros" : "Criar primeira receita"}
              </Link>
            </Button>
            </Card>
          )}
        </section>
      </main>
    </AuthenticatedRecipesShell>
  );
}
