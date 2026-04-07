"use client";

import { useTranslations } from "next-intl";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { PageThumbnail } from "./PageThumbnail";
import type { ExamPage } from "@/lib/types";
import { FileStack } from "lucide-react";

interface PageListProps {
  pages: ExamPage[];
  onDelete: (id: string) => void;
  onRotate: (id: string) => void;
  onReorder: (pages: ExamPage[]) => void;
}

export function PageList({ pages, onDelete, onRotate, onReorder }: PageListProps) {
  const t = useTranslations("SubmitExam.pages");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = pages.findIndex((p) => p.id === active.id);
      const newIndex = pages.findIndex((p) => p.id === over.id);
      onReorder(arrayMove(pages, oldIndex, newIndex));
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold flex items-center gap-2 text-slate-900 dark:text-slate-100">
          <FileStack className="h-5 w-5" />
          {t("title", { count: pages.length })}
        </h2>
        {pages.length > 1 && (
          <span className="text-xs text-muted-foreground">{t("reorderHint")}</span>
        )}
      </div>

      {pages.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          {t("empty")}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={pages.map((p) => p.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {pages.map((page, index) => (
                <PageThumbnail
                  key={page.id}
                  page={page}
                  index={index}
                  onDelete={() => onDelete(page.id)}
                  onRotate={() => onRotate(page.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
