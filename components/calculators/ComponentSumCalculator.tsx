"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { CalculatorWindow, CalculatorButtons, CalculatorResult } from "./base";
import { registerCalculatorComponent } from "@/lib/config";
import {
  UNIT_GROUPS,
  parseValue,
  convertToBase,
  findBestUnit,
  formatValue,
} from "@/lib/utils";
import type { CalculatorInstanceProps } from "@/lib/types";

type ComponentType = "resistor" | "capacitor" | "inductor";
type Mode = "series" | "parallel";

interface Component {
  id: string;
  value: string;
  unit: string;
}

const UNIT_MAP: Record<ComponentType, readonly string[]> = {
  resistor: UNIT_GROUPS.resistance,
  capacitor: UNIT_GROUPS.capacitance,
  inductor: UNIT_GROUPS.inductance,
};

const ComponentSumCalculator: React.FC<CalculatorInstanceProps> = ({
  instanceId,
  initialPosition,
  zIndex,
  onClose,
  onFocus,
}) => {
  const t = useTranslations("Calculators.componentSum");
  const [componentType, setComponentType] = React.useState<ComponentType>("resistor");
  const [mode, setMode] = React.useState<Mode>("series");
  const [components, setComponents] = React.useState<Component[]>([
    { id: "1", value: "", unit: "Ω" },
    { id: "2", value: "", unit: "Ω" },
  ]);
  const [result, setResult] = React.useState<string>("");
  const [message, setMessage] = React.useState<string>("");

  React.useEffect(() => {
    setMessage(t("addComponentValues"));
  }, [t]);

  const getUnitsForType = (type: ComponentType): readonly string[] => UNIT_MAP[type];

  const getTypeLabel = (type: ComponentType): string => {
    switch (type) {
      case "resistor": return t("resistor");
      case "capacitor": return t("capacitor");
      case "inductor": return t("inductor");
    }
  };

  const getModeLabel = (m: Mode): string => {
    return m === "series" ? t("series") : t("parallel");
  };

  const handleComponentTypeChange = (type: ComponentType) => {
    setComponentType(type);
    const units = getUnitsForType(type);
    const defaultUnit = units[0] ?? "Ω";
    setComponents(components.map(c => ({ ...c, unit: defaultUnit })));
    setResult("");
    setMessage(t("addComponentValues"));
  };

  const addComponent = () => {
    const units = getUnitsForType(componentType);
    const newId = String(Date.now());
    const defaultUnit = units[0] ?? "Ω";
    setComponents([...components, { id: newId, value: "", unit: defaultUnit }]);
  };

  const removeComponent = (id: string) => {
    if (components.length > 1) {
      setComponents(components.filter(c => c.id !== id));
    }
  };

  const updateComponentValue = (id: string, value: string) => {
    setComponents(components.map(c => (c.id === id ? { ...c, value } : c)));
  };

  const updateComponentUnit = (id: string, unit: string) => {
    setComponents(components.map(c => (c.id === id ? { ...c, unit } : c)));
  };

  const calculate = () => {
    const validComponents = components.filter(c => c.value.trim().length > 0);

    if (validComponents.length === 0) {
      setMessage(t("addAtLeastOne"));
      setResult("");
      return;
    }

    const values: number[] = [];
    for (const comp of validComponents) {
      const num = parseValue(comp.value);
      if (Number.isNaN(num) || num <= 0) {
        setMessage(t("allPositive"));
        setResult("");
        return;
      }
      const baseValue = convertToBase(num, comp.unit);
      values.push(baseValue);
    }

    let total: number;

    if (componentType === "capacitor") {
      if (mode === "series") {
        total = 1 / values.reduce((sum, v) => sum + 1 / v, 0);
      } else {
        total = values.reduce((sum, v) => sum + v, 0);
      }
    } else {
      if (mode === "series") {
        total = values.reduce((sum, v) => sum + v, 0);
      } else {
        total = 1 / values.reduce((sum, v) => sum + 1 / v, 0);
      }
    }

    const units = getUnitsForType(componentType);
    const { value: displayValue, unit } = findBestUnit(total, units);
    const formatted = `${formatValue(displayValue)} ${unit}`;
    setResult(formatted);
    setMessage(t("totalResult", { type: getTypeLabel(componentType), mode: getModeLabel(mode), value: formatted }));
  };

  const reset = () => {
    const units = getUnitsForType(componentType);
    const defaultUnit = units[0] ?? "Ω";
    setComponents([
      { id: "1", value: "", unit: defaultUnit },
      { id: "2", value: "", unit: defaultUnit },
    ]);
    setResult("");
    setMessage(t("addComponentValues"));
  };

  const getFormula = (): string => {
    if (componentType === "capacitor") {
      return mode === "series"
        ? "1/(1/C₁ + 1/C₂ + ...)"
        : "C = C₁ + C₂ + ...";
    }
    const symbol = componentType === "resistor" ? "R" : "L";
    return mode === "series"
      ? `${symbol} = ${symbol}₁ + ${symbol}₂ + ...`
      : `1/(1/${symbol}₁ + 1/${symbol}₂ + ...)`;
  };

  return (
    <CalculatorWindow
      title={t("title")}
      color="green"
      width="w-96"
      initialPosition={initialPosition}
      zIndex={zIndex}
      onClose={onClose}
      onFocus={onFocus}
    >
      <div>
        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-600">
          {t("componentType")}
        </label>
        <select
          value={componentType}
          onChange={(e) => handleComponentTypeChange(e.target.value as ComponentType)}
          className="w-full rounded border border-gray-300 px-2 py-1 focus:border-green-500 focus:outline-none focus:ring"
        >
          <option value="resistor">{t("resistor")}</option>
          <option value="capacitor">{t("capacitor")}</option>
          <option value="inductor">{t("inductor")}</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-600">
          {t("configuration")}
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode("series")}
            className={`flex-1 rounded px-3 py-1 transition focus:outline-none focus:ring-2 focus:ring-green-500 ${
              mode === "series"
                ? "bg-green-600 text-white"
                : "border border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            {t("series")}
          </button>
          <button
            type="button"
            onClick={() => setMode("parallel")}
            className={`flex-1 rounded px-3 py-1 transition focus:outline-none focus:ring-2 focus:ring-green-500 ${
              mode === "parallel"
                ? "bg-green-600 text-white"
                : "border border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            {t("parallel")}
          </button>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-xs font-medium uppercase tracking-wide text-gray-600">
            {t("components")}
          </label>
          <button
            type="button"
            onClick={addComponent}
            className="flex items-center gap-1 rounded bg-green-600 px-2 py-1 text-xs text-white transition hover:bg-green-500"
          >
            <Plus className="h-3 w-3" />
            {t("add")}
          </button>
        </div>
        <div className="max-h-64 space-y-2">
          {components.map((comp, index) => (
            <div key={comp.id} className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500 w-5 shrink-0">{index + 1}.</span>
              <input
                type="text"
                value={comp.value}
                onChange={(e) => updateComponentValue(comp.id, e.target.value)}
                className="min-w-0 flex-1 rounded border border-gray-300 px-2 py-1 text-sm focus:border-green-500 focus:outline-none focus:ring"
                placeholder={t("value")}
              />
              <select
                value={comp.unit}
                onChange={(e) => updateComponentUnit(comp.id, e.target.value)}
                className="shrink-0 rounded border border-gray-300 px-1.5 py-1 text-sm focus:border-green-500 focus:outline-none focus:ring"
              >
                {getUnitsForType(componentType).map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
              {components.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeComponent(comp.id)}
                  className="shrink-0 rounded p-1 text-red-600 transition hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {result && (
        <div className="rounded bg-green-50 p-2 text-center">
          <div className="text-xs font-medium text-gray-600">{t("result")}</div>
          <div className="text-lg font-bold text-green-700">{result}</div>
        </div>
      )}

      <CalculatorButtons
        onCalculate={calculate}
        onReset={reset}
        color="green"
      />
      <CalculatorResult value={message} color="green" formula={getFormula()} />
    </CalculatorWindow>
  );
};

// Register this calculator with the registry
registerCalculatorComponent("COPADDER", ComponentSumCalculator);

export default ComponentSumCalculator;
