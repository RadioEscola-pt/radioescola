"use client";

import React from "react";
import OhmsLawCalculator from "@components/calculators/OhmsLawCalculator";
import ComponentSumCalculator from "@components/calculators/ComponentSumCalculator";

interface CalculatorContextValue {
  ohmsOpen: boolean;
  openOhms: () => void;
  closeOhms: () => void;
  componentSumOpen: boolean;
  openComponentSum: () => void;
  closeComponentSum: () => void;
}

const CalculatorContext = React.createContext<CalculatorContextValue | undefined>(undefined);

export function useCalculators(): CalculatorContextValue {
  const ctx = React.useContext(CalculatorContext);
  if (!ctx) {
    throw new Error("useCalculators must be used within a CalculatorProvider");
  }
  return ctx;
}

const ohmsInitialPosition = { x: 32, y: 120 };
const componentSumInitialPosition = { x: 80, y: 160 };

const CalculatorProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [ohmsOpen, setOhmsOpen] = React.useState(false);
  const [componentSumOpen, setComponentSumOpen] = React.useState(false);

  const openOhms = React.useCallback(() => setOhmsOpen(true), []);
  const closeOhms = React.useCallback(() => setOhmsOpen(false), []);

  const openComponentSum = React.useCallback(() => setComponentSumOpen(true), []);
  const closeComponentSum = React.useCallback(() => setComponentSumOpen(false), []);

  const value = React.useMemo(
    () => ({
      ohmsOpen,
      openOhms,
      closeOhms,
      componentSumOpen,
      openComponentSum,
      closeComponentSum,
    }),
    [ohmsOpen, openOhms, closeOhms, componentSumOpen, openComponentSum, closeComponentSum]
  );

  return (
    <CalculatorContext.Provider value={value}>
      {children}
      {ohmsOpen && (
        <OhmsLawCalculator initialPosition={ohmsInitialPosition} onClose={closeOhms} />
      )}
      {componentSumOpen && (
        <ComponentSumCalculator initialPosition={componentSumInitialPosition} onClose={closeComponentSum} />
      )}
    </CalculatorContext.Provider>
  );
};

export default CalculatorProvider;
