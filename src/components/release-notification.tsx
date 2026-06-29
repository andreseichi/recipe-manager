"use client";

import { useActionState, useState } from "react";
import { Bell, Sparkles, X } from "lucide-react";
import { markReleaseAsSeen } from "@/app/actions/releases";
import type { ReleaseActionState } from "@/app/actions/releases";
import type { AppRelease } from "@/lib/releases";
import { Button } from "@/components/ui/button";

type ReleaseNotificationProps = {
  release: AppRelease | null;
};

const initialReleaseActionState: ReleaseActionState = {
  status: "idle",
};

export function ReleaseNotification({ release }: ReleaseNotificationProps) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(
    markReleaseAsSeen,
    initialReleaseActionState,
  );

  if (!release || state.status === "success") {
    return null;
  }

  return (
    <>
      <aside
        aria-label="Toast de novidades da versao"
        aria-live="polite"
        className="fixed inset-x-3 bottom-3 z-50 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-full sm:max-w-md"
      >
        <div className="flex w-full flex-col gap-4 rounded-2xl border border-border bg-background p-4 shadow-xl shadow-foreground/10">
          <div className="flex min-w-0 items-start gap-3">
            <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
              <Bell className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground">
                Novidades no Baú de Receitas
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {release.title} · versão {release.version}
              </p>
              {state.status === "error" ? (
                <p className="mt-2 text-sm text-destructive" role="alert">
                  {state.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(true)}
            >
              <Sparkles className="size-4" aria-hidden="true" />
              Ver novidades
            </Button>
            <form action={action}>
              <input type="hidden" name="releaseId" value={release.id} />
              <Button type="submit" size="sm" disabled={pending}>
                {pending ? "Salvando..." : "Entendi"}
              </Button>
            </form>
          </div>
        </div>
      </aside>

      {open ? (
        <div
          className="fixed inset-0 z-[60] grid place-items-center bg-foreground/35 px-4 py-6 backdrop-blur-sm"
          data-testid="release-dialog-backdrop"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-border bg-background p-5 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="release-dialog-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase text-primary">
                  Versão {release.version}
                </p>
                <h2
                  id="release-dialog-title"
                  className="mt-2 font-display text-2xl font-bold leading-tight"
                >
                  {release.title}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Publicado em {release.releasedAt}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label="Fechar novidades"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>

            <ul className="mt-5 space-y-3">
              {release.changes.map((change) => (
                <li key={change} className="flex gap-3 text-sm leading-6">
                  <span
                    className="mt-2 size-2 shrink-0 rounded-full bg-primary"
                    aria-hidden="true"
                  />
                  <span>{change}</span>
                </li>
              ))}
            </ul>

            {state.status === "error" ? (
              <p className="mt-4 text-sm text-destructive" role="alert">
                {state.message}
              </p>
            ) : null}

            <form action={action} className="mt-6 flex justify-end">
              <input type="hidden" name="releaseId" value={release.id} />
              <Button type="submit" disabled={pending}>
                {pending ? "Salvando..." : "Entendi"}
              </Button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
