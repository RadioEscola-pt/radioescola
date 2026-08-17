"use client";
import * as React from 'react';
import { ExternalLink, X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface PdfPageDialogProps {
  /** Full PDF URL including the page fragment, e.g. "/exams/cat1/2024_01_02.pdf#page=8". */
  href: string;
  /** Human-readable label shown in the dialog title, and in the trigger unless `children` replaces it. */
  label: string;
  /** Localized "open in new tab" text. */
  openInNewTabLabel: string;
  /** Localized close-button aria-label. */
  closeLabel: string;
  triggerClassName?: string;
  /** Rich trigger content. The plain `label` still names the button for assistive tech. */
  children?: React.ReactNode;
}

/** Append a PDF open-parameter, respecting the existing "#page=N" fragment. */
function withViewParam(href: string): string {
  return href.includes('#') ? `${href}&view=FitH` : `${href}#view=FitH`;
}

const PdfPageDialog: React.FC<PdfPageDialogProps> = ({
  href,
  label,
  openInNewTabLabel,
  closeLabel,
  triggerClassName,
  children,
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={children ? label : undefined}
        aria-label={children ? label : undefined}
        className={cn(
          !children && 'text-blue-600 dark:text-blue-400 underline hover:no-underline',
          triggerClassName,
        )}
      >
        {children ?? label}
      </button>

      <Dialog open={open} onOpenChange={setOpen} className="max-w-4xl">
        <DialogContent className="p-0 overflow-hidden flex flex-col h-[90vh]">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
            <h3 className="text-sm font-semibold truncate">{label}</h3>
            <div className="flex items-center gap-1 shrink-0">
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                {openInNewTabLabel}
              </a>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={closeLabel}
                className="inline-flex items-center justify-center rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <iframe
            src={withViewParam(href)}
            title={label}
            className="w-full flex-1 min-h-0 bg-slate-100 dark:bg-slate-900"
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PdfPageDialog;
