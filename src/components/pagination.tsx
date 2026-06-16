import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type PaginationProps = {
  page: number;
  totalPages: number;
  query?: string;
  tag?: string;
};

function getPageHref(
  page: number,
  filters: Pick<PaginationProps, "query" | "tag">,
) {
  const searchParams = new URLSearchParams();

  if (filters.query) searchParams.set("q", filters.query);
  if (filters.tag) searchParams.set("tag", filters.tag);
  if (page > 1) searchParams.set("page", String(page));

  const queryString = searchParams.toString();
  return queryString ? `/recipes?${queryString}` : "/recipes";
}

export function Pagination({
  page,
  totalPages,
  query,
  tag,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav
      className="flex items-center justify-center gap-3"
      aria-label="Paginação das receitas"
    >
      <Button
        asChild={page > 1}
        variant="outline"
        size="sm"
        disabled={page <= 1}
      >
        {page > 1 ? (
          <Link href={getPageHref(page - 1, { query, tag })}>
            <ChevronLeft className="size-4" aria-hidden="true" />
            Anterior
          </Link>
        ) : (
          <span>
            <ChevronLeft className="size-4" aria-hidden="true" />
            Anterior
          </span>
        )}
      </Button>
      <span className="text-sm font-medium text-muted-foreground">
        Página {page} de {totalPages}
      </span>
      <Button
        asChild={page < totalPages}
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
      >
        {page < totalPages ? (
          <Link href={getPageHref(page + 1, { query, tag })}>
            Próxima
            <ChevronRight className="size-4" aria-hidden="true" />
          </Link>
        ) : (
          <span>
            Próxima
            <ChevronRight className="size-4" aria-hidden="true" />
          </span>
        )}
      </Button>
    </nav>
  );
}
