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
import WavelengthCalculator from "@/components/calculators/WavelengthCalculator";

const defaultProps = {
  instanceId: "test-wavelength",
  initialPosition: { x: 0, y: 0 },
  zIndex: 100,
  onClose: vi.fn(),
  onFocus: vi.fn(),
};

describe("WavelengthCalculator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders frequency and velocity factor inputs by default", () => {
    render(<WavelengthCalculator {...defaultProps} />);

    expect(screen.getByPlaceholderText("e.g. 14.150")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("0.95")).toBeInTheDocument();
  });

  it("calculates wavelength and antenna dimensions from frequency", () => {
    render(<WavelengthCalculator {...defaultProps} />);

    fireEvent.change(screen.getByPlaceholderText("e.g. 14.150"), { target: { value: "14.15" } });
    fireEvent.click(screen.getByRole("button", { name: "calculate" }));

    expect(screen.getByText(/21.19 m/)).toBeInTheDocument();
  });

  it("switches to length mode and calculates resonant frequency", () => {
    render(<WavelengthCalculator {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: "fromLength" }));
    expect(screen.getByPlaceholderText("e.g. 10.05")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("e.g. 10.05"), { target: { value: "10.07" } });
    fireEvent.click(screen.getByRole("button", { name: "calculate" }));

    expect(screen.getByText(/14.141 MHz/)).toBeInTheDocument();
  });

  it("resets all fields when clicking reset", () => {
    render(<WavelengthCalculator {...defaultProps} />);

    const fInput = screen.getByPlaceholderText("e.g. 14.150");
    fireEvent.change(fInput, { target: { value: "14.15" } });
    fireEvent.click(screen.getByRole("button", { name: "reset" }));

    expect(fInput).toHaveValue("");
  });
});
