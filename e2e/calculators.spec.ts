import { test, expect, type Locator, type Page, type TestInfo } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

import pt from "@/messages/pt.json";

const SCREENSHOT_DIR = join(process.cwd(), "test-results", "screenshots");

async function captureScreenshot(page: Page, testInfo: TestInfo, filename: string) {
  mkdirSync(SCREENSHOT_DIR, { recursive: true });
  const filePath = join(SCREENSHOT_DIR, filename);
  const buffer = await page.screenshot({ path: filePath, fullPage: false });
  await testInfo.attach(filename, { body: buffer, contentType: "image/png" });
}

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

/**
 * Opens a calculator the way a visitor does: NavBar → Aprender → Calculadoras.
 */
async function openCalculator(page: Page, menu: CalculatorName): Promise<Locator> {
  const entry = CALCULATORS.find((c) => c.menu === menu)!;

  await page.getByRole("button", { name: pt.NavBar.study }).click();
  await page.getByRole("menuitem", { name: pt.NavBar.calculators }).click();
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

test("the calculators submenu stays reachable on a short viewport", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 600 });

  await page.getByRole("button", { name: pt.NavBar.study }).click();
  await page.getByRole("menuitem", { name: pt.NavBar.calculators }).click();

  const submenu = page.getByRole("menu").last();
  await expect(submenu).toBeVisible();

  const box = (await submenu.boundingBox())!;
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.y + box.height).toBeLessThanOrEqual(600);

  await expect(submenu).toHaveCSS("overflow-y", "auto");
  const { clientHeight, scrollHeight } = await submenu.evaluate((el) => ({
    clientHeight: el.clientHeight,
    scrollHeight: el.scrollHeight,
  }));
  expect(scrollHeight).toBeGreaterThan(clientHeight);

  const last = CALCULATORS[CALCULATORS.length - 1]!;
  await page.getByRole("menuitem", { name: pt.NavBar.calculators }).hover();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("End");

  const focused = page.locator(":focus");
  await expect(focused).toContainText(last.menu);
  await expect(focused).toBeInViewport({ ratio: 1 });
});

test("1. Ohm's law computes resistance and power through the real UI", async ({ page }, testInfo) => {
  const window = await openCalculator(page, "Lei de Ohm");

  await window.getByLabel("Tensão (V)").fill("12");
  await window.getByLabel("Corrente (A)").fill("2");
  await window.getByRole("button", { name: "Calcular" }).click();

  await expect(window).toContainText(/Resistência calculada: 6/);
  await captureScreenshot(page, testInfo, "01-calc-ohms-law.png");
});

test("2. Component Sum computes series resistance through the real UI", async ({ page }, testInfo) => {
  const window = await openCalculator(page, "Soma Componentes");

  const inputs = window.getByPlaceholder("Valor");
  await inputs.nth(0).fill("100");
  await inputs.nth(1).fill("220");
  await window.getByRole("button", { name: "Calcular" }).click();

  await expect(window).toContainText("320.00 Ω");
  await captureScreenshot(page, testInfo, "02-calc-component-sum.png");
});

test("3. RLC Circuit computes resonant frequency through the real UI", async ({ page }, testInfo) => {
  const window = await openCalculator(page, "Circuito RLC");

  await window.getByLabel("Indutância (L)").fill("10");
  await window.getByLabel("Capacitância (C)").fill("100");
  await window.getByRole("button", { name: "Calcular" }).click();

  await expect(window).toContainText(/Frequência de ressonância:/);
  await captureScreenshot(page, testInfo, "03-calc-rlc.png");
});

test("4. VSWR computes standing wave ratio and return loss from power", async ({ page }, testInfo) => {
  const window = await openCalculator(page, "VSWR");

  await window.getByLabel("Potência Direta").fill("100");
  await window.getByLabel("Potência Refletida").fill("4");
  await window.getByRole("button", { name: "Calcular" }).click();

  await expect(window).toContainText("VSWR = 1.5000:1");
  await captureScreenshot(page, testInfo, "04-calc-vswr.png");
});

