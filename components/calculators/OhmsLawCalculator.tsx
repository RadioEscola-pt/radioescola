"use client";

import React from "react";
import { X } from "lucide-react";
import { useDraggableWindow, Position } from "@/hooks/useDraggableWindow";

interface OhmsLawCalculatorProps {
  onClose: () => void;
  initialPosition?: Position;
}

const OhmsLawCalculator: React.FC<OhmsLawCalculatorProps> = ({ onClose, initialPosition }) => {
  const [voltage, setVoltage] = React.useState<string>("");
  const [current, setCurrent] = React.useState<string>("");
  const [resistance, setResistance] = React.useState<string>("");
  const [message, setMessage] = React.useState<string>("Fill any two fields to compute the third.");

  const { position, containerRef, beginDrag } = useDraggableWindow({
    initialPosition: initialPosition ?? { x: 40, y: 120 },
  });

  const reset = () => {
    setVoltage("");
    setCurrent("");
    setResistance("");
    setMessage("Fill any two fields to compute the third.");
  };

  const parseValue = (value: string) => {
    const num = Number(value.replace(",", "."));
    return Number.isFinite(num) ? num : NaN;
  };

  const formatValue = (value: number) => {
    if (!Number.isFinite(value)) return "";
    const abs = Math.abs(value);
    const decimals = abs >= 100 ? 0 : abs >= 10 ? 1 : 2;
    return value.toFixed(decimals);
  };

  const calculate = () => {
    const hasVoltage = voltage.trim().length > 0;
    const hasCurrent = current.trim().length > 0;
    const hasResistance = resistance.trim().length > 0;

    const filledCount = Number(hasVoltage) + Number(hasCurrent) + Number(hasResistance);
    if (filledCount < 2) {
      setMessage("Provide any two values to solve the third.");
      return;
    }
    if (filledCount === 3) {
      setMessage("Clear one field so we can compute it for you.");
      return;
    }

    const V = parseValue(voltage);
    const I = parseValue(current);
    const R = parseValue(resistance);

    if ((hasVoltage && Number.isNaN(V)) || (hasCurrent && Number.isNaN(I)) || (hasResistance && Number.isNaN(R))) {
      setMessage("Use numeric values only (decimals allowed).");
      return;
    }

    if (!hasVoltage) {
      const result = I * R;
      setVoltage(formatValue(result));
      setMessage(`Computed Voltage: ${formatValue(result)} V`);
      return;
    }
    if (!hasCurrent) {
      if (R === 0) {
        setMessage("Resistance must be non-zero to compute current.");
        return;
      }
      const result = V / R;
      setCurrent(formatValue(result));
      setMessage(`Computed Current: ${formatValue(result)} A`);
      return;
    }
    if (!hasResistance) {
      if (I === 0) {
        setMessage("Current must be non-zero to compute resistance.");
        return;
      }
      const result = V / I;
      setResistance(formatValue(result));
      setMessage(`Computed Resistance: ${formatValue(result)} Ω`);
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed z-50 w-72 select-none rounded-lg border border-gray-300 bg-white shadow-lg"
      style={{ left: position.x, top: position.y }}
    >
      <div
        className="flex cursor-move items-center justify-between rounded-t-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white"
        onPointerDown={beginDrag}
      >
        <span>Ohm&apos;s Law Calculator</span>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 transition hover:bg-blue-500"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-3 px-4 py-4 text-sm">
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-600" htmlFor="ohms-v">
            Voltage (V)
          </label>
          <input
            id="ohms-v"
            type="text"
            value={voltage}
            onChange={(event) => setVoltage(event.target.value)}
            className="w-full rounded border border-gray-300 px-2 py-1 focus:border-blue-500 focus:outline-none focus:ring"
            placeholder="e.g. 12"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-600" htmlFor="ohms-i">
            Current (A)
          </label>
          <input
            id="ohms-i"
            type="text"
            value={current}
            onChange={(event) => setCurrent(event.target.value)}
            className="w-full rounded border border-gray-300 px-2 py-1 focus:border-blue-500 focus:outline-none focus:ring"
            placeholder="e.g. 0.5"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-600" htmlFor="ohms-r">
            Resistance (Ω)
          </label>
          <input
            id="ohms-r"
            type="text"
            value={resistance}
            onChange={(event) => setResistance(event.target.value)}
            className="w-full rounded border border-gray-300 px-2 py-1 focus:border-blue-500 focus:outline-none focus:ring"
            placeholder="e.g. 24"
          />
        </div>
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={calculate}
            className="flex-1 rounded bg-blue-600 px-3 py-2 text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Calculate
          </button>
          <button
            type="button"
            onClick={reset}
            className="rounded border border-gray-300 px-3 py-2 text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Reset
          </button>
        </div>
        <p className="text-xs text-gray-600">{message}</p>
      </div>
    </div>
  );
};

export default OhmsLawCalculator;
