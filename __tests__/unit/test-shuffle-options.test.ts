import { describe, it, expect } from "vitest";
import {
  shuffleQuestionOptions,
  shuffleAllOptions,
  toCanonicalAnswers,
} from "@/lib/exam/shuffle-options";

const q = (id: number, options: string[], correctIndex: number) => ({ id, options, correctIndex });

/** A deterministic stand-in for Math.random, so a shuffle can be asserted exactly. */
function scriptedRng(values: number[]): () => number {
  let i = 0;
  return () => values[i++ % values.length] ?? 0;
}

describe("Unit: shuffleQuestionOptions", () => {
  it("keeps the correct answer pointing at the same text", () => {
    const original = q(1, ["A", "B", "C", "D"], 2);

    for (let run = 0; run < 50; run++) {
      const { question } = shuffleQuestionOptions(original);
      expect(question.options[question.correctIndex]).toBe("C");
    }
  });

  it("keeps every option, exactly once", () => {
    const { question } = shuffleQuestionOptions(q(1, ["A", "B", "C", "D"], 0));

    expect([...question.options].sort()).toEqual(["A", "B", "C", "D"]);
  });

  it("does not mutate the question it was given", () => {
    const original = q(1, ["A", "B", "C", "D"], 0);
    shuffleQuestionOptions(original);

    expect(original.options).toEqual(["A", "B", "C", "D"]);
    expect(original.correctIndex).toBe(0);
  });

  it("returns a permutation that reads the shuffled order back to the original", () => {
    const original = q(1, ["A", "B", "C", "D"], 1);
    const { question, permutation } = shuffleQuestionOptions(original);

    question.options.forEach((text, position) => {
      expect(original.options[permutation[position]!]).toBe(text);
    });
  });

  it("actually moves the answer around, given a real spread of draws", () => {
    const positions = new Set<number>();
    for (let run = 0; run < 200; run++) {
      positions.add(shuffleQuestionOptions(q(1, ["A", "B", "C", "D"], 0)).question.correctIndex);
    }

    expect(positions.size).toBeGreaterThan(1);
  });

  it("handles a question with a single option", () => {
    const { question } = shuffleQuestionOptions(q(1, ["A"], 0));

    expect(question.options).toEqual(["A"]);
    expect(question.correctIndex).toBe(0);
  });

  it("is deterministic for a given sequence of draws", () => {
    const draws = [0.9, 0.1, 0.5, 0.3];
    const a = shuffleQuestionOptions(q(1, ["A", "B", "C", "D"], 0), scriptedRng(draws));
    const b = shuffleQuestionOptions(q(1, ["A", "B", "C", "D"], 0), scriptedRng(draws));

    expect(a.question.options).toEqual(b.question.options);
    expect(a.question.correctIndex).toBe(b.question.correctIndex);
  });
});

describe("Unit: shuffleAllOptions", () => {
  it("shuffles each question and keys the permutations by id", () => {
    const { questions, permutations } = shuffleAllOptions([
      q(7, ["A", "B"], 0),
      q(9, ["C", "D"], 1),
    ]);

    expect(questions).toHaveLength(2);
    expect(Object.keys(permutations).sort()).toEqual(["7", "9"]);
    expect(questions[0]!.options[questions[0]!.correctIndex]).toBe("A");
    expect(questions[1]!.options[questions[1]!.correctIndex]).toBe("D");
  });
});

describe("Unit: toCanonicalAnswers", () => {
  it("translates a shuffled answer back to the bank's own order", () => {
    // Shuffled order is [C, A, D, B]; the candidate picked position 0, i.e. C.
    const permutations = { 1: [2, 0, 3, 1] };

    expect(toCanonicalAnswers({ 1: 0 }, permutations)).toEqual({ 1: 2 });
    expect(toCanonicalAnswers({ 1: 3 }, permutations)).toEqual({ 1: 1 });
  });

  it("passes an unshuffled question through untouched", () => {
    expect(toCanonicalAnswers({ 5: 2 }, {})).toEqual({ 5: 2 });
  });

  it("round-trips: what was recorded points at the text that was chosen", () => {
    const original = q(1, ["A", "B", "C", "D"], 3);
    const { question, permutation } = shuffleQuestionOptions(original);

    for (let chosen = 0; chosen < 4; chosen++) {
      const canonical = toCanonicalAnswers({ 1: chosen }, { 1: permutation })[1]!;
      expect(original.options[canonical]).toBe(question.options[chosen]);
    }
  });

  it("marks the same attempt correct before and after translation", () => {
    const original = q(1, ["A", "B", "C", "D"], 2);
    const { question, permutation } = shuffleQuestionOptions(original);

    const chosen = question.correctIndex;
    const canonical = toCanonicalAnswers({ 1: chosen }, { 1: permutation })[1]!;

    expect(canonical).toBe(original.correctIndex);
  });

  it("leaves an out-of-range answer alone rather than inventing one", () => {
    expect(toCanonicalAnswers({ 1: 9 }, { 1: [1, 0] })).toEqual({ 1: 9 });
  });
});
