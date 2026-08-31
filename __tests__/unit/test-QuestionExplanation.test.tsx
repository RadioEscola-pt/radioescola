import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QuestionExplanation } from "@/components/QuestionExplanation";

function mockFetchOnce(body: unknown, ok = true) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 404,
    json: async () => body,
  });
  global.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

describe("Unit: QuestionExplanation", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches the note for the question and renders it", async () => {
    const fetchMock = mockFetchOnce({ html: "<p>Porque sim.</p>" });

    render(<QuestionExplanation categoryId="3" questionId={109} hasNotesMdx />);

    await waitFor(() => expect(screen.getByText("Porque sim.")).toBeInTheDocument());
    expect(fetchMock).toHaveBeenCalledWith("/api/notes/3/109");
  });

  it("does not fetch when the question has no note file", () => {
    const fetchMock = mockFetchOnce({ html: "<p>nunca</p>" });

    render(<QuestionExplanation categoryId="3" questionId={109} hasNotesMdx={false} />);

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not fetch without a category, since the note cannot be addressed", () => {
    const fetchMock = mockFetchOnce({ html: "<p>nunca</p>" });

    render(<QuestionExplanation categoryId={undefined} questionId={109} hasNotesMdx />);

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("renders nothing at all when there is no explanation to show", () => {
    mockFetchOnce({ html: "" });

    const { container } = render(
      <QuestionExplanation categoryId="3" questionId={109} hasNotesMdx={false} inlineNotes={null} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("falls back to the inline explanation when there is no note file", () => {
    mockFetchOnce({ html: "" });

    render(
      <QuestionExplanation
        categoryId="3"
        questionId={109}
        hasNotesMdx={false}
        inlineNotes="<p>Explicação embutida.</p>"
      />
    );

    expect(screen.getByText("Explicação embutida.")).toBeInTheDocument();
  });

  it("prefers the fetched note over the inline one", async () => {
    mockFetchOnce({ html: "<p>Do ficheiro.</p>" });

    render(
      <QuestionExplanation
        categoryId="3"
        questionId={109}
        hasNotesMdx
        inlineNotes="<p>Embutida.</p>"
      />
    );

    await waitFor(() => expect(screen.getByText("Do ficheiro.")).toBeInTheDocument());
    expect(screen.queryByText("Embutida.")).not.toBeInTheDocument();
  });

  it("reports a failed fetch instead of showing an empty explanation", async () => {
    mockFetchOnce({}, false);

    render(<QuestionExplanation categoryId="3" questionId={109} hasNotesMdx />);

    await waitFor(() => expect(screen.getByText("notesError")).toBeInTheDocument());
  });

  it("strips scripts out of the note before rendering it", async () => {
    mockFetchOnce({ html: '<p>Seguro.</p><script>window.__x = 1;</script>' });

    const { container } = render(<QuestionExplanation categoryId="3" questionId={109} hasNotesMdx />);

    await waitFor(() => expect(screen.getByText("Seguro.")).toBeInTheDocument());
    expect(container.querySelector("script")).toBeNull();
  });

  it("shows the heading it is given, and only alongside content", async () => {
    mockFetchOnce({ html: "<p>Corpo.</p>" });

    render(
      <QuestionExplanation
        categoryId="3"
        questionId={109}
        hasNotesMdx
        heading={<p>Explicação</p>}
      />
    );

    await waitFor(() => expect(screen.getByText("Explicação")).toBeInTheDocument());
  });
});
