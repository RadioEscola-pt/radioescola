"use client";
import * as React from 'react';
import { cn } from '@/lib/utils';

type BaseProps = React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode };

export function Dialog({
  open,
  onOpenChange,
  className,
  children
}: {
  open: boolean;
  onOpenChange?: (v: boolean) => void;
  className?: string;
  children: React.ReactNode
}) {
  const [shouldRender, setShouldRender] = React.useState(open);
  const [isAnimating, setIsAnimating] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setShouldRender(true);
      requestAnimationFrame(() => setIsAnimating(true));
      return;
    }
    setIsAnimating(false);
    const timer = setTimeout(() => setShouldRender(false), 200);
    return () => clearTimeout(timer);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange?.(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  if (!shouldRender) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className={cn(
          "absolute inset-0 bg-black/40 transition-opacity duration-200",
          isAnimating ? "opacity-100" : "opacity-0"
        )}
        onClick={() => onOpenChange?.(false)}
      />
      <div
        className={cn(
          "relative z-10 w-full max-w-2xl mx-4 transition-all duration-200",
          isAnimating
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4",
          className
        )}
      >
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
      className={cn(
        'bg-card text-card-foreground rounded-lg shadow-2xl border',
        'p-4 sm:p-6',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function DialogHeader({ className = '', children, ...rest }: BaseProps) {
  return (
    <div className={cn("mb-4", className)} {...rest}>
      {children}
    </div>
  );
}

export function DialogTitle({ className = '', children, ...rest }: BaseProps) {
  return (
    <h3 className={cn("text-lg font-semibold", className)} {...rest}>
      {children}
    </h3>
  );
}

export function DialogDescription({ className = '', children, ...rest }: BaseProps) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...rest}>
      {children}
    </p>
  );
}

export function DialogFooter({ className = '', children, ...rest }: BaseProps) {
  return (
    <div className={cn("mt-6 flex items-center justify-end gap-2", className)} {...rest}>
      {children}
    </div>
  );
}
