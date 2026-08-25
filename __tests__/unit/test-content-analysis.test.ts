import { describe, it, expect } from "vitest";
import {
  canonical,
  comparisonKey,
  polarityOf,
  stripPolarity,
  worstPairedDistance,
  buildBank,
  findDuplicateGroups,
  findPairFindings,
  auditAnswers,
  auditPapers,
  auditTopics,
  parseRef,
  type DuplicateTier,
} from "@/lib/content/analysis";
import type { ContentCategory, ContentQuestion } from "@/lib/content/schema";

/** A question with everything optional defaulted, so a test states only what it means. */
function q(
  id: number,
  question: string,
  options: string[],
  correctIndex = 0,
  extra: Partial<ContentQuestion> = {}
): ContentQuestion {
  return {
    id,
    question,
    answers: options.map((text, i) => ({ text, correct: i === correctIndex })),
    topic: null,
    sources: [],
    image: null,
    tutorial: null,
    calc: null,
    explanation: null,
    ...extra,
  };
}

function category(id: "1" | "2" | "3", questions: ContentQuestion[]): ContentCategory {
  return { id, anacomFile: 90, questions };
}

const tiersOf = (groups: { tier: DuplicateTier }[]) => groups.map((g) => g.tier);

describe("Unit: text normalisation", () => {
  it("folds accents, case and punctuation", () => {
    expect(canonical("Discordância à ANACOM, propondo")).toBe("discordancia a anacom propondo");
    expect(canonical("ELÉCTRICO")).toBe("electrico");
  });

  it("leaves the 1990 orthography split visible rather than folding it away", () => {
    // Folding drops the accent, not the silent consonant, so "directa" and
    // "direta" stay distinct. That is what surfaces a spelling inconsistency
    // as a typo-tier group instead of silently treating the two as the same.
    expect(canonical("directa")).not.toBe(canonical("direta"));
  });

  it("keeps Morse options distinct instead of collapsing them to nothing", () => {
    // Every dot-and-dash option canonicalises to "", so without the raw
    // fallback cat3 #109's four answers would compare equal to each other.
    expect(canonical(". . . - - - . . .")).toBe("");
    expect(comparisonKey(". . . - - - . . .")).not.toBe(comparisonKey("- - - . . . - - -"));
  });
});

describe("Unit: polarity", () => {
  it("reads the sense of a stem", () => {
    expect(polarityOf("Qual das seguintes afirmações é incorreta?")).toBe("negative");
    expect(polarityOf("Qual das seguintes afirmações está correta?")).toBe("positive");
    expect(polarityOf("Uma antena isotrópica radia")).toBe("positive");
    // "não" folds to "nao"; the pre-1990 "excepto" is still in the bank.
    expect(polarityOf("Qual destas NÃO é uma banda de amador?")).toBe("negative");
    expect(polarityOf("Todas são válidas excepto")).toBe("negative");
  });

  it("aligns a flipped pair by removing the words that invert it", () => {
    expect(stripPolarity("Qual das afirmações é incorreta")).toEqual(
      stripPolarity("Qual das afirmações é correta")
    );
  });
});

describe("Unit: worstPairedDistance", () => {
  it("is zero for the same options in a different order", () => {
    expect(worstPairedDistance(["alfa", "bravo"], ["bravo", "alfa"])).toBe(0);
  });

  it("stays small for a misspelling and large for a different answer", () => {
    const typo = worstPairedDistance(["ferro pulverizado"], ["fero pulverizado"]);
    const different = worstPairedDistance(["ferro pulverizado"], ["ferrite de niquel"]);
    expect(typo).toBeLessThan(0.12);
    expect(different).toBeGreaterThan(0.12);
  });

  it("refuses to pair option lists of different lengths", () => {
    expect(worstPairedDistance(["a"], ["a", "b"])).toBeNull();
  });
});

