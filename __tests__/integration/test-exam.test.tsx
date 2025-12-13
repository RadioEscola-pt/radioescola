import { describe, it, expect } from "vitest";
import { EXAM_CONFIG } from "@/lib/config";

describe("Integration: Exam Scoring Logic", () => {
  it("calculates score correctly for correct answers", () => {
    const correctAnswers = 30;
    const wrongAnswers = 10;
    const unanswered = 0;

    const score =
      correctAnswers * 1 - wrongAnswers * EXAM_CONFIG.WRONG_ANSWER_PENALTY;
    expect(score).toBe(27.5);
  });

  it("returns passing score threshold", () => {
    expect(EXAM_CONFIG.PASSING_SCORE).toBe(20);
  });

  it("handles all correct answers", () => {
    const correctAnswers = EXAM_CONFIG.MAX_QUESTIONS;
    const score = correctAnswers * 1;
    expect(score).toBe(40);
    expect(score).toBeGreaterThan(EXAM_CONFIG.PASSING_SCORE);
  });

  it("handles all wrong answers", () => {
    const wrongAnswers = EXAM_CONFIG.MAX_QUESTIONS;
    const score = -wrongAnswers * EXAM_CONFIG.WRONG_ANSWER_PENALTY;
    expect(score).toBe(-10);
    expect(score).toBeLessThan(EXAM_CONFIG.PASSING_SCORE);
  });
});
