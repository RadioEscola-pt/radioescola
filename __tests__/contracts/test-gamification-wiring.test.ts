/**
 * Contract tests: Gamification wiring
 *
 * These tests verify that pages which handle activity completion
 * actually call the corresponding gamification engine functions.
 * This prevents regressions where UI works but gamification is silently broken.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

function readSource(relativePath: string): string {
  return readFileSync(resolve(__dirname, "../../", relativePath), "utf-8");
}

describe("Contract: Gamification wiring", () => {
  describe("exam page calls processExamComplete via provider", () => {
    it("ProgressProvider wires processExamComplete to recordExamWithGamification", () => {
      const source = readSource("components/providers/ProgressProvider.tsx");
      expect(source).toContain("processExamComplete");
      expect(source).toContain("recordExamWithGamification");
    });
  });

  describe("browse and flash pages award gamification per question", () => {
    it("ProgressProvider wires processQuestionAnswered to recordQuestionWithGamification", () => {
      const source = readSource("components/providers/ProgressProvider.tsx");
      expect(source).toContain("processQuestionAnswered");
      expect(source).toContain("recordQuestionWithGamification");
    });

    it("browse page uses recordQuestionWithGamification", () => {
      const source = readSource("app/browse/[category]/page.tsx");
      expect(source).toContain("recordQuestionWithGamification");
    });

    it("flash page uses recordQuestionWithGamification", () => {
      const source = readSource("app/browse/[category]/flash/page.tsx");
      expect(source).toContain("recordQuestionWithGamification");
    });
  });

  describe("smart practice page calls recordSmartPracticeSession on completion", () => {
    it("destructures recordSmartPracticeSession from context", () => {
      const source = readSource("app/browse/[category]/smart-practice/page.tsx");
      expect(source).toContain("recordSmartPracticeSession");
    });

    it("calls recordSmartPracticeSession when session ends", () => {
      const source = readSource("app/browse/[category]/smart-practice/page.tsx");
      // Should call it near where sessionComplete is set to true
      expect(source).toMatch(/setSessionComplete\(true\)[\s\S]{0,200}recordSmartPracticeSession/);
    });
  });

  describe("drill page calls processDrillComplete via provider", () => {
    it("ProgressProvider exports recordDrillComplete", () => {
      const source = readSource("components/providers/ProgressProvider.tsx");
      expect(source).toContain("processDrillComplete");
      expect(source).toContain("recordDrillComplete");
    });

    it("drill page uses recordDrillComplete", () => {
      const source = readSource("app/drill/page.tsx");
      expect(source).toContain("recordDrillComplete");
    });
  });

  describe("processExamComplete updates all daily goal types", () => {
    it("updates exams_taken daily goal", () => {
      const source = readSource("lib/gamification/engine.ts");
      // Find the processExamComplete function and verify it updates exams_taken
      const examFn = source.slice(
        source.indexOf("export function processExamComplete"),
        source.indexOf("export function processQuestionAnswered")
      );
      expect(examFn).toContain('"exams_taken"');
    });

    it("updates questions_answered daily goal", () => {
      const source = readSource("lib/gamification/engine.ts");
      const examFn = source.slice(
        source.indexOf("export function processExamComplete"),
        source.indexOf("export function processQuestionAnswered")
      );
      expect(examFn).toContain('"questions_answered"');
    });

    it("updates questions_correct daily goal", () => {
      const source = readSource("lib/gamification/engine.ts");
      const examFn = source.slice(
        source.indexOf("export function processExamComplete"),
        source.indexOf("export function processQuestionAnswered")
      );
      expect(examFn).toContain('"questions_correct"');
    });

    it("updates lifetime questionsAnswered", () => {
      const source = readSource("lib/gamification/engine.ts");
      const examFn = source.slice(
        source.indexOf("export function processExamComplete"),
        source.indexOf("export function processQuestionAnswered")
      );
      expect(examFn).toContain("questionsAnswered:");
    });

    it("updates lifetime questionsCorrect", () => {
      const source = readSource("lib/gamification/engine.ts");
      const examFn = source.slice(
        source.indexOf("export function processExamComplete"),
        source.indexOf("export function processQuestionAnswered")
      );
      expect(examFn).toContain("questionsCorrect:");
    });
  });

  describe("processDrillComplete updates daily goals and lifetime stats", () => {
    it("updates questions_answered daily goal", () => {
      const source = readSource("lib/gamification/engine.ts");
      const drillFn = source.slice(
        source.indexOf("export function processDrillComplete"),
        source.indexOf("export function toggleGamification")
      );
      expect(drillFn).toContain('"questions_answered"');
    });

    it("updates questions_correct daily goal", () => {
      const source = readSource("lib/gamification/engine.ts");
      const drillFn = source.slice(
        source.indexOf("export function processDrillComplete"),
        source.indexOf("export function toggleGamification")
      );
      expect(drillFn).toContain('"questions_correct"');
    });

    it("updates lifetime questionsAnswered", () => {
      const source = readSource("lib/gamification/engine.ts");
      const drillFn = source.slice(
        source.indexOf("export function processDrillComplete"),
        source.indexOf("export function toggleGamification")
      );
      expect(drillFn).toContain("questionsAnswered:");
    });
  });

  describe("processSmartPracticeSession updates smart_practice_questions goal", () => {
    it("updates smart_practice_questions daily goal", () => {
      const source = readSource("lib/gamification/engine.ts");
      const spFn = source.slice(
        source.indexOf("export function processSmartPracticeSession"),
        source.indexOf("export function processDrillComplete")
      );
      expect(spFn).toContain('"smart_practice_questions"');
    });
  });
});
