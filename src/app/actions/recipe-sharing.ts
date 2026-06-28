"use server";

import { revalidatePath } from "next/cache";
import {
  disableRecipeSharingForUser,
  enableRecipeSharingForUser,
  RecipeNotFoundError,
  RecipeShareTokenError,
} from "@/data/recipes";
import { getPublicRecipePath } from "@/lib/recipe-sharing";
import { UnauthorizedError } from "@/lib/session";

export type RecipeSharingActionResult =
  | {
      status: "success";
      publicPath: string | null;
      message: string;
    }
  | {
      status: "error";
      publicPath?: string | null;
      message: string;
    };

function getRecipeSharingErrorMessage(error: unknown) {
  if (error instanceof UnauthorizedError) {
    return "Sua sessão expirou. Entre novamente para continuar.";
  }

  if (error instanceof RecipeNotFoundError) {
    return "Receita não encontrada.";
  }

  if (error instanceof RecipeShareTokenError) {
    return "Não foi possível gerar um link seguro. Tente novamente.";
  }

  console.error(error);
  return "Não foi possível atualizar o compartilhamento. Tente novamente.";
}

export async function enableRecipeSharing(
  recipeId: string,
): Promise<RecipeSharingActionResult> {
  try {
    const { shareToken } = await enableRecipeSharingForUser(recipeId);
    const publicPath = getPublicRecipePath(shareToken);

    revalidatePath(`/recipes/${recipeId}`);
    revalidatePath(publicPath);

    return {
      status: "success",
      publicPath,
      message: "Link de compartilhamento criado.",
    };
  } catch (error) {
    return {
      status: "error",
      message: getRecipeSharingErrorMessage(error),
    };
  }
}

export async function disableRecipeSharing(
  recipeId: string,
): Promise<RecipeSharingActionResult> {
  try {
    const { previousShareToken } = await disableRecipeSharingForUser(recipeId);

    revalidatePath(`/recipes/${recipeId}`);

    if (previousShareToken) {
      revalidatePath(getPublicRecipePath(previousShareToken));
    }

    return {
      status: "success",
      publicPath: null,
      message: "Link de compartilhamento desativado.",
    };
  } catch (error) {
    return {
      status: "error",
      message: getRecipeSharingErrorMessage(error),
    };
  }
}
