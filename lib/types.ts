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
  calc?: string | null;
}

export interface Category {
  id: string;
  name: string;
  questions: Question[];
}

export interface Data {
  categories: Record<string, Category>;
}
