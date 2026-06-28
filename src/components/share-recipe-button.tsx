"use client";

import { useRef, useState, useSyncExternalStore, useTransition } from "react";
import { Copy, ExternalLink, Link2Off, Share2, X } from "lucide-react";
import {
  disableRecipeSharing,
  enableRecipeSharing,
  type RecipeSharingActionResult,
} from "@/app/actions/recipe-sharing";
import { Button } from "@/components/ui/button";

type ShareRecipeButtonProps = {
  recipeId: string;
  initialPublicPath: string | null;
};

function subscribeToOrigin() {
  return () => undefined;
}

function getBrowserOrigin() {
  return window.location.origin;
}

function getServerOrigin() {
  return "";
}

export function ShareRecipeButton({
  recipeId,
  initialPublicPath,
}: ShareRecipeButtonProps) {
  const [open, setOpen] = useState(false);
  const [publicPath, setPublicPath] = useState(initialPublicPath);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const linkInputRef = useRef<HTMLInputElement>(null);
  const origin = useSyncExternalStore(
    subscribeToOrigin,
    getBrowserOrigin,
    getServerOrigin,
  );

  const publicUrl = publicPath ? `${origin}${publicPath}` : "";

  function applyActionResult(result: RecipeSharingActionResult) {
    if (result.status === "success") {
      setPublicPath(result.publicPath);
      setMessage(result.message);
      setError(null);
      return;
    }

    setMessage(null);
    setError(result.message);
  }

  function generateLink() {
    setMessage(null);
    setError(null);

    startTransition(async () => {
      applyActionResult(await enableRecipeSharing(recipeId));
    });
  }

  function disableLink() {
    setMessage(null);
    setError(null);

    startTransition(async () => {
      applyActionResult(await disableRecipeSharing(recipeId));
    });
  }

  async function copyLink() {
    if (!publicUrl) return;

    try {
      await navigator.clipboard.writeText(publicUrl);
      setMessage("Link copiado.");
      setError(null);
    } catch {
      linkInputRef.current?.select();
      setMessage("Link selecionado para copiar.");
      setError(null);
    }
  }

  return (
    <div>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
      >
        <Share2 className="size-4" aria-hidden="true" />
        Compartilhar
      </Button>

      {open ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-stone-950/45 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !pending) {
              setOpen(false);
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape" && !pending) setOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-recipe-title"
            className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="share-recipe-title"
                  className="font-display text-2xl font-bold"
                >
                  Compartilhar receita
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Gere um link público somente para visualização. Você pode
                  desativar o link quando quiser.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={pending}
                className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-60"
                aria-label="Fechar compartilhamento"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>

            {publicPath ? (
              <div className="mt-5 space-y-3">
                <label
                  htmlFor="shared-recipe-link"
                  className="text-sm font-bold"
                >
                  Link público
                </label>
                <input
                  ref={linkInputRef}
                  id="shared-recipe-link"
                  readOnly
                  value={publicUrl || publicPath}
                  className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground"
                />
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={copyLink}
                    disabled={!publicUrl || pending}
                  >
                    <Copy className="size-4" aria-hidden="true" />
                    Copiar link
                  </Button>
                  <Button asChild variant="outline">
                    <a
                      href={publicPath}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ExternalLink className="size-4" aria-hidden="true" />
                      Abrir link
                    </a>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-border bg-background p-4 text-sm leading-6 text-muted-foreground">
                Esta receita ainda não tem link público.
              </div>
            )}

            {message ? (
              <p className="mt-4 text-sm text-primary" role="status">
                {message}
              </p>
            ) : null}
            {error ? (
              <p className="mt-4 text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              {publicPath ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={disableLink}
                  disabled={pending}
                >
                  <Link2Off className="size-4" aria-hidden="true" />
                  {pending ? "Desativando..." : "Desativar link"}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={generateLink}
                  disabled={pending}
                >
                  <Share2 className="size-4" aria-hidden="true" />
                  {pending ? "Gerando..." : "Gerar link"}
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
