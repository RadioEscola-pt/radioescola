import type { CategoryId } from "@/lib/config/categories";

/** Single page in an exam submission (image or PDF) */
export interface ExamPage {
  id: string;
  file: File;
  dataUrl: string;
  rotation: 0 | 90 | 180 | 270;
  originalName: string;
}

/** Metadata for an exam submission */
export interface ExamSubmissionMetadata {
  category: CategoryId;
  year?: string;
  source?: string;
}

/** Request body for submit-exam API */
export interface SubmitExamRequest {
  pdfBase64: string;
  metadata: ExamSubmissionMetadata;
  pageCount: number;
}

/** Response from submit-exam API */
export interface SubmitExamResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/** Submission workflow status */
export type SubmissionStatus =
  | "idle"
  | "preparing"
  | "generating"
  | "uploading"
  | "success"
  | "error";
