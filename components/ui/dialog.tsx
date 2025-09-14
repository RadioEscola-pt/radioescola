"use client";
import * as React from 'react';

type BaseProps = React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode };

export function Dialog({ open, onOpenChange, children }: { open: boolean; onOpenChange?: (v: boolean) => void; children: React.ReactNode }) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange?.(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={() => onOpenChange?.(false)} />
      <div className="relative z-10 w-full max-w-2xl mx-4">
        {children}
      </div>
    </div>
  );
}

export function DialogContent({ className = '', children, ...rest }: BaseProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className={[
        'bg-white rounded-lg shadow-lg border',
        'p-6',
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </div>
  );
}

export function DialogHeader({ className = '', children, ...rest }: BaseProps) {
  return (
    <div className={["mb-4", className].join(' ')} {...rest}>
      {children}
    </div>
  );
}

export function DialogTitle({ className = '', children, ...rest }: BaseProps) {
  return (
    <h3 className={["text-lg font-semibold", className].join(' ')} {...rest}>
      {children}
    </h3>
  );
}

export function DialogDescription({ className = '', children, ...rest }: BaseProps) {
  return (
    <p className={["text-sm text-gray-600", className].join(' ')} {...rest}>
      {children}
    </p>
  );
}

export function DialogFooter({ className = '', children, ...rest }: BaseProps) {
  return (
    <div className={["mt-6 flex items-center justify-end gap-2", className].join(' ')} {...rest}>
      {children}
    </div>
  );
}

