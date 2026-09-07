import { vi } from "vitest";

vi.mock("@/hooks/useDraggableWindow", () => ({
  useDraggableWindow: () => ({
    position: { x: 0, y: 0 },
    containerRef: { current: null },
    beginDrag: vi.fn(),
  }),
}));

vi.mock("@/lib/config", () => ({
  registerCalculatorComponent: vi.fn(),
}));

const stableT = (key: string) => key;
vi.mock("next-intl", () => ({
  useTranslations: () => stableT,
  useLocale: () => "pt",
}));

import { render, screen, fireEvent } from "@testing-library/react";
import QFactorCalculator from "@/components/calculators/QFactorCalculator";

const defaultProps = {
  instanceId: "test-q-factor",
  initialPosition: { x: 0, y: 0 },
  zIndex: 100,
  onClose: vi.fn(),
  onFocus: vi.fn(),
};

describe("QFactorCalculator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders frequency, bandwidth, and Q factor inputs", () => {
    render(<QFactorCalculator {...defaultProps} />);

    expect(screen.getByPlaceholderText("e.g. 7.1")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. 150")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. 47.3")).toBeInTheDocument();
  });

  it("calculates Q factor from resonant frequency and bandwidth", () => {
    render(<QFactorCalculator {...defaultProps} />);

    fireEvent.change(screen.getByPlaceholderText("e.g. 7.1"), { target: { value: "7.0" } });
    fireEvent.change(screen.getByPlaceholderText("e.g. 150"), { target: { value: "140" } });
    fireEvent.click(screen.getByRole("button", { name: "calculate" }));

    expect(screen.getByText("Q = 50.00")).toBeInTheDocument();
  });

  it("calculates bandwidth from frequency and Q factor", () => {
    render(<QFactorCalculator {...defaultProps} />);

    fireEvent.change(screen.getByPlaceholderText("e.g. 7.1"), { target: { value: "7.0" } });
    fireEvent.change(screen.getByPlaceholderText("e.g. 47.3"), { target: { value: "50" } });
    fireEvent.click(screen.getByRole("button", { name: "calculate" }));

    expect(screen.getByText(/140/)).toBeInTheDocument();
  });

  it("calculates resonant frequency from Q factor and bandwidth", () => {
    render(<QFactorCalculator {...defaultProps} />);

    fireEvent.change(screen.getByPlaceholderText("e.g. 150"), { target: { value: "140" } });
    fireEvent.change(screen.getByPlaceholderText("e.g. 47.3"), { target: { value: "50" } });
    fireEvent.click(screen.getByRole("button", { name: "calculate" }));

    expect(screen.getByText(/7/)).toBeInTheDocument();
  });

  it("clears all fields on reset", () => {
    render(<QFactorCalculator {...defaultProps} />);

    const fInput = screen.getByPlaceholderText("e.g. 7.1");
    const bwInput = screen.getByPlaceholderText("e.g. 150");

    fireEvent.change(fInput, { target: { value: "7.1" } });
    fireEvent.change(bwInput, { target: { value: "150" } });
    fireEvent.click(screen.getByRole("button", { name: "reset" }));

    expect(fInput).toHaveValue("");
    expect(bwInput).toHaveValue("");
  });
});
