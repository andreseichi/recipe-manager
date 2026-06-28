import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type PaginationProps = {
  page: number;
  totalPages: number;
  query?: string;
  tag?: string;
  view?: "list" | "grid";
};

function getPageHref(
  page: number,
  filters: Pick<PaginationProps, "query" | "tag" | "view">,
) {
  const searchParams = new URLSearchParams();

  if (filters.query) searchParams.set("q", filters.query);
  if (filters.tag) searchParams.set("tag", filters.tag);
  if (filters.view) searchParams.set("view", filters.view);
  if (page > 1) searchParams.set("page", String(page));

  const queryString = searchParams.toString();
  return queryString ? `/recipes?${queryString}` : "/recipes";
}

export function Pagination({
  page,
  totalPages,
  query,
  tag,
  view,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav
      className="flex items-center justify-center gap-3"
      aria-label="Paginação das receitas"
    >
      {page > 1 ? (
        <Button asChild variant="outline" size="sm">
          <Link
            href={getPageHref(page - 1, { query, tag, view })}
            prefetch={false}
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
            Anterior
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled>
          <ChevronLeft className="size-4" aria-hidden="true" />
          Anterior
        </Button>
      )}
      <span className="text-sm font-medium text-muted-foreground">
        Página {page} de {totalPages}
      </span>
      {page < totalPages ? (
        <Button asChild variant="outline" size="sm">
          <Link
            href={getPageHref(page + 1, { query, tag, view })}
            prefetch={false}
          >
            Próxima
            <ChevronRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled>
          Próxima
          <ChevronRight className="size-4" aria-hidden="true" />
        </Button>
      )}
    </nav>
  );
}
