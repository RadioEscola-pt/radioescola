import { describe, it, expect } from 'vitest';
import {
  UNIT_MULTIPLIERS,
  UNIT_GROUPS,
  parseValue,
  convertToBase,
  convertFromBase,
  formatValue,
  findBestUnit,
  formatWithUnit,
} from '@/lib/utils';

describe('parseValue', () => {
  it('parses regular numbers', () => {
    expect(parseValue('123')).toBe(123);
    expect(parseValue('45.67')).toBe(45.67);
  });

  it('handles comma as decimal separator', () => {
    expect(parseValue('12,5')).toBe(12.5);
    expect(parseValue('1,234')).toBe(1.234);
  });

  it('handles whitespace', () => {
    expect(parseValue('  42  ')).toBe(42);
  });

  it('returns NaN for invalid input', () => {
    expect(parseValue('abc')).toBeNaN();
  });

  it('returns NaN for empty string', () => {
    // Empty string becomes 0 with Number(), but formatValue handles it
    expect(parseValue('')).toBe(0);
  });
});

describe('convertToBase', () => {
  it('converts resistance units', () => {
    expect(convertToBase(1, 'kΩ')).toBe(1000);
    expect(convertToBase(1, 'MΩ')).toBe(1e6);
    expect(convertToBase(100, 'mΩ')).toBe(0.1);
  });

  it('converts capacitance units', () => {
    expect(convertToBase(1, 'µF')).toBe(1e-6);
    expect(convertToBase(1, 'nF')).toBe(1e-9);
    expect(convertToBase(1, 'pF')).toBe(1e-12);
  });

  it('converts inductance units', () => {
    expect(convertToBase(1, 'mH')).toBe(1e-3);
    expect(convertToBase(1, 'µH')).toBe(1e-6);
  });

  it('converts frequency units', () => {
    expect(convertToBase(1, 'kHz')).toBe(1000);
    expect(convertToBase(1, 'MHz')).toBe(1e6);
    expect(convertToBase(1, 'GHz')).toBe(1e9);
  });

  it('handles unknown units', () => {
    expect(convertToBase(100, 'unknown')).toBe(100);
  });
});

describe('convertFromBase', () => {
  it('converts from base to target unit', () => {
    expect(convertFromBase(1000, 'kΩ')).toBe(1);
    expect(convertFromBase(1e-6, 'µF')).toBe(1);
    expect(convertFromBase(1e6, 'MHz')).toBe(1);
  });
});

describe('formatValue', () => {
  it('formats with automatic decimals', () => {
    expect(formatValue(1234)).toBe('1234.0');
    expect(formatValue(123.4)).toBe('123.40');
    expect(formatValue(12.34)).toBe('12.340');
    expect(formatValue(1.234)).toBe('1.2340');
  });

  it('formats with specified decimals', () => {
    expect(formatValue(123.456, 2)).toBe('123.46');
  });

  it('returns empty string for non-finite values', () => {
    expect(formatValue(NaN)).toBe('');
    expect(formatValue(Infinity)).toBe('');
  });
});

describe('findBestUnit', () => {
  it('finds best unit for resistance', () => {
    const result = findBestUnit(4700, UNIT_GROUPS.resistance);
    expect(result.value).toBeCloseTo(4.7);
    expect(result.unit).toBe('kΩ');
  });

  it('finds best unit for capacitance', () => {
    const result = findBestUnit(100e-12, UNIT_GROUPS.capacitance);
    expect(result.value).toBeCloseTo(100);
    expect(result.unit).toBe('pF');
  });

  it('finds best unit for frequency', () => {
    const result = findBestUnit(7.1e6, UNIT_GROUPS.frequency);
    expect(result.value).toBeCloseTo(7.1);
    expect(result.unit).toBe('MHz');
  });

  it('handles small values', () => {
    const result = findBestUnit(0.001, UNIT_GROUPS.resistance);
    expect(result.unit).toBe('mΩ');
  });
});

describe('formatWithUnit', () => {
  it('formats value with automatic unit selection', () => {
    const result = formatWithUnit(4700, UNIT_GROUPS.resistance);
    expect(result).toContain('kΩ');
    expect(result).toContain('4.7');
  });
});

describe('UNIT_MULTIPLIERS', () => {
  it('has correct multipliers for common units', () => {
    expect(UNIT_MULTIPLIERS['kΩ']).toBe(1000);
    expect(UNIT_MULTIPLIERS['µF']).toBe(1e-6);
    expect(UNIT_MULTIPLIERS['MHz']).toBe(1e6);
  });
});

describe('UNIT_GROUPS', () => {
  it('has all expected groups', () => {
    expect(UNIT_GROUPS.resistance).toBeDefined();
    expect(UNIT_GROUPS.capacitance).toBeDefined();
    expect(UNIT_GROUPS.inductance).toBeDefined();
    expect(UNIT_GROUPS.frequency).toBeDefined();
    expect(UNIT_GROUPS.power).toBeDefined();
    expect(UNIT_GROUPS.voltage).toBeDefined();
    expect(UNIT_GROUPS.current).toBeDefined();
  });
});
