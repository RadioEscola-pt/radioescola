import type { LucideIcon } from "lucide-react";
import type { FC } from "react";

/** Position for draggable windows */
export interface Position {
  x: number;
  y: number;
}

/** Unique identifier for each calculator type */
export type CalculatorCode =
  | "OHMCALC"
  | "COPADDER"
  | "RLC"
  | "VSWR"
  | "GAIN"
  | "TRANSFORMER"
  | "REACTANCE"
  | "QFACTOR"
  | "WAVELENGTH";

/** Calculator metadata for registry */
export interface CalculatorConfig {
  code: CalculatorCode;
  /** Translation key for i18n lookup (e.g., "ohmsLaw" -> Calculators.ohmsLaw.*) */
  translationKey: string;
  /** Fallback English title */
  title: string;
  /** Fallback English short title */
  shortTitle: string;
  /** Fallback English description */
  description: string;
  icon: LucideIcon;
  color: CalculatorColor;
  component: FC<CalculatorInstanceProps>;
}

/** Supported Tailwind color prefixes */
export type CalculatorColor =
  | "blue"
  | "green"
  | "purple"
  | "orange"
  | "cyan"
  | "rose"
  | "amber"
  | "indigo"
  | "teal";

/** Props passed to calculator component instances */
export interface CalculatorInstanceProps {
  instanceId: string;
  initialPosition: Position;
  onClose: () => void;
  onFocus: () => void;
  zIndex: number;
}

/** Runtime calculator instance */
export interface CalculatorInstance {
  id: string;
  code: CalculatorCode;
  position: Position;
  zIndex: number;
  createdAt: number;
}

/** Context value for calculator management */
export interface CalculatorContextValue {
  instances: CalculatorInstance[];
  openCalculator: (code: CalculatorCode) => void;
  closeCalculator: (instanceId: string) => void;
  focusCalculator: (instanceId: string) => void;
  getCalculatorConfig: (code: CalculatorCode) => CalculatorConfig | undefined;
  getAllCalculators: () => CalculatorConfig[];
}

/** Input field configuration for calculator forms */
export interface CalculatorFieldConfig {
  id: string;
  label: string;
  units?: string[];
  defaultUnit?: string;
  placeholder?: string;
}
