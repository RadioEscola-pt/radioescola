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
import GainCalculator from "@/components/calculators/GainCalculator";

const defaultProps = {
  instanceId: "test",
  initialPosition: { x: 0, y: 0 },
  zIndex: 100,
  onClose: vi.fn(),
  onFocus: vi.fn(),
};

describe("GainCalculator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders in power mode with two power inputs", () => {
    render(<GainCalculator {...defaultProps} />);

    expect(screen.getByPlaceholderText("e.g. 10")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. 100")).toBeInTheDocument();
  });

  it("calculates gain from power ratio", () => {
    render(<GainCalculator {...defaultProps} />);

    fireEvent.change(screen.getByPlaceholderText("e.g. 10"), { target: { value: "10" } });
    fireEvent.change(screen.getByPlaceholderText("e.g. 100"), { target: { value: "100" } });
    fireEvent.click(screen.getByRole("button", { name: "calculate" }));

    const resultElements = screen.getAllByText(/dB/);
    expect(resultElements.length).toBeGreaterThanOrEqual(1);
    expect(resultElements[0]).toHaveTextContent(/dB/);
  });

  it("calculates gain from voltage ratio", () => {
    render(<GainCalculator {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: "voltageRatio" }));
    expect(screen.getByPlaceholderText("e.g. 1")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. 10")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("e.g. 1"), { target: { value: "1" } });
    fireEvent.change(screen.getByPlaceholderText("e.g. 10"), { target: { value: "10" } });
    fireEvent.click(screen.getByRole("button", { name: "calculate" }));

    const resultElements = screen.getAllByText(/20.000 dB/);
    expect(resultElements.length).toBeGreaterThanOrEqual(1);
  });

  it("switches to dB mode and shows stage inputs", () => {
    render(<GainCalculator {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: "addDb" }));

    const dbInputs = screen.getAllByPlaceholderText("dbValue");
    expect(dbInputs.length).toBe(2);
  });

  it("calculates total dB from stage values", () => {
    render(<GainCalculator {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: "addDb" }));

    const dbInputs = screen.getAllByPlaceholderText("dbValue");
    fireEvent.change(dbInputs[0]!, { target: { value: "3" } });
    fireEvent.change(dbInputs[1]!, { target: { value: "6" } });
    fireEvent.click(screen.getByRole("button", { name: "calculate" }));

    const resultElements = screen.getAllByText(/dB/);
    expect(resultElements.length).toBeGreaterThanOrEqual(1);
    expect(resultElements[0]).toHaveTextContent(/dB/);
  });

  it("adds a dB stage", () => {
    render(<GainCalculator {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: "addDb" }));

    const addButton = screen.getByRole("button", { name: /Add/ });
    fireEvent.click(addButton);

    const dbInputs = screen.getAllByPlaceholderText("dbValue");
    expect(dbInputs.length).toBe(3);
  });

  it("shows error for empty dB values", () => {
    render(<GainCalculator {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: "addDb" }));
    fireEvent.click(screen.getByRole("button", { name: "calculate" }));

    expect(screen.getByText("atLeastOneDb")).toBeInTheDocument();
  });

  it("reset clears all fields", () => {
    render(<GainCalculator {...defaultProps} />);

    fireEvent.change(screen.getByPlaceholderText("e.g. 10"), { target: { value: "10" } });
    fireEvent.change(screen.getByPlaceholderText("e.g. 100"), { target: { value: "100" } });
    fireEvent.click(screen.getByRole("button", { name: "reset" }));

    expect(screen.getByPlaceholderText("e.g. 10")).toHaveValue("");
    expect(screen.getByPlaceholderText("e.g. 100")).toHaveValue("");
  });
});
