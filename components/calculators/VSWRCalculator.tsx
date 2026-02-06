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
import { vswr } from "@/lib/utils";
import { UNIT_GROUPS, parseValue, convertToBase, formatValue } from "@/lib/utils";
import type { CalculatorInstanceProps } from "@/lib/types";

type Mode = "power" | "direct";

const VSWRCalculator: React.FC<CalculatorInstanceProps> = ({
  instanceId,
  initialPosition,
  zIndex,
  onClose,
  onFocus,
}) => {
  const t = useTranslations("Calculators.vswr");
  const tc = useTranslations("Calculators.common");
  const [mode, setMode] = React.useState<Mode>("power");
  const [forwardPower, setForwardPower] = React.useState("");
  const [forwardUnit, setForwardUnit] = React.useState("W");
  const [reflectedPower, setReflectedPower] = React.useState("");
  const [reflectedUnit, setReflectedUnit] = React.useState("W");
  const [directVswr, setDirectVswr] = React.useState("");
  const [result, setResult] = React.useState("");
  const [details, setDetails] = React.useState("");
  const [message, setMessage] = React.useState("");

  React.useEffect(() => {
    setMessage(t("enterPower"));
  }, [t]);

  const reset = () => {
    setForwardPower("");
    setReflectedPower("");
    setDirectVswr("");
    setResult("");
    setDetails("");
    setMessage(mode === "power" ? t("enterPower") : t("enterVswr"));
  };

  const calculate = () => {
    if (mode === "power") {
      const pf = parseValue(forwardPower);
      const pr = parseValue(reflectedPower);

      if (Number.isNaN(pf) || Number.isNaN(pr)) {
        setMessage(t("validNumeric"));
        setResult("");
        setDetails("");
        return;
      }
      if (pf <= 0 || pr < 0) {
        setMessage(t("forwardPositive"));
        setResult("");
        setDetails("");
        return;
      }

      const pfBase = convertToBase(pf, forwardUnit);
      const prBase = convertToBase(pr, reflectedUnit);

      if (prBase > pfBase) {
        setMessage(t("reflectedExceed"));
        setResult("");
        setDetails("");
        return;
      }

      const swr = vswr.fromPower(pfBase, prBase);
      const gamma = vswr.toGamma(swr);
      const returnLoss = vswr.returnLossFromSWR(swr);
      const mismatchLoss = vswr.mismatchLossFromSWR(swr);

      setResult(`VSWR = ${formatValue(swr)}:1`);
      setDetails(
        `Γ = ${formatValue(gamma)}, ` +
        `Return Loss = ${formatValue(returnLoss)} dB, ` +
        `Mismatch Loss = ${formatValue(mismatchLoss)} dB`
      );
      setMessage(t("complete"));
    } else {
      const swr = parseValue(directVswr);

      if (Number.isNaN(swr) || swr < 1) {
        setMessage(t("vswrMinimum"));
        setResult("");
        setDetails("");
        return;
      }

      const gamma = vswr.toGamma(swr);
      const returnLoss = vswr.returnLossFromSWR(swr);
      const mismatchLoss = vswr.mismatchLossFromSWR(swr);
      const reflectedPercent = Math.pow(gamma, 2) * 100;

      setResult(`VSWR = ${formatValue(swr)}:1`);
      setDetails(
        `Γ = ${formatValue(gamma)}, ` +
        `Return Loss = ${formatValue(returnLoss)} dB, ` +
        `Mismatch Loss = ${formatValue(mismatchLoss)} dB, ` +
        `Reflected = ${formatValue(reflectedPercent)}%`
      );
      setMessage(t("complete"));
    }
  };

  const getFormula = (): string => {
    if (mode === "power") {
      return "VSWR = (1 + √(Pr/Pf)) / (1 - √(Pr/Pf))";
    }
    return "Γ = (VSWR - 1) / (VSWR + 1)";
  };

  return (
    <CalculatorWindow
      title={t("title")}
      color="orange"
      width="w-80"
      initialPosition={initialPosition}
      zIndex={zIndex}
      onClose={onClose}
      onFocus={onFocus}
    >
      <div>
        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-600">
          {t("inputMode")}
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setMode("power");
              setMessage(t("enterPower"));
            }}
            className={`flex-1 rounded px-3 py-1 transition focus:outline-none focus:ring-2 focus:ring-orange-500 ${
              mode === "power"
                ? "bg-orange-600 text-white"
                : "border border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            {t("fromPower")}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("direct");
              setMessage(t("enterVswr"));
            }}
            className={`flex-1 rounded px-3 py-1 transition focus:outline-none focus:ring-2 focus:ring-orange-500 ${
              mode === "direct"
                ? "bg-orange-600 text-white"
                : "border border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            {t("directVswr")}
          </button>
        </div>
      </div>

      {mode === "power" ? (
        <>
          <CalculatorInput
            id={`${instanceId}-pf`}
            label={t("forwardPower")}
            value={forwardPower}
            onChange={setForwardPower}
            placeholder="e.g. 100"
            units={UNIT_GROUPS.power}
            selectedUnit={forwardUnit}
            onUnitChange={setForwardUnit}
            color="orange"
          />
          <CalculatorInput
            id={`${instanceId}-pr`}
            label={t("reflectedPower")}
            value={reflectedPower}
            onChange={setReflectedPower}
            placeholder="e.g. 10"
            units={UNIT_GROUPS.power}
            selectedUnit={reflectedUnit}
            onUnitChange={setReflectedUnit}
            color="orange"
          />
        </>
      ) : (
        <CalculatorInput
          id={`${instanceId}-vswr`}
          label={t("vswrValue")}
          value={directVswr}
          onChange={setDirectVswr}
          placeholder="e.g. 1.5"
          color="orange"
        />
      )}

      {result && (
        <div className="rounded bg-orange-50 p-2 text-center">
          <div className="text-xs font-medium text-gray-600">{tc("result")}</div>
          <div className="text-lg font-bold text-orange-700">{result}</div>
          {details && (
            <div className="mt-1 text-xs text-gray-600">{details}</div>
          )}
        </div>
      )}

      <CalculatorButtons
        onCalculate={calculate}
        onReset={reset}
        color="orange"
      />
      <CalculatorResult value={message} color="orange" formula={getFormula()} />
    </CalculatorWindow>
  );
};

// Register this calculator with the registry
registerCalculatorComponent("VSWR", VSWRCalculator);

export default VSWRCalculator;