describe("Unit: duplicate tiers", () => {
  it("calls the same question with the same answers exact", () => {
    const bank = buildBank([
      category("3", [q(1, "Quantas categorias de amadores existem?", ["Três", "Duas"])]),
      category("2", [q(9, "Quantas categorias de amadores existem?", ["Três", "Duas"])]),
    ]);
    const groups = findDuplicateGroups(bank);
    expect(tiersOf(groups)).toEqual(["exact"]);
    expect(groups[0]?.crossCategory).toBe(true);
  });

  it("flags a disagreement about which option is right as a contradiction", () => {
    // Nothing else in the pipeline catches this: each file is valid on its own.
    const bank = buildBank([
      category("3", [
        q(1, "Quantas categorias de amadores existem?", ["Três", "Duas"], 0),
        q(2, "Quantas categorias de amadores existem?", ["Três", "Duas"], 1),
      ]),
    ]);
    expect(tiersOf(findDuplicateGroups(bank))).toEqual(["contradiction"]);
  });

  it("separates a misspelling from a genuinely different option set", () => {
    const bank = buildBank([
      category("1", [
        q(36, "Que toróides usar?", ["Os toróides de ferro pulverizado", "Os de ferrite"]),
        q(343, "Que toróides usar?", ["Os toróides de fero pulverizado", "Os de ferrite"]),
      ]),
      category("2", [
        q(7, "Que toróides usar?", ["Uma resposta completamente diferente", "E outra ainda"]),
      ]),
    ]);
    const groups = findDuplicateGroups(bank);
    expect(groups).toHaveLength(1);
    expect(groups[0]?.tier).toBe("divergent");

    const justTheTypo = buildBank([
      category("1", [
        q(36, "Que toróides usar?", ["Os toróides de ferro pulverizado", "Os de ferrite"]),
        q(343, "Que toróides usar?", ["Os toróides de fero pulverizado", "Os de ferrite"]),
      ]),
    ]);
    expect(tiersOf(findDuplicateGroups(justTheTypo))).toEqual(["typo"]);
  });

  it("reports an identical option set under different stems once", () => {
    const bank = buildBank([
      category("3", [
        q(1, "O que é correto fazer?", ["Respeitar", "Ignorar"]),
        q(2, "Qual a atitude certa?", ["Respeitar", "Ignorar"]),
      ]),
    ]);
    const groups = findDuplicateGroups(bank);
    expect(tiersOf(groups)).toEqual(["shared-answers"]);
  });

  it("names the fields a group disagrees on", () => {
    const bank = buildBank([
      category("3", [q(1, "Quantas categorias?", ["Três", "Duas"], 0, { topic: "operacao" })]),
      category("2", [
        q(9, "Quantas categorias?", ["Três", "Duas"], 0, {
          topic: "regulamentacao",
          explanation: "São três.",
        }),
      ]),
    ]);
    const kinds = findDuplicateGroups(bank)[0]?.issues.map((i) => i.kind);
    expect(kinds).toContain("topic");
    expect(kinds).toContain("explanation");
  });

  it("calls a punctuation-only difference cosmetic rather than a typo", () => {
    const bank = buildBank([
      category("3", [
        q(1, "O que fazer?", ["Apresentar a discordância, propondo alterações", "Ignorar"]),
        q(2, "O que fazer?", ["Apresentar a discordância propondo alterações", "Ignorar"]),
      ]),
    ]);
    const group = findDuplicateGroups(bank)[0];
    expect(group?.tier).toBe("exact");
    expect(group?.issues.map((i) => i.kind)).toContain("cosmetic");
  });
});

describe("Unit: fuzzy pairs", () => {
  const shared = ["A ionosfera reflete", "A troposfera absorve", "O solo difrata", "Nada acontece"];

  it("catches a polarity flip when the two questions are otherwise the same", () => {
    const bank = buildBank([
      category("3", [
        q(1, "Qual das seguintes afirmações sobre propagação ionosférica é correta?", shared),
        q(2, "Qual das seguintes afirmações sobre propagação ionosférica é incorreta?", shared, 1),
      ]),
    ]);
    const findings = findPairFindings(bank);
    expect(findings.map((f) => f.kind)).toContain("polarity");
  });

  it("does not pair two questions that merely share a template stem", () => {
    // The noise control that makes the report readable: same sentence pattern,
    // unrelated subject matter, so there is nothing here for a human to act on.
    const bank = buildBank([
      category("3", [
        q(1, "Qual das seguintes afirmações é incorreta?", [
          "O amador deve respeitar o plano de bandas",
          "O amador deve identificar-se",
        ]),
        q(2, "Qual das seguintes afirmações está correta?", [
          "Um condensador armazena carga",
          "Uma bobina dissipa potência",
        ]),
      ]),
    ]);
    expect(findPairFindings(bank)).toEqual([]);
  });
});

