"use client";

import React from "react";
import { Plus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  CalculatorWindow,
  CalculatorButtons,
  CalculatorModeSwitch,
  CalculatorResult,
} from "./base";
import { registerCalculatorComponent } from "@/lib/config";
import { Math as Tex } from "@/components/formulario/Math";
import {
  UNIT_GROUPS,
  parseValue,
  convertToBase,
  findBestUnit,
  formatValue,
} from "@/lib/utils";
import type { CalculatorInstanceProps } from "@/lib/types";

/**
 * Both switches, in the order they are offered. The translation key doubles as
 * the state value here — unlike in the wavelength calculator, these labels name
 * the thing itself rather than something it produces, so there is nothing to
 * invert.
 */
const TYPES = ["resistor", "capacitor", "inductor"] as const;
const MODES = ["series", "parallel"] as const;

type ComponentType = (typeof TYPES)[number];
type Mode = (typeof MODES)[number];

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

  const getTypeLabel = (type: ComponentType): string => t(type);
  const getModeLabel = (m: Mode): string => t(m);

  const handleComponentTypeChange = (type: ComponentType) => {
    setComponentType(type);
    const units = getUnitsForType(type);
    const defaultUnit = units[0] ?? "Ω";
    setComponents(components.map(c => ({ ...c, unit: defaultUnit })));
    setResult("");
    setMessage(t("addComponentValues"));
  };

  // Series and parallel give different totals from the same values, so leaving
  // the previous answer on screen after the switch turns it into a wrong answer
  // for the configuration now selected. Same reason the type change clears it.
  const handleModeChange = (next: Mode) => {
    setMode(next);
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

  const SYMBOL: Record<ComponentType, string> = { resistor: "R", capacitor: "C", inductor: "L" };

  /**
   * The expression the calculator is applying, in the notation of
   * `/aprender/formulario` — `X_{eq}` on the left, terms to `X_n`, `\cdots`
   * between them — so the two pages read as one product.
   *
   * The reciprocal branch used to render as a bare `1/(1/C₁ + 1/C₂ + ...)`,
   * with nothing said to be equal to it, while the additive branch carried its
   * `C =`. Written as maths the missing left-hand side is impossible to keep,
   * which is most of why it is worth writing as maths.
   *
   * Capacitors are the ones that add in parallel and combine reciprocally in
   * series; resistors and coils go the other way. The condition below is the
   * same one the solver uses, and is the single fact this calculator exists to
   * teach — so it stays visible in the formula rather than only in the total.
   */
  const getFormulaTex = (): string => {
    const s = SYMBOL[componentType];
    const additive = componentType === "capacitor" ? mode === "parallel" : mode === "series";
    return additive
      ? String.raw`${s}_{\text{eq}} = ${s}_{1} + ${s}_{2} + \cdots + ${s}_{n}`
      : String.raw`\frac{1}{${s}_{\text{eq}}} = \frac{1}{${s}_{1}} + \frac{1}{${s}_{2}} + \cdots + \frac{1}{${s}_{n}}`;
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
      {/*
        The type was a <select>: three options, all short, and picking one
        changes the units on every row below. A dropdown hides two thirds of
        that behind a tap, and hides the consequence entirely. On the track all
        three are visible and one tap away, which is what a three-way setting
        with visible fallout should be.
      */}
      <div>
        <label
          id={`${instanceId}-type`}
          className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400"
        >
          {t("componentType")}
        </label>
        <CalculatorModeSwitch
          labelId={`${instanceId}-type`}
          color="green"
          value={componentType}
          onChange={handleComponentTypeChange}
          options={TYPES.map((value) => ({ value, label: t(value) }))}
        />
      </div>

      <div>
        <label
          id={`${instanceId}-config`}
          className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400"
        >
          {t("configuration")}
        </label>
        <CalculatorModeSwitch
          labelId={`${instanceId}-config`}
          color="green"
          value={mode}
          onChange={handleModeChange}
          options={MODES.map((value) => ({ value, label: t(value) }))}
        />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {t("components")}
          </label>
          <button
            type="button"
            onClick={addComponent}
            className="flex items-center gap-1 rounded border border-slate-300 px-2 py-1 text-xs text-slate-600 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"
          >
            <Plus className="h-3 w-3" />
            {t("add")}
          </button>
        </div>
        <div className="max-h-64 space-y-2">
          {components.map((comp, index) => (
            <div key={comp.id} className="flex items-center gap-1.5">
              <span className="w-5 shrink-0 text-xs text-slate-400 dark:text-slate-500">{index + 1}.</span>
              <input
                type="text"
                value={comp.value}
                onChange={(e) => updateComponentValue(comp.id, e.target.value)}
                className="min-w-0 flex-1 rounded border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 focus:border-green-500 focus:outline-none focus:ring dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                placeholder={t("value")}
              />
              <select
                value={comp.unit}
                onChange={(e) => updateComponentUnit(comp.id, e.target.value)}
                className="shrink-0 rounded border border-slate-300 bg-white px-1.5 py-1 text-sm text-slate-900 focus:border-green-500 focus:outline-none focus:ring dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
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
                  className="shrink-0 rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {result && (
        <div key={result} className="animate-result-pop rounded-lg bg-green-50 px-3 py-3 text-center dark:bg-green-950/30">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{t("result")}</div>
          <div className="text-2xl font-bold tracking-tight text-green-700 dark:text-green-300">{result}</div>
        </div>
      )}

      <CalculatorButtons
        onCalculate={calculate}
        onReset={reset}
        color="green"
      />
      <CalculatorResult
        value={message}
        color="green"
        formula={<Tex tex={getFormulaTex()} display className="block" />}
      />
    </CalculatorWindow>
  );
};

// Register this calculator with the registry
registerCalculatorComponent("COPADDER", ComponentSumCalculator);

export default ComponentSumCalculator;
