import Link from "next/link";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type RecipeSearchProps = {
  query?: string;
  selectedTag?: string;
  view?: "list" | "grid";
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

function getTagHref(query?: string, tag?: string, view?: "list" | "grid") {
  const searchParams = new URLSearchParams();

  if (query) searchParams.set("q", query);
  if (tag) searchParams.set("tag", tag);
  if (view) searchParams.set("view", view);

  const queryString = searchParams.toString();
  return queryString ? `/recipes?${queryString}` : "/recipes";
}

export function RecipeSearch({ query, selectedTag, view }: RecipeSearchProps) {
  return (
    <form action="/recipes" className="relative w-full">
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
        className="h-10 rounded-xl bg-card pl-11 text-[15px]"
        aria-label="Buscar receitas pelo nome"
      />
      {selectedTag ? <input type="hidden" name="tag" value={selectedTag} /> : null}
      {view ? <input type="hidden" name="view" value={view} /> : null}
      <button type="submit" className="sr-only">
        Buscar
      </button>
    </form>
  );
}

export function RecipeFilters({
  query,
  selectedTag,
  view,
  tags,
}: RecipeFiltersProps) {
  const hasFilters = Boolean(selectedTag);

  return (
    <nav
      id="recipe-tags"
      className="flex items-center gap-2 overflow-x-auto"
      aria-label="Filtrar receitas por tag"
    >
      <Link
        href={getTagHref(query, undefined, view)}
        prefetch={false}
        className={cn(
          "shrink-0 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-muted-foreground shadow-sm transition hover:border-primary/30 hover:text-primary",
          !selectedTag &&
            "border-primary bg-primary text-primary-foreground hover:text-primary-foreground",
        )}
      >
        Todas
      </Link>
      {tags.map((tag) => (
        <Link
          key={tag.normalizedName}
          href={getTagHref(query, tag.normalizedName, view)}
          prefetch={false}
          className={cn(
            "shrink-0 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-muted-foreground shadow-sm transition hover:border-primary/30 hover:text-primary",
            selectedTag === tag.normalizedName &&
              "border-primary bg-primary text-primary-foreground hover:text-primary-foreground",
          )}
        >
          {tag.name}
        </Link>
      ))}
      {hasFilters ? (
        <Link
          href={getTagHref(query, undefined, view)}
          prefetch={false}
          className="inline-flex size-9.5 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition hover:text-primary"
          aria-label="Limpar filtro por tag"
        >
          <X className="size-4" aria-hidden="true" />
        </Link>
      ) : null}
    </nav>
  );
}
