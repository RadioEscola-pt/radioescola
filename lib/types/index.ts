/**
 * Types barrel export
 */

// Question/category types (moved from lib/types.ts)
/**
 * Where a question appears in an official exam paper. `question` is the
 * pergunta number printed in the paper; `page` is the PDF page it is on. The
 * two are unrelated — these papers carry about four questions per page.
 */
export interface SourceRef {
  pdf: string;
  question: number;
  page?: number;
}

export interface Question {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  img?: string | null;
  notes?: string | null;
  hasNotesMdx?: boolean;
  sources?: SourceRef[] | null;
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
