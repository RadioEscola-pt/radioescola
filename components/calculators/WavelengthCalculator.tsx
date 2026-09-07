"use client";

import React from "react";
import { useTranslations } from "next-intl";
import {
  CalculatorWindow,
  CalculatorInput,
  CalculatorButtons,
  CalculatorModeSwitch,
  CalculatorResult,
} from "./base";
import { registerCalculatorComponent } from "@/lib/config";
import { Math as Tex } from "@/components/formulario/Math";
import { wavelength } from "@/lib/utils/electrical";
import {
  UNIT_GROUPS,
  parseValue,
  convertToBase,
  findBestUnit,
  formatValue,
} from "@/lib/utils";
import type { CalculatorInstanceProps } from "@/lib/types";

/**
 * The switch order, and the union.
 *
 * A mode is *named* for the direction the solver runs and *labelled* for what
 * it produces, which are opposite ends of the same arrow: `fromFrequency`
 * yields a length, so it reads "Comprimento" on the switch. The two are kept as
 * separate fields rather than letting the state value double as its own
 * translation key, because that inversion is exactly the kind of thing that
 * looks like a bug six months from now.
 */
const MODES = [
  { value: "fromFrequency", labelKey: "modeLength" },
  { value: "fromLength", labelKey: "modeFrequency" },
] as const;
type Mode = (typeof MODES)[number]["value"];

/**
 * The antenna the length in the second mode belongs to. Unlike MODES the label
 * names the option itself, so the key can be the value's own translation key —
 * there is no direction to invert here.
 */
const ANTENNAS = [
  { value: "half", labelKey: "halfWaveDipole" },
  { value: "quarter", labelKey: "quarterWaveVertical" },
] as const;
type AntennaType = (typeof ANTENNAS)[number]["value"];

