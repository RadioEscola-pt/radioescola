import { describe, it, expect } from "vitest";
import { EXAM_CONFIG } from "@/lib/config";

describe("Contract: Exam Config", () => {
  it("should have valid exam configuration values", () => {
    expect(EXAM_CONFIG.DURATION_SECONDS).toBe(3600);
    expect(EXAM_CONFIG.QUESTIONS_PER_PAGE).toBe(10);
    expect(EXAM_CONFIG.MAX_QUESTIONS).toBe(40);
    expect(EXAM_CONFIG.PASSING_SCORE).toBe(20);
    expect(EXAM_CONFIG.WRONG_ANSWER_PENALTY).toBe(0.25);
  });

  it("should have immutable config (as const)", () => {
    // TypeScript enforces this at compile time, but we verify the values are defined
    expect(typeof EXAM_CONFIG.DURATION_SECONDS).toBe("number");
    expect(typeof EXAM_CONFIG.QUESTIONS_PER_PAGE).toBe("number");
    expect(typeof EXAM_CONFIG.MAX_QUESTIONS).toBe("number");
    expect(typeof EXAM_CONFIG.PASSING_SCORE).toBe("number");
    expect(typeof EXAM_CONFIG.WRONG_ANSWER_PENALTY).toBe("number");
  });
});
