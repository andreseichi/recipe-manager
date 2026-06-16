import { z } from "zod";

const optionalPositiveInteger = z.preprocess(
  (value) => (value === "" || value === null ? undefined : Number(value)),
  z
    .number({ error: "Informe um número válido." })
    .int("Use apenas números inteiros.")
    .positive("O valor deve ser maior que zero.")
    .max(10_000, "O valor informado é muito alto.")
    .optional(),
);

export const recipeSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Informe o nome da receita.")
    .max(120, "Use no máximo 120 caracteres."),
  description: z
    .string()
    .trim()
    .max(2_000, "Use no máximo 2.000 caracteres.")
    .optional()
    .transform((value) => value || undefined),
  ingredients: z
    .array(
      z
        .string()
        .trim()
        .min(1, "O ingrediente não pode ficar vazio.")
        .max(200, "Cada ingrediente pode ter até 200 caracteres."),
    )
    .min(1, "Adicione pelo menos um ingrediente.")
    .max(50, "Adicione no máximo 50 ingredientes."),
  steps: z
    .array(
      z
        .string()
        .trim()
        .min(1, "A etapa não pode ficar vazia.")
        .max(1_000, "Cada etapa pode ter até 1.000 caracteres."),
    )
    .min(1, "Adicione pelo menos uma etapa.")
    .max(30, "Adicione no máximo 30 etapas."),
  prepTimeMinutes: optionalPositiveInteger,
  servings: optionalPositiveInteger,
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
  imageUrl: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.url("A URL da imagem é inválida.").optional(),
  ),
  tags: z
    .array(z.string().trim().min(1).max(40, "Cada tag pode ter até 40 caracteres."))
    .max(10, "Adicione no máximo 10 tags."),
});

export type RecipeInput = z.infer<typeof recipeSchema>;
export type RecipeFieldErrors = Partial<
  Record<keyof RecipeInput, string[]>
>;

export type RecipeFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: RecipeFieldErrors;
};

export const initialRecipeFormState: RecipeFormState = {
  status: "idle",
};

export function normalizeTagName(value: string) {
  return value
    .normalize("NFKC")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("pt-BR");
}

export function prepareTags(values: string[]) {
  const uniqueTags = new Map<string, string>();

  for (const value of values) {
    const name = value.normalize("NFKC").trim().replace(/\s+/g, " ");
    const normalizedName = normalizeTagName(name);

    if (name && normalizedName && !uniqueTags.has(normalizedName)) {
      uniqueTags.set(normalizedName, name);
    }
  }

  return Array.from(uniqueTags, ([normalizedName, name]) => ({
    name,
    normalizedName,
  }));
}

export function parseRecipeFormData(formData: FormData) {
  const rawTags = String(formData.get("tags") ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  return recipeSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    ingredients: formData.getAll("ingredients"),
    steps: formData.getAll("steps"),
    prepTimeMinutes: formData.get("prepTimeMinutes"),
    servings: formData.get("servings"),
    difficulty: formData.get("difficulty") || undefined,
    imageUrl: formData.get("imageUrl") ?? "",
    tags: prepareTags(rawTags).map((tag) => tag.name),
  });
}

export function getRecipeFieldErrors(error: z.ZodError<RecipeInput>) {
  return z.flattenError(error).fieldErrors as RecipeFieldErrors;
}
