import { Search } from "lucide-react";
import { RecipeTagFilterScrollArea } from "@/components/recipe-tag-filter-scroll-area";
import { Input } from "@/components/ui/input";

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
  return (
    <RecipeTagFilterScrollArea
      query={query}
      selectedTag={selectedTag}
      view={view}
      tags={tags}
    />
  );
}
