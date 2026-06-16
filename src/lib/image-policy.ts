export function getRecipeImagePrefix(userId: string) {
  return `recipe-images/${userId}/`;
}

export function isOwnedRecipeImage(imageUrl: string, userId: string) {
  try {
    const url = new URL(imageUrl);
    const expectedPathPrefix = `/${getRecipeImagePrefix(userId)}`;

    return (
      url.protocol === "https:" &&
      url.hostname.endsWith(".public.blob.vercel-storage.com") &&
      url.pathname.startsWith(expectedPathPrefix)
    );
  } catch {
    return false;
  }
}

export function shouldDeletePreviousImage(
  previousImageUrl: string | null,
  nextImageUrl: string | undefined,
) {
  return Boolean(previousImageUrl && previousImageUrl !== nextImageUrl);
}
