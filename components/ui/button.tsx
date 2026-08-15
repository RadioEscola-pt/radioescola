import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-amber-500 text-slate-900 hover:bg-amber-400",
        secondary: "bg-white/20 text-white backdrop-blur-sm border border-white/30 hover:bg-white/30",
        // Primary action in the glass family: still reads as the loudest thing
        // on the page, but lit and translucent rather than a flat amber slab.
        glassAccent:
          "border border-amber-300/60 bg-amber-500/90 text-slate-900 backdrop-blur-md shadow-[inset_0_1px_0_0_rgba(255,255,255,0.55),0_1px_2px_0_rgba(15,23,42,0.1)] hover:bg-amber-400/95 dark:border-amber-200/40",
        glass:
          "border border-slate-900/10 bg-slate-900/5 text-slate-900 backdrop-blur-md shadow-[inset_0_1px_0_0_rgba(255,255,255,0.7)] hover:bg-slate-900/10 dark:border-white/20 dark:bg-white/5 dark:text-white dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)] dark:hover:bg-white/10",
        outline: "border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700",
        ghost: "text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10",
        destructive: "bg-red-600 text-white hover:bg-red-500",
      },
      size: {
        default: "px-4 py-2.5",
        sm: "px-3 py-2 text-xs",
        lg: "px-6 py-3 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
