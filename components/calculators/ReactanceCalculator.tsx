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
import { reactance } from "@/lib/utils/electrical";
import {
  UNIT_GROUPS,
  parseValue,
  convertToBase,
  findBestUnit,
  formatValue,
} from "@/lib/utils";
import type { CalculatorInstanceProps } from "@/lib/types";

type Mode = "inductive" | "capacitive";

const ReactanceCalculator: React.FC<CalculatorInstanceProps> = ({
  instanceId,
  initialPosition,
  zIndex,
  onClose,
  onFocus,
}) => {
  const t = useTranslations("Calculators.reactance");
  const tc = useTranslations("Calculators.common");

  const [mode, setMode] = React.useState<Mode>("inductive");
  const [frequency, setFrequency] = React.useState("");
  const [frequencyUnit, setFrequencyUnit] = React.useState("MHz");
  const [inductance, setInductance] = React.useState("");
  const [inductanceUnit, setInductanceUnit] = React.useState("µH");
  const [capacitance, setCapacitance] = React.useState("");
  const [capacitanceUnit, setCapacitanceUnit] = React.useState("pF");
  const [reactanceVal, setReactanceVal] = React.useState("");
  const [reactanceUnit, setReactanceUnit] = React.useState("Ω");

  const [result, setResult] = React.useState("");
  const [message, setMessage] = React.useState("");

  React.useEffect(() => {
    setMessage(t("promptTwoFields"));
  }, [t]);

  const reset = () => {
    setFrequency("");
    setInductance("");
    setCapacitance("");
    setReactanceVal("");
    setResult("");
    setMessage(t("promptTwoFields"));
  };

  const calculate = () => {
    const hasFreq = frequency.trim().length > 0;
    const hasComponent = mode === "inductive" ? inductance.trim().length > 0 : capacitance.trim().length > 0;
    const hasReactance = reactanceVal.trim().length > 0;

    const count = Number(hasFreq) + Number(hasComponent) + Number(hasReactance);

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
    const compVal = parseValue(mode === "inductive" ? inductance : capacitance);
    const xVal = parseValue(reactanceVal);

    if ((hasFreq && (Number.isNaN(fVal) || fVal <= 0)) ||
        (hasComponent && (Number.isNaN(compVal) || compVal <= 0)) ||
        (hasReactance && (Number.isNaN(xVal) || xVal <= 0))) {
      setMessage(t("positiveValuesOnly"));
      setResult("");
      return;
    }

    if (mode === "inductive") {
      const fBase = hasFreq ? convertToBase(fVal, frequencyUnit) : 0;
      const lBase = hasComponent ? convertToBase(compVal, inductanceUnit) : 0;
      const xBase = hasReactance ? convertToBase(xVal, reactanceUnit) : 0;

      if (!hasReactance) {
        const xl = reactance.inductive(fBase, lBase);
        const { value: dispVal, unit: dispUnit } = findBestUnit(xl, UNIT_GROUPS.resistance);
        setResult(`XL = ${formatValue(dispVal)} ${dispUnit}`);
        setReactanceVal(formatValue(dispVal));
        setReactanceUnit(dispUnit);
        setMessage(t("computedXL", { value: `${formatValue(dispVal)} ${dispUnit}` }));
      } else if (!hasComponent) {
        const l = reactance.inductanceFromXL(fBase, xBase);
        const { value: dispVal, unit: dispUnit } = findBestUnit(l, UNIT_GROUPS.inductance);
        setResult(`L = ${formatValue(dispVal)} ${dispUnit}`);
        setInductance(formatValue(dispVal));
        setInductanceUnit(dispUnit);
        setMessage(t("computedL", { value: `${formatValue(dispVal)} ${dispUnit}` }));
      } else if (!hasFreq) {
        const f = reactance.frequencyFromL(lBase, xBase);
        const { value: dispVal, unit: dispUnit } = findBestUnit(f, UNIT_GROUPS.frequency);
        setResult(`f = ${formatValue(dispVal)} ${dispUnit}`);
        setFrequency(formatValue(dispVal));
        setFrequencyUnit(dispUnit);
        setMessage(t("computedF", { value: `${formatValue(dispVal)} ${dispUnit}` }));
      }
    } else {
      const fBase = hasFreq ? convertToBase(fVal, frequencyUnit) : 0;
      const cBase = hasComponent ? convertToBase(compVal, capacitanceUnit) : 0;
      const xBase = hasReactance ? convertToBase(xVal, reactanceUnit) : 0;

      if (!hasReactance) {
        const xc = reactance.capacitive(fBase, cBase);
        const { value: dispVal, unit: dispUnit } = findBestUnit(xc, UNIT_GROUPS.resistance);
        setResult(`XC = ${formatValue(dispVal)} ${dispUnit}`);
        setReactanceVal(formatValue(dispVal));
        setReactanceUnit(dispUnit);
        setMessage(t("computedXC", { value: `${formatValue(dispVal)} ${dispUnit}` }));
      } else if (!hasComponent) {
        const c = reactance.capacitanceFromXC(fBase, xBase);
        const { value: dispVal, unit: dispUnit } = findBestUnit(c, UNIT_GROUPS.capacitance);
        setResult(`C = ${formatValue(dispVal)} ${dispUnit}`);
        setCapacitance(formatValue(dispVal));
        setCapacitanceUnit(dispUnit);
        setMessage(t("computedC", { value: `${formatValue(dispVal)} ${dispUnit}` }));
      } else if (!hasFreq) {
        const f = reactance.frequencyFromC(cBase, xBase);
        const { value: dispVal, unit: dispUnit } = findBestUnit(f, UNIT_GROUPS.frequency);
        setResult(`f = ${formatValue(dispVal)} ${dispUnit}`);
        setFrequency(formatValue(dispVal));
        setFrequencyUnit(dispUnit);
        setMessage(t("computedF", { value: `${formatValue(dispVal)} ${dispUnit}` }));
      }
    }
  };

  const getFormula = (): string => {
    return mode === "inductive" ? "XL = 2π × f × L" : "XC = 1 / (2π × f × C)";
  };

  return (
    <CalculatorWindow
      title={t("title")}
      color="indigo"
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
              setMode("inductive");
              setResult("");
              setMessage(t("promptTwoFields"));
            }}
            className={`flex-1 rounded px-3 py-1 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              mode === "inductive"
                ? "bg-indigo-600 text-white"
                : "border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            {t("inductive")}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("capacitive");
              setResult("");
              setMessage(t("promptTwoFields"));
            }}
            className={`flex-1 rounded px-3 py-1 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              mode === "capacitive"
                ? "bg-indigo-600 text-white"
                : "border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            {t("capacitive")}
          </button>
        </div>
      </div>

      <CalculatorInput
        id={`${instanceId}-f`}
        label={t("frequency")}
        value={frequency}
        onChange={setFrequency}
        placeholder="e.g. 7.1"
        units={UNIT_GROUPS.frequency}
        selectedUnit={frequencyUnit}
        onUnitChange={setFrequencyUnit}
        color="indigo"
      />

      {mode === "inductive" ? (
        <CalculatorInput
          id={`${instanceId}-l`}
          label={t("inductance")}
          value={inductance}
          onChange={setInductance}
          placeholder="e.g. 10"
          units={UNIT_GROUPS.inductance}
          selectedUnit={inductanceUnit}
          onUnitChange={setInductanceUnit}
          color="indigo"
        />
      ) : (
        <CalculatorInput
          id={`${instanceId}-c`}
          label={t("capacitance")}
          value={capacitance}
          onChange={setCapacitance}
          placeholder="e.g. 100"
          units={UNIT_GROUPS.capacitance}
          selectedUnit={capacitanceUnit}
          onUnitChange={setCapacitanceUnit}
          color="indigo"
        />
      )}

      <CalculatorInput
        id={`${instanceId}-x`}
        label={mode === "inductive" ? t("inductiveReactance") : t("capacitiveReactance")}
        value={reactanceVal}
        onChange={setReactanceVal}
        placeholder="e.g. 446"
        units={UNIT_GROUPS.resistance}
        selectedUnit={reactanceUnit}
        onUnitChange={setReactanceUnit}
        color="indigo"
      />

      {result && (
        <div className="rounded bg-indigo-50 dark:bg-indigo-950/40 p-2 text-center">
          <div className="text-xs font-medium text-slate-600 dark:text-slate-400">{tc("result")}</div>
          <div className="text-lg font-bold text-indigo-700 dark:text-indigo-300">{result}</div>
        </div>
      )}

      <CalculatorButtons
        onCalculate={calculate}
        onReset={reset}
        color="indigo"
      />
      <CalculatorResult value={message} color="indigo" formula={getFormula()} />
    </CalculatorWindow>
  );
};

// Register this calculator with the registry
registerCalculatorComponent("REACTANCE", ReactanceCalculator);

export default ReactanceCalculator;
