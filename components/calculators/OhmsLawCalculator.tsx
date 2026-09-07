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
import { Math as Tex } from "@/components/formulario/Math";
import { ohmsLaw, power } from "@/lib/utils";
import { parseValue, formatValue, findBestUnit, UNIT_GROUPS } from "@/lib/utils";
import type { CalculatorInstanceProps } from "@/lib/types";

/**
 * The two relations this window applies, side by side because it always applies
 * both: it solves for whichever of V, I and R was left blank, and then reports
 * the power regardless. Written as maths rather than as `V = I x R`, so it reads
 * the same as the same law on `/aprender/formulario`.
 *
 * The symbol is V, not the U of the formulary and of ANACOM: the three fields
 * above are labelled V, I and R, and a formula that renamed one of them here
 * would be the one line on screen that does not match the boxes it explains.
 */
const FORMULA = String.raw`V = I \cdot R \qquad P = V \cdot I`;

const OhmsLawCalculator: React.FC<CalculatorInstanceProps> = ({
  instanceId,
  initialPosition,
  zIndex,
  onClose,
  onFocus,
}) => {
  const t = useTranslations("Calculators.ohmsLaw");
  const tc = useTranslations("Calculators.common");
  const [voltage, setVoltage] = React.useState<string>("");
  const [current, setCurrent] = React.useState<string>("");
  const [resistance, setResistance] = React.useState<string>("");
  const [result, setResult] = React.useState<string>("");
  const [message, setMessage] = React.useState<string>("");

  React.useEffect(() => {
    setMessage(t("fillTwoFields"));
  }, [t]);

  const reset = () => {
    setVoltage("");
    setCurrent("");
    setResistance("");
    setResult("");
    setMessage(t("fillTwoFields"));
  };

  const calculate = () => {
    const hasVoltage = voltage.trim().length > 0;
    const hasCurrent = current.trim().length > 0;
    const hasResistance = resistance.trim().length > 0;

    const filledCount = Number(hasVoltage) + Number(hasCurrent) + Number(hasResistance);
    if (filledCount < 2) {
      setMessage(t("provideTwoValues"));
      setResult("");
      return;
    }
    if (filledCount === 3) {
      setMessage(t("clearOneField"));
      setResult("");
      return;
    }

    const V = parseValue(voltage);
    const I = parseValue(current);
    const R = parseValue(resistance);

    if ((hasVoltage && Number.isNaN(V)) || (hasCurrent && Number.isNaN(I)) || (hasResistance && Number.isNaN(R))) {
      setMessage(t("numericOnly"));
      setResult("");
      return;
    }

    let finalV = V;
    let finalI = I;
    let finalR = R;

    if (!hasVoltage) {
      finalV = ohmsLaw.voltage(I, R);
      setVoltage(formatValue(finalV));
    } else if (!hasCurrent) {
      if (R === 0) {
        setMessage(t("resistanceNonZero"));
        setResult("");
        return;
      }
      finalI = ohmsLaw.current(V, R);
      setCurrent(formatValue(finalI));
    } else if (!hasResistance) {
      if (I === 0) {
        setMessage(t("currentNonZero"));
        setResult("");
        return;
      }
      finalR = ohmsLaw.resistance(V, I);
      setResistance(formatValue(finalR));
    }

    const pWatts = power.fromVI(finalV, finalI);
    const { value: pDisp, unit: pUnit } = findBestUnit(pWatts, UNIT_GROUPS.power);
    const powerStr = `${formatValue(pDisp)} ${pUnit}`;

    if (!hasVoltage) {
      setResult(`V = ${formatValue(finalV)} V  •  P = ${powerStr}`);
      setMessage(t("computedVoltageWithPower", { value: formatValue(finalV), power: powerStr }));
    } else if (!hasCurrent) {
      setResult(`I = ${formatValue(finalI)} A  •  P = ${powerStr}`);
      setMessage(t("computedCurrentWithPower", { value: formatValue(finalI), power: powerStr }));
    } else if (!hasResistance) {
      const { value: rDisp, unit: rUnit } = findBestUnit(finalR, UNIT_GROUPS.resistance);
      setResult(`R = ${formatValue(rDisp)} ${rUnit}  •  P = ${powerStr}`);
      setMessage(t("computedResistanceWithPower", { value: `${formatValue(rDisp)} ${rUnit}`, power: powerStr }));
    }
  };

  return (
    <CalculatorWindow
      title={t("title")}
      color="blue"
      initialPosition={initialPosition}
      zIndex={zIndex}
      onClose={onClose}
      onFocus={onFocus}
    >
      <CalculatorInput
        id={`${instanceId}-v`}
        label={t("voltage")}
        value={voltage}
        onChange={setVoltage}
        placeholder="e.g. 12"
        color="blue"
      />
      <CalculatorInput
        id={`${instanceId}-i`}
        label={t("current")}
        value={current}
        onChange={setCurrent}
        placeholder="e.g. 0.5"
        color="blue"
      />
      <CalculatorInput
        id={`${instanceId}-r`}
        label={t("resistance")}
        value={resistance}
        onChange={setResistance}
        placeholder="e.g. 24"
        color="blue"
      />
      {result && (
        <div className="rounded bg-blue-50 dark:bg-blue-950/40 p-2 text-center">
          <div className="text-xs font-medium text-slate-600 dark:text-slate-400">{tc("result")}</div>
          <div className="text-sm font-bold text-blue-700 dark:text-blue-300">{result}</div>
        </div>
      )}
      <CalculatorButtons
        onCalculate={calculate}
        onReset={reset}
        color="blue"
      />
      <CalculatorResult value={message} color="blue" formula={<Tex tex={FORMULA} display className="block" />} />
    </CalculatorWindow>
  );
};

// Register this calculator with the registry
registerCalculatorComponent("OHMCALC", OhmsLawCalculator);

export default OhmsLawCalculator;
