"use client";

import { useCallback, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Camera, Upload, FileImage } from "lucide-react";
import { cn } from "@/lib/utils";
import { fileToDataUrl } from "@/lib/utils/pdf-generator";
import type { ExamPage } from "@/lib/types";

interface ImageCaptureProps {
  onCapture: (pages: ExamPage[]) => void;
}

export function ImageCapture({ onCapture }: ImageCaptureProps) {
  const t = useTranslations("SubmitExam.capture");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const pages: ExamPage[] = [];

      for (const file of fileArray) {
        if (file.type === "application/pdf" || file.type.startsWith("image/")) {
          const dataUrl = await fileToDataUrl(file);
          pages.push({
            id: crypto.randomUUID(),
            file,
            dataUrl,
            rotation: 0,
            originalName: file.name,
          });
        }
      }

      if (pages.length > 0) {
        onCapture(pages);
      }
    },
    [onCapture]
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
    <div className="rounded-lg border bg-white p-6">
      <h2 className="font-semibold mb-4">{t("title")}</h2>

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
            ? "border-indigo-500 bg-indigo-50"
            : "border-gray-300 hover:border-gray-400"
        )}
      >
        <FileImage className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p className="text-sm text-gray-600 mb-4">{t("dragDrop")}</p>
        <p className="text-xs text-gray-500">{t("acceptedFormats")}</p>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mt-4">
        {/* Camera button - mobile only, uses environment (back) camera */}
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          className={cn(
            "flex-1 inline-flex items-center justify-center gap-2",
            "px-4 py-2.5 rounded-md text-sm font-medium",
            "bg-indigo-600 text-white",
            "hover:bg-indigo-700 transition-colors",
            "md:hidden" // Hide on desktop
          )}
        >
          <Camera className="h-4 w-4" />
          {t("takePhoto")}
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "flex-1 inline-flex items-center justify-center gap-2",
            "px-4 py-2.5 rounded-md text-sm font-medium",
            "border border-gray-300",
            "hover:bg-gray-50 transition-colors"
          )}
        >
          <Upload className="h-4 w-4" />
          {t("uploadFiles")}
        </button>
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
