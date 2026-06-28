"use client";

import * as React from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type RecipeTagFilterScrollAreaProps = {
  query?: string;
  selectedTag?: string;
  view?: "list" | "grid";
  tags: Array<{
    name: string;
    normalizedName: string;
    _count: {
      recipes: number;
    };
  }>;
};

const dragThreshold = 6;

function getTagHref(query?: string, tag?: string, view?: "list" | "grid") {
  const searchParams = new URLSearchParams();

  if (query) searchParams.set("q", query);
  if (tag) searchParams.set("tag", tag);
  if (view) searchParams.set("view", view);

  const queryString = searchParams.toString();
  return queryString ? `/recipes?${queryString}` : "/recipes";
}

function getScrollViewport(element: HTMLElement) {
  return element.closest(
    "[data-radix-scroll-area-viewport]",
  ) as HTMLElement | null;
}

export function RecipeTagFilterScrollArea({
  query,
  selectedTag,
  view,
  tags,
}: RecipeTagFilterScrollAreaProps) {
  const hasFilters = Boolean(selectedTag);
  const dragState = React.useRef<{
    pointerId: number;
    startX: number;
    startScrollLeft: number;
    hasDragged: boolean;
    viewport: HTMLElement;
  } | null>(null);
  const preventClickRef = React.useRef(false);
  const [isDragging, setIsDragging] = React.useState(false);

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || event.pointerType !== "mouse") {
      return;
    }

    const viewport = getScrollViewport(event.currentTarget);
    if (!viewport || viewport.scrollWidth <= viewport.clientWidth) {
      return;
    }

    dragState.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: viewport.scrollLeft,
      hasDragged: false,
      viewport,
    };
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const state = dragState.current;
    if (!state || state.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - state.startX;
    if (Math.abs(deltaX) > dragThreshold) {
      state.hasDragged = true;
      preventClickRef.current = true;
      setIsDragging(true);

      if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.setPointerCapture(event.pointerId);
      }
    }

    if (state.hasDragged) {
      state.viewport.scrollLeft = state.startScrollLeft - deltaX;
      event.preventDefault();
    }
  }

  function endDrag(event: React.PointerEvent<HTMLDivElement>) {
    const state = dragState.current;
    if (!state || state.pointerId !== event.pointerId) {
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (state.hasDragged) {
      window.setTimeout(() => {
        preventClickRef.current = false;
      }, 150);
    }

    dragState.current = null;
    setIsDragging(false);
  }

  function handleClickCapture(event: React.MouseEvent<HTMLDivElement>) {
    if (!preventClickRef.current) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    preventClickRef.current = false;
  }

  function handleWheel(event: React.WheelEvent<HTMLDivElement>) {
    const viewport = getScrollViewport(event.currentTarget);
    if (!viewport || viewport.scrollWidth <= viewport.clientWidth) {
      return;
    }

    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY)
      ? event.deltaX
      : event.deltaY;
    const maxScrollLeft = viewport.scrollWidth - viewport.clientWidth;
    const nextScrollLeft = Math.min(
      Math.max(viewport.scrollLeft + delta, 0),
      maxScrollLeft,
    );

    if (nextScrollLeft !== viewport.scrollLeft) {
      viewport.scrollLeft = nextScrollLeft;
      event.preventDefault();
    }
  }

  return (
    <nav id="recipe-tags" aria-label="Filtrar receitas por tag">
      <ScrollArea className="w-full" data-testid="recipe-tag-filter-scroll-area">
        <div
          className={cn(
            "flex w-max min-w-full touch-pan-x items-center gap-2 py-6",
            isDragging ? "cursor-grabbing select-none" : "cursor-grab",
          )}
          onClickCapture={handleClickCapture}
          onPointerCancel={endDrag}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onWheel={handleWheel}
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
        </div>
        <ScrollBar orientation="horizontal" className="h-3" />
      </ScrollArea>
    </nav>
  );
}
