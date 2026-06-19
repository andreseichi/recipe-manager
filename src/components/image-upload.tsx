"use client";

import { useEffect, useRef, useState } from "react";
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

const MAX_COMPRESSED_IMAGE_SIDE = 1600;
const WEBP_QUALITY = 0.82;

function getWebpFileName(fileName: string) {
  const baseName = fileName.replace(/\.[^.]+$/, "") || "recipe-image";

  return `${baseName}.webp`;
}

async function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
          return;
        }

        reject(new Error("Could not compress image."));
      },
      type,
      quality,
    );
  });
}

async function compressImage(file: File) {
  if (!("createImageBitmap" in window)) {
    return file;
  }

  const image = await createImageBitmap(file);
  const largestSide = Math.max(image.width, image.height);
  const scale = Math.min(1, MAX_COMPRESSED_IMAGE_SIDE / largestSide);
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");

  if (!context) {
    image.close();
    return file;
  }

  context.drawImage(image, 0, 0, width, height);
  image.close();

  const blob = await canvasToBlob(canvas, "image/webp", WEBP_QUALITY);

  if (blob.size >= file.size) {
    return file;
  }

  return new File([blob], getWebpFileName(file.name), {
    type: "image/webp",
    lastModified: file.lastModified,
  });
}

async function getUploadFile(file: File) {
  try {
    return await compressImage(file);
  } catch {
    return file;
  }
}

async function cleanupUploadedImage(imageUrl: string | undefined) {
  if (!imageUrl) return;

  try {
    await fetch("/api/uploads/recipe-image/cleanup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imageUrl }),
    });
  } catch {
    // Best effort cleanup only. The saved recipe flow remains authoritative.
  }
}

export function ImageUpload({
  userId,
  defaultImageUrl,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const temporaryImageUrlRef = useRef<string | undefined>(undefined);
  const submittedRef = useRef(false);
  const [imageUrl, setImageUrl] = useState(defaultImageUrl ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const form = inputRef.current?.form;

    if (!form) return;

    function markSubmitted() {
      submittedRef.current = true;
    }

    form.addEventListener("submit", markSubmitted);

    return () => {
      form.removeEventListener("submit", markSubmitted);

      if (!submittedRef.current) {
        void cleanupUploadedImage(temporaryImageUrlRef.current);
      }
    };
  }, []);

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
      const uploadFile = await getUploadFile(file);
      const extension =
        extensionByType[uploadFile.type as (typeof RECIPE_IMAGE_TYPES)[number]];
      const pathname = `recipe-images/${userId}/${crypto.randomUUID()}.${extension}`;
      const previousTemporaryImageUrl = temporaryImageUrlRef.current;
      const blob = await upload(pathname, uploadFile, {
        access: "public",
        handleUploadUrl: "/api/uploads/recipe-image",
      });

      setImageUrl(blob.url);
      temporaryImageUrlRef.current = blob.url;
      submittedRef.current = false;
      void cleanupUploadedImage(previousTemporaryImageUrl);
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
        <div className="relative aspect-video overflow-hidden rounded-2xl border border-border bg-muted">
          <Image
            src={imageUrl}
            alt="Prévia da receita"
            fill
            sizes="(max-width: 768px) 100vw, 700px"
            className="object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 flex justify-end gap-2 bg-linear-to-t from-stone-950/70 to-transparent p-4 pt-10">
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
              onClick={() => {
                if (temporaryImageUrlRef.current === imageUrl) {
                  void cleanupUploadedImage(temporaryImageUrlRef.current);
                  temporaryImageUrlRef.current = undefined;
                }

                submittedRef.current = false;
                setImageUrl("");
              }}
            >
              <Trash2 className="size-4" aria-hidden="true" />
              Remover
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="flex aspect-16/7 w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-muted/50 text-center transition hover:border-primary/50 hover:bg-secondary/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-wait disabled:opacity-60"
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
