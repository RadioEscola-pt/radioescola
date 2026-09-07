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

    fireEvent.click(screen.getByRole("radio", { name: "modeFrequency" }));
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

    fireEvent.change(screen.getByPlaceholderText("0.95"), { target: { value: "0.66" } });

    // The constants are 150 x k and 75 x k, not the 142.50 and 71.25 of the
    // default. They are asserted as bare numbers because KaTeX puts each one in
    // its own node — matching "99.00 / f(MHz)" would assert the renderer rather
    // than the physics.
    expect(screen.getByText("99.00")).toBeInTheDocument();
    expect(screen.getByText("49.50")).toBeInTheDocument();
    expect(screen.queryByText("142.50")).not.toBeInTheDocument();

    // The other mode inverts the same k, and shows no constant at all — so the
    // check that k reached the solver is the answer itself. A 6.992 m dipole on
    // 0.66 resonates at 14.149 MHz; had the 0.95 fallback silently applied it
    // would read 20.366 MHz.
    fireEvent.click(screen.getByRole("radio", { name: "modeFrequency" }));
    fireEvent.change(screen.getByPlaceholderText("e.g. 10.05"), { target: { value: "6.992" } });
    fireEvent.click(screen.getByRole("button", { name: "calculate" }));
    expect(screen.getByText(/14.149 MHz/)).toBeInTheDocument();
  });

  it("offers the antenna type as a switch, and re-solves for the one picked", () => {
    render(<WavelengthCalculator {...defaultProps} />);
    fireEvent.click(screen.getByRole("radio", { name: "modeFrequency" }));

    // Both options are on screen. As a <select> the second one, and the fact
    // that there was a choice at all, were hidden behind a tap.
    expect(screen.getByRole("radio", { name: "halfWaveDipole" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "quarterWaveVertical" })).not.toBeChecked();

    fireEvent.change(screen.getByPlaceholderText("e.g. 10.05"), { target: { value: "10" } });
    fireEvent.click(screen.getByRole("button", { name: "calculate" }));
    expect(screen.getByText(/14.240 MHz/)).toBeInTheDocument();

    // A vertical of that length is half an antenna, so it resonates an octave
    // down — the previous answer is not stale, it is wrong by a factor of two.
    // Hence the switch clears it rather than leaving it under the new setting.
    fireEvent.click(screen.getByRole("radio", { name: "quarterWaveVertical" }));
    expect(screen.queryByText(/14.240 MHz/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "calculate" }));
    expect(screen.getByText(/7.120 MHz/)).toBeInTheDocument();
  });

  it("resets all fields when clicking reset", () => {
    render(<WavelengthCalculator {...defaultProps} />);

    const fInput = screen.getByPlaceholderText("e.g. 14.150");
    fireEvent.change(fInput, { target: { value: "14.15" } });
    fireEvent.click(screen.getByRole("button", { name: "reset" }));

    expect(fInput).toHaveValue("");
  });
});
