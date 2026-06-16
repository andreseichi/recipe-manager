import { describe, expect, it } from "vitest";
import {
  normalizeTagName,
  parseRecipeFormData,
  prepareTags,
  recipeSchema,
} from "@/lib/validations/recipe";

describe("recipe validation", () => {
  it("accepts a complete recipe", () => {
    const result = recipeSchema.safeParse({
      title: "Risoto de cogumelos",
      description: "Cremoso e simples.",
      ingredients: ["2 xícaras de arroz", "200 g de cogumelos"],
      steps: ["Refogue os cogumelos.", "Cozinhe o arroz."],
      prepTimeMinutes: 45,
      servings: 4,
      difficulty: "MEDIUM",
      imageUrl: undefined,
      tags: ["Jantar", "Vegetariana"],
    });

    expect(result.success).toBe(true);
  });

  it("rejects missing ingredients, steps and non-positive numbers", () => {
    const result = recipeSchema.safeParse({
      title: "Teste",
      description: "",
      ingredients: [],
      steps: [],
      prepTimeMinutes: 0,
      servings: -1,
      difficulty: undefined,
      imageUrl: undefined,
      tags: [],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.flatten().fieldErrors;
      expect(fields.ingredients).toBeDefined();
      expect(fields.steps).toBeDefined();
      expect(fields.prepTimeMinutes).toBeDefined();
      expect(fields.servings).toBeDefined();
    }
  });

  it("parses repeated form fields and comma-separated tags", () => {
    const formData = new FormData();
    formData.set("title", "Pão caseiro");
    formData.set("description", "");
    formData.append("ingredients", "Farinha");
    formData.append("ingredients", "Fermento");
    formData.append("steps", "Misture.");
    formData.append("steps", "Asse.");
    formData.set("prepTimeMinutes", "90");
    formData.set("servings", "8");
    formData.set("difficulty", "EASY");
    formData.set("tags", "Café,  café , Massa");
    formData.set("imageUrl", "");

    const result = parseRecipeFormData(formData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBeUndefined();
      expect(result.data.prepTimeMinutes).toBe(90);
      expect(result.data.tags).toEqual(["Café", "Massa"]);
    }
  });
});

describe("tag normalization", () => {
  it("normalizes casing and repeated whitespace", () => {
    expect(normalizeTagName("  Receita   de Família ")).toBe(
      "receita de família",
    );
  });

  it("deduplicates tags while preserving the first display name", () => {
    expect(prepareTags(["Jantar", " jantar ", "Rápido"])).toEqual([
      { name: "Jantar", normalizedName: "jantar" },
      { name: "Rápido", normalizedName: "rápido" },
    ]);
  });
});
