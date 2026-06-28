import { beforeEach, describe, expect, it, vi } from "vitest";
import { getRecipeList } from "@/data/recipes";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/session";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    recipe: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/session", () => ({
  requireCurrentUser: vi.fn(),
}));

const recipeMock = vi.mocked(prisma.recipe);
const requireCurrentUserMock = vi.mocked(requireCurrentUser);

describe("recipe list ordering", () => {
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
    recipeMock.count.mockResolvedValue(2);
    recipeMock.findMany.mockResolvedValue([]);
  });

  it("orders recipes by creation date so edits do not move old recipes to the top", async () => {
    await getRecipeList({ page: 1 });

    expect(recipeMock.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [
          {
            createdAt: "desc",
          },
          {
            id: "desc",
          },
        ],
      }),
    );
  });
});
