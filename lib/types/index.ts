/**
 * Types barrel export
 */

// Question/category types (moved from lib/types.ts)
export interface Question {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  img?: string | null;
  notes?: string | null;
  fonte?: string[] | null;
  tutorial?: string | null;
  materia?: string | null;
  calc?: string | string[] | null;
}

export interface Category {
  id: string;
  name: string;
  questions: Question[];
}

export interface Data {
  categories: Record<string, Category>;
}

// Calculator types
export * from "./calculator";

// Submit exam types
export * from "./submit-exam";

// Progress tracking types
export * from "./progress";
