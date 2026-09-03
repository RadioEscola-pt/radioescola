"use client";

import React from "react";
import { useTranslations } from "next-intl";
import {
  CalculatorWindow,
  CalculatorInput,
  CalculatorButtons,
  CalculatorResult,
} from "./base";
import { registerCalculatorComponent } from "@/lib/config";
import { wavelength } from "@/lib/utils/electrical";
import {
  UNIT_GROUPS,
  parseValue,
  convertToBase,
  findBestUnit,
  formatValue,
} from "@/lib/utils";
import type { CalculatorInstanceProps } from "@/lib/types";

type Mode = "fromFrequency" | "fromLength";

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
  const [antennaType, setAntennaType] = React.useState<"half" | "quarter">("half");

  const [result, setResult] = React.useState("");
  const [message, setMessage] = React.useState("");

  // The displayed formula constant is 150 * k, so it must track the entered
  // velocity factor rather than stay pinned to the 0.95 default.
  const dipoleK = React.useMemo(() => {
    const k = parseValue(velocityFactor);
    return Number.isFinite(k) && k > 0 && k <= 1 ? k : null;
  }, [velocityFactor]);

  React.useEffect(() => {
    setMessage(mode === "fromFrequency" ? t("promptEnterFreq") : t("promptEnterLength"));
  }, [t, mode]);

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
        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {tc("mode")}
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setMode("fromFrequency");
              setResult("");
              setMessage(t("promptEnterFreq"));
            }}
            className={`flex-1 rounded px-3 py-1 transition focus:outline-none focus:ring-2 focus:ring-teal-500 ${
              mode === "fromFrequency"
                ? "bg-teal-600 text-white"
                : "border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            {t("fromFrequency")}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("fromLength");
              setResult("");
              setMessage(t("promptEnterLength"));
            }}
            className={`flex-1 rounded px-3 py-1 transition focus:outline-none focus:ring-2 focus:ring-teal-500 ${
              mode === "fromLength"
                ? "bg-teal-600 text-white"
                : "border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            {t("fromLength")}
          </button>
        </div>
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
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
              {t("antennaType")}
            </label>
            <select
              value={antennaType}
              onChange={(e) => setAntennaType(e.target.value as "half" | "quarter")}
              className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 focus:outline-none focus:ring focus:border-teal-500 focus:ring-teal-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
            >
              <option value="half">{t("halfWaveDipole")}</option>
              <option value="quarter">{t("quarterWaveVertical")}</option>
            </select>
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
        formula={`λ = c / f  |  L(λ/2) ≈ ${formatValue(150 * (dipoleK ?? 0.95), 2)} / f(MHz)`}
      />
    </CalculatorWindow>
  );
};

// Register this calculator with the registry
registerCalculatorComponent("WAVELENGTH", WavelengthCalculator);

export default WavelengthCalculator;
