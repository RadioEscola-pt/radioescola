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
import { ohmsLaw } from "@/lib/utils";
import { parseValue, formatValue } from "@/lib/utils";
import type { CalculatorInstanceProps } from "@/lib/types";

const OhmsLawCalculator: React.FC<CalculatorInstanceProps> = ({
  instanceId,
  initialPosition,
  zIndex,
  onClose,
  onFocus,
}) => {
  const t = useTranslations("Calculators.ohmsLaw");
  const [voltage, setVoltage] = React.useState<string>("");
  const [current, setCurrent] = React.useState<string>("");
  const [resistance, setResistance] = React.useState<string>("");
  const [message, setMessage] = React.useState<string>("");

  React.useEffect(() => {
    setMessage(t("fillTwoFields"));
  }, [t]);

  const reset = () => {
    setVoltage("");
    setCurrent("");
    setResistance("");
    setMessage(t("fillTwoFields"));
  };

  const calculate = () => {
    const hasVoltage = voltage.trim().length > 0;
    const hasCurrent = current.trim().length > 0;
    const hasResistance = resistance.trim().length > 0;

    const filledCount = Number(hasVoltage) + Number(hasCurrent) + Number(hasResistance);
    if (filledCount < 2) {
      setMessage(t("provideTwoValues"));
      return;
    }
    if (filledCount === 3) {
      setMessage(t("clearOneField"));
      return;
    }

    const V = parseValue(voltage);
    const I = parseValue(current);
    const R = parseValue(resistance);

    if ((hasVoltage && Number.isNaN(V)) || (hasCurrent && Number.isNaN(I)) || (hasResistance && Number.isNaN(R))) {
      setMessage(t("numericOnly"));
      return;
    }

    if (!hasVoltage) {
      const result = ohmsLaw.voltage(I, R);
      setVoltage(formatValue(result));
      setMessage(t("computedVoltage", { value: formatValue(result) }));
      return;
    }
    if (!hasCurrent) {
      if (R === 0) {
        setMessage(t("resistanceNonZero"));
        return;
      }
      const result = ohmsLaw.current(V, R);
      setCurrent(formatValue(result));
      setMessage(t("computedCurrent", { value: formatValue(result) }));
      return;
    }
    if (!hasResistance) {
      if (I === 0) {
        setMessage(t("currentNonZero"));
        return;
      }
      const result = ohmsLaw.resistance(V, I);
      setResistance(formatValue(result));
      setMessage(t("computedResistance", { value: `${formatValue(result)} Ω` }));
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
      <CalculatorButtons
        onCalculate={calculate}
        onReset={reset}
        color="blue"
      />
      <CalculatorResult value={message} color="blue" formula="V = I × R" />
    </CalculatorWindow>
  );
};

// Register this calculator with the registry
registerCalculatorComponent("OHMCALC", OhmsLawCalculator);

export default OhmsLawCalculator;
