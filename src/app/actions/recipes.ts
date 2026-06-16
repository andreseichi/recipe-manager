"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createRecipeRecord,
  deleteRecipeRecord,
  InvalidRecipeImageError,
  RecipeNotFoundError,
  updateRecipeRecord,
} from "@/data/recipes";
import { deleteBlobBestEffort } from "@/lib/images";
import { shouldDeletePreviousImage } from "@/lib/image-policy";
import { UnauthorizedError } from "@/lib/session";
import {
  getRecipeFieldErrors,
  parseRecipeFormData,
  type RecipeFormState,
} from "@/lib/validations/recipe";

function getActionError(error: unknown): RecipeFormState {
  if (error instanceof UnauthorizedError) {
    return {
      status: "error",
      message: "Sua sessão expirou. Entre novamente para continuar.",
    };
  }

  if (error instanceof RecipeNotFoundError) {
    return {
      status: "error",
      message: "Receita não encontrada.",
    };
  }

  if (error instanceof InvalidRecipeImageError) {
    return {
      status: "error",
      message: "A imagem enviada é inválida. Faça o upload novamente.",
    };
  }

  console.error(error);
  return {
    status: "error",
    message: "Não foi possível salvar a receita. Tente novamente.",
  };
}

export async function createRecipe(
  _previousState: RecipeFormState,
  formData: FormData,
): Promise<RecipeFormState> {
  const parsed = parseRecipeFormData(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Revise os campos destacados.",
      fieldErrors: getRecipeFieldErrors(parsed.error),
    };
  }

  let recipeId: string;

  try {
    const recipe = await createRecipeRecord(parsed.data);
    recipeId = recipe.id;
  } catch (error) {
    return getActionError(error);
  }

  revalidatePath("/recipes");
  redirect(`/recipes/${recipeId}`);
}

export async function updateRecipe(
  recipeId: string,
  _previousState: RecipeFormState,
  formData: FormData,
): Promise<RecipeFormState> {
  const parsed = parseRecipeFormData(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Revise os campos destacados.",
      fieldErrors: getRecipeFieldErrors(parsed.error),
    };
  }

  let previousImageUrl: string | null;

  try {
    const result = await updateRecipeRecord(recipeId, parsed.data);
    previousImageUrl = result.previousImageUrl;
  } catch (error) {
    return getActionError(error);
  }

  if (shouldDeletePreviousImage(previousImageUrl, parsed.data.imageUrl)) {
    await deleteBlobBestEffort(previousImageUrl);
  }

  revalidatePath("/recipes");
  revalidatePath(`/recipes/${recipeId}`);
  redirect(`/recipes/${recipeId}`);
}

export async function deleteRecipe(
  recipeId: string,
  _previousState: RecipeFormState,
): Promise<RecipeFormState> {
  void _previousState;
  let imageUrl: string | null;

  try {
    const recipe = await deleteRecipeRecord(recipeId);
    imageUrl = recipe.imageUrl;
  } catch (error) {
    return getActionError(error);
  }

  await deleteBlobBestEffort(imageUrl);
  revalidatePath("/recipes");
  redirect("/recipes");
}
