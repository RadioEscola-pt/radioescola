"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { RotateCw, Trash2, Eye, GripVertical, FileText } from "lucide-react";
import type { ExamPage } from "@/lib/types";
import { ImagePreviewModal } from "./ImagePreviewModal";

interface PageThumbnailProps {
  page: ExamPage;
  index: number;
  onDelete: () => void;
  onRotate: () => void;
}

export function PageThumbnail({ page, index, onDelete, onRotate }: PageThumbnailProps) {
  const t = useTranslations("SubmitExam.pages");
  const [previewOpen, setPreviewOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isPdf = page.file.type === "application/pdf";

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "relative group rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-700",
          "aspect-[3/4]",
          isDragging && "opacity-50 ring-2 ring-amber-500"
        )}
      >
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="absolute top-1 left-1 p-1 rounded bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10"
        >
          <GripVertical className="h-3 w-3 text-gray-500" />
        </div>

        {/* Page number badge */}
        <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-xs font-medium z-10">
          {index + 1}
        </div>

        {/* Thumbnail */}
        {isPdf ? (
          <div className="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-slate-600">
            <FileText className="h-8 w-8 text-slate-400 dark:text-slate-300" />
          </div>
        ) : (
          <img
            src={page.dataUrl}
            alt={`Page ${index + 1}`}
            className="w-full h-full object-cover"
            style={{ transform: `rotate(${page.rotation}deg)` }}
          />
        )}

        {/* Action buttons overlay */}
        <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex justify-center gap-1">
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="p-1.5 rounded bg-white/90 hover:bg-white transition-colors"
              title={t("preview")}
            >
              <Eye className="h-3.5 w-3.5" />
            </button>
            {!isPdf && (
              <button
                type="button"
                onClick={onRotate}
                className="p-1.5 rounded bg-white/90 hover:bg-white transition-colors"
                title={t("rotate")}
              >
                <RotateCw className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={onDelete}
              className="p-1.5 rounded bg-white/90 hover:bg-white text-red-600 transition-colors"
              title={t("delete")}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <ImagePreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        page={page}
      />
    </>
  );
}
