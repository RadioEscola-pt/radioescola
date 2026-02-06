"use client";

import React from "react";
import type {
  CalculatorCode,
  CalculatorConfig,
  CalculatorContextValue,
  CalculatorInstance,
} from "@/lib/types";
import {
  getCalculatorConfig as getConfig,
  getAllCalculators as getAll,
  calculateInitialPosition,
  BASE_Z_INDEX,
} from "@/lib/config";

// Import calculators to trigger registration
import "@/components/calculators";

const CalculatorContext = React.createContext<CalculatorContextValue | undefined>(undefined);

export function useCalculators(): CalculatorContextValue {
  const ctx = React.useContext(CalculatorContext);
  if (!ctx) {
    throw new Error("useCalculators must be used within a CalculatorProvider");
  }
  return ctx;
}

function generateInstanceId(code: CalculatorCode): string {
  return `${code}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const CalculatorProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [instances, setInstances] = React.useState<CalculatorInstance[]>([]);
  const [maxZIndex, setMaxZIndex] = React.useState(BASE_Z_INDEX);

  const openCalculator = React.useCallback((code: CalculatorCode) => {
    const config = getConfig(code);
    if (!config) {
      console.warn(`Calculator ${code} not registered`);
      return;
    }

    setInstances((prev) => {
      const existingCount = prev.filter((inst) => inst.code === code).length;
      const position = calculateInitialPosition(code, existingCount);
      const newZIndex = maxZIndex + 1;
      setMaxZIndex(newZIndex);

      const newInstance: CalculatorInstance = {
        id: generateInstanceId(code),
        code,
        position,
        zIndex: newZIndex,
        createdAt: Date.now(),
      };

      return [...prev, newInstance];
    });
  }, [maxZIndex]);

  const closeCalculator = React.useCallback((instanceId: string) => {
    setInstances((prev) => prev.filter((inst) => inst.id !== instanceId));
  }, []);

  const focusCalculator = React.useCallback((instanceId: string) => {
    setInstances((prev) => {
      const instance = prev.find((inst) => inst.id === instanceId);
      if (!instance) return prev;

      const newZIndex = maxZIndex + 1;
      setMaxZIndex(newZIndex);

      return prev.map((inst) =>
        inst.id === instanceId ? { ...inst, zIndex: newZIndex } : inst
      );
    });
  }, [maxZIndex]);

  const getCalculatorConfig = React.useCallback(
    (code: CalculatorCode): CalculatorConfig | undefined => getConfig(code),
    []
  );

  const getAllCalculators = React.useCallback((): CalculatorConfig[] => getAll(), []);

  const value = React.useMemo<CalculatorContextValue>(
    () => ({
      instances,
      openCalculator,
      closeCalculator,
      focusCalculator,
      getCalculatorConfig,
      getAllCalculators,
    }),
    [instances, openCalculator, closeCalculator, focusCalculator, getCalculatorConfig, getAllCalculators]
  );

  return (
    <CalculatorContext.Provider value={value}>
      {children}
      {instances.map((instance) => {
        const config = getConfig(instance.code);
        if (!config?.component) return null;

        const Component = config.component;
        return (
          <Component
            key={instance.id}
            instanceId={instance.id}
            initialPosition={instance.position}
            zIndex={instance.zIndex}
            onClose={() => closeCalculator(instance.id)}
            onFocus={() => focusCalculator(instance.id)}
          />
        );
      })}
    </CalculatorContext.Provider>
  );
};

export default CalculatorProvider;
