export const MAX_RECIPE_IMAGE_BYTES = 5 * 1024 * 1024;
export const RECIPE_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export function getRecipeImageValidationError(file: {
  type: string;
  size: number;
}) {
  if (
    !RECIPE_IMAGE_TYPES.includes(
      file.type as (typeof RECIPE_IMAGE_TYPES)[number],
    )
  ) {
    return "Use uma imagem JPEG, PNG ou WebP.";
  }

  if (file.size > MAX_RECIPE_IMAGE_BYTES) {
    return "A imagem pode ter no máximo 5 MB.";
  }

  return null;
}
