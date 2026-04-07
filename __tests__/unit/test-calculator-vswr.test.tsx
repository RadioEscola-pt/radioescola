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
import VSWRCalculator from "@/components/calculators/VSWRCalculator";

const defaultProps = {
  instanceId: "test",
  initialPosition: { x: 0, y: 0 },
  zIndex: 100,
  onClose: vi.fn(),
  onFocus: vi.fn(),
};

describe("VSWRCalculator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders in power mode with forward and reflected power inputs", () => {
    render(<VSWRCalculator {...defaultProps} />);

    expect(screen.getByPlaceholderText("e.g. 100")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. 10")).toBeInTheDocument();
  });

  it("calculates VSWR from power values", () => {
    render(<VSWRCalculator {...defaultProps} />);

    fireEvent.change(screen.getByPlaceholderText("e.g. 100"), { target: { value: "100" } });
    fireEvent.change(screen.getByPlaceholderText("e.g. 10"), { target: { value: "10" } });
    fireEvent.click(screen.getByRole("button", { name: "calculate" }));

    const resultElements = screen.getAllByText(/VSWR/);
    expect(resultElements.length).toBeGreaterThanOrEqual(1);
    expect(resultElements[0]).toHaveTextContent(/VSWR = /);
  });

  it("switches to direct mode and shows VSWR input", () => {
    render(<VSWRCalculator {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: "directVswr" }));

    expect(screen.getByPlaceholderText("e.g. 1.5")).toBeInTheDocument();
  });

  it("calculates from direct VSWR value", () => {
    render(<VSWRCalculator {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: "directVswr" }));
    fireEvent.change(screen.getByPlaceholderText("e.g. 1.5"), { target: { value: "1.5" } });
    fireEvent.click(screen.getByRole("button", { name: "calculate" }));

    const resultElements = screen.getAllByText(/VSWR/);
    expect(resultElements.length).toBeGreaterThanOrEqual(1);
    expect(resultElements[0]).toHaveTextContent(/VSWR = /);
  });

  it("shows error when reflected power exceeds forward power", () => {
    render(<VSWRCalculator {...defaultProps} />);

    fireEvent.change(screen.getByPlaceholderText("e.g. 100"), { target: { value: "10" } });
    fireEvent.change(screen.getByPlaceholderText("e.g. 10"), { target: { value: "100" } });
    fireEvent.click(screen.getByRole("button", { name: "calculate" }));

    expect(screen.getByText("reflectedExceed")).toBeInTheDocument();
  });

  it("reset clears all fields", () => {
    render(<VSWRCalculator {...defaultProps} />);

    const forwardInput = screen.getByPlaceholderText("e.g. 100");
    const reflectedInput = screen.getByPlaceholderText("e.g. 10");

    fireEvent.change(forwardInput, { target: { value: "100" } });
    fireEvent.change(reflectedInput, { target: { value: "10" } });
    fireEvent.click(screen.getByRole("button", { name: "reset" }));

    expect(forwardInput).toHaveValue("");
    expect(reflectedInput).toHaveValue("");
  });
});
