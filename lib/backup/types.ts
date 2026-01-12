import type { UserProgress } from "@/lib/types/progress";

export interface BackupMetadata {
  exportedAt: number;
  appVersion: string;
  progressVersion: number;
  checksum: string;
}

export interface BackupFile {
  metadata: BackupMetadata;
  data: UserProgress;
}

export type ImportStrategy = "replace" | "merge";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ImportResult {
  success: boolean;
  strategy: ImportStrategy;
  warnings: string[];
  mergeStats?: {
    questionsAdded: number;
    examsAdded: number;
    achievementsAdded: number;
  };
}
