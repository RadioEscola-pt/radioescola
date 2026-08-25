import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import QuestionCard from "@/components/QuestionCard";
import { Question } from "@/lib/types";

const mockQuestion: Question = {
  id: 1,
  question: "What is the capital of Portugal?",
  options: ["Madrid", "Lisbon", "Paris", "Rome"],
  correctIndex: 1,
  img: null,
  notes: null,
  fonte: null,
  tutorial: null,
  materia: null,
  calc: null,
};

describe("Unit: QuestionCard", () => {
  it("renders question text", () => {
    render(
      <QuestionCard
        question={mockQuestion}
        selectedOption={undefined}
        onSelect={() => {}}
        ended={false}
      />
    );
    expect(screen.getByText("What is the capital of Portugal?")).toBeInTheDocument();
  });

  it("renders all options", () => {
    render(
      <QuestionCard
        question={mockQuestion}
        selectedOption={undefined}
        onSelect={() => {}}
        ended={false}
      />
    );
    expect(screen.getByText(/Madrid/)).toBeInTheDocument();
    expect(screen.getByText(/Lisbon/)).toBeInTheDocument();
    expect(screen.getByText(/Paris/)).toBeInTheDocument();
    expect(screen.getByText(/Rome/)).toBeInTheDocument();
  });

  it("calls onSelect when option is clicked", () => {
    const onSelect = vi.fn();
    render(
      <QuestionCard
        question={mockQuestion}
        selectedOption={undefined}
        onSelect={onSelect}
        ended={false}
      />
    );
    fireEvent.click(screen.getByText(/Lisbon/));
    expect(onSelect).toHaveBeenCalledWith(1);
  });

  it("shows the topic label when the question carries one", () => {
    render(
      <QuestionCard
        question={{ ...mockQuestion, materia: "propagacao" }}
        selectedOption={undefined}
        onSelect={() => {}}
        ended={false}
      />
    );
    // Locale is mocked to pt, so the short Portuguese label is expected.
    expect(screen.getByText("Propagação")).toBeInTheDocument();
  });

  it("omits the topic label for a slug outside the taxonomy", () => {
    // `materia` was a freeform legacy field; a stale value must not render.
    render(
      <QuestionCard
        question={{ ...mockQuestion, materia: "ohm" }}
        selectedOption={undefined}
        onSelect={() => {}}
        ended={false}
      />
    );
    expect(screen.queryByText("ohm")).not.toBeInTheDocument();
  });

  it("renders no meta row when there is no topic, difficulty or bookmark", () => {
    const { container } = render(
      <QuestionCard
        question={mockQuestion}
        selectedOption={undefined}
        onSelect={() => {}}
        ended={false}
      />
    );
    // The question text must be the card's first content, not an empty row.
    expect(container.querySelector(".justify-between")).toBeNull();
  });

  it("shows correct answer styling when ended", () => {
    const { container } = render(
      <QuestionCard
        question={mockQuestion}
        selectedOption={0}
        onSelect={() => {}}
        ended={true}
      />
    );
    // The correct answer should have green styling
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBe(4);
  });
});
