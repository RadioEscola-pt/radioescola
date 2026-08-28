import { describe, it, expect } from 'vitest';
import { ohmsLaw, power, rlc, vswr, gain, transformer, wavelength } from '@/lib/utils';

describe('ohmsLaw', () => {
  it('calculates voltage from current and resistance', () => {
    expect(ohmsLaw.voltage(2, 10)).toBe(20);
  });

  it('calculates current from voltage and resistance', () => {
    expect(ohmsLaw.current(20, 10)).toBe(2);
  });

  it('calculates resistance from voltage and current', () => {
    expect(ohmsLaw.resistance(20, 2)).toBe(10);
  });

  it('returns NaN for division by zero', () => {
    expect(ohmsLaw.current(20, 0)).toBeNaN();
    expect(ohmsLaw.resistance(20, 0)).toBeNaN();
  });
});

describe('power', () => {
  it('calculates power from voltage and current', () => {
    expect(power.fromVI(12, 2)).toBe(24);
  });

  it('calculates power from current and resistance', () => {
    expect(power.fromIR(2, 10)).toBe(40);
  });

  it('calculates power from voltage and resistance', () => {
    expect(power.fromVR(20, 10)).toBe(40);
  });

  it('returns NaN for zero resistance', () => {
    expect(power.fromVR(20, 0)).toBeNaN();
  });
});

describe('rlc', () => {
  it('calculates resonant frequency', () => {
    // f = 1 / (2π√LC) with L=10µH and C=100pF
    const L = 10e-6; // 10 µH
    const C = 100e-12; // 100 pF
    const f = rlc.resonantFrequency(L, C);
    expect(f).toBeCloseTo(5.033e6, -4); // ~5 MHz
  });

  it('calculates inductive reactance', () => {
    // XL = 2πfL
    const f = 1e6; // 1 MHz
    const L = 10e-6; // 10 µH
    expect(rlc.inductiveReactance(f, L)).toBeCloseTo(62.83, 1);
  });

  it('calculates capacitive reactance', () => {
    // XC = 1 / (2πfC)
    const f = 1e6; // 1 MHz
    const C = 100e-12; // 100 pF
    expect(rlc.capacitiveReactance(f, C)).toBeCloseTo(1592, 0);
  });

  it('calculates impedance', () => {
    const z = rlc.impedance(50, 100, 50);
    expect(z).toBeCloseTo(70.71, 1);
  });

  it('calculates Q factor', () => {
    expect(rlc.qFactor(100, 10)).toBe(10);
  });

  it('returns NaN for invalid inputs', () => {
    expect(rlc.resonantFrequency(0, 100e-12)).toBeNaN();
    expect(rlc.resonantFrequency(10e-6, 0)).toBeNaN();
    expect(rlc.capacitiveReactance(0, 100e-12)).toBeNaN();
  });
});

describe('vswr', () => {
  it('calculates VSWR from reflection coefficient', () => {
    expect(vswr.fromGamma(0)).toBe(1);
    expect(vswr.fromGamma(0.5)).toBe(3);
    expect(vswr.fromGamma(1)).toBe(Infinity);
  });

  it('calculates reflection coefficient from VSWR', () => {
    expect(vswr.toGamma(1)).toBe(0);
    expect(vswr.toGamma(3)).toBeCloseTo(0.5);
  });

  it('calculates VSWR from power', () => {
    expect(vswr.fromPower(100, 0)).toBe(1);
    expect(vswr.fromPower(100, 11.11)).toBeCloseTo(2, 0);
  });

  it('calculates return loss', () => {
    expect(vswr.returnLoss(0.5)).toBeCloseTo(6.02, 1);
    expect(vswr.returnLoss(0)).toBe(Infinity);
  });

  it('calculates mismatch loss', () => {
    // Note: mismatchLoss(0) returns -0 due to -10 * log10(1) = -0
    expect(vswr.mismatchLoss(0)).toBeCloseTo(0);
    expect(vswr.mismatchLoss(0.5)).toBeCloseTo(1.25, 1);
  });
});

describe('gain', () => {
  it('converts power ratio to dB', () => {
    expect(gain.powerToDB(1, 10)).toBeCloseTo(10, 1);
    expect(gain.powerToDB(1, 100)).toBeCloseTo(20, 1);
    expect(gain.powerToDB(1, 2)).toBeCloseTo(3, 0);
  });

  it('converts dB to power ratio', () => {
    expect(gain.dbToPowerRatio(10)).toBeCloseTo(10, 1);
    expect(gain.dbToPowerRatio(20)).toBeCloseTo(100, 1);
    expect(gain.dbToPowerRatio(3)).toBeCloseTo(2, 0);
  });

  it('converts voltage ratio to dB', () => {
    expect(gain.voltageToDB(1, 10)).toBeCloseTo(20, 1);
    expect(gain.voltageToDB(1, 100)).toBeCloseTo(40, 1);
  });

  it('adds dB values', () => {
    expect(gain.addDB(3, 3)).toBe(6);
    expect(gain.addDB(10, 20, -5)).toBe(25);
  });

  it('calculates power output', () => {
    expect(gain.powerOutput(1, 10)).toBeCloseTo(10, 1);
    expect(gain.powerOutput(10, 3)).toBeCloseTo(20, 0);
  });
});

