"use client";

import { useState, useRef } from "react";
import { Download, Upload, AlertTriangle, Check, Loader2, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useProgress } from "@/hooks/useProgress";
import { exportProgress } from "@/lib/backup/export";
import { parseBackupFile, validateBackup, importBackup } from "@/lib/backup/import";
import type { ImportStrategy, ValidationResult } from "@/lib/backup/types";

export default function DataManagement() {
  const t = useTranslations("DataManagement");
  const { progress, refreshProgress, clearProgress } = useProgress();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [importStrategy, setImportStrategy] = useState<ImportStrategy>("merge");
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleExport = () => {
    if (!progress) return;

    setIsExporting(true);
    try {
      exportProgress(progress);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    setImportError(null);
    setImportSuccess(false);

    try {
      const backup = await parseBackupFile(file);
      const result = validateBackup(backup);
      setValidation(result);
      setImportDialogOpen(true);
    } catch (error) {
      setImportError(t("import.error.invalid"));
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImport = async () => {
    if (!importFile || !validation?.valid) return;

    setIsImporting(true);
    setImportError(null);

    try {
      const backup = await parseBackupFile(importFile);
      const { progress: newProgress } = importBackup(backup, progress, importStrategy);

      const { localStorageProvider } = await import("@/lib/storage/localStorage");
      await localStorageProvider.saveProgress(newProgress);
      await refreshProgress();

      setImportSuccess(true);
      setImportDialogOpen(false);
      setTimeout(() => setImportSuccess(false), 3000);
    } catch (error) {
      console.error("Import failed:", error);
      setImportError(t("import.error.corrupted"));
    } finally {
      setIsImporting(false);
    }
  };

  const closeDialog = () => {
    setImportDialogOpen(false);
    setImportFile(null);
    setValidation(null);
    setImportError(null);
  };

  const handleClearData = async () => {
    setIsClearing(true);
    try {
      await clearProgress();
      setClearDialogOpen(false);
      // Reload page to reset all state
      window.location.reload();
    } catch (error) {
      console.error("Clear failed:", error);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={!progress || isExporting}
          className="flex-1"
        >
          {isExporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : exportSuccess ? (
            <Check className="mr-2 h-4 w-4 text-green-500" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {exportSuccess ? t("export.success") : t("export.button")}
        </Button>

        <div className="flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
            id="backup-file-input"
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="w-full"
          >
            {importSuccess ? (
              <Check className="mr-2 h-4 w-4 text-green-500" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            {importSuccess ? t("import.success") : t("import.button")}
          </Button>
        </div>
      </div>

      {importError && (
        <p className="text-sm text-red-500 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          {importError}
        </p>
      )}

      <Dialog open={importDialogOpen} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("import.title")}</DialogTitle>
            <DialogDescription>
              {importFile?.name}
            </DialogDescription>
          </DialogHeader>

          {validation && !validation.valid && (
            <div className="rounded-md bg-red-50 p-3 dark:bg-red-900/20">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                {t("import.error.invalid")}
              </p>
              <ul className="mt-2 text-sm text-red-700 dark:text-red-300 list-disc list-inside">
                {validation.errors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {validation?.valid && (
            <>
              {validation.warnings.length > 0 && (
                <div className="rounded-md bg-amber-50 p-3 dark:bg-amber-900/20">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    {t("import.warnings")}
                  </p>
                  <ul className="mt-2 text-sm text-amber-700 dark:text-amber-300 list-disc list-inside">
                    {validation.warnings.map((warning, i) => (
                      <li key={i}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-3">
                <p className="text-sm font-medium">{t("import.strategy.label")}</p>
                <div className="space-y-2">
                  <label className="flex items-start gap-3 p-3 rounded-md border cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                    <input
                      type="radio"
                      name="strategy"
                      value="merge"
                      checked={importStrategy === "merge"}
                      onChange={() => setImportStrategy("merge")}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium">{t("import.strategy.merge")}</p>
                      <p className="text-sm text-muted-foreground">
                        {t("import.strategy.mergeDesc")}
                      </p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 p-3 rounded-md border cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                    <input
                      type="radio"
                      name="strategy"
                      value="replace"
                      checked={importStrategy === "replace"}
                      onChange={() => setImportStrategy("replace")}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium">{t("import.strategy.replace")}</p>
                      <p className="text-sm text-muted-foreground">
                        {t("import.strategy.replaceDesc")}
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              {t("import.cancel")}
            </Button>
            <Button
              onClick={handleImport}
              disabled={!validation?.valid || isImporting}
            >
              {isImporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {t("import.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear Data Section */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
        <Button
          variant="destructive"
          onClick={() => setClearDialogOpen(true)}
          className="w-full sm:w-auto"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {t("clear.button")}
        </Button>
      </div>

      {/* Clear Confirmation Dialog */}
      <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              {t("clear.title")}
            </DialogTitle>
            <DialogDescription>
              {t("clear.description")}
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-md bg-red-50 p-3 dark:bg-red-900/20">
            <p className="text-sm text-red-800 dark:text-red-200">
              {t("clear.warning")}
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setClearDialogOpen(false)}>
              {t("clear.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleClearData}
              disabled={isClearing}
            >
              {isClearing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              {t("clear.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
