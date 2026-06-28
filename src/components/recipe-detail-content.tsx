import Image from "next/image";
import { ChefHat, Clock3, ImageIcon, UsersRound } from "lucide-react";
import type { RecipeDetailDTO } from "@/data/recipes";
import { cn, formatDate, formatMinutes } from "@/lib/utils";

type RecipeDetailContentProps = {
  recipe: RecipeDetailDTO;
  actions?: React.ReactNode;
  backLink?: React.ReactNode;
  className?: string;
  emptyImageHint?: string | null;
  showUpdatedAt?: boolean;
};

const difficultyLabels = {
  EASY: "Fácil",
  MEDIUM: "Médio",
  HARD: "Difícil",
} as const;

export function RecipeDetailContent({
  recipe,
  actions,
  backLink,
  className,
  emptyImageHint = "adicione uma imagem na edição",
  showUpdatedAt = true,
}: RecipeDetailContentProps) {
  const primaryTag = recipe.tags[0];

  return (
    <main className={cn("min-h-screen px-4 py-8 sm:px-6 lg:px-10", className)}>
      <div className="mx-auto">
        {backLink}

        <div className="mt-6 overflow-hidden rounded-[1.75rem] border border-dashed border-border bg-muted/70">
          <div className="relative aspect-16/6 min-h-64">
            {recipe.imageUrl ? (
              <Image
                src={recipe.imageUrl}
                alt={`Foto de ${recipe.title}`}
                fill
                preload
                sizes="(max-width: 1024px) 100vw, 900px"
                className="object-cover"
              />
            ) : (
              <div className="grid h-full place-items-center text-center text-muted-foreground">
                <div>
                  <ImageIcon className="mx-auto size-8" aria-hidden="true" />
                  <p className="mt-3 text-sm font-medium">
                    Sem foto do prato
                  </p>
                  {emptyImageHint ? (
                    <p className="mt-1 text-xs">{emptyImageHint}</p>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>

        <section className="mt-7 grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
          <div>
            {primaryTag ? (
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
                {primaryTag.name}
              </p>
            ) : null}
            <h1 className="mt-2 font-display text-4xl font-bold leading-tight tracking-tight text-balance sm:text-5xl">
              {recipe.title}
            </h1>
            {recipe.description ? (
              <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
                {recipe.description}
              </p>
            ) : null}
          </div>

          {actions ? (
            <div className="flex flex-wrap gap-2 md:justify-end">
              {actions}
            </div>
          ) : null}
        </section>

        <div className="mt-7 inline-flex flex-wrap items-center gap-0 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          {recipe.prepTimeMinutes ? (
            <div className="flex items-center gap-3 border-r border-border px-4 py-2 last:border-r-0">
              <Clock3 className="size-4 text-primary" aria-hidden="true" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  Tempo
                </p>
                <p className="text-sm font-bold">
                  {formatMinutes(recipe.prepTimeMinutes)}
                </p>
              </div>
            </div>
          ) : null}
          {recipe.servings ? (
            <div className="flex items-center gap-3 border-r border-border px-4 py-2 last:border-r-0">
              <UsersRound
                className="size-4 text-primary"
                aria-hidden="true"
              />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  Rende
                </p>
                <p className="text-sm font-bold">{recipe.servings} porções</p>
              </div>
            </div>
          ) : null}
          {recipe.difficulty ? (
            <div className="flex items-center gap-3 px-4 py-2">
              <ChefHat className="size-4 text-primary" aria-hidden="true" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  Nível
                </p>
                <p className="text-sm font-bold">
                  {difficultyLabels[recipe.difficulty]}
                </p>
              </div>
            </div>
          ) : null}
        </div>

        <section className="mt-9 grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.35fr)]">
          <div>
            <h2 className="font-display text-2xl font-bold">Ingredientes</h2>
            <ul className="mt-5 space-y-4">
              {recipe.ingredients.map((ingredient, index) => (
                <li
                  key={`${ingredient}-${index}`}
                  className="flex items-start gap-3 text-sm leading-6 text-muted-foreground"
                >
                  <span
                    className="mt-1 grid size-4 shrink-0 rounded-md border border-border bg-card shadow-sm"
                    aria-hidden="true"
                  />
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold">
              Modo de preparo
            </h2>
            <ol className="mt-5 space-y-6">
              {recipe.steps.map((step, index) => (
                <li key={`${step}-${index}`} className="flex gap-5">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-sm font-bold text-primary">
                    {index + 1}
                  </span>
                  <p className="pt-1 text-sm leading-7 text-foreground">
                    {step}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {showUpdatedAt ? (
          <p className="mt-10 text-xs text-muted-foreground">
            Criada em {formatDate(recipe.createdAt)} · Atualizada em{" "}
            {formatDate(recipe.updatedAt)}
          </p>
        ) : null}
      </div>
    </main>
  );
}
