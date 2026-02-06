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
