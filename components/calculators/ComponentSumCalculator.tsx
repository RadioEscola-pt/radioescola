"use client";

import React from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { useDraggableWindow, Position } from "@/hooks/useDraggableWindow";

type ComponentType = "resistor" | "capacitor" | "inductor";
type Mode = "series" | "parallel";

interface Component {
  id: string;
  value: string;
  unit: string;
}

interface ComponentSumCalculatorProps {
  onClose: () => void;
  initialPosition?: Position;
}

const resistorUnits = ["Ω", "kΩ", "MΩ"];
const capacitorUnits = ["F", "mF", "µF", "nF", "pF"];
const inductorUnits = ["H", "mH", "µH", "nH"];

const unitMultipliers: Record<string, number> = {
  // Resistance
  "Ω": 1,
  "kΩ": 1e3,
  "MΩ": 1e6,
  // Capacitance
  "F": 1,
  "mF": 1e-3,
  "µF": 1e-6,
  "nF": 1e-9,
  "pF": 1e-12,
  // Inductance
  "H": 1,
  "mH": 1e-3,
  "µH": 1e-6,
  "nH": 1e-9,
};

const ComponentSumCalculator: React.FC<ComponentSumCalculatorProps> = ({ onClose, initialPosition }) => {
  const [componentType, setComponentType] = React.useState<ComponentType>("resistor");
  const [mode, setMode] = React.useState<Mode>("series");
  const [components, setComponents] = React.useState<Component[]>([
    { id: "1", value: "", unit: "Ω" },
    { id: "2", value: "", unit: "Ω" },
  ]);
  const [result, setResult] = React.useState<string>("");
  const [message, setMessage] = React.useState<string>("Add component values to calculate.");

  const { position, containerRef, beginDrag } = useDraggableWindow({
    initialPosition: initialPosition ?? { x: 80, y: 160 },
  });

  const getUnitsForType = (type: ComponentType): string[] => {
    switch (type) {
      case "resistor":
        return resistorUnits;
      case "capacitor":
        return capacitorUnits;
      case "inductor":
        return inductorUnits;
    }
  };

  const handleComponentTypeChange = (type: ComponentType) => {
    setComponentType(type);
    const units = getUnitsForType(type);
    const defaultUnit = units[0] ?? "Ω";
    setComponents(components.map(c => ({ ...c, unit: defaultUnit })));
    setResult("");
    setMessage("Add component values to calculate.");
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

  const parseValue = (value: string): number => {
    const num = Number(value.replace(",", "."));
    return Number.isFinite(num) && num > 0 ? num : NaN;
  };

  const convertToBaseUnit = (value: number, unit: string): number => {
    return value * (unitMultipliers[unit] ?? 1);
  };

  const formatResult = (value: number, type: ComponentType): string => {
    if (!Number.isFinite(value) || value <= 0) return "";

    const units = getUnitsForType(type);

    // Find the best unit to display
    for (let i = units.length - 1; i >= 0; i--) {
      const unit = units[i];
      if (!unit) continue;
      const multiplier = unitMultipliers[unit] ?? 1;
      const converted = value / multiplier;

      if (converted >= 1 || i === 0) {
        const decimals = converted >= 100 ? 2 : converted >= 10 ? 3 : 4;
        return `${converted.toFixed(decimals)} ${unit}`;
      }
    }

    const defaultUnit = units[0] ?? "Ω";
    return `${value.toFixed(4)} ${defaultUnit}`;
  };

  const calculate = () => {
    const validComponents = components.filter(c => c.value.trim().length > 0);

    if (validComponents.length === 0) {
      setMessage("Add at least one component value.");
      setResult("");
      return;
    }

    const values: number[] = [];
    for (const comp of validComponents) {
      const num = parseValue(comp.value);
      if (Number.isNaN(num)) {
        setMessage("All values must be positive numbers.");
        setResult("");
        return;
      }
      const baseValue = convertToBaseUnit(num, comp.unit);
      values.push(baseValue);
    }

    let total: number;

    if (componentType === "capacitor") {
      // Capacitors: series = 1/(1/C1 + 1/C2 + ...), parallel = C1 + C2 + ...
      if (mode === "series") {
        total = 1 / values.reduce((sum, v) => sum + 1 / v, 0);
      } else {
        total = values.reduce((sum, v) => sum + v, 0);
      }
    } else {
      // Resistors and Inductors: series = R1 + R2 + ..., parallel = 1/(1/R1 + 1/R2 + ...)
      if (mode === "series") {
        total = values.reduce((sum, v) => sum + v, 0);
      } else {
        total = 1 / values.reduce((sum, v) => sum + 1 / v, 0);
      }
    }

    const formatted = formatResult(total, componentType);
    setResult(formatted);
    setMessage(`Total ${componentType} in ${mode}: ${formatted}`);
  };

  const reset = () => {
    const units = getUnitsForType(componentType);
    const defaultUnit = units[0] ?? "Ω";
    setComponents([
      { id: "1", value: "", unit: defaultUnit },
      { id: "2", value: "", unit: defaultUnit },
    ]);
    setResult("");
    setMessage("Add component values to calculate.");
  };

  const getFormula = (): string => {
    if (componentType === "capacitor") {
      if (mode === "series") {
        return "1/(1/C₁ + 1/C₂ + 1/C₃ + ...)";
      } else {
        return "C_total = C₁ + C₂ + C₃ + ...";
      }
    } else {
      // Resistors and Inductors
      const symbol = componentType === "resistor" ? "R" : "L";
      if (mode === "series") {
        return `${symbol}_total = ${symbol}₁ + ${symbol}₂ + ${symbol}₃ + ...`;
      } else {
        return `1/(1/${symbol}₁ + 1/${symbol}₂ + 1/${symbol}₃ + ...)`;
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed z-50 w-80 select-none rounded-lg border border-gray-300 bg-white shadow-lg"
      style={{ left: position.x, top: position.y }}
    >
      <div
        className="flex cursor-move items-center justify-between rounded-t-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white"
        onPointerDown={beginDrag}
      >
        <span>Component Sum Calculator</span>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 transition hover:bg-green-500"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-3 px-4 py-4 text-sm">
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-600">
            Component Type
          </label>
          <select
            value={componentType}
            onChange={(e) => handleComponentTypeChange(e.target.value as ComponentType)}
            className="w-full rounded border border-gray-300 px-2 py-1 focus:border-green-500 focus:outline-none focus:ring"
          >
            <option value="resistor">Resistor</option>
            <option value="capacitor">Capacitor</option>
            <option value="inductor">Inductor (Coil)</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-600">
            Configuration
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
              Series
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
              Parallel
            </button>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-medium uppercase tracking-wide text-gray-600">
              Components
            </label>
            <button
              type="button"
              onClick={addComponent}
              className="flex items-center gap-1 rounded bg-green-600 px-2 py-1 text-xs text-white transition hover:bg-green-500"
            >
              <Plus className="h-3 w-3" />
              Add
            </button>
          </div>
          <div className="max-h-48 space-y-2 overflow-y-auto">
            {components.map((comp, index) => (
              <div key={comp.id} className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-6">{index + 1}.</span>
                <input
                  type="text"
                  value={comp.value}
                  onChange={(e) => updateComponentValue(comp.id, e.target.value)}
                  className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm focus:border-green-500 focus:outline-none focus:ring"
                  placeholder="Value"
                />
                <select
                  value={comp.unit}
                  onChange={(e) => updateComponentUnit(comp.id, e.target.value)}
                  className="rounded border border-gray-300 px-2 py-1 text-sm focus:border-green-500 focus:outline-none focus:ring"
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
                    className="rounded p-1 text-red-600 transition hover:bg-red-50"
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
            <div className="text-xs font-medium text-gray-600">Result</div>
            <div className="text-lg font-bold text-green-700">{result}</div>
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={calculate}
            className="flex-1 rounded bg-green-600 px-3 py-2 text-white transition hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Calculate
          </button>
          <button
            type="button"
            onClick={reset}
            className="rounded border border-gray-300 px-3 py-2 text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Reset
          </button>
        </div>
        <p className="text-xs text-gray-600">{message}</p>
        <div className="mt-2 border-t pt-2">
          <p className="text-xs font-medium text-gray-600">Formula:</p>
          <p className="text-xs text-gray-700 font-mono">{getFormula()}</p>
        </div>
      </div>
    </div>
  );
};

export default ComponentSumCalculator;
