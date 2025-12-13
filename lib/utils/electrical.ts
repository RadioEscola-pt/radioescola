/**
 * Electrical calculation formulas for ham radio
 * All functions expect SI base units (V, A, Ω, F, H, Hz, W)
 */

/** Ohm's Law calculations: V = I × R */
export const ohmsLaw = {
  /** Calculate voltage: V = I × R */
  voltage: (current: number, resistance: number): number => current * resistance,

  /** Calculate current: I = V / R */
  current: (voltage: number, resistance: number): number => {
    if (resistance === 0) return NaN;
    return voltage / resistance;
  },

  /** Calculate resistance: R = V / I */
  resistance: (voltage: number, current: number): number => {
    if (current === 0) return NaN;
    return voltage / current;
  },
};

/** Power calculations: P = V × I = I²R = V²/R */
export const power = {
  /** Power from voltage and current: P = V × I */
  fromVI: (voltage: number, current: number): number => voltage * current,

  /** Power from current and resistance: P = I²R */
  fromIR: (current: number, resistance: number): number =>
    Math.pow(current, 2) * resistance,

  /** Power from voltage and resistance: P = V²/R */
  fromVR: (voltage: number, resistance: number): number => {
    if (resistance === 0) return NaN;
    return Math.pow(voltage, 2) / resistance;
  },
};

/** RLC Circuit calculations */
export const rlc = {
  /** Resonant frequency: f = 1 / (2π√LC) */
  resonantFrequency: (inductance: number, capacitance: number): number => {
    if (inductance <= 0 || capacitance <= 0) return NaN;
    return 1 / (2 * Math.PI * Math.sqrt(inductance * capacitance));
  },

  /** Inductance from resonant frequency and capacitance: L = 1 / (4π²f²C) */
  inductanceFromResonance: (frequency: number, capacitance: number): number => {
    if (frequency <= 0 || capacitance <= 0) return NaN;
    return 1 / (4 * Math.pow(Math.PI, 2) * Math.pow(frequency, 2) * capacitance);
  },

  /** Capacitance from resonant frequency and inductance: C = 1 / (4π²f²L) */
  capacitanceFromResonance: (frequency: number, inductance: number): number => {
    if (frequency <= 0 || inductance <= 0) return NaN;
    return 1 / (4 * Math.pow(Math.PI, 2) * Math.pow(frequency, 2) * inductance);
  },

  /** Inductive reactance: XL = 2πfL */
  inductiveReactance: (frequency: number, inductance: number): number =>
    2 * Math.PI * frequency * inductance,

  /** Capacitive reactance: XC = 1 / (2πfC) */
  capacitiveReactance: (frequency: number, capacitance: number): number => {
    if (frequency === 0 || capacitance === 0) return NaN;
    return 1 / (2 * Math.PI * frequency * capacitance);
  },

  /** Impedance: Z = √(R² + (XL - XC)²) */
  impedance: (resistance: number, xl: number, xc: number): number =>
    Math.sqrt(Math.pow(resistance, 2) + Math.pow(xl - xc, 2)),

  /** Phase angle: φ = arctan((XL - XC) / R) in degrees */
  phaseAngle: (resistance: number, xl: number, xc: number): number => {
    if (resistance === 0) return xl > xc ? 90 : xl < xc ? -90 : 0;
    return (Math.atan((xl - xc) / resistance) * 180) / Math.PI;
  },

  /** Q factor at resonance: Q = XL / R = 1 / (R × √(C/L)) */
  qFactor: (xl: number, resistance: number): number => {
    if (resistance === 0) return NaN;
    return xl / resistance;
  },

  /** Bandwidth: BW = f₀ / Q */
  bandwidth: (resonantFreq: number, qFactor: number): number => {
    if (qFactor === 0) return NaN;
    return resonantFreq / qFactor;
  },
};

/** VSWR (Voltage Standing Wave Ratio) calculations */
export const vswr = {
  /** VSWR from reflection coefficient: VSWR = (1 + |Γ|) / (1 - |Γ|) */
  fromGamma: (gamma: number): number => {
    const absGamma = Math.abs(gamma);
    if (absGamma >= 1) return Infinity;
    return (1 + absGamma) / (1 - absGamma);
  },

  /** Reflection coefficient from VSWR: Γ = (VSWR - 1) / (VSWR + 1) */
  toGamma: (swr: number): number => {
    if (swr < 1) return NaN;
    return (swr - 1) / (swr + 1);
  },

  /** VSWR from forward and reflected power */
  fromPower: (forwardPower: number, reflectedPower: number): number => {
    if (forwardPower <= 0 || reflectedPower < 0) return NaN;
    if (reflectedPower > forwardPower) return NaN;
    const gamma = Math.sqrt(reflectedPower / forwardPower);
    return vswr.fromGamma(gamma);
  },

  /** Reflected power from forward power and VSWR */
  reflectedPower: (forwardPower: number, swr: number): number => {
    const gamma = vswr.toGamma(swr);
    return forwardPower * Math.pow(gamma, 2);
  },

  /** Return loss in dB: RL = -20 log₁₀(|Γ|) */
  returnLoss: (gamma: number): number => {
    const absGamma = Math.abs(gamma);
    if (absGamma === 0) return Infinity;
    return -20 * Math.log10(absGamma);
  },

  /** Return loss from VSWR */
  returnLossFromSWR: (swr: number): number => {
    return vswr.returnLoss(vswr.toGamma(swr));
  },

  /** Mismatch loss in dB: ML = -10 log₁₀(1 - Γ²) */
  mismatchLoss: (gamma: number): number => {
    const gammaSquared = Math.pow(gamma, 2);
    if (gammaSquared >= 1) return Infinity;
    return -10 * Math.log10(1 - gammaSquared);
  },

  /** Mismatch loss from VSWR */
  mismatchLossFromSWR: (swr: number): number => {
    return vswr.mismatchLoss(vswr.toGamma(swr));
  },
};

