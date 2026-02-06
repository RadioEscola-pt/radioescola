/**
 * Unit conversion utilities for electrical calculations
 */

/** Multipliers for converting units to base SI units */
export const UNIT_MULTIPLIERS: Record<string, number> = {
  // Resistance (base: Ohm)
  "Ω": 1,
  "mΩ": 1e-3,
  "kΩ": 1e3,
  "MΩ": 1e6,

  // Capacitance (base: Farad)
  "F": 1,
  "mF": 1e-3,
  "µF": 1e-6,
  "nF": 1e-9,
  "pF": 1e-12,

  // Inductance (base: Henry)
  "H": 1,
  "mH": 1e-3,
  "µH": 1e-6,
  "nH": 1e-9,

  // Frequency (base: Hertz)
  "Hz": 1,
  "kHz": 1e3,
  "MHz": 1e6,
  "GHz": 1e9,

  // Power (base: Watt)
  "W": 1,
  "mW": 1e-3,
  "kW": 1e3,
  "MW": 1e6,

  // Voltage (base: Volt)
  "V": 1,
  "mV": 1e-3,
  "kV": 1e3,

  // Current (base: Ampere)
  "A": 1,
  "mA": 1e-3,
  "µA": 1e-6,

  // dB (no conversion, but included for completeness)
  "dB": 1,
  "dBm": 1,
};

/** Common unit groups for different physical quantities */
export const UNIT_GROUPS = {
  resistance: ["mΩ", "Ω", "kΩ", "MΩ"],
  capacitance: ["pF", "nF", "µF", "mF", "F"],
  inductance: ["nH", "µH", "mH", "H"],
  frequency: ["Hz", "kHz", "MHz", "GHz"],
  power: ["mW", "W", "kW"],
  voltage: ["mV", "V", "kV"],
  current: ["µA", "mA", "A"],
} as const;

/**
 * Parse a string value to a number, handling comma as decimal separator
 */
export function parseValue(value: string): number {
  const normalized = value.trim().replace(",", ".");
  const num = Number(normalized);
  return Number.isFinite(num) ? num : NaN;
}

/**
 * Convert a value from a specific unit to base SI unit
 */
export function convertToBase(value: number, unit: string): number {
  const multiplier = UNIT_MULTIPLIERS[unit];
  if (multiplier === undefined) {
    console.warn(`Unknown unit: ${unit}, using multiplier of 1`);
    return value;
  }
  return value * multiplier;
}

/**
 * Convert a value from base SI unit to a specific unit
 */
export function convertFromBase(value: number, unit: string): number {
  const multiplier = UNIT_MULTIPLIERS[unit];
  if (multiplier === undefined) {
    console.warn(`Unknown unit: ${unit}, using multiplier of 1`);
    return value;
  }
  return value / multiplier;
}

/**
 * Format a number with appropriate decimal places
 */
export function formatValue(value: number, decimals?: number): string {
  if (!Number.isFinite(value)) return "";

  const abs = Math.abs(value);
  const d = decimals ?? (abs >= 1000 ? 1 : abs >= 100 ? 2 : abs >= 10 ? 3 : 4);
  return value.toFixed(d);
}

/**
 * Find the best unit for displaying a value (in base units)
 * Returns the converted value and the chosen unit
 */
export function findBestUnit(
  valueInBase: number,
  units: readonly string[]
): { value: number; unit: string } {
  if (!Number.isFinite(valueInBase) || units.length === 0) {
    return { value: valueInBase, unit: units[0] ?? "" };
  }

  // Iterate from smallest to largest multiplier to find best fit
  const sortedUnits = [...units].sort((a, b) => {
    const multA = UNIT_MULTIPLIERS[a] ?? 1;
    const multB = UNIT_MULTIPLIERS[b] ?? 1;
    return multA - multB;
  });

  for (let i = sortedUnits.length - 1; i >= 0; i--) {
    const unit = sortedUnits[i];
    if (!unit) continue;

    const converted = convertFromBase(valueInBase, unit);
    if (Math.abs(converted) >= 1 || i === 0) {
      return { value: converted, unit };
    }
  }

  const fallbackUnit = units[0] ?? "";
  return {
    value: convertFromBase(valueInBase, fallbackUnit),
    unit: fallbackUnit,
  };
}

/**
 * Format a value with automatic unit selection
 */
export function formatWithUnit(
  valueInBase: number,
  units: readonly string[],
  decimals?: number
): string {
  const { value, unit } = findBestUnit(valueInBase, units);
  return `${formatValue(value, decimals)} ${unit}`;
}
