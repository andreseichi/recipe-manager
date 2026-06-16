"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteRecipe } from "@/app/actions/recipes";
import { Button } from "@/components/ui/button";
import { initialRecipeFormState } from "@/lib/validations/recipe";

export function DeleteRecipeButton({
  recipeId,
  recipeTitle,
}: {
  recipeId: string;
  recipeTitle: string;
}) {
  const [open, setOpen] = useState(false);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const deleteAction = deleteRecipe.bind(null, recipeId);
  const [state, formAction, pending] = useActionState(
    deleteAction,
    initialRecipeFormState,
  );

  useEffect(() => {
    if (open) cancelButtonRef.current?.focus();
  }, [open]);

  return (
    <div>
      <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)} className="cursor-pointer">
        <Trash2 className="size-4" aria-hidden="true" />
        Excluir
      </Button>

      {open ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-stone-950/45 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !pending) setOpen(false);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape" && !pending) setOpen(false);
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-recipe-title"
            aria-describedby="delete-recipe-description"
            className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl"
          >
            <h2
              id="delete-recipe-title"
              className="font-display text-2xl font-bold"
            >
              Excluir esta receita?
            </h2>
            <p
              id="delete-recipe-description"
              className="mt-2 text-sm leading-6 text-muted-foreground"
            >
              “{recipeTitle}” será removida permanentemente, junto com a
              referência da imagem. Esta ação não pode ser desfeita.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                ref={cancelButtonRef}
                type="button"
                variant="outline"
                disabled={pending}
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <form action={formAction}>
                <Button
                  type="submit"
                  variant="destructive"
                  className="w-full"
                  disabled={pending}
                >
                  {pending ? "Excluindo..." : "Excluir receita"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      ) : null}

      {state.message ? (
        <p className="mt-2 text-sm text-destructive" role="alert">
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
