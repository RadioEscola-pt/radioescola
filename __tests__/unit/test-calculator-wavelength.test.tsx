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

  it("rejects an out-of-range velocity factor instead of falling back to 0.95", () => {
    render(<WavelengthCalculator {...defaultProps} />);

    fireEvent.change(screen.getByPlaceholderText("e.g. 14.150"), { target: { value: "14.15" } });
    // 66 is the percent convention for coax; silently reading it as the 0.95
    // default would show a dipole almost 3 m too long with no warning.
    fireEvent.change(screen.getByPlaceholderText("0.95"), { target: { value: "66" } });
    fireEvent.click(screen.getByRole("button", { name: "calculate" }));

    expect(screen.getByText("invalidVelocityFactor")).toBeInTheDocument();
    expect(screen.queryByText(/21.19 m/)).not.toBeInTheDocument();
  });

  it("uses the entered velocity factor for the result and the shown formula", () => {
    render(<WavelengthCalculator {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: "fromLength" }));
    fireEvent.change(screen.getByPlaceholderText("e.g. 10.05"), { target: { value: "6.992" } });
    fireEvent.change(screen.getByPlaceholderText("0.95"), { target: { value: "0.66" } });

    // The formula constant is 150 x k, not the 142.50 of the default.
    expect(screen.getByText(/99.00 \/ f\(MHz\)/)).toBeInTheDocument();

    // A 6.992 m dipole on 0.66 velocity factor resonates at 14.149 MHz; had the
    // 0.95 fallback silently applied it would read 20.366 MHz.
    fireEvent.click(screen.getByRole("button", { name: "calculate" }));
    expect(screen.getByText(/14.149 MHz/)).toBeInTheDocument();
  });

  it("resets all fields when clicking reset", () => {
    render(<WavelengthCalculator {...defaultProps} />);

    const fInput = screen.getByPlaceholderText("e.g. 14.150");
    fireEvent.change(fInput, { target: { value: "14.15" } });
    fireEvent.click(screen.getByRole("button", { name: "reset" }));

    expect(fInput).toHaveValue("");
  });
});
