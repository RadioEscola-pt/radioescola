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
import { rlc } from "@/lib/utils";
import {
  UNIT_GROUPS,
  parseValue,
  convertToBase,
  findBestUnit,
  formatValue,
} from "@/lib/utils";
import type { CalculatorInstanceProps } from "@/lib/types";

type Mode = "resonance" | "impedance";

const RLCCalculator: React.FC<CalculatorInstanceProps> = ({
  instanceId,
  initialPosition,
  zIndex,
  onClose,
  onFocus,
}) => {
  const t = useTranslations("Calculators.rlc");
  const tc = useTranslations("Calculators.common");
  const [mode, setMode] = React.useState<Mode>("resonance");
  const [resistance, setResistance] = React.useState("");
  const [resistanceUnit, setResistanceUnit] = React.useState("Ω");
  const [inductance, setInductance] = React.useState("");
  const [inductanceUnit, setInductanceUnit] = React.useState("µH");
  const [capacitance, setCapacitance] = React.useState("");
  const [capacitanceUnit, setCapacitanceUnit] = React.useState("pF");
  const [frequency, setFrequency] = React.useState("");
  const [frequencyUnit, setFrequencyUnit] = React.useState("MHz");
  const [result, setResult] = React.useState("");
  const [message, setMessage] = React.useState("");

  React.useEffect(() => {
    setMessage(t("enterLCResonance"));
  }, [t]);

  const reset = () => {
    setResistance("");
    setInductance("");
    setCapacitance("");
    setFrequency("");
    setResult("");
    setMessage(
      mode === "resonance" ? t("enterLCResonance") : t("enterRLCImpedance")
    );
  };

  const calculate = () => {
    if (mode === "resonance") {
      const L = parseValue(inductance);
      const C = parseValue(capacitance);

      if (Number.isNaN(L) || Number.isNaN(C) || L <= 0 || C <= 0) {
        setMessage(t("positiveLC"));
        setResult("");
        return;
      }

      const LBase = convertToBase(L, inductanceUnit);
      const CBase = convertToBase(C, capacitanceUnit);
      const f0 = rlc.resonantFrequency(LBase, CBase);

      const { value: fDisplay, unit: fUnit } = findBestUnit(f0, UNIT_GROUPS.frequency);
      setResult(`${formatValue(fDisplay)} ${fUnit}`);
      setMessage(t("resonantFrequency", { value: `${formatValue(fDisplay)} ${fUnit}` }));
    } else {
      const R = parseValue(resistance);
      const L = parseValue(inductance);
      const C = parseValue(capacitance);
      const f = parseValue(frequency);

      if (Number.isNaN(R) || Number.isNaN(L) || Number.isNaN(C) || Number.isNaN(f)) {
        setMessage(t("validValues"));
        setResult("");
        return;
      }
      if (R < 0 || L <= 0 || C <= 0 || f <= 0) {
        setMessage(t("positiveValues"));
        setResult("");
        return;
      }

      const RBase = convertToBase(R, resistanceUnit);
      const LBase = convertToBase(L, inductanceUnit);
      const CBase = convertToBase(C, capacitanceUnit);
      const fBase = convertToBase(f, frequencyUnit);

      const xl = rlc.inductiveReactance(fBase, LBase);
      const xc = rlc.capacitiveReactance(fBase, CBase);
      const z = rlc.impedance(RBase, xl, xc);
      const phase = rlc.phaseAngle(RBase, xl, xc);
      const q = RBase > 0 ? rlc.qFactor(xl, RBase) : Infinity;

      const { value: zDisplay, unit: zUnit } = findBestUnit(z, UNIT_GROUPS.resistance);
      const { value: xlDisplay, unit: xlUnit } = findBestUnit(xl, UNIT_GROUPS.resistance);
      const { value: xcDisplay, unit: xcUnit } = findBestUnit(xc, UNIT_GROUPS.resistance);

      setResult(`Z = ${formatValue(zDisplay)} ${zUnit}`);
      setMessage(
        `XL = ${formatValue(xlDisplay)} ${xlUnit}, XC = ${formatValue(xcDisplay)} ${xcUnit}, ` +
        `Phase = ${formatValue(phase)}°, Q = ${Number.isFinite(q) ? formatValue(q) : "∞"}`
      );
    }
  };

  const getFormula = (): string => {
    if (mode === "resonance") {
      return "f₀ = 1 / (2π√LC)";
    }
    return "Z = √(R² + (XL - XC)²)";
  };

  return (
    <CalculatorWindow
      title={t("title")}
      color="purple"
      width="w-80"
      initialPosition={initialPosition}
      zIndex={zIndex}
      onClose={onClose}
      onFocus={onFocus}
    >
      <div>
        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-600">
          {tc("mode")}
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setMode("resonance");
              setMessage(t("enterLCResonance"));
            }}
            className={`flex-1 rounded px-3 py-1 transition focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              mode === "resonance"
                ? "bg-purple-600 text-white"
                : "border border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            {t("resonance")}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("impedance");
              setMessage(t("enterRLCImpedance"));
            }}
            className={`flex-1 rounded px-3 py-1 transition focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              mode === "impedance"
                ? "bg-purple-600 text-white"
                : "border border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            {t("impedance")}
          </button>
        </div>
      </div>

      {mode === "impedance" && (
        <CalculatorInput
          id={`${instanceId}-r`}
          label={t("resistance")}
          value={resistance}
          onChange={setResistance}
          placeholder="e.g. 50"
          units={UNIT_GROUPS.resistance}
          selectedUnit={resistanceUnit}
          onUnitChange={setResistanceUnit}
          color="purple"
        />
      )}

      <CalculatorInput
        id={`${instanceId}-l`}
        label={t("inductance")}
        value={inductance}
        onChange={setInductance}
        placeholder="e.g. 10"
        units={UNIT_GROUPS.inductance}
        selectedUnit={inductanceUnit}
        onUnitChange={setInductanceUnit}
        color="purple"
      />

      <CalculatorInput
        id={`${instanceId}-c`}
        label={t("capacitance")}
        value={capacitance}
        onChange={setCapacitance}
        placeholder="e.g. 100"
        units={UNIT_GROUPS.capacitance}
        selectedUnit={capacitanceUnit}
        onUnitChange={setCapacitanceUnit}
        color="purple"
      />

      {mode === "impedance" && (
        <CalculatorInput
          id={`${instanceId}-f`}
          label={t("frequency")}
          value={frequency}
          onChange={setFrequency}
          placeholder="e.g. 7"
          units={UNIT_GROUPS.frequency}
          selectedUnit={frequencyUnit}
          onUnitChange={setFrequencyUnit}
          color="purple"
        />
      )}

      {result && (
        <div className="rounded bg-purple-50 p-2 text-center">
          <div className="text-xs font-medium text-gray-600">{tc("result")}</div>
          <div className="text-lg font-bold text-purple-700">{result}</div>
        </div>
      )}

      <CalculatorButtons
        onCalculate={calculate}
        onReset={reset}
        color="purple"
      />
      <CalculatorResult value={message} color="purple" formula={getFormula()} />
    </CalculatorWindow>
  );
};

// Register this calculator with the registry
registerCalculatorComponent("RLC", RLCCalculator);

export default RLCCalculator;
