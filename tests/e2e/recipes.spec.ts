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

async function signInTestUser(page: Page, email: string) {
  const response = await page.request.post("/api/auth/sign-in/email", {
    data: {
      email,
      password: "test-password-123",
    },
  });

  expect(response.ok(), await response.text()).toBe(true);
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

function getReleaseToast(page: Page) {
  return page.locator('[aria-label="Toast de novidades da versao"]');
}

async function acknowledgeReleaseNotice(page: Page) {
  const notice = getReleaseToast(page);

  await expect(notice).toBeVisible();
  await page.getByRole("button", { name: "Ver novidades" }).click();
  await expect(
    page.getByRole("dialog", { name: "Avisos de novidades no app" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Entendi" }).last().click();
  await expect(notice).toHaveCount(0);
}

test("landing and complete recipe workflow", async ({ page }) => {
  test.setTimeout(120_000);

  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Todas as suas receitas/i }),
  ).toBeVisible();

  await createTestUser(page, "fluxo");
  await page.goto("/recipes");
  await acknowledgeReleaseNotice(page);

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

test("release notice is persisted per user", async ({ page }) => {
  await createTestUser(page, "release-owner");
  await page.goto("/recipes");
  await acknowledgeReleaseNotice(page);

  await page.reload();
  await expect(getReleaseToast(page)).toHaveCount(0);

  await page.context().clearCookies();
  await createTestUser(page, "release-visitor");
  await page.goto("/recipes");
  await expect(getReleaseToast(page)).toBeVisible();
});

test("recipe sharing link is public and revocable", async ({ page }) => {
  const email = await createTestUser(page, "share-owner");
  const title = `Receita compartilhada ${Date.now()}`;
  await createRecipe(page, title);
  const privateRecipeUrl = page.url();

  await page.getByRole("button", { name: "Compartilhar" }).click();
  await page.getByRole("button", { name: "Gerar link" }).click();

  const publicLinkInput = page.getByLabel("Link público");
  await expect(publicLinkInput).toHaveValue(/\/receitas\//);
  const publicRecipeUrl = await publicLinkInput.inputValue();

  await page.context().clearCookies();
  await page.goto(publicRecipeUrl);
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
  await expect(page.getByRole("link", { name: "Editar" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Excluir" })).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Compartilhar" }),
  ).toHaveCount(0);

  await signInTestUser(page, email);
  await page.goto(privateRecipeUrl);
  await page.getByRole("button", { name: "Compartilhar" }).click();
  await page.getByRole("button", { name: "Desativar link" }).click();
  await expect(
    page.getByText("Link de compartilhamento desativado."),
  ).toBeVisible();

  await page.context().clearCookies();
  await page.goto(publicRecipeUrl);
  await expect(
    page.getByRole("heading", { name: "Receita não encontrada" }),
  ).toBeVisible();
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
