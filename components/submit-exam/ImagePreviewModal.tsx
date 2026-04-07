"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FileText, X } from "lucide-react";
import type { ExamPage } from "@/lib/types";

interface ImagePreviewModalProps {
  open: boolean;
  onClose: () => void;
  page: ExamPage;
}

export function ImagePreviewModal({ open, onClose, page }: ImagePreviewModalProps) {
  const isPdf = page.file.type === "application/pdf";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-2 overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 z-10"
        >
          <X className="h-5 w-5" />
        </button>
        {isPdf ? (
          <div className="flex items-center justify-center h-96 bg-slate-100 dark:bg-slate-800 rounded">
            <div className="text-center">
              <FileText className="h-16 w-16 mx-auto text-slate-400 dark:text-slate-500 mb-2" />
              <p className="text-sm text-slate-600 dark:text-slate-300">{page.originalName}</p>
            </div>
          </div>
        ) : (
          <img
            src={page.dataUrl}
            alt="Preview"
            className="max-w-full max-h-[85vh] mx-auto object-contain rounded"
            style={{ transform: `rotate(${page.rotation}deg)` }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
