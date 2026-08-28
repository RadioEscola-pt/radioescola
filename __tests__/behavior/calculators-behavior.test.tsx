import { vi, describe, it, expect, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

// Mock draggable hook
vi.mock("@/hooks/useDraggableWindow", () => ({
  useDraggableWindow: ({ initialPosition }: { initialPosition: { x: number; y: number } }) => ({
    position: initialPosition,
    containerRef: { current: null },
    beginDrag: vi.fn(),
  }),
}));

vi.mock("@/lib/config", () => ({
  registerCalculatorComponent: vi.fn(),
}));

const stableT = (key: string, params?: Record<string, string | number>) => {
  if (params) {
    let result = key;
    for (const [k, v] of Object.entries(params)) {
      result += ` [${k}=${v}]`;
    }
    return result;
  }
  return key;
};

vi.mock("next-intl", () => ({
  useTranslations: () => stableT,
  useLocale: () => "pt",
}));

import ReactanceCalculator from "@/components/calculators/ReactanceCalculator";
import QFactorCalculator from "@/components/calculators/QFactorCalculator";
import WavelengthCalculator from "@/components/calculators/WavelengthCalculator";
import OhmsLawCalculator from "@/components/calculators/OhmsLawCalculator";
import GainCalculator from "@/components/calculators/GainCalculator";

describe("Calculators Suite Behavior & Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("ReactanceCalculator Behavior", () => {
    it("performs full inductive reactance calculation flow", () => {
      const onClose = vi.fn();
      const onFocus = vi.fn();
      render(
        <ReactanceCalculator
          instanceId="test-reactance"
          initialPosition={{ x: 10, y: 10 }}
          zIndex={100}
          onClose={onClose}
          onFocus={onFocus}
        />
      );

      // Verify title
      expect(screen.getByText("title")).toBeInTheDocument();

      // Enter frequency = 14.15 MHz and Inductance = 10 uH
      const freqInput = screen.getByPlaceholderText("e.g. 7.1");
      const indInput = screen.getByPlaceholderText("e.g. 10");
      const calcBtn = screen.getByRole("button", { name: "calculate" });

      fireEvent.change(freqInput, { target: { value: "14.15" } });
      fireEvent.change(indInput, { target: { value: "10" } });
      fireEvent.click(calcBtn);

      // Check that inductive reactance is calculated and displayed
      expect(screen.getByText(/XL = 889.071 Ω/)).toBeInTheDocument();

      // Reset
      fireEvent.click(screen.getByRole("button", { name: "reset" }));
      expect(freqInput).toHaveValue("");
      expect(indInput).toHaveValue("");
    });

    it("performs full capacitive reactance calculation flow", () => {
      render(
        <ReactanceCalculator
          instanceId="test-reactance-c"
          initialPosition={{ x: 20, y: 20 }}
          zIndex={100}
          onClose={vi.fn()}
          onFocus={vi.fn()}
        />
      );

      // Switch to capacitive
      fireEvent.click(screen.getByRole("button", { name: "capacitive" }));

      const freqInput = screen.getByPlaceholderText("e.g. 7.1");
      const capInput = screen.getByPlaceholderText("e.g. 100");
      const calcBtn = screen.getByRole("button", { name: "calculate" });

      fireEvent.change(freqInput, { target: { value: "7.1" } });
      fireEvent.change(capInput, { target: { value: "100" } });
      fireEvent.click(calcBtn);

      expect(screen.getByText(/XC = 224.161 Ω/)).toBeInTheDocument();
    });
  });

  describe("QFactorCalculator Behavior", () => {
    it("calculates Q factor and bandwidth reciprocally with cutoffs", () => {
      render(
        <QFactorCalculator
          instanceId="test-q"
          initialPosition={{ x: 30, y: 30 }}
          zIndex={101}
          onClose={vi.fn()}
          onFocus={vi.fn()}
        />
      );

      const freqInput = screen.getByPlaceholderText("e.g. 7.1");
      const bwInput = screen.getByPlaceholderText("e.g. 150");
      const qInput = screen.getByPlaceholderText("e.g. 47.3");
      const calcBtn = screen.getByRole("button", { name: "calculate" });

      // Step 1: calculate Q from f0 and BW
      fireEvent.change(freqInput, { target: { value: "7.0" } });
      fireEvent.change(bwInput, { target: { value: "140" } });
      fireEvent.click(calcBtn);

      expect(screen.getByText("Q = 50.00")).toBeInTheDocument();
      expect(qInput).toHaveValue("50.00");

      // Step 2: clear BW and compute from f0 and Q
      fireEvent.change(bwInput, { target: { value: "" } });
      fireEvent.click(calcBtn);

      expect(screen.getByText("BW = 140.000 kHz")).toBeInTheDocument();
    });
  });

  describe("WavelengthCalculator Behavior", () => {
    it("calculates half-wave dipole dimensions and switches to length mode", () => {
      render(
        <WavelengthCalculator
          instanceId="test-wave"
          initialPosition={{ x: 40, y: 40 }}
          zIndex={102}
          onClose={vi.fn()}
          onFocus={vi.fn()}
        />
      );

      const freqInput = screen.getByPlaceholderText("e.g. 14.150");
      const calcBtn = screen.getByRole("button", { name: "calculate" });

      // 14.15 MHz -> wavelength ~ 21.19 m, dipole ~ 10.063 m
      fireEvent.change(freqInput, { target: { value: "14.15" } });
      fireEvent.click(calcBtn);

      expect(screen.getByText(/λ = 21.19 m/)).toBeInTheDocument();

      // Switch to length -> frequency mode
      fireEvent.click(screen.getByRole("button", { name: "fromLength" }));
      const lengthInput = screen.getByPlaceholderText("e.g. 10.05");
      fireEvent.change(lengthInput, { target: { value: "10.063" } });
      fireEvent.click(calcBtn);

      expect(screen.getByText(/f = 14.150 MHz/)).toBeInTheDocument();
    });
  });

  describe("OhmsLawCalculator Behavior", () => {
    it("computes resistance and electrical power simultaneously", () => {
      render(
        <OhmsLawCalculator
          instanceId="test-ohm"
          initialPosition={{ x: 50, y: 50 }}
          zIndex={103}
          onClose={vi.fn()}
          onFocus={vi.fn()}
        />
      );

      const vInput = screen.getByPlaceholderText("e.g. 12");
      const iInput = screen.getByPlaceholderText("e.g. 0.5");
      const calcBtn = screen.getByRole("button", { name: "calculate" });

      fireEvent.change(vInput, { target: { value: "12" } });
      fireEvent.change(iInput, { target: { value: "0.5" } });
      fireEvent.click(calcBtn);

      // Resistance = 24 ohms, Power = 6 Watts
      expect(screen.getByPlaceholderText("e.g. 24")).toHaveValue("24.000");
      expect(screen.getByText(/R = 24.000 Ω • P = 6.000 W/)).toBeInTheDocument();
    });
  });

  describe("GainCalculator Behavior", () => {
    it("supports power ratio, voltage ratio, and cascaded stages", () => {
      render(
        <GainCalculator
          instanceId="test-gain"
          initialPosition={{ x: 60, y: 60 }}
          zIndex={104}
          onClose={vi.fn()}
          onFocus={vi.fn()}
        />
      );

      const calcBtn = screen.getByRole("button", { name: "calculate" });

      // Power mode: 10W -> 100W = 10 dB
      const p1 = screen.getByPlaceholderText("e.g. 10");
      const p2 = screen.getByPlaceholderText("e.g. 100");
      fireEvent.change(p1, { target: { value: "10" } });
      fireEvent.change(p2, { target: { value: "100" } });
      fireEvent.click(calcBtn);
      expect(screen.getByText("10.000 dB")).toBeInTheDocument();

      // Voltage mode: 1V -> 10V = 20 dB
      fireEvent.click(screen.getByRole("button", { name: "voltageRatio" }));
      const v1 = screen.getByPlaceholderText("e.g. 1");
      const v2 = screen.getByPlaceholderText("e.g. 10");
      fireEvent.change(v1, { target: { value: "1" } });
      fireEvent.change(v2, { target: { value: "10" } });
      fireEvent.click(calcBtn);
      expect(screen.getByText("20.000 dB")).toBeInTheDocument();
    });
  });
});
