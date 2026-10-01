/**
 * Category configuration
 * Single source of truth for category IDs, colors, icons, and styling
 */
import type { LucideIcon } from 'lucide-react';
import { Sprout, Flame, Rocket } from 'lucide-react';

export const CATEGORIES = ['3', '2', '1'] as const;
export type CategoryId = (typeof CATEGORIES)[number];

export type CategoryConfig = {
  icon: LucideIcon;
  /**
   * Difficulty tier, and the i18n key for its label. Derived from the id, but
   * the mapping is not arithmetic (3 is the beginner licence, 1 the advanced
   * one), so it lives here rather than as a ternary at each call site.
   */
  level: 'beginner' | 'intermediate' | 'advanced';
  dot: string;
  accent: string;
  badgeBg: string;
  badgeText: string;
  /** Translucent fill + edge for badges that sit on a card as frosted glass. */
  badgeGlass: string;
  /**
   * The category's ink where it sits on a photograph, over the scrim.
   *
   * The 400 step, brighter than anything the light surfaces use: the label it
   * paints is 11px bold, which WCAG counts as small text and holds to 4.5:1,
   * and the scrim under it only guarantees ~0.82 alpha over an unknown photo.
   */
  onImageInk: string;
  /**
   * The hue of the scrim over a photograph, as an oklch hue angle.
   *
   * Only the hue: the scrim's lightness is pinned to slate-950's in
   * `globals.css`, because that is what the label's contrast depends on, and
   * its chroma is animated there on hover. This is what puts the category's
   * colour on the card now that there is no rule along the top edge.
   */
  onImageHue: string;
  solidBtn: string;
  /**
   * Solid fill for the selected segment of a category picker. One step darker
   * than `solidBtn`, because a segment carries a small white label and needs
   * 4.5:1 — the 600 level only clears the 3:1 large-text bar.
   */
  segmentSelected: string;
  outlineBtn: string;
};

export const CATEGORY_CONFIG: Record<CategoryId, CategoryConfig> = {
  '3': {
    icon: Sprout,
    level: 'beginner',
    dot: 'bg-green-500',
    accent: 'bg-green-500',
    badgeBg: 'bg-green-100 dark:bg-green-900/40',
    badgeText: 'text-green-700 dark:text-green-300',
    badgeGlass: 'bg-green-500/15 border-green-500/30 dark:bg-green-400/10 dark:border-green-400/25',
    onImageInk: 'text-green-400',
    onImageHue: '155',
    solidBtn: 'bg-green-600 text-white hover:bg-green-700',
    segmentSelected: 'bg-green-700 text-white',
    outlineBtn: 'border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30 hover:border-green-400',
  },
  '2': {
    icon: Flame,
    level: 'intermediate',
    dot: 'bg-amber-500',
    accent: 'bg-amber-500',
    badgeBg: 'bg-amber-100 dark:bg-amber-900/40',
    badgeText: 'text-amber-700 dark:text-amber-300',
    badgeGlass: 'bg-amber-500/20 border-amber-500/30 dark:bg-amber-400/10 dark:border-amber-400/25',
    onImageInk: 'text-amber-400',
    onImageHue: '70',
    solidBtn: 'bg-amber-600 text-white hover:bg-amber-700',
    segmentSelected: 'bg-amber-700 text-white',
    outlineBtn: 'border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/30 hover:border-amber-400',
  },
  '1': {
    icon: Rocket,
    level: 'advanced',
    dot: 'bg-rose-500',
    accent: 'bg-rose-500',
    badgeBg: 'bg-rose-100 dark:bg-rose-900/40',
    badgeText: 'text-rose-700 dark:text-rose-300',
    badgeGlass: 'bg-rose-500/15 border-rose-500/30 dark:bg-rose-400/10 dark:border-rose-400/25',
    onImageInk: 'text-rose-400',
    onImageHue: '16',
    solidBtn: 'bg-rose-600 text-white hover:bg-rose-700',
    segmentSelected: 'bg-rose-700 text-white',
    outlineBtn: 'border-rose-200 dark:border-rose-700 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:border-rose-400',
  },
};

/** @deprecated Use CATEGORY_CONFIG instead */
export type CategoryStyle = Pick<CategoryConfig, 'badgeBg' | 'badgeText' | 'solidBtn' | 'outlineBtn'>;

/** @deprecated Use CATEGORY_CONFIG instead */
export const CATEGORY_STYLES: Record<CategoryId, CategoryStyle> = Object.fromEntries(
  CATEGORIES.map((id) => {
    const { badgeBg, badgeText, solidBtn, outlineBtn } = CATEGORY_CONFIG[id];
    return [id, { badgeBg, badgeText, solidBtn, outlineBtn }];
  })
) as Record<CategoryId, CategoryStyle>;

export const CATEGORY_IMAGES: Record<CategoryId, string> = {
  '3': '/images/cat3/cover.webp',
  '2': '/images/cat2/cover.webp',
  '1': '/images/cat1/cover.jpg',
};

/** Default category used when none specified */
export const DEFAULT_CATEGORY: CategoryId = '3';

/**
 * How many questions each category ships, for the surfaces that advertise the
 * size of the bank before any data is fetched.
 *
 * Hand-maintained against `public/data/cat{n}.json`, the same arrangement as
 * `lib/config/formulario.data.ts`: importing the artifacts would pull all 1,016
 * questions and their explanations into the server bundle to read three
 * integers. `__tests__/unit/test-category-facts.test.ts` fails the build if
 * these drift from the shipped artifacts.
 */
export const QUESTION_COUNTS: Record<CategoryId, number> = {
  '3': 212,
  '2': 421,
  '1': 403,
};