/** Gain and decibel calculations */
export const gain = {
  /** Power ratio to dB: dB = 10 log₁₀(P2/P1) */
  powerToDB: (p1: number, p2: number): number => {
    if (p1 <= 0 || p2 <= 0) return NaN;
    return 10 * Math.log10(p2 / p1);
  },

  /** dB to power ratio: ratio = 10^(dB/10) */
  dbToPowerRatio: (db: number): number => Math.pow(10, db / 10),

  /** Voltage ratio to dB: dB = 20 log₁₀(V2/V1) */
  voltageToDB: (v1: number, v2: number): number => {
    if (v1 <= 0 || v2 <= 0) return NaN;
    return 20 * Math.log10(v2 / v1);
  },

  /** dB to voltage ratio: ratio = 10^(dB/20) */
  dbToVoltageRatio: (db: number): number => Math.pow(10, db / 20),

  /** Add dB values (for cascaded stages): total = dB1 + dB2 + ... */
  addDB: (...dbs: number[]): number => dbs.reduce((sum, db) => sum + db, 0),

  /** Multiply power values and convert to dB */
  multiplyPowerToDB: (p1: number, p2: number): number => {
    return gain.powerToDB(1, p1 * p2);
  },

  /** Power output from input power and gain in dB */
  powerOutput: (inputPower: number, gainDB: number): number => {
    return inputPower * gain.dbToPowerRatio(gainDB);
  },
};

/** Transformer calculations */
export const transformer = {
  /** Turns ratio from voltages: n = Vs / Vp */
  turnsRatioFromVoltage: (vPrimary: number, vSecondary: number): number => {
    if (vPrimary === 0) return NaN;
    return vSecondary / vPrimary;
  },

  /** Turns ratio from turn counts: n = Ns / Np */
  turnsRatio: (nPrimary: number, nSecondary: number): number => {
    if (nPrimary === 0) return NaN;
    return nSecondary / nPrimary;
  },

  /** Secondary voltage: Vs = Vp × n */
  secondaryVoltage: (vPrimary: number, turnsRatio: number): number =>
    vPrimary * turnsRatio,

  /** Primary voltage: Vp = Vs / n */
  primaryVoltage: (vSecondary: number, turnsRatio: number): number => {
    if (turnsRatio === 0) return NaN;
    return vSecondary / turnsRatio;
  },

  /** Secondary current (ideal): Is = Ip / n */
  secondaryCurrent: (iPrimary: number, turnsRatio: number): number => {
    if (turnsRatio === 0) return NaN;
    return iPrimary / turnsRatio;
  },

  /** Primary current (ideal): Ip = Is × n */
  primaryCurrent: (iSecondary: number, turnsRatio: number): number =>
    iSecondary * turnsRatio,

  /** Impedance transformation: Zs = Zp × n² */
  secondaryImpedance: (zPrimary: number, turnsRatio: number): number =>
    zPrimary * Math.pow(turnsRatio, 2),

  /** Impedance transformation (reverse): Zp = Zs / n² */
  primaryImpedance: (zSecondary: number, turnsRatio: number): number => {
    if (turnsRatio === 0) return NaN;
    return zSecondary / Math.pow(turnsRatio, 2);
  },

  /** Number of secondary turns: Ns = Np × n */
  secondaryTurns: (nPrimary: number, turnsRatio: number): number =>
    Math.round(nPrimary * turnsRatio),

  /** Number of primary turns: Np = Ns / n */
  primaryTurns: (nSecondary: number, turnsRatio: number): number => {
    if (turnsRatio === 0) return NaN;
    return Math.round(nSecondary / turnsRatio);
  },
};

/** Wavelength and frequency relationship */
export const wavelength = {
  /** Speed of light in m/s */
  SPEED_OF_LIGHT: 299792458,

  /** Wavelength from frequency: λ = c / f */
  fromFrequency: (frequency: number): number => {
    if (frequency <= 0) return NaN;
    return wavelength.SPEED_OF_LIGHT / frequency;
  },

  /** Frequency from wavelength: f = c / λ */
  toFrequency: (lambda: number): number => {
    if (lambda <= 0) return NaN;
    return wavelength.SPEED_OF_LIGHT / lambda;
  },
};
