import { describe, it, expect } from "vitest";
import { weakTopics } from "@/lib/exam/weak-topics";

type Status = "correct" | "incorrect" | "unanswered";
const a = (materia: string | null, status: Status) => ({ materia, status });

describe("Unit: weakTopics", () => {
  it("counts wrong and unanswered alike, since neither is knowledge", () => {
    const [topic] = weakTopics([
      a("teoria", "correct"),
      a("teoria", "incorrect"),
      a("teoria", "unanswered"),
    ]);

    expect(topic).toMatchObject({ slug: "teoria", total: 3, missed: 2 });
    expect(topic?.accuracy).toBeCloseTo(1 / 3);
  });

  it("leaves out a topic answered perfectly", () => {
    const topics = weakTopics([
      a("teoria", "correct"),
      a("antenas", "incorrect"),
    ]);

    expect(topics.map((t) => t.slug)).toEqual(["antenas"]);
  });

  it("returns nothing at all for a flawless attempt", () => {
    expect(weakTopics([a("teoria", "correct"), a("antenas", "correct")])).toEqual([]);
  });

  it("ranks by how many were missed, not by the rate", () => {
    const topics = weakTopics([
      // one out of one wrong: a perfect failure rate, but a small hole
      a("antenas", "incorrect"),
      // four out of ten wrong: a better rate, but the bigger problem
      ...Array.from({ length: 4 }, () => a("teoria", "incorrect")),
      ...Array.from({ length: 6 }, () => a("teoria", "correct")),
    ]);

    expect(topics.map((t) => t.slug)).toEqual(["teoria", "antenas"]);
  });

  it("breaks a tie on misses with the worse rate", () => {
    const topics = weakTopics([
      a("antenas", "incorrect"),
      a("antenas", "correct"),
      a("antenas", "correct"),
      a("teoria", "incorrect"),
      a("teoria", "correct"),
    ]);

    // Both missed one; teoria got half right, antenas two thirds.
    expect(topics.map((t) => t.slug)).toEqual(["teoria", "antenas"]);
  });

  it("ignores questions with no topic rather than inventing one", () => {
    const topics = weakTopics([a(null, "incorrect"), a("teoria", "incorrect")]);

    expect(topics.map((t) => t.slug)).toEqual(["teoria"]);
  });

  it("caps the list so the advice stays actionable", () => {
    const topics = weakTopics(
      ["a", "b", "c", "d", "e", "f"].map((slug) => a(slug, "incorrect")),
      3
    );

    expect(topics).toHaveLength(3);
  });

  it("handles an empty attempt", () => {
    expect(weakTopics([])).toEqual([]);
  });
});
