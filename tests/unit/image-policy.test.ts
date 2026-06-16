import { describe, expect, it } from "vitest";
import {
  getRecipeImageValidationError,
  MAX_RECIPE_IMAGE_BYTES,
} from "@/lib/image-constraints";
import {
  isOwnedRecipeImage,
  shouldDeletePreviousImage,
} from "@/lib/image-policy";

describe("recipe image validation", () => {
  it("accepts supported images up to 5 MB", () => {
    expect(
      getRecipeImageValidationError({
        type: "image/webp",
        size: MAX_RECIPE_IMAGE_BYTES,
      }),
    ).toBeNull();
  });

  it("rejects unsupported content types", () => {
    expect(
      getRecipeImageValidationError({
        type: "image/svg+xml",
        size: 100,
      }),
    ).toContain("JPEG");
  });

  it("rejects files larger than 5 MB", () => {
    expect(
      getRecipeImageValidationError({
        type: "image/png",
        size: MAX_RECIPE_IMAGE_BYTES + 1,
      }),
    ).toContain("5 MB");
  });
});

describe("recipe image ownership", () => {
  const ownedUrl =
    "https://store.public.blob.vercel-storage.com/recipe-images/user-a/photo.webp";

  it("accepts only images in the current user's namespace", () => {
    expect(isOwnedRecipeImage(ownedUrl, "user-a")).toBe(true);
    expect(isOwnedRecipeImage(ownedUrl, "user-b")).toBe(false);
  });

  it("rejects non-Blob and malformed URLs", () => {
    expect(
      isOwnedRecipeImage("https://example.com/recipe-images/user-a/a.png", "user-a"),
    ).toBe(false);
    expect(isOwnedRecipeImage("not-a-url", "user-a")).toBe(false);
  });

  it("removes the old blob only after replacement or removal", () => {
    expect(shouldDeletePreviousImage(ownedUrl, ownedUrl)).toBe(false);
    expect(shouldDeletePreviousImage(ownedUrl, undefined)).toBe(true);
    expect(
      shouldDeletePreviousImage(
        ownedUrl,
        "https://store.public.blob.vercel-storage.com/recipe-images/user-a/new.webp",
      ),
    ).toBe(true);
  });
});
