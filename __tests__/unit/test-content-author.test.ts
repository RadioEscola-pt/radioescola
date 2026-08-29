/**
 * Authoring rules: what `content:new` refuses to write, and why
 *
 * The interesting half of the tool is the review, and it is pure — the
 * filesystem arrives as two predicates — so everything here runs without a
 * fixture tree.
 *
 * The cases worth pinning down are the ones no other check in the pipeline
 * covers: a topic slug that fails silently, a question that contradicts one
 * already in another category, and the two unrelated numbers in a source
 * reference.
 */
import { describe, it, expect } from "vitest";
import {
  reviewDraft,
  diffQuestions,
  isWithheldReason,
  insertIntoOrder,
  nextId,
  hasErrors,
  type Draft,
  type ReviewContext,
} from "@/lib/content/author";
import { buildBank } from "@/lib/content/analysis";
import type { ContentCategory } from "@/lib/content/schema";

const UIT: ContentCategory = {
  id: "2",
  anacomFile: 91,
  questions: [
    {
      id: 255,
      question: "O Regulamento das Radiocomunicações é uma publicação",
      answers: [
        { text: "da IARU", correct: false },
        { text: "da CEPT", correct: false },
        { text: "da UIT", correct: true },
        { text: "da NATO", correct: false },
      ],
      topic: "regulamentacao",
      sources: [],
      image: null,
      tutorial: null,
      calc: null,
      explanation: null,
    },
  ],
};

const BANK = buildBank([UIT]);

function context(overrides: Partial<ReviewContext> = {}): ReviewContext {
  return {
    category: "3",
    anacomFile: 90,
    bank: BANK,
    order: [1, 4, 5, 213],
    pdfLookup: () => ({ exists: true, alsoIn: [] }),
    imageExists: () => true,
    ...overrides,
  };
}

function draft(overrides: Partial<Draft> = {}): Draft {
  return {
    category: "3",
    question: "Num condensador de placas paralelas, aumentar a distância entre as placas",
    answers: [
      { text: "aumenta a capacidade" },
      { text: "diminui a capacidade", correct: true },
      { text: "não altera a capacidade" },
      { text: "aumenta a tensão de rutura" },
    ],
    topic: "componentes",
    sources: [{ pdf: "cat3/2023_08_18", question: 29, page: 9 }],
    explanation: "A capacidade é inversamente proporcional à distância entre as placas.",
    ...overrides,
  };
}

const codes = (findings: readonly { code: string }[]) => findings.map((f) => f.code);

describe("nextId", () => {
  it("is the maximum plus one, never a gap below it", () => {
    // cat1 has a free id at 352 and the next question still got 390: recycling
    // a retired id would silently repoint every stale link to it.
    expect(nextId([1, 2, 5, 390])).toBe(391);
    expect(nextId([])).toBe(1);
  });
});

describe("insertIntoOrder", () => {
  const order = [1, 4, 5, 213];

  it("places a question relative to an anchor", () => {
    expect(insertIntoOrder(order, 214, { kind: "after", id: 4 })).toEqual([1, 4, 214, 5, 213]);
    expect(insertIntoOrder(order, 214, { kind: "before", id: 4 })).toEqual([1, 214, 4, 5, 213]);
    expect(insertIntoOrder(order, 214, { kind: "end" })).toEqual([1, 4, 5, 213, 214]);
  });

  it("leaves the original untouched", () => {
    insertIntoOrder(order, 214, { kind: "end" });
    expect(order).toEqual([1, 4, 5, 213]);
  });

  it("refuses an anchor that is not in the order, and a duplicate id", () => {
    expect(() => insertIntoOrder(order, 214, { kind: "after", id: 999 })).toThrow(/999/);
    expect(() => insertIntoOrder(order, 5, { kind: "end" })).toThrow(/already/);
  });
});

