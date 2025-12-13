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
import { transformer } from "@/lib/utils";
import {
  UNIT_GROUPS,
  parseValue,
  convertToBase,
  convertFromBase,
  findBestUnit,
  formatValue,
} from "@/lib/utils";
import type { CalculatorInstanceProps } from "@/lib/types";

type Mode = "voltage" | "turns" | "impedance";

const TransformerCalculator: React.FC<CalculatorInstanceProps> = ({
  instanceId,
  initialPosition,
  zIndex,
  onClose,
  onFocus,
}) => {
  const t = useTranslations("Calculators.transformer");
  const tc = useTranslations("Calculators.common");
  const [mode, setMode] = React.useState<Mode>("voltage");

  // Voltage mode
  const [primaryVoltage, setPrimaryVoltage] = React.useState("");
  const [primaryVoltageUnit, setPrimaryVoltageUnit] = React.useState("V");
  const [secondaryVoltage, setSecondaryVoltage] = React.useState("");
  const [secondaryVoltageUnit, setSecondaryVoltageUnit] = React.useState("V");

  // Turns mode
  const [primaryTurns, setPrimaryTurns] = React.useState("");
  const [secondaryTurns, setSecondaryTurns] = React.useState("");

  // Impedance mode
  const [primaryImpedance, setPrimaryImpedance] = React.useState("");
  const [primaryImpedanceUnit, setPrimaryImpedanceUnit] = React.useState("Ω");
  const [turnsRatioInput, setTurnsRatioInput] = React.useState("");

  const [result, setResult] = React.useState("");
  const [details, setDetails] = React.useState("");
  const [message, setMessage] = React.useState("");

  React.useEffect(() => {
    setMessage(t("enterVoltages"));
  }, [t]);

  const getInitialMessage = (m: Mode): string => {
    switch (m) {
      case "voltage":
        return t("enterVoltages");
      case "turns":
        return t("enterTurns");
      case "impedance":
        return t("enterImpedance");
    }
  };

  const reset = () => {
    setPrimaryVoltage("");
    setSecondaryVoltage("");
    setPrimaryTurns("");
    setSecondaryTurns("");
    setPrimaryImpedance("");
    setTurnsRatioInput("");
    setResult("");
    setDetails("");
    setMessage(getInitialMessage(mode));
  };

  const calculate = () => {
    if (mode === "voltage") {
      const vp = parseValue(primaryVoltage);
      const vs = parseValue(secondaryVoltage);

      if (Number.isNaN(vp) || Number.isNaN(vs)) {
        setMessage(t("validVoltages"));
        setResult("");
        setDetails("");
        return;
      }
      if (vp <= 0 || vs <= 0) {
        setMessage(t("voltagesPositive"));
        setResult("");
        setDetails("");
        return;
      }

      const vpBase = convertToBase(vp, primaryVoltageUnit);
      const vsBase = convertToBase(vs, secondaryVoltageUnit);
      const n = transformer.turnsRatioFromVoltage(vpBase, vsBase);

      setResult(t("turnsRatioResult", { ratio: formatValue(n) }));

      const typeKey = n > 1 ? "stepUp" : n < 1 ? "stepDown" : "oneToOne";
      const currentRatio = 1 / n;
      setDetails(
        `${t("transformerType", { type: t(typeKey) })} ` +
        t("currentRatio", { ratio: formatValue(currentRatio) })
      );
      setMessage(t("complete"));
    } else if (mode === "turns") {
      const np = parseValue(primaryTurns);
      const ns = parseValue(secondaryTurns);

      if (Number.isNaN(np) || Number.isNaN(ns)) {
        setMessage(t("validTurns"));
        setResult("");
        setDetails("");
        return;
      }
      if (np <= 0 || ns <= 0) {
        setMessage(t("turnsPositive"));
        setResult("");
        setDetails("");
        return;
      }

      const n = transformer.turnsRatio(np, ns);

      setResult(t("turnsRatioResult", { ratio: formatValue(n) }));

      const typeKey = n > 1 ? "stepUp" : n < 1 ? "stepDown" : "oneToOne";
      setDetails(
        `${t("transformerType", { type: t(typeKey) })} ` +
        `Vs = Vp × ${formatValue(n)}, Is = Ip / ${formatValue(n)}`
      );
      setMessage(t("complete"));
    } else {
      const zp = parseValue(primaryImpedance);
      const n = parseValue(turnsRatioInput);

      if (Number.isNaN(zp) || Number.isNaN(n)) {
        setMessage(t("validImpedance"));
        setResult("");
        setDetails("");
        return;
      }
      if (zp <= 0 || n <= 0) {
        setMessage(t("valuesPositive"));
        setResult("");
        setDetails("");
        return;
      }

      const zpBase = convertToBase(zp, primaryImpedanceUnit);
      const zs = transformer.secondaryImpedance(zpBase, n);

      const { value: zsDisplay, unit: zsUnit } = findBestUnit(zs, UNIT_GROUPS.resistance);

      setResult(t("impedanceResult", { value: `${formatValue(zsDisplay)} ${zsUnit}` }));
      setDetails(
        `Zs = Zp × n² = ${formatValue(convertFromBase(zpBase, primaryImpedanceUnit))} ${primaryImpedanceUnit} × ${formatValue(n)}² = ${formatValue(zsDisplay)} ${zsUnit}`
      );
      setMessage(t("complete"));
    }
  };

  const getFormula = (): string => {
    switch (mode) {
      case "voltage":
        return "n = Vs / Vp";
      case "turns":
        return "n = Ns / Np";
      case "impedance":
        return "Zs = Zp × n²";
    }
  };

  return (
    <CalculatorWindow
      title={t("title")}
      color="rose"
      width="w-80"
      initialPosition={initialPosition}
      zIndex={zIndex}
      onClose={onClose}
      onFocus={onFocus}
    >
      <div>
        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-600">
          {t("calculateFrom")}
        </label>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => {
              setMode("voltage");
              setMessage(getInitialMessage("voltage"));
            }}
            className={`flex-1 rounded px-2 py-1 text-xs transition focus:outline-none focus:ring-2 focus:ring-rose-500 ${
              mode === "voltage"
                ? "bg-rose-600 text-white"
                : "border border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            {t("voltage")}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("turns");
              setMessage(getInitialMessage("turns"));
            }}
            className={`flex-1 rounded px-2 py-1 text-xs transition focus:outline-none focus:ring-2 focus:ring-rose-500 ${
              mode === "turns"
                ? "bg-rose-600 text-white"
                : "border border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            {t("turns")}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("impedance");
              setMessage(getInitialMessage("impedance"));
            }}
            className={`flex-1 rounded px-2 py-1 text-xs transition focus:outline-none focus:ring-2 focus:ring-rose-500 ${
              mode === "impedance"
                ? "bg-rose-600 text-white"
                : "border border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            {t("impedance")}
          </button>
        </div>
      </div>

      {mode === "voltage" && (
        <>
          <CalculatorInput
            id={`${instanceId}-vp`}
            label={t("primaryVoltage")}
            value={primaryVoltage}
            onChange={setPrimaryVoltage}
            placeholder="e.g. 120"
            units={UNIT_GROUPS.voltage}
            selectedUnit={primaryVoltageUnit}
            onUnitChange={setPrimaryVoltageUnit}
            color="rose"
          />
          <CalculatorInput
            id={`${instanceId}-vs`}
            label={t("secondaryVoltage")}
            value={secondaryVoltage}
            onChange={setSecondaryVoltage}
            placeholder="e.g. 12"
            units={UNIT_GROUPS.voltage}
            selectedUnit={secondaryVoltageUnit}
            onUnitChange={setSecondaryVoltageUnit}
            color="rose"
          />
        </>
      )}

      {mode === "turns" && (
        <>
          <CalculatorInput
            id={`${instanceId}-np`}
            label={t("primaryTurns")}
            value={primaryTurns}
            onChange={setPrimaryTurns}
            placeholder="e.g. 1000"
            color="rose"
          />
          <CalculatorInput
            id={`${instanceId}-ns`}
            label={t("secondaryTurns")}
            value={secondaryTurns}
            onChange={setSecondaryTurns}
            placeholder="e.g. 100"
            color="rose"
          />
        </>
      )}

      {mode === "impedance" && (
        <>
          <CalculatorInput
            id={`${instanceId}-zp`}
            label={t("primaryImpedance")}
            value={primaryImpedance}
            onChange={setPrimaryImpedance}
            placeholder="e.g. 50"
            units={UNIT_GROUPS.resistance}
            selectedUnit={primaryImpedanceUnit}
            onUnitChange={setPrimaryImpedanceUnit}
            color="rose"
          />
          <CalculatorInput
            id={`${instanceId}-n`}
            label={t("turnsRatio")}
            value={turnsRatioInput}
            onChange={setTurnsRatioInput}
            placeholder="e.g. 2"
            color="rose"
          />
        </>
      )}

      {result && (
        <div className="rounded bg-rose-50 p-2 text-center">
          <div className="text-xs font-medium text-gray-600">{tc("result")}</div>
          <div className="text-lg font-bold text-rose-700">{result}</div>
          {details && (
            <div className="mt-1 text-xs text-gray-600">{details}</div>
          )}
        </div>
      )}

      <CalculatorButtons
        onCalculate={calculate}
        onReset={reset}
        color="rose"
      />
      <CalculatorResult value={message} color="rose" formula={getFormula()} />
    </CalculatorWindow>
  );
};

// Register this calculator with the registry
registerCalculatorComponent("TRANSFORMER", TransformerCalculator);

export default TransformerCalculator;