describe("Unit: answer audit", () => {
  it("treats a sign or a unit prefix as a real difference between options", () => {
    // "10 dB" and "-10 dB" canonicalise identically; reporting them as the same
    // option would bury the two questions where the text really is repeated.
    const bank = buildBank([
      category("2", [
        q(387, "Qual a atenuação?", ["8 dB", "10 dB", "-10 dB", "-200 dB"], 1),
        q(103, "Qual a equivalência?", ["0,01 F", "0,01 mF", "0,01 µF", "0,01 nF"], 2),
      ]),
    ]);
    expect(auditAnswers(bank).duplicateOptions).toEqual([]);
  });

  it("reports an option that is genuinely written twice", () => {
    const bank = buildBank([
      category("3", [q(68, "Referência para", ["o cálculo da p.a.r.", "o cálculo da p.a.r."])]),
    ]);
    expect(auditAnswers(bank).duplicateOptions.map((d) => d.ref)).toEqual(["cat3#68"]);
  });

  it("counts where the correct answer sits", () => {
    const bank = buildBank([
      category("3", [q(1, "a", ["x", "y"], 0), q(2, "b", ["x", "y"], 1), q(3, "c", ["x", "y"], 1)]),
    ]);
    expect(auditAnswers(bank).correctIndexCounts).toEqual([1, 2]);
  });

  it("flags a catch-all option that is not last", () => {
    const bank = buildBank([
      category("3", [q(1, "Qual?", ["Todas as anteriores", "Uma", "Duas", "Três"])]),
    ]);
    expect(auditAnswers(bank).misplacedCatchAll.map((m) => m.ref)).toEqual(["cat3#1"]);
  });
});

describe("Unit: paper audit", () => {
  it("finds unclaimed perguntas and two questions claiming the same one", () => {
    const source = (pdf: string, question: number, page: number | null = null) => ({
      sources: [{ pdf, question, page }],
    });
    const bank = buildBank([
      category("3", [
        q(1, "uma", ["a", "b"], 0, source("cat3/2023_08_18", 1, 1)),
        q(2, "outra", ["a", "b"], 0, source("cat3/2023_08_18", 3)),
        q(3, "terceira", ["a", "b"], 0, source("cat3/2023_08_18", 3)),
      ]),
    ]);
    const paper = auditPapers(bank)[0];
    expect(paper?.gaps).toEqual([2]);
    expect(paper?.collisions).toEqual([{ question: 3, refs: ["cat3#2", "cat3#3"] }]);
  });
});

describe("Unit: topic audit", () => {
  it("separates an untagged question from one tagged with a slug that does not exist", () => {
    const bank = buildBank([
      category("3", [
        q(1, "uma", ["a", "b"], 0, { topic: "antenas" }),
        q(2, "outra", ["a", "b"], 0, { topic: "ohm" }),
        q(3, "terceira", ["a", "b"]),
      ]),
    ]);
    const audit = auditTopics(bank);
    expect(audit.invalid.map((x) => x.ref)).toEqual(["cat3#2"]);
    expect(audit.untagged.map((x) => x.ref)).toEqual(["cat3#3"]);
    // Antennas start at category 2 in Anexo 1, so a cat 3 question is advisory.
    expect(audit.aboveEntryLevel.map((x) => x.ref)).toEqual(["cat3#1"]);
  });
});

describe("Unit: parseRef", () => {
  it("accepts the forms a developer actually types", () => {
    expect(parseRef("cat3#12")).toEqual({ category: "3", id: 12 });
    expect(parseRef("3#12")).toEqual({ category: "3", id: 12 });
    expect(parseRef("cat1/284")).toEqual({ category: "1", id: 284 });
    expect(parseRef("nonsense")).toBeNull();
    expect(parseRef("cat4#1")).toBeNull();
  });
});
