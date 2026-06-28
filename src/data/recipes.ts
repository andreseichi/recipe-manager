import "server-only";

import { cache } from "react";
import type { Difficulty, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { isOwnedRecipeImage } from "@/lib/image-policy";
import { getPaginationState } from "@/lib/pagination";
import { createShareToken, isShareToken } from "@/lib/recipe-sharing";
import { requireCurrentUser } from "@/lib/session";
import {
  normalizeTagName,
  prepareTags,
  type RecipeInput,
} from "@/lib/validations/recipe";

export const RECIPES_PER_PAGE = 12;

export class RecipeNotFoundError extends Error {
  constructor() {
    super("Recipe not found.");
    this.name = "RecipeNotFoundError";
  }
}

export class InvalidRecipeImageError extends Error {
  constructor() {
    super("The recipe image does not belong to the current user.");
    this.name = "InvalidRecipeImageError";
  }
}

export class RecipeShareTokenError extends Error {
  constructor() {
    super("Could not create a public recipe share token.");
    this.name = "RecipeShareTokenError";
  }
}

export type RecipeListFilters = {
  query?: string;
  tag?: string;
  page: number;
};

const recipeListSelect = {
  id: true,
  title: true,
  description: true,
  prepTimeMinutes: true,
  servings: true,
  difficulty: true,
  imageUrl: true,
  updatedAt: true,
  tags: {
    select: {
      name: true,
      normalizedName: true,
    },
    orderBy: {
      name: "asc",
    },
  },
} satisfies Prisma.RecipeSelect;

const recipeDetailSelect = {
  ...recipeListSelect,
  ingredients: true,
  steps: true,
  shareToken: true,
  sharedAt: true,
  createdAt: true,
} satisfies Prisma.RecipeSelect;

export type RecipeListItemDTO = Prisma.RecipeGetPayload<{
  select: typeof recipeListSelect;
}>;

export type RecipeDetailDTO = Prisma.RecipeGetPayload<{
  select: typeof recipeDetailSelect;
}>;

function assertOwnedImage(imageUrl: string | undefined, userId: string) {
  if (imageUrl && !isOwnedRecipeImage(imageUrl, userId)) {
    throw new InvalidRecipeImageError();
  }
}

function getTagConnections(tags: string[], userId: string) {
  return prepareTags(tags).map((tag) => ({
    where: {
      userId_normalizedName: {
        userId,
        normalizedName: tag.normalizedName,
      },
    },
    create: {
      ...tag,
      userId,
    },
  }));
}

function getRecipeData(input: RecipeInput) {
  return {
    title: input.title,
    description: input.description,
    ingredients: input.ingredients,
    steps: input.steps,
    prepTimeMinutes: input.prepTimeMinutes,
    servings: input.servings,
    difficulty: input.difficulty as Difficulty | undefined,
    imageUrl: input.imageUrl,
  };
}

async function removeOrphanTags(
  transaction: Prisma.TransactionClient,
  userId: string,
) {
  await transaction.tag.deleteMany({
    where: {
      userId,
      recipes: {
        none: {},
      },
    },
  });
}

export async function getRecipeList(filters: RecipeListFilters) {
  const user = await requireCurrentUser();
  const requestedPage = Math.max(1, Math.trunc(filters.page) || 1);
  const query = filters.query?.trim();
  const normalizedTag = filters.tag
    ? normalizeTagName(filters.tag)
    : undefined;

  const where: Prisma.RecipeWhereInput = {
    userId: user.id,
    ...(query
      ? {
          title: {
            contains: query,
            mode: "insensitive",
          },
        }
      : {}),
    ...(normalizedTag
      ? {
          tags: {
            some: {
              userId: user.id,
              normalizedName: normalizedTag,
            },
          },
        }
      : {}),
  };

  const total = await prisma.recipe.count({ where });
  const { page, totalPages } = getPaginationState({
    requestedPage,
    total,
    perPage: RECIPES_PER_PAGE,
  });

  const recipes = total
    ? await prisma.recipe.findMany({
        where,
        select: recipeListSelect,
        orderBy: {
          updatedAt: "desc",
        },
        skip: (page - 1) * RECIPES_PER_PAGE,
        take: RECIPES_PER_PAGE,
      })
    : [];

  return {
    recipes,
    page,
    total,
    totalPages,
  };
}

export async function getUserTags() {
  const user = await requireCurrentUser();

  return prisma.tag.findMany({
    where: {
      userId: user.id,
      recipes: {
        some: {},
      },
    },
    select: {
      name: true,
      normalizedName: true,
      _count: {
        select: {
          recipes: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });
}

export const getRecipeById = cache(async (id: string) => {
  const user = await requireCurrentUser();

  return prisma.recipe.findFirst({
    where: {
      id,
      userId: user.id,
    },
    select: recipeDetailSelect,
  });
});

export const getSharedRecipeByToken = cache(async (token: string) => {
  if (!isShareToken(token)) return null;

  return prisma.recipe.findUnique({
    where: {
      shareToken: token,
    },
    select: recipeDetailSelect,
  });
});

export async function enableRecipeSharingForUser(id: string) {
  const user = await requireCurrentUser();
  const recipe = await prisma.recipe.findFirst({
    where: {
      id,
      userId: user.id,
    },
    select: {
      id: true,
      shareToken: true,
    },
  });

  if (!recipe) {
    throw new RecipeNotFoundError();
  }

  if (recipe.shareToken) {
    return {
      shareToken: recipe.shareToken,
    };
  }

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const shareToken = createShareToken();
    const collision = await prisma.recipe.findUnique({
      where: {
        shareToken,
      },
      select: {
        id: true,
      },
    });

    if (collision) continue;

    const sharedRecipe = await prisma.recipe.update({
      where: {
        id: recipe.id,
      },
      data: {
        shareToken,
        sharedAt: new Date(),
      },
      select: {
        shareToken: true,
      },
    });

    if (sharedRecipe.shareToken) {
      return {
        shareToken: sharedRecipe.shareToken,
      };
    }
  }

  throw new RecipeShareTokenError();
}

export async function disableRecipeSharingForUser(id: string) {
  const user = await requireCurrentUser();
  const recipe = await prisma.recipe.findFirst({
    where: {
      id,
      userId: user.id,
    },
    select: {
      id: true,
      shareToken: true,
    },
  });

  if (!recipe) {
    throw new RecipeNotFoundError();
  }

  if (!recipe.shareToken) {
    return {
      previousShareToken: null,
    };
  }

  await prisma.recipe.update({
    where: {
      id: recipe.id,
    },
    data: {
      shareToken: null,
      sharedAt: null,
    },
    select: {
      id: true,
    },
  });

  return {
    previousShareToken: recipe.shareToken,
  };
}

export async function createRecipeRecord(input: RecipeInput) {
  const user = await requireCurrentUser();
  assertOwnedImage(input.imageUrl, user.id);

  return prisma.recipe.create({
    data: {
      ...getRecipeData(input),
      userId: user.id,
      tags: {
        connectOrCreate: getTagConnections(input.tags, user.id),
      },
    },
    select: {
      id: true,
    },
  });
}

export async function updateRecipeRecord(id: string, input: RecipeInput) {
  const user = await requireCurrentUser();
  assertOwnedImage(input.imageUrl, user.id);

  return prisma.$transaction(async (transaction) => {
    const existingRecipe = await transaction.recipe.findFirst({
      where: {
        id,
        userId: user.id,
      },
      select: {
        id: true,
        imageUrl: true,
      },
    });

    if (!existingRecipe) {
      throw new RecipeNotFoundError();
    }

    await transaction.recipe.update({
      where: {
        id: existingRecipe.id,
      },
      data: {
        ...getRecipeData(input),
        tags: {
          set: [],
          connectOrCreate: getTagConnections(input.tags, user.id),
        },
      },
    });

    await removeOrphanTags(transaction, user.id);

    return {
      id: existingRecipe.id,
      previousImageUrl: existingRecipe.imageUrl,
    };
  });
}

export async function deleteRecipeRecord(id: string) {
  const user = await requireCurrentUser();

  return prisma.$transaction(async (transaction) => {
    const existingRecipe = await transaction.recipe.findFirst({
      where: {
        id,
        userId: user.id,
      },
      select: {
        id: true,
        imageUrl: true,
      },
    });

    if (!existingRecipe) {
      throw new RecipeNotFoundError();
    }

    await transaction.recipe.delete({
      where: {
        id: existingRecipe.id,
      },
    });

    await removeOrphanTags(transaction, user.id);

    return existingRecipe;
  });
}
