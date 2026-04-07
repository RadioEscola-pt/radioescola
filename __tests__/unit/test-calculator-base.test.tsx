import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// Mock the draggable window hook
vi.mock("@/hooks/useDraggableWindow", () => ({
  useDraggableWindow: () => ({
    position: { x: 0, y: 0 },
    containerRef: { current: null },
    beginDrag: vi.fn(),
  }),
}));

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

import {
  CalculatorWindow,
  CalculatorInput,
  CalculatorButtons,
  CalculatorResult,
} from "@/components/calculators/base";

describe("CalculatorWindow", () => {
  const defaultProps = {
    title: "Test Calc",
    color: "blue" as const,
    initialPosition: { x: 0, y: 0 },
    zIndex: 100,
    onClose: vi.fn(),
    onFocus: vi.fn(),
    children: <div>content</div>,
  };

  it("renders title and children", () => {
    render(<CalculatorWindow {...defaultProps} />);
    expect(screen.getByText("Test Calc")).toBeInTheDocument();
    expect(screen.getByText("content")).toBeInTheDocument();
  });

  it("fires onClose when close button is clicked", () => {
    const onClose = vi.fn();
    render(<CalculatorWindow {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("has correct color class on header", () => {
    render(<CalculatorWindow {...defaultProps} />);
    const header = screen.getByText("Test Calc").closest("div");
    expect(header?.className).toContain("bg-blue-600");
  });
});

describe("CalculatorInput", () => {
  const defaultProps = {
    id: "test-input",
    label: "Resistance",
    value: "",
    onChange: vi.fn(),
  };

  it("renders label and input", () => {
    render(<CalculatorInput {...defaultProps} />);
    expect(screen.getByText("Resistance")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("calls onChange when typing", () => {
    const onChange = vi.fn();
    render(<CalculatorInput {...defaultProps} onChange={onChange} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "42" } });
    expect(onChange).toHaveBeenCalledWith("42");
  });

  it("renders unit dropdown when units are provided", () => {
    render(
      <CalculatorInput
        {...defaultProps}
        units={["Hz", "kHz", "MHz"]}
        selectedUnit="Hz"
        onUnitChange={vi.fn()}
      />
    );
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByText("kHz")).toBeInTheDocument();
    expect(screen.getByText("MHz")).toBeInTheDocument();
  });
});

describe("CalculatorButtons", () => {
  it("renders calculate and reset buttons", () => {
    render(<CalculatorButtons onCalculate={vi.fn()} onReset={vi.fn()} />);
    expect(screen.getByText("calculate")).toBeInTheDocument();
    expect(screen.getByText("reset")).toBeInTheDocument();
  });

  it("fires onCalculate when calculate button is clicked", () => {
    const onCalculate = vi.fn();
    render(<CalculatorButtons onCalculate={onCalculate} onReset={vi.fn()} />);
    fireEvent.click(screen.getByText("calculate"));
    expect(onCalculate).toHaveBeenCalledOnce();
  });

  it("fires onReset when reset button is clicked", () => {
    const onReset = vi.fn();
    render(<CalculatorButtons onCalculate={vi.fn()} onReset={onReset} />);
    fireEvent.click(screen.getByText("reset"));
    expect(onReset).toHaveBeenCalledOnce();
  });
});

describe("CalculatorResult", () => {
  it("renders value text", () => {
    render(<CalculatorResult value="42 ohms" />);
    expect(screen.getByText("42 ohms")).toBeInTheDocument();
  });

  it("renders formula when provided", () => {
    render(<CalculatorResult value="42 ohms" formula="V = IR" />);
    expect(screen.getByText(/V = IR/)).toBeInTheDocument();
  });

  it("renders label when provided", () => {
    render(<CalculatorResult value="42 ohms" label="Result" />);
    expect(screen.getByText("Result")).toBeInTheDocument();
  });
});
