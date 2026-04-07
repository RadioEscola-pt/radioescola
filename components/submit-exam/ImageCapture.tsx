"use client";

import { useCallback, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Camera, Upload, FileImage } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  fileToDataUrl,
  compressImageForSubmission,
  compressImageForThumbnail,
} from "@/lib/utils/pdf-generator";
import type { ExamPage } from "@/lib/types";

// Fallback for browsers without crypto.randomUUID
function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback using crypto.getRandomValues
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const arr = new Uint8Array(16);
    crypto.getRandomValues(arr);
    // Set version (4) and variant bits
    arr[6] = (arr[6]! & 0x0f) | 0x40;
    arr[8] = (arr[8]! & 0x3f) | 0x80;
    const hex = Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  // Last resort fallback
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
}

const MAX_FILE_SIZE_MB = 20;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

interface ImageCaptureProps {
  onCapture: (pages: ExamPage[]) => void;
}

export function ImageCapture({ onCapture }: ImageCaptureProps) {
  const t = useTranslations("SubmitExam.capture");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const pages: ExamPage[] = [];
      const skipped: string[] = [];
      const tooLarge: string[] = [];

      setFileError(null);
      setIsProcessing(true);

      try {
        for (const file of fileArray) {
          if (file.size > MAX_FILE_SIZE_BYTES) {
            tooLarge.push(file.name);
            continue;
          }
          if (file.type.startsWith("image/")) {
            const [dataUrl, thumbnailDataUrl] = await Promise.all([
              compressImageForSubmission(file),
              compressImageForThumbnail(file),
            ]);
            pages.push({
              id: generateId(),
              file,
              dataUrl,
              thumbnailDataUrl,
              rotation: 0,
              originalName: file.name,
            });
          } else if (file.type === "application/pdf") {
            const dataUrl = await fileToDataUrl(file);
            pages.push({
              id: generateId(),
              file,
              dataUrl,
              thumbnailDataUrl: "",
              rotation: 0,
              originalName: file.name,
            });
          } else {
            skipped.push(file.name);
          }
        }

        if (tooLarge.length > 0) {
          setFileError(t("fileTooLarge", { maxSize: MAX_FILE_SIZE_MB, count: tooLarge.length }));
        } else if (skipped.length > 0) {
          setFileError(t("unsupportedFormat", { count: skipped.length }));
        }

        if (pages.length > 0) {
          onCapture(pages);
        }
      } catch {
        setFileError(t("processingError"));
      } finally {
        setIsProcessing(false);
      }
    },
    [onCapture, t]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files);
      }
    },
    [processFiles]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        processFiles(e.target.files);
        e.target.value = ""; // Reset for same file selection
      }
    },
    [processFiles]
  );

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
      <h2 className="font-semibold mb-4 text-slate-900 dark:text-slate-100">{t("title")}</h2>

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          isDragging
            ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
            : "border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500"
        )}
      >
        <FileImage className="h-12 w-12 mx-auto text-slate-400 dark:text-slate-500 mb-4" />
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">{t("dragDrop")}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{t("acceptedFormats")}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{t("maxFileSize", { maxSize: MAX_FILE_SIZE_MB })}</p>
      </div>

      {/* File error feedback */}
      {fileError && (
        <div className="mt-3 p-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-700 dark:text-red-400">{fileError}</p>
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-4 space-y-2">
        {/* Mobile: camera primary, upload as secondary link */}
        <div className="md:hidden space-y-2">
          <Button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            disabled={isProcessing}
            className="w-full"
          >
            <Camera className="h-4 w-4" />
            {t("takePhoto")}
          </Button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="w-full text-center text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors disabled:opacity-50"
          >
            <Upload className="h-3.5 w-3.5 inline mr-1.5" />
            {isProcessing ? t("processing") : t("uploadLink")}
          </button>
        </div>

        {/* Desktop: upload button only */}
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className="hidden md:inline-flex w-full"
        >
          <Upload className="h-4 w-4" />
          {isProcessing ? t("processing") : t("uploadFiles")}
        </Button>
      </div>

      {/* Hidden inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
