"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { ImageCapture, PageList, SubmitForm, PhotoTips } from "@/components/submit-exam";
import type { ExamPage, ExamSubmissionMetadata, SubmissionStatus } from "@/lib/types";
import { generatePdf, blobToBase64 } from "@/lib/utils/pdf-generator";
import { Upload } from "lucide-react";

// Abort an upload that hasn't responded within this window.
const UPLOAD_TIMEOUT_MS = 60_000;

export default function SubmitExamPage() {
  const t = useTranslations("SubmitExam");
  const [pages, setPages] = useState<ExamPage[]>([]);
  const [status, setStatus] = useState<SubmissionStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  // Handlers for page management
  const handleAddPages = useCallback((newPages: ExamPage[]) => {
    setPages((prev) => [...prev, ...newPages]);
  }, []);

  const handleDeletePage = useCallback((id: string) => {
    setPages((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const handleRotatePage = useCallback((id: string) => {
    setPages((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, rotation: ((p.rotation + 90) % 360) as ExamPage["rotation"] }
          : p
      )
    );
  }, []);

  const handleReorder = useCallback((newOrder: ExamPage[]) => {
    setPages(newOrder);
  }, []);

  const handleSubmit = async (metadata: ExamSubmissionMetadata) => {
    try {
      setStatus("preparing");
      setError(null);

      setStatus("generating");
      const pdfBlob = await generatePdf(pages);
      const pdfBase64 = await blobToBase64(pdfBlob);

      setStatus("uploading");
      // Abort a stalled upload instead of hanging in "uploading" forever
      // (common on flaky mobile connections after capturing photos).
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS);
      let response: Response;
      try {
        response = await fetch("/api/submit-exam", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pdfBase64,
            metadata,
            pageCount: pages.length,
          }),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }

      const result = await response.json();
      if (!result.success) throw new Error(result.error || "Submission failed");

      setStatus("success");
      setPages([]);
    } catch (err) {
      setStatus("error");
      if (err instanceof DOMException && err.name === "AbortError") {
        setError(t("submit.timeout"));
      } else {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    }
  };

  return (
    <main className="p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Upload className="h-6 w-6" />
            {t("title")}
          </h1>
          <p className="text-muted-foreground mt-1">{t("subtitle")}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left column: Capture + Pages */}
          <div className="lg:col-span-2 space-y-6">
            <ImageCapture onCapture={handleAddPages} />
            <PageList
              pages={pages}
              onDelete={handleDeletePage}
              onRotate={handleRotatePage}
              onReorder={handleReorder}
            />
          </div>

          {/* Right column: Tips + Form */}
          <div className="space-y-6">
            <PhotoTips />
            <SubmitForm
              pageCount={pages.length}
              status={status}
              error={error}
              onSubmit={handleSubmit}
              onRetry={() => setStatus("idle")}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
