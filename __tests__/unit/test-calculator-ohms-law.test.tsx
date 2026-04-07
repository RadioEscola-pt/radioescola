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
// to prevent the useEffect([t]) from re-running on every render
const stableTranslation = (key: string) => key;
vi.mock("next-intl", () => ({
  useTranslations: () => stableTranslation,
  useLocale: () => "pt",
}));

import { render, screen, fireEvent } from "@testing-library/react";
import OhmsLawCalculator from "@/components/calculators/OhmsLawCalculator";

const defaultProps = {
  instanceId: "test",
  initialPosition: { x: 0, y: 0 },
  zIndex: 100,
  onClose: vi.fn(),
  onFocus: vi.fn(),
};

describe("OhmsLawCalculator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all three input fields", () => {
    render(<OhmsLawCalculator {...defaultProps} />);

    expect(screen.getByPlaceholderText("e.g. 12")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. 0.5")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. 24")).toBeInTheDocument();
  });

  it("renders calculate and reset buttons", () => {
    render(<OhmsLawCalculator {...defaultProps} />);

    expect(screen.getByRole("button", { name: "calculate" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "reset" })).toBeInTheDocument();
  });

  it("calculates voltage from current and resistance", () => {
    render(<OhmsLawCalculator {...defaultProps} />);

    const currentInput = screen.getByPlaceholderText("e.g. 0.5");
    const resistanceInput = screen.getByPlaceholderText("e.g. 24");

    fireEvent.change(currentInput, { target: { value: "2" } });
    fireEvent.change(resistanceInput, { target: { value: "10" } });
    fireEvent.click(screen.getByRole("button", { name: "calculate" }));

    const voltageInput = screen.getByPlaceholderText("e.g. 12");
    expect(voltageInput).toHaveValue("20.000");
  });

  it("calculates resistance from voltage and current", () => {
    render(<OhmsLawCalculator {...defaultProps} />);

    const voltageInput = screen.getByPlaceholderText("e.g. 12");
    const currentInput = screen.getByPlaceholderText("e.g. 0.5");

    fireEvent.change(voltageInput, { target: { value: "20" } });
    fireEvent.change(currentInput, { target: { value: "2" } });
    fireEvent.click(screen.getByRole("button", { name: "calculate" }));

    const resistanceInput = screen.getByPlaceholderText("e.g. 24");
    expect(resistanceInput).toHaveValue("10.000");
  });

  it("shows error when fewer than 2 fields filled", () => {
    render(<OhmsLawCalculator {...defaultProps} />);

    const voltageInput = screen.getByPlaceholderText("e.g. 12");
    fireEvent.change(voltageInput, { target: { value: "12" } });
    fireEvent.click(screen.getByRole("button", { name: "calculate" }));

    expect(screen.getByText("provideTwoValues")).toBeInTheDocument();
  });

  it("shows error when all 3 fields filled", () => {
    render(<OhmsLawCalculator {...defaultProps} />);

    fireEvent.change(screen.getByPlaceholderText("e.g. 12"), { target: { value: "20" } });
    fireEvent.change(screen.getByPlaceholderText("e.g. 0.5"), { target: { value: "2" } });
    fireEvent.change(screen.getByPlaceholderText("e.g. 24"), { target: { value: "10" } });
    fireEvent.click(screen.getByRole("button", { name: "calculate" }));

    expect(screen.getByText("clearOneField")).toBeInTheDocument();
  });

  it("reset clears all fields", () => {
    render(<OhmsLawCalculator {...defaultProps} />);

    const voltageInput = screen.getByPlaceholderText("e.g. 12");
    const currentInput = screen.getByPlaceholderText("e.g. 0.5");
    const resistanceInput = screen.getByPlaceholderText("e.g. 24");

    fireEvent.change(voltageInput, { target: { value: "20" } });
    fireEvent.change(currentInput, { target: { value: "2" } });
    fireEvent.change(resistanceInput, { target: { value: "10" } });
    fireEvent.click(screen.getByRole("button", { name: "reset" }));

    expect(voltageInput).toHaveValue("");
    expect(currentInput).toHaveValue("");
    expect(resistanceInput).toHaveValue("");
  });
});
