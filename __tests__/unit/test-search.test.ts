import { describe, it, expect } from "vitest";
import { fold, findMatch, questionMatches } from "@/lib/utils/search";

describe("Unit: search folding", () => {
  it("folds diacritics and case", () => {
    expect(fold("Propagação")).toBe("propagacao");
    expect(fold("ELÉCTRICO")).toBe("electrico");
  });

  it("matches across the 1990 orthography split", () => {
    // The bank mixes "eléctrico" and "elétrico"; neither spelling should be a
    // dead end for someone typing the other.
    const q = { question: "O circuito eléctrico", options: ["nenhuma"] };
    expect(questionMatches(q, "electrico")).toBe(true);
    expect(questionMatches(q, "eléctrico")).toBe(true);
  });

  it("matches on the options, not just the stem", () => {
    // Searching cat 3 for "antena" finds 13 questions, and eight carry the word
    // only in an option.
    const q = {
      question: "A potência aparente radiada é função",
      options: ["do ganho da antena", "da corrente"],
    };
    expect(questionMatches(q, "antena")).toBe(true);
  });

  it("treats an empty term as matching everything", () => {
    const q = { question: "qualquer", options: ["a"] };
    expect(questionMatches(q, "")).toBe(true);
    expect(questionMatches(q, "   ")).toBe(true);
  });

  it("does not match an absent term", () => {
    expect(questionMatches({ question: "abc", options: ["def"] }, "xyz")).toBe(false);
  });
});

describe("Unit: findMatch", () => {
  it("returns offsets into the original string, not the folded one", () => {
    // "ã" folds to one character but occupies one slot; the accented word must
    // still be sliced out intact.
    const text = "A reflexão ionosférica";
    const range = findMatch(text, "reflexao");
    expect(range).not.toBeNull();
    expect(text.slice(range!.start, range!.end)).toBe("reflexão");
  });

  it("maps correctly when accents precede the match", () => {
    const text = "Ação: propagação troposférica";
    const range = findMatch(text, "propagacao");
    expect(text.slice(range!.start, range!.end)).toBe("propagação");
  });

  it("returns null for an empty or unmatched term", () => {
    expect(findMatch("abc", "")).toBeNull();
    expect(findMatch("abc", "  ")).toBeNull();
    expect(findMatch("abc", "z")).toBeNull();
  });
});

import { topicCounts } from "@/components/QuestionFilters";

describe("Unit: topicCounts", () => {
  const bank = [
    { materia: "propagacao" }, { materia: "propagacao" }, { materia: "propagacao" },
    { materia: "seguranca" },
    { materia: "antenas" }, { materia: "antenas" },
    { materia: null },
    {},
  ];

  it("orders by count, descending", () => {
    expect(topicCounts(bank, "pt").map((t) => t.slug)).toEqual([
      "propagacao", "antenas", "seguranca",
    ]);
  });

  it("drops topics with nothing in them", () => {
    // cat 1 has a single safety question and no receivers-heavy tail; an empty
    // chip is an invitation to a blank screen.
    const slugs = topicCounts(bank, "pt").map((t) => t.slug);
    expect(slugs).not.toContain("circuitos");
    expect(slugs).toHaveLength(3);
  });

  it("ignores questions with no topic", () => {
    const total = topicCounts(bank, "pt").reduce((n, t) => n + t.count, 0);
    expect(total).toBe(6);
  });

  it("labels in the reader's locale", () => {
    expect(topicCounts([{ materia: "medidas" }], "pt")[0]?.label).toBe("Medições");
    expect(topicCounts([{ materia: "medidas" }], "en")[0]?.label).toBe("Measurements");
  });
});
