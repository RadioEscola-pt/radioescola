// Data Contracts

export interface Question {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface Category {
  id: string;
  name: string;
  questions: Question[];
}

export interface Data {
  categories: Record<string, Category>;
}

// API Contract: Load Data
// GET /api/data
// Response: Data