describe("reviewDraft", () => {
  it("passes a clean draft", () => {
    const review = reviewDraft(draft(), context());
    expect(review.findings).toEqual([]);
    expect(review.question?.id).toBe(214);
    // The 1-indexed correctIndex is gone: the answer carries its own flag.
    expect(review.question?.answers[1]?.correct).toBe(true);
  });

  it("rejects a topic slug that is not in the taxonomy", () => {
    // The whole point of the tool: the schema takes `topic` as free text, so a
    // typo compiles, ships, and shows an unlabelled card forever.
    const review = reviewDraft(draft({ topic: "regulamentaçao" }), context());
    expect(codes(review.findings)).toContain("topic-unknown");
    expect(hasErrors(review.findings)).toBe(true);
  });

  it("warns, but does not fail, on an untagged question", () => {
    const review = reviewDraft(draft({ topic: null }), context());
    expect(codes(review.findings)).toEqual(["topic-missing"]);
    expect(hasErrors(review.findings)).toBe(false);
  });

  it("flags a topic the annex examines above this category, advisory only", () => {
    const review = reviewDraft(draft({ topic: "antenas" }), context({ category: "3" }));
    expect(codes(review.findings)).toContain("topic-above-level");
    expect(hasErrors(review.findings)).toBe(false);
  });

  it("reports schema failures by field instead of throwing", () => {
    const review = reviewDraft(
      draft({ answers: [{ text: "uma" }, { text: "duas", correct: true }, { text: "três", correct: true }] }),
      context()
    );
    expect(review.question).toBeNull();
    expect(codes(review.findings)).toEqual(["schema"]);
    expect(review.findings[0]?.message).toMatch(/exactly one correct answer/);
  });

  it("refuses an id already in the order and names the free one", () => {
    const review = reviewDraft(draft({ id: 5 }), context());
    const finding = review.findings.find((f) => f.code === "id-taken");
    expect(finding?.detail?.[0]).toMatch(/214/);
  });

  it("refuses a source pointing at a paper that is not on disk", () => {
    const review = reviewDraft(
      draft(),
      context({ pdfLookup: () => ({ exists: false, alsoIn: ["cat2"] }) })
    );
    const finding = review.findings.find((f) => f.code === "pdf-missing");
    expect(finding?.level).toBe("error");
    expect(finding?.detail?.[0]).toMatch(/cat2/);
  });

  it("warns when the PDF page equals the pergunta number", () => {
    // Unrelated numbers — the papers carry about four questions per page — so
    // equality is nearly always the same number typed into both fields.
    const review = reviewDraft(
      draft({ sources: [{ pdf: "cat3/2023_08_18", question: 29, page: 29 }] }),
      context()
    );
    expect(codes(review.findings)).toEqual(["page-equals-question"]);
  });

  it("accepts a source with no page yet", () => {
    const review = reviewDraft(
      draft({ sources: [{ pdf: "cat3/2023_08_18", question: 29 }] }),
      context()
    );
    expect(review.findings).toEqual([]);
    expect(review.question?.sources[0]?.page).toBeNull();
  });

  it("refuses an image, in the frontmatter or the body, that is not in public/", () => {
    const missing = context({ imageExists: () => false });
    expect(codes(reviewDraft(draft({ image: "images/cat3/x.png" }), missing).findings)).toContain(
      "image-missing"
    );
    expect(
      codes(
        reviewDraft(draft({ explanation: '<img src="/images/cat3/y.png" />' }), missing).findings
      )
    ).toContain("image-missing");
  });

  it("refuses two options with the same text", () => {
    const review = reviewDraft(
      draft({
        answers: [
          { text: "10 dB" },
          { text: "10 dB" },
          { text: "20 dB", correct: true },
          { text: "30 dB" },
        ],
      }),
      context()
    );
    expect(codes(review.findings)).toContain("option-duplicate");
  });

  it("refuses a question that contradicts one already in the bank", () => {
    // Same stem, same options, a different correct answer. Both files are
    // individually valid, so nothing else in the pipeline can see this.
    const review = reviewDraft(
      draft({
        question: "O Regulamento das Radiocomunicações é uma publicação",
        answers: [
          { text: "da IARU" },
          { text: "da CEPT", correct: true },
          { text: "da UIT" },
          { text: "da NATO" },
        ],
        topic: "regulamentacao",
      }),
      context()
    );
    const finding = review.findings.find((f) => f.code === "duplicate-contradiction");
    expect(finding?.level).toBe("error");
    expect(finding?.message).toMatch(/cat2#255/);
    expect(review.duplicates[0]?.tier).toBe("contradiction");
  });

  it("only warns on the same question examined at another level", () => {
    // 27 groups in the bank are this: the same regulatory question asked at
    // all three levels, which is legitimate and must stay writable.
    const review = reviewDraft(
      draft({
        question: "O Regulamento das Radiocomunicações é uma publicação",
        answers: [
          { text: "da IARU" },
          { text: "da CEPT" },
          { text: "da UIT", correct: true },
          { text: "da NATO" },
        ],
        topic: "regulamentacao",
      }),
      context()
    );
    expect(hasErrors(review.findings)).toBe(false);
    expect(codes(review.findings)).toContain("duplicate-exact");
  });

  it("warns about an explanation-less question without blocking it", () => {
    const review = reviewDraft(draft({ explanation: null }), context());
    expect(codes(review.findings)).toEqual(["explanation-missing"]);
  });
});

describe("reviewDraft when editing", () => {
  // The bank fixture holds cat2#255. Editing it must not report it as a
  // duplicate of itself, and its id being in `order` is what makes it an edit.
  const editing = (overrides: Partial<Draft> = {}) =>
    reviewDraft(
      draft({
        category: "2",
        id: 255,
        question: "O Regulamento das Radiocomunicações é uma publicação",
        answers: [
          { text: "da IARU" },
          { text: "da CEPT" },
          { text: "da UIT", correct: true },
          { text: "da NATO" },
        ],
        topic: "regulamentacao",
        ...overrides,
      }),
      context({ category: "2", order: [255], editing: 255 })
    );

  it("does not report the question as a duplicate of itself", () => {
    expect(codes(editing().findings)).not.toContain("duplicate-exact");
    expect(editing().duplicates).toEqual([]);
  });

  it("does not report the id as taken", () => {
    expect(codes(editing().findings)).not.toContain("id-taken");
  });

  it("still reports a real problem in the edited question", () => {
    const review = editing({ topic: "matéria-inventada" });
    expect(codes(review.findings)).toContain("topic-unknown");
  });

  it("still reports the id as taken when an edit changes it onto another", () => {
    const review = reviewDraft(
      draft({ category: "2", id: 255 }),
      context({ category: "2", order: [255, 300], editing: 300 })
    );
    expect(codes(review.findings)).toContain("id-taken");
  });
});

describe("diffQuestions", () => {
  const base = {
    id: 1,
    question: "Enunciado",
    answers: [
      { text: "a", correct: true },
      { text: "b", correct: false },
    ],
    topic: "regulamentacao",
    disabled: null,
    sources: [],
    image: null,
    tutorial: null,
    calc: null,
    explanation: null,
  };

  it("reports nothing when nothing changed", () => {
    expect(diffQuestions(base, { ...base })).toEqual([]);
  });

  it("names the option that changed, not all of them", () => {
    const changes = diffQuestions(base, {
      ...base,
      answers: [
        { text: "a", correct: true },
        { text: "B corrigido", correct: false },
      ],
    });
    expect(changes).toHaveLength(1);
    expect(changes[0]).toMatchObject({ label: "opção 2", before: "b", after: "B corrigido" });
  });

  it("marks a changed correct answer as critical", () => {
    const changes = diffQuestions(base, {
      ...base,
      answers: [
        { text: "a", correct: false },
        { text: "b", correct: true },
      ],
    });
    const correct = changes.find((c) => c.label === "resposta certa");
    expect(correct?.critical).toBe(true);
    expect(correct?.before).toBe("opção 1 — a");
    expect(correct?.after).toBe("opção 2 — b");
  });

  it("marks withholding as critical", () => {
    const [change] = diffQuestions(base, { ...base, disabled: "retirada" });
    expect(change).toMatchObject({ label: "desativada", after: "retirada", critical: true });
  });

  it("summarises an explanation rather than printing it", () => {
    const [change] = diffQuestions(base, { ...base, explanation: "doze caracte" });
    expect(change).toMatchObject({ label: "explicação", before: "—", after: "12 caracteres" });
  });

  it("says so when a rewrite keeps the same length", () => {
    // "412 caracteres → 412 caracteres" would look like nothing happened.
    const [change] = diffQuestions(
      { ...base, explanation: "aaaa" },
      { ...base, explanation: "bbbb" }
    );
    expect(change?.after).toBe("4 caracteres (texto alterado)");
  });
});

describe("isWithheldReason", () => {
  it("rejects a blank reason, which the schema would read as published", () => {
    expect(isWithheldReason("")).toBe(false);
    expect(isWithheldReason("   ")).toBe(false);
    expect(isWithheldReason("retirada pela ANACOM")).toBe(true);
  });
});
