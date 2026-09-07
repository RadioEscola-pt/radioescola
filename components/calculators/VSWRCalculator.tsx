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
import { vswr } from "@/lib/utils";
import { UNIT_GROUPS, parseValue, convertToBase, formatValue } from "@/lib/utils";
import type { CalculatorInstanceProps } from "@/lib/types";

/**
 * The switch order, and the union. The state value says which quantity is
 * entered; the label key is separate because "fromPower" is a phrase, not a
 * quantity.
 */
const MODES = [
  { value: "power", labelKey: "fromPower" },
  { value: "direct", labelKey: "directVswr" },
] as const;
type Mode = (typeof MODES)[number]["value"];

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

  // Each mode reads different fields, so an answer left over from the last
  // one is a result for a question no longer on screen.
  const switchMode = (next: Mode) => {
    setMode(next);
    setResult("");
    setMessage(next === "power" ? t("enterPower") : t("enterVswr"));
  };

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

  /**
   * `P_d` and `P_r` are the formulary's symbols, and match the fields above
   * ("Potência Direta", "Potência Refletida"). The word stays VSWR rather than
   * the formulary's ROE because that is what this window calls it throughout.
   */
  const getFormulaTex = (): string => {
    if (mode === "power") {
      return String.raw`\mathrm{VSWR} = \frac{1 + \sqrt{P_r / P_d}}{1 - \sqrt{P_r / P_d}}`;
    }
    return String.raw`\left|\Gamma\right| = \frac{\mathrm{VSWR} - 1}{\mathrm{VSWR} + 1}`;
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
        <label
          id={`${instanceId}-mode`}
          className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          {t("inputMode")}
        </label>
        <CalculatorModeSwitch
          labelId={`${instanceId}-mode`}
          color="orange"
          value={mode}
          onChange={switchMode}
          options={MODES.map(({ value, labelKey }) => ({ value, label: t(labelKey) }))}
        />
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
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{tc("result")}</div>
          <div className="text-lg font-bold text-orange-700">{result}</div>
          {details && (
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{details}</div>
          )}
        </div>
      )}

      <CalculatorButtons
        onCalculate={calculate}
        onReset={reset}
        color="orange"
      />
      <CalculatorResult
        value={message}
        color="orange"
        formula={<Tex tex={getFormulaTex()} display className="block" />}
      />
    </CalculatorWindow>
  );
};

// Register this calculator with the registry
registerCalculatorComponent("VSWR", VSWRCalculator);

export default VSWRCalculator;
