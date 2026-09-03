/**
 * Calculator registry configuration
 * Central registration point for all calculator types
 */
import {
  Zap,
  Calculator,
  Waves,
  Radio,
  TrendingUp,
  ArrowLeftRight,
  Activity,
  Gauge,
  Antenna,
} from "lucide-react";
import type { CalculatorCode, CalculatorConfig } from "@/lib/types";

// Lazy imports for calculator components to avoid circular dependencies
// Components are assigned after registration
type LazyCalculatorConfig = Omit<CalculatorConfig, "component"> & {
  component?: CalculatorConfig["component"];
};

const registry: Record<CalculatorCode, LazyCalculatorConfig> = {
  OHMCALC: {
    code: "OHMCALC",
    translationKey: "ohmsLaw",
    title: "Ohm's Law Calculator",
    shortTitle: "Ohm's Law",
    description: "Calculate voltage, current, or resistance using Ohm's Law (V = IR)",
    icon: Zap,
    color: "blue",
  },
  COPADDER: {
    code: "COPADDER",
    translationKey: "componentSum",
    title: "Component Sum Calculator",
    shortTitle: "Component Sum",
    description: "Calculate series/parallel resistance and capacitance",
    icon: Calculator,
    color: "green",
  },
  RLC: {
    code: "RLC",
    translationKey: "rlc",
    title: "RLC Circuit Calculator",
    shortTitle: "RLC Circuit",
    description: "Calculate resonant frequency, impedance, and Q factor",
    icon: Waves,
    color: "purple",
  },
  VSWR: {
    code: "VSWR",
    translationKey: "vswr",
    title: "VSWR Calculator",
    shortTitle: "VSWR",
    description: "Calculate VSWR, return loss, and mismatch loss",
    icon: Radio,
    color: "orange",
  },
  GAIN: {
    code: "GAIN",
    translationKey: "gain",
    title: "Gain Calculator",
    shortTitle: "Gain",
    description: "Calculate power gain in dB and combined stage gain",
    icon: TrendingUp,
    color: "cyan",
  },
  TRANSFORMER: {
    code: "TRANSFORMER",
    translationKey: "transformer",
    title: "Transformer Calculator",
    shortTitle: "Transformer",
    description: "Calculate turns ratio, voltages, currents, and impedance",
    icon: ArrowLeftRight,
    color: "rose",
  },
  REACTANCE: {
    code: "REACTANCE",
    translationKey: "reactance",
    title: "Reactance Calculator",
    shortTitle: "Reactance",
    description: "Calculate inductive and capacitive reactance (XL and XC)",
    icon: Activity,
    color: "indigo",
  },
  QFACTOR: {
    code: "QFACTOR",
    translationKey: "qFactor",
    title: "Q Factor & Bandwidth Calculator",
    shortTitle: "Q Factor",
    description: "Calculate Q factor, resonant frequency, and bandwidth (Q = f0 / BW)",
    icon: Gauge,
    color: "amber",
  },
  WAVELENGTH: {
    code: "WAVELENGTH",
    translationKey: "wavelength",
    title: "Wavelength & Antenna Calculator",
    shortTitle: "Wavelength",
    description: "Calculate wavelength and half/quarter-wave antenna wire dimensions",
    icon: Antenna,
    color: "teal",
  },
};

/** Position offset for stacking multiple instances */
export const POSITION_OFFSET = { x: 30, y: 30 };

/** Base z-index for calculator windows */
export const BASE_Z_INDEX = 50;

/** Default initial position for new calculator windows */
export const DEFAULT_POSITION = { x: 40, y: 120 };

/**
 * Register a calculator component
 * Called from calculator modules to register themselves
 */
export function registerCalculatorComponent(
  code: CalculatorCode,
  component: CalculatorConfig["component"]
): void {
  if (registry[code]) {
    registry[code].component = component;
  }
}

/**
 * Get calculator configuration by code
 */
export function getCalculatorConfig(code: CalculatorCode): CalculatorConfig | undefined {
  const config = registry[code];
  if (config?.component) {
    return config as CalculatorConfig;
  }
  return undefined;
}

/**
 * Get all registered calculators with components
 */
export function getAllCalculators(): CalculatorConfig[] {
  return Object.values(registry).filter(
    (config): config is CalculatorConfig => config.component !== undefined
  );
}

/**
 * Get all calculator codes (even those without registered components)
 */
export function getAllCalculatorCodes(): CalculatorCode[] {
  return Object.keys(registry) as CalculatorCode[];
}

/**
 * Get calculator metadata (without component requirement)
 */
export function getCalculatorMeta(code: CalculatorCode): LazyCalculatorConfig | undefined {
  return registry[code];
}

/**
 * Calculate initial position for a new calculator instance
 * Offsets based on existing instances of the same type
 */
export function calculateInitialPosition(
  code: CalculatorCode,
  existingCount: number
): { x: number; y: number } {
  return {
    x: DEFAULT_POSITION.x + existingCount * POSITION_OFFSET.x,
    y: DEFAULT_POSITION.y + existingCount * POSITION_OFFSET.y,
  };
}
