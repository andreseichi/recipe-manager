import Image from "next/image";
import Link from "next/link";
import { Clock3, ImageIcon, UsersRound } from "lucide-react";
import type { RecipeListItemDTO } from "@/data/recipes";
import { Card } from "@/components/ui/card";
import { formatMinutes } from "@/lib/utils";

const difficultyLabels = {
  EASY: "Fácil",
  MEDIUM: "Médio",
  HARD: "Difícil",
} as const;

export function RecipeCard({ recipe }: { recipe: RecipeListItemDTO }) {
  const primaryTag = recipe.tags[0];

  return (
    <Link
      href={`/recipes/${recipe.id}`}
      className="group block rounded-[1.35rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-4"
    >
      <Card className="h-full overflow-hidden rounded-[1.35rem] border-border bg-card shadow-sm transition duration-300 group-hover:-translate-y-1 group-hover:border-primary/25 group-hover:shadow-xl group-hover:shadow-primary/10">
        <div className="relative aspect-[4/3] overflow-hidden border-b border-dashed border-border bg-muted/45">
          {recipe.imageUrl ? (
            <Image
              src={recipe.imageUrl}
              alt=""
              fill
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
          {primaryTag ? (
            <span className="absolute bottom-3 left-3 rounded-full bg-foreground/80 px-3 py-1 text-xs font-bold text-background shadow-sm backdrop-blur">
              {primaryTag.name}
            </span>
          ) : null}
        </div>
        <div className="p-5">
          <h2 className="font-display text-2xl font-bold leading-tight transition-colors group-hover:text-primary">
            {recipe.title}
          </h2>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-muted-foreground">
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
