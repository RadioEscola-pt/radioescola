"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  CalculatorWindow,
  CalculatorInput,
  CalculatorButtons,
  CalculatorResult,
} from "./base";
import { registerCalculatorComponent } from "@/lib/config";
import { gain } from "@/lib/utils";
import { UNIT_GROUPS, parseValue, convertToBase, formatValue } from "@/lib/utils";
import type { CalculatorInstanceProps } from "@/lib/types";

type Mode = "power" | "voltage" | "db";

interface DbStage {
  id: string;
  value: string;
}

const GainCalculator: React.FC<CalculatorInstanceProps> = ({
  instanceId,
  initialPosition,
  zIndex,
  onClose,
  onFocus,
}) => {
  const t = useTranslations("Calculators.gain");
  const tc = useTranslations("Calculators.common");
  const [mode, setMode] = React.useState<Mode>("power");
  const [power1, setPower1] = React.useState("");
  const [power1Unit, setPower1Unit] = React.useState("W");
  const [power2, setPower2] = React.useState("");
  const [power2Unit, setPower2Unit] = React.useState("W");
  const [voltage1, setVoltage1] = React.useState("");
  const [voltage1Unit, setVoltage1Unit] = React.useState("V");
  const [voltage2, setVoltage2] = React.useState("");
  const [voltage2Unit, setVoltage2Unit] = React.useState("V");
  const [dbStages, setDbStages] = React.useState<DbStage[]>([
    { id: "1", value: "" },
    { id: "2", value: "" },
  ]);
  const [result, setResult] = React.useState("");
  const [message, setMessage] = React.useState("");

  React.useEffect(() => {
    if (mode === "power") setMessage(t("enterTwoPower"));
    else if (mode === "voltage") setMessage(t("enterTwoVoltage"));
    else setMessage(t("enterDbValues"));
  }, [t, mode]);

  const reset = () => {
    setPower1("");
    setPower2("");
    setVoltage1("");
    setVoltage2("");
    setDbStages([
      { id: "1", value: "" },
      { id: "2", value: "" },
    ]);
    setResult("");
    if (mode === "power") setMessage(t("enterTwoPower"));
    else if (mode === "voltage") setMessage(t("enterTwoVoltage"));
    else setMessage(t("enterDbValues"));
  };

  const addStage = () => {
    setDbStages([...dbStages, { id: String(Date.now()), value: "" }]);
  };

  const removeStage = (id: string) => {
    if (dbStages.length > 1) {
      setDbStages(dbStages.filter((s) => s.id !== id));
    }
  };

  const updateStage = (id: string, value: string) => {
    setDbStages(dbStages.map((s) => (s.id === id ? { ...s, value } : s)));
  };

  const calculate = () => {
    if (mode === "power") {
      const p1 = parseValue(power1);
      const p2 = parseValue(power2);

      if (Number.isNaN(p1) || Number.isNaN(p2)) {
        setMessage(t("validBothPowers"));
        setResult("");
        return;
      }
      if (p1 <= 0 || p2 <= 0) {
        setMessage(t("powerPositive"));
        setResult("");
        return;
      }

      const p1Base = convertToBase(p1, power1Unit);
      const p2Base = convertToBase(p2, power2Unit);
      const dB = gain.powerToDB(p1Base, p2Base);
      const ratio = p2Base / p1Base;

      setResult(`${formatValue(dB)} dB`);
      setMessage(
        t("powerRatioResult", {
          ratio: formatValue(ratio),
          type: dB >= 0 ? t("gain") : t("loss"),
          value: formatValue(Math.abs(dB))
        })
      );
    } else if (mode === "voltage") {
      const v1 = parseValue(voltage1);
      const v2 = parseValue(voltage2);

      if (Number.isNaN(v1) || Number.isNaN(v2)) {
        setMessage(t("validBothVoltages"));
        setResult("");
        return;
      }
      if (v1 <= 0 || v2 <= 0) {
        setMessage(t("voltagePositive"));
        setResult("");
        return;
      }

      const v1Base = convertToBase(v1, voltage1Unit);
      const v2Base = convertToBase(v2, voltage2Unit);
      const dB = gain.voltageToDB(v1Base, v2Base);
      const ratio = v2Base / v1Base;

      setResult(`${formatValue(dB)} dB`);
      setMessage(
        t("voltageRatioResult", {
          ratio: formatValue(ratio),
          type: dB >= 0 ? t("gain") : t("loss"),
          value: formatValue(Math.abs(dB))
        })
      );
    } else {
      const validStages = dbStages.filter((s) => s.value.trim().length > 0);

      if (validStages.length === 0) {
        setMessage(t("atLeastOneDb"));
        setResult("");
        return;
      }

      const values: number[] = [];
      for (const stage of validStages) {
        const num = parseValue(stage.value);
        if (Number.isNaN(num)) {
          setMessage(t("allValidNumbers"));
          setResult("");
          return;
        }
        values.push(num);
      }

      const totalDb = gain.addDB(...values);
      const powerRatio = gain.dbToPowerRatio(totalDb);

      setResult(`${formatValue(totalDb)} dB`);
      setMessage(
        t("totalResult", {
          total: formatValue(totalDb),
          ratio: formatValue(powerRatio)
        })
      );
    }
  };

  const getFormula = (): string => {
    if (mode === "power") {
      return "dB = 10 × log₁₀(P₂/P₁)";
    }
    if (mode === "voltage") {
      return "dB = 20 × log₁₀(V₂/V₁)";
    }
    return "Total dB = dB₁ + dB₂ + dB₃ + ...";
  };

  return (
    <CalculatorWindow
      title={t("title")}
      color="cyan"
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
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => {
              setMode("power");
              setResult("");
              setMessage(t("enterTwoPower"));
            }}
            className={`flex-1 rounded px-2 py-1 text-xs transition focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
              mode === "power"
                ? "bg-cyan-600 text-white"
                : "border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            {t("powerRatio")}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("voltage");
              setResult("");
              setMessage(t("enterTwoVoltage"));
            }}
            className={`flex-1 rounded px-2 py-1 text-xs transition focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
              mode === "voltage"
                ? "bg-cyan-600 text-white"
                : "border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            {t("voltageRatio")}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("db");
              setResult("");
              setMessage(t("enterDbValues"));
            }}
            className={`flex-1 rounded px-2 py-1 text-xs transition focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
              mode === "db"
                ? "bg-cyan-600 text-white"
                : "border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            {t("addDb")}
          </button>
        </div>
      </div>

      {mode === "power" ? (
        <>
          <CalculatorInput
            id={`${instanceId}-p1`}
            label={t("inputPower")}
            value={power1}
            onChange={setPower1}
            placeholder="e.g. 10"
            units={UNIT_GROUPS.power}
            selectedUnit={power1Unit}
            onUnitChange={setPower1Unit}
            color="cyan"
          />
          <CalculatorInput
            id={`${instanceId}-p2`}
            label={t("outputPower")}
            value={power2}
            onChange={setPower2}
            placeholder="e.g. 100"
            units={UNIT_GROUPS.power}
            selectedUnit={power2Unit}
            onUnitChange={setPower2Unit}
            color="cyan"
          />
        </>
      ) : mode === "voltage" ? (
        <>
          <CalculatorInput
            id={`${instanceId}-v1`}
            label={t("inputVoltage")}
            value={voltage1}
            onChange={setVoltage1}
            placeholder="e.g. 1"
            units={UNIT_GROUPS.voltage}
            selectedUnit={voltage1Unit}
            onUnitChange={setVoltage1Unit}
            color="cyan"
          />
          <CalculatorInput
            id={`${instanceId}-v2`}
            label={t("outputVoltage")}
            value={voltage2}
            onChange={setVoltage2}
            placeholder="e.g. 10"
            units={UNIT_GROUPS.voltage}
            selectedUnit={voltage2Unit}
            onUnitChange={setVoltage2Unit}
            color="cyan"
          />
        </>
      ) : (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-medium uppercase tracking-wide text-gray-600">
              {t("dbStages")}
            </label>
            <button
              type="button"
              onClick={addStage}
              className="flex items-center gap-1 rounded bg-cyan-600 px-2 py-1 text-xs text-white transition hover:bg-cyan-500"
            >
              <Plus className="h-3 w-3" />
              Add
            </button>
          </div>
          <div className="max-h-48 space-y-2 overflow-y-auto">
            {dbStages.map((stage, index) => (
              <div key={stage.id} className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-6">{index + 1}.</span>
                <input
                  type="text"
                  value={stage.value}
                  onChange={(e) => updateStage(stage.id, e.target.value)}
                  className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm focus:border-cyan-500 focus:outline-none focus:ring"
                  placeholder={t("dbValue")}
                />
                <span className="text-xs text-gray-500">dB</span>
                {dbStages.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeStage(stage.id)}
                    className="rounded p-1 text-red-600 transition hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {result && (
        <div className="rounded bg-cyan-50 p-2 text-center">
          <div className="text-xs font-medium text-gray-600">{tc("result")}</div>
          <div className="text-lg font-bold text-cyan-700">{result}</div>
        </div>
      )}

      <CalculatorButtons
        onCalculate={calculate}
        onReset={reset}
        color="cyan"
      />
      <CalculatorResult value={message} color="cyan" formula={getFormula()} />
    </CalculatorWindow>
  );
};

// Register this calculator with the registry
registerCalculatorComponent("GAIN", GainCalculator);

export default GainCalculator;
