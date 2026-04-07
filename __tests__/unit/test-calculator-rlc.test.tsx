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

// Override the global next-intl mock with a stable function reference
// to prevent useEffect([t]) from re-firing on every render
const stableT = (key: string) => key;
vi.mock("next-intl", () => ({
  useTranslations: () => stableT,
  useLocale: () => "pt",
}));

import { render, screen, fireEvent } from "@testing-library/react";
import RLCCalculator from "@/components/calculators/RLCCalculator";

const defaultProps = {
  instanceId: "test",
  initialPosition: { x: 0, y: 0 },
  zIndex: 100,
  onClose: vi.fn(),
  onFocus: vi.fn(),
};

describe("RLCCalculator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders in resonance mode by default with inductance and capacitance inputs", () => {
    render(<RLCCalculator {...defaultProps} />);

    expect(screen.getByPlaceholderText("e.g. 10")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. 100")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("e.g. 50")).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText("e.g. 7")).not.toBeInTheDocument();
  });

  it("calculates resonant frequency from inductance and capacitance", () => {
    render(<RLCCalculator {...defaultProps} />);

    fireEvent.change(screen.getByPlaceholderText("e.g. 10"), { target: { value: "10" } });
    fireEvent.change(screen.getByPlaceholderText("e.g. 100"), { target: { value: "100" } });
    fireEvent.click(screen.getByRole("button", { name: "calculate" }));

    expect(screen.getByText(/resonantFrequency/)).toBeInTheDocument();
  });

  it("switches to impedance mode and shows resistance and frequency inputs", () => {
    render(<RLCCalculator {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: "impedance" }));

    expect(screen.getByPlaceholderText("e.g. 50")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. 7")).toBeInTheDocument();
  });

  it("shows error for empty inputs in resonance mode", () => {
    render(<RLCCalculator {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: "calculate" }));

    expect(screen.getByText("positiveLC")).toBeInTheDocument();
  });

  it("reset clears all fields", () => {
    render(<RLCCalculator {...defaultProps} />);

    const inductanceInput = screen.getByPlaceholderText("e.g. 10");
    const capacitanceInput = screen.getByPlaceholderText("e.g. 100");

    fireEvent.change(inductanceInput, { target: { value: "10" } });
    fireEvent.change(capacitanceInput, { target: { value: "100" } });
    fireEvent.click(screen.getByRole("button", { name: "reset" }));

    expect(inductanceInput).toHaveValue("");
    expect(capacitanceInput).toHaveValue("");
  });
});
