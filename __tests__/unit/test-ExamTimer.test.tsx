import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ExamTimer from "@/components/ExamTimer";

describe("Unit: ExamTimer", () => {
  it("renders time in MM:SS format", () => {
    render(<ExamTimer timeLeft={90} />);
    expect(screen.getByText("1:30")).toBeInTheDocument();
  });

  it("pads seconds with leading zero", () => {
    render(<ExamTimer timeLeft={65} />);
    expect(screen.getByText("1:05")).toBeInTheDocument();
  });

  it("shows 0:00 when time is zero", () => {
    render(<ExamTimer timeLeft={0} />);
    expect(screen.getByText("0:00")).toBeInTheDocument();
  });

  it("handles large time values", () => {
    render(<ExamTimer timeLeft={3600} />);
    expect(screen.getByText("60:00")).toBeInTheDocument();
  });
});
