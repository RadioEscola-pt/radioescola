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
import ReactanceCalculator from "@/components/calculators/ReactanceCalculator";

const defaultProps = {
  instanceId: "test-reactance",
  initialPosition: { x: 0, y: 0 },
  zIndex: 100,
  onClose: vi.fn(),
  onFocus: vi.fn(),
};

describe("ReactanceCalculator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders in inductive mode by default", () => {
    render(<ReactanceCalculator {...defaultProps} />);

    expect(screen.getByPlaceholderText("e.g. 7.1")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. 10")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. 446")).toBeInTheDocument();
  });

  it("calculates inductive reactance from frequency and inductance", () => {
    render(<ReactanceCalculator {...defaultProps} />);

    fireEvent.change(screen.getByPlaceholderText("e.g. 7.1"), { target: { value: "7.1" } });
    fireEvent.change(screen.getByPlaceholderText("e.g. 10"), { target: { value: "10" } });
    fireEvent.click(screen.getByRole("button", { name: "calculate" }));

    expect(screen.getByText(/446.11/)).toBeInTheDocument();
  });

  it("switches to capacitive mode and calculates capacitive reactance", () => {
    render(<ReactanceCalculator {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: "capacitive" }));
    expect(screen.getByPlaceholderText("e.g. 100")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("e.g. 7.1"), { target: { value: "14.1" } });
    fireEvent.change(screen.getByPlaceholderText("e.g. 100"), { target: { value: "100" } });
    fireEvent.click(screen.getByRole("button", { name: "calculate" }));

    expect(screen.getByText(/112.88/)).toBeInTheDocument();
  });

  it("shows prompt message if fewer than 2 fields are filled", () => {
    render(<ReactanceCalculator {...defaultProps} />);

    fireEvent.change(screen.getByPlaceholderText("e.g. 7.1"), { target: { value: "7.1" } });
    fireEvent.click(screen.getByRole("button", { name: "calculate" }));

    expect(screen.getByText("promptTwoFields")).toBeInTheDocument();
  });

  it("resets fields on reset click", () => {
    render(<ReactanceCalculator {...defaultProps} />);

    const fInput = screen.getByPlaceholderText("e.g. 7.1");
    const lInput = screen.getByPlaceholderText("e.g. 10");

    fireEvent.change(fInput, { target: { value: "7.1" } });
    fireEvent.change(lInput, { target: { value: "10" } });
    fireEvent.click(screen.getByRole("button", { name: "reset" }));

    expect(fInput).toHaveValue("");
    expect(lInput).toHaveValue("");
  });
});
