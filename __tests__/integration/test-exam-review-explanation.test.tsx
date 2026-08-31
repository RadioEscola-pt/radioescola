import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { ExamResults } from "@/components/ExamResults";

/**
 * The exam review is the last thing a candidate sees, and it is where they
 * find out *why* they got something wrong. These cover the wiring that makes
 * that possible: the bank id reaching the panel, and the fetch happening only
 * for the question actually being read.
 */

const answers = [
  {
    index: 0,
    questionId: 109,
    question: "Qual a sequência de símbolos usados em telegrafia para sinal de perigo?",
    options: ["...---...", "---...---"],
    selectedIndex: 1,
    correctIndex: 0,
    status: "incorrect" as const,
    hasNotesMdx: true,
    notes: null,
  },
  {
    index: 1,
    questionId: 163,
    question: "Qual a expressão usada em fonia para sinal de perigo?",
    options: ["HELP", "MAYDAY"],
    selectedIndex: 1,
    correctIndex: 1,
    status: "correct" as const,
    hasNotesMdx: true,
    notes: null,
  },
];

function renderResults() {
  return render(
    <ExamResults
      category="3"
      score={1}
      totalQuestions={2}
      timeLeft={600}
      reviewAnswers={answers}
      onStartNew={() => {}}
    />
  );
}

describe("Integration: explanations in the exam review", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn().mockImplementation((url: string) => Promise.resolve({
      ok: true,
      status: 200,
      json: async () => ({ html: `<p>Explicação de ${url}</p>` }),
    }));
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches nothing until a question is opened", () => {
    renderResults();

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("shows the explanation for the question being reviewed", async () => {
    renderResults();

    fireEvent.click(screen.getByText(/telegrafia para sinal de perigo/));

    await waitFor(() =>
      expect(screen.getByText("Explicação de /api/notes/3/109")).toBeInTheDocument()
    );
  });

  it("asks for the note of the opened question only", async () => {
    renderResults();

    fireEvent.click(screen.getByText(/telegrafia para sinal de perigo/));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(fetchMock).toHaveBeenCalledWith("/api/notes/3/109");
    expect(fetchMock).not.toHaveBeenCalledWith("/api/notes/3/163");
  });

  it("explains a correct answer too, not only a mistake", async () => {
    renderResults();

    fireEvent.click(screen.getByText(/fonia para sinal de perigo/));

    await waitFor(() =>
      expect(screen.getByText("Explicação de /api/notes/3/163")).toBeInTheDocument()
    );
  });
});
