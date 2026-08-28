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
import { qFactor } from "@/lib/utils/electrical";
import {
  UNIT_GROUPS,
  parseValue,
  convertToBase,
  findBestUnit,
  formatValue,
} from "@/lib/utils";
import type { CalculatorInstanceProps } from "@/lib/types";

const QFactorCalculator: React.FC<CalculatorInstanceProps> = ({
  instanceId,
  initialPosition,
  zIndex,
  onClose,
  onFocus,
}) => {
  const t = useTranslations("Calculators.qFactor");
  const tc = useTranslations("Calculators.common");

  const [frequency, setFrequency] = React.useState("");
  const [frequencyUnit, setFrequencyUnit] = React.useState("MHz");
  const [bandwidth, setBandwidth] = React.useState("");
  const [bandwidthUnit, setBandwidthUnit] = React.useState("kHz");
  const [qValue, setQValue] = React.useState("");

  const [result, setResult] = React.useState("");
  const [message, setMessage] = React.useState("");

  React.useEffect(() => {
    setMessage(t("promptTwoFields"));
  }, [t]);

  const reset = () => {
    setFrequency("");
    setBandwidth("");
    setQValue("");
    setResult("");
    setMessage(t("promptTwoFields"));
  };

  const calculate = () => {
    const hasFreq = frequency.trim().length > 0;
    const hasBw = bandwidth.trim().length > 0;
    const hasQ = qValue.trim().length > 0;

    const count = Number(hasFreq) + Number(hasBw) + Number(hasQ);

    if (count < 2) {
      setMessage(t("promptTwoFields"));
      setResult("");
      return;
    }

    if (count === 3) {
      setMessage(t("promptClearOneField"));
      setResult("");
      return;
    }

    const fVal = parseValue(frequency);
    const bwVal = parseValue(bandwidth);
    const qVal = parseValue(qValue);

    if ((hasFreq && (Number.isNaN(fVal) || fVal <= 0)) ||
        (hasBw && (Number.isNaN(bwVal) || bwVal <= 0)) ||
        (hasQ && (Number.isNaN(qVal) || qVal <= 0))) {
      setMessage(t("positiveValuesOnly"));
      setResult("");
      return;
    }

    const fBase = hasFreq ? convertToBase(fVal, frequencyUnit) : 0;
    const bwBase = hasBw ? convertToBase(bwVal, bandwidthUnit) : 0;

    if (!hasQ) {
      const computedQ = qFactor.fromBandwidth(fBase, bwBase);
      setResult(`Q = ${formatValue(computedQ, 2)}`);
      setQValue(formatValue(computedQ, 2));

      const { low, high } = qFactor.cutoffFrequencies(fBase, bwBase);
      const lowBest = findBestUnit(low, UNIT_GROUPS.frequency);
      const highBest = findBestUnit(high, UNIT_GROUPS.frequency);
      setMessage(
        t("computedQ", {
          q: formatValue(computedQ, 2),
          low: `${formatValue(lowBest.value)} ${lowBest.unit}`,
          high: `${formatValue(highBest.value)} ${highBest.unit}`,
        })
      );
    } else if (!hasBw) {
      const computedBw = qFactor.bandwidth(fBase, qVal);
      const { value: dispBw, unit: dispUnit } = findBestUnit(computedBw, UNIT_GROUPS.frequency);
      setResult(`BW = ${formatValue(dispBw)} ${dispUnit}`);
      setBandwidth(formatValue(dispBw));
      setBandwidthUnit(dispUnit);

      const { low, high } = qFactor.cutoffFrequencies(fBase, computedBw);
      const lowBest = findBestUnit(low, UNIT_GROUPS.frequency);
      const highBest = findBestUnit(high, UNIT_GROUPS.frequency);
      setMessage(
        t("computedBW", {
          bw: `${formatValue(dispBw)} ${dispUnit}`,
          low: `${formatValue(lowBest.value)} ${lowBest.unit}`,
          high: `${formatValue(highBest.value)} ${highBest.unit}`,
        })
      );
    } else if (!hasFreq) {
      const computedF0 = qFactor.resonantFrequency(qVal, bwBase);
      const { value: dispF0, unit: dispUnit } = findBestUnit(computedF0, UNIT_GROUPS.frequency);
      setResult(`f₀ = ${formatValue(dispF0)} ${dispUnit}`);
      setFrequency(formatValue(dispF0));
      setFrequencyUnit(dispUnit);

      const { low, high } = qFactor.cutoffFrequencies(computedF0, bwBase);
      const lowBest = findBestUnit(low, UNIT_GROUPS.frequency);
      const highBest = findBestUnit(high, UNIT_GROUPS.frequency);
      setMessage(
        t("computedF0", {
          f0: `${formatValue(dispF0)} ${dispUnit}`,
          low: `${formatValue(lowBest.value)} ${lowBest.unit}`,
          high: `${formatValue(highBest.value)} ${highBest.unit}`,
        })
      );
    }
  };

  return (
    <CalculatorWindow
      title={t("title")}
      color="amber"
      width="w-80"
      initialPosition={initialPosition}
      zIndex={zIndex}
      onClose={onClose}
      onFocus={onFocus}
    >
      <CalculatorInput
        id={`${instanceId}-f`}
        label={t("frequency")}
        value={frequency}
        onChange={setFrequency}
        placeholder="e.g. 7.1"
        units={UNIT_GROUPS.frequency}
        selectedUnit={frequencyUnit}
        onUnitChange={setFrequencyUnit}
        color="amber"
      />

      <CalculatorInput
        id={`${instanceId}-bw`}
        label={t("bandwidth")}
        value={bandwidth}
        onChange={setBandwidth}
        placeholder="e.g. 150"
        units={UNIT_GROUPS.frequency}
        selectedUnit={bandwidthUnit}
        onUnitChange={setBandwidthUnit}
        color="amber"
      />

      <CalculatorInput
        id={`${instanceId}-q`}
        label={t("qFactorLabel")}
        value={qValue}
        onChange={setQValue}
        placeholder="e.g. 47.3"
        color="amber"
      />

      {result && (
        <div className="rounded bg-amber-50 dark:bg-amber-950/40 p-2 text-center">
          <div className="text-xs font-medium text-slate-600 dark:text-slate-400">{tc("result")}</div>
          <div className="text-lg font-bold text-amber-700 dark:text-amber-300">{result}</div>
        </div>
      )}

      <CalculatorButtons
        onCalculate={calculate}
        onReset={reset}
        color="amber"
      />
      <CalculatorResult value={message} color="amber" formula="Q = f₀ / BW  (BW = f₀ / Q)" />
    </CalculatorWindow>
  );
};

// Register this calculator with the registry
registerCalculatorComponent("QFACTOR", QFactorCalculator);

export default QFactorCalculator;
