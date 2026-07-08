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
  hasNotesMdx?: boolean;
  fonte?: string[] | null;
  /** Maps a fonte entry (e.g. "cat3/2023_08_18p17") to the real PDF page it appears on. */
  fontePages?: Record<string, number> | null;
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
