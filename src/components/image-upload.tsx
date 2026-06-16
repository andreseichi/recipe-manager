"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, LoaderCircle, Trash2 } from "lucide-react";
import { upload } from "@vercel/blob/client";
import { Button } from "@/components/ui/button";
import {
  getRecipeImageValidationError,
  RECIPE_IMAGE_TYPES,
} from "@/lib/image-constraints";

type ImageUploadProps = {
  userId: string;
  defaultImageUrl?: string;
};

const extensionByType: Record<(typeof RECIPE_IMAGE_TYPES)[number], string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function ImageUpload({
  userId,
  defaultImageUrl,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState(defaultImageUrl ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  async function handleFile(file: File | undefined) {
    if (!file) return;

    const validationError = getRecipeImageValidationError(file);

    if (validationError) {
      setError(validationError);
      return;
    }

    setPending(true);
    setError(undefined);

    try {
      const extension =
        extensionByType[file.type as (typeof RECIPE_IMAGE_TYPES)[number]];
      const pathname = `recipe-images/${userId}/${crypto.randomUUID()}.${extension}`;
      const blob = await upload(pathname, file, {
        access: "public",
        handleUploadUrl: "/api/uploads/recipe-image",
      });

      setImageUrl(blob.url);
    } catch {
      setError("Não foi possível enviar a imagem. Tente novamente.");
    } finally {
      setPending(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name="imageUrl" value={imageUrl} />
      <input
        ref={inputRef}
        data-testid="recipe-image-input"
        type="file"
        accept={RECIPE_IMAGE_TYPES.join(",")}
        className="sr-only"
        aria-label="Selecionar foto da receita"
        disabled={pending}
        onChange={(event) => handleFile(event.target.files?.[0])}
      />
      {imageUrl ? (
        <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-border bg-muted">
          <Image
            src={imageUrl}
            alt="Prévia da receita"
            fill
            sizes="(max-width: 768px) 100vw, 700px"
            className="object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 flex justify-end gap-2 bg-gradient-to-t from-stone-950/70 to-transparent p-4 pt-10">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={pending}
              onClick={() => inputRef.current?.click()}
            >
              <ImagePlus className="size-4" aria-hidden="true" />
              Trocar
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={pending}
              onClick={() => setImageUrl("")}
            >
              <Trash2 className="size-4" aria-hidden="true" />
              Remover
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="flex aspect-[16/7] w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-muted/50 text-center transition hover:border-primary/50 hover:bg-secondary/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-wait disabled:opacity-60"
          disabled={pending}
          onClick={() => inputRef.current?.click()}
        >
          <span className="grid size-12 place-items-center rounded-2xl bg-card text-primary shadow-sm">
            {pending ? (
              <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
            ) : (
              <ImagePlus className="size-5" aria-hidden="true" />
            )}
          </span>
          <span>
            <strong className="block text-sm">
              {pending ? "Enviando imagem..." : "Adicionar uma foto"}
            </strong>
            <span className="mt-1 block text-xs text-muted-foreground">
              JPEG, PNG ou WebP, até 5 MB
            </span>
          </span>
        </button>
      )}
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
