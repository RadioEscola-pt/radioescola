export interface Question {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  img?: string | null;
}

export interface Category {
  id: string;
  name: string;
  questions: Question[];
}

export interface Data {
  categories: Record<string, Category>;
}