describe('transformer', () => {
  it('calculates turns ratio from voltage', () => {
    expect(transformer.turnsRatioFromVoltage(120, 12)).toBeCloseTo(0.1);
    expect(transformer.turnsRatioFromVoltage(120, 240)).toBeCloseTo(2);
  });

  it('calculates turns ratio from turn counts', () => {
    expect(transformer.turnsRatio(100, 10)).toBe(0.1);
    expect(transformer.turnsRatio(100, 200)).toBe(2);
  });

  it('calculates secondary voltage', () => {
    expect(transformer.secondaryVoltage(120, 0.1)).toBe(12);
    expect(transformer.secondaryVoltage(120, 2)).toBe(240);
  });

  it('calculates impedance transformation', () => {
    expect(transformer.secondaryImpedance(50, 2)).toBe(200);
    expect(transformer.secondaryImpedance(50, 0.5)).toBe(12.5);
  });

  it('returns NaN for zero primary', () => {
    expect(transformer.turnsRatioFromVoltage(0, 12)).toBeNaN();
    expect(transformer.turnsRatio(0, 10)).toBeNaN();
  });
});

describe('wavelength', () => {
  it('calculates wavelength from frequency', () => {
    // 300 MHz should give ~1m wavelength
    const lambda = wavelength.fromFrequency(300e6);
    expect(lambda).toBeCloseTo(1, 0);
  });

  it('calculates frequency from wavelength', () => {
    const f = wavelength.toFrequency(1);
    expect(f).toBeCloseTo(300e6, -6);
  });

  it('has correct speed of light constant', () => {
    expect(wavelength.SPEED_OF_LIGHT).toBe(299792458);
  });

  it('calculates half-wave dipole and quarter-wave lengths', () => {
    // at 14.15 MHz, half wave is approx 10.05m with k=0.95
    const half = wavelength.halfWaveDipole(14.15e6, 0.95);
    expect(half).toBeCloseTo(10.06, 1);

    const quarter = wavelength.quarterWave(14.15e6, 0.95);
    expect(quarter).toBeCloseTo(5.03, 1);
  });

  it('calculates frequency from dipole length', () => {
    const f = wavelength.frequencyFromDipole(10.063, 0.95);
    expect(f).toBeCloseTo(14.15e6, -4);
  });

  it('returns NaN for invalid inputs', () => {
    expect(wavelength.fromFrequency(0)).toBeNaN();
    expect(wavelength.toFrequency(0)).toBeNaN();
    expect(wavelength.halfWaveDipole(0)).toBeNaN();
  });
});

describe('reactance', () => {
  it('calculates inductive reactance', () => {
    // XL = 2 * pi * f * L
    const xl = reactance.inductive(1e6, 10e-6);
    expect(xl).toBeCloseTo(62.83, 1);
  });

  it('calculates capacitive reactance', () => {
    // XC = 1 / (2 * pi * f * C)
    const xc = reactance.capacitive(1e6, 100e-12);
    expect(xc).toBeCloseTo(1591.55, 1);
  });

  it('calculates inductance and capacitance from reactance', () => {
    const l = reactance.inductanceFromXL(1e6, 62.8318);
    expect(l).toBeCloseTo(10e-6, 7);

    const c = reactance.capacitanceFromXC(1e6, 1591.55);
    expect(c).toBeCloseTo(100e-12, 13);
  });

  it('calculates frequency from reactance', () => {
    const fFromL = reactance.frequencyFromL(10e-6, 62.831853);
    expect(fFromL).toBeCloseTo(1e6, -2);

    const fFromC = reactance.frequencyFromC(100e-12, 1591.549);
    expect(fFromC).toBeCloseTo(1e6, -2);
  });
});

describe('qFactor', () => {
  it('calculates Q factor from resonant frequency and bandwidth', () => {
    const q = qFactor.fromBandwidth(7e6, 140e3);
    expect(q).toBe(50);
  });

  it('calculates bandwidth from resonant frequency and Q factor', () => {
    const bw = qFactor.bandwidth(7e6, 50);
    expect(bw).toBe(140e3);
  });

  it('calculates resonant frequency from Q factor and bandwidth', () => {
    const f0 = qFactor.resonantFrequency(50, 140e3);
    expect(f0).toBe(7e6);
  });

  it('calculates cutoff frequencies', () => {
    const { low, high } = qFactor.cutoffFrequencies(7e6, 140e3);
    expect(low).toBe(6.93e6);
    expect(high).toBe(7.07e6);
  });
});

