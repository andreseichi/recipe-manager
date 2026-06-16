"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.41Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.98-.9 6.64-2.42l-3.24-2.54c-.9.6-2.05.96-3.4.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.39 13.87A6.01 6.01 0 0 1 6.07 12c0-.65.11-1.28.32-1.87V7.51H3.04A10 10 0 0 0 2 12c0 1.61.39 3.14 1.04 4.49l3.35-2.62Z"
      />
      <path
        fill="#EA4335"
        d="M12 6c1.47 0 2.79.51 3.83 1.5l2.88-2.88A9.64 9.64 0 0 0 12 2a10 10 0 0 0-8.96 5.51l3.35 2.62C7.18 7.76 9.39 6 12 6Z"
      />
    </svg>
  );
}

export function AuthButtons({ compact = false }: { compact?: boolean }) {
  const [pendingProvider, setPendingProvider] = useState<
    "google" | null
  >(null);
  const [error, setError] = useState<string>();

  async function signIn(provider: "google") {
    setPendingProvider(provider);
    setError(undefined);

    const result = await authClient.signIn.social({
      provider,
      callbackURL: "/recipes",
    });

    if (result.error) {
      setError("Não foi possível iniciar o login. Verifique a configuração.");
      setPendingProvider(null);
    }
  }

  return (
    <div className="space-y-3">
      <div
        className={
          compact
            ? "flex flex-col gap-2 sm:flex-row"
            : "grid w-full gap-3"
        }
      >
        <Button
          type="button"
          variant={compact ? "outline" : "default"}
          size={compact ? "sm" : "lg"}
          disabled={pendingProvider !== null}
          onClick={() => signIn("google")}
        >
          <GoogleMark />
          {pendingProvider === "google" ? "Entrando..." : "Google"}
        </Button>
      </div>
      {error ? (
        <p className="text-center text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
