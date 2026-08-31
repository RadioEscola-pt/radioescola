import { describe, it, expect } from "vitest";
import { buildBank } from "@/lib/content/analysis";
import { buildReviewModel, byPage, matchKey, renderReviewPage } from "@/lib/content/review-page";
import type { ContentCategory, ContentQuestion } from "@/lib/content/schema";

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
    disabled: null,
    sources: [],
    image: null,
    tutorial: null,
    calc: null,
    explanation: null,
    ...extra,
  };
}

function category(questions: ContentQuestion[]): ContentCategory {
  return { id: "3", anacomFile: 90, questions };
}

const PDF = "cat3/2026_08_30";

function bankOf(questions: ContentQuestion[]) {
  return buildBank([category(questions)]);
}

describe("buildReviewModel", () => {
  it("carries the bank's own text, not a transcription", () => {
    const bank = bankOf([
      q(70, "Qual dos seguintes componentes nunca faz parte de um recetor?", ["Desmodulador", "Modulador"], 1, {
        sources: [{ pdf: PDF, question: 27, page: 8 }],
      }),
    ]);

    const model = buildReviewModel({ pdf: PDF, bank, ocrMatched: new Set() });

    expect(model.questions).toHaveLength(1);
    expect(model.questions[0]!.stem).toBe("Qual dos seguintes componentes nunca faz parte de um recetor?");
    expect(model.questions[0]!.answers[1]).toEqual({ text: "Modulador", correct: true });
    expect(model.questions[0]!.question).toBe(27);
    expect(model.questions[0]!.page).toBe(8);
  });

  it("marks a link OCR found itself, and everything else as needing an eye", () => {
    const bank = bankOf([
      q(1, "Encontrada pelo OCR", ["a", "b"], 0, { sources: [{ pdf: PDF, question: 5, page: 2 }] }),
      q(2, "Ligada por uma pessoa", ["a", "b"], 0, { sources: [{ pdf: PDF, question: 6, page: 2 }] }),
    ]);

    const model = buildReviewModel({ pdf: PDF, bank, ocrMatched: new Set([matchKey(5, 1)]) });

    expect(model.questions.map((x) => x.verified)).toEqual(["ocr", "manual"]);
    expect(model.counts).toMatchObject({ cited: 2, ocr: 1, manual: 1 });
  });

  it("an empty OCR set corroborates nothing rather than everything", () => {
    const bank = bankOf([q(1, "Uma", ["a", "b"], 0, { sources: [{ pdf: PDF, question: 5, page: 2 }] })]);

    const model = buildReviewModel({ pdf: PDF, bank, ocrMatched: new Set() });

    expect(model.counts.ocr).toBe(0);
    expect(model.questions[0]!.verified).toBe("manual");
  });

  it("reports pergunta numbers nothing in the bank claims", () => {
    const bank = bankOf([
      q(1, "Uma", ["a", "b"], 0, { sources: [{ pdf: PDF, question: 1, page: 1 }] }),
      q(2, "Outra", ["a", "b"], 0, { sources: [{ pdf: PDF, question: 4, page: 1 }] }),
    ]);

    const model = buildReviewModel({ pdf: PDF, bank, ocrMatched: new Set() });

    expect(model.gaps).toEqual([2, 3]);
    expect(model.counts.gaps).toBe(2);
  });

  it("flags two questions claiming the same pergunta", () => {
    const bank = bankOf([
      q(1, "Uma", ["a", "b"], 0, { sources: [{ pdf: PDF, question: 5, page: 2 }] }),
      q(2, "Outra", ["a", "b"], 0, { sources: [{ pdf: PDF, question: 5, page: 2 }] }),
    ]);

    const model = buildReviewModel({ pdf: PDF, bank, ocrMatched: new Set() });

    expect(model.questions[0]!.collision).toEqual(["cat3#2"]);
    expect(model.questions[1]!.collision).toEqual(["cat3#1"]);
  });

  it("keeps a withheld question, because the paper examined it anyway", () => {
    const bank = bankOf([
      q(161, "Desativada", ["a", "b"], 0, {
        disabled: "Retirada pela revisão de conteúdo.",
        sources: [{ pdf: PDF, question: 7, page: 2 }],
      }),
    ]);

    const model = buildReviewModel({ pdf: PDF, bank, ocrMatched: new Set() });

    expect(model.questions[0]!.disabled).toBe("Retirada pela revisão de conteúdo.");
  });

  it("attaches a note by pergunta number, not by question id", () => {
    const bank = bankOf([q(70, "Uma", ["a", "b"], 0, { sources: [{ pdf: PDF, question: 27, page: 8 }] })]);

    const model = buildReviewModel({ pdf: PDF, bank, ocrMatched: new Set(), notes: { 27: "porquê esta" } });

    expect(model.questions[0]!.note).toBe("porquê esta");
  });

  it("refuses a paper nothing cites rather than rendering an empty page", () => {
    const bank = bankOf([q(1, "Uma", ["a", "b"])]);

    expect(() => buildReviewModel({ pdf: PDF, bank, ocrMatched: new Set() })).toThrow(/Nenhuma pergunta/);
  });
});

describe("byPage", () => {
  it("orders pages ascending and puts the unpaged last", () => {
    const bank = bankOf([
      q(1, "Terceira", ["a", "b"], 0, { sources: [{ pdf: PDF, question: 9, page: 3 }] }),
      q(2, "Sem página", ["a", "b"], 0, { sources: [{ pdf: PDF, question: 10, page: null }] }),
      q(3, "Primeira", ["a", "b"], 0, { sources: [{ pdf: PDF, question: 1, page: 1 }] }),
    ]);

    const groups = byPage(buildReviewModel({ pdf: PDF, bank, ocrMatched: new Set() }));

    expect(groups.map((g) => g.page)).toEqual([1, 3, null]);
  });
});

describe("renderReviewPage", () => {
  const bank = bankOf([
    q(70, "Nunca faz parte de um recetor?", ["Desmodulador", "Modulador"], 1, {
      sources: [{ pdf: PDF, question: 27, page: 8 }],
    }),
  ]);
  const model = buildReviewModel({ pdf: PDF, bank, ocrMatched: new Set() });

  it("embeds the scan it was given and names the paper", () => {
    const html = renderReviewPage(model, { images: { 8: "data:image/jpeg;base64,AAAA" }, pageCount: 12 });

    expect(html).toContain("<title>Prova cat3 · 2026-08-30</title>");
    expect(html).toContain("data:image/jpeg;base64,AAAA");
  });

  it("never lets question text close the script block", () => {
    const nasty = bankOf([
      q(1, "Uma </script><script>alert(1)</script> pergunta", ["a", "b"], 0, {
        sources: [{ pdf: PDF, question: 1, page: 1 }],
      }),
    ]);
    const html = renderReviewPage(buildReviewModel({ pdf: PDF, bank: nasty, ocrMatched: new Set() }), {
      images: {},
      pageCount: 1,
    });

    // One opening and one closing tag for the page's own script, and no other.
    expect(html.match(/<\/script>/g)).toHaveLength(1);
  });
});
