import Link from "next/link";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type RecipeSearchProps = {
  query?: string;
  selectedTag?: string;
};

type RecipeFiltersProps = RecipeSearchProps & {
  tags: Array<{
    name: string;
    normalizedName: string;
    _count: {
      recipes: number;
    };
  }>;
};

function getTagHref(query?: string, tag?: string) {
  const searchParams = new URLSearchParams();

  if (query) searchParams.set("q", query);
  if (tag) searchParams.set("tag", tag);

  const queryString = searchParams.toString();
  return queryString ? `/recipes?${queryString}` : "/recipes";
}

export function RecipeSearch({ query, selectedTag }: RecipeSearchProps) {
  return (
    <form action="/recipes" className="relative w-full max-w-xl">
      <Search
        className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        type="search"
        name="q"
        defaultValue={query}
        maxLength={120}
        placeholder="Buscar receitas, ingredientes..."
        className="h-12 rounded-xl bg-card pl-11 text-[15px]"
        aria-label="Buscar receitas pelo nome"
      />
      {selectedTag ? <input type="hidden" name="tag" value={selectedTag} /> : null}
      <button type="submit" className="sr-only">
        Buscar
      </button>
    </form>
  );
}

export function RecipeFilters({
  query,
  selectedTag,
  tags,
}: RecipeFiltersProps) {
  const hasFilters = Boolean(selectedTag);

  return (
    <nav
      id="recipe-tags"
      className="flex flex-wrap items-center gap-2"
      aria-label="Filtrar receitas por tag"
    >
      <Link
        href={getTagHref(query)}
        className={cn(
          "rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-muted-foreground shadow-sm transition hover:border-primary/30 hover:text-primary",
          !selectedTag &&
            "border-primary bg-primary text-primary-foreground hover:text-primary-foreground",
        )}
      >
        Todas
      </Link>
      {tags.map((tag) => (
        <Link
          key={tag.normalizedName}
          href={getTagHref(query, tag.normalizedName)}
          className={cn(
            "rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-muted-foreground shadow-sm transition hover:border-primary/30 hover:text-primary",
            selectedTag === tag.normalizedName &&
              "border-primary bg-primary text-primary-foreground hover:text-primary-foreground",
          )}
        >
          {tag.name}
        </Link>
      ))}
      {hasFilters ? (
        <Link
          href={getTagHref(query)}
          className="inline-flex size-9.5 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition hover:text-primary"
          aria-label="Limpar filtro por tag"
        >
          <X className="size-4" aria-hidden="true" />
        </Link>
      ) : null}
    </nav>
  );
}