test("5. Gain calculator computes dB gain from power ratio", async ({ page }, testInfo) => {
  const window = await openCalculator(page, "Ganho");

  await window.getByLabel("Potência de Entrada (P1)").fill("10");
  await window.getByLabel("Potência de Saída (P2)").fill("100");
  await window.getByRole("button", { name: "Calcular" }).click();

  await expect(window).toContainText("10.000 dB");
  await captureScreenshot(page, testInfo, "05-calc-gain.png");
});

test("6. Transformer calculator computes turns ratio and type from voltages", async ({ page }, testInfo) => {
  const window = await openCalculator(page, "Transformador");

  await window.getByLabel("Tensão Primária (Vp)").fill("230");
  await window.getByLabel("Tensão Secundária (Vs)").fill("12");
  await window.getByRole("button", { name: "Calcular" }).click();

  await expect(window).toContainText(/Transformador Redutor/);
  await captureScreenshot(page, testInfo, "06-calc-transformer.png");
});

test("7. Reactance calculator computes inductive reactance XL", async ({ page }, testInfo) => {
  const window = await openCalculator(page, "Reatância");

  await window.getByLabel("Frequência (f)").fill("7.1");
  await window.getByLabel("Indutância (L)").fill("10");
  await window.getByRole("button", { name: "Calcular" }).click();

  await expect(window).toContainText(/Reatância Indutiva calculada:/);
  await captureScreenshot(page, testInfo, "07-calc-reactance.png");
});

test("8. Q Factor calculator computes quality factor and -3dB cutoffs", async ({ page }, testInfo) => {
  const window = await openCalculator(page, "Fator Q");

  await window.getByLabel("Frequência Central / Ressonância (f₀)").fill("7.1");
  await window.getByLabel("Largura de Banda a -3dB (BW)").fill("0.1");
  await window.getByRole("button", { name: "Calcular" }).click();

  await expect(window).toContainText(/Fator Q: 71/);
  await captureScreenshot(page, testInfo, "08-calc-q-factor.png");
});

test.describe("9. Wavelength calculator", () => {
  test("computes antenna dimensions with the default velocity factor", async ({ page }, testInfo) => {
    const window = await openCalculator(page, "Comprimento de Onda");

    await window.getByLabel("Frequência (f)").fill("14.150");
    await window.getByRole("button", { name: "Calcular" }).click();

    // λ = c / f = 21.19 m; dipole = λ/2 × 0.95 = 10.064 m
    await expect(window).toContainText("λ = 21.19 m");
    await expect(window).toContainText("10.064 m");
    await captureScreenshot(page, testInfo, "09-calc-wavelength.png");
  });

  test("a velocity factor of 0.66 changes both the answer and the shown formula", async ({
    page,
  }) => {
    const window = await openCalculator(page, "Comprimento de Onda");

    await window.getByLabel("Frequência (f)").fill("14.150");
    await window.getByLabel("Fator de Velocidade (k)").fill("0.66");

    await expect(window).toContainText("99.00");
    await expect(window).toContainText("49.50");
    await expect(window).not.toContainText("142.50");

    await window.getByRole("button", { name: "Calcular" }).click();
    await expect(window).toContainText("6.992 m");
  });

  test("rejects an out-of-range velocity factor instead of silently using 0.95", async ({
    page,
  }) => {
    const window = await openCalculator(page, "Comprimento de Onda");

    await window.getByLabel("Frequência (f)").fill("14.150");
    await window.getByLabel("Fator de Velocidade (k)").fill("66");
    await window.getByRole("button", { name: "Calcular" }).click();

    await expect(window).toContainText("O fator de velocidade deve estar entre 0 e 1");
    await expect(window).not.toContainText("λ = 21.19 m");
  });
});
