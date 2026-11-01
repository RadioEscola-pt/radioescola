import { test, expect, type Page, type TestInfo } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

import pt from "@/messages/pt.json";

const SCREENSHOT_DIR = join(process.cwd(), "test-results", "screenshots");

async function captureScreenshot(
  page: Page,
  testInfo: TestInfo,
  filename: string,
  fullPage = false
) {
  mkdirSync(SCREENSHOT_DIR, { recursive: true });
  const filePath = join(SCREENSHOT_DIR, filename);
  const buffer = await page.screenshot({ path: filePath, fullPage });
  await testInfo.attach(filename, { body: buffer, contentType: "image/png" });
}

test.describe("simulators, menus, questions, and tutorials", () => {
  test("home page renders all 3 licensing categories", async ({ page }, testInfo) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText(/Categoria 3/i).first()).toBeVisible();
    await expect(page.getByText(/Categoria 2/i).first()).toBeVisible();
    await expect(page.getByText(/Categoria 1/i).first()).toBeVisible();

    await captureScreenshot(page, testInfo, "10-home-categories.png");
  });

  test("complete exam simulator flow: answer, clear, shuffle modal, finish, review questions, and restart", async ({
    page,
  }, testInfo) => {
    await page.goto("/exam/3");

    // 1. Wait for the 40-question exam to load and verify header controls
    const endButton = page.getByRole("button", { name: pt.Exam.endQuiz });
    await expect(endButton).toBeVisible();
    await expect(page.getByText("0/40").first()).toBeVisible();

    // 2. Answer Question 1 and Question 2
    const optionButtons = page.locator("section button").filter({ hasText: /^[ABCD]/ });
    await expect(optionButtons.first()).toBeVisible();
    await optionButtons.nth(0).click(); // Q1 option A
    await optionButtons.nth(5).click(); // Q2 option B
    await expect(page.getByText("2/40").first()).toBeVisible();

    // 3. Test clearing Question 2's answer and re-answering Question 2 & Question 3
    const clearQ1 = page.getByRole("button", {
      name: pt.Exam.clearAnswerFor.replace("{number}", "1"),
      exact: true,
    });
    const clearQ2 = page.getByRole("button", {
      name: pt.Exam.clearAnswerFor.replace("{number}", "2"),
      exact: true,
    });
    await expect(clearQ1).toBeEnabled();
    await expect(clearQ2).toBeEnabled();
    await clearQ2.click();
    await expect(clearQ2).toBeDisabled();
    await expect(page.getByText("1/40").first()).toBeVisible();

    // Answer Q2 and Q3 so we have 3 answered questions
    await optionButtons.nth(6).click(); // Q2 option C
    await optionButtons.nth(8).click(); // Q3 option A
    await expect(page.getByText("3/40").first()).toBeVisible();

    await captureScreenshot(page, testInfo, "11-exam-simulator-active.png");

    // 4. Test shuffle options confirmation dialog (and cancel to preserve current exam)
    const shuffleCheckbox = page.getByRole("checkbox", { name: pt.Exam.shuffle.label });
    await shuffleCheckbox.click();
    await expect(page.getByRole("heading", { name: pt.Exam.shuffle.confirmTitleOn })).toBeVisible();
    await captureScreenshot(page, testInfo, "12-exam-shuffle-dialog.png");
    await page.getByRole("button", { name: pt.Exam.shuffle.cancel }).click();

    // 5. Finish the exam and verify the Results screen
    await endButton.click();
    const tryAgainBtn = page.getByRole("button", { name: "Tentar Outra Vez" });
    const viewQuestionsBtn = page.getByRole("button", { name: pt.Exam.viewQuestions });
    await expect(tryAgainBtn).toBeVisible();
    await expect(viewQuestionsBtn).toBeVisible();
    await expect(page.getByRole("heading", { name: "Onde estudar a seguir" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Rever" })).toBeVisible();

    await captureScreenshot(page, testInfo, "13-exam-simulator-results.png");

    // 6. Expand Question 1 in the review accordion on the results page
    const firstReviewAccordion = page.locator("h3 button").first();
    await firstReviewAccordion.click();
    await captureScreenshot(page, testInfo, "14-exam-results-accordion-review.png");

    // 7. Click "Ver Perguntas" to inspect the inline exam review mode with explanations
    await viewQuestionsBtn.click();
    await expect(page.getByRole("button", { name: pt.Exam.viewResults })).toBeVisible();
    await captureScreenshot(page, testInfo, "15-exam-inline-questions-review.png");

    // 8. Return to Results and start a fresh exam with "Tentar Outra Vez"
    await page.getByRole("button", { name: pt.Exam.viewResults }).click();
    await tryAgainBtn.click();
    await expect(page.getByRole("button", { name: pt.Exam.endQuiz })).toBeVisible();
    await expect(page.getByText("0/40").first()).toBeVisible();
  });

  test("question bank browser loads questions and explanations across all 3 categories (Cat 3, Cat 2, Cat 1)", async ({
    page,
  }, testInfo) => {
    // Category 3
    await page.goto("/browse/3");
    await expect(page.getByPlaceholder(pt.Browse.searchPlaceholder)).toBeVisible();
    const cat3FirstAnswer = page.locator("main button").filter({ hasText: /^A/ }).first();
    await expect(cat3FirstAnswer).toBeVisible();
    await cat3FirstAnswer.click();
    await captureScreenshot(page, testInfo, "16-browse-cat3-questions.png");

    // Category 2
    await page.goto("/browse/2");
    await expect(page.getByPlaceholder(pt.Browse.searchPlaceholder)).toBeVisible();
    const cat2FirstAnswer = page.locator("main button").filter({ hasText: /^A/ }).first();
    await expect(cat2FirstAnswer).toBeVisible();
    await cat2FirstAnswer.click();
    await captureScreenshot(page, testInfo, "23-browse-cat2-questions.png");

    // Category 1
    await page.goto("/browse/1");
    await expect(page.getByPlaceholder(pt.Browse.searchPlaceholder)).toBeVisible();
    const cat1FirstAnswer = page.locator("main button").filter({ hasText: /^A/ }).first();
    await expect(cat1FirstAnswer).toBeVisible();
    await cat1FirstAnswer.click();
    await captureScreenshot(page, testInfo, "24-browse-cat1-questions.png");
  });

  test("flashcards simulator loads a random card and advances", async ({ page }, testInfo) => {
    await page.goto("/browse/3/flash");

    const firstOption = page.locator("main button").filter({ hasText: /^A/ }).first();
    await expect(firstOption).toBeVisible();
    await firstOption.click();

    const nextButton = page.getByRole("button", { name: pt.Browse.flashNext });
    await expect(nextButton).toBeVisible();

    await captureScreenshot(page, testInfo, "17-simulator-flashcards.png");
  });

  test("smart practice (spaced repetition) loads session and shows SM-2 rating buttons", async ({
    page,
  }, testInfo) => {
    await page.goto("/browse/3/smart-practice");

    const firstOption = page.locator("main button").filter({ hasText: /^A/ }).first();
    await expect(firstOption).toBeVisible();
    await firstOption.click();

    await expect(page.getByText(pt.SmartPractice.ratePrompt)).toBeVisible();
    await expect(page.getByRole("button", { name: new RegExp(pt.SmartPractice.good) })).toBeVisible();

    await captureScreenshot(page, testInfo, "18-simulator-smart-practice.png");
  });

  test("quick drill simulator starts a 10-question timed drill and answers a question", async ({
    page,
  }, testInfo) => {
    await page.goto("/drill");

    await expect(page.getByRole("heading", { name: pt.Drill.title })).toBeVisible();
    const startButton = page.getByRole("button", { name: pt.Drill.startDrill });
    await expect(startButton).toBeVisible();
    await startButton.click();

    await expect(page.getByRole("timer")).toBeVisible();
    await expect(page.getByText("Questão 1 de 10")).toBeVisible();

    const firstOption = page.locator("main button").filter({ hasText: /^A/ }).first();
    await firstOption.click();

    await expect(page.getByRole("button", { name: pt.Drill.next })).toBeVisible();

    await captureScreenshot(page, testInfo, "19-simulator-drill.png");
  });

  test("navigation menus open on click: Aprender, Calculadoras submenu, and Exames", async ({
    page,
  }, testInfo) => {
    await page.goto("/");

    // 1. Click "Aprender" menu
    await page.getByRole("button", { name: pt.NavBar.study }).click();
    await expect(page.getByRole("menuitem", { name: pt.NavBar.quickDrill })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: pt.NavBar.studyLibrary })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: pt.NavBar.formulary })).toBeVisible();
    await captureScreenshot(page, testInfo, "20-menu-aprender.png");

    // 2. Click "Calculadoras" submenu inside "Aprender"
    await page.getByRole("menuitem", { name: pt.NavBar.calculators }).click();
    await expect(page.getByRole("menuitem").filter({ hasText: "Lei de Ohm" }).first()).toBeVisible();
    await captureScreenshot(page, testInfo, "21-menu-calculadoras.png");

    // Close Aprender menu by pressing Escape, then click "Exames" menu
    await page.keyboard.press("Escape");
    await page.keyboard.press("Escape");

    // 3. Click "Exames" menu
    await page.getByRole("button", { name: pt.NavBar.exams }).click();
    await expect(page.getByRole("menuitem").filter({ hasText: pt.NavBar.submitExam })).toBeVisible();
    await captureScreenshot(page, testInfo, "22-menu-exames.png");
  });

  test("tutorials and study library: index, chapter drawer, interactive guides, and formulary", async ({
    page,
  }, testInfo) => {
    // 1. Tutorials index page (/aprender)
    await page.goto("/aprender");
    const firstChapterBtn = page.locator("main button[aria-expanded]").first();
    await expect(firstChapterBtn).toBeVisible();
    await captureScreenshot(page, testInfo, "25-tutorials-index.png");

    // 2. Expand a syllabus chapter drawer on /aprender
    await firstChapterBtn.click();
    await expect(firstChapterBtn).toHaveAttribute("aria-expanded", "true");
    await captureScreenshot(page, testInfo, "26-tutorials-chapter-expanded.png");

    // 3. Tutorial guide with interactive StudyQuestionCard (/aprender/leis-de-kirchhoff)
    await page.goto("/aprender/leis-de-kirchhoff");
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
    const quizOption = page.locator("main button").filter({ hasText: /^A/ }).first();
    if (await quizOption.isVisible()) {
      await quizOption.click();
    }
    await captureScreenshot(page, testInfo, "27-tutorial-guide-kirchhoff.png");

    // 4. Tutorial guide with interactive Resistor color code calculator (/aprender/codigo-de-cores)
    await page.goto("/aprender/codigo-de-cores");
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
    await captureScreenshot(page, testInfo, "28-tutorial-guide-codigo-cores.png");

    // 5. Formulário (/aprender/formulario) with 151 formulas and interactive QuestionRef preview
    await page.goto("/aprender/formulario");
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
    await captureScreenshot(page, testInfo, "29-tutorial-formulario.png");
  });

  test("opens Submit Exam (/submit-exam) and displays anonymization notice", async ({
    page,
  }, testInfo) => {
    await page.goto("/submit-exam");
    await expect(
      page.getByRole("heading", { name: pt.SubmitExam.title })
    ).toBeVisible();
    await expect(
      page.getByText(pt.SubmitExam.form.anonymizedNotice)
    ).toBeVisible();
    await captureScreenshot(page, testInfo, "30-submit-exam.png", true);
  });
});
