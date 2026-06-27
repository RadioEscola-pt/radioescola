import React from "react";
import { CATEGORY_CONFIG, type CategoryId } from "@/lib/config/categories";
import { cn } from "@/lib/utils";

export interface Testimonial {
  quote: string;
  name: string;
  callsign: string;
  /** Drives the color + icon, tying each voice to its license level. */
  category: CategoryId;
  /** Localized label, e.g. "Categoria 1". */
  categoryLabel: string;
}

/** Concentric radio waves emanating from the corner — a quiet signal motif. */
function SignalWaves({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" className={className}>
      {[26, 46, 66, 86, 106].map((r) => (
        <circle key={r} cx="120" cy="0" r={r} stroke="currentColor" strokeWidth="1.5" />
      ))}
    </svg>
  );
}

/** Callsign, operator name, and a live "on air" dot in the category color. */
function Attribution({
  callsign,
  name,
  category,
  categoryLabel,
}: Pick<Testimonial, "callsign" | "name" | "category" | "categoryLabel">) {
  const cat = CATEGORY_CONFIG[category];
  const Icon = cat.icon;

  return (
    <div className="flex w-full items-center gap-3">
      <span className="relative flex shrink-0 items-center justify-center" title="No ar">
        <span
          className={cn(
            "absolute inline-flex h-2.5 w-2.5 rounded-full opacity-60 motion-safe:animate-ping",
            cat.dot
          )}
        />
        <span className={cn("relative inline-flex h-2.5 w-2.5 rounded-full", cat.dot)} />
      </span>

      <div className="flex min-w-0 flex-col leading-tight">
        <span className="font-mono text-sm font-medium tracking-wider text-slate-900 dark:text-slate-100">
          {callsign}
        </span>
        <span className="truncate text-xs text-muted-foreground">{name}</span>
      </div>

      <span
        className={cn(
          "ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
          cat.badgeBg,
          cat.badgeText
        )}
      >
        <Icon className="h-3.5 w-3.5" />
        {categoryLabel}
      </span>
    </div>
  );
}

const cardShell =
  "group relative overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200/70 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl dark:bg-slate-900/50 dark:ring-slate-800";

/** The lead voice: a wide banner with the quote and attribution side by side. */
function FeaturedTestimonial(t: Testimonial) {
  return (
    <blockquote className={cn(cardShell, "flex flex-col gap-6 p-6 md:col-span-2 md:flex-row md:items-center md:gap-10 md:p-8")}>
      <SignalWaves className="pointer-events-none absolute right-0 top-0 h-48 w-48 text-slate-400/15 transition-transform duration-500 group-hover:scale-110 dark:text-slate-500/10" />
      <p className="relative flex-1 text-lg font-light leading-relaxed text-slate-800 md:text-2xl dark:text-slate-200">
        {t.quote}
      </p>
      <footer className="relative shrink-0 border-t border-slate-200/80 pt-5 md:w-60 md:border-l md:border-t-0 md:pl-10 md:pt-0 dark:border-slate-800">
        <Attribution {...t} />
      </footer>
    </blockquote>
  );
}

/** A supporting voice: quote with attribution anchored to the bottom. */
function SupportingTestimonial(t: Testimonial) {
  return (
    <blockquote className={cn(cardShell, "flex flex-col p-5")}>
      <SignalWaves className="pointer-events-none absolute right-0 top-0 h-28 w-28 text-slate-400/15 transition-transform duration-500 group-hover:scale-110 dark:text-slate-500/10" />
      <p className="relative text-sm font-light leading-relaxed text-slate-800 md:text-base dark:text-slate-200">
        {t.quote}
      </p>
      <footer className="relative mt-auto pt-5">
        <Attribution {...t} />
      </footer>
    </blockquote>
  );
}

interface TestimonialsProps {
  heading: string;
  items: Testimonial[];
  className?: string;
}

/**
 * Testimonials section: one featured voice over a row of supporting ones, so the
 * group reads as a roster of operators rather than a wall of identical cards.
 */
export function Testimonials({ heading, items, className = "mt-16 md:mt-20" }: TestimonialsProps) {
  const [featured, ...rest] = items;
  if (!featured) return null;

  return (
    <section className={className}>
      <h2 className="mb-6 text-2xl font-semibold md:text-3xl">{heading}</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <FeaturedTestimonial {...featured} />
        {rest.map((testimonial) => (
          <SupportingTestimonial key={testimonial.callsign} {...testimonial} />
        ))}
      </div>
    </section>
  );
}
