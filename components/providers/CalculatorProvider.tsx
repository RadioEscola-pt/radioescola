"use client";

import React from "react";
import OhmsLawCalculator from "@components/calculators/OhmsLawCalculator";

interface CalculatorContextValue {
  ohmsOpen: boolean;
  openOhms: () => void;
  closeOhms: () => void;
}

const CalculatorContext = React.createContext<CalculatorContextValue | undefined>(undefined);

export function useCalculators(): CalculatorContextValue {
  const ctx = React.useContext(CalculatorContext);
  if (!ctx) {
    throw new Error("useCalculators must be used within a CalculatorProvider");
  }
  return ctx;
}

const initialPosition = { x: 32, y: 120 };

const CalculatorProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [ohmsOpen, setOhmsOpen] = React.useState(false);

  const openOhms = React.useCallback(() => setOhmsOpen(true), []);
  const closeOhms = React.useCallback(() => setOhmsOpen(false), []);

  const value = React.useMemo(
    () => ({
      ohmsOpen,
      openOhms,
      closeOhms,
    }),
    [ohmsOpen, openOhms, closeOhms]
  );

  return (
    <CalculatorContext.Provider value={value}>
      {children}
      {ohmsOpen && (
        <OhmsLawCalculator initialPosition={initialPosition} onClose={closeOhms} />
      )}
    </CalculatorContext.Provider>
  );
};

export default CalculatorProvider;