const WavelengthCalculator: React.FC<CalculatorInstanceProps> = ({
  instanceId,
  initialPosition,
  zIndex,
  onClose,
  onFocus,
}) => {
  const t = useTranslations("Calculators.wavelength");
  const tc = useTranslations("Calculators.common");

  const [mode, setMode] = React.useState<Mode>("fromFrequency");
  const [frequency, setFrequency] = React.useState("");
  const [frequencyUnit, setFrequencyUnit] = React.useState("MHz");
  const [length, setLength] = React.useState("");
  const [lengthUnit, setLengthUnit] = React.useState("m");
  const [velocityFactor, setVelocityFactor] = React.useState("0.95");
  const [antennaType, setAntennaType] = React.useState<AntennaType>("half");

  const [result, setResult] = React.useState("");
  const [message, setMessage] = React.useState("");

  // The displayed formula constant is 150 * k, so it must track the entered
  // velocity factor rather than stay pinned to the 0.95 default.
  const dipoleK = React.useMemo(() => {
    const k = parseValue(velocityFactor);
    return Number.isFinite(k) && k > 0 && k <= 1 ? k : null;
  }, [velocityFactor]);

  /**
   * The expression under the result, as maths rather than as a line of ASCII.
   *
   * It follows the mode, because the two modes do not share a formula: giving a
   * frequency solves for λ and the two antenna lengths, giving a length solves
   * back for f. Showing `λ = c / f` to somebody who is going the other way is
   * the kind of small lie that makes a study aid untrustworthy — and this one is
   * read beside `/aprender/formulario`, so it uses that page's notation:
   * `L_{λ/2}`, the constant over `f [MHz]`, the answer in metres.
   *
   * The two constants stay derived from the entered k (150k and 75k) instead of
   * being written out, so the line keeps agreeing with the numbers above it.
   */
  const formulaTex = React.useMemo(() => {
    if (mode === "fromFrequency") {
      const k = dipoleK ?? 0.95;
      return String.raw`\begin{aligned}
        \lambda &= \frac{c}{f} \\[2pt]
        L_{\lambda/2} &\approx \frac{${formatValue(150 * k, 2)}}{f\,[\mathrm{MHz}]}\ \mathrm{m} \\[2pt]
        L_{\lambda/4} &\approx \frac{${formatValue(75 * k, 2)}}{f\,[\mathrm{MHz}]}\ \mathrm{m}
      \end{aligned}`;
    }
    // A quarter-wave vertical is half of the dipole the solver works in, so the
    // length entered is doubled before inverting — which lands as a 4 here.
    const divisor = antennaType === "quarter" ? 4 : 2;
    return String.raw`\begin{aligned}
      f &= \frac{c\,k}{${divisor}L} \\[2pt]
      \lambda &= \frac{c}{f}
    \end{aligned}`;
  }, [mode, antennaType, dipoleK]);

  React.useEffect(() => {
    setMessage(mode === "fromFrequency" ? t("promptEnterFreq") : t("promptEnterLength"));
  }, [t, mode]);

  // Changing mode clears the answer rather than leaving the previous mode's
  // number sitting under the new fields, where it reads as a result for them.
  const switchMode = (next: Mode) => {
    setMode(next);
    setResult("");
    setMessage(next === "fromFrequency" ? t("promptEnterFreq") : t("promptEnterLength"));
  };

  // A quarter-wave vertical and a dipole of the same length resonate an octave
  // apart, so the previous answer is not merely stale after this switch — it is
  // wrong by a factor of two. Same clearing rule as switchMode.
  const switchAntennaType = (next: AntennaType) => {
    setAntennaType(next);
    setResult("");
    setMessage(t("promptEnterLength"));
  };

  const reset = () => {
    setFrequency("");
    setLength("");
    setVelocityFactor("0.95");
    setResult("");
    setMessage(mode === "fromFrequency" ? t("promptEnterFreq") : t("promptEnterLength"));
  };

  const calculate = () => {
    const k = parseValue(velocityFactor);
    if (!Number.isFinite(k) || k <= 0 || k > 1) {
      setMessage(t("invalidVelocityFactor"));
      setResult("");
      return;
    }
    const validK = k;

    if (mode === "fromFrequency") {
      const f = parseValue(frequency);
      if (Number.isNaN(f) || f <= 0) {
        setMessage(t("positiveFreqOnly"));
        setResult("");
        return;
      }

      const fBase = convertToBase(f, frequencyUnit);
      const lambda = wavelength.fromFrequency(fBase);
      const halfWave = wavelength.halfWaveDipole(fBase, validK);
      const quarterWave = wavelength.quarterWave(fBase, validK);

      const lambdaBest = findBestUnit(lambda, UNIT_GROUPS.length);
      const halfBest = findBestUnit(halfWave, UNIT_GROUPS.length);
      const quarterBest = findBestUnit(quarterWave, UNIT_GROUPS.length);

      setResult(`λ = ${formatValue(lambdaBest.value, 2)} ${lambdaBest.unit}`);
      setMessage(
        t("computedDimensions", {
          lambda: `${formatValue(lambdaBest.value, 2)} ${lambdaBest.unit}`,
          dipole: `${formatValue(halfBest.value, 3)} ${halfBest.unit}`,
          quarter: `${formatValue(quarterBest.value, 3)} ${quarterBest.unit}`,
          arm: `${formatValue(quarterBest.value, 3)} ${quarterBest.unit}`,
        })
      );
    } else {
      const l = parseValue(length);
      if (Number.isNaN(l) || l <= 0) {
        setMessage(t("positiveLengthOnly"));
        setResult("");
        return;
      }

      const lBase = convertToBase(l, lengthUnit);
      const effectiveLength = antennaType === "quarter" ? lBase * 2 : lBase;
      const f = wavelength.frequencyFromDipole(effectiveLength, validK);
      const { value: dispF, unit: dispUnit } = findBestUnit(f, UNIT_GROUPS.frequency);

      setResult(`f = ${formatValue(dispF, 3)} ${dispUnit}`);
      const lambda = wavelength.fromFrequency(f);
      const lambdaBest = findBestUnit(lambda, UNIT_GROUPS.length);

      setMessage(
        t("computedFrequency", {
          freq: `${formatValue(dispF, 3)} ${dispUnit}`,
          lambda: `${formatValue(lambdaBest.value, 2)} ${lambdaBest.unit}`,
        })
      );
    }
  };

  return (
    <CalculatorWindow
      title={t("title")}
      color="teal"
      width="w-80"
      initialPosition={initialPosition}
      zIndex={zIndex}
      onClose={onClose}
      onFocus={onFocus}
    >
      <div>
        {/*
          "Calcular", not "Modo": the switch picks which quantity comes out, and
          naming the verb here lets each half be the one noun it produces. The
          word is the same as the button below on purpose — the control answers
          "what will Calcular give me?".
        */}
        <label
          id={`${instanceId}-mode`}
          className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          {t("modeLabel")}
        </label>
        <CalculatorModeSwitch
          labelId={`${instanceId}-mode`}
          color="teal"
          value={mode}
          onChange={switchMode}
          options={MODES.map(({ value, labelKey }) => ({ value, label: t(labelKey) }))}
        />
      </div>

      {mode === "fromFrequency" ? (
        <CalculatorInput
          id={`${instanceId}-f`}
          label={t("frequency")}
          value={frequency}
          onChange={setFrequency}
          placeholder="e.g. 14.150"
          units={UNIT_GROUPS.frequency}
          selectedUnit={frequencyUnit}
          onUnitChange={setFrequencyUnit}
          color="teal"
        />
      ) : (
        <>
          <CalculatorInput
            id={`${instanceId}-l`}
            label={t("antennaLength")}
            value={length}
            onChange={setLength}
            placeholder="e.g. 10.05"
            units={UNIT_GROUPS.length}
            selectedUnit={lengthUnit}
            onUnitChange={setLengthUnit}
            color="teal"
          />
          {/*
            Two options, and the one picked changes the divisor in the formula
            below as well as the answer — so it is the same kind of setting as
            the mode above and gets the same control. As a <select> the second
            option, and the fact that there was a choice at all, were both a tap
            away; on the track the pair is the visible reason the 2 becomes a 4.
          */}
          <div>
            <label
              id={`${instanceId}-antenna`}
              className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400"
            >
              {t("antennaType")}
            </label>
            <CalculatorModeSwitch
              labelId={`${instanceId}-antenna`}
              color="teal"
              value={antennaType}
              onChange={switchAntennaType}
              options={ANTENNAS.map(({ value, labelKey }) => ({ value, label: t(labelKey) }))}
            />
          </div>
        </>
      )}

      <CalculatorInput
        id={`${instanceId}-vf`}
        label={t("velocityFactor")}
        value={velocityFactor}
        onChange={setVelocityFactor}
        placeholder="0.95"
        color="teal"
      />

      {result && (
        <div className="rounded bg-teal-50 dark:bg-teal-950/40 p-2 text-center">
          <div className="text-xs font-medium text-slate-600 dark:text-slate-400">{tc("result")}</div>
          <div className="text-lg font-bold text-teal-700 dark:text-teal-300">{result}</div>
        </div>
      )}

      <CalculatorButtons
        onCalculate={calculate}
        onReset={reset}
        color="teal"
      />
      <CalculatorResult
        value={message}
        color="teal"
        formula={<Tex tex={formulaTex} display className="block" />}
      />
    </CalculatorWindow>
  );
};

// Register this calculator with the registry
registerCalculatorComponent("WAVELENGTH", WavelengthCalculator);

export default WavelengthCalculator;
