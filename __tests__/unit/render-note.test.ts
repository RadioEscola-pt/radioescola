import { describe, expect, it } from "vitest";
import { renderNoteToHtml } from "@/lib/content/render-note";

describe("renderNoteToHtml", () => {
  it("renders inline maths as KaTeX rather than literal dollar signs", async () => {
    const html = await renderNoteToHtml("A reactância é $X_C$ em ohms.");

    expect(html).toContain("katex");
    expect(html).not.toContain("$X_C$");
  });

  it("renders display maths", async () => {
    const html = await renderNoteToHtml(
      "$$\nX_C = \\frac{1}{2\\pi f C}\n$$"
    );

    expect(html).toContain("katex-display");
    // The fraction survives as MathML, which is what screen readers announce.
    expect(html).toContain("<mfrac");
  });

  it("still renders GFM tables", async () => {
    const html = await renderNoteToHtml(
      "| Frequência | $X_C$ |\n| --- | --- |\n| 1 kHz | 1,6 kΩ |"
    );

    expect(html).toContain("<table");
    expect(html).toContain("katex");
  });

  it("leaves ordinary prose and emphasis alone", async () => {
    const html = await renderNoteToHtml("Um **condensador** simples.");

    expect(html).toContain("<strong>condensador</strong>");
  });
});
