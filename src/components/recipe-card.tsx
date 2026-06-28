import Image from "next/image";
import Link from "next/link";
import { Clock3, ImageIcon, MoreHorizontal, UsersRound } from "lucide-react";
import type { RecipeListItemDTO } from "@/data/recipes";
import { Card } from "@/components/ui/card";
import { formatMinutes } from "@/lib/utils";

const difficultyLabels = {
  EASY: "Fácil",
  MEDIUM: "Médio",
  HARD: "Difícil",
} as const;

type RecipeCardProps = {
  recipe: RecipeListItemDTO;
  imageLoading?: "eager" | "lazy";
};

export function RecipeCard({ recipe, imageLoading = "lazy" }: RecipeCardProps) {
  return (
    <Link
      href={`/recipes/${recipe.id}`}
      prefetch={false}
      className="group block rounded-[1.35rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-4"
    >
      <Card className="flex h-full flex-col overflow-hidden rounded-[1.35rem] border-border bg-card shadow-sm transition duration-300 group-hover:-translate-y-1 group-hover:border-primary/25 group-hover:shadow-xl group-hover:shadow-primary/10">
        <div className="relative aspect-4/3 overflow-hidden border-b border-dashed border-border bg-muted/45">
          {recipe.imageUrl ? (
            <Image
              src={recipe.imageUrl}
              alt=""
              fill
              loading={imageLoading}
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="grid h-full place-items-center text-center text-muted-foreground">
              <div>
                <ImageIcon className="mx-auto size-8" aria-hidden="true" />
                <p className="mt-3 text-sm font-medium">Sem foto</p>
                <p className="mt-1 text-xs">adicione uma imagem na edição</p>
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col justify-between p-5">
          <div>
            <h2 className="font-display text-2xl font-bold leading-tight transition-colors group-hover:text-primary">
              {recipe.title}
            </h2>
            {recipe.tags.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {recipe.tags.map((tag) => (
                  <span
                    key={tag.normalizedName}
                    className="rounded-full border border-border bg-secondary/70 px-2.5 py-1 text-xs font-semibold text-secondary-foreground"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 pt-4 text-xs font-medium text-muted-foreground">
            {recipe.prepTimeMinutes ? (
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="size-3.5" aria-hidden="true" />
                {formatMinutes(recipe.prepTimeMinutes)}
              </span>
            ) : null}
            {recipe.servings ? (
              <span className="inline-flex items-center gap-1.5">
                <UsersRound className="size-3.5" aria-hidden="true" />
                {recipe.servings} porções
              </span>
            ) : null}
            {recipe.difficulty ? (
              <span className="inline-flex items-center gap-1.5">
                <UsersRound className="size-3.5" aria-hidden="true" />
                {difficultyLabels[recipe.difficulty]}
              </span>
            ) : null}
          </div>
        </div>
      </Card>
    </Link>
  );
}

export function RecipeListItem({
  recipe,
  imageLoading = "lazy",
}: RecipeCardProps) {
  return (
    <Link
      href={`/recipes/${recipe.id}`}
      prefetch={false}
      className="group block border-b border-border last:border-b-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      <article className="grid gap-4 bg-background px-4 py-4 transition hover:bg-muted/35 sm:grid-cols-[5rem_minmax(0,1fr)_auto] sm:items-center sm:px-7">
        <div className="relative size-20 overflow-hidden rounded-xl border border-border bg-muted/50">
          {recipe.imageUrl ? (
            <Image
              src={recipe.imageUrl}
              alt=""
              fill
              loading={imageLoading}
              sizes="80px"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="grid h-full place-items-center bg-[repeating-linear-gradient(45deg,var(--muted),var(--muted)_8px,transparent_8px,transparent_16px)] text-muted-foreground">
              <ImageIcon className="size-5" aria-hidden="true" />
            </div>
          )}
        </div>

        <div className="min-w-0">
          <h2 className="font-display text-xl font-bold leading-tight transition-colors group-hover:text-primary">
            {recipe.title}
          </h2>
          <p className="mt-2 max-w-xl truncate text-sm text-muted-foreground">
            {recipe.description || "Sem descrição adicionada."}
          </p>
          {recipe.tags.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {recipe.tags.map((tag) => (
                <span
                  key={tag.normalizedName}
                  className="rounded-full border border-border bg-card px-2.5 py-1 text-xs font-semibold text-muted-foreground"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground sm:justify-end">
          <div className="flex min-w-32 items-center gap-2 whitespace-nowrap">
            {recipe.prepTimeMinutes ? (
              <span>{formatMinutes(recipe.prepTimeMinutes)}</span>
            ) : null}
            {recipe.prepTimeMinutes && recipe.difficulty ? (
              <span aria-hidden="true">•</span>
            ) : null}
            {recipe.difficulty ? (
              <span>{difficultyLabels[recipe.difficulty]}</span>
            ) : null}
          </div>
          {recipe.servings ? (
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs">
              <UsersRound className="size-3.5" aria-hidden="true" />
              {recipe.servings}
            </span>
          ) : null}
          <MoreHorizontal className="size-4" aria-hidden="true" />
        </div>
      </article>
    </Link>
  );
}
