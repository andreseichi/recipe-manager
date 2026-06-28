import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createShareToken,
  getPublicRecipePath,
  isShareToken,
} from "@/lib/recipe-sharing";
import { prisma } from "@/lib/prisma";
import {
  disableRecipeSharingForUser,
  enableRecipeSharingForUser,
  getSharedRecipeByToken,
  RecipeNotFoundError,
} from "@/data/recipes";
import { requireCurrentUser } from "@/lib/session";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    recipe: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/session", () => ({
  requireCurrentUser: vi.fn(),
  UnauthorizedError: class UnauthorizedError extends Error {},
}));

const recipeMock = vi.mocked(prisma.recipe);
const requireCurrentUserMock = vi.mocked(requireCurrentUser);

describe("recipe sharing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireCurrentUserMock.mockResolvedValue({
      id: "user-1",
      name: "Usuario",
      email: "user@example.com",
      emailVerified: true,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  it("creates URL-safe share tokens", () => {
    const token = createShareToken();

    expect(isShareToken(token)).toBe(true);
    expect(token).toHaveLength(43);
    expect(getPublicRecipePath(token)).toBe(`/receitas/${token}`);
  });

  it("generates a share token for an owned recipe", async () => {
    recipeMock.findFirst.mockResolvedValueOnce({
      id: "recipe-1",
      shareToken: null,
    } as never);
    recipeMock.findUnique.mockResolvedValueOnce(null);
    recipeMock.update.mockResolvedValueOnce({
      shareToken: "abc123456789_abc123456789_abc123456789",
    } as never);

    await expect(enableRecipeSharingForUser("recipe-1")).resolves.toEqual({
      shareToken: "abc123456789_abc123456789_abc123456789",
    });
    expect(recipeMock.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "recipe-1" },
        data: expect.objectContaining({
          shareToken: expect.any(String),
          sharedAt: expect.any(Date),
        }),
      }),
    );
  });

  it("does not generate a token for a missing or unowned recipe", async () => {
    recipeMock.findFirst.mockResolvedValueOnce(null);

    await expect(enableRecipeSharingForUser("recipe-1")).rejects.toThrow(
      RecipeNotFoundError,
    );
    expect(recipeMock.update).not.toHaveBeenCalled();
  });

  it("disables sharing and returns the previous token", async () => {
    recipeMock.findFirst.mockResolvedValueOnce({
      id: "recipe-1",
      shareToken: "previous-token_12345678901234567890",
    } as never);
    recipeMock.update.mockResolvedValueOnce({ id: "recipe-1" } as never);

    await expect(disableRecipeSharingForUser("recipe-1")).resolves.toEqual({
      previousShareToken: "previous-token_12345678901234567890",
    });
    expect(recipeMock.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          shareToken: null,
          sharedAt: null,
        },
      }),
    );
  });

  it("does not query the database for invalid public tokens", async () => {
    await expect(getSharedRecipeByToken("not valid")).resolves.toBeNull();
    expect(recipeMock.findUnique).not.toHaveBeenCalled();
  });
});
