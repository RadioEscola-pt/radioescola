import { test, expect, type Locator, type Page } from "@playwright/test";

/**
 * These tests drive the shipped app: the real NavBar, the real
 * CalculatorProvider, the real `messages/pt.json`. Anything that can be
 * asserted without a browser (the physics, a component in isolation) belongs in
 * `__tests__/`, not here — this suite exists to catch the wiring that unit
 * tests cannot see, so it stays deliberately short.
 *
 * The default locale is Portuguese and no cookie is set, so the UI strings
 * asserted below are the pt ones a visitor actually gets. The menu entry uses
 * `shortTitle` while the window uses `title`, and for four calculators those
 * differ — hence both columns here.
 */
const CALCULATORS = [
  { menu: "Lei de Ohm", title: "Lei de Ohm" },
  { menu: "Soma Componentes", title: "Soma de Componentes" },
  { menu: "Circuito RLC", title: "Circuito RLC" },
  { menu: "VSWR", title: "VSWR" },
  { menu: "Ganho", title: "Ganho" },
  { menu: "Transformador", title: "Transformador" },
  { menu: "Reatância", title: "Reatância" },
  { menu: "Fator Q", title: "Fator Q e Largura de Banda" },
  { menu: "Comprimento de Onda", title: "Comprimento de Onda e Antenas" },
] as const;

type CalculatorName = (typeof CALCULATORS)[number]["menu"];

/** Opens a calculator the way a visitor does: NavBar → Estudar → Calculadoras. */
async function openCalculator(page: Page, menu: CalculatorName): Promise<Locator> {
  const entry = CALCULATORS.find((c) => c.menu === menu)!;

  await page.getByRole("button", { name: "Estudar" }).click();
  await page.getByRole("menuitem", { name: "Calculadoras" }).click();
  // Match on the item's own title node: a couple of the descriptions mention
  // another calculator's name, so an accessible-name substring is ambiguous.
  await page
    .getByRole("menuitem")
    .filter({ has: page.getByText(entry.menu, { exact: true }) })
    .click();

  const window = page.getByRole("dialog", { name: entry.title, exact: true });
  await expect(window).toBeVisible();
  return window;
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("every registered calculator opens and closes from the navigation", async ({ page }) => {
  for (const { menu, title } of CALCULATORS) {
    const window = await openCalculator(page, menu);
    await expect(window).toContainText(title);

    await window.getByRole("button", { name: "Fechar calculadora" }).click();
    await expect(window).toBeHidden();
  }
});

test("Ohm's law computes through the real UI", async ({ page }) => {
  const window = await openCalculator(page, "Lei de Ohm");

  await window.getByLabel("Tensão (V)").fill("12");
  await window.getByLabel("Corrente (A)").fill("2");
  await window.getByRole("button", { name: "Calcular" }).click();

  await expect(window).toContainText(/Resistência calculada: 6/);
});

test.describe("wavelength calculator", () => {
  test("computes antenna dimensions with the default velocity factor", async ({ page }) => {
    const window = await openCalculator(page, "Comprimento de Onda");

    await window.getByLabel("Frequência (f)").fill("14.150");
    await window.getByRole("button", { name: "Calcular" }).click();

    // λ = c / f = 21.19 m; dipole = λ/2 × 0.95 = 10.064 m
    await expect(window).toContainText("λ = 21.19 m");
    await expect(window).toContainText("10.064 m");
  });

  test("a velocity factor of 0.66 changes both the answer and the shown formula", async ({
    page,
  }) => {
    const window = await openCalculator(page, "Comprimento de Onda");

    await window.getByLabel("Frequência (f)").fill("14.150");
    await window.getByLabel("Fator de Velocidade (k)").fill("0.66");

    // The formula constant is 150 × k, so it must follow the input rather than
    // stay pinned to the 142.50 of the default k = 0.95.
    await expect(window).toContainText("99.00 / f(MHz)");

    await window.getByRole("button", { name: "Calcular" }).click();
    await expect(window).toContainText("6.992 m");
  });

  test("rejects an out-of-range velocity factor instead of silently using 0.95", async ({
    page,
  }) => {
    const window = await openCalculator(page, "Comprimento de Onda");

    await window.getByLabel("Frequência (f)").fill("14.150");
    // 66 is the percent convention for coax — a plausible mistake that must not
    // be silently reinterpreted as the 0.95 default.
    await window.getByLabel("Fator de Velocidade (k)").fill("66");
    await window.getByRole("button", { name: "Calcular" }).click();

    await expect(window).toContainText("O fator de velocidade deve estar entre 0 e 1");
    await expect(window).not.toContainText("λ = 21.19 m");
  });
});
