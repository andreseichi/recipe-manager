import { expect, test, type Page } from "@playwright/test";

async function createTestUser(page: Page, prefix: string) {
  const email = `${prefix}-${crypto.randomUUID()}@example.com`;
  const response = await page.request.post("/api/auth/sign-up/email", {
    data: {
      name: `Usuário ${prefix}`,
      email,
      password: "test-password-123",
    },
  });

  expect(response.ok(), await response.text()).toBe(true);
  return email;
}

async function createRecipe(page: Page, title: string) {
  await page.goto("/recipes/new");
  await page.getByLabel("Nome da receita").fill(title);
  await page
    .getByLabel("Descrição")
    .fill("Uma receita criada pelo teste automatizado.");
  await page
    .getByRole("textbox", { name: "Ingredientes * 1", exact: true })
    .fill("2 xícaras de farinha");
  await page
    .getByRole("textbox", { name: "Modo de preparo * 1", exact: true })
    .fill("Misture todos os ingredientes.");
  await page.getByLabel("Tempo (minutos)").fill("35");
  await page.getByLabel("Porções").fill("4");
  await page.getByLabel("Dificuldade").selectOption("EASY");
  await page.getByLabel("Tags").fill("teste, rápido");
  await page.getByRole("button", { name: "Salvar receita" }).click();
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
}

test("landing and complete recipe workflow", async ({ page }) => {
  test.setTimeout(120_000);

  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Todas as suas receitas/i }),
  ).toBeVisible();

  await createTestUser(page, "fluxo");
  await page.goto("/recipes");

  const title = `Bolo E2E ${Date.now()}`;
  await createRecipe(page, title);

  await page.getByRole("link", { name: "Editar" }).click();
  await page.getByLabel("Nome da receita").fill(`${title} editado`);
  await page.getByRole("button", { name: "Salvar alterações" }).click();
  await expect(
    page.getByRole("heading", { name: `${title} editado` }),
  ).toBeVisible();

  await page.goto("/recipes");
  await page.getByLabel("Buscar receitas pelo nome").fill("Bolo E2E");
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: `${title} editado` }),
  ).toBeVisible();

  await page.getByRole("link", { name: "rápido", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: `${title} editado` }),
  ).toBeVisible();

  await page.getByRole("heading", { name: `${title} editado` }).click();
  await page.getByRole("button", { name: "Excluir" }).click();
  await page.getByRole("button", { name: "Excluir receita" }).click();
  await expect(page).toHaveURL(/\/recipes$/);

  const batchId = Date.now();

  for (let index = 1; index <= 13; index += 1) {
    await createRecipe(page, `Receita paginada ${batchId}-${index}`);
  }

  await page.goto("/recipes?view=grid");
  await expect(page.getByText("Página 1 de 2")).toBeVisible();

  await page.getByRole("link", { name: /Próxima/ }).click();
  await expect(page).toHaveURL(/view=grid/);
  await expect(page).toHaveURL(/page=2/);
  await expect(page.getByText("Página 2 de 2")).toBeVisible();

  await page.getByRole("link", { name: /Anterior/ }).click();
  await expect(page).toHaveURL(/view=grid/);
  await expect(page).not.toHaveURL(/page=2/);
  await expect(page.getByText("Página 1 de 2")).toBeVisible();
});

test("a user cannot open another user's recipe by id", async ({ page }) => {
  await createTestUser(page, "owner");
  const title = `Receita privada ${Date.now()}`;
  await createRecipe(page, title);
  const recipeUrl = page.url();

  await page.context().clearCookies();
  await createTestUser(page, "visitor");
  await page.goto(recipeUrl);

  await expect(
    page.getByRole("heading", { name: "Receita não encontrada" }),
  ).toBeVisible({ timeout: 15_000 });
});
