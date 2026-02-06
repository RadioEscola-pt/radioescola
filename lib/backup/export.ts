import type { UserProgress } from "@/lib/types/progress";
import { PROGRESS_VERSION } from "@/lib/types/progress";
import type { BackupFile, BackupMetadata } from "./types";

const APP_VERSION = "1.0.0";

export function generateChecksum(data: UserProgress): string {
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, "0");
}

export function createBackup(progress: UserProgress): BackupFile {
  const metadata: BackupMetadata = {
    exportedAt: Date.now(),
    appVersion: APP_VERSION,
    progressVersion: PROGRESS_VERSION,
    checksum: generateChecksum(progress),
  };

  return {
    metadata,
    data: progress,
  };
}

export function downloadBackup(backup: BackupFile, filename?: string): void {
  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const date = new Date().toISOString().split("T")[0];
  const defaultFilename = `radio-escola-backup-${date}.json`;

  const link = document.createElement("a");
  link.href = url;
  link.download = filename || defaultFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportProgress(progress: UserProgress, filename?: string): void {
  const backup = createBackup(progress);
  downloadBackup(backup, filename);
}
