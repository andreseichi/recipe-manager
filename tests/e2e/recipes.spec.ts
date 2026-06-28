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
    headers: {
      Origin: process.env.E2E_BASE_URL ?? "http://127.0.0.1:3100",
    },
    data: {
      email,
      password: "test-password-123",
    },
  });

  expect(response.ok(), await response.text()).toBe(true);
}

async function createRecipe(
  page: Page,
  title: string,
  tags = "teste, rápido",
) {
  await page.goto("/recipes/new");
  await dismissReleaseNoticeIfVisible(page);
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
  await page.getByLabel("Tags").fill(tags);
  await page.getByRole("button", { name: "Salvar receita" }).click();
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
}

async function expectRecipePreviewTags(
  page: Page,
  title: string,
  tags: string[],
) {
  const recipePreview = getRecipePreview(page, title);

  await expect(recipePreview).toBeVisible();

  for (const tag of tags) {
    await expect(recipePreview.getByText(tag, { exact: true })).toBeVisible();
  }
}

function getRecipePreview(page: Page, title: string) {
  return page
    .getByRole("link")
    .filter({ has: page.getByRole("heading", { name: title }) })
    .first();
}

async function expectTagFiltersCanScrollAndDrag(page: Page) {
  const tagFilters = page.getByRole("navigation", {
    name: "Filtrar receitas por tag",
  });
  const viewport = tagFilters.locator("[data-radix-scroll-area-viewport]");

  await expect(tagFilters).toBeVisible();
  await expect
    .poll(async () =>
      viewport.evaluate((element) => ({
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
      })),
    )
    .toMatchObject({
      clientWidth: expect.any(Number),
      scrollWidth: expect.any(Number),
    });
  await expect
    .poll(async () =>
      viewport.evaluate(
        (element) => element.scrollWidth > element.clientWidth,
      ),
    )
    .toBe(true);

  const box = await viewport.boundingBox();
  expect(box).not.toBeNull();

  const currentUrl = page.url();
  const y = box!.y + box!.height / 2;

  await page.mouse.move(box!.x + box!.width / 2, y);
  await page.mouse.wheel(500, 0);
  await expect(page).toHaveURL(currentUrl);
  await expect
    .poll(async () => viewport.evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(0);

  await viewport.evaluate((element) => {
    element.scrollLeft = 0;
  });

  await page.mouse.move(box!.x + box!.width - 12, y);
  await page.mouse.down();
  await page.mouse.move(box!.x + 12, y, { steps: 8 });
  await page.mouse.up();

  await expect(page).toHaveURL(currentUrl);
  await expect
    .poll(async () => viewport.evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(0);
}

async function expectRecipeDetailTags(page: Page, tags: string[]) {
  const tagsRegion = page.getByLabel("Tags da receita");

  await expect(tagsRegion).toBeVisible();

  for (const tag of tags) {
    await expect(tagsRegion.getByText(tag, { exact: true })).toBeVisible();
  }
}

function getReleaseToast(page: Page) {
  return page.locator('[aria-label="Toast de novidades da versao"]');
}

async function dismissReleaseNoticeIfVisible(page: Page) {
  const notice = getReleaseToast(page);

  try {
    await notice.waitFor({ state: "visible", timeout: 2_000 });
  } catch {
    return;
  }

  await notice.getByRole("button", { name: "Entendi" }).click();
  await expect(notice).toHaveCount(0);
}

async function acknowledgeReleaseNotice(page: Page) {
  const notice = getReleaseToast(page);

  await expect(notice).toBeVisible();
  await page.getByRole("button", { name: "Ver novidades" }).click();
  const dialog = page.getByRole("dialog");

  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Entendi" }).click();
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
  await expectRecipeDetailTags(page, ["teste", "rápido"]);

  await page.getByRole("link", { name: "Editar" }).click();
  await page.getByLabel("Nome da receita").fill(`${title} editado`);
  await page.getByRole("button", { name: "Salvar alterações" }).click();
  await expect(
    page.getByRole("heading", { name: `${title} editado` }),
  ).toBeVisible();
  await expectRecipeDetailTags(page, ["teste", "rápido"]);

  await page.goto("/recipes");
  await page.getByLabel("Buscar receitas pelo nome").fill("Bolo E2E");
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: `${title} editado` }),
  ).toBeVisible();
  await expectRecipePreviewTags(page, `${title} editado`, [
    "teste",
    "rápido",
  ]);

  await page.getByRole("link", { name: "Ver receitas em lista" }).click();
  await expectRecipePreviewTags(page, `${title} editado`, [
    "teste",
    "rápido",
  ]);

  await page.getByRole("link", { name: "rápido", exact: true }).click();
  await expect
    .poll(() => new URL(page.url()).searchParams.get("tag"))
    .toBe("rápido");
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

test("recipe tag filters scroll horizontally by wheel and drag", async ({ page }) => {
  const title = `Receita com tags rolaveis ${Date.now()}`;
  const longTags = [
    "tag extensa numero um",
    "tag extensa numero dois",
    "tag extensa numero tres",
    "tag extensa numero quatro",
    "tag extensa numero cinco",
    "tag extensa numero seis",
    "tag extensa numero sete",
    "tag extensa numero oito",
    "tag extensa numero nove",
    "tag extensa numero dez",
  ];

  await createTestUser(page, "tag-scroll");
  await createRecipe(page, title, longTags.join(", "));

  await page.goto(`/recipes?view=grid&q=${encodeURIComponent(title)}`);
  await expectTagFiltersCanScrollAndDrag(page);
  await expectRecipePreviewTags(page, title, [
    "tag extensa numero um",
    "tag extensa numero dez",
  ]);

  await page.getByRole("link", { name: "Ver receitas em lista" }).click();
  await expect(page).toHaveURL(/view=list/);
  await expectTagFiltersCanScrollAndDrag(page);
  await expectRecipePreviewTags(page, title, [
    "tag extensa numero um",
    "tag extensa numero dez",
  ]);
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
